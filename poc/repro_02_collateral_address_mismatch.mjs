/**
 * PoC 02: Demonstrating that SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral in markets-sdk 0.32.1
 * points to the wrong token (tUSDC, 6 decimals) instead of the actual perps collateral (USDso, 18 decimals).
 */
import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import { createPublicClient, http, parseAbi } from 'viem';

const chain = {
  id: 50383,
  name: 'somnia-hideki',
  nativeCurrency: { name: 'Somnia Test Token', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.hideki2.infra.testnet.somnia.network'] } }
};

const pc = createPublicClient({ chain, transport: http() });

const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
]);

async function main() {
  console.log('--- PoC 02: Verifying SDK Collateral Address vs On-Chain MarginBank Collateral ---');
  
  const sdkCollateral = SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral;
  console.log(`SDK Bundled Address (SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral): ${sdkCollateral}`);

  const exchange = new SomniaMarkets({
    chain: hidekiTestnet,
    indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql',
    addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
  });

  const sysConfig = await exchange.client.getPerpSystemConfig(SOMNIA_HIDEKI_TESTNET_ADDRESSES.marginBank);
  const actualCollateral = sysConfig.collateralToken;
  console.log(`On-Chain MarginBank Collateral (getPerpSystemConfig.collateralToken): ${actualCollateral}`);

  // Query metadata of SDK collateral
  const sdkName = await pc.readContract({ address: sdkCollateral, abi: ERC20_ABI, functionName: 'name' });
  const sdkSymbol = await pc.readContract({ address: sdkCollateral, abi: ERC20_ABI, functionName: 'symbol' });
  const sdkDecimals = await pc.readContract({ address: sdkCollateral, abi: ERC20_ABI, functionName: 'decimals' });

  // Query metadata of actual on-chain collateral
  const actualName = await pc.readContract({ address: actualCollateral, abi: ERC20_ABI, functionName: 'name' });
  const actualSymbol = await pc.readContract({ address: actualCollateral, abi: ERC20_ABI, functionName: 'symbol' });
  const actualDecimals = await pc.readContract({ address: actualCollateral, abi: ERC20_ABI, functionName: 'decimals' });

  console.log('\n--- TOKEN DETAILS COMPARISON ---');
  console.log(`Bundled SDK Token (${sdkCollateral}):`);
  console.log(`  Name: ${sdkName}, Symbol: ${sdkSymbol}, Decimals: ${sdkDecimals}`);
  console.log(`Actual On-Chain MarginBank Token (${actualCollateral}):`);
  console.log(`  Name: ${actualName}, Symbol: ${actualSymbol}, Decimals: ${actualDecimals}`);

  const mismatch = sdkCollateral.toLowerCase() !== actualCollateral.toLowerCase();
  console.log(`\nAddress Mismatch Detected: ${mismatch}`);

  if (mismatch) {
    console.log('\n[CRITICAL DX / ACCOUNTING IMPACT]');
    console.log('1. Any integration relying on SOMNIA_HIDEKI_TESTNET_ADDRESSES.collateral will approve');
    console.log('   spending for Test USDC (6 decimals) instead of USDso (18 decimals).');
    console.log('2. Deposits into MarginBank will revert because MarginBank transfers the actual collateral token (USDso).');
    console.log('3. Decimal scaling math is corrupted by a 10^12 factor (6 decimals vs 18 decimals).');
  }

  await exchange.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
