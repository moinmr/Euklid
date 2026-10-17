// Level: Die Maschine. Zufällige Regel m·x+b, Eingabe 0 bis 9, danach "Was kommt bei 10 heraus?".
App.level('funktionen', {
  id: 'maschine',
  text: {
    de: { title: 'Die Maschine',
          task: 'Tippe auf eine Zahl. Sie fällt in die Maschine, und eine neue Zahl kommt heraus. Finde die Regel.',
          done: 'Richtig! Die Maschine rechnet immer nach derselben Regel.' },
    en: { title: 'The machine',
          task: 'Tap a number. It drops into the machine, and a new number comes out. Find the rule.',
          done: 'Right! The machine always works with the same rule.' }
  },
  start: function (M) {
    var K = App.funk;
    M.r = { m: 2 + K.rnd(3), b: K.rnd(4) };
    M.fed = []; M.last = null;
    M.ans = K.f(M.r, 10);
    M.opts = K.options(M.ans, [M.ans + M.r.m, M.ans - M.r.m, M.ans + 1, M.ans - 1, M.r.m * 10, M.ans + 2 * M.r.m]);
  },
  html: function (M) {
    var K = App.funk, l = M.last, run = M.run, html = '';
    M.run = false;
    html += '<div class="flow"><div class="chip' + (l ? ' on' : '') + '">' + (l ? 'x = ' + l.x : 'x') + '</div>' + K.ARROW +
      '<div class="mbox' + (run ? ' run' : '') + '">?</div>' + K.ARROW +
      '<div class="chip out' + (l ? ' on' : '') + '">' + (l ? l.y : 'y') + '</div></div>';
    html += K.keypad('feed', l ? l.x : -1);
    html += '<div class="hist">' + M.fed.map(function (p) { return '<span>' + p.x + ' → ' + p.y + '</span>'; }).join('') + '</div>';
    if (M.fed.length < 3) {
      var n = 3 - M.fed.length;
      html += '<p class="hint">' + App.wahl({ de: 'Füttere die Maschine noch ' + n + ' Mal.',
        en: 'Feed the machine ' + n + ' more ' + (n === 1 ? 'time.' : 'times.') }) + '</p>';
    } else {
      html += '<p class="q">' + App.wahl({ de: 'Was kommt bei 10 heraus?', en: 'What comes out for 10?' }) + '</p>' + K.optButtons(M.opts, '');
    }
    return html;
  },
  click: function (M, act, d) {
    if (act === 'feed') {
      var y = App.funk.f(M.r, d.n);
      M.last = { x: d.n, y: y }; M.fed.push(M.last); M.run = true; M.fb = '';
    } else if (act === 'ans') {
      if (d.v === M.ans) {
        M.fb = { de: 'Richtig! Bei 10 kommt ' + M.ans + ' heraus.', en: 'Right! For 10, ' + M.ans + ' comes out.' };
        App.funk.finish();
      } else {
        M.wrong++;
        M.fb = M.wrong >= 2
          ? { de: 'Tipp: Vergleiche zwei Paare. Um wie viel wächst die Ausgabe, wenn die Eingabe um 1 größer wird?',
              en: 'Tip: Compare two pairs. How much does the output grow when the input gets 1 bigger?' }
          : { de: 'Nicht ganz. Schau dir die Paare noch einmal an.', en: 'Not quite. Look at the pairs again.' };
      }
    }
  }
});
