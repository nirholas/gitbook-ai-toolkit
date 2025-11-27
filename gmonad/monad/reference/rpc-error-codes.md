# RPC Error Codes

> Source: https://docs.monad.xyz/reference/rpc-error-codes

## Documentation

On this page

Monad supports a JSON-RPC interface for interacting with the blockchain.
Monad JSON-RPC aims to be equivalent to Ethereum JSON-RPC, however some error codes slightly deviate due to lack of standardization across Ethereum clients.
Monad Error Codes Reference​
Error CodeMessageExplanation-32601Parse errorUnable to parse JSON-RPC request-32601Invalid requestInvalid request such as request that exceeds size limit-32601Method not foundMethod that is not part of the JSON-RPC spec-32601Method not supportedMethod that is part of the JSON-RPC spec but not yet supported by Monad-32602Invalid block rangeMaximum eth_getLogs block range is configured per RPC provider, but is typically
limited to 1000 blocks-32602Invalid paramsRequest contains incorrect parameters associated to the particular method-32603Internal errorRequest that cannot be fulfilled due to internal error-32603Execution revertedeth_call and eth_estimateGas simulates transaction to revert-32603Transaction decoding errorRequest contains raw transaction that cannot be decoded

