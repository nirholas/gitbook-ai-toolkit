# Statesync

> Source: https://docs.monad.xyz/monad-arch/consensus/statesync

## Documentation

On this page

Summary​
Statesync is the process for synchronizing state to a target block close to the current tip. A synchronizing node ("client") requests data from other up-to-date validators ("servers") to help it progress from its current view to its target view; the servers rely on metadata in MonadDb to efficiently respond to the request.
Since the current tip is a moving target, following completion of statesync, the client makes another statesync request to get closer to the current tip, or replays queued blocks if within striking distance.
Approach​
Statesync is the process of synchronizing state stored in MonadDb to a target block close to the current tip.
The current tip is a moving target, so as statesync is running, the syncing node stores new blocks beyond the target block and, upon completion of statesync, replays these additional blocks through normal execution to catch up to the current tip. The target block may be updated several times during this process.
Statesync follows a client-server model, where the statesync requester is the client and the validator node servicing a statesync request is the server.
Data included in statesync​
MonadDb stores a variety of data relating to the execution of blocks. However, only a subset is required for full participation in the active set and thus included in statesync:

accounts, including balances, code, and storage
the last 256 block headers (to verify correctness)

In an effort to evenly distribute load, each of the aforementioned is spliced into chunks. The client assigns each chunk to a server who remains the peer for that chunk until synchronization is complete.
Servers are randomly selected from the list of available peers. The client maintains a certain number of sessions up to a configured maximum. In the event that servers are unresponsive, the client’s statesync request will timeout and request from a different server.
Versioning and verification​
For efficiency, the client requests state from least- to most-recently updated, converging on the tip near the end of the process. Servers serve diffs relative to the client's latest block.

In the example above, the statesync client makes three consecutive requests to the statesync server assigned to prefix p. For each request, there are five parameters specified:

prefix - the prefix of the Merkle Patricia Trie
i - the start block number
j - the end block number
target - the target block number
last_target - last target block number, this is used to deduce deletions to send

Because there may be multiple rounds of statesync (as statesync occurs, the chain is progressing and the target block may need to adjust), j is buffered by some offset B from the target block to avoid retransmitting most recently used nodes in the MPT.  When i and target block are sufficiently close, as in the last round above, the statesync client will request j = target.
At this point, if target is less than statesync_threshold (600 blocks by default) from the tip of the chain, statesync is concluded and the state root will be validated. Any remaining blocks between target and tip are then synced via blocksync. If target is greater than statesync_threshold blocks from the tip of the chain, a new round of statesync will begin.
During block execution, the server stores the version alongside node contents. As such, upon receipt of a statesync request, the server is able to quickly narrow down the relevant subtrie and submit read requests, which are embarrassingly parallel.
Trust assumptions​
Statesync clients trust that the requested data (including state root and parent hash) from statesync servers is correct. This is currently sampled randomly from the validator set according to stakeweight, but clients can optionally whitelist specific known providers as statesync servers.
The current implementation validates the data transmitted when the whole transfer is complete by comparing the state root. Because the work is split between multiple servers, a single server sending invalid data can cause a state root mismatch, without attribution to the faulty server. The only recourse in this situation is to retry the whole transfer, giving the faulty server an opportunity to fail the operation again.
Changes are currently being implemented to verify the data transmitted on a per-server basis. In the event of a faulty server sending invalid data, the statesync client can discard and retry only the affected prefix. Further, it can identify the faulty server, log the error and potentially blacklist it from subsequent requests.

