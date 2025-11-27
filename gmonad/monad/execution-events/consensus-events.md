# Consensus events

> Source: https://docs.monad.xyz/execution-events/consensus-events

## Documentation

On this page

As explained here,
Monad's consensus and execution services are decoupled, and execution is
asynchronous with the respect to consensus: the two don't have to move in
lock step, and can working on different blocks. Also, execution can
speculatively execute
blocks whose consensus outcome is not yet known.
Execution events are "trace" information reported directly from the EVM during
execution, so they report real-time data on speculative basis: the event data
may relate to a block that is never finalized.
Dealing with real-time data on a speculative basis is discussed in detail on
this page. The "takeaway"
from that part of the documentation is the following: if you consume
speculative real-time data, then you need to understand
block commit states and how the
real-time data protocol you're using communicates the changes in block states.
For example, for the Monad WebSocket extension feeds,
this section
explains how the block IDs and commit states are announced for the
monadNewHeads subscription. This documentation page explains how it
is done with execution events.
Block tags​
As explained
here,
blocks must be identified by their unique ID prior to finalization. Even so,
it is often useful to know what the proposed block number is, even before we
know if the block will committed with that number or not. The following
structure -- called a "block tag" -- appears as a field in several execution
event payload types, to communicate the block ID and the (proposed) block
number together.
struct monad_exec_block_tag{    monad_c_bytes32 id;    ///< Monad consensus unique ID for block    uint64_t block_number; ///< Proposal is to become this block};
The four consensus events​
The four block commit states
correspond to four execution event types. Events of these types are published
to announce that a particular block is moving to a new commit state.
First consensus event: BLOCK_START (proposed state)​
/// Event recorded at the start of block executionstruct monad_exec_block_start{    struct monad_exec_block_tag        block_tag;                      ///< Execution is for this block    uint64_t block_round;               ///< Round when block was proposed    uint64_t epoch;                     ///< Epoch when block was proposed    monad_c_bytes32 parent_eth_hash;    ///< Hash of Ethereum parent block    monad_c_uint256_ne chain_id;        ///< Block chain we're associated with    struct monad_c_eth_block_exec_input        exec_input;                     ///< Ethereum execution inputs};
The first event recorded by the EVM is a BLOCK_START event, whose event
payload contains a block_tag field that introduces the unique ID for the
block and the block number it will eventually have, if it gets finalized.
Almost all execution events (transaction logs, call frames, receipts, etc.)
occur between the BLOCK_START and BLOCK_END events. In the current
implementation, block execution is never pipelined, so all events between
BLOCK_START and BLOCK_END pertain to a single block, and there will not
be another BLOCK_START until the current block is ended.
Unlike the other events in this list, BLOCK_START is both a "consensus
event" (it means the associated block is in proposed state) and an "EVM event,"
because execution information about the block is being made available to you.
The other events in this list are not like that. They are "pure" consensus
events: they tell you what happened to a proposed block in the consensus
algorithm, after you've already seen all of its EVM events.
To understand the implications of this state, see
here.
noteThere's no reason why a block has to start in the proposed state. If
execution is lagging behind consensus, it's possible that a block might have
advanced to a later state in the consensus algorithm. For example, suppose
consensus has been working on a block for a while, and by the time execution
finally sees it, perhaps consensus knows that it has progressed to voted.In the current implementation, however, execution will not know this. It
implicitly considers everything it executes to only be proposed. This is only
literally true if execution is not lagging behind.
Second consensus event: BLOCK_QC (voted state)​
/// Event recorded when a proposed block obtains a quorum certificatestruct monad_exec_block_qc{    struct monad_exec_block_tag        block_tag;              ///< QC for proposal with this block    uint64_t round;             ///< Round of proposal vote    uint64_t epoch;             ///< Epoch of proposal vote};
When a block with the given tag is voted, an event of this type is published
to announce it. To understand all the implications of seeing this event, see
here.
Third consensus event: BLOCK_FINALIZED​
/// Event recorded when consensus finalizes a blocktypedef struct monad_exec_block_tag monad_exec_block_finalized;
The finalized event payload does not have any information that isn't already
part of the block tag, so the payload is just the tag of the block that gets
finalized. To understand all the implications of seeing this event, see
here.
Fourth consensus event: BLOCK_VERIFIED​
/// Event recorded when consensus verifies the state root of a finalized blockstruct monad_exec_block_verified{    uint64_t block_number; ///< Number of verified block};
The consensus algorithm produces one last event for a block, called
BLOCK_VERIFIED. This time, it is sufficient to identify the block only by
its block number. Because verified blocks are already finalized, they are
part of the canonical blockchain and cannot be reverted without a hard fork.
Thus, we no longer need the block tag.
To understand all the implications of seeing this event, see
here.

## Code Examples

```prism
struct monad_exec_block_tag{    monad_c_bytes32 id;    ///< Monad consensus unique ID for block    uint64_t block_number; ///< Proposal is to become this block};
```

```prism
/// Event recorded at the start of block executionstruct monad_exec_block_start{    struct monad_exec_block_tag        block_tag;                      ///< Execution is for this block    uint64_t block_round;               ///< Round when block was proposed    uint64_t epoch;                     ///< Epoch when block was proposed    monad_c_bytes32 parent_eth_hash;    ///< Hash of Ethereum parent block    monad_c_uint256_ne chain_id;        ///< Block chain we're associated with    struct monad_c_eth_block_exec_input        exec_input;                     ///< Ethereum execution inputs};
```

```prism
/// Event recorded when a proposed block obtains a quorum certificatestruct monad_exec_block_qc{    struct monad_exec_block_tag        block_tag;              ///< QC for proposal with this block    uint64_t round;             ///< Round of proposal vote    uint64_t epoch;             ///< Epoch of proposal vote};
```

```prism
/// Event recorded when consensus finalizes a blocktypedef struct monad_exec_block_tag monad_exec_block_finalized;
```

```prism
/// Event recorded when consensus verifies the state root of a finalized blockstruct monad_exec_block_verified{    uint64_t block_number; ///< Number of verified block};
```

