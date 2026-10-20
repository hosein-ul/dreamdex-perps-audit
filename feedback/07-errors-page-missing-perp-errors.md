# Errors page documents no PerpPool / MarginBank errors, though the SDK docs point there for "the full list"
Severity: normal
Area: docs

## Steps to reproduce
1. Open the perps developer docs page that the bounty links: https://app.testnet.dreamdex.io/docs/developers/perps-testnet — it says, footnote of "An IOC that fills nothing reverts": "The full list of order errors is on the [Errors](../contracts/errors.md#order-rejection) page." It also names perp-specific reverts inline: `InsufficientCollateral()` (`0x3a23d825`), `StepPriceTooHigh`? (scale example), `MaxPositionSizeExceeded()` (`0x714b36d6`).
2. Open the page it points to: https://app.testnet.dreamdex.io/docs/developers/contracts/errors (identical content served at https://app.dreamdex.io/docs/developers/contracts/errors).
3. Search the page for a perp section: there is only "## SpotPool errors" and "## SpotStopOrderRegistry errors".

Evidence script: `poc/repro_07_errors_page_no_perp_selectors.mjs` (fetches both pages and greps for selector names).

## Expected
The canonical Errors page should carry a **PerpPool / MarginBank** section mapping at least the selectors the perps docs themselves quote: `InsufficientCollateral()` `0x3a23d825`, `MaxPositionSizeExceeded()` `0x714b36d6`, plus the perp-adjacent ones a builder meets (`MarketRestricted`, `IsolatedMarketBlocked`, `BuilderFeeExceedsApproval`, `PriorFundingPayerOutstanding`, voucher/withdraw-margin reverts, funding-index errors).

## Actual
100% of the table is spot-specific (SpotPool + SpotStopOrderRegistry). Not one perp/MarginBank selector appears. A builder who hits a perp revert must guess, and the docs' own "full list" pointer is wrong for perps. The five shared "Order rejection" selectors do apply (same OrderBook core), but the perp-only money-path errors are nowhere on any doc page (they are only quoted scattered in prose on the perps dev page).

## Evidence
- Screenshot-equivalent: both URLs fetched 2026-10-20, headings sequence confirmed: `## SpotPool errors` … `## SpotStopOrderRegistry errors` … `## Preflight (HTTP API) reverts`; grep for `InsufficientCollateral` → 0 matches on the errors page; grep on the perps dev page → 2 matches (prose only).
- Repro pass 2: 2026-10-20, same result (run the script twice; both runs print identical verdicts).

## Environment
Docs version: live at time of test (site states "Living document"). Network: docs comparison only, chain 50383 referenced. Wallet: n/a (read-only). SDK @somnia-chain/markets-sdk 0.32.1 (per dev docs, the version the app runs).

Impact: every perp builder debugging a revert (the docs' own scale/decimal pitfall guarantees they will) starts from a page that cannot decode their error.
Suggested fix: add `## PerpPool errors` and `## MarginBank / voucher` tables mirroring the SpotPool style, seeded from the selectors already quoted in the perps dev docs (`0x3a23d825`, `0x714b36d6`) plus the rest of the deployed perp ABIs.
