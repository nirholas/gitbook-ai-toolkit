# Introduction

> Source: https://docs.monad.xyz/

## Documentation

On this page

Quick hits
Network Information
Deployment Summary for Developers

Monad is a Layer-1 blockchain delivering high performance, true decentralization, and EVM
compatibility.
Monad's north star is making decentralization more powerful, and eliminating the perceived
tradeoff between decentralization and performance.
Monad supports a large globally distributed network
(see the validator map), with intentionally minimal
hardware requirements so that anyone may run a node.
Performance comes from software architecture improvements rather than reliance on heavy hardware
or node colocation.
Monad's codebase is fully open source (consensus,
execution) and is built for extreme performance in
C++ and rust.
Monad introduces novel architectures in five major areas:

MonadBFT, a frontier BFT consensus mechanism solving the
tail-forking problem
RaptorCast for efficient block transmission
Asynchronous Execution for pipelining
consensus and execution to raise the time budget for execution
Parallel Execution and JIT Compilation for efficient transaction
execution
MonadDb for efficient storage of Ethereum state

Monad's improvements address existing bottlenecks while preserving seamless compatibility for
application developers (full EVM bytecode compatibility) and users (Ethereum
RPC API compatibility).
The result is an Ethereum-compatible Layer-1 blockchain with 10,000 tps of throughput,
400ms block frequency, and 800ms finality.
Select a level of detail by visiting either Monad for Users or
Monad for Developers.
Deploying on Monad​
See Deployment Summary for Developers for everything you need to
know as a developer deploying on Monad.
Monad features first-class support for many leading Ethereum developer tools and infra providers.
See Tooling and Infrastructure for a summary.
Architecture​
Monad is designed with a focus on performance and scalability with commodity hardware.
The subsequent pages survey the major architectural changes in Monad as well as the
interface for users.
The first Monad client is built by
Category Labs and is written from scratch in C++ and Rust.
monad-bft, Category Labs's implementation of
a Monad consensus client, and
monad, Category Labs's implementation of a Monad
execution client, are both open-source under GPL-3.0.
Mainnet​
Public mainnet launched on Nov 24, 2025.
See Network Information for access, or check out the
MonadVision block explorer, the gmonads.com
network visualization, or app.monad.xyz.

