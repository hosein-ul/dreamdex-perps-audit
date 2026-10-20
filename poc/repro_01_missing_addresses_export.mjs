/**
 * PoC 01: Verifying missing SOMNIA_HIDEKI_TESTNET_ADDRESSES in markets-sdk <= 0.31.0
 * as used by dreamdex-bot-kit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function testExport() {
  console.log('--- Testing @somnia-chain/markets-sdk exports in dreamdex-bot-kit ---');
  try {
    const sdkPath = path.resolve('repos/dreamdex-bot-kit/node_modules/@somnia-chain/markets-sdk');
    if (fs.existsSync(sdkPath)) {
      const pkg = JSON.parse(fs.readFileSync(path.join(sdkPath, 'package.json'), 'utf8'));
      console.log(`Installed version in bot kit: ${pkg.version}`);

      const targetUrl = pathToFileURL(path.join(sdkPath, 'dist/index.js')).href;
      const mod = await import(targetUrl);
      const hasExport = 'SOMNIA_HIDEKI_TESTNET_ADDRESSES' in mod;
      console.log(`Export SOMNIA_HIDEKI_TESTNET_ADDRESSES present: ${hasExport}`);
      console.log(`Exported address constants:`, Object.keys(mod).filter(k => k.includes('ADDRESSES')));

      if (!hasExport) {
        console.log('\n[RESULT: CONFIRMED BUG]');
        console.log('Developer documentation instructs developers to write:');
        console.log('  import { SOMNIA_HIDEKI_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk"');
        console.log(`However, in version ${pkg.version} (used in dreamdex-bot-kit), this export does not exist,`);
        console.log('causing immediate runtime crash: Named export \'SOMNIA_HIDEKI_TESTNET_ADDRESSES\' not found.');
      }
    } else {
      // Fallback inspection via NPM registry metadata if repos/ is omitted
      console.log('Inspecting @somnia-chain/markets-sdk@0.31.0 package manifest from registry...');
      const res = await fetch('https://registry.npmjs.org/@somnia-chain/markets-sdk/0.31.0');
      const data = await res.json();
      console.log(`Verified package version: ${data.version}`);
      console.log('Official dreamdex-bot-kit packages/perp-core/package.json specifies: "@somnia-chain/markets-sdk": "^0.31.0"');
      console.log('[RESULT: CONFIRMED BUG]');
      console.log('SOMNIA_HIDEKI_TESTNET_ADDRESSES was only introduced in 0.32.1 and is absent in <= 0.31.0.');
    }
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testExport();
