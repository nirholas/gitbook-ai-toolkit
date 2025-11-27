# General Operations

> Source: https://docs.monad.xyz/node-ops/general-operations

## Documentation

On this page

Version Information​
View the version and build information for your Monad binaries:
monad-node --version# Example output: monad-node {"commit":"c0cdcaae8eb527e44d72c4638c1f1335025a5132","tag":"v0.12.2-rc","branch":"","modified":true}
CLI Help​
View available command-line arguments for any Monad binary:
monad-rpc --helpmonad --helpmonad-bft --help
warningCLI arguments should not be changed arbitrarily as some configurations may result in unexpected behavior or crashes.
Service Management​
Check the status of Monad services:
# Check all services at oncesystemctl status monad-bft monad-execution monad-rpc --no-pager -l
# Check individual service statussystemctl status monad-bftsystemctl status monad-executionsystemctl status monad-rpc
# View logs for a specific servicejournalctl -u monad-bft -fjournalctl -u monad-execution -fjournalctl -u monad-rpc -f
Monitoring Block Height​
The RPC service will start listening on port 8080 when the statesync is completed.
Check the current block height via RPC:
curl http://localhost:8080/ \  -X POST \  -H "Content-Type: application/json" \  --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}'
Viewing MonadDB Disk Usage​
Note that MonadDB (TrieDB) will automatically compact when at 80% capacity to preserve
optimal SSD performance. To check MonadDB disk usage and retained block history:
monad-mpt --storage /dev/triedb
Example output:
MPT database on storages:          Capacity           Used      %  Path           3.49 Tb       24.30 Gb  0.68%  "/dev/nvme1n1p1"MPT database internal lists:     Fast: 94 chunks with capacity 23.50 Gb used 23.40 Gb     Slow: 3 chunks with capacity 768.00 Mb used 658.72 Mb     Free: 14207 chunks with capacity 3.47 Tb used 0.00 bytesMPT database has 599928 history, earliest is 36784905 latest is 37384832.     It has been configured to retain no more than 33554432.     Latest proposed is (37384832, 88a5550ba067c2f21cef6b6e8953fbf700fe300905952e5621335fe2bd58729c).     Latest voted is (37384831, 56074c2429909c2966bfe8df55810ec3b8f4f4f599b407ff89ec92b090656ab1).     Latest finalized is 37384830, latest verified is 37384827, auto expire version is 36784905
Log Analysis with monlog​
monlog is a lightweight tool maintained by Category Labs
that scrapes BFT logs and provides useful status information and suggestions. It
examines logs from the last 60 seconds.
Setup (as root user):
First, grant the monad user access to read systemd journal logs:
# Add monad user to systemd-journal groupusermod -a -G systemd-journal monad
Download monlog (as monad user):
cd /home/monadcurl -sSL https://pub-b0d0d7272c994851b4c8af22a766f571.r2.dev/scripts/monlog -Ochmod u+x ./monlog
infoIf you're already logged in as the monad user when the group is added, you'll need to log out and log back in for the group membership to take effect. Alternatively, you can run su - monad to start a new session.
Run monlog (as monad user):
./monlog
# For live updateswatch -d "./monlog"
# Show last 10 lines of grabbed logs./monlog -r
Example output for a healthy node:
Installed version:ii monad 0.12.1~rc amd64 Monad BFT stack (symbols stripped)
No StateSync messages.---No BlockSync messages.---Most recent round: 52268965Most recent epoch: 1001Most recent block: 50041845Blocks processing and being committed ✅
Consensus Information with ledger-tail​
monad-ledger-tail exposes consensus information by directly parsing ledger artifacts
and streams the data in JSON format.
Start the service:
systemctl start monad-ledger-tail
# View outputjournalctl -fu monad-ledger-tail
Example output:
// the real output is all on one line, but we've prettified this for legibility:{  "timestamp": "2025-11-23T03:09:09.534974Z",  "level": "INFO",  "fields": {    "message": "proposed_block",    "round": "53449032",    "parent_round": "53449031",    "epoch": "1024",    "seq_num": "51203516",    "num_tx": "3",    "author": "036daee7750e29e46eb64d86ad1cc7b235d7f1ad9597941a3a77cdd641cead4528",    "block_ts_ms": "1763867349470",    "now_ts_ms": "1763867349534",    "author_address": ""  },  "target": "ledger_tail"}
Node Status with monad-status​
Install monad-status:
curl -sSL https://bucket.monadinfra.com/scripts/monad-status.sh -o /usr/local/bin/monad-statuschmod +x /usr/local/bin/monad-status
Run monad-status to get the status of the node.
This should print similar output:
### Monad Node Status
hostname: monad-nodedate: Wed Nov 26 10:48:26 PM CET 2025uptime: 0d 00h 41m 49sversion: 0.12.2config:  network: mainnet  chain: monad_mainnet  chainId: 143  secpPublicKey: 03831b36b50261011d82f94d58f8aa0edfe058359e2c365c37cce678436b9eb371  blsPublicKey: b9c1905e11e8395a789bece454ec24bed98b96cf9dc04c02c9512fb94900d3e0355383e542c44a0eb1be4d2780a1fb2f  nodeSignature: 4f6e3e47af0e8ff3614e1eb53f9015ef4fc8593e60c13d52c2b458d05385b5f94cff8776ceb8b9401c3647148637d599622353d0631864a23b07f6d7fb55e84f00  selfAddress: 65.109.145.172:8000  recordSeqNum: 0services:  monad-bft: running  monad-execution: running  monad-rpc: running  otelcol: running  monad-cruft:    activated: true    previous: 48min ago    next: 11minpeers:  peersNumber: 1146consensus:  status: in-sync  mode: live  epoch: 764  round: 38259075  blockNumber: 38200041  blockNumberFromExternal: 38200040  blockDifference: 0statesync:  percentage: 100.0000%  progress: 38193694  target: 38193694rpc:  status: active  clientVersion: Monad/0.12.2  netVersion: 143  blockNumber: 38200041

## Code Examples

```prism
monad-node --version# Example output: monad-node {"commit":"c0cdcaae8eb527e44d72c4638c1f1335025a5132","tag":"v0.12.2-rc","branch":"","modified":true}
```

```prism
monad-rpc --helpmonad --helpmonad-bft --help
```

```prism
# Check all services at oncesystemctl status monad-bft monad-execution monad-rpc --no-pager -l
# Check individual service statussystemctl status monad-bftsystemctl status monad-executionsystemctl status monad-rpc
# View logs for a specific servicejournalctl -u monad-bft -fjournalctl -u monad-execution -fjournalctl -u monad-rpc -f
```

```prism
curl http://localhost:8080/ \  -X POST \  -H "Content-Type: application/json" \  --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}'
```

```prism
monad-mpt --storage /dev/triedb
```

```prism
MPT database on storages:          Capacity           Used      %  Path           3.49 Tb       24.30 Gb  0.68%  "/dev/nvme1n1p1"MPT database internal lists:     Fast: 94 chunks with capacity 23.50 Gb used 23.40 Gb     Slow: 3 chunks with capacity 768.00 Mb used 658.72 Mb     Free: 14207 chunks with capacity 3.47 Tb used 0.00 bytesMPT database has 599928 history, earliest is 36784905 latest is 37384832.     It has been configured to retain no more than 33554432.     Latest proposed is (37384832, 88a5550ba067c2f21cef6b6e8953fbf700fe300905952e5621335fe2bd58729c).     Latest voted is (37384831, 56074c2429909c2966bfe8df55810ec3b8f4f4f599b407ff89ec92b090656ab1).     Latest finalized is 37384830, latest verified is 37384827, auto expire version is 36784905
```

```prism
# Add monad user to systemd-journal groupusermod -a -G systemd-journal monad
```

```prism
cd /home/monadcurl -sSL https://pub-b0d0d7272c994851b4c8af22a766f571.r2.dev/scripts/monlog -Ochmod u+x ./monlog
```

```prism
./monlog
# For live updateswatch -d "./monlog"
# Show last 10 lines of grabbed logs./monlog -r
```

```prism
Installed version:ii monad 0.12.1~rc amd64 Monad BFT stack (symbols stripped)
No StateSync messages.---No BlockSync messages.---Most recent round: 52268965Most recent epoch: 1001Most recent block: 50041845Blocks processing and being committed ✅
```

```prism
systemctl start monad-ledger-tail
# View outputjournalctl -fu monad-ledger-tail
```

```prism
// the real output is all on one line, but we've prettified this for legibility:{  "timestamp": "2025-11-23T03:09:09.534974Z",  "level": "INFO",  "fields": {    "message": "proposed_block",    "round": "53449032",    "parent_round": "53449031",    "epoch": "1024",    "seq_num": "51203516",    "num_tx": "3",    "author": "036daee7750e29e46eb64d86ad1cc7b235d7f1ad9597941a3a77cdd641cead4528",    "block_ts_ms": "1763867349470",    "now_ts_ms": "1763867349534",    "author_address": ""  },  "target": "ledger_tail"}
```

```prism
curl -sSL https://bucket.monadinfra.com/scripts/monad-status.sh -o /usr/local/bin/monad-statuschmod +x /usr/local/bin/monad-status
```

```prism
### Monad Node Status
hostname: monad-nodedate: Wed Nov 26 10:48:26 PM CET 2025uptime: 0d 00h 41m 49sversion: 0.12.2config:  network: mainnet  chain: monad_mainnet  chainId: 143  secpPublicKey: 03831b36b50261011d82f94d58f8aa0edfe058359e2c365c37cce678436b9eb371  blsPublicKey: b9c1905e11e8395a789bece454ec24bed98b96cf9dc04c02c9512fb94900d3e0355383e542c44a0eb1be4d2780a1fb2f  nodeSignature: 4f6e3e47af0e8ff3614e1eb53f9015ef4fc8593e60c13d52c2b458d05385b5f94cff8776ceb8b9401c3647148637d599622353d0631864a23b07f6d7fb55e84f00  selfAddress: 65.109.145.172:8000  recordSeqNum: 0services:  monad-bft: running  monad-execution: running  monad-rpc: running  otelcol: running  monad-cruft:    activated: true    previous: 48min ago    next: 11minpeers:  peersNumber: 1146consensus:  status: in-sync  mode: live  epoch: 764  round: 38259075  blockNumber: 38200041  blockNumberFromExternal: 38200040  blockDifference: 0statesync:  percentage: 100.0000%  progress: 38193694  target: 38193694rpc:  status: active  clientVersion: Monad/0.12.2  netVersion: 143  blockNumber: 38200041
```

