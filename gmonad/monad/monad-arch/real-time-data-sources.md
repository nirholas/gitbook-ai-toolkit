# Real-Time Data Sources

> Source: https://docs.monad.xyz/monad-arch/realtime-data/data-sources

## Documentation

On this page

For many use cases, developers and users can access current and historical
data for the Monad blockchain via the JSON-RPC interface.
This is not the most efficient way to receive data about the latest blocks,
however. The traditional JSON-RPC access methods use a request/response
model (which requires polling) instead of a notification model, where new
updates are pushed to you as soon as they happen.
warningBecause the Monad blockchain is much faster than other EVM-compatible
L1 blockchains, the traditional JSON-RPC methods may not provide enough
performance if you consume a lot of data, even if they've worked for you on
other EVM ecosystems. The next section explains why in detail.
Why might I need real-time data, even if I didn't before?​
Monad is a fast blockchain capable of thousands of transactions per second:
when the Monad ecosystem runs at peak rates there is much more data per second
than in other L1 EVM-compatible blockchains such as mainnet Ethereum.
The data ecosystem of original Ethereum evolved around a network that ran at
less than 100 TPS, so certain data query patterns that work there might not
perform well enough when the amount of data is almost 100 times larger.
A classic example is an indexer workflow of fetching data about every
transaction and every log in a block, using JSON-RPC methods like
eth_getLogs. A typical Ethereum block will have hundreds of transactions in
it, and there will be one new block every 12 seconds or so. For Monad, there
are 2.5 blocks every second, and each block can contain thousands of
transactions.
The number of eth_getLogs requests would be almost 100 times greater, putting
a strain on the JSON-RPC service provider. Using real-time data services can
help. Such services exist on other EVM blockchains too, but they're essential
in more situations for Monad.
How do I receive real-time data?​
Monad currently offers three sources of real-time data, which offer different
trade-offs in latency vs. complexity.
Source #1: Geth-compatible real-time events​
This is a WebSocket-based protocol
that originated in the Geth Ethereum client but is widely supported by other
EVM-compatible blockchains. Monad implements the eth_subscribe method and
the newHeads and logs subscription types. The syncing and
newPendingTransactions subscription types are not supported.
The newHeads and logs subscriptions wait for block finalization, so they
have one additional feature that the original Geth implementation does not:
you do not need any logic to handle chain reorganizations, because they are
not possible. You will never see the same block number more than once, and
logs will never be removed. For this reason, however, this is the slowest
of the real-time data sources.
This real-time data feed is published by the Monad RPC server component.
Source #2: Monad extensions to Geth real-time events​
The Monad RPC server also offers an extension to the Geth protocol; it
provides eth_subscribe subscriptions called monadNewHeads and monadLogs.
These publish almost the same data as the Geth real-time events protocol,
and the data is published sooner -- by about one second on average -- but on
a speculative basis.
This makes data available as soon as possible, but requires the user to
understand speculative execution and how it affects real-time data. You can
read more about these subscriptions in the WebSocket Guide.
Source #3: Execution events SDK​
This is the fastest way to consume real-time data. It requires you to write
your own real-time data processing software using the Monad client SDK in C,
C++, or Rust -- and then run it alongside your own Monad node.
This is the source of data that powers the other two access methods: it is
what the RPC server itself is listening to, to create the WebSocket feeds.
It has its own documentation.
Comparison of data offerings​
Data offeringHow to consumePublished byAvailablityTransaction-level infoWhen data is publishedGeth real-time eventsWebSocketRPC serverBlock commitLogs only1 second after block proposal (avg.)Geth real-time events (with Monad extensions)WebSocketRPC serverBlock commitLogs onlyAs soon as proposal is receivedExecution event SDKC/C++ or Rust SDKExecution daemonTx commitLogs, call frames, state reads/writesAs soon as proposal is received
The first two offerings are consumed using eth_subscribe method over a
WebSocket. They are available from third-party data providers if you don't
wish to run your own Monad node.
The SDK offering requires you to write your own third-party program using
the C/C++ or Rust SDK. These programs are not plugins that run inside the
node software -- they are free-standing programs written entirely by you. As
events occur inside the EVM (in the execution daemon), they are recorded to
shared memory. Your program also is reading this same shared memory.
Therefore, your program must run on the same host as a Monad node.

