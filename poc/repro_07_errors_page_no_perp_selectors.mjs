// poc/repro_07_errors_page_no_perp_selectors.mjs
// 07 — Canonical Errors page carries no perp selectors, though the perps dev docs point there
// for "the full list of order errors". Docs-only, no wallet, no chain calls.
// Run twice: node poc/repro_07_errors_page_no_perp_selectors.mjs
const ERRORS_PAGE = "https://app.testnet.dreamdex.io/docs/developers/contracts/errors";
const PERPS_DEV_PAGE = "https://app.testnet.dreamdex.io/docs/developers/perps-testnet";

const PERP_SELECTORS_ONLY = ["InsufficientCollateral", "MaxPositionSizeExceeded", "IsolatedMarketBlocked", "MarketRestricted"];
const PERP_SECTIONS = ["PerpPool errors", "MarginBank", "VoucherDistributor", "LiquidationEngine errors"];

const errors = await (await fetch(ERRORS_PAGE)).text();
const perps = await (await fetch(PERPS_DEV_PAGE)).text();

const missingSections = PERP_SECTIONS.filter((s) => !errors.includes(s));
const missingSelectorsOnErrors = PERP_SELECTORS_ONLY.filter((s) => !errors.includes(s));
const quotedOnPerpsPage = PERP_SELECTORS_ONLY.filter((s) => perps.includes(s));

console.log("errors page fetched:", errors.includes("SpotStopOrderRegistry errors") ? "OK (spot tables present)" : "UNEXPECTED");
console.log("perp sections absent from errors page:", missingSections.join(", ") || "(none missing!)");
console.log("perp selectors quoted by perps dev docs:", quotedOnPerpsPage.join(", "));
console.log("perp selectors on errors page:", PERP_SELECTORS_ONLY.filter((s) => errors.includes(s)).join(", ") || "(none)");

const pass = missingSections.length === PERP_SECTIONS.length && quotedOnPerpsPage.length > 0 && missingSelectorsOnErrors.length === PERP_SELECTORS_ONLY.length;
console.log(pass ? "REPRO CONFIRMED: errors page lacks the entire perp error table, while the perps dev docs point to it as the full list." : "NOT REPRODUCED — doc page changed, re-check.");
