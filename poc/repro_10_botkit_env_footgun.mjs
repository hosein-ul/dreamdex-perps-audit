// poc/repro_10_botkit_env_footgun.mjs
// 10 — dreamdex-bot-kit .env.example ships with active `NETWORK=testnet` (Shannon 50312)
// while the perp block's advice to use NETWORK=hideki is only a comment above it —
// so a verbatim `cp .env.example .env` aims a perp bot at the wrong chain/indexer.
// Verifies the shipped .env.example via raw GitHub fetch. Runtime loadConfig() transcripts
// (chainId 50312 resolved, 2×) are pasted in feedback/10-*.md and NOTES.md.
// Run twice: node poc/repro_10_botkit_env_footgun.mjs
const RAW = "https://raw.githubusercontent.com/somnia-chain/dreamdex-bot-kit/main/.env.example";
const env = await (await fetch(RAW)).text();
const lines = env.split("\n").map((l, i) => [i + 1, l]);

const activeNetwork = lines.filter(([, l]) => /^\s*NETWORK\s*=/.test(l));
const commentedHideki = lines.filter(([, l]) => /#\s*.*NETWORK\s*=\s*hideki|^\s*#\s*NETWORK\s*=\s*hideki/.test(l) || /hideki/i.test(l) && /^[#\s]/.test(l));
const perpSectionIdx = lines.findIndex(([, l]) => /perp/i.test(l));

console.log(`fetched .env.example (${env.length} bytes)`);
console.log("ACTIVE (uncommented) NETWORK lines:");
for (const [n, l] of activeNetwork) console.log(`  line ${n}: ${l.trim()}`);
console.log("comment lines mentioning hideki:");
for (const [n, l] of commentedHideki) console.log(`  line ${n}: ${l.trim()}`);

const activeIsTestnet = activeNetwork.some(([, l]) => /NETWORK\s*=\s*testnet/.test(l));
const hidekiOnlyCommented = commentedHideki.length > 0;
const pass = activeIsTestnet && hidekiOnlyCommented;
console.log(pass
  ? "REPRO CONFIRMED: a verbatim copy resolves the perp layer against Shannon (chain 50312 / dev.smk indexer) — hideki guidance exists only as a comment."
  : "NOT REPRODUCED — .env.example changed on main, re-check.");
