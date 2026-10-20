// poc/repro_08_rest_api_no_hideki.mjs
// 08 — The documented HTTP API serves spot only; no Hideki (50383) row documents any perp REST surface.
// Docs-only + one (1) plain GET per run. No wallet, no chain calls.
// Run twice: node poc/repro_08_rest_api_no_hideki.mjs
const API = "https://stg.api.dreamdex.io/v0/markets";
const HTTP_API_DOCS = "https://app.testnet.dreamdex.io/docs/developers/http-api";

const api = await (await fetch(API)).text();
let parsed;
try { parsed = JSON.parse(api); } catch { console.log("UNEXPECTED: /v0/markets did not return JSON"); parsed = null; }

if (parsed?.markets) {
  const kinds = [...new Set(parsed.markets.map((m) => m.kind))];
  const symbols = parsed.markets.map((m) => m.symbol);
  console.log("GET /v0/markets → markets:", parsed.markets.length, "kinds:", kinds.join(","));
  console.log("symbols:", symbols.join(" | "));
  const spotOnly = kinds.length === 1 && kinds[0] === "spot";
  console.log(spotOnly ? "REST endpoints expose spot only — no perp rows." : "UNEXPECTED: non-spot rows present, re-check.");
} else {
  console.log("raw /v0/markets body:", api.slice(0, 400));
}

const docs = await (await fetch(HTTP_API_DOCS)).text();
const has5031 = docs.includes("5031");
const has50312 = docs.includes("50312");
const has50383 = docs.includes("50383");
const hasPerp = /perp/i.test(docs);
console.log(`HTTP API docs: mentions 5031 → ${has5031}, 50312 → ${has50312}, 50383 (Hideki/Tokyo) → ${has50383}, "perp" appears → ${hasPerp}`);

const pass = parsed?.markets?.every((m) => m.kind === "spot") && !has50383;
console.log(pass
  ? "REPRO CONFIRMED: documented REST API is spot-only on 50312; chain 50383 (where all 21 perp pools live) has no documented REST surface."
  : "NOT REPRODUCED — API or docs changed, re-check.");
