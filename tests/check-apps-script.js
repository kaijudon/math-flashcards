// Runs apps-script/Code.gs in Node with a small SpreadsheetApp mock.
// It checks the header rows, the session and card rows, the dedupe by
// session id, the token check, and that junk input writes nothing.
// The bodies come from report.js, so the client and the receiver agree.
// Run: node tests/check-apps-script.js
// Exit code 0 means every check passed.

"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const mock = require("./apps-script-mock");

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "report.js"), "utf8"), sandbox);
const { buildPayload } = sandbox.window.MFReport;

let failures = 0, passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (e) { failures++; console.log("FAIL " + name + "\n  " + e.message); }
}

// 2026-11-27 01:00:00 UTC is 09:00:00 in Asia/Manila (UTC+8).
const T0 = Date.UTC(2026, 10, 27, 1, 0, 0);
function session(over) {
  return Object.assign({
    id: "mi3k2abcd",
    start: T0,
    end: T0 + 95000,
    deck: "T5",
    total: 4,
    done: true,
    items: [
      { card: "T5-1", result: "right", ms: 12000, left: 0 },
      { card: "T5-2", result: "right", ms: 20500, left: 1 },
      { card: "T5-3", result: "wrong", ms: 7000, left: 0 },
      { card: "T5-4", result: "timeout", ms: 60000, left: 0 }
    ]
  }, over);
}
function post(ctx, body, token) {
  const b = typeof body === "string" ? body : JSON.stringify(Object.assign({ token: token || "" }, body));
  const out = ctx.doPost({ postData: { contents: b, type: "text/plain" } });
  assert.strictEqual(out.mime, "application/json");
  return JSON.parse(out.text);
}
// JSON round trip: arrays made in the VM context have a different Array prototype.
const plain = (v) => JSON.parse(JSON.stringify(v));
function rows(book, name) { return book.sheets[name] ? plain(book.sheets[name].rows) : []; }

check("doGet answers ok", () => {
  const { context } = mock.load();
  assert.deepStrictEqual(JSON.parse(context.doGet().text), { ok: true, service: "math-flashcards" });
});

check("a complete session writes headers, one session row, and one row per card", () => {
  const { context, book } = mock.load();
  const res = post(context, buildPayload(session(), "Android phone", T0));
  assert.deepStrictEqual(res, { ok: true });
  const s = rows(book, "Sessions"), c = rows(book, "Cards");
  assert.deepStrictEqual(s[0], plain(context.SESSION_HEADERS));
  assert.deepStrictEqual(c[0], plain(context.CARD_HEADERS));
  assert.strictEqual(book.sheets.Sessions.frozen, 1);
  assert.strictEqual(s.length, 2);
  assert.strictEqual(c.length, 5);
  const r = s[1];
  assert.match(r[0], /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/);
  assert.deepStrictEqual(r.slice(1), [
    "mi3k2abcd", "2026-11-27 09:00:00", "2026-11-27 09:01:35", "Complete", "Dissimilar fractions",
    1, 4, 25, 1, 1, 99.5, 24.9, "Android phone"
  ]);
  assert.deepStrictEqual(c.slice(1), [
    ["mi3k2abcd", "T5-1", "Dissimilar fractions", "yes", "no", "no", 12],
    ["mi3k2abcd", "T5-2", "Dissimilar fractions", "yes", "yes", "no", 20.5],
    ["mi3k2abcd", "T5-3", "Dissimilar fractions", "no", "no", "no", 7],
    ["mi3k2abcd", "T5-4", "Dissimilar fractions", "no", "no", "yes", 60]
  ]);
});

check("a second send of the same session id adds no rows", () => {
  const { context, book } = mock.load();
  const body = buildPayload(session(), "iPhone", T0);
  assert.deepStrictEqual(post(context, body), { ok: true });
  assert.deepStrictEqual(post(context, body), { ok: true, duplicate: true });
  assert.deepStrictEqual(post(context, buildPayload(session({ done: false }), "iPhone", T0)), { ok: true, duplicate: true });
  assert.strictEqual(rows(book, "Sessions").length, 2);
  assert.strictEqual(rows(book, "Cards").length, 5);
  assert.deepStrictEqual(post(context, buildPayload(session({ id: "mi3k2other" }), "iPhone", T0)), { ok: true });
  assert.strictEqual(rows(book, "Sessions").length, 3);
  assert.strictEqual(rows(book, "Cards").length, 9);
});

check("dedupe still works when the sheet stored the id as a number", () => {
  const { context, book } = mock.load();
  post(context, buildPayload(session({ id: "12345678" }), "iPhone", T0));
  book.sheets.Sessions.rows[1][1] = 12345678;
  assert.deepStrictEqual(post(context, buildPayload(session({ id: "12345678" }), "iPhone", T0)), { ok: true, duplicate: true });
  assert.strictEqual(rows(book, "Sessions").length, 2);
});

check("a session that stopped early is marked and keeps the unanswered card", () => {
  const { context, book } = mock.load();
  const s = session({
    done: false, deck: "ALL", total: 50,
    items: [{ card: "T1-1", result: "right", ms: 9000, left: 0 }, { card: "T3-2", result: null, ms: 0, left: 1 }]
  });
  assert.deepStrictEqual(post(context, buildPayload(s, "iPad", T0)), { ok: true });
  const r = rows(book, "Sessions")[1];
  assert.strictEqual(r[4], "Stopped at card 2 of 50");
  assert.strictEqual(r[5], "All topics");
  assert.strictEqual(r[8], 2);
  assert.deepStrictEqual(rows(book, "Cards").slice(1), [
    ["mi3k2abcd", "T1-1", "Number sentences and MDAS", "yes", "no", "no", 9],
    ["mi3k2abcd", "T3-2", "Kinds of fractions", "not answered", "yes", "no", ""]
  ]);
});

check("the token check rejects a wrong or missing token", () => {
  const { context, book } = mock.load();
  context.TOKEN = "owl-7342-mango";
  const body = buildPayload(session(), "iPhone", T0);
  assert.deepStrictEqual(post(context, body, "wrong"), { ok: false, error: "wrong token" });
  assert.deepStrictEqual(post(context, body), { ok: false, error: "wrong token" });
  assert.strictEqual(rows(book, "Sessions").length, 0);
  assert.deepStrictEqual(post(context, body, "owl-7342-mango"), { ok: true });
  assert.strictEqual(rows(book, "Sessions").length, 2);
});

check("junk input writes nothing", () => {
  const { context, book } = mock.load();
  const good = buildPayload(session(), "iPhone", T0);
  const cases = [
    [undefined, "no body"],
    ["", "no body"],
    ["x".repeat(20001), "body too large"],
    ["{not json", "not JSON"],
    ["[1,2]", "not an object"],
    ["null", "not an object"],
    [Object.assign({}, good, { id: "=HYPERLINK(1)" }), "bad id"],
    [Object.assign({}, good, { id: 42 }), "bad id"],
    [Object.assign({}, good, { topic: "=1+1" }), "bad topic"],
    [Object.assign({}, good, { score: 5 }), "score above total"],
    [Object.assign({}, good, { score: 1.5 }), "bad score"],
    [Object.assign({}, good, { total: 0 }), "bad total"],
    [Object.assign({}, good, { started: Date.UTC(2020, 0, 1) }), "bad started"],
    [Object.assign({}, good, { finished: good.started - 1 }), "finished before started"],
    [Object.assign({}, good, { seconds: "99" }), "bad seconds"],
    [Object.assign({}, good, { cards: "T1-1" }), "bad cards"],
    [Object.assign({}, good, { cards: new Array(101).fill(good.cards[0]) }), "bad cards"]
  ];
  cases.forEach(([body, error]) => {
    const out = body === undefined ? JSON.parse(context.doPost({}).text) : post(context, body);
    assert.deepStrictEqual(out, { ok: false, error }, "case " + error + ": " + JSON.stringify(out));
  });
  assert.strictEqual(rows(book, "Sessions").length, 0);
  assert.strictEqual(rows(book, "Cards").length, 0);
});

check("bad cards are skipped and a bad device becomes Other", () => {
  const { context, book } = mock.load();
  const body = buildPayload(session(), "iPhone", T0);
  body.device = "=IMPORTXML(1)";
  body.cards.push(
    { id: "=1+1", topic: "T5", result: "right", left: 0, seconds: 1 },
    { id: "T5-9", topic: "T5", result: "maybe", left: 0, seconds: 1 },
    { id: "T5-9", topic: "T5", result: "right", left: -1, seconds: 1 },
    { id: "T5-9", topic: "T5", result: "right", left: 0, seconds: "1" },
    null
  );
  assert.deepStrictEqual(post(context, body), { ok: true });
  assert.strictEqual(rows(book, "Sessions")[1][13], "Other");
  assert.strictEqual(rows(book, "Cards").length, 5);
});

check("the script lock is released after each post", () => {
  const { context, lock } = mock.load();
  post(context, buildPayload(session(), "iPhone", T0));
  post(context, buildPayload(session(), "iPhone", T0));
  assert.strictEqual(lock.held, false);
});

console.log(`${passed} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
