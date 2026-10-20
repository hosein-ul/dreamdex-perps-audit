import fs from 'node:fs';

const pages = [
  'markets_somnia-markets_typescript_perps',
  'markets_somnia-markets_contracts',
  'markets_somnia-markets_typescript_reference_errors',
  'markets_somnia-markets_typescript_reference_networks-and-endpoints',
  'markets_somnia-markets_typescript_reference_units-and-scales',
  'markets_somnia-markets_typescript_how-to_handle-errors'
];

for (const p of pages) {
  const html = fs.readFileSync(`recon/docs/${p}.txt`, 'utf8');
  
  // Extract article or prose-docs
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const src = articleMatch ? articleMatch[1] : html;
  
  const clean = src
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (m, code) => '\n```\n' + code.replace(/<[^>]+>/g, '') + '\n```\n')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n\n')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (m, q) => '\n> ' + q.replace(/<[^>]+>/g, '').trim() + '\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(`recon/docs/${p}.clean.md`, clean);
  console.log(`Wrote recon/docs/${p}.clean.md (${clean.length} chars)`);
}
