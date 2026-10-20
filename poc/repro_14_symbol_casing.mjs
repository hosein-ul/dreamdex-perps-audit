// poc/repro_14_symbol_casing.mjs
// 14 — The Somnia Markets SDK docs' canonical perp symbol "BTC/USDSO:USDSO" throws
// InvalidInputError: unknown symbol — the live symbol is "BTC/USDso:USDso" (token's real casing).
// Run twice: node poc/repro_14_symbol_casing.mjs   (requires `npm install` in the repo root first)
// Read-only: same dummy key pattern as the other poc scripts; no order is placed.
import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';

const DOC_SYMBOL = 'BTC/USDSO:USDSO'; // exactly as printed in the perps guide + exchange guide Symbols table
const dummyKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a074729c8';

const exchange = new SomniaMarkets({
  chain: hidekiTestnet,
  indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql',
  addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
  privateKey: dummyKey,
});

try {
  const markets = await exchange.loadMarkets(); // the error message itself says "call loadMarkets() first" — we do
  console.log(`loadMarkets() OK — total markets: ${Object.keys(markets).length}`);

  const live = Object.values(markets).find((m) => (m.symbol ?? m.id ?? '').startsWith('BTC/'));
  console.log(`live BTC perp symbol: ${live?.symbol ?? live?.id ?? 'n/a'}`);

  try {
    const m = exchange.market(DOC_SYMBOL);
    console.log(`doc symbol ${DOC_SYMBOL} → unexpectedly resolved: ${JSON.stringify(m)}`);
    console.log('NOT REPRODUCED — resolver may have been case-insensified, re-check.');
  } catch (err) {
    console.log(`doc symbol ${DOC_SYMBOL} → ${err.name}: ${err.message}`);
    const pass = /unknown symbol/i.test(String(err.message)) && live && /USDso/.test(live.symbol ?? live.id ?? '');
    console.log(pass
      ? 'REPRO CONFIRMED: the docs\' canonical symbol string fails even with loadMarkets() called; the live symbol uses USDso casing.'
      : 'NOT REPRODUCED — re-check manually.');
  }
  process.exit(0);
} catch (err) {
  console.error('setup failed:', err?.name, err?.message);
  process.exit(1);
}
