# Verify a smart contract on Monad using Foundry

> Source: https://docs.monad.xyz/guides/verify-smart-contract/foundry

## Documentation

On this page

Once your contract is deployed to a live network, the next step is to verify its source code on the block explorer.
Verifying a contract means uploading its source code, along with the settings used to compile the code, to a
repository (typically maintained by a block explorer). This allows anyone to compile it and compare the generated
bytecode with what is deployed on chain. Doing this is extremely important in an open platform like Monad.
In this guide we'll explain how to do this using Foundry.
MainnetTestnetFoundry Monad template (Recommended)Default Foundry ProjectnoteThe foundry-monad template is configured for testnet by default. To use mainnet, update your foundry.toml file:
Change eth-rpc-url="https://testnet-rpc.monad.xyz" to your mainnet RPC URL
Change chain_id = 10143 to 143
If you are using foundry-monad template, you can use the commands below based on your preferred block explorer:MonadVisionMonadscanSocialscanforge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.orgExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.orgOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnetAttempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.
Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".Contract successfully verifiedNow check the contract on MonadVision.forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watchExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watchOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `OK`        GUID: `fhxxx4wsub68jce24ejvhe68fqabgtpmpzheqpdqvencgph1za`        URL: https://monadscan.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `NOTOK`Details: `Pending in queue`Warning: Verification is still pending...; waiting 15 seconds before trying again (7 tries remaining)Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verifiedNow check the contract on Monadscan.forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --watch \    --etherscan-api-key <your_api_key> \    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \    --verifier etherscanExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --watch \    --etherscan-api-key test \    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \    --verifier etherscanOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `Contract successfully verified`        GUID: `33588004868f0677a3c23734da00fc42895a63542f61b1ed0dbfd2eb6893d7f4`        URL: https://monad.socialscan.io/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verifiedNow check the contract on Socialscan.1. Update foundry.toml with Monad Configuration​foundry.toml1234567891011[profile.default]src = "src"out = "out"libs = ["lib"]metadata = truemetadata_hash = "none"  # disable ipfsuse_literal_content = true # use source code
# Monad Configurationeth-rpc-url="https://rpc.monad.xyz"chain_id = 1432. Verify the contract using one of the following block explorers:​MonadVisionMonadscanSocialscannoteIf you are using MonadVision, you can use
this guide.
In particular, the Verify Contract
page provides a convenient way to verify your contract.forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.orgExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.orgOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnetAttempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.
Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".Contract successfully verifiedNow check the contract on MonadVision.forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watchExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watchOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `OK`        GUID: `fhxxx4wsub68jce24ejvhe68fqabgtpmpzheqpdqvencgph1za`        URL: https://monadscan.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `NOTOK`Details: `Pending in queue`Warning: Verification is still pending...; waiting 15 seconds before trying again (7 tries remaining)Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verifiedNow check the contract on Monadscan.forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --watch \    --etherscan-api-key <your_api_key> \    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \    --verifier etherscanExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --watch \    --etherscan-api-key test \    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \    --verifier etherscanOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `Contract successfully verified`        GUID: `33588004868f0677a3c23734da00fc42895a63542f61b1ed0dbfd2eb6893d7f4`        URL: https://monad.socialscan.io/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verifiedNow check the contract on Socialscan.Foundry Monad template (Recommended)Default Foundry ProjectIf you are using foundry-monad template, you can use the commands below based on your preferred block explorer:MonadVisionMonadscanSocialscanforge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.orgExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.orgOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnetAttempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.
Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".Contract successfully verifiedNow check the contract on MonadVision.forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watchExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watchOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `OK`        GUID: `fhxxx4wsub68jce24ejvhe68fqabgtpmpzheqpdqvencgph1za`        URL: https://testnet.monadscan.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `NOTOK`Details: `Pending in queue`Warning: Verification is still pending...; waiting 15 seconds before trying again (7 tries remaining)Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verifiedNow check the contract on Monadscan.forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --watch \    --etherscan-api-key <your_api_key> \    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \    --verifier etherscanExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --watch \    --etherscan-api-key test \    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \    --verifier etherscanOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `Contract successfully verified`        GUID: `33588004868f0677a3c23734da00fc42895a63542f61b1ed0dbfd2eb6893d7f4`        URL: https://api.socialscan.io/monad-testnet/v1/explorer/command_api/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verifiedNow check the contract on Socialscan.tipIf you use foundry-monad you can skip the configuration step1. Update foundry.toml with Monad Configuration​foundry.toml1234567891011[profile.default]src = "src"out = "out"libs = ["lib"]  metadata = truemetadata_hash = "none"  # disable ipfsuse_literal_content = true # use source code
# Monad Configurationeth-rpc-url="https://testnet-rpc.monad.xyz"chain_id = 101432. Verify the contract using one of the following block explorers:​MonadVisionMonadscanSocialscanforge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.orgExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.orgOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnetAttempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.
Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".Contract successfully verifiedNow check the contract on MonadVision.forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watchExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watchOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `OK`        GUID: `fhxxx4wsub68jce24ejvhe68fqabgtpmpzheqpdqvencgph1za`        URL: https://testnet.monadvision.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `NOTOK`Details: `Pending in queue`Warning: Verification is still pending...; waiting 15 seconds before trying again (7 tries remaining)Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verifiedNow check the contract on Monadscan.forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --watch \    --etherscan-api-key <your_api_key> \    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \    --verifier etherscanExample:forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --watch \    --etherscan-api-key test \    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \    --verifier etherscanOn successful verification of smart contract, you should get a similar output in your terminal:Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `Contract successfully verified`        GUID: `33588004868f0677a3c23734da00fc42895a63542f61b1ed0dbfd2eb6893d7f4`        URL: https://testnet.monadvision.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verifiedNow check the contract on Socialscan.

## Code Examples

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.org
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.org
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnetAttempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.
Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".Contract successfully verified
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watch
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watch
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `OK`        GUID: `fhxxx4wsub68jce24ejvhe68fqabgtpmpzheqpdqvencgph1za`        URL: https://monadscan.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `NOTOK`Details: `Pending in queue`Warning: Verification is still pending...; waiting 15 seconds before trying again (7 tries remaining)Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verified
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --watch \    --etherscan-api-key <your_api_key> \    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \    --verifier etherscan
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --watch \    --etherscan-api-key test \    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \    --verifier etherscan
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `Contract successfully verified`        GUID: `33588004868f0677a3c23734da00fc42895a63542f61b1ed0dbfd2eb6893d7f4`        URL: https://monad.socialscan.io/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verified
```

```prism
[profile.default]src = "src"out = "out"libs = ["lib"]metadata = truemetadata_hash = "none"  # disable ipfsuse_literal_content = true # use source code
# Monad Configurationeth-rpc-url="https://rpc.monad.xyz"chain_id = 143
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.org
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.org
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnetAttempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.
Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".Contract successfully verified
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watch
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watch
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `OK`        GUID: `fhxxx4wsub68jce24ejvhe68fqabgtpmpzheqpdqvencgph1za`        URL: https://monadscan.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `NOTOK`Details: `Pending in queue`Warning: Verification is still pending...; waiting 15 seconds before trying again (7 tries remaining)Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verified
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 143 \    --watch \    --etherscan-api-key <your_api_key> \    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \    --verifier etherscan
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 143 \    --watch \    --etherscan-api-key test \    --verifier-url https://api.socialscan.io/monad-mainnet/v1/explorer/command_api/contract \    --verifier etherscan
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-mainnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `Contract successfully verified`        GUID: `33588004868f0677a3c23734da00fc42895a63542f61b1ed0dbfd2eb6893d7f4`        URL: https://monad.socialscan.io/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verified
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.org
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.org
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnetAttempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.
Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".Contract successfully verified
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watch
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watch
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `OK`        GUID: `fhxxx4wsub68jce24ejvhe68fqabgtpmpzheqpdqvencgph1za`        URL: https://testnet.monadscan.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `NOTOK`Details: `Pending in queue`Warning: Verification is still pending...; waiting 15 seconds before trying again (7 tries remaining)Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verified
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --watch \    --etherscan-api-key <your_api_key> \    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \    --verifier etherscan
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --watch \    --etherscan-api-key test \    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \    --verifier etherscan
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `Contract successfully verified`        GUID: `33588004868f0677a3c23734da00fc42895a63542f61b1ed0dbfd2eb6893d7f4`        URL: https://api.socialscan.io/monad-testnet/v1/explorer/command_api/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verified
```

```prism
[profile.default]src = "src"out = "out"libs = ["lib"]  metadata = truemetadata_hash = "none"  # disable ipfsuse_literal_content = true # use source code
# Monad Configurationeth-rpc-url="https://testnet-rpc.monad.xyz"chain_id = 10143
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.org
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --verifier sourcify \    --verifier-url https://sourcify-api-monad.blockvision.org
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnetAttempting to verify on Sourcify. Pass the --etherscan-api-key <API_KEY> to verify on Etherscan, or use the --verifier flag to verify on another provider.
Submitting verification for [Counter] "0x8fEc29BdEd7A618ab6E3CD945456A79163995769".Contract successfully verified
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watch
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --verifier etherscan \    --etherscan-api-key YourApiKeyToken \    --watch
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `OK`        GUID: `fhxxx4wsub68jce24ejvhe68fqabgtpmpzheqpdqvencgph1za`        URL: https://testnet.monadvision.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `NOTOK`Details: `Pending in queue`Warning: Verification is still pending...; waiting 15 seconds before trying again (7 tries remaining)Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verified
```

```prism
forge verify-contract \    <contract_address> \    <contract_name> \    --chain 10143 \    --watch \    --etherscan-api-key <your_api_key> \    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \    --verifier etherscan
```

```prism
forge verify-contract \    0x8fEc29BdEd7A618ab6E3CD945456A79163995769 \    Counter \    --chain 10143 \    --watch \    --etherscan-api-key test \    --verifier-url https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract \    --verifier etherscan
```

```prism
Start verifying contract `0x8fEc29BdEd7A618ab6E3CD945456A79163995769` deployed on monad-testnet
Submitting verification for [src/Counter.sol:Counter] 0x8fEc29BdEd7A618ab6E3CD945456A79163995769.Submitted contract for verification:        Response: `Contract successfully verified`        GUID: `33588004868f0677a3c23734da00fc42895a63542f61b1ed0dbfd2eb6893d7f4`        URL: https://testnet.monadvision.com/address/0x8fec29bded7a618ab6e3cd945456a79163995769Contract verification status:Response: `OK`Details: `Pass - Verified`Contract successfully verified
```

