// Level: Zuverlässige Maschinen. Zwei Maschinen, eine ist zufällig kaputt. Antwort erst, wenn beide mit derselben Zahl mindestens zweimal getestet wurden.
App.level('funktionen', {
  id: 'zwei-maschinen',
  text: {
    de: { title: 'Zuverlässige Maschinen',
          task: 'Eine Maschine ist kaputt. Füttere beide mit Zahlen, auch mehrmals mit derselben. Welche ist verlässlich?',
          done: 'Richtig! Eine Funktion gibt zu jeder Eingabe immer dasselbe aus.' },
    en: { title: 'Reliable machines',
          task: 'One machine is broken. Feed both with numbers, also with the same number more than once. Which one is reliable?',
          done: 'Right! A function always gives the same output for each input.' },
    fi: { title: 'Luotettavat koneet',
          task: 'Yksi kone on rikki. Syötä molempiin lukuja, myös samaa lukua monta kertaa. Kumpi on luotettava?',
          done: 'Oikein! Funktio antaa jokaisella syötteellä aina saman tuloksen.' },
    tr: { title: 'Güvenilir makineler',
          task: 'Makinelerden biri bozuk. İkisine de sayılar ver, aynı sayıyı birkaç kez de. Hangisi güvenilir?',
          done: 'Doğru! Bir fonksiyon her girdi için hep aynı çıktıyı verir.' },
    fr: { title: 'Des machines fiables',
          task: 'Une machine est en panne. Donne des nombres aux deux, plusieurs fois le même aussi. Laquelle est fiable ?',
          done: 'Bravo ! Une fonction donne toujours la même sortie pour chaque entrée.' },
    es: { title: 'Máquinas fiables',
          task: 'Una máquina está rota. Dale números a las dos, también el mismo varias veces. ¿Cuál es fiable?',
          done: '¡Correcto! Una función siempre da la misma salida para cada entrada.' },
    ja: { title: '信頼できるマシン',
          task: '1つのマシンはこわれています。両方に数を入れてみよう。同じ数を何回か入れてもいいよ。信頼できるのはどっち？',
          done: '正解！関数は、同じ入力にはいつも同じ出力を返します。' },
    ar: { title: 'آلات موثوقة',
          task: 'إحدى الآلتين معطلة. أدخل أعدادًا في كلتيهما، وأدخل العدد نفسه أكثر من مرة. أيهما يمكن الاعتماد عليها؟',
          done: 'صحيح! الدالة تعطي دائمًا الناتج نفسه لكل مدخل.' }
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
    function maschine(nm) {
      return App.wahl({ de: 'Maschine ' + nm, en: 'Machine ' + nm, fi: 'Kone ' + nm, tr: 'Makine ' + nm, fr: 'Machine ' + nm,
        es: 'Máquina ' + nm, ja: 'マシン' + nm, ar: 'الآلة ' + nm });
    }
    function verlaesslich(nm) {
      return App.wahl({ de: nm + ' ist verlässlich', en: nm + ' is reliable', fi: nm + ' on luotettava', tr: nm + ' güvenilir',
        fr: nm + ' est fiable', es: nm + ' es fiable', ja: nm + 'が信頼できる', ar: 'الآلة ' + nm + ' موثوقة' });
    }
    for (var i = 0; i < 2; i++) {
      var ls = M.last[i], run2 = M.run === i;
      html += '<div class="mcol"><h3>' + maschine(names[i]) + '</h3><div class="mbox' + (run2 ? ' run' : '') + '">?</div>' +
        '<div class="last">' + (ls ? '<span class="rein">' + ls.x + '</span> → <b class="raus">' + ls.y + '</b>' : '–') + '</div>' +
        '<button class="feedbtn" data-act="feedm" data-i="' + i + '"' + dis + '>' +
        App.wahl({ de: 'Füttern', en: 'Feed', fi: 'Syötä', tr: 'Besle', fr: 'Donner', es: 'Dar', ja: '入れる', ar: 'أدخل' }) + '</button>' +
        '<div class="log">' + M.logs[i].map(function (p) { return '<span class="rein">' + p.x + '</span>→<span class="raus">' + p.y + '</span>'; }).join(' · ') + '</div></div>';
    }
    M.run = false;
    html += '</div>' + K.keypad('sel', M.sel);
    html += '<p class="hint">' + App.wahl({ de: 'Wähle eine Zahl und füttere damit eine Maschine.', en: 'Pick a number and feed it to a machine.',
      fi: 'Valitse luku ja syötä se koneeseen.', tr: 'Bir sayı seç ve bir makineye ver.', fr: 'Choisis un nombre et donne-le à une machine.',
      es: 'Elige un número y dáselo a una máquina.', ja: '数を選んで、マシンに入れよう。', ar: 'اختر عددًا وأدخله في إحدى الآلتين.' }) + '</p>';
    html += '<div class="opts"><button class="opt" data-act="rel" data-i="0"' + dis + '>' + verlaesslich('A') + '</button>' +
      '<button class="opt" data-act="rel" data-i="1"' + dis + '>' + verlaesslich('B') + '</button></div>';
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
                 en: 'Test both machines first: feed each one the same number at least twice.',
                 fi: 'Testaa ensin molemmat koneet: syötä kumpaankin sama luku vähintään kahdesti.',
                 tr: 'Önce iki makineyi de dene: her birine aynı sayıyı en az iki kez ver.',
                 fr: 'Teste d’abord les deux machines : donne à chacune le même nombre au moins deux fois.',
                 es: 'Primero prueba las dos máquinas: dale a cada una el mismo número al menos dos veces.',
                 ja: 'まず両方のマシンをためそう。それぞれに同じ数を2回以上入れてね。',
                 ar: 'اختبر الآلتين أولًا: أدخل في كل منهما العدد نفسه مرتين على الأقل.' };
      } else if (i === 1 - M.bad) {
        var bx = null;
        M.logs[M.bad].forEach(function (p) { if (bx === null && M.logs[M.bad].some(function (q) { return q.x === p.x && q.y !== p.y; })) bx = p.x; });
        var o = M.logs[M.bad].filter(function (p) { return p.x === bx; }).map(function (p) { return p.y; }).slice(0, 2);
        var nm = M.bad ? 'B' : 'A';
        M.fb = { de: 'Richtig! Maschine ' + nm + ' gibt bei ' + bx + ' mal ' + o.join(' und ') + ' aus.',
                 en: 'Right! For ' + bx + ', machine ' + nm + ' gives ' + o.join(' and ') + '.',
                 fi: 'Oikein! Kone ' + nm + ' antaa luvulla ' + bx + ' välillä ' + o.join(' ja ') + '.',
                 tr: 'Doğru! ' + nm + ' makinesi ' + bx + ' için ' + o.join(' ve ') + ' veriyor.',
                 fr: 'Bravo ! Pour ' + bx + ', la machine ' + nm + ' donne ' + o.join(' et ') + '.',
                 es: '¡Correcto! Con ' + bx + ', la máquina ' + nm + ' da ' + o.join(' y ') + '.',
                 ja: '正解！マシン' + nm + 'は' + bx + 'に対して' + o.join('と') + 'を出します。',
                 ar: 'صحيح! الآلة ' + nm + ' تعطي عند ' + bx + ' القيمتين ' + o.join(' و') + '.' };
        App.funk.finish();
      } else {
        M.fb = { de: 'Nein. Schau, welche Maschine bei derselben Zahl verschiedene Ergebnisse liefert.',
                 en: 'No. Look for the machine that gives different results for the same number.',
                 fi: 'Ei. Katso, kumpi kone antaa samalla luvulla eri tuloksia.',
                 tr: 'Hayır. Aynı sayı için farklı sonuç veren makineye bak.',
                 fr: 'Non. Cherche la machine qui donne des résultats différents pour le même nombre.',
                 es: 'No. Busca la máquina que da resultados distintos con el mismo número.',
                 ja: 'ちがいます。同じ数で違う結果を出すマシンをさがそう。',
                 ar: 'لا. ابحث عن الآلة التي تعطي نتائج مختلفة للعدد نفسه.' };
      }
    }
  }
});
