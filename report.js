// Sends each practice session from log.js to the parent's Google Sheet.
//
// The receiver is apps-script/Code.gs. The link and token are in config.js.
// When the link is empty, nothing is queued and nothing is sent.
//
// Each session goes into an outbox in localStorage first. The outbox is sent
// in order. A session leaves the outbox when its fetch resolves. If the phone
// is offline, the session stays and goes on the next load or "online" event.
// The receiver ignores a session id it already has, so a second send is safe.
//
// The request is a "simple" request (POST, text/plain, mode no-cors), so the
// browser sends no CORS preflight. The response is opaque, so the phone cannot
// read it. A resolved fetch means the request reached the server.

(function () {
  "use strict";

  var OUTBOX_KEY = "mf-outbox-v1";
  var SENT_KEY = "mf-sent-v1";
  var MAX_OUTBOX = 100; // the log keeps 60 sessions, so this is never the limit in normal use
  var MAX_SENT = 300;
  var FETCH_TIMEOUT_MS = 20000;

  function topicOf(cardId) { return String(cardId).split("-")[0]; }
  function seconds(ms) { return Math.round((ms || 0) / 100) / 10; }

  // A coarse device name. No model, no browser version, nothing that names the child.
  function deviceLabel(ua) {
    ua = String(ua || "");
    if (/iPhone|iPod/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";
    if (/Android/.test(ua)) return /Mobile/.test(ua) ? "Android phone" : "Android tablet";
    if (/CrOS/.test(ua)) return "Chromebook";
    if (/Windows/.test(ua)) return "Windows";
    if (/Macintosh|Mac OS X/.test(ua)) return "Mac";
    if (/Linux/.test(ua)) return "Linux";
    return "Other";
  }

  // One log session -> the JSON body for Code.gs.
  // `now` is the fallback end time for a session from before log.js stored one.
  function buildPayload(session, device, now) {
    var items = session.items || [];
    var answered = items.filter(function (it) { return it.result; });
    var totalMs = answered.reduce(function (n, it) { return n + (it.ms || 0); }, 0);
    var score = items.filter(function (it) { return it.result === "right" && !it.left; }).length;
    var total = session.total || 0;
    return {
      v: 1,
      id: session.id,
      started: session.start,
      finished: session.end || session.updated || now,
      complete: !!session.done,
      topic: session.deck,
      score: score,
      total: total,
      percent: total ? Math.round(score / total * 100) : 0,
      left: items.reduce(function (n, it) { return n + (it.left || 0); }, 0),
      timeouts: items.filter(function (it) { return it.result === "timeout"; }).length,
      opened: items.length,
      answered: answered.length,
      seconds: seconds(totalMs),
      avgSeconds: answered.length ? seconds(totalMs / answered.length) : 0,
      device: device,
      cards: items.map(function (it) {
        return {
          id: it.card,
          topic: topicOf(it.card),
          result: it.result || null,
          left: it.left || 0,
          seconds: it.result ? seconds(it.ms) : null
        };
      })
    };
  }

  // deps: { storage, fetch, url, token, device, now, setTimeout, clearTimeout, AbortController }
  function create(deps) {
    var url = deps.url || "";
    var now = deps.now || Date.now;
    var busy = null;

    function read(key) {
      try {
        var v = JSON.parse(deps.storage.getItem(key));
        return Array.isArray(v) ? v : [];
      } catch (e) { return []; }
    }
    function write(key, list) {
      try { deps.storage.setItem(key, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
    }

    function known(id) {
      return read(SENT_KEY).indexOf(id) >= 0 || read(OUTBOX_KEY).some(function (p) { return p.id === id; });
    }

    // Adds one session to the outbox. Returns true when it was added.
    function enqueue(session) {
      if (!url || !session || !session.id || known(session.id)) return false;
      var box = read(OUTBOX_KEY);
      box.push(buildPayload(session, deps.device, now()));
      write(OUTBOX_KEY, box.slice(-MAX_OUTBOX));
      return true;
    }

    function markSent(id) {
      write(OUTBOX_KEY, read(OUTBOX_KEY).filter(function (p) { return p.id !== id; }));
      var sent = read(SENT_KEY).filter(function (x) { return x !== id; });
      sent.push(id);
      write(SENT_KEY, sent.slice(-MAX_SENT));
    }

    function post(payload) {
      var body = {};
      Object.keys(payload).forEach(function (k) { body[k] = payload[k]; });
      body.token = deps.token || "";
      var opts = { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(body) };
      var ctrl = deps.AbortController ? new deps.AbortController() : null;
      var tid = null;
      if (ctrl) {
        opts.signal = ctrl.signal;
        tid = deps.setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT_MS);
      }
      return Promise.resolve().then(function () { return deps.fetch(url, opts); }).then(
        function (res) { if (tid) deps.clearTimeout(tid); return res; },
        function (err) { if (tid) deps.clearTimeout(tid); throw err; }
      );
    }

    // Sends the outbox in order and stops at the first failure.
    // Resolves to the number of sessions sent. It never rejects.
    function flush() {
      if (!url) return Promise.resolve(0);
      if (busy) return busy;
      var count = 0;
      function step() {
        var box = read(OUTBOX_KEY);
        if (!box.length) return count;
        var p = box[0];
        return post(p).then(function () {
          markSent(p.id);
          count++;
          return step();
        });
      }
      busy = Promise.resolve().then(step).catch(function () { return count; }).then(function (n) {
        busy = null;
        return n;
      });
      return busy;
    }

    // Queues every log session that is not open now and not yet sent, then sends.
    // This also picks up a session that stopped because the app was closed.
    function sync(sessions, openId) {
      (sessions || []).forEach(function (s) { if (s.id !== openId) enqueue(s); });
      return flush();
    }

    return {
      enabled: !!url,
      enqueue: enqueue,
      flush: flush,
      sync: sync,
      outbox: function () { return read(OUTBOX_KEY); },
      sent: function () { return read(SENT_KEY); }
    };
  }

  window.MFReport = { buildPayload: buildPayload, deviceLabel: deviceLabel, create: create };
})();
