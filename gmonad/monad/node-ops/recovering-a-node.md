# Recovering a Node

> Source: https://docs.monad.xyz/node-ops/node-recovery/

## Documentation

When a node is stopped (e.g. due to an upgrade or network outage), it may miss some blocks
and fall out of sync with the network. The pages below describe a few options for recovering
and rejoining the tip of the chain.
Each option has tradeoffs:

soft reset is fast but only works if the node tip is close to the network tip. It skips execution
of the intervening blocks, so no artifacts (logs, receipts, traces) will be produced locally for
those blocks
hard reset is slow but works even if the node tip is far from the network tip. It skips everything
before the snapshot, so no artifacts (logs, receipts, traces) will be produced locally for those
blocks.
full replay is more expensive, but it ensures the local archive has no gaps that would have to
be served by S3. Full replay may be desirable
for RPC providers.

Soft ResetUtilizes statesync to catch up to the tip of the chain, skipping
execution of blocks in between.Hard ResetRestores state from a snapshot before resyncing.Full ReplayFetches and replays all missing blocks serially so that all transactional
artifacts are available.

