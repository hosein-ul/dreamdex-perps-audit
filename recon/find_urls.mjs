import fs from 'node:fs';

const html = fs.readFileSync('recon/dora_page.html', 'utf8');
console.log('HTML length:', html.length);

const marker = 'id="dreamdex-perps-builder-bounty"';
const idx = html.indexOf(marker);
console.log('Marker index:', idx);

if (idx !== -1) {
  const content = html.slice(idx, idx + 40000);
  const links = [...content.matchAll(/href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)].map(m => ({
    url: m[1],
    text: m[2].replace(/<[^>]+>/g, '').trim()
  }));
  console.log('\n--- EXTRACTED LINKS ---');
  for (const l of links) {
    console.log(`[${l.text}] -> ${l.url}`);
  }

  console.log('\n--- FULL TEXT CONTENT ---');
  const clean = content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\n{3,}/g, '\n\n');
  console.log(clean.slice(0, 15000));
}
