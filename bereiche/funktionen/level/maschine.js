// Level: Die Maschine. Zufällige Regel m·x+b, Eingabe 0 bis 9, danach "Was kommt bei 10 heraus?".
App.level('funktionen', {
  id: 'maschine',
  text: {
    de: { title: 'Die Maschine',
          task: 'Tippe auf eine Zahl. Sie fällt in die Maschine, und eine neue Zahl kommt heraus. Finde die Regel.',
          done: 'Richtig! Die Maschine rechnet immer nach derselben Regel.' },
    en: { title: 'The machine',
          task: 'Tap a number. It drops into the machine, and a new number comes out. Find the rule.',
          done: 'Right! The machine always works with the same rule.' },
    fi: { title: 'Kone',
          task: 'Napauta lukua. Se putoaa koneeseen, ja ulos tulee uusi luku. Keksi sääntö.',
          done: 'Oikein! Kone laskee aina saman säännön mukaan.' },
    tr: { title: 'Makine',
          task: 'Bir sayıya dokun. Sayı makineye düşer ve yeni bir sayı çıkar. Kuralı bul.',
          done: 'Doğru! Makine hep aynı kurala göre hesaplar.' },
    fr: { title: 'La machine',
          task: 'Touche un nombre. Il tombe dans la machine, et un nouveau nombre en sort. Trouve la règle.',
          done: 'Bravo ! La machine calcule toujours avec la même règle.' },
    es: { title: 'La máquina',
          task: 'Toca un número. Cae en la máquina y sale un número nuevo. Descubre la regla.',
          done: '¡Correcto! La máquina siempre calcula con la misma regla.' },
    ja: { title: 'マシン',
          task: '数をタップしよう。数がマシンに入り、新しい数が出てきます。きまりを見つけましょう。',
          done: '正解！マシンはいつも同じきまりで計算します。' },
    ar: { title: 'الآلة',
          task: 'اضغط على عدد. يسقط في الآلة ويخرج عدد جديد. اكتشف القاعدة.',
          done: 'صحيح! الآلة تحسب دائمًا بالقاعدة نفسها.' }
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
      html += '<p class="hint">' + App.wahl({
        de: 'Füttere die Maschine noch ' + n + ' Mal.',
        en: 'Feed the machine ' + n + ' more ' + (n === 1 ? 'time.' : 'times.'),
        fi: 'Syötä koneeseen vielä ' + (n === 1 ? 'kerran.' : n + ' kertaa.'),
        tr: 'Makineyi ' + n + ' kez daha besle.',
        fr: 'Nourris la machine encore ' + n + ' fois.',
        es: 'Alimenta la máquina ' + n + (n === 1 ? ' vez más.' : ' veces más.'),
        ja: 'あと' + n + '回マシンに入れましょう。',
        ar: n === 1 ? 'أدخل عددًا في الآلة مرة أخرى.' : 'أدخل عددًا في الآلة ' + n + ' مرات أخرى.'
      }) + '</p>';
    } else {
      html += '<p class="q">' + App.wahl({ de: 'Was kommt bei 10 heraus?', en: 'What comes out for 10?',
        fi: 'Mitä tulee ulos luvulla 10?', tr: '10 için ne çıkar?', fr: 'Que sort-il pour 10 ?', es: '¿Qué sale con 10?',
        ja: '10を入れると何が出る？', ar: 'ماذا يخرج عند 10؟' }) + '</p>' + K.optButtons(M.opts, '');
    }
    return html;
  },
  click: function (M, act, d) {
    if (act === 'feed') {
      var y = App.funk.f(M.r, d.n);
      M.last = { x: d.n, y: y }; M.fed.push(M.last); M.run = true; M.fb = '';
    } else if (act === 'ans') {
      if (d.v === M.ans) {
        var a = M.ans;
        M.fb = { de: 'Richtig! Bei 10 kommt ' + a + ' heraus.', en: 'Right! For 10, ' + a + ' comes out.',
          fi: 'Oikein! Luvulla 10 tulee ulos ' + a + '.', tr: 'Doğru! 10 için ' + a + ' çıkar.',
          fr: 'Bravo ! Pour 10, il sort ' + a + '.', es: '¡Correcto! Con 10 sale ' + a + '.',
          ja: '正解！10を入れると' + a + 'が出ます。', ar: 'صحيح! عند 10 يخرج ' + a + '.' };
        App.funk.finish();
      } else {
        M.wrong++;
        M.fb = M.wrong >= 2
          ? { de: 'Tipp: Vergleiche zwei Paare. Um wie viel wächst die Ausgabe, wenn die Eingabe um 1 größer wird?',
              en: 'Tip: Compare two pairs. How much does the output grow when the input gets 1 bigger?',
              fi: 'Vinkki: Vertaa kahta paria. Kuinka paljon tulos kasvaa, kun syöte kasvaa yhdellä?',
              tr: 'İpucu: İki çifti karşılaştır. Girdi 1 artınca çıktı ne kadar artıyor?',
              fr: 'Astuce : compare deux paires. De combien la sortie augmente-t-elle quand l’entrée augmente de 1 ?',
              es: 'Pista: compara dos parejas. ¿Cuánto crece la salida cuando la entrada aumenta en 1?',
              ja: 'ヒント：2つの組をくらべよう。入れる数が1増えると、出る数はいくつ増える？',
              ar: 'تلميح: قارن زوجين. بكم يزداد الناتج عندما يزيد المدخل بمقدار 1؟' }
          : { de: 'Nicht ganz. Schau dir die Paare noch einmal an.', en: 'Not quite. Look at the pairs again.',
              fi: 'Ei aivan. Katso pareja vielä kerran.', tr: 'Tam değil. Çiftlere bir daha bak.',
              fr: 'Pas tout à fait. Regarde encore les paires.', es: 'Casi. Mira otra vez las parejas.',
              ja: 'おしい。組をもう一度見てみよう。', ar: 'ليس تمامًا. انظر إلى الأزواج مرة أخرى.' };
      }
    }
  }
});
