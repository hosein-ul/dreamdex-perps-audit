Somnia Markets

# Raw smart-contract integration

Integrate Somnia Markets straight against the contracts, from any language: pools, orders, events, settlement and the sharp edges.

Somnia Markets runs three market families on one on-chain order-book engine:
spot pairs (`SpotPool`), binary markets (`BinaryPool`), and
perps (`PerpPool`). All three extend the same shared
`OrderBook` core, so the placement surface, the order-lifecycle events, and
the book-materialization technique are identical across every book; what
differs per family is discovery, funding/escrow, and settlement.

This guide is how to trade with nothing but an RPC node and the contract ABIs
— any language, any stack. It covers the shared core first, then each family
in turn, then materializing a live local order
book from the event stream. Pair it
with Market Making if you are building a quoting
system. (Building a JS/TypeScript app instead? The
SDK wraps everything here.)

What you need to start: contract addresses and signatures. Protocol contracts
(the `BinaryMarketsModule` market registry, the `MarketsCore` control plane,
the `OutcomeToken6909` singleton) are listed live per network on this
explorer's System page; spot pairs and live binary markets are
listed on the markets page; per-market binary addresses are read from
the module's registry on-chain (below). The
complete Solidity interfaces —
everything needed to generate ABIs — are in the
interface reference at the end of this guide.
The RPC and indexer endpoints of each network, and the Hideki testnet
deployment, are in Networks.

## Networks

Somnia Markets runs on three public networks. Each RPC serves HTTP and
WebSocket requests, and each network has its own indexer.

Network
Chain id
HTTP RPC
WebSocket RPC
Indexer GraphQL

Somnia mainnet
`5031`
`https://api.infra.mainnet.somnia.network`
`wss://api.infra.mainnet.somnia.network/ws`
`https://prd.smk.somnia.host/v1/graphql`

Shannon testnet
`50312`
`https://api.infra.testnet.somnia.network`
`wss://api.infra.testnet.somnia.network/ws`
`https://dev.smk.somnia.host/v1/graphql`

Hideki testnet
`50383`
`https://api.hideki2.infra.testnet.somnia.network`
`wss://api.hideki2.infra.testnet.somnia.network/ws`
`https://hideki-dev.smk.somnia.host/v1/graphql`

These RPCs reject an `eth_getLogs` request whose `toBlock` is more than 1,000
blocks after its `fromBlock` (`block range exceeds 1000`). Page a log
backfill in windows of at most 1,001 blocks.

### Hideki testnet

Hideki runs spot, perp and binary markets. The chain was rebuilt on
2026-09-17 with the same chain id. An address from an older Hideki record
belongs to the retired chain: on the current chain it can be empty or hold an
unrelated contract. Use the addresses below.

Contract
Address

`PerpPoolFactory`
`0xE631fAEE547baeE07353E290f0562ea67d856560`

`MarginBank`
`0x478769E1177C0773c43A593DCCc4Ad15F15F1394`

`OperatorPermissionsRegistry`
`0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3a`

`SpotPoolRegistry`
`0xaC1d9439a6777Bf80D4302Aa08dF1bFc3334Ce9A`

`BinaryMarketsModule`
`0x3ecC694Cef705358864a646142ac17A90E29e388`

`MarketsCore`
`0x2802504314685D89bF6C992CA5a8e7cC78bc0294`

`OutcomeToken6909`
`0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9`

USDso (18 decimals), the perp collateral and the spot quote token
`0xed7993A74dAe1e6656B704A424DcD8711aAf4F72`

tUSDC (6 decimals), the binary collateral
`0x9E9492cC533E8696A3b6afC7df730800DF75148f`

Perp markets. Each one settles in USDso through the `MarginBank` above.
`PerpPoolFactory.getPerpPools()` returns the same list.

Base
`PerpPool`

BTC
`0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0`

ETH
`0xD6Cb1DD58580B84D76068aC21594219ce03aeddf`

SOL
`0xB483ec1fb34996638677c20ab087b16F1896FA53`

HYPE
`0x63B47eD4A7DE0FdE659b0d82441dD74828b7297A`

XRP
`0x7058579F3248559963f79AdB937c6De9f953E060`

DOGE
`0xC410012e39765Cd5f772e84BAcB19554AEC040Df`

BNB
`0x3D2A99fE1e2BdEaA25024515A2D2202DAF9531aD`

ADA
`0x34fa62909f77699a7a6278D992F72Ff31c7a619D`

SUI
`0x1Be21287cfB865a7c462Ff3c4f275E70BcccefE4`

LINK
`0xf71b619450baFe953F47b9b556416A3A67b443b5`

AVAX
`0xde9762B6b441133D1314C68864ae4e63A6eE45C7`

XLM
`0x74b05B9B8c8F180b53b7891018F3B254B3E658C9`

NEAR
`0x1cD15ae8bFf0FE0a7F49233BE8b90734775bA454`

WLD
`0x0F464d57c1FD839E4d87A408BBcCDAb8f77E6394`

TAO
`0xD9b6A347A3Ae9FD6BA21179D3343F2c8A922F697`

Spot pairs. Each one quotes in USDso and is registered in the
`SpotPoolRegistry`.

Pair
`SpotPool`
Base token

STT / USDso
`0xbE6c45bF96E1B4e5Ec4655BdaE0F23C0410DB35d`
native STT, reported as `0x28f34DeFd2b4CB48d9eE6d89f2Be4Bc601694c00`

WBTC / USDso
`0xD61bb202984E4c02DD6dbF51489A7ec6144e7AA0`
`0xE97673c634EF069Ecc0d95425Cc8e62F99D27E0E` (8 decimals)

WETH / USDso
`0xFd87D984Bcdd276C3C411C2590acB6a7fF8aB4fF`
`0x56115cB05652Ac6117Caa1152B630986a51d36b5` (18 decimals)

HBTT / USDso
`0x33a6ec4A0350dcDc6d91C7E475443779bC3f81A9`
`0x0528dD3beEf917DB06A5249C9Ea84b9D702B3A84` (18 decimals)

Tick, lot and minimum quantity differ by market. Read them from each pool
(`getOrderBookParameters()` on a perp pool, `getPoolParams()` on a spot
pool), and read the margin settings of a perp market with
`getPerpPoolParameters()`. On 2026-10-02 every market above charged zero maker
and taker fees.

On 2026-10-02, `isPriceable()` on the Hideki perp markets switched between
`true` and `false` from one call to the next, a few seconds apart. At a block
where it is `false`, an order that increases a position reverts
`AllSourcesUnavailable` (`0xc95fe237`). The same order succeeds at a block
where it is `true`. Check `isPriceable()` before each quote.

Funding a Hideki account. USDso on Hideki is the bridged form of Shannon
USDso, and it cannot be minted directly (`mint` reverts). Send it from
Shannon over the Hyperlane bridge, to any recipient address. Bridge STT for
gas the same way.

Token
Shannon router
Hideki router
Sending from Shannon

USDso
`0x94E2E7f4B2B0a8E3032c7D3ff3c86790BB5979E6`
`0xed7993A74dAe1e6656B704A424DcD8711aAf4F72` (the token)
Approve the Shannon router for Shannon USDso (`0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171`), then call `transferRemote` with no value.

STT
`0x67CD0778A719099DAF2D346aD0Db0d9E6FF6674C`
`0xB04373932bc05347757da6b8a226d7657584aB35`
Call `transferRemote` with `msg.value` equal to the amount.

Call `transferRemote(uint32 destination, bytes32 recipient, uint256 amount)`
with destination `50383` and the recipient address left-padded to 32 bytes.
`quoteGasPayment(50383)` returns `0` on both Shannon routers, so the call pays
no bridge fee. Delivery is asynchronous. The
Bridge guide covers delivery times,
the reverse direction, and the WBTC, WETH and HBTT routes. Shannon USDso can be
minted by anyone with `mint(address to, uint256 amount)`. Hideki tUSDC has
`faucet(uint256 amount)`, capped at 10,000 tUSDC per call.

## The shared order-book core

Binary books take orders through `placeBinaryOrder` instead (see
the order kind). Spot and perp books
expose the same placement entrypoint, covering all order types (GTC /
`NormalOrder`, `FillOrKill`, `ImmediateOrCancel`, `PostOnly`):

```
function placeOrder(
    bool isBid, uint64 userData, uint256 price, uint256 quantity,
    uint64 expireTimestampNs, OrderType orderType,
    SelfMatchingOption selfMatchingOption,
    address builder, uint96 builderFeeBpsTimes1k
) external payable returns (bool success, OrderId id);

```
Copy

- `expireTimestampNs` is mandatory and nanoseconds — a future unix-ns
timestamp (`now_seconds * 1e9 + lifetime_ns`); zero or past values are
rejected. There is no "no expiry" sentinel.

- A rejected order reverts. A single-order placement does not return
`success == false`; it reverts with a typed error. A `PostOnly` that would
cross reverts `PostOnlyWouldCross`. A `FillOrKill` that cannot fill in full
reverts `FillOrKillNotFillable`. An IOC that fills nothing reverts
`ImmediateOrCancelNoFill`. A self-match under `CancelTaker` reverts
`SelfMatchCancelTaker`. An expiry in the past reverts `OrderAlreadyExpired`.
Decode the revert data to choose a recovery. The batch calls handle a
rejection differently (see Batch writes).

- Quantize in integers. `getOrderBookParameters()` returns `tickSize`,
`lotSize`, and `minQuantity` in raw token units; off-grid values revert
`InvalidPrice` / `InvalidQuantity`.

- `builder` / `builderFeeBpsTimes1k` attribute the order to a
routing/builder frontend and pay it a per-order fee (basis-points × 1000).
Pass `(address(0), 0)` for none. A non-zero fee requires the order owner to
have opted the builder in first — `approveBuilder(builder, maxFeeBpsTimes1k)` on the pool (0 revokes) — and is capped by the pool's
`getMaxBuilderFeeBpsTimes1k()`; charges emit `BuilderFeeCharged`. Spot, binary
and perp pools all accept builder values; an unapproved non-zero fee reverts
`BuilderNotApproved` (spot), `BuilderFeeExceedsCap` (binary) or
`BuilderFeeExceedsApproval` (perp).

- `cancelOrder(id)` / `reduceOrder(id, newQty)` manage resting orders; both
revert (rather than no-op) on already-terminal orders — check your local
book or `getOrder(id)` first. `cancelExpiredOrders(ids)` and
`sweepExpiredAtLevel(isBid, price, maxCount)` are permissionless cleanup — the
SDK's `client.listSweepableOrders({ pool?, marketType? })` is the work-list for
both, returning `orderId` / `isBid` / `price` per row. Note it is not
`status: "Expired"`: that status means the order was already swept, whereas a
keeper wants orders still `Open` whose expiry has passed.

- `OrderId`s are unique per pool — always key by `(pool, orderId)`.

Reading any book on demand, via `eth_call`:

View
Returns

`getBookLevels(isBid, numLevels)`
Aggregated `(price, quantity)` levels, best first

`getAllOpenOrdersOffChain(isBid, maxCount, startCursor)`
Full `Order` structs, paginated (`msg.sender` must be `address(0)` — the `eth_call` default)

`getOrder(orderId)` / `getOwnOpenOrders()`
Single order / caller's open ids

Polling these is fine for a dashboard; a trading system should take one
snapshot and apply event deltas — see
materialization.

### Batch writes

A quoting loop often changes several orders at once. Spot and perp pools
accept these changes in one transaction. Binary pools reject `placeOrders`
and `amendOrders` with `UseBinaryPlacement`.

- `placeOrders(requests)` places each request in array order and returns
`(successes, ids)`, aligned with `requests`. A request that the book
rejects when it lands (a PostOnly that would cross, a FillOrKill or IOC
that cannot fill, a self-match under `CancelTaker`, or an expiry in the
past) does not revert the call: its flag is `false`, its id is `0`, and the
other requests still apply. Any other failure reverts the whole batch, for
example an off-grid price (`InvalidPrice`) or a request that the owner
cannot fund.

- `cancelOrders(orderIds)` returns one flag per id. It returns `false` for an
order that is no longer live, where `cancelOrder` reverts.

- `reduceOrders(requests)` applies one `(orderId, newQuantityRemaining)`
reduction per request.

- `amendOrder(request)` re-quotes the resting order `oldOrderId` with the
terms in `newOrder`, in one transaction. Use the id that it returns: it can
be different from `oldOrderId`. A failed amendment reverts with an error
that names the reason, for example `PostOnlyWouldCross` or
`AmendOldOrderGone`.

- `amendOrders(requests)` amends several orders in one transaction. Deployed
pools do not all report a failed request in the same way. Some pools revert
the whole batch: `AmendReplacementRejected(requestIndex, reason)` for a
rejected replacement, or `AmendOldOrderGone` for an old order that is no
longer live. Other pools return id `0` for that request and apply the other
requests. Handle both results: catch the revert, and check every returned
id. On every pool, a failure that is not a rejection, for example an
off-grid price, reverts the whole batch.

- An empty array reverts `EmptyBatch`.

- The batch calls are not `payable`. A native-token amount that a batch order
needs must already be in your vault balance on that pool (`depositNative`).

### Operator keys

A market maker often holds funds in one key and signs orders with a second
key. Spot and perp pools support this split through an operator registry.
Binary pools do not (see Market Making).

- Read the registry address from the pool with
`getOperatorPermissionsRegistry()`.

- From the owner key, give the operator key the function selectors that it
can call. `setOperatorApprovalForPool(pool, operator, selectors, true)`
covers one pool. `setOperatorApprovalGlobal(operator, selectors, true)`
covers every official pool. `setOperatorDenialForPool` removes one pool
from a global grant.

- From the operator key, call the `…For` entry points with the owner's
address: `placeOrderFor(owner, …)`, `cancelOrderFor(owner, orderId)` and
`reduceOrderFor(owner, orderId, newQuantityRemaining)`. The selector to
grant is the selector of that function: `0x80054449` for `placeOrderFor`,
`0xe37b444b` for `cancelOrderFor`, `0x364c2587` for `reduceOrderFor`.

The batch and amend operator entry points use the same grants.
`placeOrdersFor` needs the `placeOrderFor` grant, `cancelOrdersFor` needs the
`cancelOrderFor` grant, and `reduceOrdersFor` needs the `reduceOrderFor`
grant. `amendOrderFor` and `amendOrdersFor` need both the `placeOrderFor`
and the `cancelOrderFor` grants.

The order belongs to the owner, so its funds and its proceeds are the
owner's. A call without a grant reverts `OnlyApprovedContracts`. Read a grant
from the pool with `isOperatorAuthorized(owner, operator, selector)`.

Two rules need care:

- A global grant is broad. On the testnets it also covers every perp pool, so
a global `placeOrderFor` grant lets the operator open leveraged positions
for the owner. Grant per pool to keep an operator on one market.

- On a perp pool, an order that the operator sends does not top up margin
from the owner's wallet. Keep the owner's MarginBank balance funded (see
Perps).

## Spot markets

Each trading pair is its own `SpotPool` — live pairs are listed on the
markets page. `getPoolParams()` returns everything static in one call:
`(baseToken, quoteToken, makerFeeBpsTimes1k, takerFeeBpsTimes1k, tickSize, minQuantity, lotSize)`. A native-token side is reported as a sentinel token
address (not `address(0)`) — resolve it from `getPoolParams` rather than
assuming.

Spot semantics are the conventional ones: `isBid = true` buys base with
quote, a fill is a base ↔ quote swap at the maker's resting price, and
`userData` is a free 64-bit tag echoed back on the order struct and its
`OrderPlaced` event. Use it for strategy/generation ids.

Funding. By default the pool auto-pulls the required input from your
wallet at placement (ERC-20 `transferFrom` after a one-time approval, or
`msg.value` on native pools) and auto-delivers proceeds back on fill,
cancel, or expiry. Size the pull with `getAutoPullRequirement(owner, isBid, price, quantity, builderFeeBpsTimes1k)`. High-churn integrations should opt
out with `setManualVaultMode(true)`: `deposit` once, quote against the vault
balance with no per-order token transfers, `withdraw` when rebalancing —
for a loop that places and cancels constantly the gas savings compound.

Mark price. Spot pools push `MarkPriceUpdated(asset, markPrice, rawMidpoint)` whenever the book midpoint advances — an EMA-smoothed midpoint
plus the raw `(bestBid + bestAsk) / 2`, an on-chain fair-price feed with no
extra infrastructure.

## Binary markets

### Discover markets

`BinaryMarketsModule` is the market registry (the `MarketsCore` control plane
holds only operators, venues, and module bindings — no markets). Each market
is a `MarketRecord` (read via `module.markets(marketId)`):

Field
Use

`pool`
The `BinaryPool` — the order book you trade on

`market`
The `BinaryMarket` — lifecycle + resolution state

`collateral`
The ERC-20 quoted against (one per market)

`originOperatorId` / `originVenueId`
Origin attribution: the uint32 operator id + opaque bytes32 venue id the market was created under

`yesId` / `noId`
ERC-6909 ids of the outcome positions on the shared `OutcomeToken6909` singleton

`tradingStart` / `expiry`
Trading window (unix seconds)

Watch the module's `MarketCreated` event to discover new markets — every
market fires it, whether created directly via `createMarket` or rolled by a
venue's `MarketCreator` (venues run rolling series — hourly up/down and
similar — that create markets continuously), and it is the only creation
event carrying the `(operatorId, venueId)` origin. `marketId` is a
module-scoped counter (`bytes32(++marketSeq)`) that doubles as the CREATE2
salt — unique by construction, not precomputable before the create tx.
`module.marketIdByAddress(addr)` is the reverse lookup.

Every market carries an immutable kind tag, `IMarket.marketType()`. This
section describes `BINARY_SINGLE_BOOK` — the only kind live today. Future
kinds (dual-book, multi-outcome) will carry different tags and different book
semantics: branch on the tag, never on assumptions.

Lifecycle: `Listed → Trading → Locked → (Settling) → Resolved | Voided`
(`BinaryMarket.StatusChanged`, plus `Resolved` / `Voided`). Orders are only
accepted while the market reports Trading — placement reverts
`TradingNotActive` otherwise. Cancellation stays open through `Locked`;
`redeem` opens at `Resolved` / `Voided`.

### One book, two outcomes: the order kind

Each `BinaryPool` runs a single order book. Place an order with
`placeBinaryOrder` and name its kind:

`OrderKind`
Value
Book side
Locks at placement

`BUY_YES`
`0`
bid
collateral

`SELL_YES`
`1`
ask
YES tokens

`BUY_NO`
`2`
ask
collateral

`SELL_NO`
`3`
bid
NO tokens

A binary pool rejects `placeOrder`, `placeOrders`, `amendOrder` and
`amendOrders` with `UseBinaryPlacement`. `userData` is
the last argument of `placeBinaryOrder` and is a free 64-bit tag, as on spot:
the pool stores it and does not read it. `placeBinaryOrder` takes no native
value; a non-zero `msg.value` reverts `UnexpectedNativeDeposit`.

The NO book is price-inverted so the base matcher can cross the two books
without knowing about outcomes: a NO order is submitted at the YES-side
complement, `price = oneCollateral − noPrice`, where
`oneCollateral = 10 ** collateral.decimals()`. All prices must satisfy
`0 < price < oneCollateral`, because a share can never be worth more than one
collateral unit. A price at or above `oneCollateral` reverts
`PriceOutOfBounds`, and a zero price reverts `InvalidPrice`.

### Escrow and funding

Placement escrows worst-case value up front:

- BUY orders (`BUY_YES`, `BUY_NO`) lock collateral (ceil-rounded
`price × quantity` in the order's own frame). The pull is vault-first:
free vault balance is consumed before `transferFrom` on your wallet — so
`collateral.approve(pool, …)` once per pool. (There is no
auto-pull/manual-vault toggle here; this is the only mode.)

- SELL orders (`SELL_YES`, `SELL_NO`) lock the outcome tokens themselves,
pulled from your ERC-6909 balance on the singleton — call
`outcomeToken.setOperator(pool, true)` once; it covers every market, since
ids are namespaced by pool.

Money flows back through two channels worth knowing:

- Refunds land in your vault balance — taker surplus (you locked at your
limit price, filled at a better maker price) and cancel/reduce/expiry
refunds credit the pool vault, not your wallet. Because placement is
vault-first, a quoting loop recycles these automatically;
`withdraw(collateral, amount)` only when rebalancing. Read it with
`getWithdrawableBalance(owner, collateral)`.

- Fill proceeds deliver wallet-first with vault fallback — if the wallet
transfer fails the pool credits the vault and emits `PayoutFallbackToVault`.

Inventory comes from complete sets:
`module.mintCompleteSet(operatorId, venueId, marketId, amount)` turns `amount`
collateral into `amount` YES + `amount` NO (`setOperator(module, true)` once
for the merge/redeem directions; `operatorId`/`venueId` are routing
attribution only — pass `0` / `bytes32(0)` for none);
`mergeCompleteSet(operatorId, venueId, marketId, amount)` is the inverse;
`redeem(operatorId, venueId, marketId, outcomeIdx, amount)` burns the winning
side 1:1 after resolution (or either side at 1/2 on void). You can also call
the pool's `mintSet` / `burnSet` / `redeem` directly. Note you often need
no inventory at all to quote — see the fill paths below.

On a resolved market (never a voided one), the pool skims the venue's
frozen `settlementFeeBpsTimes1k` ONCE from the whole winning backing when the
first winning redeem lands (emitting `SettlementFeeCharged(feeRecipient, winningBacking, fee)`); every winner then redeems for `1 − fee` per token.
Per-fill maker/taker fees (`ProtocolFeeCharged`) and the per-order builder
fee (`BuilderFeeCharged`) are the other two fee rails — all rates are frozen
into the pool at creation from the origin venue's config and readable via
`getBinaryPoolParams()`.

### The four fill paths

Two opposite-kind orders crossing settle by one of four paths (dispatched on
the unordered pair of order kinds):

Crossing pair
Path
Settlement

`BUY_YES × SELL_YES`
DIRECT_YES
YES ↔ collateral swap

`SELL_NO × BUY_NO`
DIRECT_NO
NO ↔ collateral swap

`BUY_YES × BUY_NO`
MINT_A_PAIR
Both pay collateral; pool mints a fresh pair, one side each (emits `SetMinted`)

`SELL_YES × SELL_NO`
BURN_A_PAIR
Both escrows burned as a pair; each seller paid their share (emits `SetBurned`)

The fill price on `OrderFilled` is always the maker's resting price, in
the YES frame; the NO-side display price is `oneCollateral − fillPrice`.
There is no on-chain "fill kind" field — consumers derive it from the two
orders' kinds — the SDK exports
`sideOfKind` (the YES/NO
side of a resting order, from the pool's `BinaryOrderPlaced(orderId, kind)`
event) and `fillKind` for
exactly this derivation.

`getOrderInfo(orderId)` exposes the binary-side escrow state per order
(`lockedCollateral` / `lockedOutcome`, kind).

## Perps

`PerpPool` extends the same `OrderBook` core, so everything in
the shared core and
materialization carries over
unchanged. On top it adds margin accounting, funding, and liquidations —
with `FundingUpdated` / `OpenInterestUpdated` events, and a dedicated
`MakerOrderCancelledExceedsPosition` removal event (a maker order erased
pre-fill because it would breach the owner's position limit — treat it as a
removal in a book reducer). Perp markets are live on the Shannon and Hideki
testnets (see Perps).
Batch writes and operator keys work on perp
pools as on spot pools, with the differences listed in those sections.

Discovery. `PerpPoolFactory.getPerpPools()` lists the markets of a
network. `getBaseTokenForPool(pool)` returns the base token of one, and
`getPoolForBaseToken(baseToken)` is the reverse lookup. The factory is
`0x516d2cb6de41bE98444e887793946E65989Ba07b` on Shannon; the Hideki factory
and markets are in Hideki testnet.
`getMarketStatus()` returns `0` (`Active`), `1` (`ReduceOnly`), `2`
(`Settlement`) or `3` (`Delisted`). Only an `Active` market accepts an order
that increases a position. `isPriceable()` is `false` while the market cannot
read a usable mark price, so check it before quoting. Read the mark price
with `getMarkPrice()` or the non-reverting `tryGetMarkPrice()`, and the oracle
index price and its update time with `getIndexPrice()`.
`getMaxRestingOrdersPerAccount()` is the most orders that one account can
rest on the market (`0` means the pool applies its built-in default).

Prices and sizes. A price is in collateral units (USDso, 18 decimals) per
one whole base token. `getOneBase()` returns one whole base token in raw
units, so the notional of an order is `price × quantity / getOneBase()`.

Margin. A perp pool keeps collateral in its `marginBank()`. Approve the
MarginBank to spend the collateral token. `deposit(amount)` and
`withdraw(amount)` move margin, and `getAccountEquity(account)` reads an
account's equity in the bank. An order that its owner places also tops up
the margin it needs from the owner's wallet through the same allowance, so a
deposit is optional. Without the allowance, and with no margin in the bank,
the placement reverts in the token's `transferFrom`. An order that an operator
places does not top up (see Operator keys).

## Materialize the order book from events

Every book mutation emits an event, so one pinned snapshot plus the log
stream reproduces the full book — for any of the three families. This is
exactly how the protocol's own indexer and the SDK's live watches work — the
reducer below is the same one they run (see
Architecture for the SDK's
implementation of it).

### Snapshot, then stream

- Pin a block `N` (`eth_blockNumber`).

- Snapshot both sides with `getAllOpenOrdersOffChain` at block `N` (pass
the block tag explicitly so pagination pages are mutually consistent). Drop
orders whose `expireTimestampNs` has already passed.

- Stream the pool's logs from `N + 1` (`eth_subscribe("logs")` over WSS, or an
`eth_getLogs` loop) and apply them strictly in `(blockNumber, logIndex)`
order.

### The event reducer

Keep a map `orderId → Order` plus per-side level aggregates:

Event
Action

`OrderPlaced(orderId, placedOrder)`
Cache the struct; do not insert. Fires for every accepted order — `placedOrder.quantityRemaining` is already the post-match residual (the matcher runs before the event), so zero remaining means it fully filled on entry.

`OrderRested(orderId)`
Insert the cached order into the book. This is the only insert signal.

`OrderFilled(takerId, makerId, qty, takerRem, makerRem, fillPrice)`
Patch the maker: remaining = `makerRem`, remove at zero. Ignore the taker leg — its state arrives on its own `OrderPlaced`/`OrderRested` later in the same tx.

`OrderReduced(orderId, newQuantity)`
Set remaining = `newQuantity` (not a fill).

`OrderCancelled(orderId)` / `OrderExpired(orderId)`
Remove (idempotently).

`OrderCancelledSelfMatch(orderId)`
Remove — a same-owner resting maker erased by a `CancelMaker` self-match.

`OrderCancelledPreFill(orderId)`
Remove — a resting maker pulled by a pre-fill guard before it could fill. The matching loop emits it for every pre-fill removal, so handling it covers every present and future guard.

Family extras, none of which mutate book state: spot pools also emit
`MarkPriceUpdated` (fair-price telemetry); binary pools emit `SetMinted` /
`SetBurned` / `Redeemed` / `SettlementFeeCharged` (outcome-supply /
settlement telemetry — mint-a-pair and burn-a-pair fills emit the first two
alongside `OrderFilled`) and `BinaryMarket.StatusChanged` (leaves Trading →
no new fills, only cancels from here); perp pools add
`MakerOrderCancelledExceedsPosition`, `MakerOrderCancelledNegativeEquity` and
`MakerOrderCancelledStaleMark`, which do mutate the book — treat all three
as removals. They are reason tags emitted alongside the base
`OrderCancelledPreFill`, so a reducer that handles the base event alone already
removes the order.

Ordering inside a placement tx: settlement hooks and one `OrderFilled` per
matched maker fire first, then the taker's `OrderPlaced` (already
residual-adjusted), then `OrderRested` iff the residual rested. A reducer that
only inserts on `OrderRested` handles this for free.

### The sharp edges

- Self-match removals have their own event. With
`SelfMatchingOption.CancelMaker`, the matcher erases the same-owner resting
maker and emits `OrderCancelledSelfMatch(orderId)` (on every book — spot,
binary, perp). Handle it as a removal or your reducer carries a phantom
order whenever any trader self-crosses with `CancelMaker`. With
`CancelTaker` the incoming order is rejected instead: a single-order
placement reverts `SelfMatchCancelTaker`, and `placeOrders` returns `false`
for that request.

- Expiry is lazy. Matching walks past expired makers without cleanup;
`OrderExpired` only fires later (owner's next placement, or the
permissionless sweeps). Prune locally the moment `expireTimestampNs` passes —
an expired order can never fill — and treat the eventual event as a no-op.

- Make removals idempotent. Between local pruning and the several removal
paths, "remove an already-absent order" must be a no-op.

- Stream gaps. On WSS reconnect, backfill the missed range with
`eth_getLogs` before resuming, in windows of at most 1,001 blocks (see
Networks). Somnia blocks have instant BFT finality, so a
delivered log is final and no reorg handling is needed; the SDK's own live
tail does none. If you still want a guard, treat a parent-hash discontinuity
as a reason to re-snapshot rather than to unwind.

## Track your own orders and fills

Both order-id parameters on `OrderFilled` are indexed topics, so you can filter
your fills by the ids your `placeOrder` or `placeBinaryOrder` calls returned (or
`getOwnOpenOrders()` after a restart). Alert on `PayoutFallbackToVault` — a
delivery to your wallet failed and the proceeds are parked in your vault
balance. Reconcile funds with `getWithdrawableBalance(owner, token)` and, on
binary markets, `outcomeToken.balanceOf(owner, yesId | noId)` for positions.

## Interface reference

ABI-faithful excerpts of every function and event used in this guide, taken
from the deployed contracts. Admin/venue-governance entrypoints are omitted;
external interface types (`IERC20`, adapters) are shown as `address` — the ABI
encoding is identical.

### Shared order-book core (every pool)

```
type OrderId is uint128;

enum OrderType { NormalOrder, FillOrKill, ImmediateOrCancel, PostOnly }
enum SelfMatchingOption { CancelTaker, CancelMaker }

struct Order {
    OrderId orderId;
    bool isBid;
    address owner;
    uint64 userData;
    uint256 price;
    uint256 fullQuantity;
    uint256 quantityRemaining;
    uint64 expireTimestampNs;
}

struct OrderBookLevel {
    uint256 price;
    uint256 quantity;
}

struct OrderBookParameters {
    uint256 tickSize;      // min price increment, raw quote/collateral units
    uint256 minQuantity;   // min order quantity, raw base units
    uint256 lotSize;       // min quantity increment, raw base units
}

interface IOrderBook {
    event OrderPlaced(OrderId indexed orderId, Order placedOrder);
    event OrderRested(OrderId indexed orderId);
    event OrderFilled(
        OrderId indexed takerOrderId,
        OrderId indexed makerOrderId,
        uint256 quantityFilled,
        uint256 takerRemainingQuantity,
        uint256 makerRemainingQuantity,
        uint256 fillPrice
    );
    event OrderCancelled(OrderId indexed orderId);
    event OrderCancelledSelfMatch(OrderId indexed orderId);
    event OrderExpired(OrderId indexed orderId);
    event OrderReduced(OrderId indexed orderId, uint256 newQuantity);
    event OrderBookParametersUpdated(OrderBookParameters newParameters);

    function placeOrder(
        bool isBid,
        uint64 userData,
        uint256 price,
        uint256 quantity,
        uint64 expireTimestampNs,
        OrderType orderType,
        SelfMatchingOption selfMatchingOption,
        address builder,
        uint96 builderFeeBpsTimes1k
    ) external payable returns (bool success, OrderId id);

    function cancelOrder(OrderId orderId) external;
    function reduceOrder(OrderId orderId, uint256 newQuantityRemaining) external;
    function cancelExpiredOrders(OrderId[] calldata orderIds) external;
    function sweepExpiredAtLevel(bool isBid, uint256 price, uint256 maxCount)
        external returns (uint256 cleaned);

    function getOrder(OrderId orderId) external view returns (Order memory);
    function getOwnOpenOrders() external view returns (OrderId[] memory);
    function getBookLevels(bool isBid, uint64 numLevels)
        external view returns (OrderBookLevel[] memory);
    function getOrderBookParameters() external view returns (OrderBookParameters memory);
    // eth_call only — msg.sender must be address(0)
    function getAllOpenOrdersOffChain(bool isBid, uint256 maxCount, uint64 startCursor)
        external view returns (Order[] memory orders, bool hasMoreOrders, uint64 nextCursor);
}

// The per-user vault, inherited by every pool.
interface IVault {
    function deposit(address token, uint256 amount) external;
    function depositNative() external payable;
    function withdraw(address token, uint256 amount) external;
    function getWithdrawableBalance(address owner, address token)
        external view returns (uint256);
}

// Rejections of a single-order placement (every pool).
error OrderAlreadyExpired();
error SelfMatchCancelTaker();
error PostOnlyWouldCross();
error FillOrKillNotFillable();
error ImmediateOrCancelNoFill();

```
Copy

### Batch writes and operator entry points (spot and perp pools)

```
struct PlaceOrderRequest {
    bool isBid;
    uint64 userData;
    uint256 price;
    uint256 quantity;
    uint64 expireTimestampNs;
    OrderType orderType;
    SelfMatchingOption selfMatchingOption;
    address builder;
    uint96 builderFeeBpsTimes1k;
}

struct ReduceOrderRequest {
    OrderId orderId;
    uint256 newQuantityRemaining;
}

struct AmendOrderRequest {
    OrderId oldOrderId;
    bool alwaysPlace;
    PlaceOrderRequest newOrder;
}

// IOrderBook, continued.
interface IOrderBook {
    // Batch writes and amend. None of them is payable.
    function placeOrders(PlaceOrderRequest[] calldata requests)
        external returns (bool[] memory successes, OrderId[] memory ids);
    function cancelOrders(OrderId[] calldata orderIds)
        external returns (bool[] memory cancelled);
    function reduceOrders(ReduceOrderRequest[] calldata requests) external;
    function amendOrder(AmendOrderRequest calldata request)
        external returns (OrderId newOrderId);
    function amendOrders(AmendOrderRequest[] calldata requests)
        external returns (OrderId[] memory newOrderIds);

    // Called by an operator key for `owner`.
    function placeOrderFor(
        address owner,
        bool isBid,
        uint64 userData,
        uint256 price,
        uint256 quantity,
        uint64 expireTimestampNs,
        OrderType orderType,
        SelfMatchingOption selfMatchingOption,
        address builder,
        uint96 builderFeeBpsTimes1k
    ) external payable returns (bool success, OrderId id);
    function cancelOrderFor(address owner, OrderId orderId) external;
    function reduceOrderFor(address owner, OrderId orderId, uint256 newQuantityRemaining) external;
    function placeOrdersFor(address owner, PlaceOrderRequest[] calldata requests)
        external returns (bool[] memory successes, OrderId[] memory ids);
    function cancelOrdersFor(address owner, OrderId[] calldata orderIds)
        external returns (bool[] memory cancelled);
    function reduceOrdersFor(address owner, ReduceOrderRequest[] calldata requests) external;
    function amendOrderFor(address owner, AmendOrderRequest calldata request)
        external returns (OrderId newOrderId);
    function amendOrdersFor(address owner, AmendOrderRequest[] calldata requests)
        external returns (OrderId[] memory newOrderIds);
}

// Declared on both ISpotPool and IPerpPool.
interface ISpotPool {
    function getOperatorPermissionsRegistry() external view returns (address);
    function isOperatorAuthorized(address owner, address operator, bytes4 selector)
        external view returns (bool);
}

interface IOperatorPermissionsRegistry {
    function setOperatorApprovalForPool(address pool, address operator, bytes4[] calldata selectors, bool approved)
        external;
    function setOperatorApprovalGlobal(address operator, bytes4[] calldata selectors, bool approved) external;
    function setOperatorDenialForPool(address pool, address operator, bytes4[] calldata selectors, bool denied)
        external;
    function isApproved(address owner, address operator, bytes4 selector, address pool)
        external view returns (bool);
}

error EmptyBatch();
error AmendOldOrderGone(OrderId oldOrderId);
error AmendReplacementRejected(uint256 requestIndex, uint8 reason); // on pools where amendOrders reverts the whole batch
error OnlyApprovedContracts();
error UseBinaryPlacement(); // a binary pool, on placeOrder, placeOrders and amend

```
Copy

### SpotPool additions

```
interface ISpotPool /* is IOrderBook, IVault */ {
    event MarkPriceUpdated(address indexed asset, uint256 markPrice, uint256 rawMidpoint);
    event ManualVaultModeUpdated(address indexed user, bool enabled);
    event PayoutFallbackToVault(address indexed owner, address indexed token, uint256 amount);

    function setManualVaultMode(bool enabled) external;

    function getPoolParams() external view returns (
        address baseToken,
        address quoteToken,
        uint256 makerFeeBpsTimes1k,
        uint256 takerFeeBpsTimes1k,
        uint256 tickSize,
        uint256 minQuantity,
        uint256 lotSize
    );
    function getManualVaultMode(address user) external view returns (bool enabled);
    function getAutoPullRequirement(
        address owner,
        bool isBid,
        uint256 price,
        uint256 quantity,
        uint96 builderFeeBpsTimes1k
    ) external view returns (address inputToken, uint256 requiredAmount, uint256 delta);
    function getMidpointEmaState() external view returns (uint256 emaValue, uint64 lastUpdateNs);
}

```
Copy

### BinaryPool additions

```
enum OrderKind { BUY_YES, SELL_YES, BUY_NO, SELL_NO }

struct BinaryPoolOrderInfo {
    OrderId orderId;
    uint256 lockedCollateral;   // BUY escrow (mutually exclusive with lockedOutcome)
    uint256 lockedOutcome;      // SELL escrow
    uint8 outcomeIdx;           // 0 = YES, 1 = NO
    bool isBuy;
    address builder;
    uint96 builderFeeBpsTimes1k;
}

struct BinaryPoolInfo {
    address collateralToken;
    address market;
    address outcomeToken;
    uint256 yesId;
    uint256 noId;
    uint256 oneCollateral;      // 10 ** collateral.decimals()
    uint256 setBacking;
    address feeRecipient;
    uint256 makerFeeBpsTimes1k;
    uint256 takerFeeBpsTimes1k;
    uint256 maxBuilderFeeBpsTimes1k;
    uint256 settlementFeeBpsTimes1k;
}

interface IBinaryPool /* is IOrderBook, IVault */ {
    event BinaryOrderPlaced(OrderId indexed orderId, OrderKind kind);
    event SetMinted(address indexed payer, address indexed yesTo, address indexed noTo, uint256 amount);
    event SetBurned(address indexed holder, uint256 amount);
    event Redeemed(
        address indexed holder,
        address indexed to,
        uint8 outcomeIdx,
        uint256 amountBurned,
        uint256 collateralOut
    );
    // Fee rail: per-fill protocol fees, per-order builder fees (opt-in via
    // approveBuilder), and the one-time settlement fee on the winning backing.
    event ProtocolFeeCharged(
        OrderId indexed orderId, address indexed recipient, address indexed token, uint256 amount, bool isTakerSide
    );
    event BuilderApproved(address indexed user, address indexed builder, uint256 maxFeeBpsTimes1k);
    event BuilderFeeCharged(OrderId indexed orderId, address indexed builder, address indexed token, uint256 amount);
    event SettlementFeeCharged(address indexed feeRecipient, uint256 winningBacking, uint256 fee);
    event PayoutFallbackToVault(address indexed owner, address indexed token, uint256 amount);

    // The placement entrypoint for binary pools. `price` is the YES-side price
    // for every kind. A non-zero msg.value reverts UnexpectedNativeDeposit.
    function placeBinaryOrder(
        OrderKind kind,
        uint256 price,
        uint256 quantity,
        uint64 expireTimestampNs,
        OrderType orderType,
        SelfMatchingOption selfMatchingOption,
        address builder,
        uint96 builderFeeBpsTimes1k,
        uint64 userData
    ) external payable returns (bool success, OrderId id);

    function approveBuilder(address builder, uint256 maxFeeBpsTimes1k) external;
    function getMaxBuilderFeeBpsTimes1k() external view returns (uint256 maxFeeBpsTimes1k);
    function getBuilderApproval(address user, address builder) external view returns (uint256 maxFeeBpsTimes1k);
    function getEffectiveBuilderApproval(address user, address builder) external view returns (uint256 maxFeeBpsTimes1k);

    function mintSet(address yesTo, address noTo, uint256 amount) external;
    function burnSet(uint256 amount) external;
    function redeem(uint256 amount, uint8 outcomeIdx, address to)
        external returns (uint256 collateralOut);

    function collateralToken() external view returns (address);
    function outcomeToken() external view returns (address);
    function outcomeId(uint8 outcomeIdx) external view returns (uint256);
    function market() external view returns (address);
    function setBacking() external view returns (uint256);
    function getBinaryPoolParams() external view returns (BinaryPoolInfo memory info);
    function getOrderInfo(OrderId orderId) external view returns (BinaryPoolOrderInfo memory info);
}

error UseBinaryPlacement();      // placeOrder, placeOrders or amend on a binary pool
error UnexpectedNativeDeposit(); // msg.value on placeBinaryOrder
error PriceOutOfBounds();        // price at or above oneCollateral

```
Copy

### BinaryMarketsModule (the market registry)

```
enum VoidPolicy { UNIFORM, AMM_SNAPSHOT }  // AMM_SNAPSHOT is a dead legacy slot
enum MarketType { BINARY_SINGLE_BOOK, BINARY_DUAL_BOOK, NATIVE_MULTI }

interface IBinaryMarketsModule {
    event MarketCreated(
        bytes32 indexed marketId,
        address indexed market,
        address indexed pool,
        uint256 oracleQuestionId,
        uint32 operatorId,
        bytes32 venueId,
        address creator,
        address collateral,
        uint256 yesId,
        uint256 noId,
        uint8 outcomeSlotCount,
        MarketType marketType,
        uint64 tradingStart,
        uint64 expiry,
        VoidPolicy voidPolicy,
        string asset,
        uint256 strike,        // 0 for reference-mode markets (no fixed strike)
        string question,
        bytes context
    );

    function markets(bytes32 marketId) external view returns (
        uint256 oracleQuestionId,
        uint8 outcomeSlotCount,
        VoidPolicy voidPolicy,
        address collateral,
        uint32 originOperatorId,
        bytes32 originVenueId,
        address oracleAdapter,
        address creator,
        address market,
        address pool,
        uint256 yesId,
        uint256 noId,
        uint64 tradingStart,
        uint64 expiry
    );
    function marketIdByAddress(address market) external view returns (bytes32 marketId);

    // operatorId / venueId are routing attribution only (0 / bytes32(0) = none).
    function mintCompleteSet(uint32 operatorId, bytes32 venueId, bytes32 marketId, uint256 amount) external;
    function mergeCompleteSet(uint32 operatorId, bytes32 venueId, bytes32 marketId, uint256 amount) external;
    function redeem(uint32 operatorId, bytes32 venueId, bytes32 marketId, uint8 outcomeIdx, uint256 amount) external;
}

```
Copy

### BinaryMarket (lifecycle) and the outcome-token singleton

```
enum MarketStatus { Listed, Trading, Locked, Settling, Resolved, Voided }

interface IBinaryMarket {
    event StatusChanged(MarketStatus indexed oldStatus, MarketStatus indexed newStatus);
    event Resolved(uint8 indexed winningOutcome);
    event Voided();

    function marketType() external view returns (MarketType);
    function tradingActive() external view returns (bool);
    function isResolved() external view returns (bool);
    function isVoided() external view returns (bool);
    function winningOutcome() external view returns (uint8);
}

// ERC-6909 subset. One singleton for all markets; id = (uint160(pool) << 8) | outcomeIdx.
interface IOutcomeToken6909 {
    event Transfer(
        address caller,
        address indexed sender,
        address indexed receiver,
        uint256 indexed id,
        uint256 amount
    );

    function setOperator(address spender, bool approved) external returns (bool);
    function transferFrom(address from, address to, uint256 id, uint256 amount)
        external returns (bool);
    function balanceOf(address owner, uint256 id) external view returns (uint256);
}

```
Copy

### Perps (factory, pool additions, MarginBank)

```
interface IPerpPoolFactory {
    function getPerpPools() external view returns (address[] memory);
    function getBaseTokenForPool(address perpPool) external view returns (address);
    function getPoolForBaseToken(address baseToken) external view returns (address);
}

enum MarketStatus { Active, ReduceOnly, Settlement, Delisted }

struct PerpPoolParameters {
    uint256 initialMarginBps;
    uint256 maintenanceMarginBps;
    uint256 closeOutMarginBps;
    uint256 maxOpenInterest;
    uint256 maxPositionSize;
    uint256 takerFeeBpsTimes1k;
    int256 makerFeeBpsTimes1k;
    uint256 insuranceFundShareBps;
}

interface IPerpPool /* is IOrderBook */ {
    function marginBank() external view returns (address);
    function getMarketStatus() external view returns (MarketStatus);
    function isPriceable() external view returns (bool);
    function getMarkPrice() external view returns (uint256);
    function tryGetMarkPrice() external view returns (bool ok, uint256 price);
    function getIndexPrice() external view returns (uint256 price, uint256 updatedAt);
    function getOneBase() external view returns (uint256);
    function getPerpPoolParameters() external view returns (PerpPoolParameters memory);
    function getMaxRestingOrdersPerAccount() external view returns (uint16);
}

interface IMarginBank {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getAccountEquity(address account) external view returns (int256);
}

```
Copy

### Bridge routers and testnet tokens

```
// Hyperlane token router (the USDso and STT routers in Hideki testnet).
interface ITokenRouter {
    function transferRemote(uint32 destination, bytes32 recipient, uint256 amount)
        external payable returns (bytes32 messageId);
    function quoteGasPayment(uint32 destination) external view returns (uint256);
}

interface IShannonUSDso {
    function mint(address to, uint256 amount) external;
}

interface ITestUSDC {
    function faucet(uint256 amount) external; // at most 10,000 tUSDC per call
}

```
Copy
Edit this page

PreviousOverviewNextMarket making