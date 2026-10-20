// poc/repro_09_botkit_quickstart_coercion.mjs
// 09 — dreamdex-bot-kit quickstart silently coerces --network hideki → testnet and
// drops --strategy perp-starter → starter (spot), writing a spot/Shannon .env.
// Verifies the two code paths in the shipped scripts/quickstart.mjs via raw GitHub fetch.
// Terminal transcripts of two live runs are pasted in feedback/09-*.md and NOTES.md.
// Run twice: node poc/repro_09_botkit_quickstart_coercion.mjs
const RAW = "https://raw.githubusercontent.com/somnia-chain/dreamdex-bot-kit/main/scripts/quickstart.mjs";
const src = await (await fetch(RAW)).text();

// Path 1: network ternary — anything not exactly "mainnet" becomes "testnet" (Shannon 50312).
const ternaryRegex = /===\s*"mainnet"\s*\?\s*"mainnet"\s*:\s*"testnet"/;
const ternary = ternaryRegex.test(src);
const ternaryLine = src.split("\n").findIndex((l) => ternaryRegex.test(l)) + 1;

// Path 2: STRATEGIES map has no perp entry at all.
const perpMentions = (src.match(/perp/gi) || []).length;

console.log(`fetched scripts/quickstart.mjs (${src.length} bytes)`);
console.log(`network ternary 'mainnet ? mainnet : testnet' present: ${ternary} (line ~${ternaryLine || "?"})`);
console.log(`occurrences of "perp" anywhere in quickstart.mjs: ${perpMentions} (0 = perp-starter cannot be scaffolded)`);

const pass = ternary && perpMentions === 0;
console.log(pass
  ? 'REPRO CONFIRMED: `--network hideki` is coerced to Shannon "testnet" and `--strategy perp-starter` falls back to the spot "starter" — both silently.'
  : "NOT REPRODUCED — quickstart.mjs changed on main, re-check.");
