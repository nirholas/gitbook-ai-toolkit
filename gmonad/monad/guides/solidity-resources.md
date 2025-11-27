# Solidity Resources

> Source: https://docs.monad.xyz/guides/evm-resources/solidity-resources

## Documentation

On this page

Monad is fully EVM bytecode-compatible, with all supported opcodes and precompiles as of the Cancun fork. Monad also preserves the standard Ethereum JSON-RPC interfaces.
As such, most development resources for Ethereum Mainnet apply to development on Monad.
This page suggests a minimal set of resources for getting started with building a decentralized app for Ethereum. Child pages provide additional detail or options. 
As Solidity is the most popular language for Ethereum smart contracts, the resources on this page focus on Solidity; alternatively see resources on Vyper or Huff. Note that since smart contracts are composable, contracts originally written in one language can still make calls to contracts in another language.
IDEs​

Remix is an interactive Solidity IDE. It is the easiest and fastest way to get started coding and compiling Solidity smart contracts without the need for additional tool installations.
VSCode + Solidity extension

Basic Solidity​

CryptoZombies is a great end-to-end introduction to building dApps on the EVM. It provides resources and lessons for anyone from someone who has never coded before, to experienced developers in other disciplines looking to explore blockchain development.
Solidity by Example introduces concepts progressively through simple examples; best for developers who already have basic experience with other languages.
Blockchain Basics course by Cyfrin Updraft teaches the fundamentals of blockchain, DeFi, and smart contracts.
Solidity Smart Contract Development by Cyfrin Updraft will teach you how to become a smart contract developer. Learn to build with projects and get hands-on experience.
Ethereum Developer Degree by LearnWeb3 is the a good course to go from no background knowledge in web3 to being able to build multiple applications and understanding several key protocols, frameworks, and concepts in the web3 space.

Intermediate Solidity​

The Solidity Language official documentation is an end-to-end description of Smart Contracts and blockchain basics centered on EVM environments. In addition to Solidity Language documentation, it covers the basics of compiling your code for deployment on an EVM as well as the basic components relevant to deploying a Smart Contract on an EVM.
Solidity Patterns repository provides a library of code templates and explanation of their usage. 
The Uniswap V2 contract is a professional yet easy to digest smart contract that provides a great overview of an in-production Solidity dApp. A guided walkthrough of the contract can be found here.
Cookbook.dev provides a set of interactive example template contracts with live editing, one-click deploy, and an AI chat integration to help with code questions. 
OpenZeppelin provides customizable template contract library for common Ethereum token deployments such as ERC20, ERC712, and ERC1155. Note, they are not gas optimized.
Rareskills Blog has some great in-depth articles on various concepts in Solidity.
Foundry Fundamentals course by Cyfrin Updraft is a comprehensive web3 development course designed to teach you about Foundry the industry-standard framework to build, deploy, and test your smart contracts.
Smart Contract Programmer YT channel has a plenty of in-depth videos about various Solidity concepts like ABI encoding, EVM memory, and many more.

Advanced Solidity​

The Solmate repository and Solady repository provide gas-optimized contracts utilizing Solidity or Yul.
Yul is a intermediate language for Solidity that can generally be thought of as inline assembly for the EVM. It is not quite pure assembly, providing control flow constructs and abstracting away the inner working of the stack while still exposing the raw memory backend to developers. Yul is targeted at developers needing exposure to the EVM's raw memory backend to build high performance gas optimized EVM code. 
Huff is most closely described as EVM assembly. Unlike Yul, Huff does not provide control flow constructs or abstract away the inner working of the program stack. Only the most upmost performance sensitive applications take advantage of Huff, however it is a great educational tool to learn how the EVM interprets instructions its lowest level.
Advanced Foundry course by Cyfrin Updraft teaches you about Foundry, how to develop a DeFi protocol and a stablecoin, how to develop a DAO, advanced smart contract development, advanced smart contracts testing and fuzzing and manual verification.
Smart Contract Security course by Cyfrin Updraft will teach you everything you need to know to get started auditing and writing secure protocols.
Assembly and Formal Verification course by Cyfrin Updraft teaches you about Assembly, writing smart contracts using Huff and Yul, Ethereum Virtual Machine OPCodes, Formal verification testing, Smart contract invariant testing and tools like Halmos, Certora, Kontrol.
Smart Contract DevOps course by Cyfrin Updraft teaches about access control best practices when working with wallets, post-deployment security, smart contract and web3 devOps and live protocols maintenance and monitoring.
Secureum YT Channel has plenty videos about Solidity from Solidity Basics to all the way to advanced concepts like Fuzzing and Solidity auditing.

Tutorials​

Ethernaut: learn by solving puzzles
Damn Vulnerable DeFi: DVD is a series of smart contract challenges which consists of vulnerable contracts and you are supposed to be able to hack it. These challenges are a good way to practice and apply the Solidity skills you have acquired.

Best practices/patterns​

DeFi developer roadmap
RareSkills Book of Gas Optimization

Testing​

Echidna: fuzz testing
Slither: static analysis for vulnerability detection
solidity-coverage: code coverage for Solidity testing

Smart contract archives​

Smart contract sanctuary - contracts verified on Etherscan
EVM function signature database

