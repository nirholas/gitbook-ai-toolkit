# Wallet Infrastructure

> Source: https://docs.monad.xyz/tooling-and-infra/wallet-infra/

## Documentation

On this page

Summary​
Monad features excellent support for developers looking to refine their users' experience
by utilizing modular wallet infrastructure.
These pages survey the supported infrastructure:

Embedded Wallets
Account Abstraction Providers
Smart Account Implementations

The landscape can be confusing, even to an experienced developer; therefore we include a
rough topology below.
Background​
Wallets allow users to store private keys and sign transactions. The basic setup involves
separation between the wallet and the application: the application presents a transaction
to the wallet for signing, and the wallet submits the transaction to the network, paying
for inclusion and execution with native tokens deducted from its balance.
However, increasingly, developers wish to customize their users' experience, for example by
sponsoring gas for their users or by allowing users to pay fees in an alternate currency. Other
developers want to embed the "wallet" into the app and give the app signing power over that
wallet, so that users don't have to sign a transaction with each action that they take.
Modular wallet infrastructure enables these and other features.
A number of providers are solving for this experience. To simplify understanding of the options,
we suggest the following two-dimensional matrix:
FreestandingEmbeddedEOASee Simple WalletsSee Embedded Wallets.Typically utilizes key sharding, e.g. using MPC, SSS, or TEESmart AccountUtilizes Account Abstraction, i.e. developer needs to choose:AA ProvidersSmart AccountsSee Embedded Wallets and look for "Embedded Smart Accounts"
EOA-based approach​
(EOA, freestanding) is the traditional wallet experience powered by browser extension wallets,
mobile wallets, and hardware wallets. It involves a single private key stored within the wallet.
See Wallets for a survey.
(EOA, embedded): typically uses cryptographic techniques (MPC, SSS, etc) to shard the
signing keys, implementing additional authorization or access control features off-chain, while
presenting to the blockchain as an ordinary EOA. See Embedded Wallets
for a list of providers.
Smart account (account abstraction) approach​
Account Abstraction means using smart contracts in place of simple EOAs. The smart contract
implements the authorization / access control logic, i.e. the logic is on chain.
Historically, smart contracts could not pay for their own transaction costs (although EIP-7702
introduces an exception to this rule). Therefore, the account abstraction path requires
users to sign pseudo-transactions (UserOperations) and submit them to a custom mempool.
Then, a service called the Bundler/Relayer submits UserOperations in a normal Monad transaction
and pays for the execution.
Thus, there are at least two considerations for developers building with smart accounts:

the Bundler/Relayer service; see Account Abstraction Providers
for a list
the Smart Account Implementation

Some embedded wallet providers support smart accounts. See Embedded Wallets
and look out for "Embedded Smart Accounts".

