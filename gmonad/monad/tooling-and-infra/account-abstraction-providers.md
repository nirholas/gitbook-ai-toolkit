# Account Abstraction Providers

> Source: https://docs.monad.xyz/tooling-and-infra/wallet-infra/account-abstraction

## Documentation

On this page

Account Abstraction Providers provide bundler and paymaster services, enabling features like
sponsored transactions or payment via custom tokens.
Definitions​
ServiceDescriptionBundlerOperates a custom mempool for UserOperations; simulates and assembles bundles of UserOperationsPaymasterEnables sponsored transactions; enables users to pay for gas with a custom token
Provider Summary​
MainnetTestnetProviderStatusDocsSupported servicesHow to get startedAlchemy✅DocsGas Manager (aka Paymaster)
BundlerDashboardBiconomy✅DocsMEEGetting startedFastLane❓DocsPaymaster and BundlerDashboardOpenfort✅DocsPaymaster and BundlerQuickstartPimlico✅DocsPaymaster
BundlerTutorialSequence✅DocsRelayer: gasless, batched, parallelized transactionsQuickstartthirdweb✅DocsPaymaster and BundlerQuickstartZeroDev✅DocsMeta AA infrastructure for bundlers and paymastersDashboard✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't supportProviderStatusDocsSupported servicesHow to get startedAlchemy✅DocsGas Manager (aka Paymaster)
BundlerDashboardBiconomy✅DocsMEEGetting startedFastLane✅DocsPaymaster and BundlerDashboardGelato✅DocsPaymaster and BundlerQuickstartOpenfort✅DocsPaymaster and BundlerQuickstartPimlico✅DocsPaymaster
BundlerTutorialSequence✅DocsRelayer: gasless, batched, parallelized transactionsQuickstartthirdweb✅DocsPaymaster and BundlerQuickstartZeroDev✅DocsMeta AA infrastructure for bundlers and paymastersDashboard✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't support
Provider Details​
Alchemy​
Alchemy powers the #1 most used smart accounts today with account abstraction that eliminates gas fees and signing for users. Their accounts support ERC-4337, EIP-7702, and ERC-6900, a modular account standard co-authored with the Ethereum Foundation, Circle, and Trust Wallet.
To get started, sign up for an Alchemy account, visit the documentation, follow the quickstart guide. To learn more, check out their smart wallets and demo here.
Biconomy​
Biconomy is the most comprehensive smart account and execution infrastructure platform that enables seamless, user-friendly experiences across single or multiple chains. With Biconomy, developers can build superior onchain UX through gas abstraction, sessions, batching, and one-click signatures for complex actions on any number of networks.
To get started, visit the documentation.
FastLane​
FastLane is an MEV protocol for validators + apps with an integrated 4337 bundler, an on-chain task scheduler, and the first holistic LST.
To get started, vist the shMonad Documentation or try the shMonad bundler using the following example project.
Gelato​
Gelato provides Paymaster and Bundler services that enable sponsored transactions and Account Abstraction, allowing you to cover gas costs on behalf of users and enable seamless onchain experiences.
To get started, visit the documentation or follow the quickstart guide.
Openfort​
Openfort is a developer platform that helps projects onboard and and activates wallets. It does so by creating wallets with it’s SSS and passkeys,sending transactions via sponsored paymasters and session keys or directly using backend wallets for automated onchain actions.
To get started, visit the documentation or follow the quickstart guide.
Pimlico​
Pimlico is the world's most advanced ERC-4337 account abstraction infrastructure platform. Pimlico provides a suite of tools and services to help you build, deploy, and manage smart accounts on Ethereum and other EVM-compatible chains.
To get started, visit the documentation or follow the quickstart guide.
Sequence​
The Sequence
Transaction API is a unified
relayer that dispatches transactions on EVM chains with:

Gas sponsorship
Fee abstraction
Batching
Parallel processing

It manages nonces, estimates optimal gas, and resubmits transactions when needed, so you can focus
on your business logic. Sequence Builder offers a Gas Sponsorship feature
that allows project owners to easily sponsor gas for their users in web3 apps. By covering
transaction fees, users can enjoy a seamless experience without worrying about obtaining crypto
for fees which is seamlessly integrated with our suite of smart contract wallets.
To get started, visit the gas sponsorship docs.
thirdweb​
thirdweb offers a complete platform to leverage account abstraction.
Remove the clunky user experience of requiring gas & signatures for every onchain action:

Abstract away gas
Pre-audited account factory contracts
Built-in infra:
Sponsorship policies

To get started:

Sign up for a free thirdweb account
Visit Account Abstraction Documentation and Account Abstraction Playground

Zerodev​
ZeroDev is the most powerful smart account development platform. With ZeroDev, you can build Web3 experiences without gas, confirmations, seed phrases, and bridging.
To get started, visit the documentation or follow the quickstart guide.

