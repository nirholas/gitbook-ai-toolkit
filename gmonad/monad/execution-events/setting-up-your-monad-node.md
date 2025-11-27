# Setting up your Monad node

> Source: https://docs.monad.xyz/execution-events/getting-started/setup-node

## Documentation

The execution events SDK relies on a shared memory communication system,
in which the node's EVM execution daemon acts a publisher. Thus, in order to
use it, you need to (i) run your own Monad node and (ii) run your data
processing application on the same host as the node, so it can read the
data from shared memory.
Follow the guides on the node operations page,
which cover how to install and configure a full node, and how to reset it
when problems occur. You will also need to follow some
extra configuration steps
to prepare the node for use with execution events.

