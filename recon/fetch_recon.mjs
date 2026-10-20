import https from 'node:https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('--- Fetching DoraHacks bounty page ---');
  try {
    const dora = await fetchUrl('https://dorahacks.io/hackathon/dreamdex-perps-bounty/detail');
    console.log('Dora status:', dora.status);
    // Find all links
    const links = [...dora.data.matchAll(/href=["'](https?:\/\/[^"']+)["']/g)].map(m => m[1]);
    console.log('Found Dora links count:', links.length);
    console.log('Sample links:', [...new Set(links)].filter(l => l.includes('dream') || l.includes('somnia') || l.includes('github') || l.includes('doc')));
  } catch (e) {
    console.error('Dora err:', e.message);
  }

  console.log('--- Fetching dreamDEX docs ---');
  try {
    const docs = await fetchUrl('https://app.dreamdex.io/docs');
    console.log('Docs status:', docs.status);
    console.log('Docs snippet:', docs.data.slice(0, 1000));
  } catch (e) {
    console.error('Docs err:', e.message);
  }
}

main();
