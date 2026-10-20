import fs from 'node:fs';

const pages = [
  'developers-perps-testnet',
  'trading-perps-testnet',
  'link-a-bot',
  'sdk-markets',
  'dreambot-builder'
];

for (const p of pages) {
  const html = fs.readFileSync(`recon/docs/${p}.html`, 'utf8');
  
  // Extract Next.js or React page text / headings / pre / code
  // Look for main content or article
  const clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (m, code) => '\n```\n' + code.replace(/<[^>]+>/g, '') + '\n```\n')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<\/h1>/gi, '\n# \n\n')
    .replace(/<\/h2>/gi, '\n## \n\n')
    .replace(/<\/h3>/gi, '\n### \n\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(`recon/docs/${p}.txt`, clean);
  console.log(`Wrote recon/docs/${p}.txt (${clean.length} chars)`);
}
