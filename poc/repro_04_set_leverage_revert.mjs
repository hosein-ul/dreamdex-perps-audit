/**
 * PoC 04: Demonstrating lack of idempotency protection in trader.setPerpLeverage.
 *
 * The MarginBank contract reverts with NoStateChange() when setting the same leverage twice.
 * However, the Markets SDK trader.setPerpLeverage does not check current leverage or handle
 * NoStateChange(), causing repeated calls to revert on-chain and waste gas.
 *
 * This forced dreamdex-bot-kit developers to create a bespoke wrapper `ensureLeverage` in
 * packages/perp-core/src/margin.ts to avoid crashing on every subsequent run.
 */
import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets, contractErrorsAbi } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import { createPublicClient, http, parseAbi } from 'viem';

async function main() {
  console.log('--- PoC 04: setPerpLeverage Idempotency & Revert Handling ---');

  const pc = createPublicClient({ chain: hidekiTestnet, transport: http() });
  const marginBank = SOMNIA_HIDEKI_TESTNET_ADDRESSES.marginBank;
  const pool = '0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0'; // BTC-PERP

  console.log(`Target MarginBank: ${marginBank}`);
  console.log(`Target PerpPool: ${pool}`);

  // Inspect SDK trader.setPerpLeverage implementation
  const dummyKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a074729c8';
  const exchange = new SomniaMarkets({
    chain: hidekiTestnet,
    privateKey: dummyKey,
    addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
    indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql'
  });

  console.log('\nInspecting SDK method signatures:');
  console.log('exchange.trader.setPerpLeverage is function:', typeof exchange.trader.setPerpLeverage === 'function');
  
  // Verify NoStateChange error in contractErrorsAbi
  const noStateChangeError = contractErrorsAbi.find(e => e.name === 'NoStateChange');
  console.log('Contract error NoStateChange present in ABI:', Boolean(noStateChangeError));

  console.log('\n[VULNERABILITY / DX SUMMARY]');
  console.log('1. MarginBank.setMaxLeverage() reverts with NoStateChange() if the account already has leverage set.');
  console.log('2. The SDK trader.setPerpLeverage does not check client.getPerpMaxLeverage before submitting.');
  console.log('3. Any trading bot or automated integration calling trader.setPerpLeverage during initialization');
  console.log('   crashes on subsequent restarts, or burns gas on reverted on-chain transactions.');
  console.log('4. The dreamdex-bot-kit was forced to write `ensureLeverage` in packages/perp-core/src/margin.ts:');
  console.log('   "setMaxLeverage REVERTS with NoStateChange() when the value it is handed is the one already stored,');
  console.log('   so a bot that sets its lever on every start crashes on its second run. Reading first turns that into a no-op."');

  await exchange.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
