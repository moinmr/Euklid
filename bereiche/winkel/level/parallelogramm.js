// Level: Das Parallelogramm, ein Viereck mit parallelen Gegenseiten (eine schiefe Kiste). Zwei parallele Geraden;
// Antippen zeigt das Parallelogramm ABCD (unten AB, oben DC). Der Winkel bei A hat eine Zahl (bei jedem Neustart eine
// andere, 50° bis 75°), bei C steht ein Fragezeichen. Außen an D und B zeigen die Wechselwinkel an den Parallelen,
// ebenfalls in Braun mit Zahl: alle so groß wie A, darum auch C. Die Zahl schreibt man ins Schreibfeld; richtig: gelöst,
// alle vier Winkel haben eine Zahl (B und D = 180° − A). Danach hat die obere linke Ecke D einen Griff: Ziehen schiebt
// die obere Seite waagrecht, die Kiste wird schiefer oder gerader, die gleichen Winkel bleiben gleich.
// Der Zustand ist nur der Winkel bei A in Grad (Z.wa), die Lage folgt aus dem Platz auf dem Bildschirm.
(function () {
var App = window.App, S = App.S, C = App.C;
var MIN = 30, MAX = 150;   // Grenzen für den Winkel bei A, damit die Kiste auf den Bildschirm passt
var EINRASTEN = 4;         // Grad um 90°: rastet als Rechteck ein

var TEXT = {
  gleich: { de: 'Gegenüberliegende Winkel sind gleich groß', en: 'Opposite angles are equal',
            fi: 'Vastakkaiset kulmat ovat yhtä suuret', tr: 'Karşılıklı açılar eşittir',
            fr: 'Les angles opposés sont égaux', es: 'Los ángulos opuestos son iguales',
            ja: '向かい合う角は等しい', ar: 'الزوايا المتقابلة متساوية' },
  falsch: { de: 'Noch nicht. Die Gegenseiten sind parallel. Such die Z-Formen.',
            en: 'Not yet. The opposite sides are parallel. Look for the Z shapes.',
            fi: 'Ei vielä. Vastakkaiset sivut ovat yhdensuuntaiset. Etsi Z-muodot.',
            tr: 'Henüz değil. Karşılıklı kenarlar paralel. Z şekillerini ara.',
            fr: 'Pas encore. Les côtés opposés sont parallèles. Cherche les formes en Z.',
            es: 'Todavía no. Los lados opuestos son paralelos. Busca las formas de Z.',
            ja: 'まだです。向かい合う辺は平行です。Zの形をさがそう。',
            ar: 'ليس بعد. الأضلاع المتقابلة متوازية. ابحث عن أشكال Z.' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Höhe h (Abstand der Parallelen) und Länge L der Seiten AB und DC, passend zum Platz; auch bei 30° noch ganz zu sehen.
// Unten Platz für eine Textzeile über dem Schreibfeld bzw. zwei über der grünen Karte (die kann höher sein als gedacht).
// Während des Ziehens bleiben die Maße fest (Z.M), sonst springt die Ecke unter dem Finger weg, wenn die grüne Karte kommt.
function mass(Z) {
  if (Z && Z.M) return Z.M;
  var H = App.winkel, P = H.platz(2), breit = S.w - 56, oben = P.oben + 6, unten = P.unten;
  if (H.feldOffen()) unten = H.feldOben() - 12 - 22 - 24;
  var g = document.getElementById('fertig');
  if (g && !g.hidden && g.offsetHeight) unten = Math.min(unten, g.getBoundingClientRect().top - 12 - 44 - 24);
  var h = Math.max(50, Math.min(unten - oben - 44, breit * 0.3)), L = Math.max(60, Math.min(breit - 1.74 * h, 1.5 * h));
  var my = unten - oben >= h + 44 ? (oben + unten) / 2 : oben + 22 + h / 2;
  return { h: h, L: L, m: [S.w / 2, my], yo: my - h / 2, yu: my + h / 2 };
}
// Die vier Ecken für den Winkel wa (Grad) bei A, waagrecht so verschoben, dass die Kiste mittig steht
function ecken(Z) {
  var wa = Z.wa, M = mass(Z), c = M.h / Math.tan(wa * Math.PI / 180), ax = M.m[0] - (M.L + c) / 2;
  return { a: [ax, M.yu], b: [ax + M.L, M.yu], c: [ax + M.L + c, M.yo], d: [ax + c, M.yo], M: M };
}
// Höhe der ersten Textzeile unten; der lange grüne Text kann höher sein als die Karte, mit der textY rechnet
function textY(zeilen) {
  var y = App.winkel.textY(zeilen), g = document.getElementById('fertig');
  if (g && !g.hidden && g.offsetHeight) y = Math.min(y, g.getBoundingClientRect().top - 12 - 22 * zeilen);
  return y;
}
function start(Z) {
  if (Z.schritt === 1 && !Z.ok) App.winkel.frage(Math.round(Z.wa), TEXT.falsch, function () { Z.ok = true; App.winkel.geschafft(); });
}
// Griff an D: die Ecke folgt dem Finger, die untere Seite rückt dabei so, dass alles mittig bleibt
function schieben(Z, w) {
  var M = mass(Z), c = 2 * (w[0] - M.m[0] + M.L / 2);
  var wa = Math.atan2(M.h, c) * 180 / Math.PI;
  wa = Math.max(MIN, Math.min(MAX, wa));
  if (Math.abs(wa - 90) <= EINRASTEN) wa = 90;
  Z.wa = wa;
}

App.level('winkel', {
  id: 'parallelogramm',
  text: {
    de: { title: 'Parallelogramm',
          task: 'Ein Parallelogramm hat parallele Gegenseiten, wie eine schiefe Kiste. Tippe, um es zu sehen. Wie groß ist der Winkel bei C? Schreib die Zahl ins Feld. Die braunen Winkel außen sind Wechselwinkel an den Parallelen.',
          done: 'Im Parallelogramm sind gegenüberliegende Winkel gleich groß, Nachbarwinkel ergeben zusammen 180°.' },
    en: { title: 'Parallelogram',
          task: 'A parallelogram is a four-sided shape with parallel opposite sides, like a tilted box. Tap to see it. How big is the angle at C? Write the number in the box. The brown angles outside are alternate angles at the parallel lines.',
          done: 'In a parallelogram, opposite angles are equal and neighbouring angles add up to 180°.' },
    fi: { title: 'Suunnikas',
          task: 'Suunnikas on nelikulmio, jonka vastakkaiset sivut ovat yhdensuuntaiset, kuin vino laatikko. Napauta, niin näet sen. Kuinka suuri kulma C on? Kirjoita luku kenttään. Ruskeat kulmat ulkopuolella ovat vuorokulmia yhdensuuntaisilla suorilla.',
          done: 'Suunnikkaassa vastakkaiset kulmat ovat yhtä suuret, ja vierekkäiset kulmat ovat yhteensä 180°.' },
    tr: { title: 'Paralelkenar',
          task: 'Paralelkenar, karşılıklı kenarları paralel olan bir dörtgendir, eğik bir kutu gibi. Görmek için dokun. C’deki açı kaç derece? Sayıyı kutuya yaz. Dıştaki kahverengi açılar paralel doğrulardaki iç ters açılardır.',
          done: 'Paralelkenarda karşılıklı açılar eşittir, komşu açıların toplamı 180°’dir.' },
    fr: { title: 'Parallélogramme',
          task: 'Un parallélogramme est un quadrilatère dont les côtés opposés sont parallèles, comme une boîte penchée. Touche l’écran pour le voir. Combien mesure l’angle en C ? Écris le nombre dans la case. Les angles bruns à l’extérieur sont des angles alternes-internes aux parallèles.',
          done: 'Dans un parallélogramme, les angles opposés sont égaux et deux angles voisins font 180° ensemble.' },
    es: { title: 'Paralelogramo',
          task: 'Un paralelogramo es un cuadrilátero con los lados opuestos paralelos, como una caja inclinada. Toca para verlo. ¿Cuánto mide el ángulo en C? Escribe el número en la casilla. Los ángulos marrones de fuera son ángulos alternos en las paralelas.',
          done: 'En un paralelogramo, los ángulos opuestos son iguales y dos ángulos vecinos suman 180°.' },
    ja: { title: '平行四辺形',
          task: '平行四辺形は、向かい合う辺が平行な四角形です。かたむいた箱のような形です。タップすると出てきます。Cの角は何度かな？数を書いてね。外の茶色の角は、平行線の錯角です。',
          done: '平行四辺形では、向かい合う角は等しく、となり合う角を合わせると180°です。' },
    ar: { title: 'متوازي الأضلاع',
          task: 'متوازي الأضلاع شكل رباعي أضلاعه المتقابلة متوازية، مثل صندوق مائل. انقر لتراه. كم قياس الزاوية عند C؟ اكتب العدد في المربع. الزوايا البنية في الخارج زوايا متبادلة عند المستقيمين المتوازيين.',
          done: 'في متوازي الأضلاع الزوايا المتقابلة متساوية، والزاويتان المتجاورتان مجموعهما 180°.' }
  },
  werkzeuge: ['clear'],

  // Winkel bei A zufällig 50° bis 75° in Fünferschritten, damit man die Zahl nicht auswendig weiß
  neu: function (Z) {
    Z.schritt = 0; Z.ok = false; Z.zieht = false; Z.M = null;
    Z.wa = 50 + 5 * Math.floor(Math.random() * 6);
  },
  start: start,

  down: function (Z, w) {
    if (Z.schritt < 1) { Z.schritt++; start(Z); return; }   // Antippen: das Parallelogramm erscheint
    if (!Z.ok) return;   // erst die Frage beantworten
    Z.zieht = abst(w, ecken(Z).d) <= C.GRAB * 1.3 * S.k;   // nur am Griff
    Z.M = Z.zieht ? mass() : null;
  },
  move: function (Z, w) { if (Z.zieht) schieben(Z, w); },
  up: function (Z) { Z.zieht = false; Z.M = null; },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, F = H.farben, e = ecken(Z), M = e.M, P = Math.PI;
    // die zwei Parallelen über die ganze Breite
    ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 2 * ws * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-S.w, M.yo); ctx.lineTo(2 * S.w, M.yo); ctx.moveTo(-S.w, M.yu); ctx.lineTo(2 * S.w, M.yu); ctx.stroke();
    if (Z.schritt < 1) return;
    var th = Z.wa * P / 180, za = Math.round(Z.wa), zb = 180 - za;
    ctx.fillStyle = 'rgba(56,41,25,0.06)';
    ctx.beginPath(); ctx.moveTo(e.a[0], e.a[1]); ctx.lineTo(e.b[0], e.b[1]); ctx.lineTo(e.c[0], e.c[1]); ctx.lineTo(e.d[0], e.d[1]);
    ctx.closePath(); ctx.fill();
    // Winkelfelder innen: A und C braun, B und D Tinte; dazu außen an D und B die Wechselwinkel an den Parallelen,
    // braun wie A und C: alle gleich groß. [Ecke, Anfang, Weite, Farbe, Zahl]
    var r = Math.min(28 * k, 0.32 * M.h), felder = [
      [e.a, 0, th, F[1], za], [e.b, th, P - th, F[0], zb], [e.c, P, th, F[1], za], [e.d, P + th, P - th, F[0], zb],
      [e.d, P, th, F[1], za], [e.b, 0, th, F[1], za]
    ];
    felder.forEach(function (f) { H.feld(ctx, f[0], r, f[1], f[2], f[3].fuell, f[3].linie, ws); });
    // die Seiten kräftig in Tinte
    ctx.strokeStyle = ink; ctx.lineWidth = 3 * ws * k; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(e.a[0], e.a[1]); ctx.lineTo(e.b[0], e.b[1]); ctx.lineTo(e.c[0], e.c[1]); ctx.lineTo(e.d[0], e.d[1]);
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = ink;
    [e.a, e.b, e.c, e.d].forEach(function (p) { App.dotAt(ctx, p, false); });
    // Griff an D, erst nach der richtigen Antwort
    if (Z.ok) {
      ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k;
      ctx.beginPath(); ctx.arc(e.d[0], e.d[1], 15 * k, 0, H.TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
    }
    // Zahlen auf der Winkelhalbierenden: A und die Wechselwinkel immer, C erst "?", B und D innen erst nach der Antwort
    felder.forEach(function (f, i) {
      if (!Z.ok && (i === 1 || i === 3)) return;
      var frage = i === 2 && !Z.ok, mid = f[1] + f[2] / 2, gr = f[2] * 180 / P;
      var ra = (48 + Math.max(0, 50 - gr) * 0.7) * k;
      ra = Math.min(ra, 0.36 * M.h / Math.max(0.3, Math.abs(Math.sin(mid))));   // nicht bis zur Gegenseite
      App.text(ctx, frage ? '?' : f[4] + '°', f[0][0] + Math.cos(mid) * ra, f[0][1] - Math.sin(mid) * ra, f[3].linie, frage ? 22 : 16);
    });
    // Namen der Ecken außen, klein in Bleistift
    [['A', e.a, -1, 1], ['B', e.b, 1, 1], ['C', e.c, 1, -1], ['D', e.d, -1, -1]].forEach(function (q) {
      App.text(ctx, q[0], q[1][0] + q[2] * 20 * k, q[1][1] + q[3] * 18 * k, C.PENCIL, 14);
    });
  },

  // Unten über der Leiste: erst "60° = ?", dann "60° + 120° = 180°" und der Satz zu den Winkeln
  overlay: function (ctx, Z) {
    if (Z.schritt < 1) return;
    var H = App.winkel, F = H.farben, za = Math.round(Z.wa), y = textY(Z.ok ? 2 : 1);
    if (!Z.ok) {   // auf sehr kleinen Bildschirmen fehlt der Platz: dann reicht das "?" im Bild
      if (mass(Z).yu + 26 < y - 10) H.zeile(ctx, [{ t: za + '° = ?', c: F[1].linie }], y);
      return;
    }
    H.zeile(ctx, [{ t: za + '°', c: F[1].linie }, { t: ' + ', c: C.INK }, { t: (180 - za) + '°', c: F[0].linie },
                  { t: ' = 180°', c: C.INK }], y);
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
    ctx.fillText(App.wahl(TEXT.gleich), S.w / 2, y + 22);
    ctx.restore();
  },

  // Nur der Winkel bei A und ob die Frage beantwortet ist
  bild: function (Z) { return Z.schritt ? { v: 1, wa: Z.wa, ok: Z.ok } : null; },
  ausBild: function (Z, b) {
    if (b.v !== 1) return;
    Z.wa = Math.max(MIN, Math.min(MAX, b.wa)); Z.schritt = 1; Z.ok = !!b.ok;
  }
});
})();
