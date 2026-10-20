/**
 * PoC 05: Demonstrating mismatch between documented PerpPools (15 markets)
 * in Somnia Markets "Raw smart-contract integration" guide (contracts.md) vs live deployment (21 markets).
 */
import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import { createPublicClient, http, parseAbi } from 'viem';

// The 15 markets explicitly listed in somnia-markets/contracts.md (Hideki testnet section)
const DOCUMENTED_MARKETS = [
  { base: 'BTC', pool: '0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0' },
  { base: 'ETH', pool: '0xD6Cb1DD58580B84D76068aC21594219ce03aeddf' },
  { base: 'SOL', pool: '0xB483ec1fb34996638677c20ab087b16F1896FA53' },
  { base: 'HYPE', pool: '0x63B47eD4A7DE0FdE659b0d82441dD74828b7297A' },
  { base: 'XRP', pool: '0x7058579F3248559963f79AdB937c6De9f953E060' },
  { base: 'DOGE', pool: '0xC410012e39765Cd5f772e84BAcB19554AEC040Df' },
  { base: 'BNB', pool: '0x3D2A99fE1e2BdEaA25024515A2D2202DAF9531aD' },
  { base: 'ADA', pool: '0x34fa62909f77699a7a6278D992F72Ff31c7a619D' },
  { base: 'SUI', pool: '0x1Be21287cfB865a7c462Ff3c4f275E70BcccefE4' },
  { base: 'LINK', pool: '0xf71b619450baFe953F47b9b556416A3A67b443b5' },
  { base: 'AVAX', pool: '0xde9762B6b441133D1314C68864ae4e63A6eE45C7' },
  { base: 'XLM', pool: '0x74b05B9B8c8F180b53b7891018F3B254B3E658C9' },
  { base: 'NEAR', pool: '0x1cD15ae8bFf0FE0a7F49233BE8b90734775bA454' },
  { base: 'WLD', pool: '0x0F464d57c1FD839E4d87A408BBcCDAb8f77E6394' },
  { base: 'TAO', pool: '0xD9b6A347A3Ae9FD6BA21179D3343F2c8A922F697' },
];

async function main() {
  console.log('--- PoC 05: Verifying Documented Markets vs Live On-Chain Factory ---');

  const pc = createPublicClient({ chain: hidekiTestnet, transport: http() });
  const factory = SOMNIA_HIDEKI_TESTNET_ADDRESSES.perpPoolFactory;

  console.log(`PerpPoolFactory: ${factory}`);
  console.log(`Documented markets in contracts.md: ${DOCUMENTED_MARKETS.length}`);

  // Query on-chain factory directly
  const onchainPools = await pc.readContract({
    address: factory,
    abi: parseAbi(['function getPerpPools() view returns (address[])']),
    functionName: 'getPerpPools'
  });

  console.log(`Live on-chain getPerpPools() count: ${onchainPools.length}`);

  // Load markets via SDK exchange to get canonical base symbols
  const exchange = new SomniaMarkets({
    chain: hidekiTestnet,
    indexerUrl: 'https://hideki-dev.smk.somnia.host/v1/graphql',
    addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
  });

  const markets = await exchange.loadMarkets(true);
  const poolToSymbol = new Map();
  for (const m of Object.values(markets)) {
    if (m.type === 'swap' && m.info?.poolAddress) {
      poolToSymbol.set(m.info.poolAddress.toLowerCase(), m.symbol);
    }
  }

  const documentedAddresses = new Set(DOCUMENTED_MARKETS.map(m => m.pool.toLowerCase()));
  const missingFromDocs = [];

  for (const pool of onchainPools) {
    if (!documentedAddresses.has(pool.toLowerCase())) {
      const symbol = poolToSymbol.get(pool.toLowerCase()) || 'UNKNOWN';
      missingFromDocs.push({ pool, symbol });
    }
  }

  console.log('\n--- UNDOCUMENTED MARKETS DETECTED ---');
  console.log(`Total missing from documentation: ${missingFromDocs.length}`);
  missingFromDocs.forEach(m => {
    console.log(`  - Symbol: ${m.symbol}, Address: ${m.pool}`);
  });

  if (missingFromDocs.length > 0) {
    console.log('\n[RESULT: CONFIRMED DOCUMENTATION DEFECT]');
    console.log('Developers integrating raw smart contracts via contracts.md will miss 6 active perp pools');
    console.log('leading to incomplete order books and missing trading pairs.');
  }

  await exchange.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
