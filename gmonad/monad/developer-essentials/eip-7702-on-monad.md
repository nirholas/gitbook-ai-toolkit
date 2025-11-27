# EIP-7702 on Monad

> Source: https://docs.monad.xyz/developer-essentials/eip-7702

## Documentation

On this page

Summary​
EIP-7702
is supported on Monad with the same workflow as in Ethereum: users sign a message
authorizing the delegation to a specific account, which they or someone else can submit
using transaction type 0x04. After that occurs, the EOA becomes "delegated", i.e. it
can be called like a smart contract account with code equal to the account it has delegated to.
EIP-7702-delegated accounts behave the same on Monad as on Ethereum in most cases.
The two main nuances are:

If an EOA is EIP-7702-delegated, its balance cannot be lowered below 10 MON. (If the
delegation is removed, dipping below 10 MON is allowed.) Details
When the EOA is treated like a smart contract, that code cannot call CREATE or CREATE2.
Details

EIP-7702 Primer​
EIP-7702 allows Externally Owned Accounts (EOAs)
to add code to themselves, granting themselves the ability to add new capabilities previously
reserved for smart contract accounts, such as transaction batching, gas sponsorship, and
alternative authentication.
To do this, the EOA signs an authorization designating a specific address as the source
of its code. EIP-7702 introduces a new transaction type (type 0x04) that submits this
authorization. The authorization can be submitted by the EOA themselves, or by anyone else.
EIP-7702 enables account abstraction directly on an EOA. It is an extension of EIP-4337,
which introduced standards for smart contract wallets with flexible validation logic, but which
had to assume a separate UserOp mempool and bundler infrastructure for submitting transactions.
In Ethereum's account-based model, there are two separate roles - "fee payer" (transaction
submitter, i.e. who pays for gas to execute a transaction) and "asset owner" (spend authorizer,
i.e. who holds keys with the power to spend from a balance). Originally, EOAs played both roles.
Under EIP-4337, the roles were split - a smart contract wallet holds title to assets (and has
its own logic for validating that spend was authorized), but fees must still be paid by an
EOA, hence the roles are definitively split.
With EIP-7702, EOAs are allowed to have code, thus allowing the same account to play both roles
again.
In essence, EIP-7702 makes it possible for today's EOAs to gain smart wallet-like powers
such as multisig, social recovery, session keys, and gas sponsorship without abandoning their
current accounts, bridging the gap between the old EOA model and the future of full account
abstraction.
EIP-7702 on Monad​
EIP-7702-delegated accounts behave the same on Monad as on Ethereum in most cases.
The two main nuances are:

If an EOA is EIP-7702-delegated, its balance cannot be lowered below 10 MON. (If the
delegation is removed, dipping below 10 MON is allowed.)
When the EOA is treated like a smart contract, that code cannot call CREATE or CREATE2.

Delegated EOAs can't dip below 10 MON​
In Monad, the Reserve Balance rules carve out a buffer of 10 MON
for consensus-time balance checks. (This is described in greater detail in
Reserve Balance, but the basic reason is that under asynchronous execution,
consensus votes on blocks with a delayed view of state. To defend against DOS attacks where
consensus would mistakenly include transactions from empty accounts, consensus and execution
pre-agree on a set of rules that carve out a budget (10 MON) for consensus to pay gas fees of inflight
transactions. Execution protects that budget by reverting if the balance would dip below 10 MON by an amount greater than the transaction's max gas fee.)
An exception is made to this execution-time policy for undelegated EOAs where a transaction
hasn't been seen from this EOA in several blocks. That exception is what allows undelegated EOAs to
submit transactions that would cause their balance to dip below 10 MON by amounts greater than the transaction's max gas fee.
However, this exception can't be made for EIP-7702-delegated accounts. Delegation
breaks the invariant that an EOA's balance can only be reduced by transactions signed by
that EOA. There is not a reliable way to be sure (at the time of consensus) that another inflight
transaction hasn't spent funds from an EIP-7702-delegated account, therefore the exception made
for undelegated accounts doesn't apply to delegated accounts.
An delegated account may be emptied by undelegating first.
Delegated contract code cannot call CREATE/CREATE2​
There is another difference: when contract code is executing in the context of an
EIP‑7702‑delegated EOA (for example, because a contract CALLs that EOA’s address),
the CREATE and CREATE2 opcodes are not permitted.
Any attempt to execute CREATE or CREATE2 in such a frame causes that call frame to revert,
and the caller (if any) observes the call as failed
(the CALL/DELEGATECALL/CALLCODE returns 0).
This prevents delegated code from changing the EOA’s nonce in ways that would make it
difficult to statically validate transactions from that account.
In contrast, normal contract‑creation transactions sent from a delegated
EOA (transactions with no to field, where the transaction data is treated as init code)
are allowed and behave as on Ethereum.
Other than those differences, EIP-7702-delegated accounts behave normally with respect to both
ordinary transactions sent by the EOA, and transactions that treat the EOA as a
smart contract.
FAQ​
What does an EIP-7702 (set code transaction) look like?An EIP-7702 transaction is an EIP-2718
transaction with TransactionType 0x04.This transaction type is only used to set code; once the code is set for an EOA, subsequent
transactions will most likely use the default transaction type (TransactionType 0x02;
EIP-1559) transactions to interact with the EOA.Here is an example of an EIP-7702 transaction in a block explorer:

Is it necessary for the EIP-7702 type transaction to be initiated by the EOA itself?No, the EOA can sign an "authorization tuple" which can then be used by the sponsoring
entity to send the transaction. This will allow EOAs to behave like smart contracts
without any funds for gas!
How can I find out to which address EOA is currently delegating to?On successful delegation to a smart contract, the following code is deployed at the EOA's
address.0xef0100 (3 bytes) + smart_contract_address (20 bytes)Example: If 0xabc... (EOA) delegates to 0x493... (smart contract), then code at
0xabc... (EOA) is 0xef0100493...Thus, you may determine the delegated address by inspecting the code.
What if the EOA is pointing to another EOA which is also pointing to a smart contract?The chain of delegation is not followed; only the immediate code that the first EOA is
pointing to is used.
How do I clear the delegation on an EOA?Initiate a 0x04 type transaction from the EOA with 0x000... (dead address) as the new
delegated account.
Does the delegation expire?No, the delegation remains valid in perpetuity unless another 0x04 transaction is sent
changing the delegation to a different (or null) account.
Is EIP-7702 compatible with ERC-4337?Yes; after delegating with EIP-7702, any EOA may behave like an EIP-4337 smart account.
Simply initiate a transaction of type 0x04 while pointing to an address containing code
for the 4337-compatible smart account.
What happens if the EOA is pointing to a precompile address for code?When CALL, STATICCALL, DELEGATECALL and CALLCODE opcodes are called with enough gas,
the opcodes proceed with execution as if the EOA has no code.
Can you give me an example of submitting an EIP-7702 transaction using viem?import { createWalletClient, http, parseEther } from 'viem'import { monadTestnet } from 'viem/chains'import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
const walletClient = createWalletClient({  account,  chain: monadTestnet,  transport: http(),})
const authorization = await walletClient.signAuthorization({  account,  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'})
const hash = await walletClient.sendTransaction({  authorizationList: [authorization],  data: '0xdeadbeef',  to: walletClient.account.address,})

## Code Examples

```prism
import { createWalletClient, http, parseEther } from 'viem'import { monadTestnet } from 'viem/chains'import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount('0x...')
const walletClient = createWalletClient({  account,  chain: monadTestnet,  transport: http(),})
const authorization = await walletClient.signAuthorization({  account,  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'})
const hash = await walletClient.sendTransaction({  authorizationList: [authorization],  data: '0xdeadbeef',  to: walletClient.account.address,})
```

