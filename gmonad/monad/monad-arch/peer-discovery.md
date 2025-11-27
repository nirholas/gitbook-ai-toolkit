# Peer Discovery

> Source: https://docs.monad.xyz/monad-arch/consensus/peer-discovery

## Documentation

On this page

Summary​
Peer discovery enables a new validator or full node to join the network by connecting with
other existing nodes, in order to receive consensus messages necessary to validate and
keep up to the chain tip.
To participate in peer discovery, a node needs to generate a MonadNameRecord, which
contains the socket address of the node, a sequence number, and the signature over the
socket address and sequence number using its secp key. Currently only IPv4 addresses
are supported.
struct MonadNameRecord {  address: std::net::SocketAddrV4,  seq: u64,  signature: SecpSignature,}
The socket address is the network address at which other nodes in the network may
contact it. A sequence number is necessary to ensure newer name records take priority
over older name records. For example, when a node sees a peer's name records with a
higher sequence number, it will update its routing table with the new name record.
A node specifies a few bootstrap nodes and their name records when starting up. Bootstrap
nodes are not specialized nodes; any node in the network can be a bootstrap node. The
node will then advertise its own name record by sending pings to other peers, where the
ping message contains its own name record. The node also sends lookup request to its peers
when it is missing name records of current active validators. Periodically, the node looks
for new nodes or prunes excessive nodes depending on the min and max number of peers
configured.

## Code Examples

```prism
struct MonadNameRecord {  address: std::net::SocketAddrV4,  seq: u64,  signature: SecpSignature,}
```

