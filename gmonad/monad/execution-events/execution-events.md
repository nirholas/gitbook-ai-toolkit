# Execution Events

> Source: https://docs.monad.xyz/execution-events/

## Documentation

On this page

The Execution Events system allows developers to build high-performance
applications that receive lowest-latency event data from a Monad node via
shared memory queue.
To consume this real-time data, you write some data processing software in C,
C++, or Rust using the software development kit described on this page, and
run it on a host running the
Monad node software built by Category Labs.
This would be overkill for simple data processing use cases; see the
alternatives section for more convenient
ways to consume Monad blockchain data.
For comparisons to other systems such as Reth's ExEx or Solana Geyser, see
the comparisons section.
What are "execution events"?​
The Category Labs
execution daemon
contains a shared-memory communication
system that publishes data about most actions taken by the EVM during
transaction execution. The raw binary records of these EVM actions are
called "execution events".
Third-party applications that need the highest performance can run on the
same host as the node software, and directly consume the execution event
records from shared memory. To read this data, your third-party application
calls functions in the execution event SDK, our real-time data library.
Execution events documentation​

Release notes - see what's new in the latest
release of the SDK
Getting started - describes
how to build and run a simple example program
Events overview - explains the core
concepts in the execution events system
Event rings in detail - documents
event ring files and protocol versioning
API documentation - overview of our programming libraries, which are
provided for several programming languages

C API
Rust API


Consensus events - execution
publishes some information from consensus that is essential for
understanding real-time data
Advanced topics - documentation for
advanced users and for software developers who contribute to the execution
source code

Alternatives to execution events​
Category Labs' node software includes an RPC server component. The RPC server
supports two easier ways to read blockchain data:

The typical JSON RPC endpoints supported by
most EVM-compatible blockchain nodes (e.g., Geth)
The Geth real-time events
WebSocket protocol (i.e., eth_subscribe) is also supported, along with
some Monad-specific extensions for better performance; see the
WebSocket guide for more information

Both of these access methods are standardized across EVM-compatible blockchains
and are simpler to use than execution events. The execution events system is
designed for specialized applications, such as running an indexer platform or
applications that need the lowest latency possible (e.g., market making).
It is also where the RPC server itself gets its real-time data.
Comparisons with other data systems​
A brief comparison with low latency systems in other blockchain
software:

Geth Live Tracing
(link) - "hook"
based API: your code is loaded into the Geth node as a plugin, and is run synchronously
(via callbacks) during execution
Reth ExEx (link) and
(link) - async function based API:
your code is loaded into a Reth node; execution sees events after the fact
rather than synchronously
Solana Geyser (link) - "hook" based API, a plugin that runs inside
a Solana validator and invokes callbacks during execution

All three of these are different from the Execution Events approach. In our approach:

You are seeing events "as-they-happen", as in the Geth Live Tracer and
Solana Geyser. Unlike these approaches, your code is not running as a
plugin inside the execution engine, but in parallel (about one
microsecond later) in a separate process
Like the Geth Live Tracer (but unlike Reth's ExEx) you see each "piece"
of the transaction -- each log, each balance change, etc. -- as a
separate event
Unlike the Geth Live Tracer or Geyser, you do not install "hooks" and
receive callbacks; instead you continuously poll for new event records,
iterating through any new events that are returned to you (and ignoring
events that you are not interested in)
Because the system is based on shared memory ring buffers, you can lose
data if your consumer is too slow -- you must keep up!

