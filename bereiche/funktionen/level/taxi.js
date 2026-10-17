// Level: Das Taxi. Grundgebühr plus Preis pro km (zufällig), Tabelle für 1, 2, 3, 5 km. Falsche Antworten sind typische Denkfehler.
(function () {
function preis(M, f) { return f(M ? M.g : 3, M ? M.p : 2); }
App.level('funktionen', {
  id: 'taxi',
  text: {
    de: { title: 'Das Taxi',
          task: function () { return preis(App.funk.M(), function (g, p) { return 'Ein Taxi kostet ' + g + ' € Grundgebühr plus ' + p + ' € pro Kilometer. Was kostet jede Fahrt?'; }); },
          done: 'Richtig! Zu jeder Strecke gehört genau ein Preis. Das ist eine Funktion.' },
    en: { title: 'The taxi',
          task: function () { return preis(App.funk.M(), function (g, p) { return 'A taxi costs a ' + g + ' € base fare plus ' + p + ' € per kilometre. What does each ride cost?'; }); },
          done: 'Right! Each distance has exactly one price. That is a function.' }
  },
  start: function (M) {
    var rnd = App.funk.rnd;
    M.g = 2 + rnd(3); M.p = 1 + rnd(3); M.rows = [1, 2, 3, 5]; M.i = 0; M.got = [];
    M.opts = opts(M);
  },
  html: function (M) {
    var html = '<div class="taxi"><div class="h">' + App.wahl({ de: 'Strecke', en: 'Distance' }) + '</div><div class="h">' +
      App.wahl({ de: 'Preis', en: 'Price' }) + '</div>';
    for (var i = 0; i < M.rows.length; i++) {
      var cls = i < M.i ? 'good' : (i === M.i && !M.done ? 'cur' : '');
      html += '<div class="' + cls + '">' + M.rows[i] + ' km</div><div class="' + cls + '">' + (i < M.i ? M.got[i] + ' €' : '?') + '</div>';
    }
    html += '</div>';
    if (!M.done) {
      var km = M.rows[M.i];
      html += '<p class="q">' + App.wahl({ de: 'Was kostet eine Fahrt über ' + km + ' km?', en: 'What does a ' + km + ' km ride cost?' }) + '</p>' +
        App.funk.optButtons(M.opts, ' €');
    }
    return html;
  },
  click: function (M, act, d) {
    if (act !== 'ans') return;
    var km = M.rows[M.i], a = M.g + M.p * km;
    if (d.v === a) {
      M.got.push(a); M.i++; M.fb = '';
      if (M.i >= M.rows.length) {
        M.fb = { de: 'Alle Fahrten richtig berechnet.', en: 'All rides worked out correctly.' };
        App.funk.finish();
      } else {
        M.opts = opts(M);
      }
    } else {
      M.fb = { de: 'Nicht ganz. Rechne: Grundgebühr plus Kilometer mal Preis pro Kilometer.',
               en: 'Not quite. Work it out: base fare plus kilometres times price per kilometre.' };
    }
  }
});
function opts(M) {
  var km = M.rows[M.i], a = M.g + M.p * km;
  return App.funk.options(a, [a + M.p, a - M.p, a + 1, a - 1, M.p * km, M.g + km, M.g * km]);
}
})();
