# Gas Pricing

> Source: https://docs.monad.xyz/developer-essentials/gas-pricing

## Documentation

On this page

Summary​
Monad, like Ethereum, charges for processing transactions based on the complexity of the
transaction. Complexity is measured in units of gas.
This page summarizes how gas is charged, i.e. the conversion between the gas of a transaction
and the amount of MON that a user will have to pay.
A separate page, Opcode Pricing, describes how much
each opcode costs in units of gas.
FeatureDetailGas chargedThe gas charged for a transaction is the gas limit. DiscussionPrice per gasEIP-1559-compatible, i.e. price paid per unit of gas is the sum of a system-controlled base fee and a user-specified priority fee. DiscussionBase feeBase fee (aka base_price_per_gas) follows a dynamic controller, similar to the EIP-1559 controller but with slower increases and faster decreases. DetailsMinimum base fee100 MON-gwei (100 * 10^-9 MON)Block gas limit200M gasTransaction gas limit30M gasOpcode pricingSee Opcode PricingTransaction orderingDefault Monad client behavior is to order transactions according to a Priority Gas Auction (descending total gas price).
noteThese changes are covered formally in the
Monad Initial Spec Proposal
Gas definitions​
A common point of confusion among users is the distinction between gas of a transaction (units
of work) and the gas price of a transaction (price in native tokens per unit of work).
FeatureDefinitionGasA unit of work. Gas measures the amount of work the network has to do to process something. Since the network has multiple kinds of resources (network bandwidth, CPU, SSD bandwidth, and state growth), gas is inherently a projection from many dimensions into a single one.Gas price (price_per_gas)The price (in native tokens) paid to process one unit of gas.Gas limitThe maximum number of units of gas that a transaction is allowed to consume.
Gas limit, not gas used​
In Monad, the gas charged for a transaction is the gas limit set in the transaction, rather than
the gas used in the course of execution.
This is a design decision to support asynchronous execution. Under asynchronous execution,
leaders build blocks (and validators vote on block validity) prior to executing.
If the protocol charged gas_used, a user could submit a transaction with a large gas_limit
that actually consumes very little gas. This transaction would take up a lot of space toward the
block gas limit but wouldn't pay very much for taking up that space, opening up a DOS vector.
gas_paid = gas_limit * price_per_gas
EIP-1559 Compatibility​
Monad supports EIP-1559.
EIP-1559 (type 2) transactions have the parameters  priority_price_per_gas and
max_price_per_gas, which, together with base_price_per_gas (a system parameter that changes
each block), determine the gas bid for the transaction:
price_per_gas = min(base_price_per_gas + priority_price_per_gas, max_price_per_gas)
Notes:

base_price_per_gas is a system parameter that changes each block. Every transaction in the
same block will have the same base_price_per_gas
Users specify priority_price_per_gas and max_price_per_gas when signing a transaction
Since everyone in the same block will pay the same base_price_per_gas, the
priority_price_per_gas is a way for users to pay more to prioritize their transactions.
Since users don't determine base_price_per_gas, the max_price_per_gas is a safeguard that
limits the amount they may end up paying. Of course, if that value is set too low, the
transaction will not end up being chosen for inclusion.

This article provides another good explanation
of EIP-1559 gas pricing.
base_price_per_gas controller​
Monad uses a different controller for base_price_per_gas than Ethereum:
block_gask=∑tx∈blockkgas_limittxbase_price_per_gask+1=max⁡{min_base_price_per_gas,base_price_per_gask⋅exp⁡(ηk⋅block_gask−targetblock_gas_limit−target)}ηk=max_step_size⋅ϵϵ+momentk−trendk2trendk+1=β⋅trendk+(1−β)⋅(target−block_gask)momentk+1=β⋅momentk+(1−β)⋅(target−block_gask)2\begin{align*}
\mathrm{block\_gas}_{k} &= \sum\limits_{\mathrm{tx} \in \mathrm{block}_k}\mathrm{gas\_limit}_\mathrm{tx}\\
\mathrm{base\_price\_per\_gas}_{k+1} &= \max\left\{\text{min\_base\_price\_per\_gas}, \mathrm{base\_price\_per\_gas}_k \cdot \exp \left(
\eta_k \cdot \frac{\mathrm{block\_gas}_{k} - \text{target}}{\text{block\_gas\_limit} - \text{target}}
\right) \right\} \\
\eta_k &= \frac{\text{max\_step\_size}\cdot\epsilon}{\epsilon+\sqrt{\mathrm{moment}_k - \mathrm{trend}_k^2}} \\
\mathrm{trend}_{k+1} &= \beta\cdot \mathrm{trend}_k + (1-\beta)\cdot \left(\text{target}-\mathrm{block\_gas}_{k} \right) \\
\mathrm{moment}_{k+1} &= \beta\cdot \mathrm{moment}_k + (1-\beta)\cdot \left(\text{target}-\mathrm{block\_gas}_{k} \right)^2
\end{align*}block_gask​base_price_per_gask+1​ηk​trendk+1​momentk+1​​=tx∈blockk​∑​gas_limittx​=max{min_base_price_per_gas,base_price_per_gask​⋅exp(ηk​⋅block_gas_limit−targetblock_gask​−target​)}=ϵ+momentk​−trendk2​​max_step_size⋅ϵ​=β⋅trendk​+(1−β)⋅(target−block_gask​)=β⋅momentk​+(1−β)⋅(target−block_gask​)2​
This inductive formula starts with
base_price_per_gas0=0moment0=0trend0=0\begin{align*}
\mathrm{base\_price\_per\_gas}_{0} &= 0 \\
\mathrm{moment}_{0} &= 0 \\
\mathrm{trend}_{0} &= 0
\end{align*}base_price_per_gas0​moment0​trend0​​=0=0=0​
and with the following parameters:
max_step_size=1/28target=160M (80% full) β=0.96ϵ=target=160M\begin{align*}
\mathrm{max\_step\_size} &= 1/28 \\
\mathrm{target} &= 160\text{M}\ \text{(80\% full)}\ \\
\beta &= 0.96 \\
\epsilon &= \mathrm{target} = 160\text{M}
\end{align*}max_step_sizetargetβϵ​=1/28=160M (80% full) =0.96=target=160M​
And
min_base_price_per_gas=100 MON-gwei (100×10−9 MON)\text{min\_base\_price\_per\_gas} = 100\ \text{MON-gwei}\ (100 \times 10^{-9}\ \text{MON})min_base_price_per_gas=100 MON-gwei (100×10−9 MON)
Compared to the base_price_per_gas controller in Ethereum, this controller increases more
slowly and decreases more quickly. This is to avoid underutilization of blockspace due to an overpriced base_price_per_gas.
For a more comprehensive discussion of Monad controller design considerations and behavior, check out this blog post from Category Labs.
Recommendations for developers​
Set the gas limit explicitly if it is constant​
Many on-chain actions have a fixed gas cost. The simplest example is that a transfer of native
tokens always costs 21,000 gas, but there are many others.
For actions where the gas cost of the transaction is known ahead of time, it is recommended to set
it directly prior to handing the transaction off to the wallet. This offers several benefits:

It reduces latency and gives users a better experience, since the wallet doesn't have to call
eth_estimateGas and wait for the RPC to respond.
It retains greater control over the user experience, avoiding cases where the wallet sets a high
gas limit in a corner case as described in the warning below.

warningSome wallets, including MetaMask, are known to have the following behavior: when
eth_estimateGas is called and the contract call reverts, they set the gas limit for this
transaction to a very high value.This is the wallet's way of giving up on setting the gas limit and accepting whatever gas usage is
at execution time. However, it doesn't make sense on Monad where the full gas limit is charged.Contract call reversion happens whenever the user is trying to do something impossible. For
example, a user might be trying to mint an NFT that has minted out.If the gas limit is known ahead of time, setting it explicitly is best practice, since it ensures
the wallet won't handle this case unexpectedly.

## Code Examples

```prism
gas_paid = gas_limit * price_per_gas
```

```prism
price_per_gas = min(base_price_per_gas + priority_price_per_gas, max_price_per_gas)
```

