// Re-checks every flashcard answer with an independent computation.
// Run: node tests/check-cards.js
// Exit code 0 means every check passed.

"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = fs.readFileSync(path.join(__dirname, "..", "cards.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
const { CARDS, TOPICS } = sandbox.window;

// Exact fraction helpers.
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const F = (n, d = 1) => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
const mixed = (w, n, d) => F(w * d + n, d);
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const cmp = (a, b) => Math.sign(a.n * b.d - b.n * a.d);
const val = (a) => a.n / a.d;
const fracStr = (a) => `${a.n}/${a.d}`;
const mixedStr = (a) => {
  const w = Math.floor(a.n / a.d), r = a.n % a.d;
  return r === 0 ? String(w) : (w === 0 ? `${r}/${a.d}` : `${w} ${r}/${a.d}`);
};
const sign = (a, b) => [">", "=", "<"][1 - cmp(a, b)];
const order = (list, desc) => list.slice().sort((x, y) => (desc ? -1 : 1) * cmp(x, y)).map(fracStr).join(", ");
const factors = (n) => { const r = []; for (let i = 1; i <= n; i++) if (n % i === 0) r.push(i); return r.join(", "); };
const multiples = (n, k) => Array.from({ length: k }, (_, i) => n * (i + 1)).join(", ");
const thousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const peso = (n) => `₱${n}`;
const addMinutes = (h, m, dh, dm) => { const t = h * 60 + m + dh * 60 + dm; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
const elapsed = (h1, m1, h2, m2) => { const t = h2 * 60 + m2 - (h1 * 60 + m1); return `${Math.floor(t / 60)} hours ${t % 60} minutes`; };

// Expected text of the correct choice, after fraction markup is removed.
const expected = {
  "T1-1": () => String(8 + 4 * 3),
  "T1-4": () => String(24 / 6 * 2),
  "T1-5": () => String(100 - 20 + 15),
  "T1-6": () => String(7 * 8 - 48 / 6),
  "T1-7": () => String(9 + 27 / 3 * 2),
  "T1-8": () => String(45 - 15 / 3 + 2 * 4),
  "T1-9": () => `Division first. The answer is ${18 - 6 / 2}.`,
  "T1-10": () => `100 − 3 × 25 = ${peso(100 - 3 * 25)}`,
  "T1-11": () => `4 × 30 − 15 = ${4 * 30 - 15} eggs`,
  "T1-12": () => peso(500 - 2 * 52 - 75),

  "T2-2": () => `${Math.floor(450 / 100)} m ${450 % 100} cm`,
  "T2-3": () => `${thousands(2 * 1000)} m`,
  "T2-4": () => `${thousands(3 * 1000)} g`,
  "T2-6": () => `${Math.floor(2500 / 1000)} L ${2500 % 1000} mL`,
  "T2-7": () => `${3 * 60} seconds`,
  "T2-8": () => `${240 / 60} hours`,
  "T2-9": () => `${3 * 24} hours`,
  "T2-11": () => elapsed(7, 30, 11, 45),
  "T2-12": () => `${addMinutes(2, 40, 1, 35)} p.m.`,
  "T2-13": () => `${(2 * 1000) / 250} glasses`,

  "T3-1": () => (7 > 4 ? "Improper fraction" : "Proper fraction"),
  "T3-2": () => ["5/3", "1 2/3", "9/8", "3/5"].find((s) => /^\d+\/\d+$/.test(s) && +s.split("/")[0] < +s.split("/")[1]),
  "T3-3": () => mixedStr(F(9, 4)),
  "T3-4": () => fracStr(mixed(3, 2, 5)),
  "T3-6": () => (val(F(5, 4)) > 1 && val(F(5, 4)) === 1 + 1 / 4 ? "Between 1 and 2, one mark after 1" : "?"),

  "T4-1": () => fracStr(add(F(2, 7), F(3, 7))),
  "T4-3": () => mixedStr(add(mixed(1, 2, 5), mixed(2, 1, 5))),
  "T4-4": () => { const r = sub(mixed(2, 3, 8), F(1, 8)); return `2 ${(r.n * 8 / r.d) - 16}/8 = ${mixedStr(r)}`; },
  "T4-6": () => mixedStr(sub(F(3), F(1, 4))),
  "T4-7": () => fracStr(sub(F(1), add(F(3, 8), F(2, 8)))),

  "T5-1": () => fracStr(cmp(F(1, 3), F(1, 5)) > 0 ? F(1, 3) : F(1, 5)),
  "T5-2": () => sign(F(2, 3), F(3, 4)),
  "T5-3": () => sign(F(1, 2), { n: 3, d: 6 }),
  "T5-5": () => sign(F(3, 5), F(7, 10)),
  "T5-6": () => order([F(1, 2), F(1, 4), F(1, 8)], false),
  "T5-7": () => order([F(2, 3), F(1, 2), F(5, 6)], true),
  "T5-8": () => order([F(3, 4), F(2, 5), F(7, 10)], false),
  "T5-9": () => (cmp(F(3, 8), F(1, 4)) > 0 ? "Carlo" : "Joy"),
  "T5-10": () => (cmp(F(3, 4), F(5, 8)) > 0 ? "Lea" : "Jun"),
  "T5-11": () => `${(2 / 4) * 8} parts`,

  "T6-1": () => String((1 * 12) / 3),
  "T6-2": () => String(5 * (6 / 2)),
  "T6-3": () => ["2/4", "4/6", "3/6", "5/10"].find((s) => { const [n, d] = s.split("/").map(Number); return n * 2 !== d; }),
  "T6-4": () => multiples(6, 5),
  "T6-6": () => String([28, 42, 49, 36].find((n) => n % 9 === 0)),
  "T6-7": () => factors(12),
  "T6-8": () => factors(30),
  "T6-10": () => fracStr(F(6, 8)),
  "T6-11": () => fracStr(F(12, 18)),
  "T6-12": () => fracStr(F(8, 20)),
};

const strip = (s) => s.replace(/\{([^}]*)\}/g, "$1");
const fails = [];
const fail = (id, msg) => fails.push(`${id}: ${msg}`);

const wantCounts = { T1: 10, T2: 10, T3: 5, T4: 5, T5: 10, T6: 10 };
const topicIds = new Set(TOPICS.map((t) => t.id));
const seen = new Set();
const counts = {};

if (CARDS.length !== 50) fail("deck", `expected 50 cards, found ${CARDS.length}`);

for (const c of CARDS) {
  if (seen.has(c.id)) fail(c.id, "duplicate id");
  seen.add(c.id);
  if (!topicIds.has(c.topic)) fail(c.id, `unknown topic ${c.topic}`);
  if (!c.id.startsWith(c.topic + "-")) fail(c.id, `id does not match topic ${c.topic}`);
  counts[c.topic] = (counts[c.topic] || 0) + 1;
  for (const k of ["q", "explain", "mistake"]) if (!c[k] || typeof c[k] !== "string") fail(c.id, `missing ${k}`);
  if (!Array.isArray(c.choices) || c.choices.length < 3) fail(c.id, "needs at least 3 choices");
  if (new Set(c.choices.map(strip)).size !== c.choices.length) fail(c.id, "duplicate choices");
  if (!Number.isInteger(c.answer) || c.answer < 0 || c.answer >= c.choices.length) { fail(c.id, "answer index out of range"); continue; }
  for (const s of [c.q, c.explain, c.mistake, ...c.choices]) {
    const bad = (s.match(/\{[^}]*\}/g) || []).filter((m) => !/^\{(\d+ )?[\d?]+\/[\d?]+\}$/.test(m));
    if (bad.length) fail(c.id, `bad fraction markup ${bad.join(" ")}`);
  }
  const fn = expected[c.id];
  if (!fn) { fail(c.id, "no independent check"); continue; }
  const want = fn();
  const got = strip(c.choices[c.answer]);
  if (got !== want) fail(c.id, `marked answer "${got}" but computed "${want}"`);
}

for (const [t, n] of Object.entries(wantCounts)) if (counts[t] !== n) fail(t, `expected ${n} cards, found ${counts[t] || 0}`);
for (const id of Object.keys(expected)) if (!seen.has(id)) fail(id, "check exists but card is missing");

const positions = new Set(CARDS.map((c) => c.answer));
if (positions.size < 3) fail("deck", "correct answers sit in too few positions");

if (fails.length) {
  console.log(`FAIL: ${fails.length} problem(s)`);
  for (const f of fails) console.log("  " + f);
  process.exit(1);
}
console.log(`OK: ${CARDS.length} cards checked, ${JSON.stringify(counts)}`);
