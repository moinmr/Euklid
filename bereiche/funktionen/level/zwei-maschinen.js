// Level: Zwei Maschinen, eine ist zufällig kaputt. Antwort erst, wenn beide mit derselben Zahl mindestens zweimal getestet wurden.
App.level('funktionen', {
  id: 'zwei-maschinen',
  text: {
    de: { title: 'Zwei Maschinen',
          task: 'Eine Maschine ist kaputt. Füttere beide mit Zahlen, auch mehrmals mit derselben. Welche ist verlässlich?',
          done: 'Richtig! Eine Funktion gibt zu jeder Eingabe immer dasselbe aus.' },
    en: { title: 'Two machines',
          task: 'One machine is broken. Feed both with numbers, also with the same number more than once. Which one is reliable?',
          done: 'Right! A function always gives the same output for each input.' }
  },
  start: function (M) {
    var rnd = App.funk.rnd;
    var ra = { m: 1 + rnd(3), b: rnd(4) }, rb;
    do { rb = { m: 1 + rnd(3), b: rnd(4) }; } while (rb.m === ra.m && rb.b === ra.b);
    M.rules = [ra, rb]; M.bad = rnd(2);
    M.logs = [[], []]; M.lastOut = [{}, {}]; M.last = [null, null]; M.sel = 2;
  },
  html: function (M) {
    var K = App.funk, names = ['A', 'B'], html = '<div class="cols">', dis = M.done ? ' disabled' : '';
    for (var i = 0; i < 2; i++) {
      var ls = M.last[i], run2 = M.run === i;
      html += '<div class="mcol"><h3>' + App.wahl({ de: 'Maschine ', en: 'Machine ' }) + names[i] + '</h3><div class="mbox' + (run2 ? ' run' : '') + '">?</div>' +
        '<div class="last">' + (ls ? ls.x + ' → <b>' + ls.y + '</b>' : '–') + '</div>' +
        '<button class="feedbtn" data-act="feedm" data-i="' + i + '"' + dis + '>' + App.wahl({ de: 'Füttern', en: 'Feed' }) + '</button>' +
        '<div class="log">' + M.logs[i].map(function (p) { return p.x + '→' + p.y; }).join(' · ') + '</div></div>';
    }
    M.run = false;
    html += '</div>' + K.keypad('sel', M.sel);
    html += '<p class="hint">' + App.wahl({ de: 'Wähle eine Zahl und füttere damit eine Maschine.', en: 'Pick a number and feed it to a machine.' }) + '</p>';
    var rel = App.wahl({ de: ' ist verlässlich', en: ' is reliable' });
    html += '<div class="opts"><button class="opt" data-act="rel" data-i="0"' + dis + '>A' + rel + '</button>' +
      '<button class="opt" data-act="rel" data-i="1"' + dis + '>B' + rel + '</button></div>';
    return html;
  },
  click: function (M, act, d) {
    var i = d.i;
    if (act === 'sel') {
      M.sel = d.n;
    } else if (act === 'feedm') {
      var x = M.sel, out = App.funk.f(M.rules[i], x);
      if (i === M.bad && M.lastOut[i][x] !== undefined) {
        var offs = App.funk.shuffle([-1, 1, 2]), k;
        for (k = 0; k < offs.length; k++) { if (out + offs[k] !== M.lastOut[i][x]) { out += offs[k]; break; } }
      }
      M.lastOut[i][x] = out;
      M.last[i] = { x: x, y: out }; M.logs[i].push(M.last[i]); M.run = i; M.fb = '';
    } else if (act === 'rel') {
      var tested = [0, 1].every(function (q) {
        var c = {}; M.logs[q].forEach(function (p) { c[p.x] = (c[p.x] || 0) + 1; });
        return Object.keys(c).some(function (key) { return c[key] >= 2; });
      });
      if (!tested) {
        M.fb = { de: 'Teste erst beide Maschinen: Füttere jede mindestens zweimal mit derselben Zahl.',
                 en: 'Test both machines first: feed each one the same number at least twice.' };
      } else if (i === 1 - M.bad) {
        var bx = null;
        M.logs[M.bad].forEach(function (p) { if (bx === null && M.logs[M.bad].some(function (q) { return q.x === p.x && q.y !== p.y; })) bx = p.x; });
        var outs = M.logs[M.bad].filter(function (p) { return p.x === bx; }).map(function (p) { return p.y; });
        var nm = M.bad ? 'B' : 'A';
        M.fb = { de: 'Richtig! Maschine ' + nm + ' gibt bei ' + bx + ' mal ' + outs.slice(0, 2).join(' und ') + ' aus.',
                 en: 'Right! For ' + bx + ', machine ' + nm + ' gives ' + outs.slice(0, 2).join(' and ') + '.' };
        App.funk.finish();
      } else {
        M.fb = { de: 'Nein. Schau, welche Maschine bei derselben Zahl verschiedene Ergebnisse liefert.',
                 en: 'No. Look for the machine that gives different results for the same number.' };
      }
    }
  }
});
