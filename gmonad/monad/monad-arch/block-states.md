# Block States

> Source: https://docs.monad.xyz/monad-arch/consensus/block-states

## Documentation

On this page

In MonadBFT, a block progresses through three states.
Additionally, due to asynchronous execution, block finalization is a
separate (earlier) matter from state root verification. As a result of this architecture, each
Monad block can be considered to be in one of four states.
Note that a block's state is from the perspective of a particular observer (any other validator or
full node). As new messages arrive, they allow that observer to progress the block's state locally.
Although the states are defined locally, they correspond to assurance that the rest of the network
will ultimately converge on an outcome consistent with that state.
For example, if a node marks a block as Finalized, it is because that node has received a message
carrying sufficient proof that the rest of the network will ultimately converge on enshrining that
block at that block height.
States​
A Monad block is in one of the four states:

Proposed
Voted
Finalized
Verified

Classification of historical blocks based on the latest proposed block N.
Proposed​
The block has been proposed by a leader but has not been voted upon.
Note: if execution is not lagging behind consensus, a node may
speculatively execute the proposed block.
Voted​
We have a Quorum Certificate (QC) in hand for the block,
indicating that it has been voted affirmatively for by a supermajority of validators. (Typically,
this is due to receiving a child block for this block.)
In MonadBFT, Voted means the block can be
speculatively finalized.
Finalized​
We have a QC-squared in hand for the block (that is, we have a
QC for a block that contains a QC on the original block).
This serves as proof that a supermajority of validators have ratified the existence and validity
of a QC on the original block.
Due to the consensus rules of MonadBFT, this means that the block is finalized.
Verified​
A block containing the delayed merkle root
has been finalized, meaning that the execution outputs of the block has been agreed upon by a
supermajority of validator nodes.
Concretely, the latest verified block will be the
latest_finalized_block - execution_delay.
Mapping to JSON-RPC commitment levels​
Monad uses a different consensus algorithm than Ethereum, but is API compatible with the
JSON-RPC programming interface defined by the
Geth client.
Geth communicates consensus information about blocks publicly over JSON-RPC using the tags
"latest", "safe", and "finalized". Here is how they map to Monad's block states:
Geth RPC state...corresponds to Monad block stateWhy?"latest"Voted(As of v0.10.2. This will be changed to Proposed shortly)Both states refer to the most recently observed block, prior to any action by the consensus algorithm 1"safe"VotedIn Ethereum's LMD-GHOST algorithm, "safe" means something like "extremely unlikely to be reverted, but still theoretically possible"; Monad's voted has a similar meaning"finalized"FinalizedThis has the same meaning on both chains: not revertible without a hard fork
noteGeth recognizes two other block tags, "earliest" and "pending". These are not consensus
states. The former is a synonym for the genesis block, and the latter does not make sense given
how Monad's transaction propagation mechanism is
different.
Real-time data and block states​
Monad offers several sources of real-time blockchain data.
To provide the fastest service possible, some data feeds report blockchain data for the latest
block your node knows about, as soon as it learns about it.
As you can see above, the latest block your node is aware of -- the most recent block in the
Proposed state -- may be speculatively executed. Thus, you may see data about blocks that do
not ultimately become part of the Monad blockchain, although this is very rare.
This page gives an in-depth overview of how the
block state progression works, in case you want to consume real-time data and wish to understand
how speculative execution and real-time data reporting fit together.
To see an explicit example of how this relates to a real data feed, see the
WebSocket Guide section about
monadNewHeads, an extension to the
Geth newHeads data feed that
reports speculatively-executed blocks (those still in the Proposed state).

Footnotes​


Currently "latest" is actually mapped to Voted, but given the intended meaning of
"latest" in Geth, it will be changed shortly to Proposed. ↩

