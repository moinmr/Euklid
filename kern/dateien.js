/* Welche Dateien die App braucht. Die Seite lädt sie der Reihe nach,
   der Service Worker (sw.js) liest dieselbe Liste und speichert alles für offline.
   Läuft in der Seite und im Service Worker, darum kein document außerhalb von dateienLaden. */
(function (g) {
'use strict';
var App = g.App = g.App || {};
App.ordnung = App.ordnung || {};   // Level-Reihenfolge je Bereich, aus bereiche/<bereich>/reihenfolge.js

App.kernDateien = ['kern/sprache.js', 'kern/kern.js', 'kern/speicher.js', 'kern/oberflaeche.js'];
App.festeDateien = ['./', 'index.html', 'kern/stil.css', 'kern/dateien.js', 'bereiche/liste.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

function bereichDateien(b) { return ['bereiche/' + b + '/bereich.js', 'bereiche/' + b + '/reihenfolge.js']; }
function levelDateien(b) {
  return (App.ordnung[b] || []).map(function (id) { return 'bereiche/' + b + '/level/' + id + '.js'; });
}
function flach(listen) { return [].concat.apply([], listen); }

App.alleDateien = function () {
  var b = App.bereiche || [];
  return App.festeDateien.concat(App.kernDateien, flach(b.map(bereichDateien)), flach(b.map(levelDateien)));
};

// Erst Kern, Bereiche und Reihenfolgen, dann die Level in dieser Reihenfolge. Danach fertig().
App.dateienLaden = function (fertig) {
  function laden(liste, weiter) {
    var offen = liste.length;
    if (!offen) { weiter(); return; }
    liste.forEach(function (src) {
      var s = document.createElement('script');
      s.src = src; s.async = false;   // Ausführung in der Reihenfolge der Liste
      s.onload = s.onerror = function () { if (--offen === 0) weiter(); };
      document.head.appendChild(s);
    });
  }
  var b = App.bereiche || [];
  laden(App.kernDateien.concat(flach(b.map(bereichDateien))), function () {
    laden(flach(b.map(levelDateien)), fertig);
  });
};
})(self);
