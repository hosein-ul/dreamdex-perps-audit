/**
 * PoC 06: Demonstrating missing Perp "...For" methods on SomniaMarkets Trader.
 *
 * Although the SDK defines and exports:
 * - PLACE_ORDER_FOR_SELECTOR ("0x80054449")
 * - CANCEL_ORDER_FOR_SELECTOR ("0xe37b444b")
 * And the on-chain PerpPool implements placeOrderFor, cancelOrderFor, and reduceOrderFor,
 * the Markets SDK Trader instance completely lacks any methods for placing, cancelling,
 * or reducing perp orders on behalf of a linked account (trading key / operator).
 *
 * This forces bot developers to bypass the SDK and write direct viem simulations,
 * manual gas estimation, and manual receipt decoding.
 */
import {
  SOMNIA_HIDEKI_TESTNET_ADDRESSES,
  SomniaMarkets,
  PLACE_ORDER_FOR_SELECTOR,
  CANCEL_ORDER_FOR_SELECTOR
} from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';

async function main() {
  console.log('--- PoC 06: Missing Perp "...For" Methods on Trader ---');

  console.log('SDK Exported Selectors:');
  console.log(`  PLACE_ORDER_FOR_SELECTOR: ${PLACE_ORDER_FOR_SELECTOR}`);
  console.log(`  CANCEL_ORDER_FOR_SELECTOR: ${CANCEL_ORDER_FOR_SELECTOR}`);

  const dummyKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a074729c8';
  const exchange = new SomniaMarkets({
    chain: hidekiTestnet,
    privateKey: dummyKey,
    addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
    indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql'
  });

  const trader = exchange.trader;
  const methods = Object.keys(trader);

  console.log('\nInspecting trader methods:');
  console.log('trader.placePerpOrder exists?:', typeof trader.placePerpOrder === 'function');
  console.log('trader.placePerpOrderFor exists?:', typeof trader.placePerpOrderFor === 'function');
  console.log('trader.cancelPerpOrderFor exists?:', typeof trader.cancelPerpOrderFor === 'function');
  console.log('trader.reducePerpOrderFor exists?:', typeof trader.reducePerpOrderFor === 'function');

  const forMethods = methods.filter(m => m.endsWith('For'));
  console.log('\nAll "*For" methods present on trader:', forMethods);

  const missing = !('placePerpOrderFor' in trader) && !('cancelPerpOrderFor' in trader);
  if (missing) {
    console.log('\n[RESULT: CONFIRMED SDK GAP / MISSING FEATURE]');
    console.log('The Markets SDK exposes no high-level or builder methods for operator perp trading.');
    console.log('Developers using "Link a Bot" / trading key architecture cannot use the SDK trader abstraction.');
    console.log('As documented in dreamdex-bot-kit (packages/perp-core/src/operator.ts):');
    console.log('  "The markets SDK has no perp ...For writes, so the three calls are sent here with viem."');
  }

  await exchange.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
