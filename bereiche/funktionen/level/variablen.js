// Level: Zahlen mit Namen. Eingabe und Ausgabe bekommen Variablen-Namen (zufällig, z. B. a und b).
// Jede Fütterung kommt in eine Tabelle und als Verbindung auf zwei parallele Zahlenachsen.
// Runde 1: Frage mit den ersten Namen. Runde 2: gleiche Maschine, neue Namen (y rein, x raus).
(function () {
var PAARE = [['a', 'b'], ['x', 'y'], ['n', 'm'], ['t', 's']];

// Variablen-Name in der Farbe für rein oder raus, als eigener Block für Rechts-nach-links-Sprachen
function vn(name, art) { return '<bdi class="vn ' + art + '">' + name + '</bdi>'; }
function gleich(name, art, wert) { return '<bdi>' + vn(name, art) + ' = ' + wert + '</bdi>'; }

function frageStellen(M) {
  var frei = [];
  for (var x = 0; x < 10; x++) if (!M.fed.some(function (p) { return p.x === x; })) frei.push(x);
  M.q = frei[App.funk.rnd(frei.length)];
  M.ans = App.funk.f(M.r, M.q);
  M.opts = App.funk.options(M.ans, [M.ans + M.r.m, M.ans - M.r.m, M.ans + 1, M.ans - 1, M.q + M.r.b, M.r.m * M.q]);
}

// Zwei parallele Zahlenachsen: oben die Eingabe, unten die Ausgabe, jede Fütterung als Verbindung
function achsen(M) {
  var W = 340, L = 34, R = 12, y1 = 24, y2 = 86, max = M.max, i;
  function px(v) { return L + v * (W - L - R) / max; }
  var s = '<svg class="achsen" viewBox="0 0 ' + W + ' 112" aria-hidden="true">';
  s += '<text class="an rein" x="8" y="' + (y1 + 6) + '">' + M.names[0] + '</text>';
  s += '<text class="an raus" x="8" y="' + (y2 + 6) + '">' + M.names[1] + '</text>';
  s += '<line class="ax" x1="' + L + '" y1="' + y1 + '" x2="' + (W - R) + '" y2="' + y1 + '"/>';
  s += '<line class="ax" x1="' + L + '" y1="' + y2 + '" x2="' + (W - R) + '" y2="' + y2 + '"/>';
  for (i = 0; i <= max; i++) {
    var lang = i % 5 === 0, h = lang ? 5 : 3;
    s += '<line class="tk" x1="' + px(i) + '" y1="' + (y1 - h) + '" x2="' + px(i) + '" y2="' + (y1 + h) + '"/>';
    s += '<line class="tk" x1="' + px(i) + '" y1="' + (y2 - h) + '" x2="' + px(i) + '" y2="' + (y2 + h) + '"/>';
    if (lang) {
      s += '<text class="zl" x="' + px(i) + '" y="' + (y1 - 10) + '">' + i + '</text>';
      s += '<text class="zl" x="' + px(i) + '" y="' + (y2 + 21) + '">' + i + '</text>';
    }
  }
  M.fed.forEach(function (p) {
    var neu = M.last && p.x === M.last.x;
    s += '<line class="vb' + (neu ? ' neu' : '') + '" x1="' + px(p.x) + '" y1="' + y1 + '" x2="' + px(p.y) + '" y2="' + y2 + '"/>';
    s += '<circle class="pr" cx="' + px(p.x) + '" cy="' + y1 + '" r="4.5"/>';
    s += '<circle class="pa" cx="' + px(p.y) + '" cy="' + y2 + '" r="4.5"/>';
  });
  return s + '</svg>';
}

// Tabelle quer: oben die Eingaben, unten die Ausgaben, nach Eingabe sortiert, passend zu den Achsen
function tabelle(M) {
  var reihe = M.fed.slice().sort(function (a, b) { return a.x - b.x; });
  var oben = '<tr><th>' + vn(M.names[0], 'rein') + '</th>', unten = '<tr><th>' + vn(M.names[1], 'raus') + '</th>';
  reihe.forEach(function (p) {
    var neu = M.last && p.x === M.last.x ? ' class="neu"' : '';
    oben += '<td' + neu + '>' + p.x + '</td>';
    unten += '<td' + neu + '>' + p.y + '</td>';
  });
  return '<table class="vtab">' + oben + '</tr>' + unten + '</tr></table>';
}

App.level('funktionen', {
  id: 'variablen',
  text: {
    de: { title: 'Zahlen mit Namen',
          task: 'Die Zahl, die reingeht, bekommt einen Namen, und die Zahl, die rauskommt, auch. So ein Name heißt Variable. Füttere die Maschine und schau dir Tabelle und Achsen an.',
          done: 'Richtig! Der Name ist egal. Wichtig ist nur, welche Zahl reingeht und welche rauskommt.' },
    en: { title: 'Numbers with names',
          task: 'The number that goes in gets a name, and so does the number that comes out. Such a name is called a variable. Feed the machine and look at the table and the axes.',
          done: 'Right! The name does not matter. What matters is which number goes in and which comes out.' },
    fi: { title: 'Luvut, joilla on nimi',
          task: 'Sisään menevä luku saa nimen, ja niin saa myös ulos tuleva luku. Tällaista nimeä kutsutaan muuttujaksi. Syötä koneeseen ja katso taulukkoa ja akseleita.',
          done: 'Oikein! Nimellä ei ole väliä. Tärkeää on vain, mikä luku menee sisään ja mikä tulee ulos.' },
    tr: { title: 'Adı olan sayılar',
          task: 'Giren sayıya bir ad verilir, çıkan sayıya da. Böyle bir ada değişken denir. Makineyi besle, tabloya ve eksenlere bak.',
          done: 'Doğru! Adın önemi yok. Önemli olan hangi sayının girip hangisinin çıktığı.' },
    fr: { title: 'Des nombres avec un nom',
          task: 'Le nombre qui entre reçoit un nom, et celui qui sort aussi. Un tel nom s’appelle une variable. Nourris la machine et regarde le tableau et les axes.',
          done: 'Bravo ! Le nom n’a pas d’importance. Ce qui compte, c’est quel nombre entre et lequel sort.' },
    es: { title: 'Números con nombre',
          task: 'El número que entra recibe un nombre, y el que sale también. Ese nombre se llama variable. Alimenta la máquina y mira la tabla y los ejes.',
          done: '¡Correcto! El nombre no importa. Lo que importa es qué número entra y cuál sale.' },
    ja: { title: '名前のついた数',
          task: '入る数にも出る数にも名前をつけます。このような名前を変数といいます。マシンに数を入れて、表と軸を見てみよう。',
          done: '正解！名前は何でもかまいません。大切なのは、どの数が入り、どの数が出るかです。' },
    ar: { title: 'أعداد لها أسماء',
          task: 'العدد الذي يدخل يأخذ اسمًا، وكذلك العدد الذي يخرج. يسمى هذا الاسم متغيرًا. أدخل أعدادًا في الآلة وانظر إلى الجدول والمحورين.',
          done: 'صحيح! الاسم لا يهم. المهم هو أي عدد يدخل وأي عدد يخرج.' }
  },
  start: function (M) {
    var K = App.funk;
    M.r = { m: 1 + K.rnd(2), b: 1 + K.rnd(4) };
    M.max = Math.ceil(K.f(M.r, 9) / 5) * 5;
    M.names = PAARE[K.rnd(PAARE.length)];
    M.round = 1; M.fed = []; M.last = null; M.q = null;
  },
  html: function (M) {
    var K = App.funk, l = M.last, run = M.run, i = M.names[0], o = M.names[1], html = '';
    M.run = false;
    html += '<div class="flow vflow"><div class="vk">' + vn(i, 'rein') + '<div class="chip' + (l ? ' on' : '') + '">' + (l ? l.x : '') + '</div></div>' + K.ARROW +
      '<div class="mbox' + (run ? ' run' : '') + '">?</div>' + K.ARROW +
      '<div class="vk">' + vn(o, 'raus') + '<div class="chip out' + (l ? ' on' : '') + '">' + (l ? l.y : '') + '</div></div></div>';
    // Tasten in einer Reihe und Antworten nebeneinander, damit alles auf einen Handy-Bildschirm passt
    html += K.keypad('feed', -1).replace('class="keys"', 'class="keys reihe"');
    html += tabelle(M) + achsen(M);
    if (M.done) {
      // fertig: nur noch die Rückmeldung
    } else if (M.q === null) {
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
      var I = gleich(i, 'rein', M.q), O = vn(o, 'raus');
      html += '<p class="q">' + App.wahl({
        de: 'Was ist ' + O + ', wenn ' + I + ' ist?', en: 'What is ' + O + ' when ' + I + '?',
        fi: 'Mikä on ' + O + ', kun ' + I + '?', tr: I + ' ise ' + O + ' kaçtır?',
        fr: 'Que vaut ' + O + ' quand ' + I + ' ?', es: '¿Cuánto vale ' + O + ' cuando ' + I + '?',
        ja: I + ' のとき、' + O + ' はいくつ？', ar: 'كم تساوي ' + O + ' عندما ' + I + '؟'
      }) + '</p>' + K.optButtons(M.opts, '').replace('class="opts"', 'class="opts vier"');
    }
    return html;
  },
  click: function (M, act, d) {
    var K = App.funk;
    if (act === 'feed') {
      var p = { x: d.n, y: K.f(M.r, d.n) };
      if (!M.fed.some(function (q) { return q.x === p.x; })) M.fed.push(p);
      M.last = p; M.run = true;
      if (M.round === 1) M.fb = '';
      if (M.q === null && M.fed.length >= 3) frageStellen(M);
      else if (M.q === d.n) frageStellen(M);   // gefragte Zahl selbst gefüttert: neue Frage
    } else if (act === 'ans') {
      if (d.v !== M.ans) {
        M.fb = { de: 'Nicht ganz. Schau in die Tabelle: Wie wird aus der oberen Zahl die untere?',
                 en: 'Not quite. Look at the table: how does the top number turn into the bottom one?',
                 fi: 'Ei aivan. Katso taulukkoa: miten ylemmästä luvusta tulee alempi?',
                 tr: 'Tam değil. Tabloya bak: Üstteki sayı alttakine nasıl dönüşüyor?',
                 fr: 'Pas tout à fait. Regarde le tableau : comment le nombre du haut devient-il celui du bas ?',
                 es: 'Casi. Mira la tabla: ¿cómo se convierte el número de arriba en el de abajo?',
                 ja: 'おしい。表を見よう。上の数はどうやって下の数になる？',
                 ar: 'ليس تمامًا. انظر إلى الجدول: كيف يصبح العدد العلوي العدد السفلي؟' };
        return;
      }
      M.fed.push({ x: M.q, y: M.ans }); M.last = M.fed[M.fed.length - 1];
      if (M.round === 1) {
        // Runde 2: gleiche Maschine, neue Namen. Immer y für die Eingabe und x für die Ausgabe.
        M.round = 2; M.names = ['y', 'x'];
        M.fb = { de: 'Richtig! Neue Namen, gleiche Maschine.', en: 'Right! New names, same machine.',
                 fi: 'Oikein! Uudet nimet, sama kone.', tr: 'Doğru! Yeni adlar, aynı makine.',
                 fr: 'Bravo ! Nouveaux noms, même machine.', es: '¡Correcto! Nombres nuevos, la misma máquina.',
                 ja: '正解！名前は新しく、マシンは同じです。', ar: 'صحيح! أسماء جديدة، والآلة نفسها.' };
        frageStellen(M);
      } else {
        M.fb = gleich(M.names[0], 'rein', M.q) + ' → ' + gleich(M.names[1], 'raus', M.ans);
        M.q = null;
        K.finish();
      }
    }
  }
});
})();
