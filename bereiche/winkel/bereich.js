/* Bereich Winkel. Die Level stehen in level/, ihre Reihenfolge in reihenfolge.js.
   Noch ohne Level: die Karte auf der Startseite ist dann gedämpft. Werkzeuge und Logik
   kommen mit dem ersten Level dazu. */
(function () {
'use strict';
var App = window.App, S = App.S;
var STORE_KEY = 'mathe-winkel';
var LEVELS = [];
var W = { level: 0, start_level: 0, solved: new Set(), solutions: {}, work: {} };

function loadLevel(n) {
  W.level = n;
  App.applyView();
  if (S.onLevel) S.onLevel(n, W.solved.has(n));
}
function nextLevel(d) {
  var n = LEVELS.length;
  if (!n) return;
  loadLevel((W.level + (d || 1) + n) % n);
  saveProgress();
}
function saveProgress() { if (LEVELS.length) App.speichern(STORE_KEY, LEVELS, W, W.level); }
function nichts() {}

App.bereich({
  id: 'winkel',
  name: { de: 'Winkel', en: 'Angles', fi: 'Kulmat', tr: 'Açılar', fr: 'Angles', es: 'Ángulos', ja: '角', ar: 'الزوايا' },
  icon: '<svg viewBox="0 0 40 44"><path d="M6 36H36M6 36L28 12"/><path d="M18 36A12 12 0 0 0 14.11 27.15"/></svg>',
  werkzeuge: [],
  init: function () {
    LEVELS = App.levelListe('winkel');
    var n = App.laden(STORE_KEY, null, LEVELS, W);
    if (n !== null) W.start_level = n;
  },
  levels: function () { return LEVELS; },
  solved: function () { return W.solved; },
  open: function () { loadLevel(Math.min(W.start_level, LEVELS.length - 1)); },
  draw: nichts, down: nichts, move: nichts, up: nichts, check: nichts,
  undo: nichts,
  clear: function () {
    W.solved.delete(W.level); delete W.solutions[W.level]; delete W.work[W.level];
    loadLevel(W.level); saveProgress();
  },
  next: nextLevel,
  persist: saveProgress
});
})();
