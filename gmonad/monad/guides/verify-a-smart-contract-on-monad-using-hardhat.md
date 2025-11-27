# Verify a smart contract on Monad using Hardhat

> Source: https://docs.monad.xyz/guides/verify-smart-contract/hardhat

## Documentation

On this page

Once your contract is deployed to a live network, the next step is to verify its source code on the block explorer.
Verifying a contract means uploading its source code, along with the settings used to compile the code, to a
repository (typically maintained by a block explorer). This allows anyone to compile it and compare the generated
bytecode with what is deployed on chain. Doing this is extremely important in an open platform like Monad.
In this guide we'll explain how to do this using Hardhat.
tipThe verification command may show an error message, but this is often misleading - the contract is usually verified successfully on both Sourcify and MonadScan. Check the explorer links to confirm verification.
Hardhat 2Hardhat 3Hardhat 2 Verification​The hardhat-monad template is pre-configured to verify contracts on both MonadVision (Sourcify) and Monadscan (Etherscan) simultaneously.If you're using the template, your hardhat.config.ts should already have:import type { HardhatUserConfig } from "hardhat/config";import "@nomicfoundation/hardhat-toolbox-viem";import "@nomicfoundation/hardhat-ignition-viem";import "dotenv/config";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const config: HardhatUserConfig = {  solidity: {    version: "0.8.28",    settings: {      metadata: {        bytecodeHash: "ipfs", // Required for Sourcify verification      },    },  },  networks: {    monadTestnet: {      url: "https://testnet-rpc.monad.xyz",      accounts: [PRIVATE_KEY],      chainId: 10143,    },    monadMainnet: {      url: "https://rpc.monad.xyz",      accounts: [PRIVATE_KEY],      chainId: 143,    },  },  sourcify: {    enabled: true,    apiUrl: "https://sourcify-api-monad.blockvision.org",    browserUrl: "https://monadvision.com",  },  etherscan: {    enabled: true,    apiKey: {      monadMainnet: ETHERSCAN_API_KEY,      monadTestnet: ETHERSCAN_API_KEY,    },    customChains: [      {        network: "monadMainnet",        chainId: 143,        urls: {          apiURL: "https://api.etherscan.io/v2/api?chainid=143",          browserURL: "https://monadscan.com",        },      },      {        network: "monadTestnet",        chainId: 10143,        urls: {          apiURL: "https://api.etherscan.io/v2/api?chainid=10143",          browserURL: "https://testnet.monadscan.com",        },      },    ],  },};
export default config;Verify on Mainnet:npx hardhat verify <contract_address> --network monadMainnetVerify on Testnet:npx hardhat verify <contract_address> --network monadTestnetThis will verify your contract on both MonadVision and Monadscan. Once verified, you can view your contract on the respective explorers.Hardhat 3 Verification​tipThe verification command may show an error message, but this is often misleading - the contract is usually verified successfully on both Sourcify and MonadScan. Check the explorer links to confirm verification.The hardhat3-monad template is pre-configured to verify contracts on both MonadVision (Sourcify) and Monadscan (Etherscan). Hardhat 3 uses a different configuration structure with the verify key and chainDescriptors.If you're using the template, your hardhat.config.ts should already have:import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";import { defineConfig } from "hardhat/config";import "dotenv/config";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
export default defineConfig({  plugins: [hardhatToolboxViemPlugin],  solidity: {    version: "0.8.28",    settings: {      optimizer: {        enabled: true,        runs: 200,      },    },  },  networks: {    hardhat: {      type: "edr-simulated",    },    monadTestnet: {      type: "http",      url: "https://testnet-rpc.monad.xyz",      accounts: [PRIVATE_KEY],      chainId: 10143,    },    monadMainnet: {      type: "http",      url: "https://rpc.monad.xyz",      accounts: [PRIVATE_KEY],      chainId: 143,    },  },  verify: {    blockscout: {      enabled: false,    },    etherscan: {      enabled: true,      apiKey: ETHERSCAN_API_KEY,    },    sourcify: {      enabled: true,      apiUrl: "https://sourcify-api-monad.blockvision.org",    },  },  chainDescriptors: {    143: {      name: "MonadMainnet",      blockExplorers: {        etherscan: {          name: "Monadscan",          url: "https://monadscan.com",          apiUrl: "https://api.etherscan.io/v2/api",        },      },    },  },});Verify on Mainnet:npx hardhat verify <contract_address> --network monadMainnetVerify on Testnet:npx hardhat verify <contract_address> --network monadTestnetThis will verify your contract on both MonadVision and Monadscan. Once verified, you can view your contract on the respective explorers.

## Code Examples

```prism
import type { HardhatUserConfig } from "hardhat/config";import "@nomicfoundation/hardhat-toolbox-viem";import "@nomicfoundation/hardhat-ignition-viem";import "dotenv/config";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const config: HardhatUserConfig = {  solidity: {    version: "0.8.28",    settings: {      metadata: {        bytecodeHash: "ipfs", // Required for Sourcify verification      },    },  },  networks: {    monadTestnet: {      url: "https://testnet-rpc.monad.xyz",      accounts: [PRIVATE_KEY],      chainId: 10143,    },    monadMainnet: {      url: "https://rpc.monad.xyz",      accounts: [PRIVATE_KEY],      chainId: 143,    },  },  sourcify: {    enabled: true,    apiUrl: "https://sourcify-api-monad.blockvision.org",    browserUrl: "https://monadvision.com",  },  etherscan: {    enabled: true,    apiKey: {      monadMainnet: ETHERSCAN_API_KEY,      monadTestnet: ETHERSCAN_API_KEY,    },    customChains: [      {        network: "monadMainnet",        chainId: 143,        urls: {          apiURL: "https://api.etherscan.io/v2/api?chainid=143",          browserURL: "https://monadscan.com",        },      },      {        network: "monadTestnet",        chainId: 10143,        urls: {          apiURL: "https://api.etherscan.io/v2/api?chainid=10143",          browserURL: "https://testnet.monadscan.com",        },      },    ],  },};
export default config;
```

```prism
npx hardhat verify <contract_address> --network monadMainnet
```

```prism
npx hardhat verify <contract_address> --network monadTestnet
```

```prism
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";import { defineConfig } from "hardhat/config";import "dotenv/config";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
export default defineConfig({  plugins: [hardhatToolboxViemPlugin],  solidity: {    version: "0.8.28",    settings: {      optimizer: {        enabled: true,        runs: 200,      },    },  },  networks: {    hardhat: {      type: "edr-simulated",    },    monadTestnet: {      type: "http",      url: "https://testnet-rpc.monad.xyz",      accounts: [PRIVATE_KEY],      chainId: 10143,    },    monadMainnet: {      type: "http",      url: "https://rpc.monad.xyz",      accounts: [PRIVATE_KEY],      chainId: 143,    },  },  verify: {    blockscout: {      enabled: false,    },    etherscan: {      enabled: true,      apiKey: ETHERSCAN_API_KEY,    },    sourcify: {      enabled: true,      apiUrl: "https://sourcify-api-monad.blockvision.org",    },  },  chainDescriptors: {    143: {      name: "MonadMainnet",      blockExplorers: {        etherscan: {          name: "Monadscan",          url: "https://monadscan.com",          apiUrl: "https://api.etherscan.io/v2/api",        },      },    },  },});
```

```prism
npx hardhat verify <contract_address> --network monadMainnet
```

```prism
npx hardhat verify <contract_address> --network monadTestnet
```

