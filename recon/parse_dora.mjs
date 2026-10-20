import fs from 'node:fs';

const html = fs.readFileSync('C:/Users/hashe/.gemini/antigravity/brain/78421a7a-c381-4679-97e2-6f361dc5339b/.system_generated/steps/73/output.txt', 'utf8');

const marker = 'id="dreamdex-perps-builder-bounty"';
const idx = html.indexOf(marker);
if (idx === -1) {
  console.log('Marker not found');
} else {
  const content = html.slice(idx, idx + 25000);
  // Extract all links
  const links = [...content.matchAll(/href=["']([^"']+)["'][^>]*>([^<]*)/g)].map(m => ({ url: m[1], text: m[2].trim() }));
  console.log('--- LINKS IN BOUNTY DESCRIPTION ---');
  for (const l of links) {
    console.log(`${l.text} -> ${l.url}`);
  }
  console.log('\n--- TEXT CONTENT ---');
  // Strip tags and decode entities
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
  console.log(clean.slice(0, 8000));
}
