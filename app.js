(function () {
  "use strict";

  var TOPICS = window.TOPICS;
  var CARDS = window.CARDS;
  var VARIANTS = window.VARIANTS;
  var ART = window.ART;
  var LOG = window.MFLog;
  var STORE_KEY = "mf-best-v1";
  var ALL = "ALL";

  // Seconds per card. MDAS and conversion cards need more working out.
  var TIME_LIMIT = 60;
  var LONG_TIME_LIMIT = 90;
  var LONG_TOPICS = { T1: true, T2: true };
  var LOW_TIME = 10;

  var $ = function (id) { return document.getElementById(id); };
  var screens = { home: $("home"), quiz: $("quiz"), results: $("results"), parent: $("parent") };

  // { deck, mix, cards, index, score, perTopic, session, card, phase, shownAt, deadline, left, tid }
  // phase is "question" while the card waits for an answer, then "feedback".
  var state = null;
  var lastVariant = {}; // card id -> variant key shown last, so a restart shows new numbers

  // ---------- storage (best score per deck) ----------
  function loadBest() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) || {} : {};
    } catch (e) { return {}; }
  }
  function saveBest(deck, score, total) {
    var best = loadBest();
    var old = best[deck];
    var isNew = !old || score / total > old.score / old.total;
    if (isNew) {
      best[deck] = { score: score, total: total };
      try { window.localStorage.setItem(STORE_KEY, JSON.stringify(best)); } catch (e) { /* storage blocked */ }
    }
    return isNew;
  }

  // ---------- text with fraction markup ----------
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // Guarded text is drawn by CSS from a data attribute (see [data-t] in styles.css).
  // It shows and is read by screen readers, but a long press or a copy does not pick it up.
  function guarded(s) {
    return s ? '<span data-t="' + esc(s) + '"></span>' : "";
  }
  var FRACTION = /\{(?:(\d+) )?([\d?]+)\/([\d?]+)\}/g;
  // {3/4} -> stacked fraction, {2 1/4} -> whole number plus stacked fraction.
  function render(text, guard) {
    var t = guard ? guarded : esc;
    var out = "", last = 0, m;
    FRACTION.lastIndex = 0;
    while ((m = FRACTION.exec(text))) {
      var w = m[1], n = m[2], d = m[3];
      var spoken = (w ? w + " and " : "") + n + " over " + d;
      var shown = (w ? '<span class="whole" aria-hidden="true">' + t(w) + "</span>" : "") +
        '<span class="frac" aria-hidden="true"><span class="num">' + t(n) + '</span><span class="den">' + t(d) + "</span></span>";
      out += t(text.slice(last, m.index)) + '<span class="fnum">' + shown + '<span class="sr">' + t(spoken) + "</span></span>";
      last = FRACTION.lastIndex;
    }
    return out + t(text.slice(last));
  }

  function shuffled(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function topicTitle(id) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i].title;
    return "All topics";
  }
  function bestText(b) {
    return b ? "Best: " + b.score + " / " + b.total : "Not tried yet";
  }

  function show(name) {
    Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; });
    window.scrollTo(0, 0);
  }

  // ---------- home ----------
  function renderHome() {
    closeSession();
    var best = loadBest();
    var list = $("topic-list");
    list.innerHTML = "";
    var decks = [{ id: ALL, title: "All topics", count: CARDS.length }].concat(TOPICS.map(function (t) {
      return { id: t.id, title: t.title, count: CARDS.filter(function (c) { return c.topic === t.id; }).length };
    }));
    decks.forEach(function (d) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "topic-btn" + (d.id === ALL ? " all" : "");
      btn.dataset.deck = d.id;
      btn.innerHTML =
        '<span class="topic-icon">' + ART.topic(d.id) + "</span>" +
        '<span class="topic-text"><span class="topic-name">' + esc(d.title) + "</span>" +
        '<span class="topic-meta">' + d.count + " cards &middot; " + esc(bestText(best[d.id])) + "</span></span>";
      btn.addEventListener("click", function () { start(d.id); });
      li.appendChild(btn);
      list.appendChild(li);
    });
    show("home");
  }

  // ---------- quiz ----------
  function start(deck) {
    closeSession();
    var cards = deck === ALL ? CARDS.slice() : CARDS.filter(function (c) { return c.topic === deck; });
    var mix = $("shuffle").checked;
    if (mix) cards = shuffled(cards);
    state = {
      deck: deck,
      mix: mix,
      cards: cards,
      index: 0,
      score: 0,
      perTopic: {},
      session: LOG.start(deck, cards.length)
    };
    show("quiz");
    renderCard();
  }

  // The card as shown: fresh numbers when the card has a generator.
  function freshCard(base) {
    if (!VARIANTS.has(base.id)) return base;
    var c = VARIANTS.pick(base, lastVariant[base.id]);
    lastVariant[base.id] = c.variant;
    return c;
  }

  function renderCard() {
    var c = freshCard(state.cards[state.index]);
    var total = state.cards.length;
    state.card = c;
    state.phase = "question";
    state.left = 0;
    state.shownAt = Date.now();
    state.deadline = state.shownAt + (LONG_TOPICS[c.topic] ? LONG_TIME_LIMIT : TIME_LIMIT) * 1000;
    LOG.openCard(state.session, c.id);

    screens.quiz.dataset.topic = c.topic;
    $("counter").textContent = "Card " + (state.index + 1) + " of " + total;
    $("topic-tag").textContent = topicTitle(c.topic);
    $("score").textContent = "Score " + state.score;
    $("progress-fill").style.width = (state.index / total * 100) + "%";
    $("question").innerHTML = render(c.q, true);
    $("left-note").hidden = true;

    var order = c.choices.map(function (_, i) { return i; });
    if (state.mix) order = shuffled(order);

    var box = $("choices");
    box.innerHTML = "";
    order.forEach(function (i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.dataset.index = String(i);
      b.innerHTML = render(c.choices[i], true);
      b.addEventListener("click", function () { answer(i); });
      box.appendChild(b);
    });
    $("feedback").hidden = true;
    window.scrollTo(0, 0);
    startTimer();
  }

  function answer(picked) {
    if (!state || state.phase !== "question") return;
    closeCard(picked === state.card.answer ? "right" : "wrong", picked);
  }

  function closeCard(result, picked) {
    var c = state.card;
    stopTimer();
    state.phase = "feedback";
    LOG.closeCard(state.session, result, Date.now() - state.shownAt);

    var right = result === "right";
    var point = right && !state.left;
    if (point) state.score++;
    var t = state.perTopic[c.topic] || (state.perTopic[c.topic] = { score: 0, total: 0 });
    t.total++;
    if (point) t.score++;

    Array.prototype.forEach.call($("choices").children, function (b) {
      var i = Number(b.dataset.index);
      b.disabled = true;
      if (i === c.answer) b.classList.add("correct");
      else if (i === picked) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    var v = $("verdict");
    if (result === "timeout") {
      v.innerHTML = 'Time is up.<span class="verdict-sub">Here is the answer.</span>';
      v.className = "verdict late";
    } else if (right) {
      v.innerHTML = point ? "Correct!" : 'Correct!<span class="verdict-sub">No point this time, because you left the app.</span>';
      v.className = "verdict ok";
      if (point) ART.celebrate();
    } else {
      v.textContent = "Not quite.";
      v.className = "verdict no";
    }
    $("answer").innerHTML = render(c.choices[c.answer]);
    $("explain").innerHTML = render(c.explain);
    $("mistake").innerHTML = render(c.mistake);
    $("score").textContent = "Score " + state.score;
    $("next").textContent = state.index + 1 < state.cards.length ? "Next card" : "See my score";
    $("feedback").hidden = false;
    $("next").focus({ preventScroll: true });
    $("feedback").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function next() {
    state.index++;
    if (state.index < state.cards.length) renderCard();
    else finish();
  }

  // ---------- timer ----------
  function startTimer() {
    stopTimer();
    tick();
    state.tid = window.setInterval(tick, 250);
  }
  function stopTimer() {
    if (state && state.tid) { window.clearInterval(state.tid); state.tid = null; }
  }
  function tick() {
    if (!state || state.phase !== "question") return;
    var total = (LONG_TOPICS[state.card.topic] ? LONG_TIME_LIMIT : TIME_LIMIT);
    var secs = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    var pill = $("timer");
    $("timer-text").textContent = Math.floor(secs / 60) + ":" + (secs % 60 < 10 ? "0" : "") + secs % 60;
    pill.style.setProperty("--left", String(secs / total));
    pill.classList.toggle("low", secs <= LOW_TIME);
    pill.setAttribute("aria-label", secs + " seconds left");
    if (secs <= 0) closeCard("timeout", null);
  }

  // ---------- leaving the app ----------
  // visibilitychange, blur, and pagehide can all fire for one exit.
  // `away` makes one exit count once.
  var away = false;
  function leave() {
    if (away) return;
    away = true;
    if (state && state.phase === "question" && !screens.quiz.hidden) {
      state.left++;
      LOG.leftApp(state.session);
      $("left-note").hidden = false;
    }
  }
  function comeBack() {
    if (!away) return;
    away = false;
    tick();
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) leave(); else comeBack(); });
  window.addEventListener("blur", leave);
  window.addEventListener("focus", comeBack);
  window.addEventListener("pagehide", leave);
  window.addEventListener("pageshow", comeBack);

  // ---------- copy friction ----------
  ["copy", "cut", "contextmenu", "selectstart", "dragstart"].forEach(function (type) {
    screens.quiz.addEventListener(type, function (e) { e.preventDefault(); });
  });

  // ---------- results ----------
  function finish() {
    stopTimer();
    LOG.finish(state.session);
    state.phase = "done";
    var total = state.cards.length;
    var pct = state.score / total;
    var isNew = saveBest(state.deck, state.score, total);
    $("results-owl").innerHTML = ART.owl(pct >= 0.5 ? "cheer" : "happy");
    $("result-title").textContent = pct === 1 ? "Perfect!" : pct >= 0.75 ? "Great job!" : pct >= 0.5 ? "Good try!" : "Keep practicing!";
    $("result-score").textContent = state.score + " / " + total;
    var b = loadBest()[state.deck];
    $("result-best").textContent = topicTitle(state.deck) + " · " + (isNew ? "New best score!" : bestText(b));

    var ul = $("result-topics");
    ul.innerHTML = "";
    if (state.deck === ALL) {
      TOPICS.forEach(function (t) {
        var r = state.perTopic[t.id];
        if (!r) return;
        var li = document.createElement("li");
        li.dataset.topic = t.id;
        li.innerHTML = '<span>' + esc(t.title) + '</span><span class="r">' + r.score + " / " + r.total + "</span>";
        ul.appendChild(li);
      });
    }
    ul.hidden = state.deck !== ALL;
    show("results");
    if (pct >= 0.75) ART.celebrate();
  }

  // Stop the timer of a run that the child leaves before the end.
  function closeSession() {
    stopTimer();
    if (state) state.phase = "done";
  }

  function openParent() {
    closeSession();
    show("parent");
    window.MFParent.render($("parent-body"), renderHome);
  }

  $("home-owl").innerHTML = ART.owl("happy");
  $("left-owl").innerHTML = ART.owl("calm");
  $("timer-art").innerHTML = ART.clock();
  $("next").addEventListener("click", next);
  $("quit").addEventListener("click", renderHome);
  $("restart").addEventListener("click", function () { start(state.deck); });
  $("home-btn").addEventListener("click", renderHome);
  $("parent-btn").addEventListener("click", openParent);

  renderHome();

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () { /* offline mode is optional */ });
  }
})();
