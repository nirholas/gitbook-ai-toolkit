# JSON-RPC API

> Source: https://docs.monad.xyz/reference/json-rpc/

## Documentation

On this page

This section provides an interactive reference for the Monad's JSON-RPC API.
For a simple example, try getting the latest block.
Debug methods​

debug_getRawBlock - returns an RLP-encoded block
debug_getRawHeader - returns an RLP-encoded header
debug_getRawReceipts - returns an array of EIP-2718 binary-encoded receipts
debug_getRawTransaction - returns an EIP-2718 binary-encoded transaction
debug_traceBlockByHash -
returns the tracing result by executing all transactions in the block; supports callTracer or prestateTracer
debug_traceBlockByNumber - same
debug_traceCall - returns the tracing result by executing an eth_call
debug_traceTransaction -
returns all the traces of a given transaction

Eth methods​

eth_blockNumber - returns the most recent block number
eth_call - simulates calling a smart contract without writing a transaction
eth_chainId - returns the chainId in hex
eth_createAccessList - returns an access list
containing all addresses and storage slots accessed during a simulated transaction
eth_estimateGas -
estimates the gasLimit for a smart contract call to run successfully, using simulation and binary search
eth_feeHistory - returns transaction base fee per gas and
effective priority fee per gas for the block range
eth_gasPrice - returns the current price per gas in MON-wei in hex
eth_getBalance - returns the balance of an account in MON-wei in hex
eth_getBlockByHash - returns a block
eth_getBlockByNumber - returns a block
eth_getBlockReceipts - returns the receipts of a block
eth_getBlockTransactionCountByHash -
returns the number of transactions in a block
eth_getBlockTransactionCountByNumber -
returns the number of transactions in a block
eth_getTransactionByBlockHashAndIndex - returns a transaction
eth_getTransactionByBlockNumberAndIndex - returns a transaction
eth_getTransactionByHash - returns a transaction
eth_getTransactionCount - returns the nonce of an address
eth_getTransactionReceipt - returns the receipt for a transaction
eth_maxPriorityFeePerGas - returns the current maxPriorityFeePerGas in MON-wei
eth_sendRawTransaction
eth_syncing - indicates if node is currently syncing (RPC providers should ensure no node that returns true for this call is serving users)

Other methods​

admin_ethCallStatistics - ignore, for internal purposes
net_version - always returns the chain id
txpool_statusByAddress - returns the status of
pending transactions this RPC server is aware of from this sender. Since there is no global
mempool, the RPC would typically be aware of a transaction
because it was submitted through this RPC
txpool_statusByHash - returns the status of
pending transactions this RPC is aware of with this hash
web3_clientVersion - returns the Monad version

