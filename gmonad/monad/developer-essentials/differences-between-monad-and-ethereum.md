# Differences between Monad and Ethereum

> Source: https://docs.monad.xyz/developer-essentials/differences

## Documentation

On this page

This list assembles notable behavioral differences between Monad and Ethereum from the
perspective of a smart contract developer.
Virtual Machine​


Max contract size is 128kb (up from 24.5kb in Ethereum).


A few opcodes and precompiles are repriced, to reweight relative scarcities of resources due
to Monad optimizations. See Opcode Pricing.


The secp256r1 (P256) verification precompile in
RIP-7212 is supported.
See Precompiles.


Transactions​


Transactions are charged based on gas limit rather than gas usage, i.e. total tokens deducted
from the sender's balance is value + gas_bid * gas_limit. As discussed in
Gas in Monad, this is a DOS-prevention measure for
asynchronous execution.


Consensus and execution utilize the Reserve Balance mechanism to ensure
that all transactions included in consensus can be paid for. This mechanism places light
restrictions on transaction inclusion at consensus time, and defines select conditions under
which a transaction will revert at execution time.


Due to the Reserve Balance mechanism, you may see transactions in the blockchain which
ultimately fail due to trying to spend too much MON relative to account balance.
These transactions still pay for gas and are valid transactions whose result is execution
reversion. This isn't a protocol difference, as many reverting Ethereum transactions are
included in the chain, but it may be different from expectation.
Longer discussion.


Transaction type 3 (EIP-4844 type aka blob transactions) is not supported.


There is no global mempool. For efficiency, transactions are forwarded to the next few leadersas
described in Local Mempool.


EIP-7702 Delegation​


If an EOA is EIP-7702-delegated, its balance cannot be lowered below 10 MON due to the
Reserve Balance rules. (If the delegation is removed, dipping below 10 MON
is allowed.) Discussion.


If an EOA is EIP-7702-delegated, when it is called as a smart contract, the
CREATE and CREATE2 opcodes are banned. Discussion.


Historical Data​

Due to Monad's high throughput, full nodes do not provide access to arbitrary historic state, as
this would require too much storage. See Historical Data for a fuller
discussion.

RPC​
See: RPC Differences

