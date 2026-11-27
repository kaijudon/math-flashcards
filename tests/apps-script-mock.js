// A small in-memory stand-in for the Apps Script services that Code.gs uses:
// SpreadsheetApp, LockService, Utilities.formatDate, and ContentService.
// load() runs Code.gs in a fresh VM context and returns that context and the book.

"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function makeSheet(name) {
  const rows = [];
  return {
    name,
    rows,
    frozen: 0,
    getLastRow: () => rows.length,
    appendRow(values) { rows.push(values.slice()); return this; },
    setFrozenRows(n) { this.frozen = n; },
    getRange(row, col, numRows, numCols) {
      return {
        getValues() {
          const out = [];
          for (let r = 0; r < numRows; r++) {
            const src = rows[row - 1 + r] || [];
            out.push(Array.from({ length: numCols }, (_, c) => (src[col - 1 + c] === undefined ? "" : src[col - 1 + c])));
          }
          return out;
        },
        setValues(values) {
          if (values.length !== numRows || values.some((v) => v.length !== numCols)) throw new Error("setValues: size mismatch");
          values.forEach((v, r) => {
            const target = rows[row - 1 + r] || (rows[row - 1 + r] = []);
            v.forEach((x, c) => { target[col - 1 + c] = x; });
          });
        }
      };
    }
  };
}

function makeBook() {
  const sheets = {};
  return {
    sheets,
    getSheetByName: (n) => sheets[n] || null,
    insertSheet: (n) => (sheets[n] = makeSheet(n))
  };
}

// "yyyy-MM-dd HH:mm:ss" in the given IANA time zone.
function formatDate(date, tz, pattern) {
  if (pattern !== "yyyy-MM-dd HH:mm:ss") throw new Error("mock formatDate: unsupported pattern " + pattern);
  const parts = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(date).forEach((p) => { parts[p.type] = p.value; });
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function load(codePath) {
  const book = makeBook();
  const lock = { held: false, tryLock() { this.held = true; return true; }, releaseLock() { this.held = false; } };
  const context = vm.createContext({
    Date, JSON, Math, Error, Array, Object, String, Number, isFinite,
    SpreadsheetApp: { getActiveSpreadsheet: () => book },
    LockService: { getScriptLock: () => lock },
    Utilities: { formatDate },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (text) => ({ text, mime: null, setMimeType(m) { this.mime = m; return this; } })
    }
  });
  const file = codePath || path.join(__dirname, "..", "apps-script", "Code.gs");
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return { context, book, lock };
}

module.exports = { load, formatDate };
