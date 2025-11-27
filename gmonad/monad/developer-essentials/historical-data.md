# Historical Data

> Source: https://docs.monad.xyz/developer-essentials/historical-data

## Documentation

On this page

Summary​
Monad full nodes provide access to all historic transactional data (blocks, transactions, receipts,
events, and traces).
Monad full nodes do not provide access to arbitrary historic state.
solutionThere is a special RPC service at https://rpc-mainnet.monadinfra.com
that provides access to historical data. The following methods at that service support queries
referring to historical state:
debug_traceCall
eth_call
eth_createAccessList
eth_estimateGas
eth_getBalance
eth_getCode
eth_getTransactionCount
eth_getStorageAt

Background​
Blockchains are stateful systems; there are two main kinds of data:

transactional data (the list of transactions and their artifacts); and
state data (the current state of the world, resulting from applying those transactions
sequentially; stored in a merkle trie).

Transactional data consists of

blocks
transactions
receipts produced by executing those transactions
events (logs) emitted by smart contracts in the course of execution
detailed traces from each transaction's execution

State data consists of

for each account, its native token balance
for each smart contract, the storage mapping (which maps storage slots to values)

A typical node in a blockchain holds the current state, which is constantly being updated as new transactions are added. Recent historical states may be available as well, depending on how costly each incremental version is and how much disk space is available.
For reference, imagine maintaining a MySQL or Postgres table, where each INSERT or UPDATE query is a transaction. If the table is small enough, then it may be feasible to cache every new version of the table, but if it's a large table, you would probably expect to only have access to the current version.
The following describes historical data access in Monad:
Transactional data​
Monad full nodes provide access to all historic transactional data (blocks, transactions, receipts, events, and traces).1
State​
In Ethereum, a "full node" offers chain state for the current block and each block up to 128 blocks ago, while an "archive node" offers per-block chain state since genesis. That is, an Ethereum "archive node" is a differently-configured full node, run on a box with a large disk. This terminology is described further here.
In Monad, every "full node" is an "archive node" in the sense that every node maintains as many historical per-block state tries as it can. This means that the lookback depends on the size of disk chosen by the RPC provider. For a 2 TB SSD, this recently has corresponded to about 40,000 blocks, although it depends on the amount of state diffs in each block.
Due to Monad's high throughput, full nodes do not provide access to arbitrary historic state, as this would require too much storage.2
Methods like eth_call may reference recent states up to the point where the state trie was evicted.
When writing smart contracts, it is recommended to use events to log any state that will be needed later, or use a smart contract indexer to compute it off-chain.

Footnotes​


Implementation detail: recent transactional data is stored directly on the node, while older data is stored in a separate archive node as configured and operated by the RPC provider. ↩


With sufficient SSD capacity, a Monad full node would behave similarly to an Ethereum "archive" node in providing access to historical state since genesis. But in practice, due to larger changesets for each block (up to 5,000 transactions per block vs ~200 for Ethereum, i.e. 25x larger blocks) and more frequent blocks (0.4s for Monad vs 12s for Ethereum, i.e. 30x more frequent) no RPC provider is currently offering access to arbitrarily-far-back historical state. ↩

