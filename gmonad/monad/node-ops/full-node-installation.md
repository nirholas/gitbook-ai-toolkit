# Full Node Installation

> Source: https://docs.monad.xyz/node-ops/full-node-installation

## Documentation

On this page

Components​
Monad nodes are running services using systemd:

monad-bft - Consensus client
monad-execution - Execution client
monad-rpc - RPC server
monad-mpt - One-time execution for initializing the TrieDB disk
monad-cruft - Cleanup service running hourly
otelcol - OTEL collector service for metric collection

The systemd services are running using monad service user.
The configuration and data structure is:

/home/monad/.env - contains the environment variables to configure monad services
/home/monad/monad-bft/config/node.toml - contains configurable consensus parameters, most
notably the name of the node, typically "<PROVIDER_NAME>-1" and a list of upstream validators
(denoted by secp pubkey and DNS) who have been configured to republish blocks to your full node.
/home/monad/monad-bft/config/forkpoint/ - contains consensus quorum checkpoints (written every
block) used for bootstrapping state
/home/monad/monad-bft/config/validators/ - contains validator sets generated at the
boundary block. The newly generated
file contains the consensus validator sets for the current epoch and for the upcoming epoch.
The most recent validator set is found at validators.toml.
/home/monad/monad-bft/ledger/ - contains consensus (BFT) block headers and bodies, including the transactions
/dev/triedb - TrieDB database device, contains the state of the blockchain

Prerequisites​
Please refer to the Hardware Requirements before continuing.

Bare-metal server
Ubuntu 24.04+ Operating system
Linux Kernel >= 6.8.0.60 (see warning below)
Disabled HyperThreading (HT) or Simultaneous MultiThreading (SMT) via BIOS settings

these features degrade the node performance



warningThere is a known bug affecting
Linux kernel versions v6.8.0.56-generic - v6.8.0.59-generic (inclusive) that causes Monad
clients to hang in an uninterruptible sleep state, severely impacting node stability.
We recommend v6.8.0.60-generic or higher.
Prepare the Node​
infoThe following instructions assume the commands are executed as root user.
Update the system​
Update the system.
apt updateapt upgrade -y
Reboot the machine if required, for example if the upgrade prints Pending kernel upgrade!.
Install additional dependencies.
apt install -y curl nvme-cli aria2 jq
Install monad package​
Configure the APT repository.
cat <<EOF > /etc/apt/sources.list.d/category-labs.sourcesTypes: debURIs: https://pkg.category.xyz/Suites: nobleComponents: mainSigned-By: /etc/apt/keyrings/category-labs.gpgEOF
curl -fsSL https://pkg.category.xyz/keys/public-key.asc \  | gpg --dearmor --yes -o /etc/apt/keyrings/category-labs.gpg
MainnetTestnetInstall monad package.apt updateapt install -y monad=0.12.2-rpc-hotfix2apt-mark hold monadInstall monad package.apt updateapt install -y monad=0.12.2-rpc-hotfix2apt-mark hold monad
Create monad user​
Create a non-privileged user named monad with a home directory and Bash shell.
useradd -m -s /bin/bash monad
Create config directories structure in /home/monad.
mkdir -p /home/monad/monad-bft/config \         /home/monad/monad-bft/ledger \         /home/monad/monad-bft/config/forkpoint \         /home/monad/monad-bft/config/validators
Configure TrieDB Device​
Create the device​
Set the NVMe drive (e.g. /dev/nvme1n1) to be used for TrieDB device, create a new partition table and a partition that spans the
entire drive. The drive should be on a disk that has no filesystem mounted and no RAID configured.
TRIEDB_DRIVE=/dev/nvme1n1 # CHANGE THIS TO YOUR NVME DRIVE
parted $TRIEDB_DRIVE mklabel gptparted $TRIEDB_DRIVE mkpart triedb 0% 100%
Create a udev rule to set permissions and create a symlink for the partition.
PARTUUID=$(lsblk -o PARTUUID $TRIEDB_DRIVE | tail -n 1)echo "Disk PartUUID: ${PARTUUID}"
echo "ENV{ID_PART_ENTRY_UUID}==\"$PARTUUID\", MODE=\"0666\", SYMLINK+=\"triedb\"" \  | tee /etc/udev/rules.d/99-triedb.rules
Trigger and reload udev rules, and verify TrieDB is pointing to the NVMe device.
udevadm triggerudevadm control --reloadudevadm settlels -l /dev/triedb
Verify the LBA configuration​
Verify LBA Configuration, and enable 512 byte LBA if not enabled.
Check if 512 byte LBA is enabled on TRIEDB_DRIVE:
nvme id-ns -H $TRIEDB_DRIVE | grep 'LBA Format' | grep 'in use'
This command should return the following expected output:
LBA Format  0 : Metadata Size: 0   bytes - Data Size: 512 bytes - Relative Performance: 0 Best (in use)
infoData Size should be set to 512 bytes and marked as (in use). If that is not the case,
then you will need to set the TRIEDB_DRIVE to use 512 byte LBA with the following command.nvme format --lbaf=0 $TRIEDB_DRIVEVerify that the configuration has been corrected.nvme id-ns -H $TRIEDB_DRIVE | grep 'LBA Format' | grep 'in use'
Format the partition​
Format the TrieDB partition by executing the monad-mpt one-time service.
systemctl start monad-mptjournalctl -u monad-mpt -n 14 -o cat
This should return similar output.
MPT database on storages:          Capacity           Used      %  Path           1.75 Tb      256.03 Mb  0.01%  "/dev/nvme1n1p1"MPT database internal lists:     Fast: 1 chunks with capacity 256.00 Mb used 0.00 bytes     Slow: 1 chunks with capacity 256.00 Mb used 0.00 bytes     Free: 7148 chunks with capacity 1.75 Tb used 0.00 bytesMPT database has 1 history, earliest is 18446744073709551615 latest is 18446744073709551615.     It has been configured to retain no more than 33554432.     Latest proposed is (18446744073709551615, 0000000000000000000000000000000000000000000000000000000000000000).     Latest voted is (18446744073709551615, 0000000000000000000000000000000000000000000000000000000000000000).     Latest finalized is 18446744073709551615, latest verified is 18446744073709551615, auto expire version is 0monad-mpt.service: Deactivated successfully.Finished monad-mpt.service - "Service file for Monad MPT".
Configure Firewall rules​
Configure these firewall rules:

block all incoming traffic and enable all outgoing (default)
allow SSH inbound connections (remote access)
allow inbound and outbound to port 8000 for TCP/UDP (Consensus client P2P traffic)

Setup the UFW firewall:
ufw allow sshufw allow 8000ufw enableufw status
Hardware firewallsIf using hardware firewalls, you may need to perform additional steps to open up port 8000 to UDP
and TCP traffic.
Test outbound TCPTo verify outbound connectivity on TCP port 8000, test a connection to remote host:$ nc -vz 64.31.29.190 8000Connection to 64.31.29.190 8000 port [tcp/*] succeeded!See the node.toml file to test with a remote bootstrap peer.
Configure OTEL Collector​
The monad package supports OTEL collector. Through this, you will be able to see all the
relevant Monad-specific metrics, available at http://0.0.0.0:8889/metrics.
OTEL_VERSION="0.139.0"OTEL_PACKAGE="https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v${OTEL_VERSION}/otelcol_${OTEL_VERSION}_linux_amd64.deb"
curl -fsSL "$OTEL_PACKAGE" -o /tmp/otelcol_linux_amd64.debdpkg -i /tmp/otelcol_linux_amd64.deb
cp /opt/monad/scripts/otel-config.yaml /etc/otelcol/config.yamlsystemctl restart otelcol
Configure the Node​
Get configuration files​
MainnetTestnetConfiguration files for full nodes:MF_BUCKET=https://bucket.monadinfra.comcurl -o /home/monad/.env $MF_BUCKET/config/mainnet/latest/.env.examplecurl -o /home/monad/monad-bft/config/node.toml $MF_BUCKET/config/mainnet/latest/full-node-node.tomlConfiguration files for validators:MF_BUCKET=https://bucket.monadinfra.comcurl -o /home/monad/.env $MF_BUCKET/config/mainnet/latest/.env.examplecurl -o /home/monad/monad-bft/config/node.toml $MF_BUCKET/config/mainnet/latest/node.tomlConfiguration files for full nodes:MF_BUCKET=https://bucket.monadinfra.comcurl -o /home/monad/.env $MF_BUCKET/config/testnet/latest/.env.examplecurl -o /home/monad/monad-bft/config/node.toml $MF_BUCKET/config/testnet/latest/full-node-node.tomlConfiguration files for validators:MF_BUCKET=https://bucket.monadinfra.comcurl -o /home/monad/.env $MF_BUCKET/config/testnet/latest/.env.examplecurl -o /home/monad/monad-bft/config/node.toml $MF_BUCKET/config/testnet/latest/node.toml
Define Keystore password​
Set your own unique and strong password for KEYSTORE_PASSWORD.
This password is used to encrypt and decrypt your keystores.
It must be wrapped in single quotes (e.g. 'password').
Assuming KEYSTORE_PASSWORD in /home/monad/.env file is not already set, generate a secure random password.
sed -i "s|^KEYSTORE_PASSWORD=$|KEYSTORE_PASSWORD='$(openssl rand -base64 32)'|" /home/monad/.envsource /home/monad/.env
mkdir -p /opt/monad/backup/echo "Keystore password: ${KEYSTORE_PASSWORD}" > /opt/monad/backup/keystore-password-backup
Generate Keystores​
Generate encrypted BLS and SECP keys using monad-keystore binary.
bash <<'EOF'set -e
source /home/monad/.env
if [[ -z "$KEYSTORE_PASSWORD" || \      -f /home/monad/monad-bft/config/id-secp || \      -f /home/monad/monad-bft/config/id-bls ]]; then  echo "Skipping: missing KEYSTORE_PASSWORD or keys already exist."  exit 1fi
monad-keystore create \  --key-type secp \  --keystore-path /home/monad/monad-bft/config/id-secp \  --password "${KEYSTORE_PASSWORD}" > /opt/monad/backup/secp-backup
monad-keystore create \  --key-type bls \  --keystore-path /home/monad/monad-bft/config/id-bls \  --password "${KEYSTORE_PASSWORD}" > /opt/monad/backup/bls-backup
grep "public key" /opt/monad/backup/secp-backup /opt/monad/backup/bls-backup \  | tee /home/monad/pubkey-secp-bls
echo "Success: New keystores generated"
EOF
Public keys are exported to /home/monad/pubkey-secp-bls for convenience.
External BackupPlease ensure that these backup files are properly stored in an external location, outside of the node. They are required to restore your full node or validator identity in the event of hardware failure or system loss:
/opt/monad/backup/secp-backup
/opt/monad/backup/bls-backup

Update node.toml​
Public Full node configurationFull nodes can receive block proposals either directly from a validator that whitelists it,
or via a raptorcast group. These different configurations are described
here.The bellow instructions are intended for the public full node configuration,
where a full node joins the network by connecting to available upstream validators participating
in secondary raptorcast. Joining in this configuration is permissionless.
Update the configuration that was downloaded previously (for reference, you can check the testnet config and the mainnet config):


Edit /home/monad/monad-bft/config/node.toml.


The beneficiary field to include the address that should receive block rewards.
For full nodes, this field can be set to the burn address.
beneficiary = "0x0000000000000000000000000000000000000000"
For validator, use the beneficiary wallet address. This address should be prefixed by 0x.
beneficiary = "0x<VALIDATOR_REWARDS_ADDRESS>"


Update the node_name field to include your provider name.
Note that if you are operating multiple nodes, the node name should be unique.
node_name = "full_<PROVIDER>-<OPTIONAL_SUFFIX>"


Ensure enable_client = true under [fullnode_raptorcast].


Ensure expand_to_group = true under [statesync].


[blocksync_override] peers should remain empty for public full nodes.


Node signature record​
The node Name record is a cryptographically signed record that contains a node's network address information and is used for peer discovery and network topology management in the monad-bft system.
Using the keypairs are created, a fullnode will need to sign its name record using the SECP key in order to participate in peer discovery.
The sequence number (seq) in the record allows nodes to determine which version of a peer's address information is most recent, supporting scenarios where nodes change their network location.
source /home/monad/.envmonad-sign-name-record \  --address $(curl -s4 ifconfig.me):8000 \  --keystore-path /home/monad/monad-bft/config/id-secp \  --password "${KEYSTORE_PASSWORD}" \  --self-record-seq-num 0
Update the peer_discovery section in node.toml with the IP addresses, sequence number and name record signature generated from the previous command, for example:
self_address = "12.34.56.78:8000"self_record_seq_num = 0self_name_record_sig = "5995f8dc5af4ca70e3b49ce793e7fe353d72b261c14037272958a9f0cc105fdd4890e56cb99765750ca48bab113cccbb378fc61dff8b23da4a03c07bba60034300"
Remote Configuration Fetching (v0.12.1+)​
Nodes can automatically fetch forkpoint.toml and validators.toml from remote locations on startup.
This feature is configured using the following environment variables in /home/monad/.env:
MainnetTestnetREMOTE_VALIDATORS_URL='https://bucket.monadinfra.com/validators/mainnet/validators.toml'REMOTE_FORKPOINT_URL='https://bucket.monadinfra.com/forkpoint/mainnet/forkpoint.toml'REMOTE_VALIDATORS_URL='https://bucket.monadinfra.com/validators/testnet/validators.toml'REMOTE_FORKPOINT_URL='https://bucket.monadinfra.com/forkpoint/testnet/forkpoint.toml'
These URLs point to the latest configuration files.
When defined, the node will automatically attempt to download fresh configuration files on startup, simplifying node operations and reducing manual intervention during network updates.
Monad Foundation is not the exclusive provider of these configuration files. Feel free to replace the above remote links with those from other providers.
Call traces (optional)​
For full nodes intended for archiving or RPC workflows, enabling --trace_calls is recommended.
This preserves the detailed error information necessary for call traces, e.g. debug_traceTransaction.
To make this override, please run systemctl edit monad-execution and add the --trace_calls CLI param
to the ExecStart definition (may need a line continuation character \):
systemctl edit monad-execution
[Service]Type=simpleExecStart=ExecStart=/usr/local/bin/monad \    ...    --trace_calls    ...
Monad Cruft service​
Installation of the monad Debian package enables the monad-cruft timer, which runs hourly to
clear old artifacts (/opt/monad/scripts/clear-old-artifacts.sh). This is necessary to prevent
inode exhaustion as artifacts like forkpoint.toml and ledger files accumulate.
Starting with v0.12.2, you can configure artifact retention times by setting environment variables in /home/monad/.env. The following variables control how long artifacts are retained before deletion (all values in minutes):

RETENTION_LEDGER - Ledger files (headers and bodies, default: 600 = 10 hours)
RETENTION_WAL - WAL files (default: 300 = 5 hours)
RETENTION_FORKPOINT - Forkpoint files (default: 300 = 5 hours)
RETENTION_VALIDATORS - Validators files (default: 43200 = 30 days)

# Example: Add retention configuration to /home/monad/.envRETENTION_LEDGER=600RETENTION_WAL=300RETENTION_FORKPOINT=300RETENTION_VALIDATORS=43200
To customize retention, add or modify these variables in /home/monad/.env. For example, to retain ledger files for 20 hours:
echo "RETENTION_LEDGER=1200" >> /home/monad/.env
These settings will be automatically picked up by the monad-cruft timer on its next hourly run.
Start the Node​
Set filesystem permissions:
chown -R monad:monad /home/monad/
Enable the monad services to allow them to automatically start whenever the server is rebooted:
systemctl enable monad-bft monad-execution monad-rpc
Next, run the Hard Reset Instructions to import a recent database snapshot into the node.
Start the monad services:
systemctl start monad-bft monad-execution monad-rpc
This completes the process of starting up a full node!
Refer to the General Operations to monitor the state of the node.

## Code Examples

```prism
apt updateapt upgrade -y
```

```prism
apt install -y curl nvme-cli aria2 jq
```

```prism
cat <<EOF > /etc/apt/sources.list.d/category-labs.sourcesTypes: debURIs: https://pkg.category.xyz/Suites: nobleComponents: mainSigned-By: /etc/apt/keyrings/category-labs.gpgEOF
curl -fsSL https://pkg.category.xyz/keys/public-key.asc \  | gpg --dearmor --yes -o /etc/apt/keyrings/category-labs.gpg
```

```prism
apt updateapt install -y monad=0.12.2-rpc-hotfix2apt-mark hold monad
```

```prism
apt updateapt install -y monad=0.12.2-rpc-hotfix2apt-mark hold monad
```

```prism
useradd -m -s /bin/bash monad
```

```prism
mkdir -p /home/monad/monad-bft/config \         /home/monad/monad-bft/ledger \         /home/monad/monad-bft/config/forkpoint \         /home/monad/monad-bft/config/validators
```

```prism
TRIEDB_DRIVE=/dev/nvme1n1 # CHANGE THIS TO YOUR NVME DRIVE
parted $TRIEDB_DRIVE mklabel gptparted $TRIEDB_DRIVE mkpart triedb 0% 100%
```

```prism
PARTUUID=$(lsblk -o PARTUUID $TRIEDB_DRIVE | tail -n 1)echo "Disk PartUUID: ${PARTUUID}"
echo "ENV{ID_PART_ENTRY_UUID}==\"$PARTUUID\", MODE=\"0666\", SYMLINK+=\"triedb\"" \  | tee /etc/udev/rules.d/99-triedb.rules
```

```prism
udevadm triggerudevadm control --reloadudevadm settlels -l /dev/triedb
```

```prism
nvme id-ns -H $TRIEDB_DRIVE | grep 'LBA Format' | grep 'in use'
```

```prism
LBA Format  0 : Metadata Size: 0   bytes - Data Size: 512 bytes - Relative Performance: 0 Best (in use)
```

```prism
nvme format --lbaf=0 $TRIEDB_DRIVE
```

```prism
nvme id-ns -H $TRIEDB_DRIVE | grep 'LBA Format' | grep 'in use'
```

```prism
systemctl start monad-mptjournalctl -u monad-mpt -n 14 -o cat
```

```prism
MPT database on storages:          Capacity           Used      %  Path           1.75 Tb      256.03 Mb  0.01%  "/dev/nvme1n1p1"MPT database internal lists:     Fast: 1 chunks with capacity 256.00 Mb used 0.00 bytes     Slow: 1 chunks with capacity 256.00 Mb used 0.00 bytes     Free: 7148 chunks with capacity 1.75 Tb used 0.00 bytesMPT database has 1 history, earliest is 18446744073709551615 latest is 18446744073709551615.     It has been configured to retain no more than 33554432.     Latest proposed is (18446744073709551615, 0000000000000000000000000000000000000000000000000000000000000000).     Latest voted is (18446744073709551615, 0000000000000000000000000000000000000000000000000000000000000000).     Latest finalized is 18446744073709551615, latest verified is 18446744073709551615, auto expire version is 0monad-mpt.service: Deactivated successfully.Finished monad-mpt.service - "Service file for Monad MPT".
```

```prism
ufw allow sshufw allow 8000ufw enableufw status
```

```prism
$ nc -vz 64.31.29.190 8000Connection to 64.31.29.190 8000 port [tcp/*] succeeded!
```

```prism
OTEL_VERSION="0.139.0"OTEL_PACKAGE="https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v${OTEL_VERSION}/otelcol_${OTEL_VERSION}_linux_amd64.deb"
curl -fsSL "$OTEL_PACKAGE" -o /tmp/otelcol_linux_amd64.debdpkg -i /tmp/otelcol_linux_amd64.deb
cp /opt/monad/scripts/otel-config.yaml /etc/otelcol/config.yamlsystemctl restart otelcol
```

```prism
MF_BUCKET=https://bucket.monadinfra.comcurl -o /home/monad/.env $MF_BUCKET/config/mainnet/latest/.env.examplecurl -o /home/monad/monad-bft/config/node.toml $MF_BUCKET/config/mainnet/latest/full-node-node.toml
```

```prism
MF_BUCKET=https://bucket.monadinfra.comcurl -o /home/monad/.env $MF_BUCKET/config/mainnet/latest/.env.examplecurl -o /home/monad/monad-bft/config/node.toml $MF_BUCKET/config/mainnet/latest/node.toml
```

```prism
MF_BUCKET=https://bucket.monadinfra.comcurl -o /home/monad/.env $MF_BUCKET/config/testnet/latest/.env.examplecurl -o /home/monad/monad-bft/config/node.toml $MF_BUCKET/config/testnet/latest/full-node-node.toml
```

```prism
MF_BUCKET=https://bucket.monadinfra.comcurl -o /home/monad/.env $MF_BUCKET/config/testnet/latest/.env.examplecurl -o /home/monad/monad-bft/config/node.toml $MF_BUCKET/config/testnet/latest/node.toml
```

```prism
sed -i "s|^KEYSTORE_PASSWORD=$|KEYSTORE_PASSWORD='$(openssl rand -base64 32)'|" /home/monad/.envsource /home/monad/.env
mkdir -p /opt/monad/backup/echo "Keystore password: ${KEYSTORE_PASSWORD}" > /opt/monad/backup/keystore-password-backup
```

```prism
bash <<'EOF'set -e
source /home/monad/.env
if [[ -z "$KEYSTORE_PASSWORD" || \      -f /home/monad/monad-bft/config/id-secp || \      -f /home/monad/monad-bft/config/id-bls ]]; then  echo "Skipping: missing KEYSTORE_PASSWORD or keys already exist."  exit 1fi
monad-keystore create \  --key-type secp \  --keystore-path /home/monad/monad-bft/config/id-secp \  --password "${KEYSTORE_PASSWORD}" > /opt/monad/backup/secp-backup
monad-keystore create \  --key-type bls \  --keystore-path /home/monad/monad-bft/config/id-bls \  --password "${KEYSTORE_PASSWORD}" > /opt/monad/backup/bls-backup
grep "public key" /opt/monad/backup/secp-backup /opt/monad/backup/bls-backup \  | tee /home/monad/pubkey-secp-bls
echo "Success: New keystores generated"
EOF
```

```prism
beneficiary = "0x0000000000000000000000000000000000000000"
```

```prism
beneficiary = "0x<VALIDATOR_REWARDS_ADDRESS>"
```

```prism
node_name = "full_<PROVIDER>-<OPTIONAL_SUFFIX>"
```

```prism
source /home/monad/.envmonad-sign-name-record \  --address $(curl -s4 ifconfig.me):8000 \  --keystore-path /home/monad/monad-bft/config/id-secp \  --password "${KEYSTORE_PASSWORD}" \  --self-record-seq-num 0
```

```prism
self_address = "12.34.56.78:8000"self_record_seq_num = 0self_name_record_sig = "5995f8dc5af4ca70e3b49ce793e7fe353d72b261c14037272958a9f0cc105fdd4890e56cb99765750ca48bab113cccbb378fc61dff8b23da4a03c07bba60034300"
```

```prism
REMOTE_VALIDATORS_URL='https://bucket.monadinfra.com/validators/mainnet/validators.toml'REMOTE_FORKPOINT_URL='https://bucket.monadinfra.com/forkpoint/mainnet/forkpoint.toml'
```

```prism
REMOTE_VALIDATORS_URL='https://bucket.monadinfra.com/validators/testnet/validators.toml'REMOTE_FORKPOINT_URL='https://bucket.monadinfra.com/forkpoint/testnet/forkpoint.toml'
```

```prism
systemctl edit monad-execution
```

```prism
[Service]Type=simpleExecStart=ExecStart=/usr/local/bin/monad \    ...    --trace_calls    ...
```

```prism
# Example: Add retention configuration to /home/monad/.envRETENTION_LEDGER=600RETENTION_WAL=300RETENTION_FORKPOINT=300RETENTION_VALIDATORS=43200
```

```prism
echo "RETENTION_LEDGER=1200" >> /home/monad/.env
```

```prism
chown -R monad:monad /home/monad/
```

```prism
systemctl enable monad-bft monad-execution monad-rpc
```

```prism
systemctl start monad-bft monad-execution monad-rpc
```

