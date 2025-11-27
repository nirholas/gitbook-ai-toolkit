# Frequently Asked Questions

> Source: https://docs.monad.xyz/faq

## Documentation

On this page

Execution​
Are there any differences in opcode pricing?A few opcodes and precompiles have been repriced to more correclty account for their relative
cost. See details here.
How does Monad's optimistic parallel execution manage interdependent transactions?In Monad, like in Ethereum, transactions are ordered linearly within a block. The guarantee
that Monad provides is that the result at the end of each block will be as if the transactions
were executed serially, even though under the hood there was work done in parallel.Monad handles interdependent transactions gracefully by separating the concerns of
computation (which can be done in parallel) from commitment (which is still done
serially).Transactions are computed in parallel optimistically (i.e. assuming that any storage slots read
in during execution are correct), generating a pending result for each transaction. A pending
result consists of the set of input storage slots (and their values) and output storage slots
(and their values).Pending results are committed serially in the original order of the transactions, checking
each input for correctness at the time of commitment. (An input will be incorrect if it was
mutated by one of the previously-committed pending results.) If a pending result has any
incorrect inputs, it will be re-executed; no other pending results can be committed until
that completes.Committing pending results serially ensures that correctness is always preserved.noteAn example illustrates this best. Suppose that at the start of a block, Alice, Bob, and
Charlie each have a balance of 100 USDC. These are the first two transactions:Transaction #What happens0Alice sends Bob 5 USDC1Bob sends Charlie 10 USDCWhen transactions 0 and 1 are executed in parallel, they produce the following pending results:Pending Result #InputsOutputs0Alice: 100 Bob: 100Alice: 95 Bob: 1051Bob: 100 Charlie: 100Bob: 90 Charlie: 110Now we commit the pending results serially. Pending result 0 gets committed. When we try to
commit pending result 1, we notice that one of the inputs is wrong - Bob's balance was expected
to be 100, but it is actually 105. This re-triggers execution for transaction 1. No other
transactions can be committed until transaction 1 is re-executed.
In optimistic parallel execution, transactions get re-executed if their first execution
was done with inputs that subsequently were mutated. What if there is a long list of serially
dependent transactions?(Note: This question is asking about re-execution as discussed here.)While it's true that having to re-execute a pending result is slower than immediately committing
it, re-execution is also typically much faster than the original execution because inputs are
stored in cache (RAM). Also note that every transaction will be executed at most twice: once
initially, and once on re-execution.More generally, you can think of optimistic parallel execution as a two-pass strategy. The first
pass begins executing many transactions in parallel, thus surfacing many storage slot
dependencies in parallel and pulling them all into cache. The second pass iterates over the
transactions serially, either committing the pending result immediately or re-executing it (but
from a position where most storage slots are cached). This strategy, combined with efficient SSD
lookups from MonadDb, delivers a workload that uses the full
SSD throughput more efficiently.
Do I need to change my code to take advantage of Monad’s parallelism? Would it make
sense to split my contract into many contracts to reduce the probability of two transactions
touching the same contract?No, no need! Transactions interacting with your smart contract behave as if every transaction
is being executed serially. Parallel execution is strictly an implementation detail.Also, it is important to note that all state contention is evaluated on a slot-by-slot basis.
So for example, suppose that transaction 1 involves Alice sending USDC to Bob, and transaction
2 involves Charlie sending USDC to David. It doesn't matter that both transactions involve the
same smart contract (the USDC ERC-20 contract); the two affected storage slots in transaction
1 are completely independent from the two affected storage slots in transaction 2.
What specific optimizations does MonadDB introduce over traditional databases for EVM
state storage?MonadDb stores Merkle Patricia Trie data natively, rather than embedding the trie inside a
generic database (like LevelDB or RocksDB) which have their own logic for mapping database
entries to locations on disk. This eliminates a level of indirection and substantially reduces
the number of IOPS and page reads to look up one value. Trie operations such as recomputing the
merkle root at the end of each block are much more efficient.MonadDb further reduces latency and increases throughput by implementing asynchronous I/O using
io_uring and by bypassing the filesystem.  io_uring is a new linux kernel technology that
allows execution threads to issue I/O requests without stalling or tieing up threads. This allows
many I/O requests to be issued in parallel, sequenced by the kernel, and serviced by the first
available thread on return.Finally, in MonadDb, each node in the trie is versioned, allowing for intuitive maintenance of
the merkle trie and efficient state synchronization algorithms. Only the necessary trie
components are sent during statesync, making bootstrapping and recovery faster.
Why doesn't Monad make EIP-2930 access lists mandatory? Wouldn’t it make execution more
efficient?

Usage of access lists generally increases the size of transactions; long-term we think that
bandwidth is the biggest bottleneck


In Ethereum, the workflow for a user to submit using access lists is: simulate the
transaction, note which storage slots are accessed, then submit the transaction with these
slots mentioned in the access list. However, the state of the world may change between
simulation and the real execution; we feel that it's the job of the system to handle this
gracefully under the hood.


It would break integrations with existing wallets which don't support EIP-2930.


Note that EIP-2930 access lists are actually underspecified, at least from the perspective
of anticipating state contention. If two transactions both read from the same storage slot
(but neither writes to it) then, with respect to that storage slot, there is no state
contention - neither transaction can invalidate the other's computation. Contention only
occurs when an earlier transaction writes to a storage slot that a later transaction will
read. EIP-2930 access lists mention which storage slots are accessed, but don't make note
of whether the transaction will read from or write to that storage slot.


Consensus​
How are leaders selected?The leader schedule is constructed by a deterministic, stake-weighted process that is computed
once per epoch:
An epoch occurs roughly every 5.5 hours (50000 blocks). Validator stake weights are locked in
one epoch ahead (i.e. any changes for epoch N+1 must be registered prior to the start of epoch N).
At the start of each epoch, each validator computes the leader schedule based on running a
deterministic pseudorandom function on the stake weights. Since the function is deterministic,
everyone arrives at the same leader schedule.

How many nodes can participate in consensus? Is participation permissionless?The client codebase has a parameter called ACTIVE_VALSET_SIZE
which is currently set to 200.
Thus, the top 200 validators (ordered by stake weight) can participate directly in consensus.
This parameter is likely to change over time.Participation is permissionless; one simply needs to be in the top ACTIVE_VALSET_SIZE
validators.
Raptorcast​
Where can I find a detailed description of RaptorCast?Check this blog post!
Why was UDP chosen instead of TCP in RaptorCast?See the discussion in this
blog post. UDP was selected, accepting  lossyness but alleviating it by adding additional data
integrity (Raptor codes) and message authentication (signatures over merkle roots), because the
combination of those strategies over UDP is substantially more efficient than using TCP.
What is the difference between Raptorcast and the propagation methods in Ethereum,
Solana, or L2s?Ethereum is using libp2p. It is gossip based
(each node propagates its message to a set of peers) which is a lot less efficient (more
duplicate messages and a more meandering process for getting the word out). As a result,
Ethereum budgets several seconds for the block to propagate throughout the network.Solana uses Turbine.
Turbine and RaptorCast are similar in the sense that they both use erasure coding, cut packets
into MTU-sized chunks, and send transactions through a broadcast tree for efficiency. Some of
the differences include:
Monad uses Raptor codes while Turbine uses Reed-Solomon
Monad uses a 2-level broadcast tree with every other validator as a level-1 node while Solana
uses a deeper, less structured broadcast tree with fewer level-1 nodes and more complex logic
for determining the broadcast tree. There aren't BFT guarantees on block delivery the way that
there are for Monad.
In L2s there's only 1 sequencer so there isn't a notion of block propagation for consensus.
The sequencer just pushes transaction batches occasionally to L1.
Mempool​
If there is a gap in nonces, will transactions after the gap be preserved in the
mempool?For example, if my EOA currently has nonce 0, and I send a transaction with nonce 3, then I
send transactions with nonce 0, 1, and 2. Will the transaction with nonce 3 be executed or
dropped?Answer: Transaction 3 will be executed.
Block States and Finality​
When can a node start executing a block?A node can start executing speculatively
as soon as a new block proposal is received. Executing a block just generates new states and a
new merkle trie root - but the official pointer is still to the old one. This is like receiving
a possible piece of homework from your teacher which will be finalized soon - you can start
working on it on a new piece of paper, and just throw it away if it turns out that the homework
isn't needed.
When can a node be sure about the state?As soon as a block enters the Finalized state, the
merkle root for the speculative execution of that block becomes the official local merkle root
for that block. That merkle root won't be verified by consensus for another D=3 blocks, but
it is still known locally because state is deterministic given a fixed ordering of transactions.If you want to be certain that your local node did not make a computation error (e.g. due to
cosmic rays), you may wait D=3 blocks for the delayed merkle root, which makes the block in
question enter the Verified state.
RPC​
When calling eth_call with an old block number, I received this response: Block   requested not found. Request might be querying historical state that is not available. If   possible, reformulate query to point to more recent blocks. What's going on?Due to Monad's high throughput, full nodes do not provide access to arbitrarily old state,
as this would require too much storage. See
Historical Data for a fuller discussion.When writing smart contracts, it is recommended to use events to log any state that will
be needed later, or use a smart contract indexer
to compute it off-chain.
Features​
Is EIP-7702 supported?Yes, EIP-7702 is supported.Note that when accounts are delegated under EIP-7702, their treatment under Monad's
Reserve Balance rules changes slightly.
You can learn more about it here.
Is EIP-7212 supported?Yes, it is precompile 0x0100. See Precompiles for
more details.
Miscellaneous​
What is the point of low validator hardware requirements (32 GB RAM, 2x 2TB SSD,
16-core CPU), if there will only be 100-200 voting nodes?Monad's north star is decentralization. If it's really expensive to run a node, only professional
validation companies with a large amount of stake will be able to justify the cost. Making nodes
economical is crucial to making it feasible for anyone to run a full node, as well as to
supporting a large validator set - the Day-1 mainnet target of 100-200 nodes is just a starting
point.
Why was rust chosen for the consensus client and C++ for execution?Rust and C++ are both great high-performance languages. C++ was selected for the database and
execution system to get finer control over the filesystem and to use libraries like io_uring
and boost::fibers. Rust was selected for consensus to take advantage of stricter memory safety
given that consensus concerns itself with slightly higher-level systems engineering problems.

