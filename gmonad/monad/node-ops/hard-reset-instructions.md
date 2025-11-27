# Hard Reset Instructions

> Source: https://docs.monad.xyz/node-ops/node-recovery/hard-reset

## Documentation

On this page

Hard reset wipes the local state and downloads the most recent chain snapshot. After the snapshot
is applied, the node catches up using statesync and
blocksync.
Hard reset is the most powerful means of resetting a node. Steps are:

Download a recent snapshot of the network state. As of Nov 2025, this is about 60 GB on testnet
but is very small on mainnet.
Initialize the DB from the snapshot (this can take up to an hour on testnet and a few minutes on mainnet)
Catch up to the tip of the chain via statesync / blocksync (typically 2-5 minutes assuming
snapshot is a few hours old)

Snapshot RestoreMonad Foundation and Category Labs are snapshot providers.
If there is an issue, please refer to Discord validator channels for more snapshot providers.
Prerequisite​

aria2 must be installed on the node

Instructions​


SSH into the node as root user.


Stop the monad services and reset the workspace to delete all runtime data.
bash /opt/monad/scripts/reset-workspace.sh


Download and import TrieDB database snapshot.
MainnetTestnetinfoOn mainnet, database snapshot restoration takes from 1 to 5 minutes.
As the blockchain grows over time, snapshot restoration takes longer.Using Monad Foundation provider:MF_BUCKET=https://bucket.monadinfra.comcurl -sSL $MF_BUCKET/scripts/mainnet/restore-from-snapshot.sh | bashUsing Category Labs provider:CL_BUCKET=https://pub-b0d0d7272c994851b4c8af22a766f571.r2.devcurl -sSL $CL_BUCKET/scripts/mainnet/restore_from_snapshot.sh | bashinfoOn testnet, database snapshot restoration takes up to 1 hour.
As the blockchain grows over time, snapshot restoration takes longer.Using Monad Foundation provider:MF_BUCKET=https://bucket.monadinfra.comcurl -sSL $MF_BUCKET/scripts/testnet/restore-from-snapshot.sh | bashUsing Category Labs provider:CL_BUCKET=https://pub-b0d0d7272c994851b4c8af22a766f571.r2.devcurl -sSL $CL_BUCKET/scripts/testnet/restore_from_snapshot.sh | bash


Fetch latest forkpoint.toml and validators.toml runtime files.
Automatic FetchThis step is optional if automatic remote config fetching is configured (v0.12.1+).
Ensure REMOTE_VALIDATORS_URL and REMOTE_FORKPOINT_URL are defined in your .env file.
See Full Node Installation for configuration details.
If not configured, you may run the below commands.
MainnetTestnetMF_BUCKET=https://bucket.monadinfra.comVALIDATORS_FILE=/home/monad/monad-bft/config/validators/validators.toml 
curl -sSL $MF_BUCKET/scripts/mainnet/download-forkpoint.sh | bashcurl $MF_BUCKET/validators/mainnet/validators.toml -o $VALIDATORS_FILEchown monad:monad $VALIDATORS_FILEMF_BUCKET=https://bucket.monadinfra.comVALIDATORS_FILE=/home/monad/monad-bft/config/validators/validators.toml 
curl -sSL $MF_BUCKET/scripts/testnet/download-forkpoint.sh | bashcurl $MF_BUCKET/validators/testnet/validators.toml -o $VALIDATORS_FILEchown monad:monad $VALIDATORS_FILE


Start all services
systemctl start monad-bft monad-execution monad-rpc

## Code Examples

```prism
bash /opt/monad/scripts/reset-workspace.sh
```

```prism
MF_BUCKET=https://bucket.monadinfra.comcurl -sSL $MF_BUCKET/scripts/mainnet/restore-from-snapshot.sh | bash
```

```prism
CL_BUCKET=https://pub-b0d0d7272c994851b4c8af22a766f571.r2.devcurl -sSL $CL_BUCKET/scripts/mainnet/restore_from_snapshot.sh | bash
```

```prism
MF_BUCKET=https://bucket.monadinfra.comcurl -sSL $MF_BUCKET/scripts/testnet/restore-from-snapshot.sh | bash
```

```prism
CL_BUCKET=https://pub-b0d0d7272c994851b4c8af22a766f571.r2.devcurl -sSL $CL_BUCKET/scripts/testnet/restore_from_snapshot.sh | bash
```

```prism
MF_BUCKET=https://bucket.monadinfra.comVALIDATORS_FILE=/home/monad/monad-bft/config/validators/validators.toml 
curl -sSL $MF_BUCKET/scripts/mainnet/download-forkpoint.sh | bashcurl $MF_BUCKET/validators/mainnet/validators.toml -o $VALIDATORS_FILEchown monad:monad $VALIDATORS_FILE
```

```prism
MF_BUCKET=https://bucket.monadinfra.comVALIDATORS_FILE=/home/monad/monad-bft/config/validators/validators.toml 
curl -sSL $MF_BUCKET/scripts/testnet/download-forkpoint.sh | bashcurl $MF_BUCKET/validators/testnet/validators.toml -o $VALIDATORS_FILEchown monad:monad $VALIDATORS_FILE
```

```prism
systemctl start monad-bft monad-execution monad-rpc
```

