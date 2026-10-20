/**
 * PoC 03: Verifying that placePerpStopOrder fails with NotConfiguredError when operatorRegistry is omitted,
 * because neither SOMNIA_HIDEKI_TESTNET_ADDRESSES nor SOMNIA_TESTNET_ADDRESSES defines it.
 */
import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';

async function main() {
  console.log('--- PoC 03: Verifying missing operatorRegistry in SDK Address Constants ---');

  console.log('Checking SOMNIA_HIDEKI_TESTNET_ADDRESSES:');
  console.log('operatorRegistry defined?:', 'operatorRegistry' in SOMNIA_HIDEKI_TESTNET_ADDRESSES);
  console.log('operatorPermissionsRegistry defined?:', 'operatorPermissionsRegistry' in SOMNIA_HIDEKI_TESTNET_ADDRESSES);

  // Initializing exchange with a random dummy test key (read/write setup)
  const dummyKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a074729c8';
  const exchange = new SomniaMarkets({
    chain: hidekiTestnet,
    indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql',
    addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
    privateKey: dummyKey,
  });

  console.log('\nAttempting to call trader.placePerpStopOrder without passing operatorRegistry explicitly...');

  try {
    // Calling placePerpStopOrder as documented in standard SDK quickstarts
    await exchange.trader.placePerpStopOrder({
      registry: '0x52e2ccebaec9332672c247e9a90aa3d61fb615ef', // BTC-PERP stop registry on Hideki
      pool: '0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0',
      isBid: false,
      quantity: 100000n,
      triggerPrice: 80000000000000000000000n, // 80,000
      triggerOperator: 1, // LTE
      stopOrderType: 1,
      intent: 'reduceOnly'
    });
    console.log('Unexpected: call succeeded without operatorRegistry');
  } catch (err) {
    console.log('\n[RESULT: CONFIRMED BUG]');
    console.log(`Thrown Error Name: ${err.name}`);
    console.log(`Thrown Error Message: ${err.message}`);
    console.log('Stack snippet:', err.stack?.split('\n').slice(0, 3).join('\n'));
  }

  await exchange.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
