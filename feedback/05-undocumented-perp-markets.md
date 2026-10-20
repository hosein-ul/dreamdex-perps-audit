# Six live perp markets omitted from raw contract integration table in documentation
Severity: normal
Area: docs

## Steps to reproduce
1. Navigate to the Somnia Markets developer documentation: "Raw smart-contract integration" (`somnia-markets/contracts.md`), specifically the "Hideki testnet" subsection under "Perp markets".
2. Count the documented perp markets in the table (15 markets listed: BTC, ETH, SOL, HYPE, XRP, DOGE, BNB, ADA, SUI, LINK, AVAX, XLM, NEAR, WLD, TAO).
3. Query the live on-chain `PerpPoolFactory` contract (`0xE631fAEE547baeE07353E290f0562ea67d856560`) by invoking `getPerpPools()`.
4. Observe that `getPerpPools()` returns 21 pool addresses.
5. Alternatively, run the automated verification script:
   ```bash
   node poc/repro_05_undocumented_markets.mjs
   ```

## Expected
The contract integration documentation should list all 21 active perpetual futures markets deployed on the Hideki testnet, including pool addresses and underlying symbols.

## Actual
Six active perp pools are completely omitted from the documentation table:
- `ZEC` (`0x2a73129F26917124bd2A47a9B355C395C537F050`)
- `PUMP` (`0x76c981a52530cdF9497559140aAfCd8CD16836E7`)
- `1000PEPE` (`0xfA9B9e50CC1745113d57893991aF200a74c86B6f`)
- `VVV` (`0x352636aB146039851Ef06D6367A106d5FB4E6409`)
- `LIT` (`0xDCb0Ad226727b2cE92857F0aF5751389d42B2A3f`)
- `ZRO` (`0x2a1822b02039DDf0e293F3F7243673fc03EAF16c`)

## Evidence
Execution log from `poc/repro_05_undocumented_markets.mjs`:
```text
--- PoC 05: Verifying Documented Markets vs Live On-Chain Factory ---
PerpPoolFactory: 0xE631fAEE547baeE07353E290f0562ea67d856560
Documented markets in contracts.md: 15
Live on-chain getPerpPools() count: 21

--- UNDOCUMENTED MARKETS DETECTED ---
Total missing from documentation: 6
  - Symbol: ZEC/USDso:USDso, Address: 0x2a73129F26917124bd2A47a9B355C395C537F050
  - Symbol: PUMP/USDso:USDso, Address: 0x76c981a52530cdF9497559140aAfCd8CD16836E7
  - Symbol: 1000PEPE/USDso:USDso, Address: 0xfA9B9e50CC1745113d57893991aF200a74c86B6f
  - Symbol: VVV/USDso:USDso, Address: 0x352636aB146039851Ef06D6367A106d5FB4E6409
  - Symbol: LIT/USDso:USDso, Address: 0xDCb0Ad226727b2cE92857F0aF5751389d42B2A3f
  - Symbol: ZRO/USDso:USDso, Address: 0x2a1822b02039DDf0e293F3F7243673fc03EAF16c

[RESULT: CONFIRMED DOCUMENTATION DEFECT]
Developers integrating raw smart contracts via contracts.md will miss 6 active perp pools
leading to incomplete order books and missing trading pairs.
```

## Environment
- Network: Somnia Hideki Testnet (chain ID `50383`)
- Factory Contract: `PerpPoolFactory` (`0xE631fAEE547baeE07353E290f0562ea67d856560`)
- Documentation source: `somnia-markets/contracts.md` (Raw smart-contract integration)

## Impact
Developers building bots in Python, Go, or Rust who rely on the raw contracts reference rather than the TypeScript SDK miss 28% of the available trading universe (6 out of 21 markets).

## Suggested fix
Update the Hideki Perp Markets table in `somnia-markets/contracts.md` to include rows for ZEC, PUMP, 1000PEPE, VVV, LIT, and ZRO with their corresponding `PerpPool` addresses.
