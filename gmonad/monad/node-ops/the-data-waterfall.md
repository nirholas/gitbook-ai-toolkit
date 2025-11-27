# The Data Waterfall

> Source: https://docs.monad.xyz/node-ops/archive-data/data-waterfall

## Documentation

On this page

Background​
As a high throughput blockchain with frequent blocks, Monad generates a lot of data - both
transactional data (blocks, transactions, receipts, logs, and traces), and state data
(the full state trie at the end of each block).
Full nodes and validators store as much of both kinds of data as possible in MonadDB, overwriting
the oldest data when the storage capacity hits 80%. If an RPC call requests data older than
whatever is locally available, the node must reference an
external source.
For transactional data, the waterfall is:

Chain State Buffer (in-memory cache)
MonadDb
Archive Server (if configured)
Object Storage (if configured)

MonadDB​
MonadDB, also called TrieDB, is a local state database run by each full node and validator. It
maintains the most recent state tries, as well as the corresponding transactional data.
Once the storage capacity of MonadDB reaches 80%, the node begins overwriting the oldest data.
Because of this mechanism, and because of frequent blocks and high chain throughput, most MonadDB
instances don't store the entire blockchain history.
Archive Server (MongoDB)​
An Archive Server is a standalone server that stores historical transactional data in MongoDB.
Note that Archive Servers don't store state data - see
here for a discussion why.
An Archive Server is fed this data by an ordinary full node running an additional process called
the Archive Writer.
Monad Archive Server architecture
Many full nodes and validators can point to the same Archive Server.
For instructions on running an Archive Server, please refer to
Running an Archive Server.
Archive Servers store the following data types:

blocks
transactions
receipts
logs
traces

Note: We call this an "Archive Server" rather than an "Archive Node" to reduce confusion.
Archive Servers typically don't host a Monad full node (consensus and execution).
Object Storage​
Archive data can also be stored in an object storage service (e.g., AWS S3).
While MongoDB is preferred for performance and query efficiency, object storage provides a viable
fallback option for users who prefer off-site or cloud-based data retention.
Like ArchiveDB, the object storage can also be configured in the RPC client as a  source of
historical data.
Object Storage stores the following data types:

blocks
transactions
receipts
logs
traces

infoArchive Server is given preference over Object Storage if both are configured. Configuring both is
recommended to ensure that there is a fallback mechanism in case of any issues with the Archive
Server instance.
infoFor more details about historical data, see the
Historical Data page.

