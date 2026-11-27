// Parent view: a 4-digit PIN, then the practice log from log.js.
//
// The PIN is stored as a salted SHA-256 hash in localStorage.
// It keeps a child out of the report on a shared phone. It is not strong
// security: anyone who can read the phone's site data can wipe it.
// To reset a forgotten PIN, clear this site's data in the browser settings.
// That also clears the best scores and the log.

(function () {
  "use strict";

  var PIN_KEY = "mf-pin-v1";
  var PIN_RE = /^\d{4}$/;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---------- PIN ----------
  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join("");
  }
  function canHash() { return !!(window.crypto && window.crypto.subtle && window.TextEncoder); }
  function hash(salt, pin) {
    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + pin)).then(hex);
  }
  function storedPin() {
    try {
      var p = JSON.parse(window.localStorage.getItem(PIN_KEY));
      return p && p.salt && p.hash ? p : null;
    } catch (e) { return null; }
  }
  function setPin(pin) {
    var salt = hex(window.crypto.getRandomValues(new Uint8Array(16)).buffer);
    return hash(salt, pin).then(function (h) {
      window.localStorage.setItem(PIN_KEY, JSON.stringify({ salt: salt, hash: h }));
    });
  }
  function checkPin(pin) {
    var p = storedPin();
    return hash(p.salt, pin).then(function (h) { return h === p.hash; });
  }

  // ---------- report ----------
  function deckTitle(id) {
    if (id === "ALL") return "All topics";
    var t = window.TOPICS.filter(function (x) { return x.id === id; })[0];
    return t ? t.title : id;
  }
  function topicOf(cardId) { return cardId.split("-")[0]; }
  function seconds(ms) { return Math.round(ms / 1000) + " s"; }
  function when(t) {
    try {
      return new Date(t).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    } catch (e) { return new Date(t).toString(); }
  }
  var RESULT = { right: "Correct", wrong: "Wrong", timeout: "Time ran out" };

  function itemRow(it, i) {
    var label = it.result ? RESULT[it.result] : "Not answered";
    if (it.result === "right" && it.left) label += ", no point";
    var flags = it.left ? '<span class="tag tag-left">Left the app' + (it.left > 1 ? " × " + it.left : "") + "</span>" : "";
    if (it.result === "timeout") flags += '<span class="tag tag-time">Timeout</span>';
    return "<li>" +
      '<span class="item-name">' + (i + 1) + ". " + esc(deckTitle(topicOf(it.card))) + ' <span class="muted">(' + esc(it.card) + ")</span></span>" +
      '<span class="item-result">' + esc(label) + (it.result ? " · " + seconds(it.ms) : "") + "</span>" +
      (flags ? '<span class="item-flags">' + flags + "</span>" : "") +
      "</li>";
  }

  function sessionBlock(s) {
    var answered = s.items.filter(function (it) { return it.result; });
    var leftTimes = s.items.reduce(function (n, it) { return n + (it.left || 0); }, 0);
    var timeouts = s.items.filter(function (it) { return it.result === "timeout"; }).length;
    var avg = answered.length ? answered.reduce(function (n, it) { return n + it.ms; }, 0) / answered.length : 0;
    var stats = [
      "Score " + window.MFLog.points(s) + " / " + s.total,
      answered.length ? "Avg " + seconds(avg) + " per card" : null,
      s.done ? null : "Stopped at card " + s.items.length + " of " + s.total
    ].filter(Boolean).join(" · ");
    return '<details class="session">' +
      "<summary>" +
      '<span class="s-when">' + esc(when(s.start)) + "</span>" +
      '<span class="s-deck">' + esc(deckTitle(s.deck)) + "</span>" +
      '<span class="s-stats">' + esc(stats) + "</span>" +
      '<span class="s-flags">' +
      '<span class="tag ' + (leftTimes ? "tag-left" : "tag-ok") + '">Left the app: ' + leftTimes + "</span>" +
      '<span class="tag ' + (timeouts ? "tag-time" : "tag-ok") + '">Timeouts: ' + timeouts + "</span>" +
      "</span>" +
      "</summary>" +
      (s.items.length ? '<ol class="items">' + s.items.map(itemRow).join("") + "</ol>" : '<p class="muted">No cards opened.</p>') +
      "</details>";
  }

  function report() {
    var list = window.MFLog.sessions().slice().reverse();
    return '<h2 class="paper-title">Practice log</h2>' +
      '<p class="muted">Newest first. Only practice on this phone shows here. Tap a session to see each card.</p>' +
      (list.length ? list.map(sessionBlock).join("") : '<p class="empty">No practice sessions yet.</p>') +
      '<p class="muted small">"Left the app" counts each time the app went to the background, lost focus, or closed while a question was open. Those cards give no point.</p>';
  }

  // ---------- screens ----------
  function pinForm(kind) {
    var first = kind === "set";
    return '<form class="pin-form" novalidate>' +
      '<h2 class="paper-title">' + (first ? "Set a parent PIN" : "Parent PIN") + "</h2>" +
      '<p class="muted">' + (first
        ? "Pick 4 digits. You need them each time you open this page. Keep them private."
        : "Type the 4-digit PIN to see the practice log.") + "</p>" +
      '<label class="pin-label">PIN<input id="pin-1" class="pin-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" required></label>' +
      (first ? '<label class="pin-label">Type it again<input id="pin-2" class="pin-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" required></label>' : "") +
      '<p id="pin-error" class="pin-error" role="alert"></p>' +
      '<button type="submit" class="primary">' + (first ? "Save PIN" : "Open") + "</button>" +
      "</form>";
  }

  function render(box, onClose) {
    var head = '<div class="parent-head">' + window.ART.owl("think") +
      '<button type="button" class="link-btn" id="parent-close">&larr; Back</button></div>';

    function mount(inner) {
      box.innerHTML = head + '<div class="paper">' + inner + "</div>";
      box.querySelector("#parent-close").addEventListener("click", onClose);
    }

    if (!canHash()) {
      mount('<h2 class="paper-title">Parent view</h2><p class="muted">This page needs the secure (https) site. Open https://kaijudon.github.io/math-flashcards/.</p>');
      return;
    }

    var kind = storedPin() ? "enter" : "set";
    mount(pinForm(kind));
    var form = box.querySelector("form");
    var err = box.querySelector("#pin-error");
    var p1 = box.querySelector("#pin-1");
    p1.focus();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var pin = p1.value;
      err.textContent = "";
      if (!PIN_RE.test(pin)) { err.textContent = "Use exactly 4 digits."; return; }
      if (kind === "set") {
        if (box.querySelector("#pin-2").value !== pin) { err.textContent = "The two PINs are not the same."; return; }
        setPin(pin).then(function () { mount(report()); }, function () { err.textContent = "This phone could not save the PIN."; });
      } else {
        checkPin(pin).then(function (ok) {
          if (ok) mount(report());
          else { err.textContent = "That PIN is not right. Try again."; p1.value = ""; p1.focus(); }
        });
      }
    });
  }

  window.MFParent = { render: render };
})();
