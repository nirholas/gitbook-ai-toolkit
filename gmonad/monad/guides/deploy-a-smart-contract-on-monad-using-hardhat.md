# Deploy a smart contract on Monad using Hardhat

> Source: https://docs.monad.xyz/guides/deploy-smart-contract/hardhat

## Documentation

On this page

Hardhat is a comprehensive development environment consisting of different components for editing, compiling, debugging, and deploying your smart contracts.
Requirements​
Before you begin, you need to install the following dependencies:

Node.js v18.0.0 or later

noteIf you are on Windows, we strongly recommend using WSL 2 when following this guide.
Hardhat 2Hardhat31. Create a new Hardhat project​tipYou can use the hardhat-monad template to create a new project with Monad configuration already set up.hardhat-monad is a Hardhat template with Monad configuration.Clone the repository to your machine using the command below:git clone https://github.com/monad-developers/hardhat-monad.gitcd hardhat-monad2. Install dependencies​npm install3. Create an .env file​cp .env.example .envEdit the .env file with your private key:PRIVATE_KEY=your_private_key_herewarningProtect your private key carefully. Never commit it to version control, share it in public repositories, or expose it in client-side code. Your private key provides full access to your funds.4. Deploy the smart contract​The following commands use Hardhat Ignition:Deploying to the local hardhat node​Run hardhat node by running:npx hardhat nodeTo deploy the example contract to the local hardhat node, run the following command in a separate terminal:npx hardhat ignition deploy ignition/modules/Counter.tsDeploying to Monad Testnet​Ensure your private key is set in the .env file.Deploy the contract to Monad Testnet:npx hardhat ignition deploy ignition/modules/Counter.ts --network monadTestnetRedeploy the same code to a different address:npx hardhat ignition deploy ignition/modules/Counter.ts --network monadTestnet --resetDeploying to Monad Mainnet​Ensure your private key is set in the .env file.Deploy the contract to Monad Mainnet:npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnetRedeploy the same code to a different address:npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnet --reset1. Create a new Hardhat3 project​tipYou can use the hardhat3-monad template to create a new project with Monad configuration already set up for Hardhat3.hardhat3-monad is a Hardhat3 template with Monad configuration.To learn more about Hardhat3, please visit the Getting Started guide.Clone the repository to your machine using the command below:git clone https://github.com/monad-developers/hardhat3-monad.gitcd hardhat3-monad2. Install dependencies​npm install3. Set up your private key​Create a .env file in the project root:PRIVATE_KEY=your_private_key_hereETHERSCAN_API_KEY=your_etherscan_api_key_herewarningProtect your private key carefully. Never commit your .env file or expose your private key. Your private key provides full access to your funds.4. Deploy the smart contract​The following commands use Hardhat Ignition:Deploying to a local chain​npx hardhat ignition deploy ignition/modules/Counter.tsDeploying to Monad Testnet​Ensure your .env file is set up with your private key.npx hardhat ignition deploy ignition/modules/Counter.ts --network monadTestnetDeploying to Monad Mainnet​Ensure your .env file is set up with your private key.npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnet
Next Steps​
Check out how to verify the deployed smart contract on MonadVision.

## Code Examples

```prism
git clone https://github.com/monad-developers/hardhat-monad.gitcd hardhat-monad
```

```prism
npm install
```

```prism
cp .env.example .env
```

```prism
PRIVATE_KEY=your_private_key_here
```

```prism
npx hardhat node
```

```prism
npx hardhat ignition deploy ignition/modules/Counter.ts
```

```prism
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadTestnet
```

```prism
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadTestnet --reset
```

```prism
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnet
```

```prism
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnet --reset
```

```prism
git clone https://github.com/monad-developers/hardhat3-monad.gitcd hardhat3-monad
```

```prism
npm install
```

```prism
PRIVATE_KEY=your_private_key_hereETHERSCAN_API_KEY=your_etherscan_api_key_here
```

```prism
npx hardhat ignition deploy ignition/modules/Counter.ts
```

```prism
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadTestnet
```

```prism
npx hardhat ignition deploy ignition/modules/Counter.ts --network monadMainnet
```

