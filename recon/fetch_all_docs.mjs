import fs from 'node:fs';

const pages = [
  { name: 'developers-perps-testnet', url: 'https://app.testnet.dreamdex.io/docs/developers/perps-testnet' },
  { name: 'trading-perps-testnet', url: 'https://app.testnet.dreamdex.io/docs/trading/perps-testnet' },
  { name: 'link-a-bot', url: 'https://app.testnet.dreamdex.io/docs/trading/common/link-a-bot' },
  { name: 'sdk-markets', url: 'https://somnia-platform-docs.vercel.app/markets/somnia-markets' },
  { name: 'dreambot-builder', url: 'https://app.testnet.dreamdex.io/dreambot-builder' },
];

async function main() {
  for (const p of pages) {
    console.log(`Fetching ${p.name} from ${p.url}...`);
    try {
      const res = await fetch(p.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await res.text();
      fs.writeFileSync(`recon/docs/${p.name}.html`, text);
      console.log(`Saved ${p.name}.html (${text.length} bytes, status ${res.status})`);
    } catch (e) {
      console.error(`Failed ${p.name}: ${e.message}`);
    }
  }
}

main();
