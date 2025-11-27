# Blocksync

> Source: https://docs.monad.xyz/monad-arch/consensus/blocksync

## Documentation

On this page

Summary​
Blocksync is a mechanism that nodes can use to acquire missing blocks. A block is considered missing when a Quorum Certificate is observed that references an unknown block.
Blocks can be missing from a node in one of two scenarios:

After the node completes statesync and its local block height is close enough to the network tip.
During ordinary consensus operations, the node does not receive enough RaptorCast chunks to decode the block. This can be due to packet loss or a network partition.

Blocksync procedure​

A single header request is made for a range of num_blocks blocks, starting with last_block_id.
A chain of num_blocks headers are received, forming a cryptographically verifiable chain back to last_block_.
For each of the num_blocks headers received, concurrent (up to a max concurrency factor) body requests are made containing the body_id included in the header.
Each body response is cryptographically verifiable by comparing against the corresponding header body_id.

