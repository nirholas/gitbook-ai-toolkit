# Opcode Pricing

> Source: https://docs.monad.xyz/developer-essentials/opcode-pricing

## Documentation

On this page

Summary​
Monad is a highly optimized system that introduces efficiencies across all dimensions -
compute, state access, and bandwidth utilization. However, the multiplier relative to legacy
EVM systems is not equal across all dimensions. As a result, some opcode gas price
changes are needed so that applications can unlock the full potential of the chain.
To minimize the number of gas price changes, rather than adjusting the gas pricing of almost
all opcodes down, Monad instead adjusts a few opcode prices up. This has the same relative
effect as discounting almost all opcodes.
The following costs are changed:

Cold access to state
A few precompiles

All other costs are as on Ethereum; evm.codes is a helpful reference.
noteThese changes are covered formally in the
Monad Initial Spec Proposal
Why are changes needed?​
The EVM's current pricing model needs adaptation to support a high-performance, low-fee regime.
The pricing model assigns a weight (gas amount) to each opcode based on perceived costliness to
the system, then charges the user only based on the calculated sum of weights. As resource
scarcity changes - and especially in the event of a completely new system - those weightings
must be revised.
The changes described in this page make the minimal set of adjustments to allow Monad to
deliver high performance and low fees, while minimizing disruption to users and protecting
the system against DOS attacks.
Cold access cost​
To account for the relatively higher cost of state reads from disk when compared to computation in the Monad execution client,
the cost for "cold" account and storage access costs changes:
Access TypeEthereumMonadAccount260010100Storage21008100
The following opcodes are impacted because of the differed gas costs:

Account access: BALANCE, EXTCODESIZE, EXTCODECOPY, EXTCODEHASH, CALL, CALLCODE,
DELEGATECALL, STATICCALL, SELFDESTRUCT
Storage access: SLOAD, SSTORE

noteGas costs for warm account access (100 gas) and storage access (100 gas) are the same on Monad as on Ethereum.
Precompiles​
A few precompiles have been repriced to accurately reflect their relative costs in execution.
PrecompileAddressEthereumMonadMultiplierecRecover0x01300060002ecAdd0x06150*300*2ecMul0x076000*30,000*5ecPairing0x0845,000*225,000*5blake2f0x09rounds∗1\text{rounds} * 1rounds∗1rounds∗2\text{rounds} * 2rounds∗22point eval0x0a50,000200,0004
∗: Per input/operation, as defined in the respective precompile specification

