# Validator Installation

> Source: https://docs.monad.xyz/node-ops/validator-installation

## Documentation

On this page

Setting up a validator is very similar to setting up a full node with a few extra steps.
Start by configuring a node according to the full node installation
instructions.
When the full node is fully operational and synced to the network tip, you can register your node
as a prospective validator by calling
addValidator on the staking
precompile. This function requires passing at least MIN_VALIDATE_STAKE = 100_000 MON (the
minimum self-stake).
After registering, your validator must also satisfy the following conditions, described in
greater depth in the staking docs:

Must have a total stake of at least ACTIVE_VALIDATOR_STAKE = 10_000_000 MON
Must be in the top ACTIVE_VALSET_SIZE = 200 validators by stake weight
Must continue to have a self-stake of MIN_VALIDATE_STAKE = 100_000 MON

When all three conditions are achieved, the validator will become active in the next epoch.
Staking CLI​
staking-sdk-cli is an open-source
staking CLI tool for interfacing with the staking precompile. Start with the
onboarding workflow.
Configure node.toml​
When following the full node instructions, when you got to
this section
you should have downloaded the Validator-themed node.toml.
From that template, the following should be configured:


(Important) Review the beneficiary address. This is the address that will receive block rewards.
beneficiary = "0x<INSERT_BENEFICIARY_ADDRESS>"


(Optional) - Double check node_name makes sense after transition from full node (for example,
remove any full_ prefix). Please choose a unique identifier to avoid confusion.


(Optional) - Configure dedicated or prioritized connections:


Dedicated full node
# Use the following to broadcast blocks to downstream full nodes# [[bootstrap.peers]]# address = "<ip>:<port>"# record_seq_num = "<record_seq_num>"# name_record_sig = "<name_record_sig>"# secp256k1_pubkey = "<full node pubkey>"# [[fullnode_dedicated.identities]]# secp256k1_pubkey = "<full node pubkey>"


Prioritized full node
# Use the following to broadcast blocks to downstream full nodes# [[bootstrap.peers]]# address = "<ip>:<port>"# record_seq_num = "<record_seq_num>"# name_record_sig = "<name_record_sig>"# secp256k1_pubkey = "<full node pubkey>"# [[fullnode_raptorcast.full_nodes_prioritized.identities]]# secp256k1_pubkey = "<full node pubkey>"


To apply these full node configuration changes without restarting monad-bft, run the following command:
monad-debug-node --control-panel-ipc-path /home/monad/monad-bft/controlpanel.sock reload-config

## Code Examples

```prism
beneficiary = "0x<INSERT_BENEFICIARY_ADDRESS>"
```

```prism
# Use the following to broadcast blocks to downstream full nodes# [[bootstrap.peers]]# address = "<ip>:<port>"# record_seq_num = "<record_seq_num>"# name_record_sig = "<name_record_sig>"# secp256k1_pubkey = "<full node pubkey>"# [[fullnode_dedicated.identities]]# secp256k1_pubkey = "<full node pubkey>"
```

```prism
# Use the following to broadcast blocks to downstream full nodes# [[bootstrap.peers]]# address = "<ip>:<port>"# record_seq_num = "<record_seq_num>"# name_record_sig = "<name_record_sig>"# secp256k1_pubkey = "<full node pubkey>"# [[fullnode_raptorcast.full_nodes_prioritized.identities]]# secp256k1_pubkey = "<full node pubkey>"
```

```prism
monad-debug-node --control-panel-ipc-path /home/monad/monad-bft/controlpanel.sock reload-config
```

