// Re-checks every number variant of every card with fresh numbers.
// For each parameter set, it reads the numbers back from the question text,
// computes the answer independently, and compares it to the marked choice.
// It also checks that no wrong choice has the value of the right answer,
// and that each sum in the explanation and the mistake is true.
// Run: node tests/check-variants.js
// Exit code 0 means every check passed.

"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {} };
for (const f of ["cards.js", "variants.js"]) vm.runInNewContext(fs.readFileSync(path.join(root, f), "utf8"), sandbox);
const { CARDS, VARIANTS } = sandbox.window;

// ---------- exact fractions ----------
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const F = (n, d = 1) => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n * b.d === b.n * a.d;
const fracStr = (a) => `${a.n}/${a.d}`;
const mixedStr = (a) => {
  const w = Math.floor(a.n / a.d), r = a.n % a.d;
  return r === 0 ? String(w) : (w === 0 ? `${r}/${a.d}` : `${w} ${r}/${a.d}`);
};
const thousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const strip = (s) => s.replace(/\{([^}]*)\}/g, "$1");

// A number ("2 000") or a fraction in markup ("{2 1/4}", "{3/8}") as an exact value.
const NUM = String.raw`\d{1,3}(?: \d{3})+(?!\d)|\d+`;
const FRAC = String.raw`\{\d+(?: \d+)?\/\d+\}`;
const TERM = `(?:${FRAC}|${NUM})`;
function value(t) {
  const m = /^\{(?:(\d+) )?(\d+)\/(\d+)\}$/.exec(t);
  if (m) return add(F(+(m[1] || 0)), F(+m[2], +m[3]));
  return F(Number(t.replace(/ /g, "")));
}

// Evaluate "a op b op c" with × and ÷ before + and −, left to right.
// Returns null when a ÷ does not give a whole number for whole-number input.
function evaluate(expr) {
  const tokens = expr.match(new RegExp(`${TERM}|[×÷+\u2212]`, "g"));
  const vals = [value(tokens[0])], ops = [];
  let exact = true;
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i], v = value(tokens[i + 1]);
    if (op === "×" || op === "÷") {
      const left = vals.pop();
      const r = op === "×" ? mul(left, v) : div(left, v);
      if (op === "÷" && left.d === 1 && v.d === 1 && r.d !== 1) exact = false;
      vals.push(r);
    } else { ops.push(op); vals.push(v); }
  }
  let r = vals[0];
  ops.forEach((op, i) => { r = op === "+" ? add(r, vals[i + 1]) : sub(r, vals[i + 1]); });
  return exact ? r : null;
}

// Every "x op y ... = z" in a text must be true. "9 ÷ 4 = 2 remainder 1" is not a sum to check.
const SUM = new RegExp(`(?<![\\d:/₱{])(${TERM}(?: [×÷+\u2212] ${TERM})*) = (${TERM})(?![\\d/:]| remainder)`, "g");
function checkSums(text) {
  const bad = [];
  for (const m of text.matchAll(SUM)) {
    const lhs = evaluate(m[1]);
    if (!lhs || !eq(lhs, value(m[2]))) bad.push(m[0]);
  }
  return bad;
}

// Unit sizes in a base unit per measure.
const UNITS = { mm: 1, cm: 10, m: 1000, km: 1e6, g: 1, kg: 1000, mL: 1, L: 1000, seconds: 1, minutes: 60, hours: 3600, days: 86400 };
function amount(s) {
  const parts = [...s.matchAll(new RegExp(`(${NUM}) (km|cm|mm|kg|mL|m|g|L|seconds|minutes|hours|days)\\b`, "g"))];
  if (!parts.length) return null;
  return parts.reduce((t, m) => t + Number(m[1].replace(/ /g, "")) * UNITS[m[2]], 0);
}
const lhs = (q) => q.split(" = ")[0];

// Expected text of the right choice, read only from the question text.
// Each entry also gives the value of a choice, to compare wrong choices to the right one.
const mdas = {
  expect: (q) => { const r = evaluate(lhs(q)); return r && r.d === 1 && r.n > 0 ? String(r.n) : null; },
  value: (s) => F(Number(s))
};
const convert = (format) => ({
  expect: (q) => {
    const n = amount(lhs(q));
    return format(n, q);
  },
  value: (s) => F(amount(s))
});
const units = (q) => q.split(" = ")[1].match(/[A-Za-z]+/g);
const split = (n, q) => { const [big, small] = units(q); const s = UNITS[big] / UNITS[small]; return `${Math.floor(n / UNITS[big])} ${big} ${(n % UNITS[big]) / UNITS[small]} ${small}`; };
const whole = (n, q) => { const [u] = units(q); return Number.isInteger(n / UNITS[u]) ? `${thousands(n / UNITS[u])} ${u}` : null; };
const fracs = (q) => [...q.matchAll(new RegExp(FRAC, "g"))].map((m) => m[0]);
const firstValue = (s) => value(s.match(new RegExp(FRAC))[0]);
// Denominator as written, before any simplifying.
const rawDen = (t) => Number(/\/(\d+)\}$/.exec(t)[1]);

const checks = {
  "T1-1": mdas, "T1-4": mdas, "T1-5": mdas, "T1-6": mdas, "T1-7": mdas, "T1-8": mdas,
  "T2-2": convert(split), "T2-6": convert(split),
  "T2-3": convert(whole), "T2-4": convert(whole), "T2-7": convert(whole), "T2-8": convert(whole), "T2-9": convert(whole),
  "T4-1": { expect: (q) => { const r = evaluate(lhs(q)); const d = rawDen(fracs(q)[0]); return d % r.d === 0 ? `${r.n * d / r.d}/${d}` : null; }, value: firstValue },
  "T4-3": { expect: (q) => mixedStr(evaluate(lhs(q))), value: firstValue },
  "T4-4": {
    // The card shows the unsimplified answer, then the simplest form.
    expect: (q) => {
      const [a] = fracs(q).map(value), d = rawDen(fracs(q)[1]), r = evaluate(lhs(q));
      const w = Math.floor(a.n / a.d), top = r.n * d / r.d - w * d;
      return r.d !== d ? `${w} ${top}/${d} = ${mixedStr(r)}` : null;
    },
    value: firstValue
  },
  "T4-6": { expect: (q) => mixedStr(evaluate(lhs(q))), value: firstValue },
  "T6-1": {
    expect: (q) => { const m = /^\{(\d+)\/(\d+)\} = \{\?\/(\d+)\}$/.exec(q); const top = +m[1] * +m[3] / +m[2]; return Number.isInteger(top) ? String(top) : null; },
    value: (s) => F(Number(s))
  },
  "T6-2": {
    expect: (q) => { const m = /^\{(\d+)\/(\d+)\} = \{(\d+)\/\?\}$/.exec(q); const bot = +m[3] * +m[2] / +m[1]; return Number.isInteger(bot) ? String(bot) : null; },
    value: (s) => F(Number(s))
  }
};

const MIN_VARIANTS = 10;
const fails = [];
const fail = (id, key, msg) => fails.push(`${id} [${key}]: ${msg}`);
const byId = Object.fromEntries(CARDS.map((c) => [c.id, c]));
let total = 0;

for (const id of Object.keys(checks)) if (!VARIANTS.has(id)) fail(id, "-", "check exists but no generator");

for (const id of VARIANTS.ids()) {
  const card = byId[id];
  const chk = checks[id];
  if (!card) { fail(id, "-", "generator has no card in cards.js"); continue; }
  if (!chk) { fail(id, "-", "no independent check"); continue; }
  const space = VARIANTS.space(card);
  if (space.length < MIN_VARIANTS) fail(id, "-", `only ${space.length} variants, want at least ${MIN_VARIANTS}`);

  // The base parameter set must give the reviewed card in cards.js.
  const base = VARIANTS.base(id);
  const baseCard = VARIANTS.make(card, base);
  if (!space.some((p) => VARIANTS.make(card, p).variant === baseCard.variant)) fail(id, baseCard.variant, "base parameter set is not in the variant space");
  if (baseCard.q !== card.q) fail(id, baseCard.variant, `base question "${baseCard.q}" differs from cards.js "${card.q}"`);
  if (baseCard.choices[baseCard.answer] !== card.choices[card.answer]) fail(id, baseCard.variant, `base answer "${baseCard.choices[baseCard.answer]}" differs from cards.js "${card.choices[card.answer]}"`);

  const questions = new Set();
  for (const p of space) {
    total++;
    const v = VARIANTS.make(card, p);
    const key = v.variant;
    questions.add(v.q);
    if (v.choices.length !== card.choices.length) fail(id, key, `${v.choices.length} choices, cards.js has ${card.choices.length}`);
    if (v.answer !== card.answer) fail(id, key, "answer index differs from cards.js");
    if (new Set(v.choices.map(strip)).size !== v.choices.length) fail(id, key, "duplicate choices");
    for (const s of [v.q, v.explain, v.mistake, ...v.choices]) {
      const bad = (s.match(/\{[^}]*\}/g) || []).filter((m) => !/^\{(\d+ )?[\d?]+\/[\d?]+\}$/.test(m));
      if (bad.length) fail(id, key, `bad fraction markup ${bad.join(" ")}`);
      if (/NaN|undefined|Infinity|-\d/.test(s)) fail(id, key, `bad number in "${s}"`);
    }
    const want = chk.expect(v.q);
    const got = strip(v.choices[v.answer]);
    if (want === null) fail(id, key, `question "${v.q}" has no clean answer`);
    else if (got !== want) fail(id, key, `marked answer "${got}" but computed "${want}"`);
    const right = chk.value(v.choices[v.answer]);
    v.choices.forEach((s, i) => {
      if (i !== v.answer && eq(chk.value(s), right)) fail(id, key, `wrong choice "${strip(s)}" has the value of the answer`);
    });
    for (const s of [v.explain, v.mistake]) for (const b of checkSums(s)) fail(id, key, `false sum "${b}" in "${s}"`);
  }
  if (questions.size !== space.length) fail(id, "-", `${space.length} variants but only ${questions.size} different questions`);
}

// The same sum check on the fixed cards.
for (const c of CARDS) for (const s of [c.explain, c.mistake]) for (const b of checkSums(s)) fail(c.id, "fixed", `false sum "${b}" in "${s}"`);

if (fails.length) {
  console.log(`FAIL: ${fails.length} problem(s)`);
  for (const f of fails.slice(0, 40)) console.log("  " + f);
  if (fails.length > 40) console.log(`  ... and ${fails.length - 40} more`);
  process.exit(1);
}
const sizes = Object.fromEntries(VARIANTS.ids().map((id) => [id, VARIANTS.space(byId[id]).length]));
console.log(`OK: ${VARIANTS.ids().length} cards with fresh numbers, ${total} variants checked`);
console.log(JSON.stringify(sizes));
