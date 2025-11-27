# Transaction Lifecycle in Monad

> Source: https://docs.monad.xyz/monad-arch/transaction-lifecycle

## Documentation

On this page

Transaction Submission​
The lifecycle of a transaction starts with a user preparing a signed transaction and submitting it to an RPC node.
Transactions are typically prepared by an application frontend, then presented to the user's wallet for signing. Most wallets make an eth_estimateGas RPC call to populate the gas limit for this transaction, although the user can also override this in their wallet. The user is also typically asked to choose a gas price for the transaction, which is a number of NativeTokens per unit of gas.
After the user approves the signing in their wallet, the signed transaction is submitted to an RPC node using the eth_sendTransaction or eth_sendRawTransaction API call.
Mempool Propagation​
As described in Local Mempool:
The RPC node performs validity checks:

signature verification
nonce not too low
gas limit below block gas limit

before forwarding the pending transaction to the next N leaders.
Each of those leaders replicate those validity checks before adding the pending transaction to their local mempool.
If the transaction isn't included in any of the blocks proposed by those leaders, the RPC node repeats this process, sending to the next N leaders. The process is repeated up to K times.
Block Inclusion​
Pending transactions are included in a block only if further dynamic checks pass:

account balance is sufficient to pay for gas (see: Balance Validation at Time of Consensus)
nonce is contiguous
there is space in the block and the leader has chosen to include this transaction

Block Propagation​
Blocks are propagated through the network as discussed in MonadBFT, using the RaptorCast messaging protocol for outbound messages from the leader.
Under MonadBFT, a block progresses from the Proposed phase to the Voted phase (after 1 block) and then to the Finalized phase (after 2 blocks).
Once the block is Finalized, the transaction has officially "occurred" in the history of the blockchain. Since its order is determined, its truth value (i.e., whether it succeeds or fails, and what the outcome is immediately after that execution) is determined.
Local Execution​
As soon as a node receives a block, it begins executing the transactions from that block. For efficiency reasons, transactions are executed optimistically in parallel, but it is as if the transactions were executed serially, since results are always committed in the original order.
Querying the Outcome​
The user can query the result of the transaction by calling eth_getTransactionByHash or eth_getTransactionReceipt on any RPC node. The RPC node will return as soon as execution completes locally on the node.

