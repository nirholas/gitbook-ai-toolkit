# Reserve Balance

> Source: https://docs.monad.xyz/developer-essentials/reserve-balance

## Documentation

On this page

Introduction​
The Reserve Balance mechanism is a set of light constraints - at consensus time on which
transactions can be included, and at execution time on which transactions don't revert - which
allow Monad to simultaneously support asynchronous execution
and EIP-7702.
The Reserve Balance mechanism is designed to preserve safety under asynchronous execution
without interfering with normal usage patterns. Most users and developers need not worry
about the Reserve Balance constraints, however we provide the details here for those
encountering corner cases.
Summary​
Asynchronous execution means that nodes achieve consensus on a block proposal prior to executing
the transactions in that block. Execution is required to be completed in the next k (delay
factor) blocks. (Currently k=3.)
Because consensus operates on a k-block delayed view of the global state, it is necessary
to adjust the consensus and execution rules slightly to allow consensus to safely build
and validate blocks that include only transactions whose gas costs can be paid for.
Monad introduces the Reserve Balance mechanism to allow consensus and execution
to collaborate across a multi-block lag to ensure that all EOAs must have enough MON
in their account to pay for gas for any transaction included in the blockchain.
Inflight transactionThroughout this document, an inflight transaction refers to a transaction that has
been included in a block less than k blocks ago.
Here is a very brief summary of the rules:

From the perspective of a particular EOA, MON spent from that EOA in the course of a transaction
is partitioned into two parts: gas spend and value spend.

In the case where the EOA was the sender, gas spend is gas_price * gas_limit, and
value spend is the value parameter on that transaction
In the case where the EOA wasn't the sender (where they delegated via EIP-7702 and some other
EOA submitted a transaction which called this EOA), gas spend is 0, and value spend
is whatever MON is sent out during the course of executing this EOA's code


Let user_reserve_balance = 10 MON
Execution time: during execution, transactions revert due to value spend when that
account balance dips below user_reserve_balance. An exception is made (i.e. the transaction
does not revert) for accounts that are undelegated and have no inflight transactions within the past k
blocks.
Consensus time: For each account, consensus has a budget for the gas spend for all inflight
transactions; this budget is user_reserve_balance (or the account's balance from the lagged
execution state, whichever is lower). The budget is further reduced if the first inflight
transaction earned the exception mentioned above, by that transaction's value spend.
When performing block validity checks for block n, consensus checks that the budget is not exceeded.

infoSee also the formal definition in the
Monad Initial Spec
proposal from Category Labs.
Parameters​
ParameterValueuser_reserve_balance10 MON
Why is reserve balance needed?​
Monad has asynchronous execution: consensus is allowed to progress with building and
validating blocks without waiting for execution to catch up. Specifically, proposing
and validating consensus block n only requires knowledge of the state obtained after
applying block n-k.
While asynchronous execution has performance benefits, it introduces a novel challenge:
how is consensus supposed to know the validity of a block if it does not have the latest
state?
Let’s illustrate this challenge with an example (for our examples, we will use k = 3):
Consensus is validating block 4, which contains a transaction t from Alice with the
relevant fields as:
sender=Alice, to=Bob, value=100, gas=1
Consensus only has the state that was obtained by executing block 1:
block=1, balances={Alice: 110}
If consensus simply accepts block 4 as valid because Alice appears to have enough
balance, it risks a safety failure. For instance, Alice may have already spent her
balance in transaction t’ in block 2. This creates a denial-of-service (DoS)
vector, as Alice could cause consensus to include many transactions for free.
First attempt at a solution​
One idea is for the consensus client to statically inspect transactions in blocks 2
and later, checking if Alice has spent any value in her transactions. This would let
consensus reject block 4 as invalid if any transaction before t (such as t') in
blocks 2, 3, or 4 originates from Alice and spends some value or gas.
While this is a fine solution on the face of it, it suffers from two shortcomings:


Suppose, as part of smart contract execution in blocks 2 or 3, Alice received a lot
of currency. She would have had enough balance to pay for transaction t despite
t' existing, if only we had the latest state. So, rejecting transactions based
solely on static checks is overly restrictive.


It is not only restrictive, it is also not safe with EIP-7702. With EIP-7702, Alice
could have her account delegated to a smart contract, which can transfer out currency
from Alice’s account in a way that is not statically inspectable by consensus.
Concretely in our example, Alice does not need to send a transaction like t' from
her account in order to spend currency from her account, if her account is delegated.
A spend could potentially be triggered by a transaction submitted by anyone else.
So our static check would not succeed and it may be unsafe to accept block 4 as valid
even if we don’t see any other transaction from Alice in blocks 2, 3 and 4.


Reserve balance as the solution​
Simple version​
Intuitively, the core idea of reserve balance is as follows: if consensus and execution
agree ahead of time that, for each EOA, execution will prevent the account balance from
dropping below a certain pre-determined threshold known to consensus, then consensus
can then safely include transactions whose gas expenditures stay below that threshold,
without knowing the latest state and without being vulnerable to the DoS vector described
above.
In our example, if execution ensures that Alice’s account cannot be drawn below
10 MON (otherwise, the withdrawing transactions are reverted), then consensus can
safely include transaction t, as by definition Alice’s account will have at least
10 MON to pay for transaction t.
This concept can be generalized as follows:

Execution reverts any transaction that causes an account’s balance to dip below
user_reserve_balance, except due to transaction fees.
Consensus accepts transactions from user u after the delayed state s as long as
the sum of the gas fees for all inflight transactions sent by u is below a parameter
called user_reserve_balance.

In Monad, user_reserve_balance is currently set to 10 MON for each EOA.
An additional refinement to improve UX​
One criticism of the above rule is that it is difficult for users with balances
below the reserve to do anything that requires MON other than for gas fees.
For instance, the following behaviors might be desired, but are currently blocked
by the above rule (with user_reserve_balance set to 10 MON):

Alice has a balance of 5 MON and wants to send 4.99 MON to Bob (plus pay 0.01 MON
in gas)
Alice has a balance of 20 MON and wants to swap 18 MON into a memecoin (plus pay
0.01 MON in gas)

To address this, we add some additional conditions where transactions are allowed.
First let's define an "emptying transaction":
Emptying TransactionAn "emptying transaction" is a transaction that (when evaluated at time of execution)
takes the balance below the reserve balance.
Notice that if a user account is not EIP-7702-delegated, then consensus can simply
inspect transactions statically in order to estimate the lowest a user’s balance can
possibly go (since an undelegated user’s account can only be debited due to value transfers
and gas fees specified in the transaction data).
Therefore, we add the following rule:

Execution policy: for each undelegated account sender, if a transaction is the
first inflight transaction from that sender within k blocks, and the transaction would have
otherwise reverted due to taking balance below reserve balance, allow that transaction
to proceed anyway (an "emptying transaction").
Consensus policy: for each undelegated account sender, if a transaction is the
first inflight transaction from that sender within k blocks,
i.e. will end up proceeding as an "emptying transaction" during execution,
then statically inspect that transaction's
total MON needs (i.e. gas_bid * gas_limit + value), and take into account the fact that execution will still
allow this transaction through. This means that for any subsequent transactions in
the next k blocks, the reserve balance that consensus is working with will be lower
by value.

This rule lets execution allow undelegated accounts to dip below the reserve balance
once every k blocks. Since k blocks is 1.2 seconds, this policy should allow most small
accounts to still interact with the blockchain normally.
"Undelegated" means here the account is never delegated in any of the prior k blocks'
interim states, see Full specification for details.
The additional policy allows both of the examples mentioned at the start of this section,
as long as they are the first transaction sent by the sender in k blocks.
Transactions that are included but revert​
Because of the Reserve Balance rules, you may see transactions included in the chain whose
execution reverts, such as transactions trying to transfer out more MON than are in the account
balance.
These transactions are still valid transactions that pay for gas, but the
result of these transactions is nothing except for gas being decremented from the sender.
They are included because at the time of consensus, the proposer cannot be sure that the account
isn't going to receive more MON from someone else, and the sender has the budget to pay for gas.
Ethereum includes many transactions whose execution reverts, so this is not a protocol difference.
However, in practice, Ethereum block builders may screen out transactions with insufficient balance
to process a transfer out, so this behavior may be different from what you're accustomed to seeing.
Full specification​
See the
reserve balance spec
for the formal set of Reserve Balance rules.
Algorithms 1 and 2 implement this check for consensus and execution, respectively.
Algorithm 3 implements the mechanism to detect the dipping into the reserve balance
(Algorithm 2 uses Algorithm 3 to revert transactions that dip).
Algorithm 4 specifies the criteria for emptying transactions:

The sender account must be undelegated in the prior k blocks. This is checked
statically by verifying the account was undelegated in a known state in the past
k blocks, and there has been no change in its delegation status in the last k
blocks (this can be inspected statically).
There must not be another transaction from the same sender in the prior k blocks.

Here is a quick summary of the reserve balance rules at consensus time:
If the account is not delegated and there are no inflight transactions​
If the account is not delegated, and there are no previous inflight transactions, then consensus
checks that the gas fee for this transaction is less than the balance from the lagged state.
gas_fees(tx)≤balance\text{gas\_fees}(\text{tx}) \leq \text{balance}gas_fees(tx)≤balance
If the account is not delegated and has one emptying inflight transaction​
If the account is not delegated, and there is one previous inflight transaction, then
consensus has to take into account the inflight transaction's total MON expenditures
(including value):
let adjusted_balance=balance−(first_tx.value+gas_fees(first_tx))\text{let adjusted\_balance} = \text{balance} - (\text{first\_tx.value} + \text{gas\_fees}(\text{first\_tx}))let adjusted_balance=balance−(first_tx.value+gas_fees(first_tx))
let reserve=min⁡(user_reserve_balance(t.sender),adjusted_balance)\text{let } \text{reserve} = \min(\text{user\_reserve\_balance}(t.\text{sender}), \text{adjusted\_balance}) \quadlet reserve=min(user_reserve_balance(t.sender),adjusted_balance)
A new transaction can only be included if the sum of all inflight transactions' gas fees
(excluding the first one) is less than the reserve:
∑tx∈I[1:]gas_fees(tx)≤reserve\sum_{tx \in I[1:]} \text{gas\_fees}(tx) \leq \text{reserve}tx∈I[1:]∑​gas_fees(tx)≤reserve
All other cases​
The reserve is equal to minimum of systemwide reserve balance (10 MON) or the
account's balance at block n - k:
reserve=min⁡(user_reserve_balance(t.sender),balance)\text{reserve} = \min(\text{user\_reserve\_balance}(t.\text{sender}), \text{balance})reserve=min(user_reserve_balance(t.sender),balance)
A new transaction can only be included if the sum of all inflight transactions' gas fees
is less than the reserve:
∑tx∈Igas_fees(tx)≤reserve\sum_{tx \in I} \text{gas\_fees}(tx) \leq \text{reserve}tx∈I∑​gas_fees(tx)≤reserve
Adjusting the reserve balance​
The reserve balance is currently the same for every account (10 MON).
In a future version, the protocol could allow users, through a stateful precompile, to
customize their reserve balance.
Coq proofs​
The safety of the reserve balance specification has been formally proved in Coq.
The full proofs documentation is available
here.
The consensus check is formalized in Coq as consensusAcceptableTxs. The predicate,
consensusAcceptableTxs s ltx, defines the criteria for the consensus module to accept
the list of transactions ltx on top of state s.
The proof shows that consensusAcceptableTxs s ltx implies that when the execution
module executes all the transactions in ltx one by one on top of s, none of them will
fail due to having insufficient balance to cover gas fees. The proof is by induction
on the list ltx: one can think of this as doing natural induction on the length of ltx.
The proof in the inductive step involves unfolding the definitions of the consensus
and execution checks and considering all the cases. In each case, the estimates of
effective reserve balance in consensus checks is shown to be conservative with respect
to what happens in execution.
Additional examples​
To test your understanding, here are some examples along with the expected outcome.
Each example is independent.
In the following examples, we use start_block = 2, meaning the initial balances
and reserves are after block 1. We also specify the reserve balance parameter for
each example, although it is a constant system wide parameter.
For each transaction, the expected result is indicated by a code:

2: Successfully executed
1: Included but reverted during execution (due to reserve balance dip)
0: Excluded by consensus

Example 1: Basic transaction inclusion​
Initial state:
Alice: balance = 100, reserve = 10Bob: balance = 5, reserve = 10
Transactions:
Block 2: [  Alice: send 1 MON, fee 0.05 — Expected: 2  Bob: send 2 MON, fee 0.05 — Expected: 2]
Final balances:
Alice: 98.95Bob: 2.95
Example 2: Low reserve balance but high balance​
Initial state:
Alice: balance = 100, reserve = 1
Transactions:
Block 2: [  Alice: send 3 MON, fee 2 — Expected: 2 (emptying transaction)  Alice: send 3 MON, fee 2 — Expected: 0 (excluded)]
Final balance:
Alice: 95.0
Example 3: Multi-block, low reserve but high balance​
Initial state:
Alice: balance = 100, reserve = 1
Transactions:
Block 2: [  Alice: send 3 MON, fee 2 — Expected: 2]
Block 5: [  Alice: send 3 MON, fee 2 — Expected: 2]
Final balance:
Alice: 90.0
Example 4: Comprehensive​
Initial state:
Alice: balance = 100, reserve = 1
Transactions:
Block 2: [  Alice: send 99 MON, fee 0.1 — Expected: 2 (large emptying transaction)]
Block 3: [  Alice: send 0.5 MON, fee 0.99 — Expected: 0 (excluded)]
Block 4: [  Alice: send 0.8 MON, fee 0.1 — Expected: 1 (included but reverted)]
Block 5: [  Alice: send 0 MON, fee 0.9 — Expected: 0 (excluded)  Alice: send 5 MON, fee 0.1 — Expected: 1 (included but reverted)  Alice: send 5 MON, fee 0.8 — Expected: 0 (excluded)]
Final balance:
Alice: 0.70
Example 5: Edge case — zero value transactions​
Initial state:
Alice: balance = 2, reserve = 1
Transactions:
Block 2: [  Alice: send 0 MON, fee 0.5 — Expected: 2  Alice: send 0 MON, fee 0.6 — Expected: 2  Alice: send 0 MON, fee 0.5 — Expected: 0 (exceeds reserve)]
Final balance:
Alice: 0.9
Example 6: Reserve balance boundary​
Initial state:
Alice: balance = 10, reserve = 2
Transactions:
Block 2: [  Alice: send 1 MON, fee 2 — Expected: 2 (matches reserve)  Alice: send 0 MON, fee 0.01 — Expected: 2]
Final balance:
Alice: 6.99
Example 7: Account delegated in the interim​
Initial state:
Alice: balance = 15, reserve = 10
Transactions:
Block 1: []
Block 2: [  Alice is delegated  Bob on behalf of Alice's: send 5 MON, fee 0 — Expected: 2 (executed)  Alice is undelegated]
Block 3: [  Alice: send 3 MON, fee 0.1 — Expected: 1 (included but reverted)]
Block 4: []
Block 5: [  Alice: send 0 MON, fee 8 - Expected: 2 (executed)]
Final balance:
Alice: 1.9
NOTE: If execution would not have reverted transaction in Block 3 (by checking delegation
status in prior k blocks), consensus would include transaction in Block 5 which would later run
out of MON for the fee.
Also, consider Block 2 is empty instead. Transaction in Block 3 is then an emptying transaction,
which proceeds with execution, but transaction in Block 5 is excluded as not having enough reserve
for fee.
Example 8: Account receives MON before second inflight tx​
Initial state:
Alice: balance = 15, reserve = 10
Transactions:
Block 1: []
Block 2: [  Alice: send 6 MON, fee 0.1 - Expected: 2 (executed, emptying tx)]
Block 3: [  Alice receives 6 MON from a smart contract   Alice: send 7 MON, fee 0.1 — Expected: 1 (included but reverted, cannot be 2nd emptying so soon)]
Block 4: []
Block 5: [  Alice: send 0 MON, fee 8 - Expected: 2 (executed)]
Final balance:
Alice: 6.8
NOTE: If execution would not have reverted the 2nd transaction in Block 3 (from Alice; by
checking existence of emptying transactions in prior k blocks), consensus would include
transaction in Block 5 which would later run out of MON for the fee.
Also, consider Block 2 is empty instead. Transaction in Block 3 (from Alice) is then an emptying
transaction, which proceeds with execution, but transaction in Block 5 is excluded as one
potentially not having enough reserve for fee - consensus doesn't see Alice being credited in
Block 3.

## Code Examples

```prism
sender=Alice, to=Bob, value=100, gas=1
```

```prism
block=1, balances={Alice: 110}
```

```prism
Alice: balance = 100, reserve = 10Bob: balance = 5, reserve = 10
```

```prism
Block 2: [  Alice: send 1 MON, fee 0.05 — Expected: 2  Bob: send 2 MON, fee 0.05 — Expected: 2]
```

```prism
Alice: 98.95Bob: 2.95
```

```prism
Alice: balance = 100, reserve = 1
```

```prism
Block 2: [  Alice: send 3 MON, fee 2 — Expected: 2 (emptying transaction)  Alice: send 3 MON, fee 2 — Expected: 0 (excluded)]
```

```prism
Alice: 95.0
```

```prism
Alice: balance = 100, reserve = 1
```

```prism
Block 2: [  Alice: send 3 MON, fee 2 — Expected: 2]
Block 5: [  Alice: send 3 MON, fee 2 — Expected: 2]
```

```prism
Alice: 90.0
```

```prism
Alice: balance = 100, reserve = 1
```

```prism
Block 2: [  Alice: send 99 MON, fee 0.1 — Expected: 2 (large emptying transaction)]
Block 3: [  Alice: send 0.5 MON, fee 0.99 — Expected: 0 (excluded)]
Block 4: [  Alice: send 0.8 MON, fee 0.1 — Expected: 1 (included but reverted)]
Block 5: [  Alice: send 0 MON, fee 0.9 — Expected: 0 (excluded)  Alice: send 5 MON, fee 0.1 — Expected: 1 (included but reverted)  Alice: send 5 MON, fee 0.8 — Expected: 0 (excluded)]
```

```prism
Alice: 0.70
```

```prism
Alice: balance = 2, reserve = 1
```

```prism
Block 2: [  Alice: send 0 MON, fee 0.5 — Expected: 2  Alice: send 0 MON, fee 0.6 — Expected: 2  Alice: send 0 MON, fee 0.5 — Expected: 0 (exceeds reserve)]
```

```prism
Alice: 0.9
```

```prism
Alice: balance = 10, reserve = 2
```

```prism
Block 2: [  Alice: send 1 MON, fee 2 — Expected: 2 (matches reserve)  Alice: send 0 MON, fee 0.01 — Expected: 2]
```

```prism
Alice: 6.99
```

```prism
Alice: balance = 15, reserve = 10
```

```prism
Block 1: []
Block 2: [  Alice is delegated  Bob on behalf of Alice's: send 5 MON, fee 0 — Expected: 2 (executed)  Alice is undelegated]
Block 3: [  Alice: send 3 MON, fee 0.1 — Expected: 1 (included but reverted)]
Block 4: []
Block 5: [  Alice: send 0 MON, fee 8 - Expected: 2 (executed)]
```

```prism
Alice: 1.9
```

```prism
Alice: balance = 15, reserve = 10
```

```prism
Block 1: []
Block 2: [  Alice: send 6 MON, fee 0.1 - Expected: 2 (executed, emptying tx)]
Block 3: [  Alice receives 6 MON from a smart contract   Alice: send 7 MON, fee 0.1 — Expected: 1 (included but reverted, cannot be 2nd emptying so soon)]
Block 4: []
Block 5: [  Alice: send 0 MON, fee 8 - Expected: 2 (executed)]
```

```prism
Alice: 6.8
```

