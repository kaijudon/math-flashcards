// Fresh numbers for cards where the numbers can change safely.
//
// Each generator lists the values for each parameter (`params`), a filter
// (`keep`), the parameter set of the card in cards.js (`base`), and `build`.
// `build` returns the question, the right choice, the wrong choices, the
// explanation, and the common mistake for one parameter set.
// The wrong choices come from the common mistakes, like the fixed cards.
//
// The app picks one parameter set at random each time it shows the card.
// The right choice stays at the same index as in cards.js.
// Word problems and concept cards stay fixed.
//
// Run `node tests/check-variants.js` after any edit. It checks every
// parameter set of every generator.

(function () {
  "use strict";

  var MINUS = "−";

  function range(from, to, step) {
    var out = [];
    for (var v = from; v <= to; v += step || 1) out.push(v);
    return out;
  }
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  function thousands(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function frac(n, d) { return "{" + n + "/" + d + "}"; }
  function mixed(w, n, d) { return "{" + w + " " + n + "/" + d + "}"; }

  var GENERATORS = {
    // ---------- T1 - MDAS ----------
    "T1-1": {
      params: { a: range(2, 20), b: range(2, 9), c: range(2, 9) },
      base: { a: 8, b: 4, c: 3 },
      build: function (p) {
        var bc = p.b * p.c, r = p.a + bc;
        return {
          q: p.a + " + " + p.b + " × " + p.c + " = ?",
          right: String(r),
          wrong: [String((p.a + p.b) * p.c), String(p.a + p.b + p.c), String(p.a * p.b + p.c)],
          explain: "Multiply first: " + p.b + " × " + p.c + " = " + bc + ". Then add: " + p.a + " + " + bc + " = " + r + ".",
          mistake: "Going left to right gives " + (p.a + p.b) + " × " + p.c + " = " + (p.a + p.b) * p.c + ". Do × and ÷ before + and " + MINUS + "."
        };
      }
    },
    "T1-4": {
      // a = b × q, so a ÷ b is exact.
      params: { b: range(2, 9), q: range(2, 12), c: range(2, 4) },
      keep: function (p) { return p.q % p.c === 0; },
      base: { b: 6, q: 4, c: 2 },
      build: function (p) {
        var a = p.b * p.q, r = p.q * p.c;
        return {
          q: a + " ÷ " + p.b + " × " + p.c + " = ?",
          right: String(r),
          wrong: [String(p.q / p.c), String(p.b * p.c), String(p.q)],
          explain: "× and ÷ have the same rank, so go left to right: " + a + " ÷ " + p.b + " = " + p.q + ", then " + p.q + " × " + p.c + " = " + r + ".",
          mistake: "Doing × before ÷ gives " + a + " ÷ " + p.b * p.c + " = " + p.q / p.c + ". Go left to right."
        };
      }
    },
    "T1-5": {
      params: { a: range(30, 100, 5), b: range(5, 30, 5), c: range(5, 30, 5) },
      keep: function (p) { return p.b + p.c < p.a; },
      base: { a: 100, b: 20, c: 15 },
      build: function (p) {
        var ab = p.a - p.b, r = ab + p.c;
        return {
          q: p.a + " " + MINUS + " " + p.b + " + " + p.c + " = ?",
          right: String(r),
          wrong: [String(p.a - (p.b + p.c)), String(p.a + p.b - p.c), String(p.a + p.b + p.c)],
          explain: "+ and " + MINUS + " have the same rank, so go left to right: " + p.a + " " + MINUS + " " + p.b + " = " + ab + ", then " + ab + " + " + p.c + " = " + r + ".",
          mistake: "Adding first gives " + p.a + " " + MINUS + " " + (p.b + p.c) + " = " + (p.a - p.b - p.c) + ". Go left to right."
        };
      }
    },
    "T1-6": {
      // c = d × e, so c ÷ d is exact.
      params: { a: range(3, 9), b: range(3, 9), d: range(2, 9), e: range(2, 9) },
      keep: function (p) { return p.a * p.b > p.d * p.e; },
      base: { a: 7, b: 8, d: 6, e: 8 },
      build: function (p) {
        var ab = p.a * p.b, c = p.d * p.e, r = ab - p.e;
        return {
          q: p.a + " × " + p.b + " " + MINUS + " " + c + " ÷ " + p.d + " = ?",
          right: String(r),
          wrong: [String(ab - c), String(ab + p.e), String(ab)],
          explain: "Do × and ÷ first: " + p.a + " × " + p.b + " = " + ab + " and " + c + " ÷ " + p.d + " = " + p.e + ". Then subtract: " + ab + " " + MINUS + " " + p.e + " = " + r + ".",
          mistake: "Subtracting first gives " + ab + " " + MINUS + " " + c + " = " + (ab - c) + ". Do × and ÷ first."
        };
      }
    },
    "T1-7": {
      // b = c × q. a is a multiple of c, so (a + b) ÷ c in the mistake is exact.
      params: { a: range(2, 20), c: range(2, 9), q: range(2, 9), d: range(2, 5) },
      keep: function (p) { return p.a % p.c === 0; },
      base: { a: 9, c: 3, q: 9, d: 2 },
      build: function (p) {
        var b = p.c * p.q, qd = p.q * p.d, r = p.a + qd, slip = (p.a + b) / p.c * p.d;
        return {
          q: p.a + " + " + b + " ÷ " + p.c + " × " + p.d + " = ?",
          right: String(r),
          wrong: [String(slip), String(qd), String((p.a + p.q) * p.d)],
          explain: "Do ÷ and × first, left to right: " + b + " ÷ " + p.c + " = " + p.q + ", then " + p.q + " × " + p.d + " = " + qd + ". Then add: " + p.a + " + " + qd + " = " + r + ".",
          mistake: "Adding first gives " + (p.a + b) + " ÷ " + p.c + " × " + p.d + " = " + slip + ". Do × and ÷ before +."
        };
      }
    },
    "T1-8": {
      // b = c × q, so b ÷ c is exact.
      params: { a: range(30, 60, 5), c: range(2, 5), q: range(2, 9), d: range(2, 5), e: range(2, 6) },
      keep: function (p) { var de = p.d * p.e; return p.a > p.q + de && p.a + de > p.c * p.q; },
      base: { a: 45, c: 3, q: 5, d: 2, e: 4 },
      build: function (p) {
        var b = p.c * p.q, de = p.d * p.e, r = p.a - p.q + de;
        return {
          q: p.a + " " + MINUS + " " + b + " ÷ " + p.c + " + " + p.d + " × " + p.e + " = ?",
          right: String(r),
          wrong: [String(p.a - (p.q + de)), String(p.a + p.q + de), String(p.a - b + de)],
          explain: "Do ÷ and × first: " + b + " ÷ " + p.c + " = " + p.q + " and " + p.d + " × " + p.e + " = " + de + ". Then go left to right: " + p.a + " " + MINUS + " " + p.q + " + " + de + " = " + r + ".",
          mistake: "Doing + before " + MINUS + " gives " + p.a + " " + MINUS + " " + (p.q + de) + " = " + (p.a - p.q - de) + ". Do + and " + MINUS + " from left to right."
        };
      }
    },

    // ---------- T2 - Conversion of units ----------
    "T2-2": {
      params: { m: range(1, 9), r: range(10, 90, 10) },
      base: { m: 4, r: 50 },
      build: function (p) {
        var n = p.m * 100 + p.r;
        return {
          q: n + " cm = ___ m ___ cm",
          right: p.m + " m " + p.r + " cm",
          wrong: [n / 10 + " m", p.m + " m " + p.r / 10 + " cm", p.m * 10 + " m " + p.r + " cm"],
          explain: "100 cm = 1 m. " + n + " cm = " + p.m * 100 + " cm + " + p.r + " cm = " + p.m + " m " + p.r + " cm.",
          mistake: "There are 100 cm in 1 m, not 10."
        };
      }
    },
    "T2-3": {
      params: { k: range(2, 19) },
      base: { k: 2 },
      build: function (p) {
        return {
          q: p.k + " km = ___ m",
          right: thousands(p.k * 1000) + " m",
          wrong: [thousands(p.k * 100) + " m", thousands(p.k * 10) + " m", thousands(p.k * 10000) + " m"],
          explain: "1 km = 1 000 m. So " + p.k + " km = " + p.k + " × 1 000 = " + thousands(p.k * 1000) + " m.",
          mistake: "1 km is 1 000 m, not 100 m."
        };
      }
    },
    "T2-4": {
      params: { k: range(2, 19) },
      base: { k: 3 },
      build: function (p) {
        return {
          q: p.k + " kg = ___ g",
          right: thousands(p.k * 1000) + " g",
          wrong: [thousands(p.k * 100) + " g", thousands(p.k * 10) + " g", thousands(p.k * 10000) + " g"],
          explain: "1 kg = 1 000 g. So " + p.k + " kg = " + p.k + " × 1 000 = " + thousands(p.k * 1000) + " g.",
          mistake: "1 kg is 1 000 g, not 100 g. Big unit to small unit: multiply."
        };
      }
    },
    "T2-6": {
      params: { l: range(1, 9), r: range(100, 900, 100) },
      base: { l: 2, r: 500 },
      build: function (p) {
        var n = p.l * 1000 + p.r;
        return {
          q: thousands(n) + " mL = ___ L ___ mL",
          right: p.l + " L " + p.r + " mL",
          wrong: [n / 100 + " L", p.l + " L " + p.r / 10 + " mL", n / 10 + " L"],
          explain: "1 000 mL = 1 L. " + thousands(n) + " mL = " + thousands(p.l * 1000) + " mL + " + p.r + " mL = " + p.l + " L " + p.r + " mL.",
          mistake: "1 L is 1 000 mL, not 100 mL."
        };
      }
    },
    "T2-7": {
      params: { m: range(2, 15) },
      base: { m: 3 },
      build: function (p) {
        return {
          q: p.m + " minutes = ___ seconds",
          right: p.m * 60 + " seconds",
          wrong: [thousands(p.m * 100) + " seconds", p.m + 60 + " seconds", p.m * 10 + " seconds"],
          explain: "1 minute = 60 seconds. So " + p.m + " minutes = " + p.m + " × 60 = " + p.m * 60 + " seconds.",
          mistake: "Time does not use 100. 1 minute is 60 seconds."
        };
      }
    },
    "T2-8": {
      params: { h: range(4, 20) },
      base: { h: 4 },
      build: function (p) {
        var n = p.h * 60;
        return {
          q: thousands(n) + " minutes = ___ hours",
          right: p.h + " hours",
          wrong: [n / 10 + " hours", p.h - 2 + " hours", p.h + 2 + " hours"],
          explain: "60 minutes = 1 hour. Small unit to big unit: divide. " + thousands(n) + " ÷ 60 = " + p.h + " hours.",
          mistake: "1 hour is 60 minutes, not 100 minutes."
        };
      }
    },
    "T2-9": {
      params: { d: range(2, 12) },
      base: { d: 3 },
      build: function (p) {
        return {
          q: p.d + " days = ___ hours",
          right: p.d * 24 + " hours",
          wrong: [p.d * 12 + " hours", p.d * 60 + " hours", p.d * 10 + " hours"],
          explain: "1 day = 24 hours. So " + p.d + " days = " + p.d + " × 24 = " + p.d * 24 + " hours.",
          mistake: "1 day is 24 hours, not 12. Big unit to small unit: multiply."
        };
      }
    },

    // ---------- T4 - Add and subtract similar fractions ----------
    "T4-1": {
      // The sum is already in simplest form.
      params: { d: range(5, 12), a: range(1, 10), b: range(1, 10) },
      keep: function (p) { return p.a !== p.b && p.a + p.b < p.d && gcd(p.a + p.b, p.d) === 1; },
      base: { d: 7, a: 2, b: 3 },
      build: function (p) {
        var s = p.a + p.b;
        return {
          q: frac(p.a, p.d) + " + " + frac(p.b, p.d) + " = ?",
          right: frac(s, p.d),
          wrong: [frac(s, 2 * p.d), frac(p.a * p.b, p.d), frac(Math.abs(p.b - p.a), p.d)],
          explain: "The denominators are the same. Add only the numerators: " + p.a + " + " + p.b + " = " + s + ". Keep the " + p.d + ": " + frac(s, p.d) + ".",
          mistake: "Do not add the denominators. " + frac(s, 2 * p.d) + " is wrong."
        };
      }
    },
    "T4-3": {
      // The sum of the fractions is less than 1 and in simplest form.
      params: { w1: range(1, 4), a: range(1, 8), w2: range(1, 4), b: range(1, 8), d: range(3, 9) },
      keep: function (p) { return p.a !== p.b && p.a + p.b < p.d && gcd(p.a + p.b, p.d) === 1; },
      base: { w1: 1, a: 2, w2: 2, b: 1, d: 5 },
      build: function (p) {
        var w = p.w1 + p.w2, s = p.a + p.b;
        return {
          q: mixed(p.w1, p.a, p.d) + " + " + mixed(p.w2, p.b, p.d) + " = ?",
          right: mixed(w, s, p.d),
          wrong: [mixed(w, s, 2 * p.d), mixed(w, Math.abs(p.a - p.b), p.d), mixed(w + 1, s, p.d)],
          explain: "Add the whole numbers: " + p.w1 + " + " + p.w2 + " = " + w + ". Add the fractions: " + frac(p.a, p.d) + " + " + frac(p.b, p.d) + " = " + frac(s, p.d) + ". Answer: " + mixed(w, s, p.d) + ".",
          mistake: "Add both parts: the whole numbers and the fractions. Do not add the denominators."
        };
      }
    },
    "T4-4": {
      // The difference of the fractions can be simplified.
      params: { w: range(2, 5), a: range(2, 11), b: range(1, 10), d: range(4, 12) },
      keep: function (p) { return p.a > p.b && p.a + p.b < p.d && gcd(p.a - p.b, p.d) > 1; },
      base: { w: 2, a: 3, b: 1, d: 8 },
      build: function (p) {
        var n = p.a - p.b, g = gcd(n, p.d), sn = n / g, sd = p.d / g;
        return {
          q: mixed(p.w, p.a, p.d) + " " + MINUS + " " + frac(p.b, p.d) + " = ?",
          right: mixed(p.w, n, p.d) + " = " + mixed(p.w, sn, sd),
          wrong: [mixed(p.w, p.a + p.b, p.d), mixed(p.w - 1, n, p.d), mixed(p.w - 1, sn, sd)],
          explain: "Subtract the fractions: " + frac(p.a, p.d) + " " + MINUS + " " + frac(p.b, p.d) + " = " + frac(n, p.d) + ". Keep the " + p.w + ". " + mixed(p.w, n, p.d) + " in simplest form is " + mixed(p.w, sn, sd) + ".",
          mistake: "There is no whole number to take away, so the " + p.w + " stays."
        };
      }
    },
    "T4-6": {
      // The answer is in simplest form.
      params: { w: range(2, 9), n: range(1, 9), d: range(3, 10) },
      keep: function (p) { return p.n < p.d && gcd(p.d - p.n, p.d) === 1; },
      base: { w: 3, n: 1, d: 4 },
      build: function (p) {
        var r = p.d - p.n;
        return {
          q: p.w + " " + MINUS + " " + frac(p.n, p.d) + " = ?",
          right: mixed(p.w - 1, r, p.d),
          wrong: [mixed(p.w, p.n, p.d), mixed(p.w - 1, p.n, p.d), mixed(p.w, r, p.d)],
          explain: "Rename " + p.w + " as " + mixed(p.w - 1, p.d, p.d) + ". Then " + mixed(p.w - 1, p.d, p.d) + " " + MINUS + " " + frac(p.n, p.d) + " = " + mixed(p.w - 1, r, p.d) + ".",
          mistake: "Taking away makes the number smaller, so " + mixed(p.w, p.n, p.d) + " is wrong. Rename " + p.w + " as " + mixed(p.w - 1, p.d, p.d) + " first."
        };
      }
    },

    // ---------- T6 - Equivalent fractions ----------
    "T6-1": {
      params: { n: range(1, 8), d: range(2, 9), k: range(2, 6) },
      keep: function (p) { return p.n < p.d && gcd(p.n, p.d) === 1; },
      base: { n: 1, d: 3, k: 4 },
      build: function (p) {
        var big = p.d * p.k, top = p.n * p.k;
        return {
          q: frac(p.n, p.d) + " = " + frac("?", big),
          right: String(top),
          wrong: [String(p.d), String(big - p.d), String(big)],
          explain: p.d + " × " + p.k + " = " + big + ", so multiply the numerator by " + p.k + " too: " + p.n + " × " + p.k + " = " + top + ". " + frac(p.n, p.d) + " = " + frac(top, big) + ".",
          mistake: "Do the same thing to the top and the bottom."
        };
      }
    },
    "T6-2": {
      params: { n: range(1, 8), d: range(3, 9), k: range(2, 6) },
      keep: function (p) { return p.n < p.d && gcd(p.n, p.d) === 1; },
      base: { n: 2, d: 5, k: 3 },
      build: function (p) {
        var top = p.n * p.k, big = p.d * p.k, added = top - p.n;
        return {
          q: frac(p.n, p.d) + " = " + frac(top, "?"),
          right: String(big),
          wrong: [String(p.d + added), String(p.d * p.n), String(top * p.d)],
          explain: p.n + " × " + p.k + " = " + top + ", so multiply the denominator by " + p.k + " too: " + p.d + " × " + p.k + " = " + big + ". " + frac(p.n, p.d) + " = " + frac(top, big) + ".",
          mistake: "Adding " + added + " to both parts gives " + frac(top, p.d + added) + ", which is wrong. Multiply, do not add."
        };
      }
    }
  };

  // ---------- parameter sets ----------
  function keyOf(gen, p) {
    return Object.keys(gen.params).map(function (name) { return p[name]; }).join(",");
  }

  // Every combination of the parameter values that passes `keep`.
  function grid(gen) {
    var names = Object.keys(gen.params);
    var out = [{}];
    names.forEach(function (name) {
      var next = [];
      out.forEach(function (p) {
        gen.params[name].forEach(function (v) {
          var q = {};
          for (var k in p) q[k] = p[k];
          q[name] = v;
          next.push(q);
        });
      });
      out = next;
    });
    return out.filter(function (p) { return !gen.keep || gen.keep(p); });
  }

  // Put the right choice at the same index as the fixed card.
  function make(card, p) {
    var gen = GENERATORS[card.id];
    var b = gen.build(p);
    var choices = b.wrong.slice();
    choices.splice(card.answer, 0, b.right);
    return {
      id: card.id,
      topic: card.topic,
      q: b.q,
      choices: choices,
      answer: card.answer,
      explain: b.explain,
      mistake: b.mistake,
      variant: keyOf(gen, p)
    };
  }

  function plain(s) { return s.replace(/[{}]/g, ""); }
  function distinct(c) {
    var seen = {};
    return c.choices.every(function (s) { var k = plain(s); if (seen[k]) return false; seen[k] = true; return true; });
  }

  var spaces = {};
  function space(card) {
    if (!spaces[card.id]) {
      spaces[card.id] = grid(GENERATORS[card.id]).filter(function (p) {
        return distinct(make(card, p));
      });
    }
    return spaces[card.id];
  }

  // A card with fresh numbers. `avoid` is the variant key shown last time.
  function pick(card, avoid, random) {
    var list = space(card);
    var rnd = random || Math.random;
    var options = list.length > 1 && avoid != null
      ? list.filter(function (p) { return keyOf(GENERATORS[card.id], p) !== avoid; })
      : list;
    return make(card, options[Math.floor(rnd() * options.length)]);
  }

  window.VARIANTS = {
    has: function (id) { return Object.prototype.hasOwnProperty.call(GENERATORS, id); },
    ids: function () { return Object.keys(GENERATORS); },
    base: function (id) { return GENERATORS[id].base; },
    space: space,
    make: make,
    pick: pick
  };
})();
