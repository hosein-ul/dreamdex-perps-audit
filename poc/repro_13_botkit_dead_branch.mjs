// poc/repro_13_botkit_dead_branch.mjs
// 13 — In dreamdex-bot-kit strategies/perp-funding/src/index.ts the `held >= MAX_POSITION`
// guard is unreachable dead code: `held` is derived from `position` (line 101), and the
// guard only runs inside the `!position` branch (lines 126–129), where held === 0.
// Verifies the shipped source via raw GitHub fetch.
// Run twice: node poc/repro_13_botkit_dead_branch.mjs
const RAW = "https://raw.githubusercontent.com/somnia-chain/dreamdex-bot-kit/main/strategies/perp-funding/src/index.ts";
const src = await (await fetch(RAW)).text();
const lines = src.split("\n");

const heldIdx = lines.findIndex((l) => /const held = position \? position\.contracts \* liveAt : 0;/.test(l));
const guardIdx = lines.findIndex((l) => /held >= MAX_POSITION/.test(l));
const noPositionIdx = lines.findIndex((l) => /else if \(!position && worthHolding/.test(l));

console.log(`fetched strategies/perp-funding/src/index.ts (${lines.length} lines)`);
console.log(`line ${heldIdx + 1}: ${lines[heldIdx]?.trim() ?? "NOT FOUND"}`);
console.log(`line ${noPositionIdx + 1}: ${lines[noPositionIdx]?.trim() ?? "NOT FOUND"}`);
console.log(`line ${guardIdx + 1}: ${lines[guardIdx]?.trim() ?? "NOT FOUND"}`);

const inDeadBranch = heldIdx >= 0 && noPositionIdx >= 0 && guardIdx > noPositionIdx && guardIdx < noPositionIdx + 12;
const pass = heldIdx >= 0 && guardIdx >= 0 && inDeadBranch;
console.log(pass
  ? `REPRO CONFIRMED: the cap guard sits ${guardIdx - noPositionIdx} lines inside the \`!position\` branch, and \`held\` on that path is always 0 (0 >= MAX_POSITION is false for every documented default) — "at the position cap, not adding" is unreachable.`
  : "NOT REPRODUCED — source changed on main, re-check.");
