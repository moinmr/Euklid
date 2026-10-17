/* ===================== Speichern nach Level-Kennung ===================== */
// Im Speicher: { solved: [id], level: id, solutions: { id: Bild }, work: { id: Bild } }.
// Im Programm bleiben die Positionen als Schlüssel, umgerechnet wird nur beim Speichern und Laden.
// Stände von Leveln, die es gerade nicht gibt, kommen in P.keep und werden mitgespeichert.
(function () {
'use strict';
var App = window.App;

function levelIndex(L, id) {
  for (var i = 0; i < L.length; i++) if (L[i].id === id) return i;
  return -1;
}
function packProgress(L, P, level) {
  var keep = P.keep || { solved: [], solutions: {}, work: {} };
  var d = { solved: keep.solved.slice(), level: L[level] ? L[level].id : null, solutions: {}, work: {} };
  Array.from(P.solved).sort(function (a, b) { return a - b; }).forEach(function (i) {
    if (L[i] && d.solved.indexOf(L[i].id) < 0) d.solved.push(L[i].id);
  });
  ['solutions', 'work'].forEach(function (f) {
    Object.keys(keep[f]).forEach(function (id) { d[f][id] = keep[f][id]; });
    Object.keys(P[f]).forEach(function (k) { if (P[f][k] && L[k]) d[f][L[k].id] = P[f][k]; });
  });
  return d;
}
function unpackProgress(L, d, P) {
  P.solved = new Set(); P.solutions = {}; P.work = {};
  P.keep = { solved: [], solutions: {}, work: {} };
  (d.solved || []).forEach(function (id) {
    var i = levelIndex(L, id);
    if (i >= 0) P.solved.add(i); else P.keep.solved.push(id);
  });
  ['solutions', 'work'].forEach(function (f) {
    var src = d[f] || {};
    Object.keys(src).forEach(function (id) {
      if (!src[id]) return;
      var i = levelIndex(L, id);
      if (i >= 0) P[f][i] = src[id]; else P.keep[f][id] = src[id];
    });
  });
  return Math.max(0, levelIndex(L, d.level));
}
// Alter Stand (nach Position in der damaligen Reihenfolge, die der heutigen entspricht) in Kennungen umrechnen.
function fromOldProgress(L, o) {
  function id(k) { k = Number(k); return k >= 0 && k < L.length && k === Math.floor(k) ? L[k].id : null; }
  var d = { solved: [], level: id(o.level || 0), solutions: {}, work: {} };
  (o.solved || []).forEach(function (k) { var i = id(k); if (i && d.solved.indexOf(i) < 0) d.solved.push(i); });
  ['solutions', 'work'].forEach(function (f) {
    var src = o[f] || {};
    Object.keys(src).forEach(function (k) { var i = id(k); if (i && src[k]) d[f][i] = src[k]; });
  });
  return d;
}
function readProgress(key, oldKey, L) {
  var raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  var old = oldKey ? localStorage.getItem(oldKey) : null;
  if (!old) return null;
  var d = fromOldProgress(L, JSON.parse(old));
  try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) {}
  return d;   // der alte Schlüssel bleibt als Sicherung liegen
}

// Für die Bereiche: Stand P (solved, solutions, work) unter key speichern bzw. laden.
// laden gibt die Position des zuletzt offenen Levels zurück (oder null).
App.speichern = function (key, L, P, level) {
  try { localStorage.setItem(key, JSON.stringify(packProgress(L, P, level))); }
  catch (e) { /* Speichern darf nie stören */ }
};
App.laden = function (key, oldKey, L, P) {
  try {
    var d = readProgress(key, oldKey, L);
    if (d) return unpackProgress(L, d, P);
  } catch (e) { /* ignorieren */ }
  return null;
};
})();
