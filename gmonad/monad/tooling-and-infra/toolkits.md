# Toolkits

> Source: https://docs.monad.xyz/tooling-and-infra/toolkits

## Documentation

On this page

Summary​
ToolkitStatusNotesFoundry✅Use nightly release: foundryup -i nightlyHardhat✅
Provider Details​
Developers often find it helpful to build their project in the context of a broader framework that organizes external dependencies (i.e. package management), organizes unit and integration tests, defines a deployment procedure (against local nodes, testnet, and mainnet), records gas costs, etc.
Here are the two most popular toolkits for Solidity development:

Foundry is a Solidity framework for both development and testing. Foundry manages your dependencies, compiles your project, runs tests, deploys, and lets you interact with the chain from the command-line and via Solidity scripts. Foundry users typically write their smart contracts and tests in the Solidity language.
Hardhat is a Solidity development framework paired with a JavaScript testing framework. It allows for similar functionality as Foundry, and was the dominant toolchain for EVM developers prior to Foundry.

