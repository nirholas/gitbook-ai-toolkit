# WebSocket Guide

> Source: https://docs.monad.xyz/reference/websockets

## Documentation

On this page

Monad's RPC server supports JSON-RPC over WebSocket connections. This feature
allows JSON-RPC calls to occur over a persistent connection instead of as
individual HTTP requests, but the primary reason for using it is to subscribe
to real-time data feeds using
the eth_subscribe call.
eth_subscribe behaves similarly to
how it does
in the Geth Ethereum client:

subscription types newHeads and logs are supported (returning updates as soon as the block
is Finalized)
subscription types syncing and newPendingTransactions are not supported.

Additionally, two new variants, monadNewHeads and monadLogs are supported. These behave
similarly to newHeads and logs but return as soon as the node sees the block and has a chance
to speculatively execute.
So in summary:
subscription typedescriptionnewHeadsFires a notification each time a new header is appended to the chain, after the block is Finalized. Unlike in geth, no reorgs are possible.logsReturns logs (that match the given filter criteria) in a new block, after the block is Finalized. Unlike in geth, no reorgs are possible.monadNewHeadsSame as newHeads, but as soon as the block is Proposed and the node has a chance to speculatively execute.monadLogsSame as logs, but as soon as the block is Proposed and the node has a chance to speculatively execute.
Getting started with real-time data​

The real-time data feeds available over WebSockets are described here
You can access them via these public RPC endpoints
Real-time data is often exposed in a high-level way in your Ethereum
blockchain interface library; we show examples using Python's
web3.py and JavaScript's
ethers.js below

web3.py (Python) example​
Start by installing web3.py if you
haven't already. In this example we'll use pip directly:
pip install web3
Save the following code to the file block-counter.py:
import asyncio
from web3 import AsyncWeb3from web3.providers.persistent import WebSocketProvider
ws_url = 'wss://testnet-rpc.monad.xyz'
async def print_latest():  async with AsyncWeb3(WebSocketProvider(ws_url)) as w3:    subscription_id = await w3.eth.subscribe('newHeads', {})    async for payload in w3.socket.process_subscriptions():      print(f"New block received: {payload['result']['number']}")
if __name__ == "__main__":  asyncio.run(print_latest())
Finally, run:
python block-counter.py
After a few seconds, you should see output similar to:
New block received: 29165925New block received: 29165926New block received: 29165927
ethers.js (JavaScript) example​
Start by installing ethers.js if you haven't
already. In this example we'll use Node.js and
npm:
npm install ethers
Save the following code to the file block-counter.js:
import { WebSocketProvider } from "ethers/providers";
const wsUrl = "wss://testnet-rpc.monad.xyz"
const provider = new WebSocketProvider(wsUrl);
provider.on("block", (blockNumber) => {  console.log("New block received:", blockNumber);});
Finally, run
node block-counter.js
After a few seconds, you should see output similar to:
New block received: 29165925New block received: 29165926New block received: 29165927
Real-time data protocol vs data streaming API​
The formal protocol for real-time data used in the above examples is documented
by Geth as the real-time events protocol.
Its specification describes:

The JSON-RPC calls needed to create and destroy subscriptions
(eth_subscribe and eth_unsubscribe)
The kinds of subscriptions available (newHeads, logs, etc.)
The structure of the JSON objects pushed when new data arrives

This documentation generally describes Monad's WebSocket support in these
terms.
Notice that in the Python example, you explicitly see the subscription name
'newHeads' and call an API function named subscribe: the API design
matches the protocol design very closely. The JavaScript example, on the other
hand, is different: you see nothing about newHeads or "subscribing."
Internally, this JavaScript library uses the newHeads subscription just like
the Python version, but it presents real-time data using different choices in
API design space. Some of the most popular libraries in other languages (e.g.,
alloy in Rust) use newHeads or logs internally in
some of their APIs, although sometimes it's an implementation detail and they
don't explicitly say so.
The next section of this page documents the eth_subscribe data feeds which
are Monad extensions (monadNewHeads and monadLogs). If you want to access
these extensions, you need to use an API that has a style like the web3
library in the Python example. Because it is a very thin layer on top of the
underlying protocol, it is also naturally extensible: the Monad-specific data
feeds will work without the library being changed, because the API is
low-level enough (e.g., returning JSON responses as generic dictionary
objects) that it can work with our new feeds without any modification.
monadNewHeads and monadLogs​
These publish almost the same data as their standardized counterparts
(newHeads and logs), except the data is published sooner -- by about
one second on average -- but on a speculative basis.
To consume this data, the user needs to understand speculative execution
and how it affects real-time data. The necessary background you need to
know is described here.
The remainder of this section explains how those concepts appear in the
data that's published.
As explained in the section on
block ids,
you need to know two things about a block:

What commit state the block is in
What the block's unique ID is, because its block number is not unique
prior to finalization

Consequently, a monadNewHeads update looks the same as a newHeads update
except that it contains the additional blockId and commitState fields:
{  "blockId": "0x71ce47f39a1eb490354166f762d78bf6e2acaf80b24b4bcd756118d93ef81be0",  "commitState": "Proposed",  "hash": "0x7a7d7c23bb8c5e340eead8537bb5e2f3e125bfa0b588cf07e4aa140ba374295e",  "parentHash": "0x9a71a95be3fe957457b11817587e5af4c7e24836d5b383c430ff25b9286a457f",  "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",  "miner": "0x1ad91ee08f21be3de0ba2ba6918e714da6b45836",  "stateRoot": "0x5e215f13dce86552d9083116be9f2b71f639d014fa9694f3dca9fb579bf4a717",  "transactionsRoot": "0xfe490e456649550c9f94cb46104da1d3eda87f06a1c33e578137d8cf1ef06fe6",  "receiptsRoot": "0x9ae198972e011bf3617a28ec72bef9a515f66d1d15988d92191eb3c7f231640a",  "logsBloom": "0x09e3c42e60df6a823da47b9b9e73b3a563ffddc9fb59802a087d92bf7e5bc92d7477f504864e1446cc46fb89c1bd63207f3f9bfbfba378f444f5895f53fee0fc10dbd395f546ffbefedfeef9712c4cf66ed3cf24df4f720b7bf67c2994337c607fa56e49ab6acd5efd7bb61428f8edcfa3e2d66dae3b8fd3c6942d36e8ea7403d107f7d97a57dfb50de96601410af486c7f5f6c55357a6fd2b30a979fb99d1a7bb9bbdbd1b227cbcdc9fff81ef73ab2bdc470a4bb9772eb658755fce551869a1f35b2e6338d06acd94e4dff638cf7dd74e5613ef178f16bbb0253f8f06eb7c64f6bbfffbeb165965d06f532da10edf63e54782c7ed9b05ca41efec457a95782f",  "difficulty": "0x310db4075e35d4",  "number": "0xe4e1c1",  "gasLimit": "0x1c9c380",  "gasUsed": "0x1579362",  "timestamp": "0x62b12cf8",  "extraData": "0x486976656f6e2072752d6865617679",  "mixHash": "0xc808debc77a41b82b5a6780fb288a47593ec636cdedab4feaeb65d91322f30b6",  "nonce": "0xdff7aec95842e5ed",  "baseFeePerGas": "0x3b541e0b1",  "totalDifficulty": "0x0",  "size": "0x2fe"}
The block above is first seen in the "Proposed"
state.1 This means it has been speculatively executed, before the local consensus node has
discovered its ultimate fate.
This exact same update might be seen several more times -- with all data
exactly the same as above -- except that the "commitState" will change.
In the "normal" life-cycle of a block,
you would see this update three more times, but with "commitState" changing to
"Voted", then
"Finalized", and finally to
"Verified".
A few notes about block commit state transitions:


A block may skip the "Voted" state and go directly from "Proposed"
to "Finalized". This happens when consensus is far ahead of execution2


You could see multiple blocks that are "Proposed" or "Voted" for the
same block number, as explained in the section on
block ids.
Although it's possible, one nice property of Monad's consensus algorithm is that
it should be extremely rare for this to happen once a block becomes
"Voted"


When failure-to-finalize does occur, blocks are abandoned implicitly,
not explicitly; that is, the finalization of some block number N
implicitly abandons all competing blocks for that same block number, but
no explicit update is published for those block ids to mark them as
abandoned (i.e., there is no explicit "Abandoned" commit state)


There is currently no way to say something like "don't tell me about
a block until it enters the "Voted" state", although this feature will
be added before the mainnet release of Monad.
Checking if WebSocket support is enabled​
WebSocket support is an extra feature which may not be enabled on an RPC
server. A quick way to check if WebSocket connectivity is working is to use
a general purpose command-line tool that can act as WebSocket client, such
as websocat.
websocat is a powerful command-line "swiss army knife" tool, like nc or
the original socat. If it is not available through your system's package
manager, it can be installed with cargo install websocat, as it is a Rust
utility.
Here is an example of running it in verbose mode (-v):
> websocat -v wss://testnet-rpc.monad.xyz[INFO  websocat::lints] Auto-inserting the line mode[INFO  websocat::stdio_threaded_peer] get_stdio_peer (threaded)[INFO  websocat::ws_client_peer] get_ws_client_peer[INFO  websocat::net_peer] Connected to TCP 208.115.212.142:8081[INFO  websocat::ws_client_peer] Connected to ws
To subscribe, type the subscription JSON-RPC call for eth_subscribe into
your terminal's stdin and press enter:
{ "id": 1, "jsonrpc": "2.0", "method": "eth_subscribe", "params": ["newHeads"] }
Every half-second or so, you should see updates about new blocks.

Footnotes​


In the current implementation, blocks are always first seen in the
Proposed state, but you shouldn't write your software assuming this will
always be the case. If the consensus daemon is running far ahead of
execution, it would be possible to propagate a more accurate commit state
from consensus to execution. This is an optimization that no implementation
currently does, but a future implementation might do so. ↩


In the consensus algorithm itself, a block cannot skip directly
from Voted to Finalized. However, the real-time data stream you see is based
on the execution service's slightly-delayed view of what consensus is doing.
If execution starts lagging behind consensus for whatever reason, it might
discover that a block has already been Finalized by the time it sees the next
update for that block. In this case, it won't publish a notification of the
voted state transition, but will move the block directly to Finalized. ↩

## Code Examples

```prism
pip install web3
```

```prism
import asyncio
from web3 import AsyncWeb3from web3.providers.persistent import WebSocketProvider
ws_url = 'wss://testnet-rpc.monad.xyz'
async def print_latest():  async with AsyncWeb3(WebSocketProvider(ws_url)) as w3:    subscription_id = await w3.eth.subscribe('newHeads', {})    async for payload in w3.socket.process_subscriptions():      print(f"New block received: {payload['result']['number']}")
if __name__ == "__main__":  asyncio.run(print_latest())
```

```prism
python block-counter.py
```

```prism
New block received: 29165925New block received: 29165926New block received: 29165927
```

```prism
npm install ethers
```

```prism
import { WebSocketProvider } from "ethers/providers";
const wsUrl = "wss://testnet-rpc.monad.xyz"
const provider = new WebSocketProvider(wsUrl);
provider.on("block", (blockNumber) => {  console.log("New block received:", blockNumber);});
```

```prism
node block-counter.js
```

```prism
New block received: 29165925New block received: 29165926New block received: 29165927
```

```prism
{  "blockId": "0x71ce47f39a1eb490354166f762d78bf6e2acaf80b24b4bcd756118d93ef81be0",  "commitState": "Proposed",  "hash": "0x7a7d7c23bb8c5e340eead8537bb5e2f3e125bfa0b588cf07e4aa140ba374295e",  "parentHash": "0x9a71a95be3fe957457b11817587e5af4c7e24836d5b383c430ff25b9286a457f",  "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",  "miner": "0x1ad91ee08f21be3de0ba2ba6918e714da6b45836",  "stateRoot": "0x5e215f13dce86552d9083116be9f2b71f639d014fa9694f3dca9fb579bf4a717",  "transactionsRoot": "0xfe490e456649550c9f94cb46104da1d3eda87f06a1c33e578137d8cf1ef06fe6",  "receiptsRoot": "0x9ae198972e011bf3617a28ec72bef9a515f66d1d15988d92191eb3c7f231640a",  "logsBloom": "0x09e3c42e60df6a823da47b9b9e73b3a563ffddc9fb59802a087d92bf7e5bc92d7477f504864e1446cc46fb89c1bd63207f3f9bfbfba378f444f5895f53fee0fc10dbd395f546ffbefedfeef9712c4cf66ed3cf24df4f720b7bf67c2994337c607fa56e49ab6acd5efd7bb61428f8edcfa3e2d66dae3b8fd3c6942d36e8ea7403d107f7d97a57dfb50de96601410af486c7f5f6c55357a6fd2b30a979fb99d1a7bb9bbdbd1b227cbcdc9fff81ef73ab2bdc470a4bb9772eb658755fce551869a1f35b2e6338d06acd94e4dff638cf7dd74e5613ef178f16bbb0253f8f06eb7c64f6bbfffbeb165965d06f532da10edf63e54782c7ed9b05ca41efec457a95782f",  "difficulty": "0x310db4075e35d4",  "number": "0xe4e1c1",  "gasLimit": "0x1c9c380",  "gasUsed": "0x1579362",  "timestamp": "0x62b12cf8",  "extraData": "0x486976656f6e2072752d6865617679",  "mixHash": "0xc808debc77a41b82b5a6780fb288a47593ec636cdedab4feaeb65d91322f30b6",  "nonce": "0xdff7aec95842e5ed",  "baseFeePerGas": "0x3b541e0b1",  "totalDifficulty": "0x0",  "size": "0x2fe"}
```

```prism
> websocat -v wss://testnet-rpc.monad.xyz[INFO  websocat::lints] Auto-inserting the line mode[INFO  websocat::stdio_threaded_peer] get_stdio_peer (threaded)[INFO  websocat::ws_client_peer] get_ws_client_peer[INFO  websocat::net_peer] Connected to TCP 208.115.212.142:8081[INFO  websocat::ws_client_peer] Connected to ws
```

```prism
{ "id": 1, "jsonrpc": "2.0", "method": "eth_subscribe", "params": ["newHeads"] }
```

