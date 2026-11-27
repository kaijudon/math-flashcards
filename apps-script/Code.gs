// Receiver for the Grade 4 Math flashcards site.
// It writes each practice session to this Google Sheet:
//   "Sessions" - one row per session.
//   "Cards"    - one row per card in each session.
// The sheet keeps scores and times only. It gets no name and no photo.
// Setup steps are in SETUP-PARENT.md in the math-flashcards repository.

// Type a random word here, for example "owl-7342-mango".
// Send the same word with the /exec link, so it goes into config.js on the site.
// Posts with a different word are ignored. Empty means no check.
var TOKEN = "";

var TIME_ZONE = "Asia/Manila";
var MAX_BODY = 20000; // characters; a full 50-card session is about 5000
var MAX_CARDS = 100;
var MAX_COUNT = 1000;
var MAX_SECONDS = 86400;

var TOPIC_NAMES = {
  ALL: "All topics",
  T1: "Number sentences and MDAS",
  T2: "Conversion of units",
  T3: "Kinds of fractions",
  T4: "Add and subtract similar fractions",
  T5: "Dissimilar fractions",
  T6: "Equivalent fractions, factors, multiples"
};

var SESSION_HEADERS = [
  "Received", "Session id", "Started", "Finished", "Status", "Topic",
  "Score", "Total", "Percent", "Left the app", "Timeouts",
  "Total seconds", "Average seconds per card", "Device"
];
var CARD_HEADERS = ["Session id", "Card", "Topic", "Correct", "Left the app", "Timed out", "Seconds"];

var ID_RE = /^[a-z0-9]{4,40}$/;
var TOPIC_RE = /^[A-Z0-9]{1,8}$/;
var CARD_RE = /^[A-Z0-9]{1,8}-[A-Za-z0-9]{1,8}$/;
var DEVICE_RE = /^[A-Za-z0-9 ]{1,24}$/;
var RESULTS = { right: true, wrong: true, timeout: true };

function doPost(e) {
  var data;
  try {
    data = parseSession(e);
  } catch (err) {
    return reply({ ok: false, error: err.message });
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return reply({ ok: false, error: "busy" });
  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    var sessions = sheet(book, "Sessions", SESSION_HEADERS);
    if (hasSession(sessions, data.id)) return reply({ ok: true, duplicate: true });

    // Cards first, then the session row. The session row marks the send as done.
    var cards = sheet(book, "Cards", CARD_HEADERS);
    var rows = cardRows(data);
    if (rows.length) cards.getRange(cards.getLastRow() + 1, 1, rows.length, CARD_HEADERS.length).setValues(rows);
    sessions.appendRow(sessionRow(data));
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Open the /exec link in a browser to check that the deployment works.
function doGet() {
  return reply({ ok: true, service: "math-flashcards" });
}

// ---------- input ----------

function parseSession(e) {
  var text = e && e.postData && e.postData.contents;
  if (typeof text !== "string" || !text.length) throw new Error("no body");
  if (text.length > MAX_BODY) throw new Error("body too large");
  var d;
  try { d = JSON.parse(text); } catch (err) { throw new Error("not JSON"); }
  if (!d || typeof d !== "object" || Array.isArray(d)) throw new Error("not an object");
  if (TOKEN && d.token !== TOKEN) throw new Error("wrong token");

  var now = Date.now();
  var earliest = Date.UTC(2026, 0, 1);
  var latest = now + 24 * 3600 * 1000;
  var s = {
    id: text_(d.id, ID_RE, "id"),
    started: int_(d.started, earliest, latest, "started"),
    finished: int_(d.finished, earliest, latest, "finished"),
    complete: d.complete === true,
    topic: text_(d.topic, TOPIC_RE, "topic"),
    score: int_(d.score, 0, MAX_COUNT, "score"),
    total: int_(d.total, 1, MAX_COUNT, "total"),
    left: int_(d.left, 0, MAX_COUNT, "left"),
    timeouts: int_(d.timeouts, 0, MAX_COUNT, "timeouts"),
    opened: int_(d.opened, 0, MAX_COUNT, "opened"),
    seconds: num_(d.seconds, 0, MAX_SECONDS, "seconds"),
    avgSeconds: num_(d.avgSeconds, 0, MAX_SECONDS, "avgSeconds"),
    device: typeof d.device === "string" && DEVICE_RE.test(d.device) ? d.device : "Other",
    cards: []
  };
  if (s.finished < s.started) throw new Error("finished before started");
  if (s.score > s.total) throw new Error("score above total");

  if (!Array.isArray(d.cards) || d.cards.length > MAX_CARDS) throw new Error("bad cards");
  for (var i = 0; i < d.cards.length; i++) {
    var c = card_(d.cards[i]);
    if (c) s.cards.push(c); // a card with bad fields is skipped
  }
  return s;
}

function card_(c) {
  if (!c || typeof c !== "object") return null;
  if (typeof c.id !== "string" || !CARD_RE.test(c.id)) return null;
  if (typeof c.topic !== "string" || !TOPIC_RE.test(c.topic)) return null;
  if (c.result !== null && !RESULTS.hasOwnProperty(c.result)) return null;
  if (!isInt_(c.left, 0, MAX_COUNT)) return null;
  if (c.seconds !== null && !isNum_(c.seconds, 0, MAX_SECONDS)) return null;
  return { id: c.id, topic: c.topic, result: c.result, left: c.left, seconds: c.seconds };
}

function text_(v, re, name) {
  if (typeof v !== "string" || !re.test(v)) throw new Error("bad " + name);
  return v;
}
function isNum_(v, min, max) { return typeof v === "number" && isFinite(v) && v >= min && v <= max; }
function isInt_(v, min, max) { return isNum_(v, min, max) && Math.floor(v) === v; }
function num_(v, min, max, name) {
  if (!isNum_(v, min, max)) throw new Error("bad " + name);
  return v;
}
function int_(v, min, max, name) {
  if (!isInt_(v, min, max)) throw new Error("bad " + name);
  return v;
}

// ---------- output ----------

function sessionRow(s) {
  return [
    time_(Date.now()),
    s.id,
    time_(s.started),
    time_(s.finished),
    s.complete ? "Complete" : "Stopped at card " + s.opened + " of " + s.total,
    TOPIC_NAMES[s.topic] || s.topic,
    s.score,
    s.total,
    Math.round(s.score / s.total * 100),
    s.left,
    s.timeouts,
    s.seconds,
    s.avgSeconds,
    s.device
  ];
}

function cardRows(s) {
  return s.cards.map(function (c) {
    return [
      s.id,
      c.id,
      TOPIC_NAMES[c.topic] || c.topic,
      c.result === "right" ? "yes" : c.result === null ? "not answered" : "no",
      c.left > 0 ? "yes" : "no",
      c.result === "timeout" ? "yes" : "no",
      c.seconds === null ? "" : c.seconds
    ];
  });
}

function time_(ms) {
  return Utilities.formatDate(new Date(ms), TIME_ZONE, "yyyy-MM-dd HH:mm:ss");
}

function sheet(book, name, headers) {
  var sh = book.getSheetByName(name) || book.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

function hasSession(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return false;
  var ids = sh.getRange(2, 2, last - 1, 1).getValues();
  // String(): the sheet can turn an id cell into a number.
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) return true;
  return false;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
