// poc/repro_11_two_sdk_versions.mjs
// 11 — One `npm install` of dreamdex-bot-kit ships two versions of @somnia-chain/markets-sdk:
//      0.30.0 hoisted at the root (ec-core path) and 0.31.0 nested inside packages/perp-core.
//      The perp money path (receipt/error-table decoding) resolves only the nested one.
// Verifies via the repo's committed package-lock.json on GitHub (no npm install needed);
// locally reproducible as-is with `npm ls @somnia-chain/markets-sdk` after install.
// Run twice: node poc/repro_11_two_sdk_versions.mjs
const RAW = "https://raw.githubusercontent.com/somnia-chain/dreamdex-bot-kit/main/package-lock.json";
const lock = await (await fetch(RAW)).text();

const market = "@somnia-chain/markets-sdk";
const re = new RegExp(`"node_modules/${market.replace(/\//g, "\\/")}":\\s*\\{[^}]*?"version":\\s*"([^"]+)"`, "s");
const reNested = new RegExp(`"packages\\/perp-core\\/node_modules\\/${market.replace(/\//g, "\\/")}":\\s*\\{[^}]*?"version":\\s*"([^"]+)"`, "s");

const hoisted = lock.match(re)?.[1];
const nested = lock.match(reNested)?.[1];

console.log(`resolved (hoisted) node_modules/${market} → ${hoisted ?? "not found"}`);
console.log(`resolved (perp-core) packages/perp-core/node_modules/${market} → ${nested ?? "not found"}`);

const pass = hoisted && nested && hoisted !== nested;
console.log(pass
  ? `REPRO CONFIRMED: one install ships ${hoisted} AND ${nested}; perp-core decodes receipts against ${nested} while every root-level import sees ${hoisted}.`
  : "NOT REPRODUCED — lockfile changed on main, re-check.");
