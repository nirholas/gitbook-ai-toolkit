# Embedded Wallets

> Source: https://docs.monad.xyz/tooling-and-infra/wallet-infra/embedded-wallets

## Documentation

On this page

Background​
Some developers want to "embed" a wallet into their application. Here are a few possible reasons
they might want to do this:

to allow users to sign in with email or another social sign-in method
to allow users to take actions within the app without signing a new transaction each time.

Generally speaking, embedded wallet services provide this by utilizing advanced cryptographic
techniques to shard keys. Some keys are stored user-side while others are stored on
the application developer's server or the embedded wallet provider's server.
This page attempts a toplogy of authentication and key management features over the set of
providers supporting Monad.
Authentication Features​
FeaturesDescriptionPasskey sign-inAuthentication with WebAuthn (passkey)Social sign-inAuthentication with social accounts (google, X, etc)Email sign-inAuthentication with OTP via emailSMS sign-inAuthentication with OTP via SMS
Key Management Features​
FeaturesDescriptionMPCMulti-party computationSSSShamir's Secret SharingTEEStorage of private keys in a cloud-based Trusted Execution Environment, like AWS Nitro EnclavesTSSThreshold Signature SchemeEmbedded walletA wallet interface local to a website or mobile app, utilizing browser session keys for signingServer-delegated actionsAllow app to request permission to sign on the user's behalfSession keysScoped keys that grant access only for specific apps, useful for bots/AI agents
Provider Summary​
MainnetTestnetProviderStatusDocsSupported servicesSecurity MethodHow to get startedAlchemy⌛️DocsEmbedded wallets
Auth: passkey, social, email sign-inQuickstartCoinbase Developer Platform (CDP)✅DocsEmbedded wallets
Auth: email/social/SMSDevice-based secure enclavesQuickstartDynamic✅DocsEmbedded wallets
Auth: passkey, email/social/SMS sign-inTEE; TSS-MPC (just added)Get startedMetamask Delegation Toolkit⌛️DocsEmbedded Smart Accounts
Auth: multisig, external EOA + passkey
Delegations for automating actionsQuickstartOpenfort✅DocsEmbedded wallets, Backend wallets, Ecosystem wallets
Auth: passkeys, social, emailSSSQuickstartPara✅DocsEmbedded wallets; robust policy engine for sessions
Auth: email and phone, social, SMS sign-inMPC + DKGQuickstartPhantom❓DocsEmbedded wallets (Web SDK & Native Mobile SDK)
Auth: Google sign-inSSSQuickstartPrivy✅DocsEmbedded wallets, server wallets, server-delegated actions
Auth: passkey, social, email, SMSTEE + SSSQuickstartReown (formerly WalletConnect)⌛️DocsPopular UI component for selecting a wallet
Embedded wallet with social/email sign-inOverviewSequence✅DocsEmbedded wallets,
ecosystem walletsAuth: Passkey, Google, Apple, Twitter, email, Facebook, Twitch, Epic Games, Playfab, Stych, Standard OAuthTEE; Sandboxed Smart SessionsEcosystem quickstart
Embedded quickstartthirdweb✅DocsEmbedded wallets
Auth: passkey, social, email, SMS, OIDC, or generic authQuickstartTurnkey✅DocsEmbedded wallet, policy engine, delegated access, signing automation, sessions
Server-side SDKs for auth, wallet management, and policies
Auth: passkey, social, email, SMS loginTEEQuickstartWeb3Auth⌛️DocsEmbedded wallet
Auth: passkey, social, email, SMSMPC-SSS/TSSQuickstart✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't supportProviderStatusDocsSupported servicesSecurity MethodHow to get startedAlchemy✅DocsEmbedded wallets
Auth: passkey, social, email sign-inQuickstartCoinbase Developer Platform (CDP)✅DocsEmbedded wallets
Auth: email/social/SMSDevice-based secure enclavesQuickstartDynamic✅DocsEmbedded wallets
Auth: passkey, email/social/SMS sign-inTEE; TSS-MPC (just added)Get startedMetamask Delegation Toolkit✅DocsEmbedded Smart Accounts
Auth: multisig, external EOA + passkey
Delegations for automating actionsQuickstartOpenfort✅DocsEmbedded wallets, Backend wallets, Ecosystem wallets
Auth: passkeys, social, emailSSSQuickstartPara✅DocsEmbedded wallets; robust policy engine for sessions
Auth: email and phone, social, SMS sign-inMPC + DKGQuickstartPhantom✅DocsEmbedded wallets (Web SDK & Native Mobile SDK)
Auth: Google sign-inSSSQuickstartPrivy✅DocsEmbedded wallets, server wallets, server-delegated actions
Auth: passkey, social, email, SMSTEE + SSSQuickstartReown (formerly WalletConnect)✅DocsPopular UI component for selecting a wallet
Embedded wallet with social/email sign-inOverviewSequence✅DocsEmbedded wallets,
ecosystem walletsAuth: Passkey, Google, Apple, Twitter, email, Facebook, Twitch, Epic Games, Playfab, Stych, Standard OAuthTEE; Sandboxed Smart SessionsEcosystem quickstart
Embedded quickstartthirdweb✅DocsEmbedded wallets
Auth: passkey, social, email, SMS, OIDC, or generic authQuickstartTurnkey✅DocsEmbedded wallet, policy engine, delegated access, signing automation, sessions
Server-side SDKs for auth, wallet management, and policies
Auth: passkey, social, email, SMS loginTEEQuickstartWeb3Auth✅DocsEmbedded wallet
Auth: passkey, social, email, SMSMPC-SSS/TSSQuickstart✅ = supported, ⌛️ = in progress, ❓ = unknown, ❌ = won't support
Providers Offering Subsidized Usage​
These WaaS providers are subsidizing usage on Monad Testnet:
ProviderHow to accessPrivySign up, then email the Privy team at monad@privy.ioParaSign up via the Developer Portal and reach out to the team at ops@getpara.comTurnkeyTurnkey is free for developers building on Monad Testnet. All you need to do is sign up!
Provider Details​
Alchemy​
Account Kit is a complete solution for account abstraction. Using Account Kit, you can create a smart contract wallet for every user that leverages account abstraction to simplify every step of your app's onboarding experience. It also offers Gas Manager and Bundler APIs for sponsoring gas and batching transactions.
To get started, sign up for an Alchemy account, visit the documentation, follow the quickstart guide or check out the demo here.
Alchemy helps you to replace 3rd-party pop-up wallets with native in-app auth. Drop in branded sign-in modals for email, passkeys, and social logins with plug-n-play components.
To get started, sign up for an Alchemy account, visit the documentation, follow the quickstart guide. To further streamline UX with no gas fees or signing for users, see Alchemy's AA infra offering and a demo here.
Coinbase Developer Platform​
Coinbase Developer Platform allows developers to
build next-gen on-chain apps. CDP simplifies development by providing services for creating smart
wallets, processing payments, and integrating crypto into existing apps.
With CDP Embedded Wallets, your users can access the full power of blockchains through familiar
authentication methods like email and social logins (no seed phrases, browser extensions, or
pop-ups required).
To get started, visit the documentation
or follow the quickstart guide.
Dynamic​
Dynamic offers smart and beautiful login flows for crypto-native users, simple onboarding flows for everyone else, and powerful developer tools that go beyond authentication.
To get started, visit the documentation or follow the quickstart guide.
MetaKeep​
MetaKeep is the #1 self-custody infra for users & AI. Onboard 300x more users in 1 API call, 5 mins.
To get started, setup an onboarding call with the team.
Metamask Delegation Toolkit​
The MetaMask Delegation Toolkit is a Viem-based collection of tools for integrating embedded smart contract wallets, known as MetaMask smart accounts, into dapps. Developers can create and manage MetaMask smart accounts that delegate specific permissions, such as spending limits or time-based access, to other accounts.
To get started, visit the documentation or follow the quickstart guide.
Para​
infoPara is free for developers building on Monad Testnet!Sign up via the Developer Portal and reach out to the team via the below email.ops@getpara.com
Para is the easiest and most secure way to onboard all your users and support them throughout their crypto journey. We support projects throughout their growth, ranging from personal projects to many of the most trusted teams in crypto and beyond.
Para's cross-app embedded wallets work universally across apps, chains, and ecosystem, so whether users start transacting on EVM, Solana, or Cosmos, they can onboard once and transact forever, all with the same wallet.
To get started, visit the documentation or follow the quickstart guide.
Phantom​
Phantom is the world's leading crypto wallet for managing digital assets and accessing decentralized applications.
Phantom embedded wallets enable seamless, seedless onboarding with in-app, non-custodial access--no app switching or seed phrases required.
To get started, visit the documentation or follow the Introduction guide.
Privy​
infoPrivy is subsidizing all Monad Testnet usage!For more details reach out to the Privy team via the below email.monad@privy.io
Privy helps you onboard any user to crypto no matter how familiar they are with the space. Power flexible, powerful wallets under the hood for any application, securely.
To get started, visit the documentation or follow the quickstart guide.
Reown​
Reown gives developers the tools to build user experiences that make digital ownership effortless, intuitive, and secure.
AppKit​
AppKit is a powerful, free, and fully open-source SDK for developers looking to integrate wallet connections and other Web3 functionalities into their apps on any EVM and non-EVM chain. In just a few simple steps, you can provide your users with seamless wallet access, one-click authentication, social logins, and notifications—streamlining their experience while enabling advanced features like on-ramp functionality, in-app token swaps and smart accounts.
To get started, visit the documentation or follow the quickstart guide.
Sequence​
Sequence provides the industry gold standard in robust open-source,
non-custodial Embedded
and Ecosystem
Wallets.Sequence is the originator of non-custodial smart contract wallets, and authors of
ERC-1271 and ERC-6492.
Embedded and Ecosystem Wallets enable seamless onboarding with user-friendly
email, social, passkey, and guest account logins. Invisible onchain transactions; secure and
compliant non-custodial sovereignty; and cross-platform integrations with SDKs for Unity, Unreal,
Web, and mobile. Fully customizable for developers and ecosystems.
To get started, visit the Ecosystem Wallet Quickstart.
thirdweb​
thirdweb provides client-side SDKs for user onboarding, identity and transactions.

Onboard new users to your apps with every wallet & login method
create a complete picture of all your users via user analytics & identity linking
facilitate onchain transactions via onramps, swaps & bridging

To get started:

Sign up for a free thirdweb account
Visit Connect Documentation and Connect Playground

Turnkey​
infoTurnkey is free for developers building on Monad Testnet!
Turnkey is secure, flexible, and scalable wallet infrastructure. Create millions of embedded wallets, eliminate manual transaction flows, and automate onchain actions - all without compromising on security.
To get started, visit the documentation or follow the quickstart guide.
Web3Auth​
Web3Auth simplifies Web3 access with social logins, customisable wallet UI, and advanced security, with non custodial MPC wallet management.
To get started, visit the documentation or follow the quickstart guide.

