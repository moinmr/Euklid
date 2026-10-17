/* Sprachen: welche zwei es gibt, welche gerade gilt, und die Texte des Kerns.
   Bereiche und Level bringen ihre Texte selbst mit, als { de: ..., en: ... }. */
(function () {
'use strict';
var App = window.App;

// Die Sprachen der App. Die erste ist die Grundsprache und springt ein, wenn ein Text fehlt.
App.sprachen = [
  { code: 'de', kurz: 'DE' },
  { code: 'en', kurz: 'EN' }
];

var KEY = 'mathe-sprache';
var lang = App.sprachen[0].code;
try {
  var gespeichert = localStorage.getItem(KEY);
  if (App.sprachen.some(function (s) { return s.code === gespeichert; })) lang = gespeichert;
} catch (e) { /* ignorieren */ }

App.sprache = function () { return lang; };
App.setzeSprache = function (code) {
  lang = code;
  try { localStorage.setItem(KEY, code); } catch (e) { /* ignorieren */ }
  if (App.nachSprache) App.nachSprache();
};
App.wechsleSprache = function () {
  var L = App.sprachen, i = 0;
  for (var k = 0; k < L.length; k++) if (L[k].code === lang) i = k;
  App.setzeSprache(L[(i + 1) % L.length].code);
};

// { de: x, en: y } -> Wert in der aktuellen Sprache, sonst in der Grundsprache. Ein einfacher Text bleibt, wie er ist.
App.wahl = function (o) {
  if (!o) return '';
  if (typeof o !== 'object') return o;
  return o[lang] !== undefined ? o[lang] : o[App.sprachen[0].code];
};
// Text eines Levels: lv.text = { de: { title, task, done }, en: { ... } }. Ein Text darf eine Funktion sein.
App.txt = function (lv, feld) {
  var t = lv.text || {}, cur = t[lang] || {}, v = cur[feld];
  if (v === undefined) v = (t[App.sprachen[0].code] || {})[feld];
  if (typeof v === 'function') v = v();
  return v || '';
};

var TEXTE = {
  mathe: { de: 'Mathe', en: 'Maths' },
  waehle: { de: 'Wähle einen Bereich', en: 'Choose a topic' },
  nichts: { de: 'Noch nichts gelöst', en: 'Nothing solved yet' },
  stand: { de: function (n, t) { return n + ' von ' + t + ' Leveln gelöst'; },
           en: function (n, t) { return n + ' of ' + t + ' levels solved'; } },
  alle: { de: 'Alle Level geschafft, sehr gut!', en: 'All levels done, well done!' },
  weiter: { de: 'Weiter mit ›.', en: 'Go on with ›.' },
  geschafft: { de: function (n) { return 'Level ' + n + ' geschafft! Weiter mit ›.'; },
               en: function (n) { return 'Level ' + n + ' done! Go on with ›.'; } },
  level: { de: 'Level', en: 'Level' },
  schon: { de: ' (schon gelöst)', en: ' (already solved)' },
  werkzeuge: { de: 'Werkzeuge', en: 'Tools' },
  startseite: { de: 'Startseite', en: 'Home' },
  punkt: { de: 'Punkt', en: 'Point' },
  linie: { de: 'Linie', en: 'Line' },
  zirkel: { de: 'Zirkel', en: 'Compass' },
  schieben: { de: 'Ecke schieben', en: 'Move corner' },
  trennen: { de: 'Trennen', en: 'Split' },
  zurueck: { de: 'Zurück', en: 'Undo' },
  loeschen: { de: 'Alles löschen', en: 'Clear all' },
  ansicht: { de: 'Ansicht zurücksetzen', en: 'Reset view' },
  naechstes: { de: 'Nächstes Level', en: 'Next level' },
  vorheriges: { de: 'Vorheriges Level', en: 'Previous level' },
  sprache: { de: 'Sprache wechseln', en: 'Change language' }
};
App.t = function (key) {
  var v = App.wahl(TEXTE[key]);
  return typeof v === 'function' ? v.apply(null, Array.prototype.slice.call(arguments, 1)) : v;
};
})();
