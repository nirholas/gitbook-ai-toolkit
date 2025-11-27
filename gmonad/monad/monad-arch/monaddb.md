# MonadDb

> Source: https://docs.monad.xyz/monad-arch/execution/monaddb

## Documentation

On this page

Summary​
MonadDb is a critical component in Monad for maintaining full Ethereum compatibility while delivering high performance. It is a custom-built key-value database designed for storing authenticated blockchain data. MonadDb, specifically, is optimized for efficiently storing Merkle Patricia Trie nodes on disk.
Merkle Patricia Trie Structured Database​
Most Ethereum clients use generic key-value databases that are implemented as either B-Tree (e.g. LMDB) or LSM-Tree (e.g. LevelDB, RocksDB) data structures. However Ethereum uses the Merkle Patricia Trie (MPT) data structure for storing state and other authenticated fields like receipts and transactions. This results in a suboptimal solution where one data structure is embedded into another data structure. MonadDb implements a Patricia Trie (a specific variant of radix tree) data structure natively, both on-disk and in-memory. Despite the opinionated design, MonadDb is a flexible key-value store capable of storing any type of data. For instance, MonadDb is also used to store block headers and payloads for Monad.
Asynchronous IO​
Monad executes multiple transactions in parallel. In order to enable this, reads should not block continued operation, and this goal motivates asynchronous I/O (async I/O) for the database. The above-mentioned key-value databases lack proper async I/O support (although there are some efforts to improve in this area). MonadDb fully utilizes the latest kernel support for async I/O (on Linux this is io_uring). This avoids spawning a large number of kernel threads to handle pending I/O requests in an attempt to perform work asynchronously.
Filesystem bypass​
Modern filesystems provide a convenient abstraction for applications, but introduce overhead when building high-throughput I/O software. These often hidden costs include block allocation, fragmentation, read/write amplification, and metadata management. The abstraction of files and a set of system calls allows applications to interact with the file data as if it were stored contiguously. The complexity of managing exact physical disk locations is abstracted away from the applications (and their developers). However, the actual content on disk might be fragmented into multiple non-contiguous pieces.  Accessing or writing to such a file usually involves more than one simple I/O operation.
To minimize overhead, MonadDb provides operators the option to bypass the filesystem. MonadDb implements its own indexing system based on the Patricia trie data structure, eliminating filesystem dependencies. Users have the flexibility to operate MonadDb on either regular files or block devices. For optimal performance, it is recommended to run MonadDb directly on block devices. This approach avoids all filesystem-related overhead, allowing MonadDb to fully unlock SSD performance.
Concurrency Control​
The Monad blockchain consists of multiple clients, each interacting with the database as either reader or writer. To support this functionality, MonadDb must efficiently synchronize between a single writer (execution) and multiple readers (consensus and RPC).
MonadDb implements a persistent (or immutable) Patricia trie. When a branch in the trie is updated, new versions of the nodes on that branch are created, and the previous version of the trie is preserved. This approach facilitates versioning within the database and significantly simplifies synchronization between readers and the writer. It ensures that all reads are accurate and consistent while guaranteeing that writes are both complete and atomic from the perspective of the readers.
Write Performance on Modern SSD​
The usage of a persistent data structure also allows us to perform sequential writes, which offers better performance than random writes on modern SSDs. Modern SSD garbage collection occurs at the block level. On sequential writes, an entire block gets filled before the next one, which dramatically simplifies garbage collection. Garbage collection is much more expensive for random writes. Sequential writes also distribute data more efficiently, thereby reducing write amplification and increasing SSD longevity.
Compaction​
As historical versions accumulate, the amount of data written to disk will grow. Given the limited disk capacity it operates on, it is impossible to retain complete historical records. MonadDb stores recent versions of blockchain data and state and dynamically adjusts the history length based on available disk space. As newer versions are stored and older versions are pruned, the underlying storage space becomes fragmented. To address this, MonadDb performs compaction inline with updates, consolidating active data and releasing unused storage for recycling. This reduces fragmentation while maintaining performance and data integrity.

