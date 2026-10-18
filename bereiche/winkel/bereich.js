/* Bereich Winkel. Die Level stehen in level/, ihre Reihenfolge in reihenfolge.js.
   Jedes Level bringt sein Verhalten selbst mit, der Bereich macht nur das Gemeinsame:
   Fortschritt, grüne und rote Karte, Knöpfe unten, Hilfen zum Zeichnen von Winkeln (App.winkel).
   Ein Level hat: neu(Z), down(Z, w), move(Z, w), up(Z, w), draw(ctx, Z, ws), overlay(ctx, Z),
   bild(Z) und ausBild(Z, bild) zum Merken der Zeichnung. Z ist der Zustand des offenen Levels. */
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
  karte.style.bottom = ((S.unten || 70) + 8) + 'px';
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

/* ===================== Level laden und merken ===================== */
function bild() { var lv = LEVELS[W.level]; return lv && lv.bild ? lv.bild(Z) : null; }
function loadLevel(n, leer) {
  W.level = n;
  falschWeg();
  S.vs = 1; S.vth = 0; S.ox = 0; S.oy = 0; S.loupe = null;
  App.resetTemp();
  var lv = LEVELS[n];
  Z = { falsch: false };
  lv.neu(Z);
  if (!leer) {
    var b = W.solutions[n] || W.work[n];
    if (b && lv.ausBild) lv.ausBild(Z, b);
  }
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
  overlay: function (ctx) { if (Z && lv().overlay) lv().overlay(ctx, Z); },
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
  sprache: function () { if (karte && !karte.hidden) karte.firstChild.textContent = App.wahl(karte.text); }
});
})();
