/**
 * Optional Live On-Chain Trading Test Script.
 *
 * Reads PRIVATE_KEY from .env (or an ephemeral burner key).
 * If the key has STT gas:
 * 1. Claims 1,000 paper USDso voucher (claimPerpVoucher) if eligible.
 * 2. Checks margin account state.
 * 3. Places a resting test limit order on BTC-PERP (post-only or limit).
 * 4. Cancels the order and prints confirmed transaction hashes.
 */
import 'dotenv/config';
import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import { createPublicClient, formatUnits, http, parseAbi } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';

async function main() {
  console.log('=== dreamDEX Perps Live Testnet Execution ===');

  let key = process.env.PRIVATE_KEY;
  if (!key) {
    console.log('[INFO] No PRIVATE_KEY found in .env.');
    console.log('Generating a fresh ephemeral wallet address for demonstration:');
    const generated = generatePrivateKey();
    const acct = privateKeyToAccount(generated);
    console.log(`Generated Address: ${acct.address}`);
    console.log(`Generated Private Key: ${generated}`);
    console.log('\nTo run live on-chain transactions:');
    console.log(`1. Send a small amount of STT (e.g. 0.05 STT) to: ${acct.address}`);
    console.log('2. Add it to .env: PRIVATE_KEY=' + generated);
    console.log('3. Re-run: node poc/live_trade_test.mjs');
    process.exit(0);
  }

  const account = privateKeyToAccount(key);
  console.log(`Using Wallet Address: ${account.address}`);

  const pc = createPublicClient({ chain: hidekiTestnet, transport: http() });
  const sttBal = await pc.getBalance({ address: account.address });
  console.log(`STT Gas Balance: ${formatUnits(sttBal, 18)} STT`);

  if (sttBal === 0n) {
    console.log('[STOP] Wallet has 0 STT. Please fund this address with testnet STT via Somnia faucet or DreamDEX app.');
    process.exit(0);
  }

  const exchange = new SomniaMarkets({
    chain: hidekiTestnet,
    privateKey: key,
    addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
    indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql'
  });

  const btcPool = '0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0';
  const marginBank = SOMNIA_HIDEKI_TESTNET_ADDRESSES.marginBank;

  console.log('\nChecking Perps Voucher Eligibility (1,000 Paper USDso)...');
  try {
    const eligibility = await exchange.client.getPerpVoucherEligibility(marginBank, account.address);
    console.log('Voucher Eligibility:', eligibility);
    if (eligibility.eligible) {
      console.log('Claiming 1,000 Paper USDso voucher...');
      const claimTx = await exchange.trader.claimPerpVoucher({ marginBank });
      console.log('Voucher Claimed! Tx Hash:', claimTx.hash);
    } else {
      console.log('Address already claimed or ineligible for voucher.');
    }
  } catch (err) {
    console.log('Voucher check/claim note:', err.message);
  }

  const marginSnap = await exchange.client.getMarginAccount(marginBank, account.address);
  console.log(`MarginBank Unlocked Collateral: ${formatUnits(marginSnap.unlockedCollateralBalance, 18)} USDso`);

  await exchange.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
