// Checks report.js: the device label, the payload builder, and the outbox.
// A fake fetch and a fake localStorage show that a failed send stays queued,
// a later flush sends it, and a sent session is not queued again.
// Run: node tests/check-report.js
// Exit code 0 means every check passed.

"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "report.js"), "utf8"), sandbox);
const R = sandbox.window.MFReport;
const plain = (v) => JSON.parse(JSON.stringify(v));

const checks = [];
function check(name, fn) { checks.push([name, fn]); }

function storage(init) {
  const m = new Map(Object.entries(init || {}));
  return {
    map: m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); }
  };
}
// fetch that answers from a script: "ok" resolves, "fail" rejects, "hang" waits for an abort.
function fakeFetch(script) {
  const calls = [];
  const fn = (url, opts) => {
    calls.push({ url, opts, body: JSON.parse(opts.body) });
    const step = script.length ? script.shift() : "ok";
    if (step === "ok") return Promise.resolve({ type: "opaque", status: 0 });
    if (step === "fail") return Promise.reject(new TypeError("Failed to fetch"));
    return new Promise((_, reject) => {
      opts.signal.addEventListener("abort", () => reject(new Error("aborted")));
    });
  };
  fn.calls = calls;
  return fn;
}
const URL = "https://script.google.com/macros/s/abc/exec";
function reporter(over) {
  return R.create(Object.assign({
    storage: storage(),
    fetch: fakeFetch([]),
    url: URL,
    token: "owl-7342-mango",
    device: "Android phone",
    now: () => 1795800000000
  }, over));
}
let n = 0;
function session(over) {
  n++;
  return Object.assign({
    id: "mi3k" + n,
    start: 1795700000000,
    updated: 1795700050000,
    deck: "T2",
    total: 3,
    done: true,
    end: 1795700060000,
    items: [
      { card: "T2-1", result: "right", ms: 15240, left: 0 },
      { card: "T2-2", result: "right", ms: 30000, left: 2 },
      { card: "T2-3", result: "timeout", ms: 90000, left: 0 }
    ]
  }, over);
}

check("deviceLabel gives a coarse name only", () => {
  const ua = {
    "Mozilla/5.0 (Linux; Android 14; SM-A146P) AppleWebKit/537.36 Chrome/131 Mobile Safari/537.36": "Android phone",
    "Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 Chrome/131 Safari/537.36": "Android tablet",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148": "iPhone",
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)": "iPad",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)": "Windows",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)": "Mac",
    "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0)": "Chromebook",
    "Mozilla/5.0 (X11; Linux x86_64)": "Linux",
    "": "Other"
  };
  Object.keys(ua).forEach((k) => assert.strictEqual(R.deviceLabel(k), ua[k], k));
});

check("buildPayload sums a complete session", () => {
  const p = plain(R.buildPayload(session({ id: "mi3kfull" }), "Android phone", 1));
  assert.deepStrictEqual(p, {
    v: 1, id: "mi3kfull", started: 1795700000000, finished: 1795700060000, complete: true,
    topic: "T2", score: 1, total: 3, percent: 33, left: 2, timeouts: 1, opened: 3, answered: 3,
    seconds: 135.2, avgSeconds: 45.1, device: "Android phone",
    cards: [
      { id: "T2-1", topic: "T2", result: "right", left: 0, seconds: 15.2 },
      { id: "T2-2", topic: "T2", result: "right", left: 2, seconds: 30 },
      { id: "T2-3", topic: "T2", result: "timeout", left: 0, seconds: 90 }
    ]
  });
});

check("buildPayload marks a stopped session and keeps the open card", () => {
  const s = session({ deck: "ALL", total: 50, done: false, items: [
    { card: "T4-2", result: "wrong", ms: 4000, left: 0 },
    { card: "T6-1", result: null, ms: 0, left: 1 }
  ] });
  const p = plain(R.buildPayload(s, "iPhone", 1));
  assert.strictEqual(p.complete, false);
  assert.strictEqual(p.opened, 2);
  assert.strictEqual(p.answered, 1);
  assert.strictEqual(p.avgSeconds, 4);
  assert.strictEqual(p.left, 1);
  assert.strictEqual(p.percent, 0);
  assert.deepStrictEqual(p.cards[1], { id: "T6-1", topic: "T6", result: null, left: 1, seconds: null });
});

check("buildPayload falls back to updated, then to now, for the end time", () => {
  assert.strictEqual(R.buildPayload(session({ end: undefined }), "x", 7).finished, 1795700050000);
  assert.strictEqual(R.buildPayload(session({ end: undefined, updated: undefined }), "x", 7).finished, 7);
});

check("an empty REPORT_URL queues nothing and sends nothing", async () => {
  const st = storage();
  const f = fakeFetch([]);
  const r = reporter({ url: "", storage: st, fetch: f });
  assert.strictEqual(r.enabled, false);
  assert.strictEqual(r.enqueue(session()), false);
  assert.strictEqual(await r.sync([session()], null), 0);
  assert.strictEqual(f.calls.length, 0);
  assert.strictEqual(st.map.size, 0);
});

check("the request is a simple no-cors text/plain POST with the token", async () => {
  const f = fakeFetch([]);
  const r = reporter({ fetch: f });
  const s = session();
  r.enqueue(s);
  assert.strictEqual(await r.flush(), 1);
  assert.strictEqual(f.calls.length, 1);
  const c = f.calls[0];
  assert.strictEqual(c.url, URL);
  assert.strictEqual(c.opts.method, "POST");
  assert.strictEqual(c.opts.mode, "no-cors");
  assert.deepStrictEqual(plain(c.opts.headers), { "Content-Type": "text/plain" });
  assert.strictEqual(c.body.token, "owl-7342-mango");
  assert.strictEqual(c.body.id, s.id);
});

check("a failed send stays queued and goes on the next flush", async () => {
  const st = storage();
  const f = fakeFetch(["fail", "ok"]);
  const r = reporter({ storage: st, fetch: f });
  const s = session();
  assert.strictEqual(r.enqueue(s), true);
  assert.strictEqual(await r.flush(), 0);
  assert.deepStrictEqual(plain(r.outbox().map((p) => p.id)), [s.id]);
  assert.deepStrictEqual(plain(r.sent()), []);
  // A new reporter on the same storage is the next page load.
  const again = reporter({ storage: st, fetch: f });
  assert.strictEqual(await again.flush(), 1);
  assert.deepStrictEqual(plain(again.outbox()), []);
  assert.deepStrictEqual(plain(again.sent()), [s.id]);
  assert.strictEqual(f.calls.length, 2);
  assert.deepStrictEqual(f.calls[0].body, f.calls[1].body);
});

check("a sent or queued session is not queued again", async () => {
  const f = fakeFetch(["fail"]);
  const r = reporter({ fetch: f });
  const s = session();
  assert.strictEqual(r.enqueue(s), true);
  assert.strictEqual(r.enqueue(s), false);
  await r.flush();
  assert.strictEqual(r.outbox().length, 1);
  await r.flush();
  assert.strictEqual(r.enqueue(s), false);
  assert.strictEqual(await r.sync([s], null), 0);
  assert.strictEqual(f.calls.length, 2);
});

check("the outbox goes in order and stops at the first failure", async () => {
  const f = fakeFetch(["ok", "fail", "ok", "ok"]);
  const r = reporter({ fetch: f });
  const a = session(), b = session(), c = session();
  [a, b, c].forEach((s) => r.enqueue(s));
  assert.strictEqual(await r.flush(), 1);
  assert.deepStrictEqual(plain(r.outbox().map((p) => p.id)), [b.id, c.id]);
  assert.strictEqual(await r.flush(), 2);
  assert.deepStrictEqual(f.calls.map((x) => x.body.id), [a.id, b.id, b.id, c.id]);
});

check("two flushes at once send each session one time", async () => {
  const f = fakeFetch([]);
  const r = reporter({ fetch: f });
  r.enqueue(session());
  r.enqueue(session());
  const [x, y] = await Promise.all([r.flush(), r.flush()]);
  assert.strictEqual(x, 2);
  assert.strictEqual(y, 2);
  assert.strictEqual(f.calls.length, 2);
});

check("sync skips the open session and picks up one that stopped when the app closed", async () => {
  const f = fakeFetch([]);
  const r = reporter({ fetch: f });
  const closed = session({ done: false, end: undefined });
  const open = session({ done: false, end: undefined });
  assert.strictEqual(await r.sync([closed, open], open.id), 1);
  assert.deepStrictEqual(f.calls.map((x) => x.body.id), [closed.id]);
  assert.strictEqual(f.calls[0].body.complete, false);
  assert.strictEqual(f.calls[0].body.finished, closed.updated);
  assert.strictEqual(await r.sync([closed, open], null), 1);
  assert.deepStrictEqual(f.calls.map((x) => x.body.id), [closed.id, open.id]);
});

check("a fetch that hangs is aborted and the session stays queued", async () => {
  const timers = [];
  const f = fakeFetch(["hang"]);
  const r = reporter({
    fetch: f,
    AbortController,
    setTimeout: (fn, ms) => { timers.push(ms); setImmediate(fn); return 1; },
    clearTimeout: () => {}
  });
  r.enqueue(session());
  assert.strictEqual(await r.flush(), 0);
  assert.deepStrictEqual(timers, [20000]);
  assert.strictEqual(r.outbox().length, 1);
});

check("broken storage does not throw", async () => {
  const r = reporter({ storage: { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } } });
  assert.strictEqual(r.enqueue(session()), true);
  assert.strictEqual(await r.flush(), 0);
});

(async () => {
  let failures = 0;
  for (const [name, fn] of checks) {
    try { await fn(); } catch (e) { failures++; console.log("FAIL " + name + "\n  " + e.message); }
  }
  console.log(`${checks.length - failures} passed, ${failures} failed`);
  process.exit(failures ? 1 : 0);
})();
