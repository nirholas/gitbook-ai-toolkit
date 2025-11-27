# How Full Nodes Receive Blocks

> Source: https://docs.monad.xyz/node-ops/full-node-block-delivery

## Documentation

On this page

noteSee here for instructions on how to set up a full node.
The RaptorCast protocol is a new method of one-to-many
block propagation that uses an erasure-coded two-level broadcast tree to propagate large blocks
from a message originator to many listeners.
RaptorCast is used both for communication among validators, as well as for validators to
propagate blocks outward to full nodes.
The former is primary RaptorCast - how validators in the active set receive block proposals
from the leader.
The latter is secondary RaptorCast - how each validator pushes a block proposal to downstream
full nodes.
Secondary RaptorCast follows the same mechanism as primary RaptorCast, except the message
originator is fixed, other full nodes serve as the other participants, and all weights on the nodes
are equal rather than stake-weighted.
Secondary RaptorCast allows the network to support a huge set of full nodes. In the
recommended configuration, each validator has a secondary RaptorCast group of size 150, so if the
network has 200 nodes, there is capacity for 30,000 full nodes. After accounting for a redundancy
factor of 3 (full nodes may register for multiple secondary RaptorCast groups), there is still
capacity for 10,000 full nodes.
How full nodes register for secondary RaptorCast​


Full nodes start by peering with some of the validators. They do this by peering with the
bootstrap peers specified in node.toml, then asking them for their peers, and repeating until they
have the name records of the full validator set.


On a recurring basis, each validator (provided that it has enable_publisher = true in
node.toml) sends invites to the full nodes in its routing table up to max_group_size,
inviting the full nodes to join that validator's secondary RaptorCast group.


A full node will accept or reject, rejecting if they are already in too many groups.


The validator will collect these accept/reject responses and confirm a group.


The group will lasts for round_span specified in the validator's node.toml (default: 240
rounds). When one of these intervals is close to finishing, the validator starts sending
invites for its next secondary RaptorCast group.


Full nodes can (and should) join multiple secondary RaptorCast groups for redundancy.
This is controlled by the max_num_group parameter below.


Note that when a full node first statesyncs, it will need to wait a little bit before being added
to a secondary RaptorCast group.
Configuration​
node.toml contains the following settings:
[fullnode_raptorcast]enable_publisher = trueenable_client = trueraptor10_fullnode_redundancy_factor = 3.0max_group_size = 150round_span = 240invite_lookahead = 20max_invite_wait = 10deadline_round_dist = 10init_empty_round_span = 23max_num_group = 3invite_future_dist_min = 1invite_future_dist_max = 600invite_accept_heartbeat_ms = 10000
[fullnode_raptorcast.full_nodes_prioritized]identities = []
Some parameters only affect validators:

enable_publisher = true means that if the full node becomes a validator, it will participate
as a secondary RaptorCast originator.
max_group_size maximum number of full nodes in a group
round_span number of rounds that a group last for
invite_lookahead how far ahead (in rounds) does a validator sends invites to full nodes before the start of the round
max_invite_wait maximum number of rounds that a validator wait for invite response from the full node

Some parameters only affect full nodes:

full nodes should have enable_client = true to participate in secondary RaptorCast
max_num_group indicates the maximum number of groups that the full node will join
invite_future_dist_min and invite_future_dist_max indicates the time range (in rounds) that
the full node will accept the secondary raptorcast group invite
invite_accept_hearbeat_ms is a heartbeat which is used to determine whether the full node is
receiving proposals

Although some parameters only affect full nodes, node operators running validators should still
populate these parameters thoughtfully becasue whenever the validator is not in the active set,
it should still keep up with the chain tip. Operators will likely want to start their validators
as full nodes before activating to avoid missing block proposals.
Additional options​
Prioritized secondary RaptorCast inclusion​
A full node may coordinate with a validator to be explicitly and consistently invited to that
validator's secondary RaptorCast group.
To do this, the full node provides some information for the validator to include in its
[fullnode_raptorcast.full_nodes_prioritized.identities] section.  See
Validator Installation for details on what needs to
be provided. Note that this means the full node doesn't have to rely on peer discovery to peer with
that validator.
Dedicated upstream​
Validators also have the option of specifying full nodes to which they wish to directly forward
all primary RaptorCast chunks.
This utilizes a lot of validator bandwidth, since each registered downstream requires another
copy of all chunks to be sent. It is potentially more reliable for the downstream node than
subscribing via secondary RaptorCast, although in practice secondary RaptorCast is quite reliable.
Note that if a full node is designated by one or more validators for dedicated chunk forwarding,
then it could be configured with enable_client = false. This turns off attempting to participate
in secondary RaptorCast.
Comparison​
ConfigurationRequires validator to whitelist full nodeRaptorCast modeData SourceNormalNoenable_client = trueSecondary RaptorCastPrioritized secondary RaptorCastYesenable_client = trueSecondary RaptorCastChunk forwardingYesenable_client = falsePrimary RaptorCast
Note that these configurations are properties of a relationship between a full node and a
validator, rather than properties of the full node itself.
A full node could coordinate with multiple validators to treat it specially, while
also participating in normal secondary RaptorCast with other validators that it automatically
peers with.
RaptorCast configurations for validators​
Validators can toggle off their participation in secondary RaptorCast by setting
enable_publisher = false.
Although turning secondary RaptorCast off will reduce bandwidth usage,
note that the bandwidth cost of secondary RaptorCast is relatively low; for example, even at
10,000 transactions per second, the expected usage is will be about 6 MB per second (2 MB of
block data with 3x redundancy). Therefore, it is recommended to keep enable_publisher = true.
RaptorCastFor more technical details about the RaptorCast, see the
RaptorCast documentation.

## Code Examples

```prism
[fullnode_raptorcast]enable_publisher = trueenable_client = trueraptor10_fullnode_redundancy_factor = 3.0max_group_size = 150round_span = 240invite_lookahead = 20max_invite_wait = 10deadline_round_dist = 10init_empty_round_span = 23max_num_group = 3invite_future_dist_min = 1invite_future_dist_max = 600invite_accept_heartbeat_ms = 10000
[fullnode_raptorcast.full_nodes_prioritized]identities = []
```

