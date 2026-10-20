import { SomniaMarkets, SOMNIA_HIDEKI_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import fs from 'node:fs';

async function main() {
  const exchange = new SomniaMarkets({
    chain: hidekiTestnet,
    indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql',
    addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
  });

  console.log('Fetching system config...');
  const sys = await exchange.client.getPerpSystemConfig('0x478769E1177C0773c43A593DCCc4Ad15F15F1394');
  console.log('System config:', sys);

  console.log('Fetching insurance fund state...');
  const fund = await exchange.client.getInsuranceFundState(sys.insuranceFund).catch(e => ({ error: e.message }));
  console.log('Insurance fund:', fund);

  console.log('Fetching liquidation engine config...');
  const eng = await exchange.client.getLiquidationEngineConfig(sys.liquidationEngine).catch(e => ({ error: e.message }));
  console.log('Liquidation engine:', eng);

  console.log('Loading all markets...');
  const markets = await exchange.loadMarkets(true);
  const perpList = Object.values(markets).filter(m => m.type === 'swap');
  console.log(`Found ${perpList.length} perp markets.`);

  const detailed = [];
  for (const p of perpList) {
    const info = p.info;
    let stopSomi = '0';
    if (info.stopRegistry) {
      try {
        const somiVal = await exchange.client.getPerpStopOrderSomiPayment(info.stopRegistry);
        stopSomi = somiVal.toString();
      } catch (err) {
        stopSomi = `err: ${err.message}`;
      }
    }
    detailed.push({
      symbol: p.symbol,
      display: `${p.base}-PERP`,
      base: p.base,
      quote: p.quote,
      poolAddress: info.poolAddress,
      marginBank: info.marginBank,
      quoteToken: info.quoteToken,
      baseToken: info.baseToken,
      baseDecimals: info.baseDecimals,
      quoteDecimals: info.quoteDecimals,
      tickSize: info.tickSize,
      lotSize: info.lotSize,
      minQuantity: info.minQuantity,
      markPrice: info.markPrice,
      indexPrice: info.indexPrice,
      fundingRate: info.fundingRate,
      fundingWindowSec: info.fundingWindowSec,
      fundingIntervalSec: info.fundingIntervalSec,
      initialMarginBps: info.initialMarginBps,
      openInterest: info.openInterest,
      stopRegistry: info.stopRegistry,
      stopSomiPayment: stopSomi,
      active: p.active
    });
  }

  const out = {
    systemConfig: sys,
    insuranceFund: fund,
    liquidationEngine: eng,
    marketsCount: detailed.length,
    markets: detailed
  };

  fs.writeFileSync('recon/onchain_markets.json', JSON.stringify(out, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));

  console.log('Wrote recon/onchain_markets.json successfully.');

  try {
    await exchange.close();
  } catch {}
  process.exit(0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
