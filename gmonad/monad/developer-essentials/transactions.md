# Transactions

> Source: https://docs.monad.xyz/developer-essentials/transactions

## Documentation

On this page

Summary​

Same address space and transaction format/fields as Ethereum, so the same wallet software is
supported.
Transaction types 0 ("legacy"), 1 ("EIP-2930"), 2 ("EIP-1559"), and 4 ("EIP-7702") are currently supported.
Pre-EIP-155 transactions are allowed on the protocol
level, as in Ethereum and many other EVM-compatible blockchains. As a result, users are
discouraged from using an Ethereum address that had previously sent pre-EIP-155 transactions.

Address space​
Same address space as Ethereum (last 20 bytes of ECDSA public key)
Transaction format​
Same as Ethereum. Monad transactions use
the same typed transaction envelope introduced in
EIP-2718, encoded with
RLP.
Transaction types​
These transaction types
are supported:

Type 0 ("legacy")
Type 1 ("EIP-2930")
Type 2 ("EIP-1559"; the default in Ethereum)
Type 4 ("EIP-7702") (see EIP-7702 on Monad)

These types are not supported:

Type 3 ("EIP-4844")

Access lists​
Access lists (EIP-2930) are supported but not required.
Transactions without a chain_id​
EIP-155 introduced a transaction standard that includes a
chain id, to prevent transactions from one blockchain from being replayed on another one.
Transactions on Monad should always set the chain id, except for one very specific corner case:
noteThe corner case: Some standard smart contracts such as ERC-1820 use a keyless deployment method
(also known as Nick's method) that exploits replayability, as discussed
here. In this method, a transaction is
submitted on Ethereum but is intended to be replayed on other chains in order to have the contract
deployed at the same address on other blockchains.
In order to support this use case, pre-EIP-155 transactions are still allowed on the protocol level
(i.e. according to consensus rules) on Monad. This makes Monad consistent with most blockchains
including Ethereum. (Blockchains that have tried disallowing pre-EIP-155 transactions at the
protocol level have typically ended up reversing course, e.g.
Celo.)
However, because of this, please heed the following warning:
warningBecause replay of pre-EIP-155 transactions is allowed, it is discouraged to send funds to an
Ethereum address that had previously sent pre-EIP-155 transactions.

