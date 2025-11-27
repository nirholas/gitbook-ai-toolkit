# Staking

> Source: https://docs.monad.xyz/developer-essentials/staking/

## Documentation

Monad uses staking to determine the voting weights and leader schedule in
MonadBFT. Validators must stake at least a minimum amount,
plus others can delegate to them.
When a block is produced, the leader who produced that block earns a block reward, which is
distributed to each delegator of that leader, pro rata to their portion of that leader's stake,
minus a commission.
Check out the topics below:


Staking Behavior describes how the staking system works. Users should
refer to this page to understand the relevant parameters and time periods.


Staking Precompile describes the interface of the staking precompile.
Developers building functionality that interacts with the trading system should review the
Staking Behavior, then go here.

