# EVM Behavior

> Source: https://docs.monad.xyz/guides/evm-resources/evm-behavior

## Documentation

On this page

EVM Behavioral Specification​

Notes on the EVM: straightforward technical specification of the EVM plus some behavioral examples
EVM: From Solidity to bytecode, memory and storage: a 90-minute talk from Peter Robinson and David Hyland-Wood
EVM illustrated: an excellent set of diagrams for confirming your mental model
EVM Deep Dives: The Path to Shadowy Super-Coder

Opcode Reference​
noteOpcode pricing on Monad has been changed to reflect their relative costs in execution, learn more about it here
evm.codes: opcode reference and an interactive sandbox for stepping through bytecode execution
Solidity Storage Layout​
The EVM allows smart contracts to store data in 32-byte words ("storage slots"), however the details of how complex datastructures such as lists or mappings is left as an implementation detail to the higher-level language.  Solidity has a specific way of assigning variables to storage slots, described below:

Official docs on storage layout
Storage patterns in Solidity

