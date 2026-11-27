(function () {
  "use strict";

  var TOPICS = window.TOPICS;
  var CARDS = window.CARDS;
  var STORE_KEY = "mf-best-v1";
  var ALL = "ALL";

  var $ = function (id) { return document.getElementById(id); };
  var screens = { home: $("home"), quiz: $("quiz"), results: $("results") };

  var state = null; // { deck, cards, index, score, answered, perTopic }

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
  function fracHtml(n, d) {
    return '<span class="frac" aria-hidden="true"><span class="num">' + n + '</span><span class="den">' + d + "</span></span>";
  }
  // {3/4} -> stacked fraction, {2 1/4} -> whole number plus stacked fraction.
  function render(text) {
    return esc(text).replace(/\{(?:(\d+) )?([\d?]+)\/([\d?]+)\}/g, function (_, w, n, d) {
      var spoken = (w ? w + " and " : "") + n + " over " + d;
      var shown = (w ? '<span class="whole" aria-hidden="true">' + w + "</span>" : "") + fracHtml(n, d);
      return '<span class="fnum">' + shown + '<span class="sr">' + spoken + "</span></span>";
    });
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
        '<span class="topic-name">' + esc(d.title) + "</span>" +
        '<span class="topic-meta">' + d.count + " cards &middot; " + esc(bestText(best[d.id])) + "</span>";
      btn.addEventListener("click", function () { start(d.id); });
      li.appendChild(btn);
      list.appendChild(li);
    });
    show("home");
  }

  // ---------- quiz ----------
  function start(deck) {
    var cards = deck === ALL ? CARDS.slice() : CARDS.filter(function (c) { return c.topic === deck; });
    var mix = $("shuffle").checked;
    if (mix) cards = shuffled(cards);
    state = {
      deck: deck,
      mix: mix,
      cards: cards,
      index: 0,
      score: 0,
      perTopic: {}
    };
    show("quiz");
    renderCard();
  }

  function renderCard() {
    var c = state.cards[state.index];
    var total = state.cards.length;
    $("counter").textContent = "Card " + (state.index + 1) + " of " + total;
    $("topic-tag").textContent = topicTitle(c.topic);
    $("score").textContent = "Score " + state.score;
    $("progress-fill").style.width = (state.index / total * 100) + "%";
    $("question").innerHTML = render(c.q);

    var order = c.choices.map(function (_, i) { return i; });
    if (state.mix) order = shuffled(order);

    var box = $("choices");
    box.innerHTML = "";
    order.forEach(function (i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.dataset.index = String(i);
      b.innerHTML = render(c.choices[i]);
      b.addEventListener("click", function () { answer(i); });
      box.appendChild(b);
    });
    $("feedback").hidden = true;
    window.scrollTo(0, 0);
  }

  function answer(picked) {
    var c = state.cards[state.index];
    var right = picked === c.answer;
    if (right) state.score++;
    var t = state.perTopic[c.topic] || (state.perTopic[c.topic] = { score: 0, total: 0 });
    t.total++;
    if (right) t.score++;

    Array.prototype.forEach.call($("choices").children, function (b) {
      var i = Number(b.dataset.index);
      b.disabled = true;
      if (i === c.answer) b.classList.add("correct");
      else if (i === picked) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    var v = $("verdict");
    v.textContent = right ? "Correct!" : "Not quite.";
    v.className = "verdict " + (right ? "ok" : "no");
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

  // ---------- results ----------
  function finish() {
    var total = state.cards.length;
    var pct = state.score / total;
    var isNew = saveBest(state.deck, state.score, total);
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
        li.innerHTML = '<span>' + esc(t.title) + '</span><span class="r">' + r.score + " / " + r.total + "</span>";
        ul.appendChild(li);
      });
    }
    ul.hidden = state.deck !== ALL;
    show("results");
  }

  $("next").addEventListener("click", next);
  $("quit").addEventListener("click", renderHome);
  $("restart").addEventListener("click", function () { start(state.deck); });
  $("home-btn").addEventListener("click", renderHome);

  renderHome();

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () { /* offline mode is optional */ });
  }
})();
