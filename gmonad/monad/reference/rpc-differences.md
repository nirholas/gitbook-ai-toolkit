# RPC Differences

> Source: https://docs.monad.xyz/reference/rpc-differences

## Documentation

On this page

Monad aims to match the RPC behavior as close as possible to Geth’s behavior, but due to
fundamental architectural differences, there are some differences listed below.
Logs​

eth_getLogs has a maximum block range, configured by RPC provider but typically set to 1000.
Because Monad blocks are much larger than Ethereum blocks, we recommend using small block
ranges (e.g. 1-10 blocks) for optimal performance. When requesting a longer range, requests
can take a long time to be fulfilled, and may time out.

Transactions​


eth_sendRawTransaction may not immediately reject transactions with a nonce gap or insufficient
gas balance as they would on Ethereum. The RPC server was designed with asynchronous execution
in mind, and under asynchronous execution, the RPC server may not have the latest account state.
Thus, these transactions are initially allowed, as they may become valid transactions during
block creation.


eth_sendRawTransaction, eth_call and eth_estimateGas do not accept EIP-4844 transaction
type, because EIP-4844 is not supported.


eth_getTransactionByHash does not return pending transactions. This method will only return
transactions that have been included in a block. If you query for a transaction that is still
in the mempool, the method will return null.


eth_call​

eth_calls that are reliant on old state (i.e. with an old block number) may fail, because
full nodes do not provide access to arbitrary historic state. See
Historical Data for a fuller discussion.

Fee-related methods​

eth_maxPriorityFeePerGas currently returns a hardcoded suggested fee of 2 gwei. This is
temporary.
eth_feeHistory handling of the case where newest_block = latest: by convention, this
method returns not only the fee history for the requested range, but also one extra
fee - the projected fee for the next block after that range. In Monad, we do not have all the
inputs required to compute the base fee for the next block, so if newest block requested is
latest, we will return the latest baseFeePerGas twice.

WebSocket (eth_subscribe) behavior​
Parent page: WebSocket Guide

eth_subscribe does not support the syncing or newPendingTransactions subscription types
Reorganizations never occur in the newHeads and logs subscription types, because only
real-time data for finalized blocks is presented
Monad-specific extensions to the newHeads and logs subcription types (called
monadNewHeads and monadLogs) are provided to offer
better latency

Debug/Trace Methods​


debug_traceCall, debug_traceTransaction, and related debug_trace* methods require the trace options object parameter to be explicitly provided. Unlike standard EVM clients where this parameter is optional, Monad RPC will return an error (-32602 Invalid params) if the parameter is omitted entirely.
Workaround: Always include the trace options parameter, even if empty:
{  "method": "debug_traceCall",  "params": [    {      "to": "0x6b175474e89094c44da98b954eedeac495271d0f"    },    "latest",    {}  ]}


When an empty trace options object {} is provided, Monad defaults to the callTracer instead of the struct logs tracer that is typical in other EVM clients. This is because Monad does not currently support opcode-level struct logs at the VM level.

## Code Examples

```prism
{  "method": "debug_traceCall",  "params": [    {      "to": "0x6b175474e89094c44da98b954eedeac495271d0f"    },    "latest",    {}  ]}
```

