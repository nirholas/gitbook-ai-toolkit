# Staking Precompile

> Source: https://docs.monad.xyz/developer-essentials/staking/staking-precompile

## Documentation

On this page

noteThis page is intended for developers looking to build smart contracts or interfaces
that interact with the staking system.
The entrypoint to the staking system is the stateful staking precompile.
This precompile allows delegators and validators to take actions that
affect the composition of the validator set.

join the validator set (addValidator)
delegate their stake to a validator (delegate)
undelegate their stake from a validator (a multi-step process: undelegate,
wait WITHDRAWAL_DELAY epochs, then withdraw)
compound the rewards they earned as a delegator (i.e. delegate the rewards)
(compound)
claim the rewards they earned as a delegator (claimRewards)

For ease of integration, please see the Solidity Interface
and the ABI JSON.
Although users may delegate or undelegate at any time, stake weight changes only take effect at
epoch boundaries, and stake weight changes made too close to the start of the epoch will be queued until
the next epoch boundary, as described in Staking Behavior.  This is to
allow for the separation of consensus and execution, one of Monad's core design attributes.
noteOnly standard CALLs are allowed to the staking precompile. In particular,
STATICCALL and DELEGATECALL are not allowed.Because the staking system is a precompile and not a smart contract,
you cannot test against it in a forked environment.
Precompile Address and Selectors​
The contract address is 0x0000000000000000000000000000000000001000.
The external functions are identified by the following 4-byte selectors.
External state-modifying methods:

addValidator(bytes,bytes,bytes) - 0xf145204c
delegate(uint64) - 0x84994fec
undelegate(uint64,uint256,uint8) - 0x5cf41514
withdraw(uint64,uint8) - 0xaed2ee73
compound(uint64) - 0xb34fea67
claimRewards(uint64) - 0xa76e2ca5
changeCommission(uint64,uint256) - 0x9bdcc3c8
externalReward(uint64) - 0xe4b3303b

External view methods:

getValidator(uint64) - 0x2b6d639a
getDelegator(uint64,address) - 0x573c1ce0
getWithdrawalRequest(uint64,address,uint8) - 0x56fa2045
getConsensusValidatorSet(uint32) - 0xfb29b729
getSnapshotValidatorSet(uint32) - 0xde66a368
getExecutionValidatorSet(uint32) - 0x7cb074df
getDelegations(address,uint64) - 0x4fd66050
getDelegators(uint64,address) - 0xa0843a26
getEpoch() - 0x757991a8

Syscalls:

syscallOnEpochChange(uint64) - 0x1d4e9f02
syscallReward(address) - 0x791bdcf3
syscallSnapshot() - 0x157eeb21

External State-Modifying Methods​
addValidator​
Function selector​
addValidator(bytes,bytes,bytes) : 0xf145204c
Function signature​
function addValidator(    bytes calldata payload,    bytes calldata signedSecpMessage,    bytes calldata signedBlsMessage) external payable returns (uint64 validatorId);
Parameters​

payload - consists of the following fields, packed together in big endian
(equivalent to abi.encodePacked() in Solidity):

bytes secpPubkey (unique SECP public key used for consensus)
bytes blsPubkey (unique BLS public key used for consensus)
address authAddress (address used for the validator’s delegator account. This address has
withdrawal authority for the validator's staked amount)
uint256 amount (amount the validator is self-staking. Must equal msg.value)
uint256 commission (commission charged to delegators multiplied by 1e18, e.g. 10% = 1e17)


signedSecpMessage - SECP signature over payload
signedBlsMessage - BLS signature over payload

Gas cost​
505,125
Behavior​
This creates a validator with an associated delegator account and returns the resultant validatorId.
The method starts by unpacking the payload to retrieve the secpPubkey, blsPubkey,
authAddress, amount, and commission, then verifying that the signedSecpMessage
and signedBlsMessage correspond to the payload signed by the corresponding SECP and BLS
private keys.

The validator must provide both a unique BLS key and a unique SECP key. Submissions with any
repeated public keys will revert.
Both signatures (signedSecpMessage and signedBlsMessage) must be valid and must sign
over the payload.
Multiple validators may share the same authAddress.
msg.value must be equal or greater than MIN_AUTH_ADDRESS_STAKE or the call will revert.
If the msg.value is also equal or greater than ACTIVE_VALIDATOR_STAKE then the validator
will become active in the future:

If addValidator was called before the boundary block, then in epoch n+1;
Otherwise it will become active in epoch n+2.



Pseudocodesecp_pubkey, bls_pubkey, auth_address, amount, commission = payload
assert amount == msg.value
// increment validator idlast_val_id = last_val_id + 1;
// set uniqueness of keyssecp_to_val_id[secp_eth_address] = last_val_id;bls_to_val_id[bls_eth_address] = last_val_id;
// set validator infoval_execution[last_val_id] = ValExecution{    uint256 stake = msg.value;    uint256 commission = commission;    bytes secp_pubkey = secp_pubkey;    bytes bls_pubkey = bls_pubkey;    uint256 address_flags = set_flags();}
// set authority delegator infodelegator[last_val_id][input.auth_address] = DelInfo{    uint256 delta_stake = set_stake()[0];    uint256 next_delta_stake = set_stake()[1];    uint64 delta_epoch = set_stake()[2];    uint64 next_delta_epoch = set_stake()[3];}
// set delegator accumulatorepoch_acc[last_val_id][getEpoch()] = Accumulator{    uint256 ref_count += 1;}
// set flagsset_flags();
// push validator idif (val_execution[last_val_id].stake() >= ACTIVE_VALIDATOR_STAKE        and last_val_id not in execution_valset):    execution_valset.push(last_val_id);
return last_val_id;
def set_flags():    if msg.value + val_execution[last_val_id].stake() >= ACTIVE_VALIDATOR_STAKE:        return ValidatorFlagsOk;    if msg.value + val_execution[last_val_id].stake() >= MIN_AUTH_ADDRESS_STAKE        return ValidatorFlagsStakeTooLow;
def set_stake():    if in_epoch_delay_rounds:        delta_stake = 0;        next_delta_stake = msg.value;        delta_epoch = 0;        next_delta_epoch = current_epoch + 2;    else:        delta_stake = msg.value;        next_delta_stake = 0;        delta_epoch = current_epoch + 1;        next_delta_epoch = 0;    return [delta_stake, next_delta_stake, delta_epoch, next_delta_epoch];
Usage​
Here is an example of assembling the payload and signing:
def generate_add_validator_call_data_and_sign(    secp_pubkey: bytes,    bls_pubkey: bytes,       auth_address: bytes,     amount: int,      commission: int    secp_privkey: bytes    bls_privkey: bytes) -> bytes:    # 1) Encode    payload_parts = [        secp_pubkey,        bls_pubkey,        auth_address,        toBigEndian32(amount),        toBigEndian32(commission),    ]    payload = b"".join(payload_parts)
    # 2) Sign with both keys    secp_sig = SECP256K1_SIGN(blake3(payload), secp_privkey)     bls_sig  = BLS_SIGN(hash_to_curve(payload), bls_privkey)
    # 3) Solidity encode the payload and two signatures    return eth_abi.encode(['bytes', 'bytes', 'bytes'], [payload, secp_sig, bls_sig])
delegate​
Function selector​
delegate(uint64) : 0x84994fec
Function signature​
function delegate(    uint64 validatorId) external payable returns (bool success);
Parameters​

validatorId - id of the validator that delegator would like to delegate to
msg.value - the amount to delegate

Gas cost​
260,850
Behavior​
This creates a delegator account if it does not exist and increases the delegator's
balance.

The delegator account is determined by msg.sender.
validatorId must correspond to a valid validator.
msg.value must be > 0.
If this delegation causes the validator's total stake to exceed ACTIVE_VALIDATOR_STAKE,
then the validator will be added to execution_valset if not already present.
The delegator stake becomes active

in epoch n+1 if the request is before the boundary block
in epoch n+2 otherwise



Pseudocodevalidator_id = msg.input.val_id;
// set validator informationval_execution[validator_id] =  ValExecution{    uint256 stake += msg.value();}
// set delegator informationDelInfo current_delegator = delegator[validator_id][msg.sender];
// apply get_current_stake() first. This updates the delegator stake// to be inline with the current stake activated in consensus.get_current_stake();
// apply add_stake() second.uint256[4] add_stake_info = add_stake(msg.value());
current_delegator = DelInfo{    uint256 delta_stake = add_stake_info[0];    uint256 next_delta_stake = add_stake_info[1];    uint64 delta_epoch = add_stake_info[2];    uint64 next_delta_epoch = add_stake_info[3];}
// set epoch accumulatorepoch_acc[validator_id][getEpoch()].ref_count += 1;
// set flagsset_flags();
// push validator idif val_execution[validator_id].stake() >= ACTIVE_VALIDATOR_STAKE        and validator_id not in execution_valset:    execution_valset.push(validator_id);
def add_stake(uint256 amount):    uint256 _delta_stake;    uint256 _next_delta_stake;    uint64 _delta_epoch;    uint64 _next_delta_epoch;
    if not in_epoch_delay_rounds:        _delta_stake = current_delegator.delta_stake() + amount;        _next_delta_stake = 0;        _delta_epoch = current_epoch + 1;        _next_delta_epoch = 0;    else:        _delta_stake = 0;        _next_delta_stake = current_delegator.next_delta_stake() + amount;        _delta_epoch = 0;        _next_delta_epoch = current_epoch + 2;    return [_delta_stake, _next_delta_stake, _delta_epoch, _next_delta_epoch];

def maybe_process_next_epoch_state():    """    Helper function to process and update rewards    based on the current epoch state.    """
    if (        epoch_acc[validator_id][current_delegator.delta_epoch()] != 0        and current_epoch > current_delegator.delta_epoch()        and current_delegator.delta_epoch() > 0    ):        // Compute rewards from the last checked epoch.        _rewards += current_delegator.stake() * (            epoch_acc[validator_id][current_delegator.delta_epoch()].val()            - current_delegator.acc()        )
        // Promote stake to active in delegator view.        current_delegator.stake() += current_delegator.delta_stake()        current_delegator.acc() = (            epoch_acc[validator_id][current_delegator.delta_epoch()].val()        )        current_delegator.delta_epoch() = current_delegator.next_delta_epoch()        current_delegator.delta_stake() = current_delegator.next_delta_stake()        current_delegator.next_delta_epoch() = 0        current_delegator.next_delta_stake() = 0
        epoch_acc[validator_id][current_delegator.delta_epoch].ref_count -= 1

def get_current_stake():    uint256 _rewards = 0;
    // Process next epoch rewards and increment stake    maybe_process_next_epoch_state()    // Perform again to capture max two additional epochs    maybe_process_next_epoch_state()
    current_delegator.rewards() += _rewards;    return _rewards;
undelegate​
Function selector​
undelegate(uint64,uint256,uint8) : 0x5cf41514
Function signature​
function undelegate(    uint64 validatorId,    uint256 amount,    uint8 withdrawId) external returns (bool success);
Parameters​

validatorId - id of the validator to which sender previously delegated, from which we are
removing delegation
amount - amount to undelegate, in Monad wei
withdrawId - integer between 0 and 255, inclusive, which serves as the identifier for a
delegator's withdrawal. For each (validator, delegator) tuple, there can be a maximum of 256
in-flight withdrawal requests

Gas cost​
147,750
Behavior​
This deducts amount from the delegator account and moves it to a withdrawal request object,
where it remains in a pending state for WITHDRAWAL_DELAY
epochs before the funds are claimable via the withdraw method.

The delegator account is determined by msg.sender.
validatorId must correspond to a valid validator to which the sender previously delegated
The delegator must have stake >= amount.
If the withdrawal causes Val(validatorId).stake() to drop below ACTIVE_VALIDATOR_STAKE, then the
validator is scheduled to be removed from the valset.
If the authAddress on a validator undelegates enough of their own stake to drop below
MIN_AUTH_ADDRESS_STAKE, then the validator is scheduled to be removed from the valset.
The function will revert if there is a pending withdrawal with the same withdrawId.
withdrawIds can be reused after calling withdraw.
A delegator can only remove a stake after it has been activated. This is the stake field in
the delegator struct. Pending delegations cannot be removed until they are active.
The delegator stake becomes inactive in the valset

in epoch n+1 if the request is before the boundary block
in epoch n+2 otherwise


The delegator stake becomes withdrawable, and thus no longer subject to slashing

in epoch n + 1 + WITHDRAWAL_DELAY if the request is before the boundary block
in epoch n + 2 + WITHDRAWAL_DELAY otherwise



Timeline of withdrawability of stake relative to undelegate command
Pseudocodeuint64 validator_id = msg.input.val_id;uint256 amount = msg.input.amount;uint8 withdraw_id = msg.input.withdraw_id;
ValExecution current_validator = val_execution[validator_id];
// set validator informationcurrent_validator =  ValExecution{    uint256 stake -= amount;}
// apply get_current_stake() first.get_current_stake();
DelInfo current_delegator = delegator[validator_id][msg.sender];// set delegator informationcurrent_delegator = DelInfo{    uint256 stake -= amount;}
// set withdraw requestwithdrawal[validator_id][msg.sender][withdraw_id] = WithdrawalRequest{    uint256 amount = amount;    uint256 acc = current_validator.acc();    uint64 epoch = getEpoch();});
// set epoch accumulatorepoch_acc[validator_id][getEpoch()].ref_count += 1;
// schedule validator to leave setif current_validator.stake < ACTIVE_VALIDATOR_STAKE and validator_id in execution_valset:    current_validator.set_flag(INSUFFICIENT_STAKE);
if (current_delegator.stake <= MIN_AUTH_ADDRESS_STAKE and validator_id in execution_valset) and msg.sender == current_validator.auth_address:    current_validator.set_flag(INSUFFICIENT_VALIDATOR_STAKE);
withdraw​
Function selector​
withdraw(uint64,uint8) : 0xaed2ee73
Function signature​
function withdraw(    uint64 validatorId,    uint8 withdrawId) external returns (bool success);
Parameters​

validatorId - id of the validator to which sender previously delegated, from which we previously
issued an undelegate command
withdrawId - identifier for a delegator's previously created withdrawal; the same id
previously supplied to undelegate. For each (validator, delegator) tuple,
there can be a maximum of 256 in-flight withdrawal requests.

Gas cost​
68,675
Behavior​
This completes an undelegation action (which started with a call to the undelegate function),
sending the amount to msg.sender, provided that sufficient epochs have passed.

The delegator is msg.sender. The withdrawal is identified by msg.sender, validatorId,
and withdrawId
The withdraw action can take place once the undelegation is complete, and the withdraw delay has passed:

in epoch n + 1 + WITHDRAWAL_DELAY if the undelegate request is before the boundary block
in epoch n + 2 + WITHDRAWAL_DELAY otherwise



Pseudocodeuint64 validator_id = msg.input.val_id;uint8 withdraw_id = msg.input.withdraw_id;
WithdrawalRequest current_withdraw = withdrawal[validator_id][msg.sender][withdraw_id];
// Compute any additional rewards and transfer funds to delegatortransfer(msg.sender, current_withdraw.amount + get_withdraw_rewards());
// unset withdraw requestwithdrawal[validator_id][msg.sender][withdraw_id] = WithdrawalRequest{    uint256 amount = 0,    uint256 acc = 0,    uint64 epoch = 0};
def get_withdraw_rewards():    epoch_acc[validator_id][current_withdraw.epoch].ref_count -= 1;    return current_withdraw.amount() * (epoch_acc[validator_id][current_withdraw.epoch()].val() - current_withdraw.acc());
compound​
Function selector​
compound(uint64) : 0xb34fea67
Function signature​
function compound(    uint64 validatorId) external returns (bool success);
Parameters​

validatorId - id of the validator to which sender previously delegated, for which we are
compounding rewards

Gas cost​
285,050
Behavior​
This precompile converts the delegator's accumulated rewards into additional stake.

The account compounded is determined by msg.sender. If a delegator account does not exist, then the call reverts
validatorId must correspond to a valid validator to which the sender previously delegated
The delegator rewards become active in the valset

in epoch n+1 if the request is before the boundary block
in epoch n+2 otherwise.



Pseudocodevalidator_id = msg.input.val_id;
// set delegator informationDelInfo current_delegator = delegator[validator_id][msg.sender];
// apply get_current_stake() first. This updates the delegator stake// to be inline with the current stake activated in consensus.rewards_compounded = get_current_stake();
// apply add_stake() second.uint256[4] add_stake_info = add_stake(rewards_compounded);
// set delegator informationcurrent_delegator = DelInfo{    uint256 delta_stake = add_stake_info[0];    uint256 next_delta_stake = add_stake_info[1];    uint64 delta_epoch = add_stake_info[2];    uint64 next_delta_epoch = add_stake_info[3];    uint256 rewards = 0;}
// set validator informationval_execution[validator_id] = ValExecution{    uint256 stake += rewards_compounded;}
// set accumulatorepoch_acc[validator_id][getEpoch()] = Accumulator{    uint256 ref_count += 1;}
// set flagsset_flags();
// push validator idif val_execution[validator_id].stake() >= ACTIVE_VALIDATOR_STAKE and validator_id not in execution_valset:    execution_valset.push(validator_id);

claimRewards​
Function selector​
claimRewards(uint64) : 0xa76e2ca5
Function signature​
function claimRewards(    uint64 validatorId) external returns (bool success);
Parameters​

validatorId - id of the validator to which sender previously delegated, for which we are
claiming rewards

Gas cost​
155,375
Behavior​
This precompile allows a delegator to claim any rewards instead of compounding them.

validatorId must correspond to a valid validator to which the sender previously delegated
If delegator account does not exist for this (validatorId, msg.sender) tuple, then the call reverts
The delegator's accumulated rewards are transferred to their delegation

Pseudocode// set delegator informationDelInfo current_delegator = delegator[validator_id][msg.sender];
// apply get_current_stake() first.uint256 current_rewards = get_current_stake();
// set delegator informationcurrent_delegator = DelInfo{    uint256 rewards = 0;)
// send rewards to delegatortransfer(msg.sender, current_rewards);
changeCommission​
Function selector​
changeCommission(uint64,uint256) : 0x9bdcc3c8
Function signature​
function changeCommission(    uint64 validatorId,    uint256 commission) external returns (bool success);
Parameters​

validatorId - id of the validator, who would like to change their commission rate
commission - commission rate taken from block rewards, expressed in 1e18 units
(e.g., 10% = 1e17)

Gas cost​
39,475
Behavior​
This allows the authAddress for a validator to modify the commission for the validator.
The commission cannot be set larger than MAX_COMMISSION (currently 100%).

The msg.sender must be the authAddress for the respective validator Id.
The commission cannot be set larger than MAX_COMMISSION (currently 100%).
The change in commission occurs in the following epochs:

in epoch n+1 if request is not in the epoch delay rounds.
in epoch n+2 if request is in the epoch delay rounds.



Pseudocodevalidator_id = msg.input.val_id;

val_execution[validator_id] = ValExecution{    uint256 commission = msg.input.commission;}


externalReward​
Function selector​
externalReward(uint64) : 0xe4b3303b
Function signature​
function externalReward(    uint64 validatorId) external returns (bool success);
Parameters​

validatorId - id of the validator
msg.value - the MON to add to unclaimed rewards

Gas cost​
62,300
Behavior​
This function allows anyone to send extra MON to the stakers of a particular validator. This
typically will be called by the validator themselves to share extra tips to their delegators.
Notes:

This can only be called for a validator currently in the consensus validator set; otherwise
the transaction reverts.
msg.value must be between 1 MON and 1,000,000 MON; otherwise the transaction reverts.
Commission is not deducted from this and diverted to the validator's auth_address. If you
wish for a portion to be deducted, it should be deducted before sending.

Pseudocodevalidator_id = msg.input.val_id;
require(msg.value >= 1e18 && msg.value <= 1e24, "Reward out of bounds");require(val_consensus[validator_id] > 0 , "Validator not active");
val_execution[validator_id].unclaimed_reward += msg.value;val_execution[val_id].acc += msg.value / val_consensus[val_id].stake();

External View Methods​
getValidator​
Function selector​
getValidator(uint64) : 0x2b6d639a
Function signature​
function getValidator(    uint64 validatorId) external view returns (    address authAddress,    uint64 flags,    uint256 stake,    uint256 accRewardPerToken,    uint256 commission,    uint256 unclaimedRewards,    uint256 consensusStake,    uint256 consensusCommission,    uint256 snapshotStake,    uint256 snapshotCommission,    bytes memory secpPubkey,    bytes memory blsPubkey);
Parameters​

validatorId - id of the validator

Gas cost​
97,200
Behavior​
This is the primary method to obtain information about a validator state.
It provides a complete view of the validator’s state across execution, consensus, and snapshot
contexts.
It returns:

ValExecution (execution view)
Stake and commission (consensus view)
Stake and commission (snapshot view)

getDelegator​
Function selector​
getDelegator(uint64,address) : 0x573c1ce0
Function signature​
function getDelegator(    uint64 validatorId,     address delegator) external returns (    uint256 stake,    uint256 accRewardPerToken,    uint256 unclaimedRewards,    uint256 deltaStake,    uint256 nextDeltaStake,    uint64 deltaEpoch,    uint64 nextDeltaEpoch);
Parameters​

validatorId - id of the validator
delegator - address of the delegator about whose stake we are inquiring

Gas cost​
184,900
Behavior​
This returns the delegator’s DelInfo for the specified validator,
providing a view of the delegator’s stake, accumulated rewards and pending changes in stake.
getWithdrawalRequest​
Function selector​
getWithdrawalRequest(uint64,address,uint8) : 0x56fa2045
Function signature​
function getWithdrawalRequest(    uint64 validatorId,    address delegator,    uint8 withdrawId) external returns (    uint256 withdrawalAmount,    uint256 accRewardPerToken,    uint64 withdrawEpoch);
Gas cost​
24,300
Behavior​
This returns the pending WithdrawalRequest for the (validatorId, delegator, withdrawId) tuple.
get*ValidatorSet​
Function selectors​
getConsensusValidatorSet(uint32) : 0xfb29b729getSnapshotValidatorSet(uint32) : 0xde66a368getExecutionValidatorSet(uint32) : 0x7cb074df
Function signatures​
function getConsensusValidatorSet(    uint32 startIndex) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
function getSnapshotValidatorSet(    uint32 startIndex) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
function getExecutionValidatorSet(    uint32 startIndex) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
Parameters​

startIndex - since the list being looked up is potentially very long, each of these functions
is paginated, returning a fixed-length subset of the desired list. Pass startIndex to
indicate where in the list to start.

Gas cost​
814,000 gas (assuming PAGINATED_RESULTS_SIZE = 100).
Behavior​
These functions return the consensus, snapshot, and execution validator ids, respectively.
Each call retrieves up to PAGINATED_RESULTS_SIZE validator ids starting from startIndex and
returns a tuple (bool done, uint32 nextIndex, uint256[] valids).
The bool isDone indicates whether the end of the list was reached. The uint32 nextIndex
is the last slot in the array.
getDelegations​
Function selector​
getDelegations(address,uint64) : 0x4fd66050
Function signature​
function getDelegations(    address delegator,    uint64 startValId) external returns (bool isDone, uint64 nextValId, uint64[] memory valIds);
Parameters​

delegator - the address whose delegations we want to look up
startValId

Gas cost​
814,000
Behavior​
Each call retrieves up to PAGINATED_RESULTS_SIZE validator ids starting from startValId
and returns a tuple (bool isDone, uint64 nextValId, uint64[] valIds) with delegation
from the input delegator address.
The bool isdone indicates whether the end of the list was reached.
The uint64 nextValId is the id after the last element in valIds. Use it as the
startValId for the next call.
If delegator has delegated to over PAGINATED_RESULTS_SIZE validator ids,
multiple calls are required (while isDone is false).
To capture the full set, the make the first function call using startValId = 0.
getDelegators​
Function selector​
getDelegators(uint64,address) : 0xa0843a26
Function signature​
function getDelegators(    uint64 validatorId,    address startDelegator) external returns (bool isDone, address nextDelegator, address[] memory delegators);
Parameters​

validatorId - the id of the validator for which we want to know the delegators
startDelegator

Gas cost​
814,000
Behavior​
Each call retrieves up to PAGINATED_RESULTS_SIZE delegator addresses starting from
startDelegator and returns a tuple (bool isDone, address nextDelegator, address[] delegators)
with delegation to the input validatorId.
The bool isDone indicates the end of the list was reached.
The nextDelegator is the address immediately after the last element in delegators.
Use it as startDelegator for the next call.
To capture the full set, the function should be called with startDelegator = 0.
noteThe number of delegators to a given validator can be very large, so it is recommended to
maintain an updated list via the
events framework, rather
than periodically calling this expensive lookup.
getEpoch​
Function selector​
getEpoch() : 0x757991a8
Function signature​
function getEpoch() external returns (uint64 epoch, bool inEpochDelayPeriod);
Gas cost​
16,200
Behavior​
This function is a handy utility to determine the current epoch and timing within the epoch (before
or after the boundary block).
If inEpochDelayPeriod is false, the boundary block has not been reached yet
and write operations at that time should be effective for epoch + 1.
If inEpochDelayPeriod is true, the network is past the boundary block and
and write operations at that time should be effective for epoch + 2
getProposerValId​
Function selector​
getProposerValId() : 0xfbacb0be
Function signature​
function getProposerValId() external returns (uint64 val_id);
Gas cost​
100
Behavior​
This function returns the validator ID of the current block proposer. Specifically, this validator ID corresponds to the sec_p value of the block author.
Syscalls​
There are currently three syscalls. Users cannot invoke these directly. They are only
triggered through special system transactions.
syscallOnEpochChange​
Function selector​
syscallOnEpochChange(uint64) : 0x1d4e9f02
Function signature​
function syscallOnEpochChange(uint64 epoch) external;
Parameters​

epoch - the new consensus epoch being entered

Behavior​
This syscall is triggered at the end of the epoch delay rounds. It performs the following
actions:

If the validator received a request to change stake in the previous epoch and participated in the previous epoch’s consensus validator set then it saves the corresponding accumulator value
If any validator was active in the previous epoch but becomes inactive in the current epoch,
it also saves their current accumulator value
Sets the current epoch in state

Pseudocodeuint64 current_epoch = msg.input.epoch;
for i in snapshot_valset:    if epoch_acc[i][current_epoch] is not empty:        epoch_acc[i][current_epoch].val() = execution_valset[i].acc()    if epoch_acc[i][current_epoch + 1] is not empty:        epoch_acc[i][current_epoch].val() = execution_valset[i].acc()
in_epoch_delay_rounds = false;epoch = current_epoch;
syscallReward​
Function selector​
syscallReward(address) : 0x791bdcf3
Function signature​
function syscallReward(address blockAuthor) external;
Parameters​

blockAuthor — the address of the validator that produced the block.

Behavior​
This syscall is invoked for every block. It rewards the block-producing validator (and their
delegators) with the configured block reward:

If the validator has a nonzero commission, a portion of the reward is allocated to the
validator’s authAddress.
The remaining reward is claimable to the validator’s delegators.

Note that the commission is calculated as a percentage of the total block reward.
Example
Suppose that a validator's personal stake comprises 20% of the total delegation to
their validator.
The commission is set at 10% of total rewards.
Then the validator receives 10% of the total block reward as their commission. The remaining 90%
of the reward is distributed to the stake pool. Since the validator owns 20% of the pool, they
also receive 20% of that remaining amount.
Pseudocodeuint64 val_id = secp_to_val_id[block_author];DelInfo auth_del = delegator[val_id][val_execution[val_id].auth_address()];uint256 _commission = REWARD * val_execution[val_id].commission / 1e18;uint256 _unclaimed_rewards = REWARD - _commission;
// state updateauth_del.rewards() += _commission;val_execution[val_id].unclaimed_rewards += _unclaimed_rewards;val_execution[val_id].acc += _unclaimed_rewards / val_consensus[val_id].stake();
mint(STAKING_CONTRACT_ADDRESS, REWARD);
syscallSnapshot​
Function selector​
syscallSnapshot() : 0x157eeb21
Function signature​
function syscallSnapshot() external;
Parameters​
(none)
Behavior​
This syscall sorts the current execution-layer validator set. It selects the top N staked
validators as the upcoming consensus validator set. The updated set is stored in state. The
previous consensus set is cleared.
Pseudocode
uint64[] filter_top_n_validators = sort(execution_valset);
for i in snapshot_valset:    val_snapshot[i].stake = 0;    val_snapshot[i].commission = 0;
snapshot_valset = consensus_valset;consensus_valset = filter_top_n_validators;
for i in filter_top_n_validators:    val_consensus[i].stake = val_execution[i].stake;    val_consensus[i].commission = val_execution[i].commission;
Events​
The staking precompiles emit standard events that appear in transaction receipts. These events
provide indexed information about validator and delegator actions.
ValidatorRewarded​
event ValidatorRewarded(        uint64 indexed validatorId,        address indexed from,        uint256 amount,        uint64 epoch);
Emitted when block reward is allocated via syscallReward.
ValidatorCreated​
event ValidatorCreated(    uint64  indexed validatorId,    address indexed authAddress,    uint256 commission);
Emitted when a validator is added via addValidator.
ValidatorStatusChanged​
event ValidatorStatusChanged(    uint64  indexed validatorId,    uint64  flags);
Emitted during addValidator, delegate,
undelegate, or compound. if the validator's flags change.
Delegate​
event Delegate(    uint64  indexed validatorId,    address indexed delegator,    uint256 amount,    uint64  activationEpoch);
Emitted when delegation amount is increased, i.e. during addValidator,
delegate, or compound.
Undelegate​
event Undelegate(    uint64  indexed validatorId,    address indexed delegator,    uint8   withdrawId,    uint256 amount,    uint64  activationEpoch);
Emitted when a delegator calls undelegate.
Withdraw​
event Withdraw(    uint64 indexed validatorId,    address indexed delegator,    uint8   withdrawId,    uint256 amount,    uint64  withdrawEpoch);
Emitted when a delegator executes withdraw successfully.
ClaimRewards​
event ClaimRewards(    uint64 indexed validatorId,    address indexed delegator,    uint256 amount,    uint64 epoch);
Emitted when a delegator claims rewards via claimRewards.
CommissionChanged​
event CommissionChanged(    uint64 indexed validatorId,    uint256 oldCommission,    uint256 newCommission);
Emitted when a validator changes commission via changeCommission.
EpochChanged​
    event EpochChanged(        uint64 oldEpoch,        uint64 newEpoch    );
Emitted when epoch changes via syscallOnEpochChange.
Precompile Internals​

Constants
Validator structs
Delegator structs
State variables
Mappings

Constants​
// Minimum stake required from validator's own account// to be eligible to join the valset, in Monad weiuint256 MIN_AUTH_ADDRESS_STAKE;
// Min stake required (including delegation) for validator// to be eligible to join the valset, in Monad wei.// note that ACTIVE_VALIDATOR_STAKE > MIN_AUTH_ADDRESS_STAKEuint256 ACTIVE_VALIDATOR_STAKE;
// Block Rewarduint256 REWARD;
// Accumulator unit multiplier. Chosen to preserve accuracyuint256 ACCUMULATOR_DENOMINATOR = 1e36;
// Staking precompile addressAddress STAKING_CONTRACT_ADDRESS = 0x0000000000000000000000000000000000001000;
// Withdrawal delay, needed to facilitate slashinguint8 WITHDRAWAL_DELAY = 1;
// Controls the maximum number of results returned by individual// calls to valset-getters, get_delegators, and get_delegationsuint64 PAGINATED_RESULTS_SIZE = 100;
Validator structs​
struct ValExecution             // Realtime execution state for one validator{    uint256 stake;              // Upcoming stake pool balance    uint256 acc;                // Current accumulator value for validator    uint256 commission;         // Proportion of block reward charged as commission, times 1e18; 10% = 1e17    bytes   secp_pubkey;        // Secp256k1 public key used by consensus    bytes   bls_pubkey;         // Bls public key used by consensus    uint256 address_flags;      // Flags to represent validators' current state    uint256 unclaimed_rewards;  // Unclaimed rewards    address auth_address;       // Delegator address with authority over validator stake}
struct ValConsensus             // A subset of validator state for the consensus system{    uint256 stake;              // Current active stake    uint256 commission;         // Commission rate for current epoch    bytes   secp_pubkey;        // Secp256k1 public key used by consensus    bytes   bls_pubkey;         // Bls public key used by consensus}
Delegator structs​
struct DelInfo{    uint256 stake;               // Current active stake    uint256 acc;                 // Last checked accumulator    uint256 rewards;             // Last checked rewards    uint256 delta_stake;         // Stake to be activated next epoch    uint256 next_delta_stake;    // Stake to be activated in 2 epochs    uint64 delta_epoch;          // Epoch when delta_stake becomes active    uint64 next_delta_epoch;     // Epoch when next_delta_stake becomes active}
struct WithdrawalRequest{    uint256 amount;              // Amount to undelegate from validator    uint256 acc;                 // Validator accumulator when undelegate was called    uint64 epoch;                // Epoch when undelegate stake deactivates};
struct Accumulator{    uint256 val;               // Current accumulator value    uint256 refcount;            // Reference count for this accumulator value};
State variables​
// Current consensus epochuint64 epoch;
// Flag indicating if currently in epoch delay roundsbool in_epoch_delay_rounds;
// Counter for validator idsuint64 last_val_id;
// Current execution view of validator setStorageArray<uint64> execution_valset;
// Previous consensus view of validator setStorageArray<uint64> snapshot_valset;
// Current consensus view of validator setStorageArray<uint64> consensus_valset;
Mappings​
//These mappings only exist to ensure the SECP/BLS Keys are uniquemapping (secp_eth_address => uint64) secp_to_val_id;mapping (bls_eth_address => uint64) bls_to_val_id;
// Keys(val_id, epoch) => Value(acc)// making note of the validator accumulator at start of epoch.mapping(uint64 => mapping(uint64 => Accumulator)) epoch_acc;
// Key(val_id)// Contains the validator info for the execution view. Changes to stake// or commission are reflected immediately.mapping(uint64 => ValExecution) val_execution;
// Key(val_id)// Contains a subset of the validator info relevant to consensus. Changes to// stake or commission are reflected in the following epoch. This is referenced// by the reward system call *before* the epoch delay rounds.mapping(uint64 => ValConsensus) val_consensus;
// Key(val_id)// Contains a subset of the validator info relevant to consensus. Changes to// stake or commission are reflected in the following epoch. This is referenced// by the reward system call *during* the epoch delay rounds.mapping(uint64 => ValConsensus) val_snapshot;
// Keys(val_id,msg.sender) => DelInfomapping(uint64 => mapping(address => DelInfo)) delegator;
// Keys(val_id,msg.sender,withdrawal_id) => WithdrawalRequestmapping(uint64 => mapping(address => mapping (uint8 => WithdrawalRequest))) withdrawal;
Solidity Staking Interface​
To copy to clipboard, click the button in the top right of the code block.
// SPDX-License-Identifier: MITpragma solidity ^0.8.15;
interface IMonadStaking {    function addValidator(        bytes calldata payload,        bytes calldata signedSecpMessage,        bytes calldata signedBlsMessage    ) external payable returns (uint64 validatorId);
    function delegate(        uint64 validatorId    ) external payable returns (bool success);
    function undelegate(        uint64 validatorId,        uint256 amount,        uint8 withdrawId    ) external returns (bool success);
    function compound(        uint64 validatorId    ) external returns (bool success);
    function withdraw(        uint64 validatorId,        uint8 withdrawId    ) external returns (bool success);
    function claimRewards(        uint64 validatorId    ) external returns (bool success);
    function changeCommission(        uint64 validatorId,        uint256 commission    ) external returns (bool success);
    function externalReward(        uint64 validatorId    ) external returns (bool success);

    function getValidator(        uint64 validatorId    ) external view returns (        address authAddress,        uint64 flags,        uint256 stake,        uint256 accRewardPerToken,        uint256 commission,        uint256 unclaimedRewards,        uint256 consensusStake,        uint256 consensusCommission,        uint256 snapshotStake,        uint256 snapshotCommission,        bytes memory secpPubkey,        bytes memory blsPubkey    );
    function getDelegator(        uint64 validatorId,         address delegator    ) external returns (        uint256 stake,        uint256 accRewardPerToken,        uint256 unclaimedRewards,        uint256 deltaStake,        uint256 nextDeltaStake,        uint64 deltaEpoch,        uint64 nextDeltaEpoch    );
    function getWithdrawalRequest(        uint64 validatorId,        address delegator,        uint8 withdrawId    ) external returns (        uint256 withdrawalAmount,        uint256 accRewardPerToken,        uint64 withdrawEpoch    );
    function getConsensusValidatorSet(        uint32 startIndex    ) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
    function getSnapshotValidatorSet(        uint32 startIndex    ) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
    function getExecutionValidatorSet(        uint32 startIndex    ) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
    function getDelegations(        address delegator,        uint64 startValId    ) external returns (bool isDone, uint64 nextValId, uint64[] memory valIds);
    function getDelegators(        uint64 validatorId,        address startDelegator    ) external returns (bool isDone, address nextDelegator, address[] memory delegators);
    function getEpoch() external returns (uint64 epoch, bool inEpochDelayPeriod);
    function getProposerValId() external returns (uint64 val_id);
    function syscallOnEpochChange(uint64 epoch) external;
    function syscallReward(address blockAuthor) external;
    function syscallSnapshot() external;
     event ValidatorRewarded(        uint64 indexed validatorId,        address indexed from,        uint256 amount,        uint64 epoch    );    event ValidatorCreated(        uint64  indexed validatorId,        address indexed authAddress,        uint256 commission
    );    event ValidatorStatusChanged(        uint64  indexed validatorId,        uint64  flags    );    event Delegate(        uint64  indexed validatorId,        address indexed delegator,        uint256 amount,        uint64  activationEpoch    );    event Undelegate(        uint64  indexed validatorId,        address indexed delegator,        uint8   withdrawId,        uint256 amount,        uint64  activationEpoch    );    event Withdraw(        uint64 indexed validatorId,        address indexed delegator,        uint8   withdrawId,        uint256 amount,        uint64  withdrawEpoch    );    event ClaimRewards(        uint64 indexed validatorId,        address indexed delegator,        uint256 amount,        uint64  epoch    );    event CommissionChanged(        uint64 indexed validatorId,        uint256 oldCommission,        uint256 newCommission    );    event EpochChanged(        uint64 oldEpoch,        uint64 newEpoch    );}
Staking ABI JSON​
To copy to clipboard, click the button in the top right of the code block.
[  {"type":"function","name":"addValidator","inputs":[{"name":"payload","type":"bytes","internalType":"bytes"},{"name":"signedSecpMessage","type":"bytes","internalType":"bytes"},{"name":"signedBlsMessage","type":"bytes","internalType":"bytes"}],"outputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"stateMutability":"payable"},  {"type":"function","name":"changeCommission","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"commission","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"claimRewards","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"compound","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"delegate","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"payable"},  {"type":"function","name":"externalReward","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getConsensusValidatorSet","inputs":[{"name":"startIndex","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextIndex","type":"uint32","internalType":"uint32"},{"name":"valIds","type":"uint64[]","internalType":"uint64[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getDelegations","inputs":[{"name":"delegator","type":"address","internalType":"address"},{"name":"startValId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextValId","type":"uint64","internalType":"uint64"},{"name":"valIds","type":"uint64[]","internalType":"uint64[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getDelegator","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"delegator","type":"address","internalType":"address"}],"outputs":[{"name":"stake","type":"uint256","internalType":"uint256"},{"name":"accRewardPerToken","type":"uint256","internalType":"uint256"},{"name":"unclaimedRewards","type":"uint256","internalType":"uint256"},{"name":"deltaStake","type":"uint256","internalType":"uint256"},{"name":"nextDeltaStake","type":"uint256","internalType":"uint256"},{"name":"deltaEpoch","type":"uint64","internalType":"uint64"},{"name":"nextDeltaEpoch","type":"uint64","internalType":"uint64"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getDelegators","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"startDelegator","type":"address","internalType":"address"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextDelegator","type":"address","internalType":"address"},{"name":"delegators","type":"address[]","internalType":"address[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getEpoch","inputs":[],"outputs":[{"name":"epoch","type":"uint64","internalType":"uint64"},{"name":"inEpochDelayPeriod","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getProposerValId","inputs":[],"outputs":[{"name":"val_id","type":"uint64","internalType": "uint64"}],  "stateMutability":"nonpayable"},   {"type":"function","name":"getExecutionValidatorSet","inputs":[{"name":"startIndex","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextIndex","type":"uint32","internalType":"uint32"},{"name":"valIds","type":"uint64[]","internalType":"uint64[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getSnapshotValidatorSet","inputs":[{"name":"startIndex","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextIndex","type":"uint32","internalType":"uint32"},{"name":"valIds","type":"uint64[]","internalType":"uint64[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getValidator","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"authAddress","type":"address","internalType":"address"},{"name":"flags","type":"uint64","internalType":"uint64"},{"name":"stake","type":"uint256","internalType":"uint256"},{"name":"accRewardPerToken","type":"uint256","internalType":"uint256"},{"name":"commission","type":"uint256","internalType":"uint256"},{"name":"unclaimedRewards","type":"uint256","internalType":"uint256"},{"name":"consensusStake","type":"uint256","internalType":"uint256"},{"name":"consensusCommission","type":"uint256","internalType":"uint256"},{"name":"snapshotStake","type":"uint256","internalType":"uint256"},{"name":"snapshotCommission","type":"uint256","internalType":"uint256"},{"name":"secpPubkey","type":"bytes","internalType":"bytes"},{"name":"blsPubkey","type":"bytes","internalType":"bytes"}],"stateMutability":"view"},  {"type":"function","name":"getWithdrawalRequest","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"delegator","type":"address","internalType":"address"},{"name":"withdrawId","type":"uint8","internalType":"uint8"}],"outputs":[{"name":"withdrawalAmount","type":"uint256","internalType":"uint256"},{"name":"accRewardPerToken","type":"uint256","internalType":"uint256"},{"name":"withdrawEpoch","type":"uint64","internalType":"uint64"}],"stateMutability":"nonpayable"},  {"type":"function","name":"syscallOnEpochChange","inputs":[{"name":"epoch","type":"uint64","internalType":"uint64"}],"outputs":[],"stateMutability":"nonpayable"},  {"type":"function","name":"syscallReward","inputs":[{"name":"blockAuthor","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},  {"type":"function","name":"syscallSnapshot","inputs":[],"outputs":[],"stateMutability":"nonpayable"},  {"type":"function","name":"undelegate","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"amount","type":"uint256","internalType":"uint256"},{"name":"withdrawId","type":"uint8","internalType":"uint8"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"withdraw","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"withdrawId","type":"uint8","internalType":"uint8"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"event","name":"ClaimRewards","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"delegator","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"epoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"CommissionChanged","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"oldCommission","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"newCommission","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},  {"type":"event","name":"Delegate","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"delegator","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"activationEpoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"EpochChanged","inputs":[{"name":"oldEpoch","type":"uint64","indexed":false,"internalType":"uint64"},{"name":"newEpoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"Undelegate","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"delegator","type":"address","indexed":true,"internalType":"address"},{"name":"withdrawId","type":"uint8","indexed":false,"internalType":"uint8"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"activationEpoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"ValidatorCreated","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"authAddress","type":"address","indexed":true,"internalType":"address"},{"name":"commission","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},  {"type":"event","name":"ValidatorRewarded","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"epoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"ValidatorStatusChanged","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"flags","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"Withdraw","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"delegator","type":"address","indexed":true,"internalType":"address"},{"name":"withdrawId","type":"uint8","indexed":false,"internalType":"uint8"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"withdrawEpoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false}]
FAQ​
Is there a removeValidator function?There is no direct removeValidator function. Instead, if a validator’s auth_account removes
enough stake through undelegate, the validator is removed from the consensus set
in a future epoch.This occurs in either epoch n+1 or epoch n+2, depending on whether the undelegate
occurred within the epoch delay rounds.Even when not active, a validator’s information is always retained. Validator ids are permanent since
other delegators may still be delegating and need to reference that val_id to undelegate/withdraw.
How does a validator change their commission?A validator can change their commission by calling changeCommission.
What methods give visibility into the list of validator ids?See the valset getters.
What methods give visibility into a validator's state?See getValidator.
What methods give visibility into a delegator's delegation to one particular validator?See getDelegator.For pending withdrawals by that delegator from that validator, see getWithdrawalRequest.

## Code Examples

```prism
addValidator(bytes,bytes,bytes) : 0xf145204c
```

```prism
function addValidator(    bytes calldata payload,    bytes calldata signedSecpMessage,    bytes calldata signedBlsMessage) external payable returns (uint64 validatorId);
```

```prism
secp_pubkey, bls_pubkey, auth_address, amount, commission = payload
assert amount == msg.value
// increment validator idlast_val_id = last_val_id + 1;
// set uniqueness of keyssecp_to_val_id[secp_eth_address] = last_val_id;bls_to_val_id[bls_eth_address] = last_val_id;
// set validator infoval_execution[last_val_id] = ValExecution{    uint256 stake = msg.value;    uint256 commission = commission;    bytes secp_pubkey = secp_pubkey;    bytes bls_pubkey = bls_pubkey;    uint256 address_flags = set_flags();}
// set authority delegator infodelegator[last_val_id][input.auth_address] = DelInfo{    uint256 delta_stake = set_stake()[0];    uint256 next_delta_stake = set_stake()[1];    uint64 delta_epoch = set_stake()[2];    uint64 next_delta_epoch = set_stake()[3];}
// set delegator accumulatorepoch_acc[last_val_id][getEpoch()] = Accumulator{    uint256 ref_count += 1;}
// set flagsset_flags();
// push validator idif (val_execution[last_val_id].stake() >= ACTIVE_VALIDATOR_STAKE        and last_val_id not in execution_valset):    execution_valset.push(last_val_id);
return last_val_id;
def set_flags():    if msg.value + val_execution[last_val_id].stake() >= ACTIVE_VALIDATOR_STAKE:        return ValidatorFlagsOk;    if msg.value + val_execution[last_val_id].stake() >= MIN_AUTH_ADDRESS_STAKE        return ValidatorFlagsStakeTooLow;
def set_stake():    if in_epoch_delay_rounds:        delta_stake = 0;        next_delta_stake = msg.value;        delta_epoch = 0;        next_delta_epoch = current_epoch + 2;    else:        delta_stake = msg.value;        next_delta_stake = 0;        delta_epoch = current_epoch + 1;        next_delta_epoch = 0;    return [delta_stake, next_delta_stake, delta_epoch, next_delta_epoch];
```

```prism
def generate_add_validator_call_data_and_sign(    secp_pubkey: bytes,    bls_pubkey: bytes,       auth_address: bytes,     amount: int,      commission: int    secp_privkey: bytes    bls_privkey: bytes) -> bytes:    # 1) Encode    payload_parts = [        secp_pubkey,        bls_pubkey,        auth_address,        toBigEndian32(amount),        toBigEndian32(commission),    ]    payload = b"".join(payload_parts)
    # 2) Sign with both keys    secp_sig = SECP256K1_SIGN(blake3(payload), secp_privkey)     bls_sig  = BLS_SIGN(hash_to_curve(payload), bls_privkey)
    # 3) Solidity encode the payload and two signatures    return eth_abi.encode(['bytes', 'bytes', 'bytes'], [payload, secp_sig, bls_sig])
```

```prism
delegate(uint64) : 0x84994fec
```

```prism
function delegate(    uint64 validatorId) external payable returns (bool success);
```

```prism
validator_id = msg.input.val_id;
// set validator informationval_execution[validator_id] =  ValExecution{    uint256 stake += msg.value();}
// set delegator informationDelInfo current_delegator = delegator[validator_id][msg.sender];
// apply get_current_stake() first. This updates the delegator stake// to be inline with the current stake activated in consensus.get_current_stake();
// apply add_stake() second.uint256[4] add_stake_info = add_stake(msg.value());
current_delegator = DelInfo{    uint256 delta_stake = add_stake_info[0];    uint256 next_delta_stake = add_stake_info[1];    uint64 delta_epoch = add_stake_info[2];    uint64 next_delta_epoch = add_stake_info[3];}
// set epoch accumulatorepoch_acc[validator_id][getEpoch()].ref_count += 1;
// set flagsset_flags();
// push validator idif val_execution[validator_id].stake() >= ACTIVE_VALIDATOR_STAKE        and validator_id not in execution_valset:    execution_valset.push(validator_id);
def add_stake(uint256 amount):    uint256 _delta_stake;    uint256 _next_delta_stake;    uint64 _delta_epoch;    uint64 _next_delta_epoch;
    if not in_epoch_delay_rounds:        _delta_stake = current_delegator.delta_stake() + amount;        _next_delta_stake = 0;        _delta_epoch = current_epoch + 1;        _next_delta_epoch = 0;    else:        _delta_stake = 0;        _next_delta_stake = current_delegator.next_delta_stake() + amount;        _delta_epoch = 0;        _next_delta_epoch = current_epoch + 2;    return [_delta_stake, _next_delta_stake, _delta_epoch, _next_delta_epoch];

def maybe_process_next_epoch_state():    """    Helper function to process and update rewards    based on the current epoch state.    """
    if (        epoch_acc[validator_id][current_delegator.delta_epoch()] != 0        and current_epoch > current_delegator.delta_epoch()        and current_delegator.delta_epoch() > 0    ):        // Compute rewards from the last checked epoch.        _rewards += current_delegator.stake() * (            epoch_acc[validator_id][current_delegator.delta_epoch()].val()            - current_delegator.acc()        )
        // Promote stake to active in delegator view.        current_delegator.stake() += current_delegator.delta_stake()        current_delegator.acc() = (            epoch_acc[validator_id][current_delegator.delta_epoch()].val()        )        current_delegator.delta_epoch() = current_delegator.next_delta_epoch()        current_delegator.delta_stake() = current_delegator.next_delta_stake()        current_delegator.next_delta_epoch() = 0        current_delegator.next_delta_stake() = 0
        epoch_acc[validator_id][current_delegator.delta_epoch].ref_count -= 1

def get_current_stake():    uint256 _rewards = 0;
    // Process next epoch rewards and increment stake    maybe_process_next_epoch_state()    // Perform again to capture max two additional epochs    maybe_process_next_epoch_state()
    current_delegator.rewards() += _rewards;    return _rewards;
```

```prism
undelegate(uint64,uint256,uint8) : 0x5cf41514
```

```prism
function undelegate(    uint64 validatorId,    uint256 amount,    uint8 withdrawId) external returns (bool success);
```

```prism
uint64 validator_id = msg.input.val_id;uint256 amount = msg.input.amount;uint8 withdraw_id = msg.input.withdraw_id;
ValExecution current_validator = val_execution[validator_id];
// set validator informationcurrent_validator =  ValExecution{    uint256 stake -= amount;}
// apply get_current_stake() first.get_current_stake();
DelInfo current_delegator = delegator[validator_id][msg.sender];// set delegator informationcurrent_delegator = DelInfo{    uint256 stake -= amount;}
// set withdraw requestwithdrawal[validator_id][msg.sender][withdraw_id] = WithdrawalRequest{    uint256 amount = amount;    uint256 acc = current_validator.acc();    uint64 epoch = getEpoch();});
// set epoch accumulatorepoch_acc[validator_id][getEpoch()].ref_count += 1;
// schedule validator to leave setif current_validator.stake < ACTIVE_VALIDATOR_STAKE and validator_id in execution_valset:    current_validator.set_flag(INSUFFICIENT_STAKE);
if (current_delegator.stake <= MIN_AUTH_ADDRESS_STAKE and validator_id in execution_valset) and msg.sender == current_validator.auth_address:    current_validator.set_flag(INSUFFICIENT_VALIDATOR_STAKE);
```

```prism
withdraw(uint64,uint8) : 0xaed2ee73
```

```prism
function withdraw(    uint64 validatorId,    uint8 withdrawId) external returns (bool success);
```

```prism
uint64 validator_id = msg.input.val_id;uint8 withdraw_id = msg.input.withdraw_id;
WithdrawalRequest current_withdraw = withdrawal[validator_id][msg.sender][withdraw_id];
// Compute any additional rewards and transfer funds to delegatortransfer(msg.sender, current_withdraw.amount + get_withdraw_rewards());
// unset withdraw requestwithdrawal[validator_id][msg.sender][withdraw_id] = WithdrawalRequest{    uint256 amount = 0,    uint256 acc = 0,    uint64 epoch = 0};
def get_withdraw_rewards():    epoch_acc[validator_id][current_withdraw.epoch].ref_count -= 1;    return current_withdraw.amount() * (epoch_acc[validator_id][current_withdraw.epoch()].val() - current_withdraw.acc());
```

```prism
compound(uint64) : 0xb34fea67
```

```prism
function compound(    uint64 validatorId) external returns (bool success);
```

```prism
validator_id = msg.input.val_id;
// set delegator informationDelInfo current_delegator = delegator[validator_id][msg.sender];
// apply get_current_stake() first. This updates the delegator stake// to be inline with the current stake activated in consensus.rewards_compounded = get_current_stake();
// apply add_stake() second.uint256[4] add_stake_info = add_stake(rewards_compounded);
// set delegator informationcurrent_delegator = DelInfo{    uint256 delta_stake = add_stake_info[0];    uint256 next_delta_stake = add_stake_info[1];    uint64 delta_epoch = add_stake_info[2];    uint64 next_delta_epoch = add_stake_info[3];    uint256 rewards = 0;}
// set validator informationval_execution[validator_id] = ValExecution{    uint256 stake += rewards_compounded;}
// set accumulatorepoch_acc[validator_id][getEpoch()] = Accumulator{    uint256 ref_count += 1;}
// set flagsset_flags();
// push validator idif val_execution[validator_id].stake() >= ACTIVE_VALIDATOR_STAKE and validator_id not in execution_valset:    execution_valset.push(validator_id);
```

```prism
claimRewards(uint64) : 0xa76e2ca5
```

```prism
function claimRewards(    uint64 validatorId) external returns (bool success);
```

```prism
// set delegator informationDelInfo current_delegator = delegator[validator_id][msg.sender];
// apply get_current_stake() first.uint256 current_rewards = get_current_stake();
// set delegator informationcurrent_delegator = DelInfo{    uint256 rewards = 0;)
// send rewards to delegatortransfer(msg.sender, current_rewards);
```

```prism
changeCommission(uint64,uint256) : 0x9bdcc3c8
```

```prism
function changeCommission(    uint64 validatorId,    uint256 commission) external returns (bool success);
```

```prism
validator_id = msg.input.val_id;

val_execution[validator_id] = ValExecution{    uint256 commission = msg.input.commission;}
```

```prism
externalReward(uint64) : 0xe4b3303b
```

```prism
function externalReward(    uint64 validatorId) external returns (bool success);
```

```prism
validator_id = msg.input.val_id;
require(msg.value >= 1e18 && msg.value <= 1e24, "Reward out of bounds");require(val_consensus[validator_id] > 0 , "Validator not active");
val_execution[validator_id].unclaimed_reward += msg.value;val_execution[val_id].acc += msg.value / val_consensus[val_id].stake();
```

```prism
getValidator(uint64) : 0x2b6d639a
```

```prism
function getValidator(    uint64 validatorId) external view returns (    address authAddress,    uint64 flags,    uint256 stake,    uint256 accRewardPerToken,    uint256 commission,    uint256 unclaimedRewards,    uint256 consensusStake,    uint256 consensusCommission,    uint256 snapshotStake,    uint256 snapshotCommission,    bytes memory secpPubkey,    bytes memory blsPubkey);
```

```prism
getDelegator(uint64,address) : 0x573c1ce0
```

```prism
function getDelegator(    uint64 validatorId,     address delegator) external returns (    uint256 stake,    uint256 accRewardPerToken,    uint256 unclaimedRewards,    uint256 deltaStake,    uint256 nextDeltaStake,    uint64 deltaEpoch,    uint64 nextDeltaEpoch);
```

```prism
getWithdrawalRequest(uint64,address,uint8) : 0x56fa2045
```

```prism
function getWithdrawalRequest(    uint64 validatorId,    address delegator,    uint8 withdrawId) external returns (    uint256 withdrawalAmount,    uint256 accRewardPerToken,    uint64 withdrawEpoch);
```

```prism
getConsensusValidatorSet(uint32) : 0xfb29b729getSnapshotValidatorSet(uint32) : 0xde66a368getExecutionValidatorSet(uint32) : 0x7cb074df
```

```prism
function getConsensusValidatorSet(    uint32 startIndex) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
function getSnapshotValidatorSet(    uint32 startIndex) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
function getExecutionValidatorSet(    uint32 startIndex) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
```

```prism
getDelegations(address,uint64) : 0x4fd66050
```

```prism
function getDelegations(    address delegator,    uint64 startValId) external returns (bool isDone, uint64 nextValId, uint64[] memory valIds);
```

```prism
getDelegators(uint64,address) : 0xa0843a26
```

```prism
function getDelegators(    uint64 validatorId,    address startDelegator) external returns (bool isDone, address nextDelegator, address[] memory delegators);
```

```prism
getEpoch() : 0x757991a8
```

```prism
function getEpoch() external returns (uint64 epoch, bool inEpochDelayPeriod);
```

```prism
getProposerValId() : 0xfbacb0be
```

```prism
function getProposerValId() external returns (uint64 val_id);
```

```prism
syscallOnEpochChange(uint64) : 0x1d4e9f02
```

```prism
function syscallOnEpochChange(uint64 epoch) external;
```

```prism
uint64 current_epoch = msg.input.epoch;
for i in snapshot_valset:    if epoch_acc[i][current_epoch] is not empty:        epoch_acc[i][current_epoch].val() = execution_valset[i].acc()    if epoch_acc[i][current_epoch + 1] is not empty:        epoch_acc[i][current_epoch].val() = execution_valset[i].acc()
in_epoch_delay_rounds = false;epoch = current_epoch;
```

```prism
syscallReward(address) : 0x791bdcf3
```

```prism
function syscallReward(address blockAuthor) external;
```

```prism
uint64 val_id = secp_to_val_id[block_author];DelInfo auth_del = delegator[val_id][val_execution[val_id].auth_address()];uint256 _commission = REWARD * val_execution[val_id].commission / 1e18;uint256 _unclaimed_rewards = REWARD - _commission;
// state updateauth_del.rewards() += _commission;val_execution[val_id].unclaimed_rewards += _unclaimed_rewards;val_execution[val_id].acc += _unclaimed_rewards / val_consensus[val_id].stake();
mint(STAKING_CONTRACT_ADDRESS, REWARD);
```

```prism
syscallSnapshot() : 0x157eeb21
```

```prism
function syscallSnapshot() external;
```

```prism
uint64[] filter_top_n_validators = sort(execution_valset);
for i in snapshot_valset:    val_snapshot[i].stake = 0;    val_snapshot[i].commission = 0;
snapshot_valset = consensus_valset;consensus_valset = filter_top_n_validators;
for i in filter_top_n_validators:    val_consensus[i].stake = val_execution[i].stake;    val_consensus[i].commission = val_execution[i].commission;
```

```prism
event ValidatorRewarded(        uint64 indexed validatorId,        address indexed from,        uint256 amount,        uint64 epoch);
```

```prism
event ValidatorCreated(    uint64  indexed validatorId,    address indexed authAddress,    uint256 commission);
```

```prism
event ValidatorStatusChanged(    uint64  indexed validatorId,    uint64  flags);
```

```prism
event Delegate(    uint64  indexed validatorId,    address indexed delegator,    uint256 amount,    uint64  activationEpoch);
```

```prism
event Undelegate(    uint64  indexed validatorId,    address indexed delegator,    uint8   withdrawId,    uint256 amount,    uint64  activationEpoch);
```

```prism
event Withdraw(    uint64 indexed validatorId,    address indexed delegator,    uint8   withdrawId,    uint256 amount,    uint64  withdrawEpoch);
```

```prism
event ClaimRewards(    uint64 indexed validatorId,    address indexed delegator,    uint256 amount,    uint64 epoch);
```

```prism
event CommissionChanged(    uint64 indexed validatorId,    uint256 oldCommission,    uint256 newCommission);
```

```prism
event EpochChanged(        uint64 oldEpoch,        uint64 newEpoch    );
```

```prism
// Minimum stake required from validator's own account// to be eligible to join the valset, in Monad weiuint256 MIN_AUTH_ADDRESS_STAKE;
// Min stake required (including delegation) for validator// to be eligible to join the valset, in Monad wei.// note that ACTIVE_VALIDATOR_STAKE > MIN_AUTH_ADDRESS_STAKEuint256 ACTIVE_VALIDATOR_STAKE;
// Block Rewarduint256 REWARD;
// Accumulator unit multiplier. Chosen to preserve accuracyuint256 ACCUMULATOR_DENOMINATOR = 1e36;
// Staking precompile addressAddress STAKING_CONTRACT_ADDRESS = 0x0000000000000000000000000000000000001000;
// Withdrawal delay, needed to facilitate slashinguint8 WITHDRAWAL_DELAY = 1;
// Controls the maximum number of results returned by individual// calls to valset-getters, get_delegators, and get_delegationsuint64 PAGINATED_RESULTS_SIZE = 100;
```

```prism
struct ValExecution             // Realtime execution state for one validator{    uint256 stake;              // Upcoming stake pool balance    uint256 acc;                // Current accumulator value for validator    uint256 commission;         // Proportion of block reward charged as commission, times 1e18; 10% = 1e17    bytes   secp_pubkey;        // Secp256k1 public key used by consensus    bytes   bls_pubkey;         // Bls public key used by consensus    uint256 address_flags;      // Flags to represent validators' current state    uint256 unclaimed_rewards;  // Unclaimed rewards    address auth_address;       // Delegator address with authority over validator stake}
struct ValConsensus             // A subset of validator state for the consensus system{    uint256 stake;              // Current active stake    uint256 commission;         // Commission rate for current epoch    bytes   secp_pubkey;        // Secp256k1 public key used by consensus    bytes   bls_pubkey;         // Bls public key used by consensus}
```

```prism
struct DelInfo{    uint256 stake;               // Current active stake    uint256 acc;                 // Last checked accumulator    uint256 rewards;             // Last checked rewards    uint256 delta_stake;         // Stake to be activated next epoch    uint256 next_delta_stake;    // Stake to be activated in 2 epochs    uint64 delta_epoch;          // Epoch when delta_stake becomes active    uint64 next_delta_epoch;     // Epoch when next_delta_stake becomes active}
struct WithdrawalRequest{    uint256 amount;              // Amount to undelegate from validator    uint256 acc;                 // Validator accumulator when undelegate was called    uint64 epoch;                // Epoch when undelegate stake deactivates};
struct Accumulator{    uint256 val;               // Current accumulator value    uint256 refcount;            // Reference count for this accumulator value};
```

```prism
// Current consensus epochuint64 epoch;
// Flag indicating if currently in epoch delay roundsbool in_epoch_delay_rounds;
// Counter for validator idsuint64 last_val_id;
// Current execution view of validator setStorageArray<uint64> execution_valset;
// Previous consensus view of validator setStorageArray<uint64> snapshot_valset;
// Current consensus view of validator setStorageArray<uint64> consensus_valset;
```

```prism
//These mappings only exist to ensure the SECP/BLS Keys are uniquemapping (secp_eth_address => uint64) secp_to_val_id;mapping (bls_eth_address => uint64) bls_to_val_id;
// Keys(val_id, epoch) => Value(acc)// making note of the validator accumulator at start of epoch.mapping(uint64 => mapping(uint64 => Accumulator)) epoch_acc;
// Key(val_id)// Contains the validator info for the execution view. Changes to stake// or commission are reflected immediately.mapping(uint64 => ValExecution) val_execution;
// Key(val_id)// Contains a subset of the validator info relevant to consensus. Changes to// stake or commission are reflected in the following epoch. This is referenced// by the reward system call *before* the epoch delay rounds.mapping(uint64 => ValConsensus) val_consensus;
// Key(val_id)// Contains a subset of the validator info relevant to consensus. Changes to// stake or commission are reflected in the following epoch. This is referenced// by the reward system call *during* the epoch delay rounds.mapping(uint64 => ValConsensus) val_snapshot;
// Keys(val_id,msg.sender) => DelInfomapping(uint64 => mapping(address => DelInfo)) delegator;
// Keys(val_id,msg.sender,withdrawal_id) => WithdrawalRequestmapping(uint64 => mapping(address => mapping (uint8 => WithdrawalRequest))) withdrawal;
```

```prism
// SPDX-License-Identifier: MITpragma solidity ^0.8.15;
interface IMonadStaking {    function addValidator(        bytes calldata payload,        bytes calldata signedSecpMessage,        bytes calldata signedBlsMessage    ) external payable returns (uint64 validatorId);
    function delegate(        uint64 validatorId    ) external payable returns (bool success);
    function undelegate(        uint64 validatorId,        uint256 amount,        uint8 withdrawId    ) external returns (bool success);
    function compound(        uint64 validatorId    ) external returns (bool success);
    function withdraw(        uint64 validatorId,        uint8 withdrawId    ) external returns (bool success);
    function claimRewards(        uint64 validatorId    ) external returns (bool success);
    function changeCommission(        uint64 validatorId,        uint256 commission    ) external returns (bool success);
    function externalReward(        uint64 validatorId    ) external returns (bool success);

    function getValidator(        uint64 validatorId    ) external view returns (        address authAddress,        uint64 flags,        uint256 stake,        uint256 accRewardPerToken,        uint256 commission,        uint256 unclaimedRewards,        uint256 consensusStake,        uint256 consensusCommission,        uint256 snapshotStake,        uint256 snapshotCommission,        bytes memory secpPubkey,        bytes memory blsPubkey    );
    function getDelegator(        uint64 validatorId,         address delegator    ) external returns (        uint256 stake,        uint256 accRewardPerToken,        uint256 unclaimedRewards,        uint256 deltaStake,        uint256 nextDeltaStake,        uint64 deltaEpoch,        uint64 nextDeltaEpoch    );
    function getWithdrawalRequest(        uint64 validatorId,        address delegator,        uint8 withdrawId    ) external returns (        uint256 withdrawalAmount,        uint256 accRewardPerToken,        uint64 withdrawEpoch    );
    function getConsensusValidatorSet(        uint32 startIndex    ) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
    function getSnapshotValidatorSet(        uint32 startIndex    ) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
    function getExecutionValidatorSet(        uint32 startIndex    ) external returns (bool isDone, uint32 nextIndex, uint64[] memory valIds);
    function getDelegations(        address delegator,        uint64 startValId    ) external returns (bool isDone, uint64 nextValId, uint64[] memory valIds);
    function getDelegators(        uint64 validatorId,        address startDelegator    ) external returns (bool isDone, address nextDelegator, address[] memory delegators);
    function getEpoch() external returns (uint64 epoch, bool inEpochDelayPeriod);
    function getProposerValId() external returns (uint64 val_id);
    function syscallOnEpochChange(uint64 epoch) external;
    function syscallReward(address blockAuthor) external;
    function syscallSnapshot() external;
     event ValidatorRewarded(        uint64 indexed validatorId,        address indexed from,        uint256 amount,        uint64 epoch    );    event ValidatorCreated(        uint64  indexed validatorId,        address indexed authAddress,        uint256 commission
    );    event ValidatorStatusChanged(        uint64  indexed validatorId,        uint64  flags    );    event Delegate(        uint64  indexed validatorId,        address indexed delegator,        uint256 amount,        uint64  activationEpoch    );    event Undelegate(        uint64  indexed validatorId,        address indexed delegator,        uint8   withdrawId,        uint256 amount,        uint64  activationEpoch    );    event Withdraw(        uint64 indexed validatorId,        address indexed delegator,        uint8   withdrawId,        uint256 amount,        uint64  withdrawEpoch    );    event ClaimRewards(        uint64 indexed validatorId,        address indexed delegator,        uint256 amount,        uint64  epoch    );    event CommissionChanged(        uint64 indexed validatorId,        uint256 oldCommission,        uint256 newCommission    );    event EpochChanged(        uint64 oldEpoch,        uint64 newEpoch    );}
```

```prism
[  {"type":"function","name":"addValidator","inputs":[{"name":"payload","type":"bytes","internalType":"bytes"},{"name":"signedSecpMessage","type":"bytes","internalType":"bytes"},{"name":"signedBlsMessage","type":"bytes","internalType":"bytes"}],"outputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"stateMutability":"payable"},  {"type":"function","name":"changeCommission","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"commission","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"claimRewards","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"compound","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"delegate","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"payable"},  {"type":"function","name":"externalReward","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getConsensusValidatorSet","inputs":[{"name":"startIndex","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextIndex","type":"uint32","internalType":"uint32"},{"name":"valIds","type":"uint64[]","internalType":"uint64[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getDelegations","inputs":[{"name":"delegator","type":"address","internalType":"address"},{"name":"startValId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextValId","type":"uint64","internalType":"uint64"},{"name":"valIds","type":"uint64[]","internalType":"uint64[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getDelegator","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"delegator","type":"address","internalType":"address"}],"outputs":[{"name":"stake","type":"uint256","internalType":"uint256"},{"name":"accRewardPerToken","type":"uint256","internalType":"uint256"},{"name":"unclaimedRewards","type":"uint256","internalType":"uint256"},{"name":"deltaStake","type":"uint256","internalType":"uint256"},{"name":"nextDeltaStake","type":"uint256","internalType":"uint256"},{"name":"deltaEpoch","type":"uint64","internalType":"uint64"},{"name":"nextDeltaEpoch","type":"uint64","internalType":"uint64"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getDelegators","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"startDelegator","type":"address","internalType":"address"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextDelegator","type":"address","internalType":"address"},{"name":"delegators","type":"address[]","internalType":"address[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getEpoch","inputs":[],"outputs":[{"name":"epoch","type":"uint64","internalType":"uint64"},{"name":"inEpochDelayPeriod","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getProposerValId","inputs":[],"outputs":[{"name":"val_id","type":"uint64","internalType": "uint64"}],  "stateMutability":"nonpayable"},   {"type":"function","name":"getExecutionValidatorSet","inputs":[{"name":"startIndex","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextIndex","type":"uint32","internalType":"uint32"},{"name":"valIds","type":"uint64[]","internalType":"uint64[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getSnapshotValidatorSet","inputs":[{"name":"startIndex","type":"uint32","internalType":"uint32"}],"outputs":[{"name":"isDone","type":"bool","internalType":"bool"},{"name":"nextIndex","type":"uint32","internalType":"uint32"},{"name":"valIds","type":"uint64[]","internalType":"uint64[]"}],"stateMutability":"nonpayable"},  {"type":"function","name":"getValidator","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"}],"outputs":[{"name":"authAddress","type":"address","internalType":"address"},{"name":"flags","type":"uint64","internalType":"uint64"},{"name":"stake","type":"uint256","internalType":"uint256"},{"name":"accRewardPerToken","type":"uint256","internalType":"uint256"},{"name":"commission","type":"uint256","internalType":"uint256"},{"name":"unclaimedRewards","type":"uint256","internalType":"uint256"},{"name":"consensusStake","type":"uint256","internalType":"uint256"},{"name":"consensusCommission","type":"uint256","internalType":"uint256"},{"name":"snapshotStake","type":"uint256","internalType":"uint256"},{"name":"snapshotCommission","type":"uint256","internalType":"uint256"},{"name":"secpPubkey","type":"bytes","internalType":"bytes"},{"name":"blsPubkey","type":"bytes","internalType":"bytes"}],"stateMutability":"view"},  {"type":"function","name":"getWithdrawalRequest","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"delegator","type":"address","internalType":"address"},{"name":"withdrawId","type":"uint8","internalType":"uint8"}],"outputs":[{"name":"withdrawalAmount","type":"uint256","internalType":"uint256"},{"name":"accRewardPerToken","type":"uint256","internalType":"uint256"},{"name":"withdrawEpoch","type":"uint64","internalType":"uint64"}],"stateMutability":"nonpayable"},  {"type":"function","name":"syscallOnEpochChange","inputs":[{"name":"epoch","type":"uint64","internalType":"uint64"}],"outputs":[],"stateMutability":"nonpayable"},  {"type":"function","name":"syscallReward","inputs":[{"name":"blockAuthor","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},  {"type":"function","name":"syscallSnapshot","inputs":[],"outputs":[],"stateMutability":"nonpayable"},  {"type":"function","name":"undelegate","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"amount","type":"uint256","internalType":"uint256"},{"name":"withdrawId","type":"uint8","internalType":"uint8"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"function","name":"withdraw","inputs":[{"name":"validatorId","type":"uint64","internalType":"uint64"},{"name":"withdrawId","type":"uint8","internalType":"uint8"}],"outputs":[{"name":"success","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},  {"type":"event","name":"ClaimRewards","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"delegator","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"epoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"CommissionChanged","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"oldCommission","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"newCommission","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},  {"type":"event","name":"Delegate","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"delegator","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"activationEpoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"EpochChanged","inputs":[{"name":"oldEpoch","type":"uint64","indexed":false,"internalType":"uint64"},{"name":"newEpoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"Undelegate","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"delegator","type":"address","indexed":true,"internalType":"address"},{"name":"withdrawId","type":"uint8","indexed":false,"internalType":"uint8"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"activationEpoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"ValidatorCreated","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"authAddress","type":"address","indexed":true,"internalType":"address"},{"name":"commission","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},  {"type":"event","name":"ValidatorRewarded","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"epoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"ValidatorStatusChanged","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"flags","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false},  {"type":"event","name":"Withdraw","inputs":[{"name":"validatorId","type":"uint64","indexed":true,"internalType":"uint64"},{"name":"delegator","type":"address","indexed":true,"internalType":"address"},{"name":"withdrawId","type":"uint8","indexed":false,"internalType":"uint8"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"withdrawEpoch","type":"uint64","indexed":false,"internalType":"uint64"}],"anonymous":false}]
```

