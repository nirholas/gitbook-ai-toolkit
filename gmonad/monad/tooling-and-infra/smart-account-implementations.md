# Smart Account Implementations

> Source: https://docs.monad.xyz/tooling-and-infra/wallet-infra/smart-accounts

## Documentation

On this page

Background​
Under ERC-4337, smart wallets perform authentication (signature verification) inside of a smart
contract.  Depending on the signature scheme, signing may be done locally (on the user's computer)
or in a remote environment (e.g. TEEs).
This page lists notable smart account implementations deployed to Monad.
Provider Summary​
MainnetTestnetProviderStatusDocsSupported servicesHow to get startedBiconomy✅DocsNexus: Smartest & most gas-efficient smart account
External Wallets
Auth: privy, turnkey; session keysQuickstartPimlico✅Docspermissionless.js, a flexible SDK for interfacing with various smart accounts, bundlers/paymasters, and signers.TutorialZeroDev✅DocsSmart contract accounts
Session keys with several options for signature schemes (ECDSA, Passkey, Multisig), policies, and actions.Quickstart✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't supportProviderStatusDocsSupported servicesHow to get startedBiconomy✅DocsNexus: Smartest & most gas-efficient smart account
External Wallets
Auth: privy, turnkey; session keysQuickstartPimlico✅Docspermissionless.js, a flexible SDK for interfacing with various smart accounts, bundlers/paymasters, and signers.TutorialZeroDev✅DocsSmart contract accounts
Session keys with several options for signature schemes (ECDSA, Passkey, Multisig), policies, and actions.Quickstart✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't support
Provider Details​
Biconomy​
Biconomy is the most comprehensive smart account and execution infrastructure platform that enables seamless, user-friendly experiences across single or multiple chains. With Biconomy, developers can build superior onchain UX through gas abstraction, sessions, batching, and one-click signatures for complex actions on any number of networks.
To get started, visit the documentation.
Pimlico​
Pimlico is the world's most advanced ERC-4337 account abstraction infrastructure platform. Pimlico provides a suite of tools and services to help you build, deploy, and manage smart accounts on Ethereum and other EVM-compatible chains.
To get started, visit the documentation or follow the quickstart guide.
Zerodev​
ZeroDev is the most powerful smart account development platform. With ZeroDev, you can build Web3 experiences without gas, confirmations, seed phrases, and bridging.
To get started, visit the documentation or follow the quickstart guide.

