# Indexing Frameworks

> Source: https://docs.monad.xyz/tooling-and-infra/indexers/indexing-frameworks

## Documentation

On this page

Background​
Smart contract indexers are off-chain calculators that compute additional metrics specific to one smart contract. Calculators can be thought of as extensions to a smart contract that do additional off-chain computation and maintain additional off-chain state.
Simple example: the UniswapV2Pair contract maintains minimal state for the pool and emits Mint, Burn, and Swap events. If we wanted to know the cumulative number and volume of swaps on the pair, we could write and deploy a custom indexer instead of adding additional state variables and computation to the contract.
Smart contract indexers typically produce object schemas using the GraphQL schema language.
Smart contract indexing services usually provide a hosted service so that users can deploy their indexers without having to run their own infrastructure.
Provider Summary​
MainnetTestnetProviderStatusDocsLanguageFrameworkKnown forHosted serviceDecen- tralized hosted serviceOnchain & offchain dataWeb- socket subscr- iptionsQuery layerEnvio✅DocsJavaScript, TypeScript, RescriptHyperIndexPerformance and scale✅❌✅✅GraphQLGhost✅DocsSolidityGhostGraphSolidity development✅❌❌❌GraphQLGoldsky✅DocsAssembly- Scriptsubgraph✅❌❌❌Custom GraphQLOrmi✅DocsAssembly- ScriptsubgraphHigh performance and custom environments✅❌❌❌Custom GraphQLSentio✅DocsJavaScript, TypeScriptsentio-sdkPerformance; integrated alerting and visualization✅❌✅❌GraphQL & SQLSQD✅DocsTypeScriptsquid-sdkPerformance, decentralization✅Partial1✅✅GraphQLSubQuery✅DocsTypeScriptsubqlDecentral- ization✅✅✅❌GraphQLThe Graph✅DocsAssembly- ScriptsubgraphThe original indexer✅✅❌❌Custom GraphQL✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't supportProviderStatusDocsLanguageFrameworkKnown forHosted serviceDecen- tralized hosted serviceOnchain & offchain dataWeb- socket subscr- iptionsQuery layerEnvio✅DocsJavaScript, TypeScript, RescriptHyperIndexPerformance and scale✅❌✅✅GraphQLGhost✅DocsSolidityGhostGraphSolidity development✅❌❌❌GraphQLGoldsky✅DocsAssembly- Scriptsubgraph✅❌❌❌Custom GraphQLOrmi✅DocsAssembly- ScriptsubgraphHigh performance and custom environments✅❌❌❌Custom GraphQLSentio✅DocsJavaScript, TypeScriptsentio-sdkPerformance; integrated alerting and visualization✅❌✅❌GraphQL & SQLSQD✅DocsTypeScriptsquid-sdkPerformance, decentralization✅Partial1✅✅GraphQLSubQuery✅DocsTypeScriptsubqlDecentral- ization✅✅✅❌GraphQLThe Graph✅DocsAssembly- ScriptsubgraphThe original indexer✅✅❌❌Custom GraphQL✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't support
Provider Details​
Envio​
Envio is a full-featured data indexing solution that provides application developers with a seamless and efficient way to index and aggregate real-time and historical blockchain data for Monad Testnet. The indexed data is easily accessible through custom GraphQL queries, providing developers with the flexibility and power to retrieve specific information.
Envio HyperSync is an indexed layer of the Monad Testnet blockchain for the hyper-speed syncing of historical data (JSON-RPC bypass). What would usually take hours to sync ~100,000 events can now be done in the order of less than a minute.
Designed to optimize the user experience, Envio offers automatic code generation, flexible language support, multi-chain data aggregation, and a reliable, cost-effective hosted service.
To get started, visit the documentation or follow the quickstart guide.
Ghost​
With GhostGraph, you can write your indexers in the same language as your contracts: Solidity. This means less context switching and faster time to market.
To get started, visit the documentation or check out the tutorial.
Services supported:

GhostGraph

Goldsky​
Goldsky is the go-to data indexer for web3 builders, offering high-performance subgraph hosting and realtime data replication pipelines.
Goldsky offers two core self-serve products that can be used independently or in conjunction to power your data stack.

Subgraphs: Flexible indexing with typescript, with support for webhooks and more.
Mirror: Get live blockchain data in your database or message queues with a single yaml config.

To get started, visit the documentation or follow the quickstart guide.
Ormi​
Ormi delivers real-time blockchain data that is fast, accurate, and ready for production.
It keeps data synced to the tip of the chain and makes it instantly accessible through Subgraphs and APIs without the need to manage indexing infrastructure.
Ormi provides two core products:

Subgraphs: Smart contract data at sub-second latency with zero throttling.
Data API: Real-time and historical blockchain data delivered through flexible, high-speed API endpoints.

Ormi supports shared, dedicated, and fully custom environments that provide isolated performance for high-demand workloads.
Start building by exploring the documentation or following the Quickstart Guide.
Sentio​
Sentio offers blazing-fast native processors and seamless subgraph hosting on Monad. With powerful database capabilities, intuitive dashboards, and comprehensive API functionalities, Sentio is built to provide an exceptional developer experience.
To get started, check out the docs or visit the quickstart guide.
SQD​
SQD enables permissionless, cost-efficient access to petabytes of high-value Web3 data.
SQD is a decentralized hyper-scalable data platform optimized for providing efficient, permissionless access to large volumes of data. It currently serves historical on-chain data, including event logs, transaction receipts, traces, and per-transaction state diffs.
To get started, visit the documentation or see this quickstart with examples on how to easily create subgraphs via Subsquid.
SubQuery​
SubQuery is a leading blockchain data indexer that provides developers with fast, flexible, universal, open source and decentralised APIs for web3 projects. SubQuery SDK allows developers to get rich indexed data and build intuitive and immersive decentralised applications in a faster and more efficient way. SubQuery supports many ecosystems including Monad, Ethereum, Cosmos, Near, Polygon, Polkadot, Algorand, and more.
One of SubQuery's advantages is the ability to aggregate data not only within a chain but across multiple blockchains all within a single project. This allows the creation of feature-rich dashboard analytics and multi-chain block scanners.
Useful resources:​

SubQuery Academy (Documentation)
Monad Testnet Starter
Monad Testnet Quick Start Guide

For technical questions and support reach out to us start@subquery.network
The Graph​
The Graph is an indexing protocol that provides an easy way to query blockchain data through APIs known as subgraphs.
With The Graph, you can benefit from:

Decentralized Indexing: Enables indexing blockchain data through multiple indexers, thus eliminating any single point of failure
GraphQL Queries: Provides a powerful GraphQL interface for querying indexed data, making data retrieval super simple.
Customization: Define your own logic for transforming & storing blockchain data. Reuse subgraphs published by other developers on The Graph Network.

Follow this quick-start guide to create, deploy, and query a subgraph within 5 minutes.

Footnotes​


SQD hosted service is semi-decentralized: the data lake is decentralized, but indexers run on proprietary infra. ↩ ↩2

