# RPC Limits

> Source: https://docs.monad.xyz/reference/rpc-limits

## Documentation

On this page

eth_call / eth_estimateGas​
Gas limit (per call)​
ProviderPublic RPCGas limitQuickNoderpc.monad.xyz200M gasAlchemyrpc1.monad.xyz200M gasAnkrrpc3.monad.xyz1B gasMonad Foundationrpc-mainnet.monadinfra.com200M gas
node operator configThese limits are configured by the node operator with
--eth-call-provider-gas-limit and --eth-estimate-gas-provider-gas-limit.--eth-call-provider-gas-limit <ETH_CALL_PROVIDER_GAS_LIMIT>    Set the gas limit for eth_call [default: 30000000]--eth-estimate-gas-provider-gas-limit <ETH_ESTIMATE_GAS_PROVIDER_GAS_LIMIT>    Set the gas limit for eth_estimateGas [default: 30000000]
Behavior when gas price is specified​
Typically, eth_call and eth_estimateGas calls don't have gas price  (gasPrice for
legacy transactions and maxFeePerGas for non legacy transactions) specified.
Therefore, when the user goes out of their way to populate this parameter, special logic is
utilized:
If a eth_call or eth_estimateGas request has the gas price populated, the gas limit
for the call will be the min(gas limit allowance, provider gas limit), where the gas limit
allowance is the maximum gas limit given the user's gas balance and specified gas price.
This is consistent with Geth's behaviour.
Behavior when gas price is not specified​
If the eth_call or eth_estimateGasrequest does not have the gas price populated, the gas
limit for the call will be provider gas limit. This is consistent with Geth's behavior.
Request routing by gas limit​
eth_call and eth_estimateGas requests are executed via a dual-pool execution model based on
the user-specified gas limit, if present:

Low-gas pool: For calls with gas limit ≤ 8,100,000.
High-gas pool: For calls with gas limit > 8,100,000.

When a caller does not specify the gas limit, the system initially executes the call in the low-gas pool.
If execution runs out of gas in that pool, it automatically retries the call in the high-gas pool.
node operator configThroughput of the above two pools is determined by the following RPC CLI parameters:--eth-call-max-concurrent-requests <ETH_CALL_MAX_CONCURRENT_REQUESTS>    Set the max concurrent requests for eth_call and eth_estimateGas [default: 1000]--eth-call-high-max-concurrent-requests <ETH_CALL_HIGH_MAX_CONCURRENT_REQUESTS>    Set the max concurrent requests for eth_call and eth_estimateGas with high gas cost [default: 20]
eth_getLogs​
Block range limit (per call)​
ProviderPublic RPCBlock range limitQuickNoderpc.monad.xyz100 blocksAlchemyrpc1.monad.xyz1000 blocks and 10,000 logs (whichever is more constraining)Ankrrpc3.monad.xyz1000 blocksMonad Foundationrpc-mainnet.monadinfra.com100 blocks
Note: these are configured by the node operator with
--eth-get-logs-max-block-range.
Why do these limits exist?​
Monad produces a block every 400ms and can accommodate up to 5,000 transactions per block with
computation up to 200M gas. This means that not only are blocks extremely frequent, but each block
can also contain significantly more data.  This is the main motivation for keeping the block
range limits low.
Recommended query strategy​
Based on recent internal testing, when indexing the chain we recommend adjusting your pipeline to
use a 100-block range with high concurrency (for example, 100 workers). This configuration should
give you extremely fast results.
Further improvements to eth_getLogs are being explored for the near future.

## Code Examples

```prism
--eth-call-provider-gas-limit <ETH_CALL_PROVIDER_GAS_LIMIT>    Set the gas limit for eth_call [default: 30000000]--eth-estimate-gas-provider-gas-limit <ETH_ESTIMATE_GAS_PROVIDER_GAS_LIMIT>    Set the gas limit for eth_estimateGas [default: 30000000]
```

```prism
--eth-call-max-concurrent-requests <ETH_CALL_MAX_CONCURRENT_REQUESTS>    Set the max concurrent requests for eth_call and eth_estimateGas [default: 1000]--eth-call-high-max-concurrent-requests <ETH_CALL_HIGH_MAX_CONCURRENT_REQUESTS>    Set the max concurrent requests for eth_call and eth_estimateGas with high gas cost [default: 20]
```

