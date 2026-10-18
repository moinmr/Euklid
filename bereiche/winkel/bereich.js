/* Bereich Winkel. Die Level stehen in level/, ihre Reihenfolge in reihenfolge.js.
   Jedes Level bringt sein Verhalten selbst mit, der Bereich macht nur das Gemeinsame:
   Fortschritt, grüne und rote Karte, Knöpfe unten, Hilfen zum Zeichnen von Winkeln (App.winkel).
   Ein Level hat: neu(Z), down(Z, w), move(Z, w), up(Z, w), draw(ctx, Z, ws), overlay(ctx, Z),
   bild(Z) und ausBild(Z, bild) zum Merken der Zeichnung, optional start(Z) nach dem Laden. Z ist der Zustand des offenen Levels. */
(function () {
'use strict';
var App = window.App, S = App.S, C = App.C;
var STORE_KEY = 'mathe-winkel';
var LEVELS = [];
var W = { level: 0, start_level: 0, solved: new Set(), solutions: {}, work: {} };
var Z = null;   // Zustand des offenen Levels
var TAU = C.TAU;

/* ===================== Rote Karte ===================== */
// Hinweis unten in Rot, im Stil der grünen Karte. Verschwindet beim nächsten Versuch (das Level ruft falschWeg).
var karte = null;
function falsch(text) {
  if (!karte) {
    karte = document.createElement('div');
    karte.id = 'falsch'; karte.setAttribute('aria-live', 'polite');
    karte.appendChild(document.createElement('span'));
    var hud = document.getElementById('hud');
    hud.parentNode.insertBefore(karte, hud.nextSibling);
    karte.addEventListener('click', falschWeg);
  }
  karte.text = text;
  karte.firstChild.textContent = App.wahl(text);
  // über dem Schreibfeld, wenn eins offen ist, sonst über der Leiste
  karte.style.bottom = (feldKarte && !feldKarte.hidden ? S.h - feldOben() + 8 : (S.unten || 70) + 8) + 'px';
  karte.hidden = false;
  if (Z) Z.falsch = true;
}
function falschWeg() {
  if (karte) karte.hidden = true;
  if (Z) Z.falsch = false;
  App.render();
}

/* ===================== Hilfen für die Level ===================== */
// Winkel in Grad (0 bis 360) von Strahl m→a gegen den Uhrzeigersinn bis m→b, so wie man es sieht (y nach unten).
function richtung(m, p) { return Math.atan2(-(p[1] - m[1]), p[0] - m[0]); }
function grad(rad) { return ((rad * 180 / Math.PI) % 360 + 360) % 360; }
// Ganze Gradzahlen, die zusammen genau summe ergeben (die größte Rundung wird angepasst)
function runden(werte, summe) {
  var r = werte.map(Math.round), diff = summe - r.reduce(function (s, v) { return s + v; }, 0);
  if (diff) {
    var best = 0;
    werte.forEach(function (v, i) { if (v > werte[best]) best = i; });
    r[best] += diff;
  }
  return r;
}
// Winkelfeld um m: von Richtung a0 aus um sw gegen den Uhrzeigersinn (Bogenmaß, mathematisch), Radius r
function feld(ctx, m, r, a0, sw, fuell, linie, ws) {
  ctx.beginPath();
  ctx.moveTo(m[0], m[1]);
  ctx.arc(m[0], m[1], r, -a0, -(a0 + sw), true);
  ctx.closePath();
  ctx.fillStyle = fuell; ctx.fill();
  ctx.beginPath();
  ctx.arc(m[0], m[1], r, -a0, -(a0 + sw), true);
  ctx.strokeStyle = linie; ctx.lineWidth = 1.6 * ws * S.k; ctx.stroke();
}
function strecke(ctx, a, b, farbe, ws) {
  ctx.strokeStyle = farbe; ctx.lineWidth = 2.5 * ws * S.k; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  ctx.fillStyle = farbe;
  App.dotAt(ctx, a, false); App.dotAt(ctx, b, false);
}
function geschafft() {
  if (W.solved.has(W.level)) return;
  W.solved.add(W.level);
  W.solutions[W.level] = bild();
  delete W.work[W.level];
  saveProgress();
  if (S.onLevel) S.onLevel(W.level, true);
}
App.winkel = {
  richtung: richtung, grad: grad, runden: runden, feld: feld, strecke: strecke,
  falsch: falsch, falschWeg: falschWeg, geschafft: geschafft, TAU: TAU,
  // Farben für mehrere Winkel nebeneinander: Tinte, warmes Braun, Grau (kein Blau, kein Orange oder Lila)
  farben: [
    { linie: 'rgb(56,41,25)', fuell: 'rgba(56,41,25,0.13)' },
    { linie: 'rgb(166,112,58)', fuell: 'rgba(166,112,58,0.22)' },
    { linie: 'rgb(115,115,122)', fuell: 'rgba(115,115,122,0.20)' }
  ]
};

/* ===================== Zahlen mit dem Finger schreiben ===================== */
// Ziffern 0 bis 9 aus Fingerstrichen erkennen ($P-Punktwolken-Erkenner, Vatavu u. a. 2012), wie die Handschrift
// in Funktionen, hier nur für Zahlen. Striche, die sich waagerecht überlappen, gehören zu einer Ziffer.
var ZIFFERN = (function () {
  var N = 32;
  function pfad(st) {
    var p = [];
    st.forEach(function (s, i) { s.forEach(function (q) { p.push({ x: q[0], y: q[1], id: i }); }); });
    return p;
  }
  function laenge(p) { var d = 0; for (var i = 1; i < p.length; i++) if (p[i].id === p[i - 1].id) d += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); return d; }
  function neu(p) {
    var I = laenge(p) / (N - 1), D = 0, r = [p[0]], q = p.slice();
    for (var i = 1; i < q.length; i++) {
      if (q[i].id !== q[i - 1].id) continue;
      var d = Math.hypot(q[i].x - q[i - 1].x, q[i].y - q[i - 1].y);
      if (D + d >= I && d > 0) {
        var t = (I - D) / d, n = { x: q[i - 1].x + t * (q[i].x - q[i - 1].x), y: q[i - 1].y + t * (q[i].y - q[i - 1].y), id: q[i].id };
        r.push(n); q.splice(i, 0, n); D = 0;
      } else D += d;
    }
    while (r.length < N) r.push({ x: q[q.length - 1].x, y: q[q.length - 1].y, id: q[q.length - 1].id });
    return r.slice(0, N);
  }
  function normal(p) {
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, cx = 0, cy = 0;
    p.forEach(function (q) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); });
    var s = Math.max(x1 - x0, y1 - y0) || 1;
    p = p.map(function (q) { return { x: (q.x - x0) / s, y: (q.y - y0) / s, id: q.id }; });
    p.forEach(function (q) { cx += q.x / p.length; cy += q.y / p.length; });
    return p.map(function (q) { return { x: q.x - cx, y: q.y - cy, id: q.id }; });
  }
  function wolke(st) { return normal(neu(pfad(st))); }
  function abstand(a, b, start) {
    var frei = [], sum = 0, i = start;
    do {
      var best = Infinity, k = -1;
      for (var j = 0; j < b.length; j++) if (!frei[j]) { var d = Math.hypot(a[i].x - b[j].x, a[i].y - b[j].y); if (d < best) { best = d; k = j; } }
      frei[k] = true; sum += (1 - ((i - start + N) % N) / N) * best; i = (i + 1) % N;
    } while (i !== start);
    return sum;
  }
  function vergleich(a, b) {
    var m = Infinity, step = Math.floor(Math.pow(N, 0.5));
    for (var i = 0; i < N; i += step) m = Math.min(m, abstand(a, b, i), abstand(b, a, i));
    return m;
  }
  // Ziffern im Kasten 50 × 100, x nach rechts, y nach unten
  var FORMEN = {
    '0': [[[[25, 0], [6, 12], [0, 50], [6, 88], [25, 100], [44, 88], [50, 50], [44, 12], [25, 0]]]],
    '1': [[[[8, 22], [30, 0], [30, 100]]], [[[25, 0], [25, 100]]]],
    '2': [[[[0, 22], [14, 3], [34, 0], [48, 14], [44, 40], [0, 100], [52, 100]]]],
    '3': [[[[0, 12], [16, 0], [36, 2], [46, 16], [40, 36], [20, 48], [42, 58], [50, 78], [40, 95], [20, 100], [0, 92]]]],
    '4': [[[[32, 0], [0, 66], [54, 66]], [[38, 28], [38, 100]]]],
    '5': [[[[46, 0], [8, 0], [4, 42], [25, 36], [45, 48], [50, 72], [38, 95], [15, 100], [0, 90]]],
          [[[8, 0], [4, 42], [25, 36], [45, 48], [50, 72], [38, 95], [15, 100], [0, 90]], [[8, 0], [48, 0]]]],
    '6': [[[[44, 4], [26, 0], [10, 14], [2, 40], [2, 70], [12, 94], [28, 100], [44, 92], [50, 72], [42, 54], [26, 48], [10, 56], [2, 70]]]],
    '7': [[[[0, 0], [50, 0], [18, 100]]], [[[0, 0], [50, 0], [18, 100]], [[10, 50], [44, 50]]]],
    '8': [[[[25, 48], [8, 32], [8, 12], [25, 0], [42, 12], [42, 32], [25, 48], [6, 64], [2, 84], [16, 100], [34, 100], [48, 84], [44, 64], [25, 48]]],
          [[[42, 12], [25, 0], [8, 12], [8, 32], [25, 48], [44, 64], [48, 84], [34, 100], [16, 100], [2, 84], [6, 64], [25, 48], [42, 32], [42, 12]]]],
    '9': [[[[48, 26], [40, 6], [24, 0], [8, 8], [2, 26], [10, 42], [26, 46], [42, 38], [48, 24], [48, 60], [42, 100]]]]
  };
  var VORLAGEN = [];
  Object.keys(FORMEN).forEach(function (z) {
    FORMEN[z].forEach(function (f) {
      [-0.25, 0, 0.25].forEach(function (sch) {
        [0.8, 1, 1.2].forEach(function (hy) {
          var st = f.map(function (s) { return s.map(function (q) { return [q[0] - sch * q[1], q[1] * hy]; }); });
          VORLAGEN.push({ z: z, n: f.length, w: wolke(st) });
        });
      });
    });
  });
  function gruppen(striche) {
    var s = striche.filter(function (st) {   // Tupfer ohne Länge zählen nicht
      var l = 0; for (var i = 1; i < st.length; i++) l += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]);
      return l > 5;
    }).map(function (st) {
      var xs = st.map(function (q) { return q[0]; });
      return { st: st, a: Math.min.apply(null, xs), b: Math.max.apply(null, xs) };
    }).sort(function (u, v) { return u.a - v.a; });
    var g = [];
    s.forEach(function (t) {
      var h = g[g.length - 1];
      if (h) {
        var ueber = Math.min(h.b, t.b) - Math.max(h.a, t.a), schmal = Math.max(6, Math.min(h.b - h.a, t.b - t.a));
        if (ueber > -3 && ueber >= 0.3 * schmal - 3) { h.st.push(t.st); h.a = Math.min(h.a, t.a); h.b = Math.max(h.b, t.b); return; }
      }
      g.push({ st: [t.st], a: t.a, b: t.b });
    });
    return g;
  }
  function zeichen(st) {
    var w = wolke(st), best = Infinity, z = '?', gleich = VORLAGEN.filter(function (v) { return v.n === st.length; });
    (gleich.length ? gleich : VORLAGEN).forEach(function (v) { var d = vergleich(w, v.w); if (d < best) { best = d; z = v.z; } });
    return best < 3 ? z : '?';   // zu weit von allen Vorlagen: unleserlich
  }
  // Gelesene Zeichen als Text, z. B. '108' oder '1?8'
  return { lesen: function (striche) { return gruppen(striche).map(function (g) { return zeichen(g.st); }).join(''); } };
})();

// Schreibfeld unten über der Leiste: Feld zum Schreiben, darunter das Gelesene, ↶ (letzten Strich weg) und Prüfen.
// pruefen(text) bekommt das Gelesene. Die Karte verschwindet beim Levelwechsel und beim Gang zur Startseite.
// opt.text: die Frage, oben in der Karte direkt über dem Feld; opt.einheit: hinter der gelesenen Zahl (sonst °).
var PRUEFEN = { de: 'Prüfen', en: 'Check', fi: 'Tarkista', tr: 'Kontrol et', fr: 'Vérifier', es: 'Comprobar', ja: 'たしかめる', ar: 'تحقق' };
var feldKarte = null, feldStriche = [], feldPruefen = null, feldOpt = {};
function feldZeichnen() {
  var pad = feldKarte.querySelector('canvas'), ctx = pad.getContext('2d'), r = window.devicePixelRatio || 1;
  var w = pad.clientWidth, h = pad.clientHeight;
  if (pad.width !== Math.round(w * r)) { pad.width = Math.round(w * r); pad.height = Math.round(h * r); }
  ctx.setTransform(r, 0, 0, r, 0, 0); ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(56,41,26,0.18)'; ctx.lineWidth = 1;   // Schreiblinie
  ctx.beginPath(); ctx.moveTo(10, h * 0.78); ctx.lineTo(w - 10, h * 0.78); ctx.stroke();
  ctx.strokeStyle = C.INK; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  feldStriche.forEach(function (st) {
    ctx.beginPath(); ctx.moveTo(st[0][0], st[0][1]);
    st.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
    if (st.length === 1) ctx.lineTo(st[0][0] + 0.1, st[0][1]);
    ctx.stroke();
  });
  var t = ZIFFERN.lesen(feldStriche);
  var einheit = feldOpt.einheit !== undefined ? feldOpt.einheit : '°', frage = feldKarte.querySelector('.frage');
  feldKarte.querySelector('.gelesen').textContent = t ? t + einheit : '';
  frage.textContent = feldOpt.text ? App.wahl(feldOpt.text) : ''; frage.hidden = !feldOpt.text;
  feldKarte.querySelector('.pruefen').textContent = App.wahl(PRUEFEN);
}
function schreibfeld(pruefen, opt) {
  feldPruefen = pruefen; feldStriche = []; feldOpt = opt || {};
  if (!feldKarte) {
    feldKarte = document.createElement('div');
    feldKarte.id = 'wschreib';
    feldKarte.style.cssText = 'position:absolute;z-index:3;left:0;right:0;bottom:calc(var(--unten,70px) + 8px);' +
      'width:min(520px,calc(100% - 32px));margin:0 auto;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;' +
      'padding:12px;border-radius:14px;background:#fbf4e2;box-shadow:0 6px 20px rgba(56,41,26,.18),0 1px 3px rgba(56,41,26,.12);';
    feldKarte.innerHTML = '<p class="frage" style="margin:0 2px;line-height:1.3;text-align:center;font-size:17px;font-weight:500;color:' + C.INK + '"></p>' +
      '<canvas style="width:100%;height:104px;display:block;touch-action:none;background:#fffaf0;' +
      'border:1.2px dashed rgba(56,41,26,.45);border-radius:10px"></canvas>' +
      '<p class="gelesen" style="margin:0;min-height:1.2em;line-height:1.2;text-align:center;font-size:20px" dir="ltr"></p>' +
      '<div style="display:flex;gap:8px"><button class="opt" data-w="weg" style="flex:0 0 56px;font-size:22px" aria-label="↶">↶</button>' +
      '<button class="opt pruefen" data-w="pruefen" style="flex:1"></button></div>';
    document.getElementById('hud').parentNode.appendChild(feldKarte);
    var pad = feldKarte.querySelector('canvas'), st = null;
    function pos(e) { var b = pad.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; }
    pad.addEventListener('pointerdown', function (e) {
      e.preventDefault(); pad.setPointerCapture(e.pointerId);
      if (Z && Z.falsch) falschWeg();   // ein falscher Versuch verschwindet beim Weiterschreiben
      st = [pos(e)]; feldStriche.push(st); feldZeichnen();
    });
    pad.addEventListener('pointermove', function (e) { if (!st) return; e.preventDefault(); st.push(pos(e)); feldZeichnen(); });
    function ende() { st = null; }
    pad.addEventListener('pointerup', ende); pad.addEventListener('pointercancel', ende);
    feldKarte.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      if (b.getAttribute('data-w') === 'weg') { feldStriche.pop(); if (Z && Z.falsch) falschWeg(); feldZeichnen(); }
      else if (feldPruefen) feldPruefen(ZIFFERN.lesen(feldStriche));
    });
  }
  feldKarte.hidden = false;
  feldZeichnen();
  App.render();
}
function feldWeg() { if (feldKarte) feldKarte.hidden = true; feldPruefen = null; App.render(); }
function feldLeeren() { feldStriche = []; if (feldKarte && !feldKarte.hidden) feldZeichnen(); }
// Oberkante der Schreibkarte (oder der Leiste unten), damit das Bild darüber Platz findet
function feldOben() { return feldKarte && !feldKarte.hidden ? feldKarte.getBoundingClientRect().top : S.h - (S.unten || 70); }
var LESEN = { de: 'Ich kann die Zahl nicht lesen. Schreib die Ziffern etwas größer und mit Abstand.',
              en: 'I can’t read the number. Write the digits a bit bigger and apart.',
              fi: 'En pysty lukemaan lukua. Kirjoita numerot vähän isommin ja erilleen.',
              tr: 'Sayıyı okuyamıyorum. Rakamları biraz daha büyük ve aralıklı yaz.',
              fr: 'Je n’arrive pas à lire le nombre. Écris les chiffres un peu plus grands et espacés.',
              es: 'No puedo leer el número. Escribe las cifras un poco más grandes y separadas.',
              ja: '数が読めません。数字を少し大きく、間をあけて書こう。',
              ar: 'لا أستطيع قراءة العدد. اكتب الأرقام أكبر قليلًا وبمسافات بينها.' };
// Frage mit Schreibfeld: richtig ist die gesuchte Zahl, hinweis der Text der roten Karte, fertig() läuft bei richtiger Antwort,
// opt wie bei schreibfeld (Fragetext in der Karte, Einheit hinter der Zahl)
function frage(richtig, hinweis, fertig, opt) {
  schreibfeld(function (t) {
    if (!t || t.indexOf('?') >= 0) { falsch(LESEN); App.render(); return; }
    if (Number(t) !== richtig) { falsch(hinweis); feldLeeren(); App.render(); return; }
    falschWeg(); feldWeg(); fertig(); App.render();
  }, opt);
}
function feldOffen() { return !!(feldKarte && !feldKarte.hidden); }
// Höhe der ersten von zeilen Textzeilen unten (über dem Schreibfeld, sonst über der Leiste bzw. der grünen Karte)
function textY(zeilen) {
  if (feldOffen()) return feldOben() - 12 - 22 * zeilen;
  var y = S.h - (S.unten || 70) - (document.body.classList.contains('geschafft') ? 80 : 2) - 22 * zeilen;
  // eine hohe grüne Karte (langer Text, schmaler Bildschirm) schiebt die Zeilen weiter nach oben
  var f = document.getElementById('fertig');
  if (f && !f.hidden && document.body.classList.contains('geschafft')) y = Math.min(y, f.getBoundingClientRect().top - 14 - 22 * (zeilen - 1) - 10);
  return y;
}
// Platz fürs Bild zwischen Aufgabentext und den Textzeilen unten. Rechnet immer mit der grünen Karte,
// damit das Bild beim Lösen nicht springt; mit offenem Schreibfeld wird es kleiner.
function platz(zeilen) {
  var hud = document.getElementById('hud'), oben = (hud && hud.firstChild ? hud.getBoundingClientRect().bottom : 60) + 24;
  var z = zeilen || 2, unten = (feldOffen() ? feldOben() - 12 : S.h - (S.unten || 70) - 80) - 22 * z - 30;
  if (unten - oben < 60) unten = oben + 60;   // sehr kleiner Bildschirm: Bild klein, aber nie unter dem Schreibfeld
  return { oben: oben, unten: unten, my: (oben + unten) / 2, h: unten - oben };
}
// Gleichung aus farbigen Stücken, mittig in Höhe y
function zeile(ctx, teile, y, groesse) {
  ctx.save();
  ctx.font = '400 ' + (groesse || 20) + 'px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  var breite = teile.reduce(function (s, t) { return s + ctx.measureText(t.t).width; }, 0), x = (S.w - breite) / 2;
  teile.forEach(function (t) { ctx.fillStyle = t.c; ctx.fillText(t.t, x, y); x += ctx.measureText(t.t).width; });
  ctx.restore();
}
App.winkel.schreibfeld = schreibfeld; App.winkel.feldWeg = feldWeg; App.winkel.feldLeeren = feldLeeren;
App.winkel.feldOben = feldOben; App.winkel.ziffern = ZIFFERN; App.winkel.frage = frage; App.winkel.LESEN = LESEN;
App.winkel.feldOffen = feldOffen; App.winkel.textY = textY; App.winkel.platz = platz; App.winkel.zeile = zeile;

/* ===================== Level laden und merken ===================== */
function bild() { var lv = LEVELS[W.level]; return lv && lv.bild ? lv.bild(Z) : null; }
function loadLevel(n, leer) {
  W.level = n;
  falschWeg();
  S.vs = 1; S.vth = 0; S.ox = 0; S.oy = 0; S.loupe = null;
  App.resetTemp();
  var lv = LEVELS[n];
  feldWeg();   // das Level blendet sein Schreibfeld selbst wieder ein
  Z = { falsch: false };
  lv.neu(Z);
  if (!leer) {
    var b = W.solutions[n] || W.work[n];
    if (b && lv.ausBild) lv.ausBild(Z, b);
  }
  if (lv.start) lv.start(Z);   // z. B. Schreibfeld einblenden, wenn das Level es gerade braucht
  // Nur die Knöpfe unten, die das Level braucht
  var wz = lv.werkzeuge || ['clear'];
  [['b-undo', 'undo'], ['b-clear', 'clear'], ['b-view', 'view']].forEach(function (k) {
    document.getElementById(k[0]).hidden = wz.indexOf(k[1]) < 0;
  });
  App.applyView();
  if (S.onLevel) S.onLevel(n, W.solved.has(n));
}
function storeCurrent() {
  if (!Z) return;
  var b = bild();
  if (W.solved.has(W.level)) { if (b) W.solutions[W.level] = b; }
  else if (b) W.work[W.level] = b; else delete W.work[W.level];
}
function nextLevel(d) {
  var n = LEVELS.length;
  if (!n) return;
  storeCurrent();
  loadLevel((W.level + (d || 1) + n) % n);
  saveProgress();
}
function saveProgress() { if (LEVELS.length) App.speichern(STORE_KEY, LEVELS, W, W.level); }
function lv() { return LEVELS[W.level]; }

App.bereich({
  id: 'winkel',
  name: { de: 'Winkel', en: 'Angles', fi: 'Kulmat', tr: 'Açılar', fr: 'Angles', es: 'Ángulos', ja: '角', ar: 'الزوايا' },
  icon: '<svg viewBox="0 0 40 44"><path d="M6 36H36M6 36L28 12"/><path d="M18 36A12 12 0 0 0 14.11 27.15"/></svg>',
  werkzeuge: [],
  drehen: false,
  init: function () {
    LEVELS = App.levelListe('winkel');
    var n = App.laden(STORE_KEY, null, LEVELS, W);
    if (n !== null) W.start_level = n;
  },
  levels: function () { return LEVELS; },
  solved: function () { return W.solved; },
  open: function () { loadLevel(Math.max(0, Math.min(W.start_level, LEVELS.length - 1))); },
  draw: function (ctx, ws) { if (Z) lv().draw(ctx, Z, ws); },
  // Solange eine Frage offen ist (Schreibfeld da), keine Rechnung unter dem Bild; sie kommt erst nach der richtigen Antwort.
  // Ein Level, das dort die Frage selbst stellt, setzt overlayBeiFrage und zeichnet dann nur die Frage.
  overlay: function (ctx) {
    if (feldOffen()) feldZeichnen();   // Fragetext und Knopf in der gewählten Sprache
    if (Z && lv().overlay && (!feldOffen() || lv().overlayBeiFrage)) lv().overlay(ctx, Z); },
  down: function (w) { if (Z) { lv().down(Z, w); App.render(); } },
  move: function (w) { if (Z) { lv().move(Z, w); App.render(); } },
  up: function (w) { if (Z) { lv().up(Z, w); App.render(); } },
  check: function () {},
  undo: function () {},
  // Papierkorb: Level leer und wieder ungelöst
  clear: function () {
    W.solved.delete(W.level); delete W.solutions[W.level]; delete W.work[W.level];
    loadLevel(W.level, true); saveProgress();
  },
  next: nextLevel,
  persist: function () { falschWeg(); storeCurrent(); W.start_level = W.level; saveProgress(); },
  sprache: function () {
    if (karte && !karte.hidden) karte.firstChild.textContent = App.wahl(karte.text);
    if (feldKarte && !feldKarte.hidden) feldZeichnen();
  }
});
})();
