# Oracles

> Source: https://docs.monad.xyz/tooling-and-infra/oracles

## Documentation

On this page

Oracles make off-chain data accessible on chain.
Definitions​
TermDescriptionPush oracleProvider regularly pushes price data to the oracle contract on chainPull (on-demand) oracleUser triggers price data update while calling a smart contractCustom oracleA custom calculatorVRF (Verifiable Random Function)Provides random numbers on chain
Provider Summary​
MainnetTestnetProviderStatusDocsContract addressesLive dataSupport notesChainlink✅DocsSee contract addressesLive data
Push oracle (Price Feeds)
Pull oracle (Data Streams)
Chronicle✅DocsSee contract addressesPush oracle; custom oracleseOracle✅DocsDashboardPush oracleOrochi✅DocsSee contract addresseszkOracle;
VRFPyth✅DocsSee contract addressesLive dataPull oracle;
VRFRedstone✅DocsSee contract addressesLive dataPush oracle;
pull oracleStork✅Docs
See contract addresses
Addresses; APIs; Asset ID Registry
Pull oracleSupra✅DocsSee contract addressesLive dataPush oracle;Pull oracle;dVRFSwitchboard✅Docs
See contract addresses
More info: Deployments
Pull oracle;
Oracle aggregator;
VRF✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't supportProviderStatusDocsContract addressesLive dataSupport notesChainlink✅DocsPrice Feeds [push oracle]:
BTC / USD: 0x2Cd9D7E85494F68F5aF08EF96d6FD5e8F71B4d31
ETH / USD: 0x0c76859E85727683Eeba0C70Bc2e0F5781337818
LINK / USD: 0x4682035965Cd2B88759193ee2660d8A0766e1391
USDC / USD: 0x70BB0758a38ae43418ffcEd9A25273dd4e804D15
USDT / USD: 0x14eE6bE30A91989851Dc23203E41C804D4D71441
general reference 
Data Streams [pull oracle]:
Data stream verifier proxy address: 0xC539169910DE08D237Df0d73BcDa9074c787A4a1
Live data
Push oracle (Price Feeds)
Pull oracle (Data Streams)
Chronicle✅DocsAddress referenceDashboard (toggle dev mode)Push oracle; custom oracleseOracle✅Docs
Address reference
Update conditions: 0.5% deviation & 24h heartbeat
DashboardPush oracleGelato VRF✅DocsVRFOrochi✅Docs
Orocle [oracle] addresses
Orand [VRF] addresses
zkOracle;
VRFPyth✅Docs
Price feeds: 0x2880aB155794e7179c9eE2e38200202908C17B43
Beta price feeds (incl MON/USDC): 0xad2B52D2af1a9bD5c561894Cdd84f7505e1CD0B5
Entropy: 0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320
Live data
Beta live data (includes MON / USDC)Pull oracle;
VRFRedstone✅Docs
Push oracle addresses
Update conditions for all: 0.5% deviation & 6h heartbeat
Live dataPush oracle;
pull oracleStork✅Docs
Pull oracle (includes MON/USD): 0xacC0a0cF13571d30B4b8637996F5D6D774d4fd62
Addresses; APIs; Asset ID Registry
Pull oracleSupra✅Docs
Push oracle: 0x6Cd59830AAD978446e6cc7f6cc173aF7656Fb917
(5% deviation threshold & 1h update frequency;
Supported pairs: BTC/USDT, SOL/USDT, ETH/USDT)
Pull oracle: 0x443A0f4Da5d2fdC47de3eeD45Af41d399F0E5702
dVRF: 0x6D46C098996AD584c9C40D6b4771680f54cE3726
Live dataPush oracle;Pull oracle;dVRFSwitchboard✅Docs
Pull oracle: 0x33A5066f65f66161bEb3f827A3e40fce7d7A2e6C
More info: Deployments
Live dataPull oracle;
Oracle aggregator;
VRF✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't support
Provider Details​
Chainlink​
Chainlink Data Streams​
Chainlink Data Streams deliver low-latency market data offchain, which can be verified onchain. This approach provides decentralized applications (dApps) with on-demand access to high-frequency market data backed by decentralized, fault-tolerant, and transparent infrastructure.
Traditional push-based oracles update onchain data at set intervals or when certain price thresholds are met. In contrast, Chainlink Data Streams uses a pull-based design that preserves trust-minimization with onchain verification.
To get started, check out the documentation.
Chainlink Price Feeds​
Chainlink Price Feeds are the quickest way to connect your smart contracts to real-world data such as asset prices.
Data Feeds aggregate many data sources and publish them onchain using a combination of the Decentralized Data Model and Offchain Reporting.
To get started, check out the documentation.
Chronicle​
Chronicle's decentralized oracle network was originally built within MakerDAO for the development of DAI and is now available to builders on Monad.

Data Feeds: Builders can choose from 90+ data feeds, including crypto assets, yield rates, and RWAs. Chronicle's data is sourced via custom-built data models, only utilizing Tier 1 sources.
Transparency & Integrity: Chronicle's oracle network is fully transparent and verifiable via the Chronicle dashboard. Users can cryptographically challenge the integrity of every oracle update using the 'verify' feature. Data is independently sourced by a community of Validators including Gitcoin, Etherscan, Infura, DeFi Saver, and MakerDAO.
Gas Efficiency: Pioneering the Schnorr-based oracle architecture, Chronicle's oracles use 60-80% less gas per update than other oracle providers. This lowest cost per update allows Push oracle updates to be made more frequently, enabling granular data reporting.
Every oracle implementation is customized to fit your needs. Implement one of our existing data models or contact Chronicle to develop custom oracle data feeds via Discord.

Developers can dive deeper into Chronicle Protocol's architecture and unique design choices via the docs.
eOracle​
eOracle is an open infrastructure platform that empowers developers to build secure blockchain oracles backed by Ethereum's battle-tested security model. eOracle creates a foundation for specialized data services that combine deep domain expertise with unmatched cryptoeconomic security.
To get started, visit the eOracle documentation.
Orochi​
Orochi Network is the world's first Verifiable Data Infrastructure, addressing scalability, privacy, and data integrity challenges.
To get started, visit the Orochi documentation.
Pyth​
The Pyth Network is one of the largest first-party oracle networks, delivering real-time data across a number of chains. Pyth introduces a low-latency pull oracle design. Data providers push price updates to Pythnet every 400 ms. Users pull aggregated prices from Pythnet onto Monad when needed, enabling everyone in the onchain environment to access that data point most efficiently.
Pyth Price Feeds features:

400ms latency
First-party data sourced directly from financial institutions
Price feeds ranging from crypto, stocks, FX, and metals

See also: beta price feeds (testnet MON/USD is a beta price feed)


Available on many major chains

Contract Addresses for Monad Testnet:

Price feeds: 0x2880aB155794e7179c9eE2e38200202908C17B43

Beta price feeds: 0xad2B52D2af1a9bD5c561894Cdd84f7505e1CD0B5 (testnet MON/USD is a beta price feed)


Entropy: 0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320

noteThe testnet MON/USD price feed is currently a beta feed on Pyth Network. To use the MON/USD feed, integrate the beta price feed contract instead of the primary price feed contract.To get the MON/USD price feed offchain, use the beta hermes endpoint: https://hermes-beta.pyth.network
Redstone​
RedStone is the fastest-growing modular oracle, specializing in yield-bearing collateral for lending markets, such as LSTs, LRTs and BTCFi.
To get started, visit the Redstone documentation.
Stork​
Stork is an oracle protocol that enables ultra low latency connections between data providers and both on and off-chain applications. The most common use-case for Stork is pulling and consuming market data in the form of real time price feeds for DeFi.
Stork is implemented as a pull oracle. Stork continuously aggregates, verifies, and audits data from trusted publishers, and makes that aggregated data available at sub-second latency and frequency. This data can then be pulled into any on or off-chain application as often as needed.
To learn more about how Stork works, visit Core Concepts and How It Works.
Supra​
Supra provides VRF and decentralized oracle price feeds (push and pull based) that can be used for onchain and offchain use-cases such as spot and perpetual DEXes, lending protocols, and payments protocols.
To get started, visit the Supra documentation
Switchboard​
Switchboard is a permissionless oracle protocol that enables developers to bring any off-chain or cross-chain data onto Monad through verifiable, ultra-low-latency feeds.
Switchboard features:

Fully permissionless feed creation via the Feed Builder: deploy custom oracles in minutes
Switchboard Surge: Low-latency data feeds with sub-10 ms updates for high-performance applications
Enterprise-grade reliability
Aggregator: access multiple oracle sources (like the ones on this page) in a single transaction
Data Feed Variables: bring API-gated or confidential data on-chain without exposing API keys
Customizable feeds: adjust feed parameters (confidence intervals, deviation thresholds, and more) to your dapp's needs
Decentralized oracle network secured by globally distributed validator set
Verifiable Randomness: generate secure, verifiable random numbers for games, lotteries, and more
Supports any data type: prices, prediction markets, sports, weather, RWAs, etc

Contract Address for Monad Mainnet: 0x33A5066f65f66161bEb3f827A3e40fce7d7A2e6C
For more details, check out Switchboard's detailed EVM documentation.

