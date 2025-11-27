# Staking Behavior

> Source: https://docs.monad.xyz/developer-essentials/staking/staking-behavior

## Documentation

On this page

Overview​
Monad uses staking to determine validator voting weights and each epoch’s leader schedule.
When a block is produced, the leader who produced that block earns a block reward, which is
distributed to each delegator of that leader, pro rata to their portion of that leader's stake,
minus a commission.  Validators must stake at least a minimum amount and others can delegate to them.
FeatureDetailsIn-protocol delegationSupportedValidator commissionEach validator sets a fixed percentage of the block reward to keep for themselves before sharing the rest of the reward prorata by stake.You should choose a validator that you trust whose commission you're happy with.The min commission is 0%, the max commission is 100%.Source of rewardsSuccessful proposal of a block by a leader earns a reward from two components: (1) a fixed reward derived from inflation (REWARD), and (2) the priority fees from all the transactions in the block.Inflationary rewardThe fixed reward (REWARD) is shared among all delegators of that validator after deducting the validator commission.As a delegator, your proportion of the remainder is your proportion of the total stake on that validator.For example: if you have delegated to a validator and comprise 20% of that validator's total stake, the reward for that block is 10 MON, and the commission is 10%, then you would receive 10 MON * 90% * 20% = 1.8 MON.Priority feesCurrently, priority fees only go to the validator. Validators may choose to donate their priority fees back to the delegators (including themselves) by using the externalReward method on the staking precompile.Reward claiming / compoundingEach delegation accumulates rewards. You can choose either to claim or compound any accumulated rewards.Claimed rewards get withdrawn to your account, while compounded rewards are added to your delegation.Active validator setValidators must have self-delegated a minimum amount (MIN_AUTH_ADDRESS_STAKE)must have a total delegation of at least a certain amount (ACTIVE_VALIDATOR_STAKE), andmust be in the top NUM_ACTIVE_VALIDATORS validators by stake weight in order to be part of the active validator set.
Epochs, Boundaries, and Timing​
An epoch uses one set of delegations and leader validators for the entire epoch. While anyone may initiate staking operations like adding validators, or delegation and undelegation of stakes at any time, these actions only take effect at the start of a new epoch.
Every 50,000 blocks (the BOUNDARY_BLOCK_PERIOD) is a boundary block that commits the upcoming staking changes and the associated validator set to be used in the next epoch. Boundary blocks happen approximately every 5.5 hours. The next epoch does not start immediately at the boundary block, but after a 5,000 round delay (the EPOCH_DELAY_ROUNDS) between the boundary block and the end of the current epoch to allow for nodes to all have updated epoch information.

noteA round is not a block. A round increments regardless of missed block proposals. This means that the start of an epoch can be fewer than 5,000 blocks after the boundary. The actual start and end of an epoch cannot be calculated with a modulo operation on block or round number, and you should use getEpoch() to find the current epoch.
Timing examples​
Most staking actions take effect after they are included into a boundary block and then the next epoch starts. However, you can immediately collect rewards as they are earned. (Three publicly callable staking methods take immediate effect: claimRewards(), externalReward(), and changeCommission())
As an example of timing, we’ll look at delegate() in a transaction. Suppose we are currently in epoch #4:

If the delegate() takes place in epoch #4 before the boundary block for epoch #5, then the stake will be included in epoch #5.
If the delegate() transaction is made in the boundary block, then it will not be included in epoch #5, since the snapshot is taken at the start of the block and user transactions during the block take place after the snapshot. However, the delegation will be picked up in the boundary block for epoch #6, and then included in epoch #6.
If the delegate() transaction is after the boundary block and before the end of epoch #4, then the delegation will take effect in #6 since it missed being included in #5.

getEpoch() returns the current epoch and a boolean marking if the boundary snapshot for the next epoch has already happened. So if you call getEpoch(), and it returns (1000, false), then changes will go into the next epoch (1001). If it returns (1000, true), then the boundary has passed, and changes made now will be live two epochs in the future (1002).
Consensus, Snapshot and Execution Views​
The Monad execution component is responsible for the record of validator set and staking delegation. All staking-related state changes are queued and applied deterministically during execution. Monad’s consensus layer then uses these changes during a future epoch.
When validators are added, users make delegation changes, or any other staking transactions happen they immediately update the execution view of the staking system.
At the start of the boundary block, the current execution view is copied into the snapshot view. Any transaction changes after this point will not affect the following epoch. The snapshot now matches what the next epoch will look like.
After the EPOCH_DELAY_ROUNDS of 5,000 rounds from the boundary block, the new epoch starts and the snapshot view is copied into the consensus view. The consensus view always holds the validators and voting stake weights that are being used by the Monad consensus system for this block and the remainder of the epoch.
Slashing​
Robust logging provides accountability for malicious, slashable offenses. However, in-protocol, automated slashing is not currently implemented.
Constants​
ConstantMeaningValueBOUNDARY_BLOCK_PERIODblocks from boundary block to boundary block50,000 blocksEPOCH_DELAY_ROUNDSrounds between the boundary block and the start of each epoch5,000 roundsWITHDRAWAL_DELAYnumber of epochs before unstaked tokens can be withdrawn1 epochMIN_AUTH_ADDRESS_STAKEmin amount of MON self-delegated by a validator for it to be eligible for the active set100,000 MONACTIVE_VALIDATOR_STAKEmin amount of MON staked with a validator for it to be eligible for the active set10,000,000 MONACTIVE_VALSET_SIZEnumber of validators in the active set200REWARDMON reward per block25 MON
The BOUNDARY_BLOCK_PERIOD is denominated in blocks, while EPOCH_DELAY_ROUNDS is denominated in rounds. If perfect consensus is achieved, these will increment at the same rate. However, upon a failed block proposal (e.g. timeout), the round will increment while the block will not.

