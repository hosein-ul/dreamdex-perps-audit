import { createPublicClient, http, parseAbi } from 'viem';

const chain = {
  id: 50383,
  name: 'somnia-hideki',
  nativeCurrency: { name: 'Somnia Test Token', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.hideki2.infra.testnet.somnia.network'] } }
};

const pc = createPublicClient({ chain, transport: http() });

const MARGIN_BANK = '0x478769E1177C0773c43A593DCCc4Ad15F15F1394';
const PERP_FACTORY = '0xE631fAEE547baeE07353E290f0562ea67d856560';

const MARGIN_BANK_ABI = parseAbi([
  'function collateral() view returns (address)',
  'function factory() view returns (address)',
  'function liquidationEngine() view returns (address)',
  'function insuranceFund() view returns (address)',
  'function voucherDistributor() view returns (address)',
  'function operatorRegistry() view returns (address)',
  'function isPoolRegistered(address) view returns (bool)'
]);

async function main() {
  console.log('Querying MarginBank:', MARGIN_BANK);
  try {
    const col = await pc.readContract({ address: MARGIN_BANK, abi: MARGIN_BANK_ABI, functionName: 'collateral' }).catch(e => e.message);
    const fac = await pc.readContract({ address: MARGIN_BANK, abi: MARGIN_BANK_ABI, functionName: 'factory' }).catch(e => e.message);
    const liq = await pc.readContract({ address: MARGIN_BANK, abi: MARGIN_BANK_ABI, functionName: 'liquidationEngine' }).catch(e => e.message);
    const ins = await pc.readContract({ address: MARGIN_BANK, abi: MARGIN_BANK_ABI, functionName: 'insuranceFund' }).catch(e => e.message);
    const vch = await pc.readContract({ address: MARGIN_BANK, abi: MARGIN_BANK_ABI, functionName: 'voucherDistributor' }).catch(e => e.message);
    const op = await pc.readContract({ address: MARGIN_BANK, abi: MARGIN_BANK_ABI, functionName: 'operatorRegistry' }).catch(e => e.message);
    
    console.log('--- MARGIN BANK ON-CHAIN READS ---');
    console.log('collateral:', col);
    console.log('factory:', fac);
    console.log('liquidationEngine:', liq);
    console.log('insuranceFund:', ins);
    console.log('voucherDistributor:', vch);
    console.log('operatorRegistry:', op);
  } catch (err) {
    console.error('Error querying MarginBank:', err);
  }
}

main();
