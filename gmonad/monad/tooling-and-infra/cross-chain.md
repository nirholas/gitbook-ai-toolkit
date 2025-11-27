# Cross-Chain

> Source: https://docs.monad.xyz/tooling-and-infra/cross-chain

## Documentation

On this page

Definitions​
At a high level, bridges offer the following features:
FeatureDescriptionArbitrary Messaging Bridge (AMB)Allows arbitrary messages to be securely relayed from a smart contract on chain 1 to a smart contract on chain 2.
AMB provides guarantees that messages delivered to chain 2 represent events finalized on chain 1.Token BridgeAllows user to lock native tokens or ERC20 tokens on chain 1 and mint claim tokens on chain 2.
Bridge maintains the invariant that, for each token minted on chain 2, there exists a corresponding token locked on chain 1.Liquidity LayerAllows user to turn in tokens on one chain and quickly redeem tokens on another chain,
typically relying on drawing on a pool of assets maintained on each side. Provides
greater immediacy relative to waiting for full finality of an AMB.Bridge AggregatorAggregates multiple liquidity layers or token bridges, potentially integrating
swapping as well so that users may receive a different token than the one they input.
Provider Summary​
MainnetTestnetProviderStatusDocsBridge TypeContract AddressesExplorerAxelar✅DocsAMB; Token BridgeSee contract addressesAxelarscanBungee✅DocsBridge AggregatorSee contract addressesChainlink CCIP✅DocsAMB; Token BridgeSee contract addressesCCIP ExplorerCircle CCTP✅DocsToken BridgeSee contract addressesdeBridge✅DocsAMB; Token BridgeSee contract addressesdeExplorerGarden✅DocsToken Bridge for BTCSee contract addressesGas.zip✅DocsToken BridgeSee contract addressesExplorerHyperlane✅DocsAMB; Token BridgeSee contract addressesHyperlane ExplorerJumper✅Bridge aggregatorLayerZero✅DocsAMB; Token BridgeSee contract addressesLayerZeroScanLi.fi✅DocsBridge aggregator SDKSee contract addressesLi.Fi ScanMayan✅DocsBridge AggregatorMayan ExplorerPolymer✅DocsAMBPolyScanRelay✅DocsLiquidity LayerTransactionsSocket✅DocsAMBSocketscanSquid✅DocsLiquidity LayerExplorer (Axelarscan)Stargate✅DocsLiquidity LayerWormhole / Portal✅DocsAMB; Token BridgeSee contract addressesWormholeScan✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't supportProviderStatusDocsBridge TypeContract AddressesExplorerAxelar✅DocsAMB; Token BridgeSee contract addressesAxelarscanChainlink CCIP✅DocsAMB; Token BridgeSee contract addressesCCIP ExplorerGarden✅DocsToken BridgeSee contract addressesHyperlane✅DocsAMB; Token BridgeSee contract addressesHyperlane ExplorerLayerZero✅DocsAMB; Token BridgeSee contract addressesLayerZeroScanPolymer✅DocsAMBSee contract addressesPolyScanWormhole✅DocsAMB; Token BridgeSee contract addressesWormholeScan✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't support
Provider Details​
Axelar​
Axelar is an interchain platform that connects blockchains to enable universal web3 transactions. By integrating with Axelar, applications built on Monad can now easily send messages and assets between the 49+ blockchains connected via Axelar.
To learn more about Axelar visit our docs and GitHub.
To view current transactions and live stats about the Axelar network, please visit the Axelarscan block explorer.
Bungee Exchange​
Bungee provides seamless swaps between any blockchain. With over
$24B in volume and trusted by major wallets and dApps, Bungee makes moving assets between networks
efficient, secure, and accessible to everyone, powered by the SOCKET.
To learn more, check out the docs.
Chainlink CCIP​
Chainlink Cross-Chain Interoperability Protocol (CCIP) is the standard for cross-chain interoperability. CCIP enables developers to build secure cross-chain apps that can transfer tokens, send messages, and initiate actions across blockchains.
Through the Cross-Chain Token (CCT) standard, CCIP enables token developers to integrate new and existing tokens with CCIP in a self-serve manner in minutes, without requiring vendor lock-in, hard-coded functions, or external dependencies that may limit future optionality. CCTs support self-serve deployments, full control and ownership for developers, zero-slippage transfers, and enhanced programmability via configurable rate limits and reliability features such as Smart Execution. CCIP is powered by Chainlink decentralized oracle networks (DONs)—a proven standard with a track record of securing tens of billions of dollars and enabling over $19 trillion in onchain transaction value.
Key CCIP developer tools:

CCIP official documentation: start integrating CCIP into your cross-chain application.
CCIP Token Manager: an intuitive front-end web interface for the deployment of new and management of existing CCTs by their developers, including no-code guided deployments and configuration tools.
CCIP SDK: a software development kit that streamlines the process of integrating CCIP, allowing developers to use JavaScript to create a token transfer frontend dApp.

Contract Addresses:

Router (testnet): 0x5f16e51e3Dcb255480F090157DD01bA962a53E54
Router (mainnet): 0x33566fE5976AAa420F3d5C64996641Fc3858CaDB

Circle CCTP​
Cross-Chain Transfer Protocol (CCTP) by Circle is a permissionless onchain utility that facilitates USDC transfers securely between supported blockchains via native burning and minting.
Circle created CCTP to improve capital efficiency and minimize trust assumptions when using USDC across blockchains.
CCTP enables developers to build multichain applications that allow users to perform 1:1 transfers of USDC securely across blockchains.
To get started, visit the Circle CCTP documentation
deBridge​
Build once, interoperate everywhere. deBridge enables secure, fast, and capital-efficient
connectivity across 20+ chains, so you can swap and transfer assets natively, trigger Cross-Chain
logic in seconds, all with chain abstraction and one unified protocol.
To get started, visit the deBridge documentation or check out the
app.
Garden​
Garden is transforming Bitcoin interoperability with its next-gen bridge. It is built by the renBTC team using an intents based architecture with trustless settlement, enabling cross-chain Bitcoin swaps in as little as 30 seconds with zero custody risk.
In its first year, Garden processed over $1 billion in volume—proving the market's demand for seamless, cost-effective Bitcoin bridging solutions.
Now, Garden is unlocking a new era of interoperability—supporting non-likewise assets, external liquidity, and a wallet-friendly API—to onboard the next wave of partners and users.
To get started, visit the documentation.
Gas.zip​
Gas.zip is a token bridge that enables seamless cross-chain asset transfers.
Contract Address:

Deployment: 0x9E22ebeC84c7e4C4bD6D4aE7FF6f4D436D6D8390

Hyperlane​
Hyperlane is a permissionless interoperability protocol for cross-chain communication. It enables message passing and asset transfers across different chains without relying on centralized intermediaries or requiring any permissions.
To get started, visit the Hyperlane documentation.
Hyperlane Explorer​
To view status of your cross chain transactions, please visit the Hyperlane Explorer.
LayerZero​
LayerZero is an omnichain interoperability protocol that enables cross-chain messaging. Applications built on Monad can use the LayerZero protocol to connect to 35+ supported blockchains seamlessly.
To get started with integrating LayerZero, visit the LayerZero documentation and provided examples on GitHub.
Li.fi​
LI.FI delivers a seamless solution for multi-chain payments and swaps through a single unified API and SDK. By combining access to all liquidity sources—including DEX aggregators, bridges, and solvers—it ensures comprehensive coverage across ecosystems. Its smart routing technology identifies the cheapest and fastest path for any payment or trade, optimizing efficiency and cost.
Additionally, LI.FI offers a plug-and-play widget that enables instant, user-friendly payment flows, making integration simple for developers and intuitive for end users.
To get started, visit Li.fi documentation
Mayan​
Mayan is a cross-chain swap protocol that enables fast and efficient token transfers across multiple blockchains.
Mayan provides seamless token bridging with optimized routing to ensure the best execution for cross-chain transfers.
To get started, visit the Mayan documentation or explore transactions on the Mayan Explorer.
Polymer​
Polymer is an interoperability protocol tailor made for multi-rollup applications. It places control in the hands of the builder, by combining cross-chain merkle proofs and a simple API to allow application builders to flexibly adopt Polymer's infrastructure for their own needs. Prove any action. Cross-chain.
To get started visit the Polymer documentation.
Relay​
Relay is the fastest and cheapest way to bridge and transact across chains, offering a multichain payments network that makes swapping and transacting across hundreds of blockchains delightfully simple. Since its launch in 2024, Relay has served over 5 million users, processed 50 million transactions, and facilitated more than $5 billion in volume across 85+ networks.
At its core, Relay combines two powerful components: instant, low-cost cross-chain intents powered by the Relay Protocol, and comprehensive DEX meta-aggregation spanning 85 chains (including Monad), ensuring users always get the best execution.
To get started, visit the Relay documentation
Socket​
SOCKET Protocol is the first chain-abstraction protocol, empowering
developers to build applications that seamlessly leverage multiple blockchains. It enables the
creation of chain-abstracted apps that interact across chains as if operating on a single one.
To get started, visit the SOCKET documentation.
Squid​
Squid creates unlimited access for anything in crypto. Squid can be used to seamlessly swap tokens from 100+ chains across including Monad.
Squid’s API, SDK, and Widgets offer ease of integration for projects building on any chain to enable cross-chain functionality in just 1 click.
Stargate​
Stargate Finance is a cross-chain bridge protocol that enables users
to transfer native assets between different blockchains with instant guaranteed finality using
unified liquidity pools.
To get started, visit the Stargate documentation.
Wormhole​
Wormhole is a cross-chain interoperability protocol that provides secure communication between blockchains. Monad uses two Wormhole products: Messaging and NTT (Native Token Transfers).
By integrating Wormhole, a Monad application can access users and liquidity on > 30 chains and > 7 different platforms.
Wormhole Messaging​
Wormhole Messaging is a generic messaging protocol that enables secure cross-chain communication and arbitrary data transfer between blockchains.
To get started with Wormhole Messaging:

Quickstart Guide
GitHub Examples

Wormhole NTT (Native Token Transfers)​
Wormhole NTT (Native Token Transfer) framework enables seamless cross-chain token movement without wrapping or liquidity pools, allowing projects to maintain token ownership and customize their cross-chain token deployment.
To get started with Wormhole NTT:

Quickstart Guide
GitHub Examples

For end-users looking to bridge assets, you can use Wormhole Portal Bridge.
For more information on integrating Wormhole, visit their documentation.
Contract Addresses for Monad Testnet:

Core: 0xBB73cB66C26740F31d1FabDC6b7A46a038A300dd
Relayer: 0x362fca37E45fe1096b42021b543f462D49a5C8df

