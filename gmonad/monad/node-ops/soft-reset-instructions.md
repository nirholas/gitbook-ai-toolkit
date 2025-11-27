# Soft Reset Instructions

> Source: https://docs.monad.xyz/node-ops/node-recovery/soft-reset

## Documentation

On this page

A soft reset is typically required when node is (re-)joining the network and the node tip is close to the network tip. Soft reset utilizes statesync to
determine the difference between the current state and the chain tip and to skip ahead.
Automated Remote Configuration Fetching (v0.12.1+)In v0.12.1+, the node will automatically attempt to fetch remote configuration files on startup if env variables are defined:
forkpoint.toml: Changes every round
validators.toml: Changes every epoch
This simplifies node operations by automating configuration updates. The remote fetching includes threshold logic to determine when remote configs should be used.Note: For automatic remote config fetching (v0.12.1+), ensure REMOTE_VALIDATORS_URL and REMOTE_FORKPOINT_URL are defined in your .env file. See Full Node Installation for configuration details.
Automated Soft Reset (v0.12.1+)​
Starting with v0.12.1, soft resets are largely automated if the appropriate variables are defined in .env:

SSH into the node as monad user
Restart monad-related services (monad-bft will auto-fetch configs on startup):
systemctl restart monad-bft monad-execution monad-rpc

Verify the systemd services are running:
systemctl list-units --type=service monad-bft.service monad-execution.service monad-rpc.serviceUNIT                    LOAD   ACTIVE SUB     DESCRIPTIONmonad-bft.service       loaded active running "Service file for Monad BFT"monad-execution.service loaded active running "Service file for Monad Execution"monad-rpc.service       loaded active running "Service file for Monad RPC"
# Check logs for a specific process to verify config fetchingjournalctl -u monad-bft


Manual Soft Reset​
To disable the automated fetching, remove any existing definitions (and remove from /home/monad/.env if desired)
unset REMOTE_VALIDATORS_URLunset REMOTE_FORKPOINT_URL


SSH into the node as monad user


Stop monad-related services
systemctl stop monad-bft monad-execution monad-rpc


Fetch new forkpoint.toml and validators.toml.
# testnetMF_BUCKET=https://bucket.monadinfra.comcurl -sSL $MF_BUCKET/scripts/testnet/download-forkpoint.sh | bashcurl -o /home/monad/monad-bft/config/validators/validators.toml $MF_BUCKET/validators/testnet/validators.toml
# mainnetcurl -sSL $MF_BUCKET/scripts/mainnet/download-forkpoint.sh | bashcurl -o /home/monad/monad-bft/config/validators/validators.toml $MF_BUCKET/validators/mainnet/validators.toml
You may see the following log message:
failed to fetch remote configs, using local forkpoint and validators config


Start monad-related services
systemctl start monad-bft monad-execution monad-rpc


Verify the systemd services are running:
systemctl list-units --type=service monad-bft.service monad-execution.service monad-rpc.serviceUNIT                    LOAD   ACTIVE SUB     DESCRIPTIONmonad-bft.service       loaded active running "Service file for Monad BFT"monad-execution.service loaded active running "Service file for Monad Execution"monad-rpc.service       loaded active running "Service file for Monad RPC"
# Check logs for a specific process, e.g. bftjournalctl -u monad-bft


Configuration Details​
Forkpoint Serialization​
Starting with v0.12.1, forkpoints are serialized in both TOML and RLP formats:

RLP format: Source of truth
TOML format: Maintained for backward compatibility
If TOML serialization fails, the node will no longer panic
Nodes can start from either format for operational backwards compatibility

## Code Examples

```prism
systemctl restart monad-bft monad-execution monad-rpc
```

```prism
systemctl list-units --type=service monad-bft.service monad-execution.service monad-rpc.serviceUNIT                    LOAD   ACTIVE SUB     DESCRIPTIONmonad-bft.service       loaded active running "Service file for Monad BFT"monad-execution.service loaded active running "Service file for Monad Execution"monad-rpc.service       loaded active running "Service file for Monad RPC"
# Check logs for a specific process to verify config fetchingjournalctl -u monad-bft
```

```prism
unset REMOTE_VALIDATORS_URLunset REMOTE_FORKPOINT_URL
```

```prism
systemctl stop monad-bft monad-execution monad-rpc
```

```prism
# testnetMF_BUCKET=https://bucket.monadinfra.comcurl -sSL $MF_BUCKET/scripts/testnet/download-forkpoint.sh | bashcurl -o /home/monad/monad-bft/config/validators/validators.toml $MF_BUCKET/validators/testnet/validators.toml
# mainnetcurl -sSL $MF_BUCKET/scripts/mainnet/download-forkpoint.sh | bashcurl -o /home/monad/monad-bft/config/validators/validators.toml $MF_BUCKET/validators/mainnet/validators.toml
```

```prism
failed to fetch remote configs, using local forkpoint and validators config
```

```prism
systemctl start monad-bft monad-execution monad-rpc
```

```prism
systemctl list-units --type=service monad-bft.service monad-execution.service monad-rpc.serviceUNIT                    LOAD   ACTIVE SUB     DESCRIPTIONmonad-bft.service       loaded active running "Service file for Monad BFT"monad-execution.service loaded active running "Service file for Monad Execution"monad-rpc.service       loaded active running "Service file for Monad RPC"
# Check logs for a specific process, e.g. bftjournalctl -u monad-bft
```

