# Common Data

> Source: https://docs.monad.xyz/tooling-and-infra/indexers/common-data

## Documentation

On this page

Features​
In order to improve developer understanding of feature coverage, we have collected the most common features offered by providers:
FeatureSub-FeatureDescriptionChain dataRaw data (blocks, transactions, logs, traces) in SQL-like format. Transactions and logs may optionally be decoded based on ABIBalancesNativeNative token holdings of an address, real-time or snapshot. May include price annotationsERC20ERC20 holdings of an address, real-time or snapshot. May include price annotationsNFTNFT (ERC721 or ERC1155) holdings of an address, real-time or snapshotTransfersNativeNative token transfers involving a particular address. May include price annotationsERC20ERC20 transfers involving a particular address. May include price annotationsNFTNFT transfers involving a particular addressDEX tradesNormalized trade data across major DEXesMarket dataMarket data for ERC20s
Balances are nontrivial because each ERC20 and NFT collection stores its balances in contract storage. Transfers are nontrivial because they frequently occur as subroutines. Annotating with prices and normalizing across DEXes add additional convenience.
Access models​

APl: Data lives on provider's servers; make queries via API
Stream: Data is replicated to your environment

Provider Summary​
MainnetTestnetProviderStatusDocsSupported servicesAccess modelAllium✅DocsChain data (blocks, transactions, logs, traces, contracts) (via Explorer (historical) and Datastreams (realtime) products)
Transfers (native, ERC20, and NFTs) (via Developer (realtime) product)API, except streaming for Datastreams productCodex✅DocsToken- and trading-centric data:
Token charts, metadata, prices, events, and detailed stats
NFT metadata, events, and detailed statsAPIDune Sim✅DocsChain data: Transactions, logs (raw or decoded)
Balances: Native, ERC20APIGoldRush (by Covalent)✅DocsChain data: Blocks, enriched transactions and logs (raw and decoded)
Balances: native, ERC20, NFTs & Portfolio
Transactions: Full historical with decoded transfer eventsAPIGoldsky✅DocsChain data: blocks, enriched transactions, logs, and traces via Mirror. Fast scan is supportedAPI; StreamingMobula✅DocsChain data
Balances: native, ERC20 and NFT
Transfers: native, ERC20 and NFT
DEX trades
Market data for ERC20sAPIMoralis✅DocsChain Data: blocks, transactions, logs
Balances: native, ERC20, NFTs (with metadata, logos, spam / low-liquidity filtering)
Token Prices: USD valuation included
Transfers: native, ERC20, and NFTs (decoded events), wallet history (categorized transfers + approvals)
Streams: real-time address/contract monitoring via webhooks
Datashare: Export massive crypto datasets
RPC Nodes: Raw blockchain data accessAPIs, Streaming (webhooks)Quicknode✅DocsStreams, WebhooksStreams, WebhooksRarible✅DocsNFT data: metadata; holdings by address (current and historic); trade data; spam scoringAPISequence❓DocsBalances: native, ERC20, and NFT
Transfers: native, ERC20, and NFTs
Other: Transaction history; webhooksAPI; Streaming (webhooks)SonarX✅Chain data: blocks, transactions, logs, traces
Transfers: tokens, NFTs, internal transfers, net internal transfers (with/without pricing)
Balances: PIT and current balances
DEX trades and balances
Other: Approvals and failed transactionsCloud Platforms Data Shares (Snowflake, BigQuery, Azure, Databricks); Streaming (Kafka); File delivery (CSV, Parquet, Iceberg); APIthirdweb✅DocsChain data: blocks, transactions, logs, contracts
Balances: native, ERC20, NFTs
Other: NFTsAPIUnmarshal❓DocsBalances: ERC20 and NFT
Transactions with price annotations
NFT API (transactions and metadata)APIZerion✅DocsWallet info
Balances (native, ERC20, and NFTs)
Transactions (multichain with prices)
Other: Portfolio, PNL and Historical Positions
Notification WebhooksAPI; Webhooks✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't supportProviderStatusDocsSupported servicesAccess modelAllium✅DocsChain data (blocks, transactions, logs, traces, contracts) (via Explorer (historical) and Datastreams (realtime) products)
Transfers (native, ERC20, and NFTs) (via Developer (realtime) product)API, except streaming for Datastreams productCodex✅DocsToken- and trading-centric data:
Token charts, metadata, prices, events, and detailed stats (see dashboard)
NFT metadata, events, and detailed statsAPIDune Sim✅DocsChain data: Transactions, logs (raw or decoded)
Balances: Native, ERC20APIGoldRush (by Covalent)✅DocsChain data: Blocks, enriched transactions and logs (raw and decoded)
Balances: native, ERC20, NFTs & Portfolio
Transactions: Full historical with decoded transfer eventsAPIGoldsky✅DocsChain data: blocks, enriched transactions, logs, and traces via Mirror. Fast scan is supportedAPI; StreamingMobula✅DocsChain data
Balances: native, ERC20 and NFT
Transfers: native, ERC20 and NFT
DEX trades
Market data for ERC20sAPIMoralis❌DocsChain data
Balances: native, ERC20 and NFT
Transfers: native, ERC20APIQuicknode✅DocsStreams, WebhooksStreams, WebhooksSequence✅DocsBalances: native, ERC20, and NFT
Transfers: native, ERC20, and NFTs
Other: Transaction history; webhooksAPI; Streaming (webhooks)SonarX✅Chain data: blocks, transactions, logs, traces
Transfers: tokens, NFTs, internal transfers, net internal transfers (with/without pricing)
Balances: PIT and current balances
DEX trades and balances
Other: Approvals and failed transactionsCloud Platforms Data Shares (Snowflake, BigQuery, Azure, Databricks); Streaming (Kafka); File delivery (CSV, Parquet, Iceberg); APIthirdweb✅DocsChain data: blocks, transactions, logs, contracts
Balances: native, ERC20, NFTs
Other: NFTsAPIUnmarshal✅DocsBalances: ERC20 and NFT
Transactions with price annotations
NFT API (transactions and metadata)APIZerion✅DocsWallet info
Balances (native, ERC20, and NFTs)
Transactions (multichain with prices)
Other: Portfolio, PNL and Historical Positions
Notification WebhooksAPI; Webhooks✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't support
Provider Details​
Allium​
Allium is an Enterprise Data Platform that serves accurate, fast, and simple blockchain data. Allium offers near real-time Monad Testnet data for infrastructure needs and enriched Monad Testnet data (NFT, DEX, Decoded) for research and analytics.
Allium supports data delivery to multiple destinations, including Snowflake, Bigquery, Databricks, and AWS S3. To get started, contact Allium here.
ProductDescription / mechanismMonad Testnet data supportedExplorerHistorical data (postgres/API)Chain data: blocks, transactions, logs, traces, contractsDeveloperReal-time data (postgres/API)Transfers (native, ERC20, ERC721, ERC1155)DatastreamsReal-time data (streaming - Kafka, PubSub, or SNS)Chain data: blocks, transactions, logs, traces, contracts
Codex​
Codex API provides fast and accurate enriched data, meticulously structured to easily plug straight into your application.
To get started, visit the documentation or sign up for an API key at dashboard.codex.io.
Dune Sim​
Dune Sim makes building multi-chain application seamless. These APIs power
several of the best teams building on crypto.
Available APIs:

Token Balances: Access accurate and fast real time balances of native and ERC20 tokens of
accounts on EVM blockchains.
Transactions: Access transactions for accounts in real time across EVM blockchains.

To get started, visit the documentation.
GoldRush (by Covalent)​
GoldRush provides multichain data APIs and toolkits for easy web3 development across 100+ chains including Monad.
GoldRush offers structured onchain data, including multichain wallet balances, full transaction histories and decoded log events, for building apps and powering AI Agents. Join hundreds of top teams that leverage GoldRush to cut down their development time and scale their multichain offerings with enterprise-grade onchain data.
To get started, visit the documentation or sign up for an API key.
Goldsky​
Goldsky is the go-to data indexer for web3 builders, offering high-performance subgraph hosting and realtime data replication pipelines.
Goldsky offers two core self-serve products that can be used independently or in conjunction to power your data stack.

Subgraphs: Flexible indexing with typescript, with support for webhooks and more.
Mirror: Get live blockchain data in your database or message queues with a single yaml config.

To get started, visit the documentation or follow the quickstart guide.
Mobula​
Mobula provides curated datasets for builders: market data with Octopus, wallets data, metadata with Metacore, alongside with REST, GraphSQL & SQL interfaces to query them.
You can get started playing around with the API endpoints for free, and sign-up to the API dashboard once you need API keys (queries without API keys aren’t production-ready).
To get started, visit the documentation.
Moralis​
Moralis is the unified way to fetch, stream, and export onchain data. Access fast, enriched Data APIs for wallets, tokens, prices, holders, NFTs, transfers, liquidity, and full transaction & wallet history - plus real-time Streams and RPC nodes. Teams use Moralis as their crypto data layer to get complete, reliable onchain data without running indexers or maintaining pipelines.
To get started, visit the documentation or sign up for a free API key.
Quicknode​
Streams is a managed, push-based service for blockchain data streaming with guaranteed delivery of live and sequential historical data. Receive raw or filtered data (e.g., specific contract events) pushed to your destination: webhook, S3, Postgres, or Snowflake.
To get started, visit the documentation for detailed instructions.
Webhooks provide real-time notifications for blockchain events on Monad. Track smart contract activity, wallet transactions, and more using ready-to-use templates or your own custom JavaScript.
To get started, visit the documentation for detailed instructions.
Rarible​
Rarible offers an comprehensive toolkit for anyone interacting with
NFTs, including marketplaces and wallets. Rarible's API for NFT data includes collection/item
metadata, trades, holdings by account (both current and historical), and spam scoring.
Rarible also offers aggregated order books from major NFT marketplaces like OpenSea, Rarible, and
Blur, as well as an NFT trading SDK.
To get started, check out the documentation.
Sequence​
Sequence Indexer
offers real-time balances, transfers, NFTs, prices, and contract events across EVM chains with
webhooks and subscriptions and sub-300 ms queries. Use it as your production read layer for on-chain
apps.
Indexer gives you low-latency reads across EVM chains: balances and portfolio, token and NFT
ownership, transfers and logs, prices, and contract events. It is built for enterprise-grade
production and supports developers of all sizes. Cursor-based pagination, filters, webhooks,
and event subscriptions: All in a scalable, 99.99% uptime service.
To get started, visit the
quickstart guide.
SonarX​
SonarX delivers structured blockchain data with historical and real-time coverage across 100+ blockchains with a focus on data quality, in line with our proprietary Data Quality Framework.
Enterprises, Institutions and Builders can query full historical datasets in their preferred cloud warehouse (Snowflake, BigQuery, Azure), receive file drops in csv, parquet, iceberg formats, or run real-time pipelines with Kafka streaming. Supported services include chain data (blocks, transactions, logs, traces, decoded logs and traces), staking, and DEX trades and balances.
With ready-to-use tables and flexible delivery, SonarX helps power analytics, trading, accounting, and applications without the burden of maintaining indexing pipelines.
To get started, visit the console at console.sonarx.com.
thirdweb​
thirdweb Insight is a fast, reliable and fully customizable way for developers to index, transform & query onchain data across 30+ chains. Insight includes out-of-the-box APIs for transactions, events, tokens. Developers can also define custom API schemas, or blueprints, without the need for ABIs, decoding, RPC, or web3 knowledge to fetch blockchain data.
thirdweb Insight can be used to fetch:

all assets (ERC20, ERC721, ERC115) for a given wallet address
all sales of skins on your in-game marketplace
monthly protocol fees in the last 12 months
the total cost of all accounts created using ERC-4337
metadata for a given token (ERC20, ERC721, ERC115)
daily active wallets for your application or game
and so much more

To get started, sign up for a free thirdweb account and visit the thirdweb Insight documentation
Unmarshal​
Unmarshal is a leading decentralized multi-chain data network, enabling Web3 projects to access accurate, real-time blockchain data across 55+ chains (including Monad Testnet).
Leveraging AI-driven solutions, Unmarshal enhances data accessibility and insights for RWA, DePIN, AI Agents, DeFi, NFT, and GameFi platforms. Through robust APIs, notification services, and no-code indexers, it empowers dApps to deliver seamless user experiences while ensuring transparency, scalability, and innovation at the forefront of Web3 advancements.
To get started, visit the documentation or reach out at support@unmarshal.io.
Zerion​
The Zerion API can be used to build feature-rich web3 apps, wallets, and protocols with ease. Across all major blockchains, you can access wallets, assets, and chain data for web3 portfolios. Zerion's infrastructure supports all major chains!
To get started, visit the documentation.

