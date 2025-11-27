# Full Replay

> Source: https://docs.monad.xyz/node-ops/node-recovery/full-replay

## Documentation

On this page

Full Replay allows a node to catch up on missed blocks by simply retrieving and replaying them
serially. This is helpful for nodes that want all intermediary state and transactional artifacts
to be generated. For example, an RPC provider would probably want this to ensure that they can
respond to requests like eth_call, eth_getBalance, or eth_estimateGas for blocks
that were skipped.
Context​
A node that has not locally executed block forkpoint.root - delay will statesync on startup. Also, nodes don’t serve blocksync requests more than statesync_threshold (600) blocks ago. Statesync is the only in-protocol way for that node to recover.
This document describes an alternate way to recover a node while backfilling historical state in the event that a node has been down for longer than the blocksync provision window (600 blocks).
Note that if statesync_threshold in node.toml is set to a value larger than that, blocksync will fail.
Access to a healthy node requiredIn order to recover the faulty node with complete historical state, the below
procedure requires SSH access to a node that was healthy throughout the faulty node's downtime.Let REMOTE_HOST be the healthy node that can be used for recovery.
Procedure​

SSH into the faulty node as monad user.
Ensure statesync_threshold = 600 in node.toml

$ grep statesync_threshold /home/monad/monad-bft/config/node.tomlstatesync_threshold = 600

Stop the monad services

sudo systemctl stop monad-bft monad-execution monad-rpc


Run this script to copy missing blocks, then run execution up to that point. You will need to run it several times since the tip of the chain will continue advancing while this script is executing.


NOTE: You will need to manually interrupt the process (Ctrl - C) once output stops.


Copy this script and name it manual-sync.sh
#!/usr/bin/env bashset -euo pipefail
# Load config first so SSH_PORT, REMOTE_HOST, CHAIN etc are setsource .env
: "${SSH_PORT:?SSH_PORT must be set}": "${REMOTE_HOST:?REMOTE_HOST must be set}": "${CHAIN:?CHAIN must be set}"
echo "Reading files from $REMOTE_HOST"echo "Using ssh port: $SSH_PORT"
# Copy proposed and finalized header symlinks firstrsync -avP -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/ledger/headers/*_head" \  /home/monad/monad-bft/ledger/headers/
# Copy new headers and bodies, but don't overwrite existing onesrsync -avP --ignore-existing -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/ledger/" \  /home/monad/monad-bft/ledger/
# Note: the --state-sync flag is NOT present/usr/local/bin/monad \  --chain "$CHAIN" \  --db /dev/triedb \  --block_db /home/monad/monad-bft/ledger \  --sq_thread_cpu 1 \  --log_level INFO


Run the script
REMOTE_HOST=node1.<provider>.com SSH_PORT=22 CHAIN=monad_mainnet bash manual-sync-step-1.sh




Once the first script completes in under 1 min, run this script:

Copy this and name it manual-sync-step-2.sh
#!/usr/bin/env bashset -euo pipefail
# Load config first so SSH_PORT, REMOTE_HOST, CHAIN etc are setsource .env
: "${SSH_PORT:?SSH_PORT must be set}": "${REMOTE_HOST:?REMOTE_HOST must be set}": "${CHAIN:?CHAIN must be set}"
# Copy current forkpointrsync -av -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/config/forkpoint/forkpoint.rlp" \  /home/monad/monad-bft/config/forkpoint/rsync -av -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/config/forkpoint/forkpoint.toml" \  /home/monad/monad-bft/config/forkpoint/forkpoint.tomlrsync -av -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/config/validators/validators.toml" \  /home/monad/monad-bft/config/validators/validators.toml
systemctl start monad-bft monad-execution monad-rpc

Run the script
REMOTE_HOST=node1.<provider>.com SSH_PORT=22 CHAIN=monad_mainnet bash manual-sync-step-2.sh




Check​
To check that statesync has been avoided, send an eth_getBlockByNumber RPC request
for blocks finalized while the node was down.
curl http://localhost:8080 \  -X POST \  -H "Content-Type: application/json" \  --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0xdedbeef", false],"id":1}'

## Code Examples

```prism
$ grep statesync_threshold /home/monad/monad-bft/config/node.tomlstatesync_threshold = 600
```

```prism
sudo systemctl stop monad-bft monad-execution monad-rpc
```

```prism
#!/usr/bin/env bashset -euo pipefail
# Load config first so SSH_PORT, REMOTE_HOST, CHAIN etc are setsource .env
: "${SSH_PORT:?SSH_PORT must be set}": "${REMOTE_HOST:?REMOTE_HOST must be set}": "${CHAIN:?CHAIN must be set}"
echo "Reading files from $REMOTE_HOST"echo "Using ssh port: $SSH_PORT"
# Copy proposed and finalized header symlinks firstrsync -avP -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/ledger/headers/*_head" \  /home/monad/monad-bft/ledger/headers/
# Copy new headers and bodies, but don't overwrite existing onesrsync -avP --ignore-existing -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/ledger/" \  /home/monad/monad-bft/ledger/
# Note: the --state-sync flag is NOT present/usr/local/bin/monad \  --chain "$CHAIN" \  --db /dev/triedb \  --block_db /home/monad/monad-bft/ledger \  --sq_thread_cpu 1 \  --log_level INFO
```

```prism
REMOTE_HOST=node1.<provider>.com SSH_PORT=22 CHAIN=monad_mainnet bash manual-sync-step-1.sh
```

```prism
#!/usr/bin/env bashset -euo pipefail
# Load config first so SSH_PORT, REMOTE_HOST, CHAIN etc are setsource .env
: "${SSH_PORT:?SSH_PORT must be set}": "${REMOTE_HOST:?REMOTE_HOST must be set}": "${CHAIN:?CHAIN must be set}"
# Copy current forkpointrsync -av -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/config/forkpoint/forkpoint.rlp" \  /home/monad/monad-bft/config/forkpoint/rsync -av -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/config/forkpoint/forkpoint.toml" \  /home/monad/monad-bft/config/forkpoint/forkpoint.tomlrsync -av -e "ssh -p $SSH_PORT" \  "monad@$REMOTE_HOST:/home/monad/monad-bft/config/validators/validators.toml" \  /home/monad/monad-bft/config/validators/validators.toml
systemctl start monad-bft monad-execution monad-rpc
```

```prism
REMOTE_HOST=node1.<provider>.com SSH_PORT=22 CHAIN=monad_mainnet bash manual-sync-step-2.sh
```

```prism
curl http://localhost:8080 \  -X POST \  -H "Content-Type: application/json" \  --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0xdedbeef", false],"id":1}'
```

