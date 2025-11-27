# Local Mempool

> Source: https://docs.monad.xyz/monad-arch/consensus/local-mempool

## Documentation

On this page

Summary​
Most blockchains use a global mempool with peer-to-peer gossipping for transaction propagation. This approach is not suitable for high-performance distributed consensus for a few reasons:

It is slow because it may involve many hops for a transaction to reach a leader, increasing time to inclusion.
It is wasteful on bandwidth because the gossip protocol involves many retransmissions.
It ignores the leader schedule which is typically known well in advance.

In Monad, there is no global mempool; instead, each validator maintains a local mempool, and RPC nodes forward transactions to the next few leaders for inclusion in their local mempool. This is much more efficient on bandwidth usage and allows transactions to be included more quickly.
Background​
A mempool is a collection of pending transactions. Many blockchain networks use a global mempool design, using peer-to-peer gossip protocols to keep roughly the same mempool state across all nodes in the network. A primary motivation of a global mempool design is that no matter who is leader, they will have access to the same set of pending transactions to include in the next block.
A global mempool is effective for low-throughput networks, where network bandwidth is typically not a bottleneck. However, at thousands of transactions per second, the gossip protocols (and especially the required retransmission at each node) can easily consume the entire network bandwidth budget. Moreover, a global mempool is wasteful since the leader schedule is typically known well in advance.
Transaction Lifecycle in Monad​
There is no global mempool in Monad. Validators maintain local mempools; RPC nodes forward transactions to upcoming leaders to ensure that those transactions are available for inclusion.
More precisely, transaction flow is as follows:

A transaction is submitted to the RPC process of a node (typically a full non-validator node). We'll call this node the "owner node" of the transaction, since it assumes responsibility for communicating the status with the user.
The RPC process performs some static checks on the transaction.
The RPC process passes the transaction to the consensus process.
The consensus process performs static checks and dynamic checks against local state in MonadDb, such as checking the sender's account balance and nonce.
If the transaction is valid, the consensus process forwards the transaction to N upcoming leader validator nodes. Currently, N is set to 3 in Monad testnet and mainnet.
Each of those N validators performs the same checks before inserting valid transactions into their local mempools.
When it is a leader's turn to create a proposal, it selects transactions from its local mempool.
The owner node of the transaction monitors for that transaction in subsequent blocks. If it doesn't see the transaction in the next N blocks, it will re-send to the next N leaders. It repeats this behavior for a total of K times. Currently, K is set to 3 in Monad testnet and mainnet.

The behavior of this transaction flow is chosen to reduce time-to-inclusion while minimizing the number of messages.
Transaction path from RPC to leader (through the local mempool).
Local mempool eviction​
Transactions are evicted from a validator's local mempool for the following reasons:

Whenever a validator finalizes a block, any replicas of transactions in that block are pruned from the local mempool.
Validators periodically check the validity of each transaction in the mempool and evict invalid transactions (e.g. nonces are too low, account balances are insufficient).
If the local mempool's size reaches a soft limit, older transactions will be evicted.

