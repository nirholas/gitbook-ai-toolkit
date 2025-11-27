# Getting started

> Source: https://docs.monad.xyz/execution-events/getting-started/

## Documentation

In this guide, we will:

Compile an example program, which will involve building code with the
execution event SDK as a dependency. The SDK is offered for both the C
and Rust programming languages. Each language has its own guide, so
follow the instructions for your language of choice

C guide
Rust guide


Run the example program on some historical data,
which prints ASCII representations of execution events to stdout
Set up and run our own Monad node,
so that we have a local execution process publishing real-time data
Run the example program again, this time using our Monad node;
this will again print execution events to stdout, but this time the
source will be real-time data from our local node

Linux required, but with some macOS supportThis guide has been tested on a clean Ubuntu 24.04 LTS install, but should
work on any recent Linux distribution, although the names of the required
packages might be different. The distribution will need to provide a recent
enough C compiler, either gcc-13 or clang-19.The first two steps of the guide, which involve looking at historical data
instead of real-time data, will also work on a macOS installation that is
configured for software development. This may make it easier for some developers
to try out the SDK on a development workstation or laptop, without the need to
set up a Linux host first.Unlike the SDK, the Monad node itself only runs on Linux so the later steps of
the guide -- which actually consume real-time data -- require a full Linux host
running your own Monad node.

