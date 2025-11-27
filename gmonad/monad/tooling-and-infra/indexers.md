# Indexers

> Source: https://docs.monad.xyz/tooling-and-infra/indexers/

## Documentation

On this page

Common DataRaw transactional data and frequently-used derived data like balances, transfers, and DEX tradesIndexing FrameworksTools that allow developers to build custom calculators in response to events

The blockchain can be thought of as a list of blocks, transactions, and logs, as well as a series of global states. Indexers compute common transformations on this data to save downstream consumers the cost and complexity of doing so.
There are two main types of indexer services:

Data for common use cases: raw data (blocks, transactions, logs, traces) and derived data for common use cases (token balances, NFT holdings, DEX trades), computed across the entire blockchain
Indexing Frameworks enable devleopers to build custom calculators for a specific smart contract

Data for common use cases​
Data providers offer raw and transformed data for common use cases via API or by streaming to your local environment.
Raw data includes:

blocks, transactions, logs, traces (potentially decoded using contract ABIs)

Transformed data includes:

balances (native tokens, ERC20s, NFTs)
transfers (native tokens, ERC20s, NFTs)
DEX trades
market data
and more

See Common Data for a fuller list of features and providers.
Indexing Frameworks​
Smart contract indexers are custom off-chain calculators for a specific smart contract. They maintain additional off-chain state and perform additional computation. Since blockchain data is public, anyone may deploy a subgraph involving state or logs from any smart contract.
See Indexing Frameworks for a list of features and providers.

