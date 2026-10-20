import fs from 'node:fs';

const pages = [
  'markets/somnia-markets/typescript/perps',
  'markets/somnia-markets/contracts',
  'markets/somnia-markets/typescript/reference/errors',
  'markets/somnia-markets/typescript/reference/networks-and-endpoints',
  'markets/somnia-markets/typescript/reference/units-and-scales',
  'markets/somnia-markets/typescript/how-to/handle-errors'
];

async function main() {
  for (const p of pages) {
    const slug = p.replace(/\//g, '_');
    // Try .md first, if fails try without .md
    let url = `https://somnia-platform-docs.vercel.app/${p}.md`;
    console.log(`Fetching ${url}...`);
    let res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.status === 404) {
      url = `https://somnia-platform-docs.vercel.app/${p}`;
      res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    }
    const text = await res.text();
    fs.writeFileSync(`recon/docs/${slug}.txt`, text);
    console.log(`Saved ${slug}.txt (${text.length} bytes, status ${res.status})`);
  }
}

main();
