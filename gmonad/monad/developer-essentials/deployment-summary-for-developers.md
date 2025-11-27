# Deployment Summary for Developers

> Source: https://docs.monad.xyz/developer-essentials/summary

## Documentation

On this page

This page summarizes what you need to know when developing or deploying smart contracts for
Monad.
Start with​

Network Information - for RPC & block explorer URLs, and canonical
contract deployments.
Differences between Monad and Ethereum
protocols repo (add yours!)
token-list repo (add yours!)
RPC API - an interactive reference

Supported Tooling & Infra​
Here are some of the most commonly-requested tools:
ToolStatusNotesTenderly✅Safe✅Monadscan (by Etherscan)✅MonadVision (by Blockvision)✅Foundry✅Use nightly release: foundryup -i nightlyViem✅viem >= 2.40.0

See Tooling and Infra for a complete list of what is supported,
including:
CategoryAA InfraAnalyticsBlock ExplorersCross-ChainCustodyEmbedded WalletsIndexers - Common Data (e.g. token balances, transfers, trades)Indexing Frameworks (incl Subgraphs)OnrampsOraclesRPC Providers
Accounts​
Address spaceSame address space as Ethereum (last 20 bytes of ECDSA public key)EIP-7702Supported. See EIP-7702 reference
Smart Contracts​
For deployment and verification guides, see:

Deploy a Contract
Verify a Contract
MonadVision verification guide

OpcodesAll opcodes as of the Pectra fork are supported.PrecompilesAll Ethereum precompiles as of the Pectra fork (0x01 to 0x11), plus precompile 0x0100 (RIP-7212) are supported. See PrecompilesMax contract size128 kb (up from 24.5 kb in Ethereum)
Transaction types​
Full article: Transactions
Transaction typesSupported:
0 ("legacy")
1 ("EIP-2930")
2 ("EIP-1559", the "default" on Ethereum)
4 ("EIP-7702")
Not supported:
3 ("EIP-4844")
Gas limits​
Per-transaction gas limit30M gasBlock gas limit200M gasBlock gas target80% (160M gas)Gas throughput500M gas/sec (200M gas/block divided by 0.4 sec/block)
Gas pricing​
Full article: Gas pricing
Gas chargedThe gas limit is what is charged. That is: total tokens deducted from the sender's balance is value + gas_price * gas_limit. See discussion.EIP-1559 dynamicsMonad is EIP-1559-compatible; base fee and priority fee work as on Ethereum. EIP-1559 explainerBase feeMin base fee of 100 MON-gwei (100 * 10^-9 MON).The base fee controller is similar to Ethereum's but stays elevated for less time (details).
Opcode pricing​
Full article: Opcode Pricing
Opcode pricing is the same as on Ethereum (see: evm.codes), except
for the below repricings needed to reweight relative scarcities of resources due to Monad
optimizations.
ItemEthereumMonadNotesCold access cost - account2,60010,100Affected opcodes: BALANCE, EXTCODESIZE, EXTCODECOPY, EXTCODEHASH, CALL, CALLCODE, DELEGATECALL, STATICCALL, SELFDESTRUCTSee detailsCold access cost - storage2,1008,100Affected opcodes: SLOAD, SSTORE. See detailsecRecover, ecAdd, ecMul, ecPairing, blake2f, point_eval precompilesSee detailsPrecompiles 0x01, 0x06, 0x07, 0x08, 0x09, 0x0a
Timing considerations​
Block frequency400 msTIMESTAMP opcodeAs in Ethereum, TIMESTAMP is a second-granularity unix timestamp. Since blocks
are every 400 ms, this means that 2-3 blocks will likely have the same timestamp.FinalityBlocks are finalized after two blocks (800 ms). Once a block is finalized, it
cannot be reorged. See
MonadBFT for a fuller discussion.Speculative finalityBlocks can be
speculatively finalized
after one block (400 ms), when it is marked as being in the Voted stage.
Speculative finality can revert under very rare circumstances (see fuller discussion
here), but most frontends
should be able to reflect state based on speculative finality.
Mempool​
Full article: Local Mempool
Monad does not have a global mempool, as this approach is not suitable for high-performance
blockchains.
Each validator maintains a local mempool with transactions that it is aware of. When an RPC
receives a transaction, it forwards it strategically to upcoming leaders, repeating this process
if it doesn't observe the transaction getting included.
Although this is an important part of Monad's design, it is not one that should generally affect
smart contract developers in their system designs.
Parallel Execution and JIT Compilation​
Monad utilizes parallel execution and
JIT compilation for efficiency,
but smart contract developers don't need to change anything to account for this.
In Monad, transactions are still linearly ordered, and the only correct outcome of execution is
the result as if the transactions were serially executed. All aspects of parallel execution can
be treated by smart contract developers as implementation details.
See further discussion.
Asynchronous Execution​
Full article: Asynchronous Execution
Monad utilizes asynchronous execution for efficiency, but most developers shouldn't need to
change anything.
Developers with significant off-chain financial logic (e.g. exchanges, bridges, and
stablecoin/RWA issuers) should wait until blocks reach the
Verified
phase (aka state root finality), three blocks later than
Finalized,
to be sure that the entire network agrees with their own node's local execution of a
finalized block.
Async execution and block stagesAsynchronous execution is a technique that allows Monad to substantially
increase execution throughput by decoupling consensus from execution. In asynchronous execution,
validators vote first, execute later - because once the transaction order is determined, the
state is determined. Afterward, each node executes locally. There is a
delayed merkle root
three blocks later which confirms that the network got the same state trie as local execution.From the developer perspective:
Someone submits a transaction through your frontend which interacts with your smart contract.
You make note of the hash.
The transaction gets included in a block.
The block gets Voted (speculatively finalized)
one block later. (T+1)
The block gets Finalized one block later
(T+2)
The block gets Verified (state root
finalized) three blocks later (T+5)
You listen for transaction receipts by calling
eth_getTransactionReceipt.
Receipts will first be available after a block becomes Voted (speculatively finalized).Your choice of when to update your UI to give feedback to the user depends on risk preference, but
for most applications it is reasonable to do so when the block becomes Voted because speculative
finality reversion is extremely rare. A more conservative approach would be to wait until the
block is Finalized, since then you will never have to handle a reorg. Waiting until Verified
is not generally necessary (except for the aforementioned developers with off-chain financial
logic).
Reserve balance​
Full article: Reserve Balance
Monad introduces the Reserve Balance mechanism to enable Asynchronous Execution.
The Reserve Balance mechanism places light restrictions on when transactions can be included at
consensus time, and imposes some conditions under which transactions will revert at execution time.
The Reserve Balance mechanism is designed to preserve safety under asynchronous execution without
interfering with normal usage patterns. Most users and developers need not worry about the Reserve
Balance constraints.
ParameterValueDefault reserve balance10 MON
EIP-7702​
EIP-7702 is supported; see the full notes here.
There are two caveats:


If an EOA is EIP-7702-delegated, its balance cannot be lowered below 10 MON due to the
Reserve Balance rules. (If the delegation is removed, dipping below 10 MON
is allowed.) Discussion.


If an EOA is EIP-7702-delegated, when it is called as a smart contract, the
CREATE and CREATE2 opcodes are banned. Discussion.


Reading blockchain data​
The following methods are supported for reading blockchain data:
JSON-RPCSee RPC API. Monad supports all standard RPC methods
from Ethereum. Differences are noted in RPC Differences. For rate limits, see here.WebSocketSee the WebSocket Guide.
Monad implements the eth_subscribe method with the following subscription types:
newHeads and logs (for Geth-style subscriptions that wait for finalization)
monadNewHeads and monadLogs (similar, but published as soon as the proposal
is received)
The syncing and newPendingTransactions subscription types are not supported.
For more details see Real-time Data Sources.Execution EventsSee Execution Events.
The Execution Events system allows developers to build high-performance applications
that receive lowest-latency event data from a Monad node via shared memory queue.
You can also use the supported Indexers.
Historic data​
Monad full nodes provide access to all historic ledger data (blocks, transactions, receipts,
events, and traces). Monad full nodes do not provide access to arbitrary historic state as
discussed here.
There is a special RPC service at https://rpc-mainnet.monadinfra.com
that provides access to historical data.
Recommended Open Source Tooling Versions​

foundry nightly (foundryup -i nightly)
viem >= 2.40.0 (just to bring in monad.ts)
alloy-chains >= 0.2.20

The nightly version of foundry is needed right now to ensure foundry uses the RPC to estimate gas
(relevant PR). There is also work in progress
to allow foundry local estimates to incorporate Monad's gas repricing, but this is not complete.
Canonical contract addresses​
See Canonical Contracts
Source code​

monad-bft (consensus)
monad (execution)

Running a full node​
See Node Operations
Need Help?​
Please ask in the developer discord. We are here to help!

