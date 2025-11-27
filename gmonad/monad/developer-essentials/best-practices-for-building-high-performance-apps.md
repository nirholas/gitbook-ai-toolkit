# Best Practices for Building High Performance Apps

> Source: https://docs.monad.xyz/developer-essentials/best-practices

## Documentation

On this page

Configure web hosting to keep costs under control​

Vercel and Railway provide convenient serverless platforms for hosting your
application, abstracting away the logistics of web hosting relative to using a
cloud provider directly. You may end up paying a premium for the convenience,
especially at higher volumes.
AWS and other cloud providers offer more flexibility and commodity pricing.
Before choosing any service, check pricing and be aware that many providers
offer loss-leader pricing on lower volumes, but then charge higher rates once
you hit a certain threshold.

For example, suppose there is a $20 plan that includes 1 TB per month of
data transfer, with $0.20 per GB beyond that. Do the math to note that the second TB
(and onward) will cost $200. If the next tier up says "contact us", don't
assume the next tier up will be charging $20 per TB.
If you are building a high-traffic app and you aren't careful about serving
static files more cheaply, it will be easy to exceed the loss-leader tier
and pay much more than you expect.


For production deployments on AWS, consider:

Amazon S3 + CloudFront for static file hosting and CDN
AWS Lambda for serverless functions
Amazon ECS or EKS for containerized applications
Amazon RDS for database needs
This setup typically provides granular cost control and scalability for
high-traffic applications.



Use a hardcoded value instead of eth_estimateGas call if gas usage is static​
Many on-chain actions have a fixed gas cost. The simplest example is that a
transfer of native tokens always costs 21,000 gas, but there are many others.
This makes it unnecessary to call eth_estimateGas for each transaction.
Use a hardcoded value instead, as suggested
here.
Eliminating an eth_estimateGas call substantially speeds up the user workflow
in the wallet, and avoids a potential bad behavior in some wallets when
eth_estimateGas reverts (discussed in the linked page).
Reduce eth_call latency by submitting multiple requests concurrently​
Making multiple eth_call requests serially will introduce unnecessary latency
due to multiple round trips to an RPC node. You can make many eth_calls
concurrently, either by condensing them into a single eth_call or by
submitting a batch of calls. Alternatively, you might find it better to switch
to an indexer.
Condensing multiple eth_calls into one​

Multicall: Multicall is a utility smart contract that allows you to
aggregate multiple read requests (eth_call) into a single one. This is
particularly effective for fetching data points like token balances,
allowances, or contract parameters simultaneously. The standard Multicall3
contract is deployed at
0xcA11bde05977b3631167028862bE2a173976CA11 on both Monad Mainnet and Monad Testnet.
Many libraries offer helper functions to simplify multicall usage, e.g.
viem. Read more about
Multicall3 here.
Custom Batching Contracts: For complex read patterns or scenarios not
easily handled by the standard multicall contract, you can deploy a custom
smart contract that aggregates the required data in a single function, which
can then be invoked via a single eth_call.

noteMulticall executes calls serially as you can see from the code
here.
So while using multicall avoids multiple round trips to an RPC server, it is
still inadvisable to put too many expensive calls into one multicall. A batch
of calls (explained next) can be executed on the RPC in parallel.
Submitting a batch of calls​
Most major libraries support batching multiple RPC requests into a single
message.
For example, viem handles Promise.all() on an array of promises by
submitting them as a single batch:
const resultPromises = Array(BATCH_SIZE)  .fill(null)  .map(async (_, i) => {    return await PUBLIC_CLIENT.simulateContract({        address: ...,        abi: ...,        functionName: ...,        args: [...],      })  })const results = await Promise.all(resultPromises)
Use indexers for read-heavy loads​
If your application frequently queries historical events or derived state,
consider using an indexer, as described next.
Use an indexer instead of repeatedly calling eth_getLogs to listen for your events​
Below is a quickstart guide for the most popular data indexing solutions. Please
view the indexer docs for more details.
Using Allium​
noteSee also: AlliumYou'll need an Allium account, which you can request
here.

Allium Explorer

Blockchain analytics platform that provides SQL-based access to
historical blockchain data (blocks, transactions, logs, traces, and
contracts).
You can create Explorer APIs through the
GUI to query and analyze historical
blockchain data. When creating a Query for an API
here (using the New button),
select Monad Mainnet or Monad Testnet from the chain list.
Relevant docs:

Explorer Documentation
Explorer API




Allium Datastreams

Provides real-time blockchain data streams (including blocks,
transactions, logs, traces, contracts, and balance snapshots) through
Kafka, Pub/Sub, and Amazon SNS.
GUI to create new streams
for onchain data. When creating a stream, select the relevant Monad Mainnet or Monad Testnet topics from the Select topics dropdown.
Relevant docs:

Datastreams Documentation
Getting Started with Google Pub/Sub




Allium Developers

Enables fetching wallet transaction activity and tracking balances
(native, ERC20, ERC721, ERC1155).
For the request's body, use monad_mainnet for Monad Mainnet or monad_testnet for Monad Testnet as the chain parameter.
Relevant docs:

API Key Setup Guide
Wallet APIs Documentation





Using Envio HyperIndex​
noteSee also: Envio
and Guide: How to use Envio HyperIndex to build a token transfer notification bot


Follow the quick start
to create an indexer. In the config.yaml file, use network ID 10143 to
select Monad testnet (used in the example below) or network ID 143 for Monad mainnet.


Example configuration


Sample config.yaml file
config.yaml1234567891011121314151617181920212223name: your-indexers-namenetworks:- id: 10143  # Monad Testnet  # Optional custom RPC configuration - only add if default indexing has issues  # rpc_config:  #   url: YOUR_RPC_URL_HERE  # Replace with your RPC URL (e.g., from Alchemy)  #   interval_ceiling: 50     # Maximum number of blocks to fetch in a single request  #   acceleration_additive: 10  # Speed up factor for block fetching  #   initial_block_interval: 10  # Initial block fetch interval size  start_block: 0  # Replace with the block you want to start indexing from  contracts:  - name: YourContract  # Replace with your contract name    address:    - 0x0000000000000000000000000000000000000000  # Replace with your contract address    # Add more addresses if needed for multiple deployments of the same contract    handler: src/EventHandlers.ts    events:    # Replace with your event signatures    # Format: EventName(paramType paramName, paramType2 paramName2, ...)    # Example: Transfer(address from, address to, uint256 amount)    # Example: OrderCreated(uint40 orderId, address owner, uint96 size, uint32 price, bool isBuy)    - event: EventOne(paramType1 paramName1, paramType2 paramName2)    # Add more events as needed


Sample EventHandlers.ts
EventHandlers.ts12345678910111213141516171819202122import {  YourContract,  YourContract_EventOne,} from "generated";
// Handler for EventOne// Replace parameter types and names based on your event definitionYourContract.EventOne.handler(async ({ event, context }) => {  // Create a unique ID for this event instance  const entity: YourContract_EventOne = {    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,    // Replace these with your actual event parameters    paramName1: event.params.paramName1,    paramName2: event.params.paramName2,    // Add any additional fields you want to store  };
  // Store the event in the database  context.YourContract_EventOne.set(entity);})
// Add more event handlers as needed




Important: The rpc_config section under a network (check config.yaml
sample) is optional and should only be configured if you experience issues
with the default Envio setup. This configuration allows you to:

Use your own RPC endpoint
Configure block fetching parameters for better performance



Relevant docs:

Overview



Using GhostGraph​
noteSee also: Ghost

Relevant docs:

Getting Started
Setting up a GhostGraph Indexer on Monad Testnet



Using Goldsky​
noteSee also: Goldsky

Goldsky Subgraphs

To deploy a Goldsky subgraph follow
this guide.
As the network identifier, use monad-mainnet for Monad Mainnet or monad-testnet for Monad Testnet. For subgraph
configuration examples, refer to The Graph Protocol section
below.
For information about querying Goldsky subgraphs, see the
GraphQL API documentation.


Goldsky Mirror

Enables direct streaming of on-chain data to your database.
For the chain name in the dataset_name field when creating a source
for a pipeline, use monad_mainnet for Monad Mainnet or monad_testnet for Monad Testnet (check below example)
Example pipeline.yaml config file
pipeline.yaml12345678910111213141516171819202122232425262728293031323334name: monad-testnet-erc20-transfersapiVersion: 3sources:  monad_testnet_erc20_transfers:    dataset_name: monad_testnet.erc20_transfers    filter: address = '0x0' # Add erc20 contract address. Multiple addresses can be added with 'OR' operator: address = '0x0' OR address = '0x1'    version: 1.2.0    type: dataset    start_at: earliest
# Data transformation logic (optional)transforms:  select_relevant_fields:    sql: |      SELECT          id,          address,          event_signature,          event_params,          raw_log.block_number as block_number,          raw_log.block_hash as block_hash,          raw_log.transaction_hash as transaction_hash      FROM          ethereum_decoded_logs    primary_key: id
# Sink configuration to specify where data goes eg. DBsinks:  postgres:    type: postgres    table: erc20_transfers    schema: goldsky    secret_name: A_POSTGRESQL_SECRET    from: select_relevant_fields

Relevant docs:

Getting Started with Mirror
Data Streaming Guides





Using QuickNode Streams​
noteSee also: QuickNode Streams

On your QuickNode Dashboard, select Streams > Create Stream. In the create
stream UI, select Monad Mainnet or Monad Testnet under Network. Alternatively, you can use the
Streams REST API
to create and manage streams—use monad-mainnet for Monad Mainnet or monad-testnet for Monad Testnet as the network identifier.
You can consume a Stream by choosing a destination during stream creation.
Supported destinations include Webhooks, S3 buckets, and PostgreSQL
databases. Learn more
here.
Relevant docs:

Getting Started



Using The Graph's Subgraph​
noteSee also: The Graph

Network ID: Use monad-mainnet for Monad Mainnet or monad-testnet for Monad Testnet
Example configuration


Sample subgraph.yaml file
subgraph.yaml1234567891011121314151617181920212223242526272829specVersion: 1.2.0indexerHints:  prune: autoschema:  file: ./schema.graphqldataSources:  - kind: ethereum    name: YourContractName # Replace with your contract name    network: monad-testnet # Monad testnet configuration    source:      address: "0x0000000000000000000000000000000000000000" # Replace with your contract address      abi: YourContractABI # Replace with your contract ABI name      startBlock: 0 # Replace with the block where your contract was deployed/where you want to index from    mapping:      kind: ethereum/events      apiVersion: 0.0.9      language: wasm/assemblyscript      entities:        # List your entities here - these should match those defined in schema.graphql        # - Entity1        # - Entity2      abis:        - name: YourContractABI # Should match the ABI name specified above          file: ./abis/YourContract.json # Path to your contract ABI JSON file      eventHandlers:        # Add your event handlers here, for example:        # - event: EventName(param1Type, param2Type, ...)        #   handler: handleEventName      file: ./src/mapping.ts # Path to your event handler implementations


Sample mappings.ts file
mappings.ts12345678910111213141516171819202122232425262728293031323334353637383940414243444546474849505152535455565758596061import {  // Import your contract events here  // Format: EventName as EventNameEvent  EventOne as EventOneEvent,  // Add more events as needed} from "../generated/YourContractName/YourContractABI" // Replace with your contract name, abi name you supplied in subgraph.yaml
import {  // Import your schema entities here  // These should match the entities defined in schema.graphql  EventOne,  // Add more entities as needed} from "../generated/schema"
/**  * Handler for EventOne  * Update the function parameters and body according to your event structure  */export function handleEventOne(event: EventOneEvent): void {  // Create a unique ID for this entity  let entity = new EventOne(    event.transaction.hash.concatI32(event.logIndex.toI32())  )    // Map event parameters to entity fields  // entity.paramName = event.params.paramName    // Example:  // entity.sender = event.params.sender  // entity.amount = event.params.amount
  // Add metadata fields  entity.blockNumber = event.block.number  entity.blockTimestamp = event.block.timestamp  entity.transactionHash = event.transaction.hash
  // Save the entity to the store  entity.save()}
/**  * Add more event handlers as needed  * Format:  *   * export function handleEventName(event: EventNameEvent): void {  *   let entity = new EventName(  *     event.transaction.hash.concatI32(event.logIndex.toI32())  *   )  *     *   // Map parameters  *   entity.param1 = event.params.param1  *   entity.param2 = event.params.param2  *     *   // Add metadata  *   entity.blockNumber = event.block.number  *   entity.blockTimestamp = event.block.timestamp  *   entity.transactionHash = event.transaction.hash  *     *   entity.save()  * }  */


Sample schema.graphql file
schema.graphql123456789101112131415161718192021222324252627282930313233343536373839404142434445# Define your entities here# These should match the entities listed in your subgraph.yaml
# Example entity for a generic eventtype EventOne @entity(immutable: true) {  id: Bytes!    # Add fields that correspond to your event parameters  # Examples with common parameter types:  # paramId: BigInt!              # uint256, uint64, etc.  # paramAddress: Bytes!          # address  # paramFlag: Boolean!           # bool  # paramAmount: BigInt!          # uint96, etc.  # paramPrice: BigInt!           # uint32, etc.  # paramArray: [BigInt!]!        # uint[] array  # paramString: String!          # string    # Standard metadata fields  blockNumber: BigInt!  blockTimestamp: BigInt!  transactionHash: Bytes!}
# Add more entity types as needed for different events# Example based on Transfer event:# type Transfer @entity(immutable: true) {#   id: Bytes!#   from: Bytes!                  # address#   to: Bytes!                    # address#   tokenId: BigInt!              # uint256#   blockNumber: BigInt!#   blockTimestamp: BigInt!#   transactionHash: Bytes!# }
# Example based on Approval event:# type Approval @entity(immutable: true) {#   id: Bytes!#   owner: Bytes!                 # address#   approved: Bytes!              # address#   tokenId: BigInt!              # uint256#   blockNumber: BigInt!#   blockTimestamp: BigInt!#   transactionHash: Bytes!# }



Relevant docs:

Quickstart



Using thirdweb's Insight API​
noteSee also: thirdweb

REST API offering a wide range of on-chain data, including events, blocks,
transactions, token data (such as transfer transactions, balances, and token
prices), contract details, and more.
Use chain ID 143 for Monad Mainnet or 10143 for Monad Testnet when constructing request URLs.
Relevant docs:

Get started



Manage nonces locally if sending multiple transactions in quick succession​
noteThis only applies if you are setting nonces manually. If you are delegating
this to the wallet, no need to worry about this.

eth_getTransactionCount only updates after a transaction is finalized. If
you have multiple transactions from the same wallet in short succession, you
should implement local nonce tracking.

Submit multiple transactions concurrently​
If you are submitting a series of transactions, instead submitting
sequentially, implement concurrent transaction submission for improved
efficiency.
Before:
1234567891011for (let i = 0; i < TIMES; i++) {  const tx_hash = await WALLET_CLIENT.sendTransaction({    account: ACCOUNT,    to: ACCOUNT_1,    value: parseEther('0.1'),    gasLimit: BigInt(21000),    baseFeePerGas: BigInt(50000000000),    chain: CHAIN,    nonce: nonce + Number(i),  })}
After:
12345678910111213const transactionsPromises = Array(BATCH_SIZE)  .fill(null)  .map(async (_, i) => {    return await WALLET_CLIENT.sendTransaction({      to: ACCOUNT_1,      value: parseEther('0.1'),      gasLimit: BigInt(21000),      baseFeePerGas: BigInt(50000000000),      chain: CHAIN,      nonce: nonce + Number(i),    })  })const hashes = await Promise.all(transactionsPromises)

## Code Examples

```prism
const resultPromises = Array(BATCH_SIZE)  .fill(null)  .map(async (_, i) => {    return await PUBLIC_CLIENT.simulateContract({        address: ...,        abi: ...,        functionName: ...,        args: [...],      })  })const results = await Promise.all(resultPromises)
```

```prism
name: your-indexers-namenetworks:- id: 10143  # Monad Testnet  # Optional custom RPC configuration - only add if default indexing has issues  # rpc_config:  #   url: YOUR_RPC_URL_HERE  # Replace with your RPC URL (e.g., from Alchemy)  #   interval_ceiling: 50     # Maximum number of blocks to fetch in a single request  #   acceleration_additive: 10  # Speed up factor for block fetching  #   initial_block_interval: 10  # Initial block fetch interval size  start_block: 0  # Replace with the block you want to start indexing from  contracts:  - name: YourContract  # Replace with your contract name    address:    - 0x0000000000000000000000000000000000000000  # Replace with your contract address    # Add more addresses if needed for multiple deployments of the same contract    handler: src/EventHandlers.ts    events:    # Replace with your event signatures    # Format: EventName(paramType paramName, paramType2 paramName2, ...)    # Example: Transfer(address from, address to, uint256 amount)    # Example: OrderCreated(uint40 orderId, address owner, uint96 size, uint32 price, bool isBuy)    - event: EventOne(paramType1 paramName1, paramType2 paramName2)    # Add more events as needed
```

```prism
import {  YourContract,  YourContract_EventOne,} from "generated";
// Handler for EventOne// Replace parameter types and names based on your event definitionYourContract.EventOne.handler(async ({ event, context }) => {  // Create a unique ID for this event instance  const entity: YourContract_EventOne = {    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,    // Replace these with your actual event parameters    paramName1: event.params.paramName1,    paramName2: event.params.paramName2,    // Add any additional fields you want to store  };
  // Store the event in the database  context.YourContract_EventOne.set(entity);})
// Add more event handlers as needed
```

```prism
name: monad-testnet-erc20-transfersapiVersion: 3sources:  monad_testnet_erc20_transfers:    dataset_name: monad_testnet.erc20_transfers    filter: address = '0x0' # Add erc20 contract address. Multiple addresses can be added with 'OR' operator: address = '0x0' OR address = '0x1'    version: 1.2.0    type: dataset    start_at: earliest
# Data transformation logic (optional)transforms:  select_relevant_fields:    sql: |      SELECT          id,          address,          event_signature,          event_params,          raw_log.block_number as block_number,          raw_log.block_hash as block_hash,          raw_log.transaction_hash as transaction_hash      FROM          ethereum_decoded_logs    primary_key: id
# Sink configuration to specify where data goes eg. DBsinks:  postgres:    type: postgres    table: erc20_transfers    schema: goldsky    secret_name: A_POSTGRESQL_SECRET    from: select_relevant_fields
```

```prism
specVersion: 1.2.0indexerHints:  prune: autoschema:  file: ./schema.graphqldataSources:  - kind: ethereum    name: YourContractName # Replace with your contract name    network: monad-testnet # Monad testnet configuration    source:      address: "0x0000000000000000000000000000000000000000" # Replace with your contract address      abi: YourContractABI # Replace with your contract ABI name      startBlock: 0 # Replace with the block where your contract was deployed/where you want to index from    mapping:      kind: ethereum/events      apiVersion: 0.0.9      language: wasm/assemblyscript      entities:        # List your entities here - these should match those defined in schema.graphql        # - Entity1        # - Entity2      abis:        - name: YourContractABI # Should match the ABI name specified above          file: ./abis/YourContract.json # Path to your contract ABI JSON file      eventHandlers:        # Add your event handlers here, for example:        # - event: EventName(param1Type, param2Type, ...)        #   handler: handleEventName      file: ./src/mapping.ts # Path to your event handler implementations
```

```prism
import {  // Import your contract events here  // Format: EventName as EventNameEvent  EventOne as EventOneEvent,  // Add more events as needed} from "../generated/YourContractName/YourContractABI" // Replace with your contract name, abi name you supplied in subgraph.yaml
import {  // Import your schema entities here  // These should match the entities defined in schema.graphql  EventOne,  // Add more entities as needed} from "../generated/schema"
/**  * Handler for EventOne  * Update the function parameters and body according to your event structure  */export function handleEventOne(event: EventOneEvent): void {  // Create a unique ID for this entity  let entity = new EventOne(    event.transaction.hash.concatI32(event.logIndex.toI32())  )    // Map event parameters to entity fields  // entity.paramName = event.params.paramName    // Example:  // entity.sender = event.params.sender  // entity.amount = event.params.amount
  // Add metadata fields  entity.blockNumber = event.block.number  entity.blockTimestamp = event.block.timestamp  entity.transactionHash = event.transaction.hash
  // Save the entity to the store  entity.save()}
/**  * Add more event handlers as needed  * Format:  *   * export function handleEventName(event: EventNameEvent): void {  *   let entity = new EventName(  *     event.transaction.hash.concatI32(event.logIndex.toI32())  *   )  *     *   // Map parameters  *   entity.param1 = event.params.param1  *   entity.param2 = event.params.param2  *     *   // Add metadata  *   entity.blockNumber = event.block.number  *   entity.blockTimestamp = event.block.timestamp  *   entity.transactionHash = event.transaction.hash  *     *   entity.save()  * }  */
```

```prism
# Define your entities here# These should match the entities listed in your subgraph.yaml
# Example entity for a generic eventtype EventOne @entity(immutable: true) {  id: Bytes!    # Add fields that correspond to your event parameters  # Examples with common parameter types:  # paramId: BigInt!              # uint256, uint64, etc.  # paramAddress: Bytes!          # address  # paramFlag: Boolean!           # bool  # paramAmount: BigInt!          # uint96, etc.  # paramPrice: BigInt!           # uint32, etc.  # paramArray: [BigInt!]!        # uint[] array  # paramString: String!          # string    # Standard metadata fields  blockNumber: BigInt!  blockTimestamp: BigInt!  transactionHash: Bytes!}
# Add more entity types as needed for different events# Example based on Transfer event:# type Transfer @entity(immutable: true) {#   id: Bytes!#   from: Bytes!                  # address#   to: Bytes!                    # address#   tokenId: BigInt!              # uint256#   blockNumber: BigInt!#   blockTimestamp: BigInt!#   transactionHash: Bytes!# }
# Example based on Approval event:# type Approval @entity(immutable: true) {#   id: Bytes!#   owner: Bytes!                 # address#   approved: Bytes!              # address#   tokenId: BigInt!              # uint256#   blockNumber: BigInt!#   blockTimestamp: BigInt!#   transactionHash: Bytes!# }
```

```prism
for (let i = 0; i < TIMES; i++) {  const tx_hash = await WALLET_CLIENT.sendTransaction({    account: ACCOUNT,    to: ACCOUNT_1,    value: parseEther('0.1'),    gasLimit: BigInt(21000),    baseFeePerGas: BigInt(50000000000),    chain: CHAIN,    nonce: nonce + Number(i),  })}
```

```prism
const transactionsPromises = Array(BATCH_SIZE)  .fill(null)  .map(async (_, i) => {    return await WALLET_CLIENT.sendTransaction({      to: ACCOUNT_1,      value: parseEther('0.1'),      gasLimit: BigInt(21000),      baseFeePerGas: BigInt(50000000000),      chain: CHAIN,      nonce: nonce + Number(i),    })  })const hashes = await Promise.all(transactionsPromises)
```

