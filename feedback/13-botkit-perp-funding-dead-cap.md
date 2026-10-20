# perp-funding's position cap check is unreachable dead code — the documented MAX_POSITION cap is only per-entry
Severity: normal
Area: SDK

Package: dreamdex-bot-kit, strategy `(strategies/perp-funding/src/index.ts)`:
- line 101: `const held = position ? position.contracts * liveAt : 0;`
- line 126–129:
  ```ts
  } else if (!position && worthHolding && me) {
    if (held >= MAX_POSITION) {
      console.log("at the position cap, not adding");
    } else {
      ...
      const wanted = sizeForNotional(Math.min(NOTIONAL, MAX_POSITION), fresh.info, liveAt);
  ```

## Steps to reproduce
1. Clone the kit: `git clone https://github.com/somnia-chain/dreamdex-bot-kit`.
2. Read `strategies/perp-funding/src/index.ts` lines 101, 126–129 as quoted above.

Reference: `poc/repro_13_botkit_dead_branch.mjs` (fetches the shipped source and locates the unreachable guard).

## Expected
For a strategy whose env advertises `PERP_FUNDING_MAX_POSITION_USDSO` (default 200) as a position-notional cap, the check should stop re-entries once the position approaches `MAX_POSITION`.

## Actual
The `held >= MAX_POSITION` guard sits inside the `!position` branch, but `held` is derived from `position` (line 101), so whenever the branch runs, `held === 0` and the guard can never fire. The only remaining enforcement is `Math.min(NOTIONAL, MAX_POSITION)` at entry (line 137) — so the *per-entry* cap works, but the *account-level* cap across multiple entries does not: the code implies re-entries are assessed against a total holding, but `held` is provably zero on the path where it is checked.

If `MAX_POSITION < NOTIONAL`, the code silently under-trades per entry (entry size = `min(NOTIONAL, MAX_POSITION)`), and the "at the position cap, not adding" message can never be reached at all.

## Evidence
- Source: exact lines 101 & 126–137 quoted above (verified twice via grep + full-file read).
- Logic check: substitute `position = null` → line 101 yields `held = 0`; `0 >= MAX_POSITION` is false for every documented default (`PERP_FUNDING_MAX_POSITION_USDSO=200`) — the line `"at the position cap, not adding"` is unreachable code.

## Environment
bot kit @ 2579866 (node 24, Windows). Network n/a (static analysis). Wallet n/a.

Impact: misleading cap semantics in a documented strategy; anyone reading it assumes an account-level `MAX_POSITION` enforcement that does not exist — a real risk when bots hold leveraged positions unattended.
Suggested fix: use the position read from the previous loop iteration for `held`, or re-read the live position (`positionIn`) before sizing the entry; the guard's intent is clearly "don't add on top of what's open" and it currently never gets true input to check against.
