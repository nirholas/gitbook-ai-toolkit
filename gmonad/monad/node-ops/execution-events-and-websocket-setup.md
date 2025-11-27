# Execution Events and Websocket Setup

> Source: https://docs.monad.xyz/node-ops/events-and-websockets

## Documentation

On this page

Summary​
The Execution Events and Websocket
features were designed to work together to make Monad even faster for high volume applications.
Execution Events is a low-level system, and WebSocket support is one specific usage of that system.
Execution Events​
Execution Events offers developers the highest performance option
for listening to real-time data from the Monad blockchain.


Execution Events uses a shared memory communication system that requires additional setup,
which is described here. This setup is not part of the default instructions; it's only needed
if you run real-time data consumers that use the Execution Events feature.


The "shared memory" nature of the communication means that consumers
of execution events must run directly on the same host as the Monad node, so
they can observe real-time data in the host's RAM


Monad's RPC server can optionally use execution events for better
performance, and to support certain features, namely, the eth_subscribe
JSON-RPC call


noteHere is an overview of all real-time data offerings
in Monad. Here is a tutorial on writing programs that consume
execution events.
WebSockets​
In Monad's JSON-RPC server, WebSockets have two uses:

Creating a persistent connection to make JSON-RPC requests
The ability to call the eth_subscribe API, which will "push" new real-time
data as it happens, so you do not need to poll for new events

WebSocket support must be explicitly enabled in the RPC server with
command-line flag --ws-enabled. When
--ws-enabled is passed, then the host must be configured to support
execution events, otherwise RPC will exit with an error.
An user guide to WebSockets on Monad is here.
Requirements​

A running Monad full node (setup instructions)
A hugetlbfs filesystem mount

This can be set up using the hugeadm utility; see below for an example


Custom (aka "override") systemd unit files for both RPC and Execution

Examples are both below



Setup a hugetlbfs mount using hugeadm​
General prerequisites​
Install the required package:
sudo apt install libhugetlbfs-bin
Execution events SDK prerequisites​
If you want to consume real-time data in your own software using the execution
events SDK, you must install these additional packages:
sudo apt install libhugetlbfs-dev libhugetlbfs0 libzstd-dev
These are only required for the SDK; if you only need to enable WebSocket
support in the RPC server, you do not need these packages.
CLI one-time setup​
warningThis is for one-time testing and will NOT persist after a reboot
# NOTE: here we use `monad` but if you are running as a custom user, that should be set here$ sudo hugeadm --create-user-mounts monad
Sample systemd unit file​
This makes the mounts persistent after a reboot.
File location:
/etc/systemd/system/events-hugepages-mounts.service
File contents (as viewed when using the override editor):
### Anything between here and the comment below will become the contents of the drop-in file
# NOTE: as mentioned above, you can change the `monad` user to your custom user (if needed)[Unit]Description=Create hugepage mounts for monadAfter=local-fs.target
[Service]Type=oneshotExecStart=/usr/bin/hugeadm --create-user-mounts monadRemainAfterExit=yes
[Install]WantedBy=multi-user.target
### Edits below this comment will be discarded
Configure the systemd overrides​
Important items​
systemd:

As a reminder, if you installed Monad via apt, the systemd unit files live in: /usr/lib/systemd/sytem
This means we need to create a systemd override
systemd overrides for ExecStart (and other additive settings) require two blocks. The first "clears" the original value and the second sets the new value.
You will need to do a systemctl daemon-reload after the changes

events + websockets:

RPC + websockets has a HARD dependency on Execution runnning with events

websockets specific:

You will need to open a port in your firewall
The default is 8081
If you want to use a custom port, the --ws-port <PORT> for RPC allows you to set the port of your choosing

Configure the Execution override for systemd​
This override enables the events sub-component for Execution
warningIf RPC + websockets is started without events being enabled for Execution, RPC will start and then crash
You can launch the override editor via:
sudo systemctl edit monad-execution
Which will make a new file at /etc/systemd/system/monad-execution.service.d/override.conf
File contents (as viewed when using the override editor):
### Anything between here and the comment below will become the contents of the drop-in file
# NOTE: BOTH ExecStarts are REQUIRED
[Service]ExecStart=ExecStart=/usr/local/bin/monad \    --chain "$CHAIN" \    --db /dev/triedb \    --block_db /home/monad/monad-bft/ledger \    --statesync /home/monad/monad-bft/statesync.sock \    --exec-event-ring /var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/monad-exec-events \    --sq_thread_cpu 1 \    --log_level INFO
### Edits below this comment will be discarded
Do reload:
sudo systemctl daemon-reload
Restart Execution​
Adding this step here to ensure that Execution is restarted with the events enabled
sudo systemctl restart monad-execution
Configure the RPC override for systemd​
This override enables the websockets sub-component for RPC
You can launch the override editor via:
sudo systemctl edit monad-rpc
Which will make a new file at /etc/systemd/system/monad-rpc.service.d/override.conf
File contents:
# NOTE: BOTH ExecStarts are REQUIRED
[Service]ExecStart=ExecStart=/usr/local/bin/monad-rpc \    --ipc-path /home/monad/monad-bft/mempool.sock \    --triedb-path /dev/triedb \    --otel-endpoint "http://0.0.0.0:4317" \    --allow-unprotected-txs \    --node-config /home/monad/monad-bft/config/node.toml \    --exec-event-path /var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/monad-exec-events \    --ws-enabled
Restart RPC​
sudo systemctl restart monad-rpc
Checking the connectivity​
A quick way to check if WebSocket connectivity is working is to use a
general purpose command-line tool that can act as WebSocket client,
such as websocat. This is a
powerful command-line "swiss army knife" tool, like nc or the
original socat. It is not officially packaged for Debian/Ubuntu yet,
but precompiled binaries can be downloaded or installed via
cargo install websocat (it is a Rust program).
Here is an example of running it in verbose mode (-v), with the
WebSocket service hosted on default port 8081:
$ websocat -v ws://localhost:8081[INFO  websocat::lints] Auto-inserting the line mode[INFO  websocat::stdio_threaded_peer] get_stdio_peer (threaded)[INFO  websocat::ws_client_peer] get_ws_client_peer[INFO  websocat::net_peer] Connected to TCP 127.0.0.1:8081[INFO  websocat::ws_client_peer] Connected to ws[INFO  websocat::ws_peer] Received WebSocket ping
To subscribe, type the subscription JSON RPC call for
eth_subscribe into your terminal's stdin and press enter:
{ "id": 1, "jsonrpc": "2.0", "method": "eth_subscribe", "params": ["newHeads"] }
Every half-second or so, you should see updates about new blocks.

## Code Examples

```prism
sudo apt install libhugetlbfs-bin
```

```prism
sudo apt install libhugetlbfs-dev libhugetlbfs0 libzstd-dev
```

```prism
# NOTE: here we use `monad` but if you are running as a custom user, that should be set here$ sudo hugeadm --create-user-mounts monad
```

```prism
/etc/systemd/system/events-hugepages-mounts.service
```

```prism
### Anything between here and the comment below will become the contents of the drop-in file
# NOTE: as mentioned above, you can change the `monad` user to your custom user (if needed)[Unit]Description=Create hugepage mounts for monadAfter=local-fs.target
[Service]Type=oneshotExecStart=/usr/bin/hugeadm --create-user-mounts monadRemainAfterExit=yes
[Install]WantedBy=multi-user.target
### Edits below this comment will be discarded
```

```prism
sudo systemctl edit monad-execution
```

```prism
### Anything between here and the comment below will become the contents of the drop-in file
# NOTE: BOTH ExecStarts are REQUIRED
[Service]ExecStart=ExecStart=/usr/local/bin/monad \    --chain "$CHAIN" \    --db /dev/triedb \    --block_db /home/monad/monad-bft/ledger \    --statesync /home/monad/monad-bft/statesync.sock \    --exec-event-ring /var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/monad-exec-events \    --sq_thread_cpu 1 \    --log_level INFO
### Edits below this comment will be discarded
```

```prism
sudo systemctl daemon-reload
```

```prism
sudo systemctl restart monad-execution
```

```prism
sudo systemctl edit monad-rpc
```

```prism
# NOTE: BOTH ExecStarts are REQUIRED
[Service]ExecStart=ExecStart=/usr/local/bin/monad-rpc \    --ipc-path /home/monad/monad-bft/mempool.sock \    --triedb-path /dev/triedb \    --otel-endpoint "http://0.0.0.0:4317" \    --allow-unprotected-txs \    --node-config /home/monad/monad-bft/config/node.toml \    --exec-event-path /var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/monad-exec-events \    --ws-enabled
```

```prism
sudo systemctl restart monad-rpc
```

```prism
$ websocat -v ws://localhost:8081[INFO  websocat::lints] Auto-inserting the line mode[INFO  websocat::stdio_threaded_peer] get_stdio_peer (threaded)[INFO  websocat::ws_client_peer] get_ws_client_peer[INFO  websocat::net_peer] Connected to TCP 127.0.0.1:8081[INFO  websocat::ws_client_peer] Connected to ws[INFO  websocat::ws_peer] Received WebSocket ping
```

```prism
{ "id": 1, "jsonrpc": "2.0", "method": "eth_subscribe", "params": ["newHeads"] }
```

