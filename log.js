// Practice log, kept in localStorage on this phone.
// report.js sends each session to the parent's Google Sheet.
//
// One session is one run through a deck:
//   { id, start, updated, end, deck, total, done, items: [{ card, result, ms, left }] }
// `updated` is the time of the last change. `end` is set when the run ends:
// at the last card (done is true) or when the child quits early (done is false).
// `result` is "right", "wrong", "timeout", or null (the card was not answered).
// `left` counts the times the app was left while the card was open.
// A card gives a point only when result is "right" and left is 0.
//
// The log is written after every change, so a session that stops early
// (the app is closed, or the child goes back to the topics) still shows.

(function () {
  "use strict";

  var KEY = "mf-log-v1";
  var MAX_SESSIONS = 60;

  function load() {
    try {
      var all = JSON.parse(window.localStorage.getItem(KEY));
      return Array.isArray(all) ? all : [];
    } catch (e) { return []; }
  }

  function save(session) {
    session.updated = Date.now();
    var all = load().filter(function (s) { return s.id !== session.id; });
    all.push(session);
    try { window.localStorage.setItem(KEY, JSON.stringify(all.slice(-MAX_SESSIONS))); } catch (e) { /* storage blocked */ }
  }

  function current(session) { return session.items[session.items.length - 1]; }

  window.MFLog = {
    start: function (deck, total) {
      var s = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        start: Date.now(),
        deck: deck,
        total: total,
        done: false,
        items: []
      };
      save(s);
      return s;
    },
    openCard: function (session, cardId) {
      session.items.push({ card: cardId, result: null, ms: 0, left: 0 });
      save(session);
    },
    leftApp: function (session) {
      current(session).left++;
      save(session);
    },
    closeCard: function (session, result, ms) {
      var it = current(session);
      it.result = result;
      it.ms = ms;
      save(session);
    },
    finish: function (session) {
      session.done = true;
      session.end = Date.now();
      save(session);
    },
    // The child left the run before the last card.
    stop: function (session) {
      session.end = Date.now();
      save(session);
    },
    sessions: load
  };
})();
