# Monad for Developers

> Source: https://docs.monad.xyz/introduction/monad-for-developers

## Documentation

On this page

noteThis page summarizes "Why Monad" for developers. For a summary of what you need to know in order
to develop or redeploy on Monad, see
Deployment Summary for Developers.
Monad is an Ethereum-compatible Layer-1 blockchain with 10,000 tps of throughput, 400ms block frequency, and 800ms finality.
Monad's implementation of the Ethereum Virtual Machine complies with the Pectra fork.
The Monad client has been simulated with historical Ethereum transactions and produces
identical merkle roots.
Monad also offers full Ethereum RPC compatibility so that users can interact with Monad using
familiar tools like Etherscan, Phantom, or MetaMask.
Monad accomplishes these performance improvements, while preserving backward compatibility, through
the introduction of several major innovations:

MonadBFT, a frontier BFT consensus mechanism solving the
tail-forking problem
RaptorCast for efficient block transmission
Asynchronous Execution for pipelining
consensus and execution to raise the time budget for execution
Parallel Execution and JIT Compilation for efficient transaction
execution
MonadDb for efficient storage of Ethereum state

Although Monad features parallel execution and pipelining, it's important to note that blocks in Monad are linear, and transactions are linearly ordered within each block.
The first Monad client is built by
Category Labs and is written from scratch in C++ and Rust. The code
is open-source under GPL-3.0 here:

monad-bft
monad

Transactions​
Address spaceSame address space as Ethereum (20-byte addresses using ECDSA)Transaction format/typesSame as Ethereum. Monad transactions use the same typed transaction envelope introduced in EIP-2718, encoded with RLP.Transaction type 0 ("legacy"), 1 ("EIP-2930"), 2 ("EIP-1559"; now the default in Ethereum), and 4 ("EIP-7702") are supported. See transaction type reference.See Transactions for more details.EIP-7702Supported. See EIP-7702 on MonadEIP-155 replay protectionNote that pre EIP-155 transactions are allowed on the protocol level on Monad, therefore it's discouraged to use an Ethereum account that had previously made pre EIP-155 transactions. DiscussionWallet compatibilityMonad is compatible with standard Ethereum wallets such as Phantom or MetaMask. The only change required is to alter the RPC URL and chain id.Gas pricingMonad is EIP-1559-compatible; base fee and priority fee work as in Ethereum.
Base fee follows a dynamic controller, similar to the EIP-1559 controller but with slower increases and faster decreases. Details
Transactions are charged based on gas limit rather than gas usage, i.e. total tokens deducted from the sender's balance is value + gas_price * gas_limit. This is a DOS-prevention measure for asynchronous execution.
See Gas in Monad for more details.
Smart contracts​
OpcodesMonad is bytecode-compatible with Ethereum (Pectra fork).
All opcodes as of the Pectra fork are supported.Opcode pricingOpcode pricing is the same as Ethereum, except for a few repricings needed to reweight relative scarcities of resources due to optimizations. DetailsPrecompilesAll Ethereum precompiles as of the Pectra fork (0x01 to 0x11), plus precompile 0x0100 (RIP-7212) are supported. See PrecompilesMax contract size128 kb (up from 24.5 kb in Ethereum)
Consensus​
Sybil resistance mechanismProof-of-Stake (PoS)DelegationAllowed (in-protocol)Consensus mechanismMonad's consensus mechanism, MonadBFT,
represents a major leap in Byzantine Fault-Tolerant (BFT) consensus. It is the first
BFT consensus mechanism to address the critical problem of
tail forking
in pipelined HotStuff-style consensus.
Accomplishing this allows MonadBFT to achieve high throughput (10,000+ tps), frequent
block times (400 ms), fast finality (800 ms), linear messaging complexity, and large
validator sets (200+) without being susceptible to tail forking, a critical weakness
in prior protocols where a leader can fork away its predecessor's block.Block propagation mechanismRaptorCastBlock frequency400 msFinalitySpeculative finality at 400 ms; full finality at 800 msMempoolLeaders maintain a local mempool. When an RPC receives a transaction, it forwards it to the next 3 leaders who keep it in their local mempool. If the RPC node doesn't observe the transaction getting included, it repeats this process of forwarding to the next 3 leaders 2 more times. Additional forwarding may be added at a later time.Consensus participantsDirect consensus participants vote on block proposals and serve as leaders. To serve as a direct participant, a node must have at least MinStake staked and be in the top MaxConsensusNodes participants by stake weight. These parameters are set in code.Asynchronous executionIn Monad, consensus and execution occur in a pipelined fashion.  Nodes come to consensus on the official transaction order prior to executing that ordering (Asynchronous Execution); the outcome of execution is not a prerequisite to consensus.In blockchains where execution is a prerequisite to consensus, the time budget for execution is a small fraction of the block time.  Pipelining consensus and execution allows Monad to expend the full block time on both consensus and execution.Block proposals consist of an ordered list of transactions and a delayed state merkle root from k=3 blocks ago.Monad introduces the Reserve Balance system to ensure that nodes at consensus time only include (or vote to include) transactions whose senders have sufficient balance to fund their execution.State determinism Finality occurs at consensus time; the official ordering of transactions is enshrined at this point, and the outcome is fully deterministic for any full node, who will generally execute the transactions for that new block in under 800 ms.The D-block delay for state merkle roots is only for state root verification, for example for allowing a node to ensure that it didn't make a computation error.
Execution​
The execution phase for each block begins after consensus is reached on that block, allowing the node to proceed with consensus on subsequent blocks.
Parallel Execution​
Transactions are linearly ordered; the job of execution is to arrive at the state that results from executing that list of transactions serially. The naive approach is just to execute the transactions one after another. Can we do better? Yes we can!
Monad implements parallel execution:

An executor is a virtual machine for executing transactions. Monad runs many executors in parallel.
An executor takes a transaction and produces a result. A result is a list of inputs to and outputs of the transactions, where inputs are (ContractAddress, Slot, Value) tuples that were SLOADed in the course of execution, and outputs are (ContractAddress, Slot, Value) tuples that were SSTOREd as a result of the transaction.
Results are initially produced in a pending state; they are then committed in the original order of the transactions. When a result is committed, its outputs update the current state. When it is a result’s turn to be committed, Monad checks that its inputs still match the current state; if they don’t, Monad reschedules the transaction. As a result of this concurrency control, Monad’s execution is guaranteed to produce the same result as if transactions were run serially.
When transactions are rescheduled, many or all of the required inputs are cached, so re-execution is generally relatively inexpensive. Note that upon re-execution, a transaction may produce a different set of Inputs than the previous execution did;

MonadDb: high-performance state backend​
All active state is stored in MonadDb, a storage backend for solid-state drives (SSDs) that is optimized for storing merkle trie data. Updates are batched so that the merkle root can be updated efficiently.
MonadDb implements in-memory caching and uses asio for efficient asynchronous reads and writes. Nodes should have 32 GB of RAM for optimal performance.
Comparison to Ethereum: User's Perspective​
AttributeEthereumMonadTransactions/second (smart contract calls and transfers)~10~10,000Block Frequency12 seconds400 msFinality2 epochs (12-18 min)800 msBytecode standardEVM (Pectra fork)EVM (Pectra fork)Precompiles0x01 to 0x11 (Pectra fork)0x01 to 0x11 (Pectra fork) plus 0x0100 (RIP-7212).See PrecompilesMax contract size24.5 kb128 kbRPC APIEthereum RPC APIMonad RPC API (generally identical to Ethereum RPC API, see differences)CryptographyECDSAECDSAAccountsLast 20 bytes of keccak-256 of public key under ECDSALast 20 bytes of keccak-256 of public key under ECDSAConsensus mechanismGasper (Casper-FFG finality gadget + LMD-GHOST fork-choice rule)MonadBFT (tail-fork-resistant pipelined consensus with linear messaging complexity in the common case)MempoolGlobalLocalTransaction orderingLeader's discretion (in practice, PBS)Leader's discretion (default behavior: priority gas auction)Sybil-resistance mechanismPoSPoSDelegation allowedNo; pseudo-delegation through LSTsYes; see StakingHardware Requirements (full node)4-core CPU32 GB RAM4 TB SSD NVMe25 Mbit/s bandwidth(reference)16-core CPU32 GB RAM2 x 2 TB SSD NVMe100 Mbit/s bandwidth(more info)
Tooling and Infrastructure​
Many leading Ethereum developer tools support Monad testnet. See
Tooling and Infrastructure
for a list of supported providers by category.
Next Steps​
Monad's public testnet is live. Head to Network Information to get started.
Now that you are familiar with Monad's architecture and features, head to
Deployment Summary for Developers
for everything you need to know to deploy.

