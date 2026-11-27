// Inline SVG art: Pip the owl and one small doodle per topic.
// Colours come from CSS custom properties, so light and dark mode both work.
// All art is decoration: every SVG has aria-hidden="true".

(function () {
  "use strict";

  var INK = 'stroke="var(--art-ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';

  function svg(viewBox, cls, body) {
    return '<svg class="' + cls + '" viewBox="' + viewBox + '" aria-hidden="true" focusable="false">' + body + "</svg>";
  }

  // mood: "happy" (default), "cheer" (wings up), "calm" (eyes closed), "think" (looks up).
  function owl(mood) {
    var wings = mood === "cheer"
      ? '<path d="M24 66 C8 56 6 38 12 30 C20 40 26 50 30 58 Z" fill="var(--owl-wing)" ' + INK + "/>" +
        '<path d="M96 66 C112 56 114 38 108 30 C100 40 94 50 90 58 Z" fill="var(--owl-wing)" ' + INK + "/>"
      : '<path d="M25 62 C14 72 14 90 24 100 C30 90 32 78 30 66 Z" fill="var(--owl-wing)" ' + INK + "/>" +
        '<path d="M95 62 C106 72 106 90 96 100 C90 90 88 78 90 66 Z" fill="var(--owl-wing)" ' + INK + "/>";
    var eyes;
    if (mood === "calm") {
      eyes = '<path d="M38 56 Q46 63 54 56" fill="none" ' + INK + "/>" +
             '<path d="M66 56 Q74 63 82 56" fill="none" ' + INK + "/>";
    } else {
      var dy = mood === "think" ? -4 : 0;
      eyes = '<circle cx="46" cy="55" r="13" fill="#fff" ' + INK + "/>" +
             '<circle cx="74" cy="55" r="13" fill="#fff" ' + INK + "/>" +
             '<circle cx="48" cy="' + (57 + dy) + '" r="6" fill="var(--art-ink)"/>' +
             '<circle cx="72" cy="' + (57 + dy) + '" r="6" fill="var(--art-ink)"/>' +
             '<circle cx="50" cy="' + (55 + dy) + '" r="2" fill="#fff"/>' +
             '<circle cx="74" cy="' + (55 + dy) + '" r="2" fill="#fff"/>';
    }
    return svg("0 0 120 120", "owl owl-" + (mood || "happy"),
      '<path d="M30 34 L26 14 L44 26 Z" fill="var(--owl-body)" ' + INK + "/>" +
      '<path d="M90 34 L94 14 L76 26 Z" fill="var(--owl-body)" ' + INK + "/>" +
      wings +
      '<ellipse cx="60" cy="68" rx="36" ry="40" fill="var(--owl-body)" ' + INK + "/>" +
      '<ellipse cx="60" cy="84" rx="22" ry="20" fill="var(--owl-belly)"/>' +
      '<path d="M52 82 l4 4 l4 -4 l4 4 l4 -4 M54 92 l4 4 l4 -4 l4 4" fill="none" stroke="var(--owl-wing)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="34" cy="70" r="5" fill="var(--cheek)"/>' +
      '<circle cx="86" cy="70" r="5" fill="var(--cheek)"/>' +
      eyes +
      '<path d="M55 66 L65 66 L60 74 Z" fill="var(--beak)" ' + INK + "/>" +
      '<path d="M48 107 l-3 6 M52 107 l0 7 M68 107 l0 7 M72 107 l3 6" fill="none" stroke="var(--beak)" stroke-width="4" stroke-linecap="round"/>'
    );
  }

  var TOPIC_ART = {
    ALL:
      '<path d="M24 5 L29.5 17 L42.5 18.5 L32.8 27.3 L35.6 40.2 L24 33.6 L12.4 40.2 L15.2 27.3 L5.5 18.5 L18.5 17 Z" fill="var(--sun)" ' + INK + "/>" +
      '<circle cx="24" cy="24" r="3" fill="var(--art-ink)"/>',
    T1:
      '<rect x="5" y="5" width="17" height="17" rx="5" fill="#fff" ' + INK + "/>" +
      '<rect x="26" y="5" width="17" height="17" rx="5" fill="#fff" ' + INK + "/>" +
      '<rect x="5" y="26" width="17" height="17" rx="5" fill="#fff" ' + INK + "/>" +
      '<rect x="26" y="26" width="17" height="17" rx="5" fill="#fff" ' + INK + "/>" +
      '<path d="M13.5 9.5 v8 M9.5 13.5 h8 M30.5 13.5 h8 M30.8 30.8 l6.4 6.4 M37.2 30.8 l-6.4 6.4 M9.5 34.5 h8" fill="none" ' + INK + "/>" +
      '<circle cx="13.5" cy="30.5" r="1.6" fill="var(--art-ink)"/><circle cx="13.5" cy="38.5" r="1.6" fill="var(--art-ink)"/>',
    T2:
      '<rect x="4" y="28" width="40" height="13" rx="3" fill="var(--sun)" ' + INK + "/>" +
      '<path d="M11 28 v5 M18 28 v7 M25 28 v5 M32 28 v7 M39 28 v5" fill="none" ' + INK + "/>" +
      '<circle cx="24" cy="14" r="10" fill="#fff" ' + INK + "/>" +
      '<path d="M24 8.5 V14 L28 16.5" fill="none" ' + INK + "/>",
    T3:
      '<circle cx="24" cy="24" r="18" fill="#fff" ' + INK + "/>" +
      '<path d="M24 24 L24 6 A18 18 0 1 1 6 24 Z" fill="var(--berry)" ' + INK + "/>",
    T4:
      '<path d="M5 10 Q15 4 25 10 L15 42 Z" fill="var(--sun)" ' + INK + "/>" +
      '<path d="M23 10 Q33 4 43 10 L33 42 Z" fill="var(--sun)" ' + INK + "/>" +
      '<path d="M5.5 11 Q15 6 24.5 11 M23.5 11 Q33 6 42.5 11" fill="none" stroke="var(--coral)" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="14" cy="18" r="2.6" fill="var(--berry)"/><circle cx="16" cy="28" r="2.2" fill="var(--berry)"/>' +
      '<circle cx="32" cy="18" r="2.6" fill="var(--berry)"/><circle cx="34" cy="28" r="2.2" fill="var(--berry)"/>',
    T5:
      '<rect x="5" y="8" width="38" height="12" rx="3" fill="#fff" ' + INK + "/>" +
      '<rect x="5" y="8" width="12.7" height="12" rx="3" fill="var(--berry)"/>' +
      '<path d="M17.7 8 v12 M30.3 8 v12" ' + INK + "/>" +
      '<rect x="5" y="28" width="38" height="12" rx="3" fill="#fff" ' + INK + "/>" +
      '<rect x="5" y="28" width="9.5" height="12" rx="3" fill="var(--sky)"/>' +
      '<path d="M14.5 28 v12 M24 28 v12 M33.5 28 v12" ' + INK + "/>" +
      '<rect x="5" y="8" width="38" height="12" rx="3" fill="none" ' + INK + "/>" +
      '<rect x="5" y="28" width="38" height="12" rx="3" fill="none" ' + INK + "/>",
    T6:
      '<rect x="5" y="8" width="38" height="12" rx="3" fill="#fff" ' + INK + "/>" +
      '<rect x="5" y="8" width="19" height="12" rx="3" fill="var(--mint)"/>' +
      '<path d="M24 8 v12" ' + INK + "/>" +
      '<rect x="5" y="28" width="38" height="12" rx="3" fill="#fff" ' + INK + "/>" +
      '<rect x="5" y="28" width="19" height="12" rx="3" fill="var(--mint)"/>' +
      '<path d="M14.5 28 v12 M24 28 v12 M33.5 28 v12" ' + INK + "/>" +
      '<rect x="5" y="8" width="38" height="12" rx="3" fill="none" ' + INK + "/>" +
      '<rect x="5" y="28" width="38" height="12" rx="3" fill="none" ' + INK + "/>"
  };

  function topic(id) {
    return svg("0 0 48 48", "topic-art", TOPIC_ART[id] || TOPIC_ART.ALL);
  }

  // A small stopwatch for the timer.
  function clock() {
    return svg("0 0 24 24", "clock-art",
      '<circle cx="12" cy="13.5" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/>' +
      '<path d="M12 9.5 V13.5 L14.5 15 M10 3 h4 M12 3 v2.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>');
  }

  // Short-lived stars and paper bits after a right answer.
  // It does nothing when the phone asks for reduced motion.
  function celebrate() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var layer = document.createElement("div");
    layer.className = "confetti";
    layer.setAttribute("aria-hidden", "true");
    var colors = ["var(--berry)", "var(--sun)", "var(--sky)", "var(--mint)", "var(--coral)"];
    for (var i = 0; i < 22; i++) {
      var bit = document.createElement("span");
      bit.className = i % 3 === 0 ? "bit star" : "bit";
      bit.style.setProperty("--x", (Math.random() * 2 - 1) * 46 + "vw");
      bit.style.setProperty("--y", -(30 + Math.random() * 40) + "vh");
      bit.style.setProperty("--r", (Math.random() * 2 - 1) * 540 + "deg");
      bit.style.setProperty("--d", 700 + Math.random() * 500 + "ms");
      bit.style.background = colors[i % colors.length];
      layer.appendChild(bit);
    }
    document.body.appendChild(layer);
    window.setTimeout(function () { layer.remove(); }, 1400);
  }

  window.ART = { owl: owl, topic: topic, clock: clock, celebrate: celebrate };
})();
