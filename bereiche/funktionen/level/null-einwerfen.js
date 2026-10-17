// Level: Was passiert bei 0? Erst eine Maschine mit sichtbarer Regel: wer 0 hineingibt, bekommt nur b heraus,
// und der Punkt (0|b) liegt auf der y-Achse. Dann eine geheime Maschine: Wo schneidet ihr Graph die y-Achse?
(function () {
App.level('funktionen', {
  id: 'null-einwerfen',
  text: {
    de: { title: 'Was passiert bei 0?',
          task: 'Gib Zahlen in die Maschine, auch die 0. Schau, wo der Punkt für 0 landet.',
          done: 'Richtig! Gibt man 0 in die Maschine, kommt der y-Achsenabschnitt heraus.' },
    en: { title: 'What happens at 0?',
          task: 'Put numbers into the machine, including 0. Look where the point for 0 lands.',
          done: 'Right! If you put 0 into the machine, out comes the y-intercept.' },
    fi: { title: 'Mitä tapahtuu luvulla 0?',
          task: 'Syötä koneeseen lukuja, myös 0. Katso, mihin luvun 0 piste osuu.',
          done: 'Oikein! Kun koneeseen syöttää 0, ulos tulee y-akselin leikkauskohta.' },
    tr: { title: '0’da ne olur?',
          task: 'Makineye sayılar ver, 0’ı da. 0 için noktanın nereye düştüğüne bak.',
          done: 'Doğru! Makineye 0 verirsen, y eksenini kestiği yer çıkar.' },
    fr: { title: 'Que se passe-t-il avec 0 ?',
          task: 'Donne des nombres à la machine, 0 aussi. Regarde où arrive le point pour 0.',
          done: 'Bravo ! Si on donne 0 à la machine, on obtient l’ordonnée à l’origine.' },
    es: { title: '¿Qué pasa con el 0?',
          task: 'Dale números a la máquina, también el 0. Mira dónde cae el punto del 0.',
          done: '¡Correcto! Si le das 0 a la máquina, sale la ordenada en el origen.' },
    ja: { title: '0 を入れるとどうなる？',
          task: 'マシンに数を入れよう。0 も入れてね。0 の点がどこに来るか見よう。',
          done: '正解！マシンに 0 を入れると、y 切片が出てきます。' },
    ar: { title: 'ماذا يحدث عند 0؟',
          task: 'أدخل أعدادًا في الآلة، ومنها 0. انظر أين تقع النقطة الخاصة بالعدد 0.',
          done: 'صحيح! إذا أدخلت 0 في الآلة يخرج تقاطع المستقيم مع محور y.' }
  },
  start: function (M) {
    var rnd = App.funk.rnd, r1 = { m: 1 + rnd(2), b: 1 + rnd(4) }, r2;
    do { r2 = { m: 1 + rnd(2), b: 1 + rnd(4) }; } while (r2.b === r1.b);
    M.regeln = [r1, r2]; M.teil = 0; M.names = ['x', 'y'];
    M.fed = []; M.last = null; M.nullDa = false; neu(M);
  },
  html: function (M) {
    var K = App.funk, r = M.r, l = M.last, run = M.run, geheim = M.teil === 1 && !M.done, html = '';
    M.run = false;
    html += '<div class="flow"><div class="chip' + (l ? ' on' : '') + '">' + (l ? l.x : '') + '</div>' + K.ARROW +
      '<div class="mbox' + (geheim ? '' : ' regel') + (run ? ' run' : '') + '">' +
      (geheim ? '?' : l ? K.regelMit(r, '<span class="rein">' + l.x + '</span>') : K.regelMit(r, '<bdi class="vn rein">x</bdi>')) + '</div>' + K.ARROW +
      '<div class="chip out' + (l ? ' on' : '') + '">' + (l ? l.y : '') + '</div></div>';
    html += K.keypad('feed', -1).replace('class="keys"', 'class="keys reihe"');
    html += K.koordHTML(M);
    if (M.done) return html;
    if (M.teil === 0) {
      if (!M.nullDa) return html + '<p class="hint">' + App.wahl(T.probier) + '</p>';
      return html + '<p class="erkl">' + App.wahl(T.erklaer(r)) + '</p><button class="opt pruefen" data-act="weiter">' + App.wahl(T.weiter) + ' →</button>';
    }
    return html + '<p class="q">' + App.wahl(T.frage) + '</p>' +
      '<div class="opts vier">' + M.opts.map(function (v) {
        return '<button class="opt" data-act="ans" data-v="' + v + '"><bdi dir="ltr">(0|' + v + ')</bdi></button>';
      }).join('') + '</div>';
  },
  click: function (M, act, d) {
    if (act === 'feed') {
      var p = { x: d.n, y: App.funk.f(M.r, d.n) };
      if (!M.fed.some(function (q) { return q.x === p.x; })) M.fed.push(p);
      M.last = p; M.run = true; M.fb = '';
      if (d.n === 0 && M.teil === 0) M.nullDa = true;
    } else if (act === 'weiter') {
      M.teil = 1; neu(M);
    } else if (act === 'ans') {
      if (d.v === M.r.b) {
        M.fb = '<bdi dir="ltr">' + App.funk.funktionHTML(M.r, M.names) + '</bdi>';
        App.funk.finish();
      } else M.fb = T.tipp;
    }
  }
});
// neue Maschine: leeres Gitter; im zweiten Teil die geheime Regel und vier Antworten
function neu(M) {
  M.r = M.regeln[M.teil]; M.fed = []; M.last = null; M.fb = '';
  M.max = Math.max(5, Math.ceil(App.funk.f(M.r, 9) / 5) * 5);
  var b = M.r.b, k = [b, M.r.m + b, b + 1, b > 1 ? b - 1 : b + 2, 2 * M.r.m + b].filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 4);
  M.opts = App.funk.shuffle(k);
}
var T = {
  probier: { de: 'Tippe Zahlen an. Probiere auch die 0.', en: 'Tap some numbers. Try 0 too.', fi: 'Napauta lukuja. Kokeile myös 0.',
             tr: 'Sayılara dokun. 0’ı da dene.', fr: 'Touche des nombres. Essaie aussi 0.', es: 'Toca números. Prueba también el 0.',
             ja: '数をタップしよう。0 もためしてね。', ar: 'اضغط على أعداد. جرّب 0 أيضًا.' },
  erklaer: function (r) {
    var m = r.m, b = r.b, mal = m === 1 ? '0' : m + '·0';
    return {
      de: 'Bei x = 0 wird ' + mal + ' zu 0. Übrig bleibt nur ' + b + ', also y = ' + b + '. Der Punkt (0|' + b + ') liegt genau auf der y-Achse. Diese Zahl heißt y-Achsenabschnitt.',
      en: 'At x = 0, ' + mal + ' becomes 0. Only ' + b + ' is left, so y = ' + b + '. The point (0|' + b + ') lies right on the y-axis. This number is called the y-intercept.',
      fi: 'Kun x = 0, ' + mal + ' on 0. Jäljelle jää vain ' + b + ', eli y = ' + b + '. Piste (0|' + b + ') on juuri y-akselilla. Tätä lukua sanotaan y-akselin leikkauskohdaksi.',
      tr: 'x = 0 olunca ' + mal + ' 0 olur. Geriye sadece ' + b + ' kalır, yani y = ' + b + '. (0|' + b + ') noktası tam y ekseninin üstünde. Bu sayıya y eksenini kesim noktası denir.',
      fr: 'Pour x = 0, ' + mal + ' vaut 0. Il ne reste que ' + b + ', donc y = ' + b + '. Le point (0|' + b + ') est pile sur l’axe des y. Ce nombre s’appelle l’ordonnée à l’origine.',
      es: 'Con x = 0, ' + mal + ' da 0. Solo queda ' + b + ', así que y = ' + b + '. El punto (0|' + b + ') está justo en el eje y. Este número se llama ordenada en el origen.',
      ja: 'x = 0 のとき、' + mal + ' は 0 になります。残るのは ' + b + ' だけなので y = ' + b + '。点 (0|' + b + ') はちょうど y 軸の上にあります。この数を y 切片といいます。',
      ar: 'عندما x = 0 يصبح ' + mal + ' صفرًا. يبقى ' + b + ' فقط، إذن y = ' + b + '. النقطة (0|' + b + ') تقع تمامًا على محور y. هذا العدد يسمى تقاطع المستقيم مع محور y.'
    };
  },
  weiter: { de: 'Weiter', en: 'Next', fi: 'Seuraava', tr: 'Devam', fr: 'Suivant', es: 'Siguiente', ja: 'つぎへ', ar: 'التالي' },
  frage: { de: 'Diese Maschine ist geheim. Wo schneidet ihr Graph die y-Achse? Du darfst sie füttern.',
           en: 'This machine is secret. Where does its graph cross the y-axis? You may feed it.',
           fi: 'Tämä kone on salainen. Missä sen kuvaaja leikkaa y-akselin? Saat syöttää sille lukuja.',
           tr: 'Bu makine gizli. Grafiği y eksenini nerede kesiyor? Ona sayı verebilirsin.',
           fr: 'Cette machine est secrète. Où son graphique coupe-t-il l’axe des y ? Tu peux lui donner des nombres.',
           es: 'Esta máquina es secreta. ¿Dónde corta su gráfica el eje y? Puedes darle números.',
           ja: 'このマシンはひみつです。グラフは y 軸とどこで交わる？ 数を入れてもいいよ。',
           ar: 'هذه الآلة سرية. أين يقطع رسمها محور y؟ يمكنك أن تدخل فيها أعدادًا.' },
  tipp: { de: 'Nicht ganz. Gib 0 in die Maschine: Was herauskommt, ist der y-Achsenabschnitt.',
          en: 'Not quite. Put 0 into the machine: what comes out is the y-intercept.',
          fi: 'Ei aivan. Syötä koneeseen 0: se mitä tulee ulos, on y-akselin leikkauskohta.',
          tr: 'Tam değil. Makineye 0 ver: çıkan sayı y eksenini kestiği yerdir.',
          fr: 'Pas tout à fait. Donne 0 à la machine : ce qui sort est l’ordonnée à l’origine.',
          es: 'Casi. Dale 0 a la máquina: lo que sale es la ordenada en el origen.',
          ja: 'おしい。マシンに 0 を入れよう。出てきた数が y 切片です。',
          ar: 'ليس تمامًا. أدخل 0 في الآلة: ما يخرج هو تقاطع المستقيم مع محور y.' }
};
})();
