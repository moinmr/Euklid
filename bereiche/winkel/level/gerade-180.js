// Level: Winkel an einer Geraden. Eine schräge Gerade, darunter angedeutet die halbe Drehung (180°).
// Antippen zeigt eine Strecke aus der Mitte der Geraden: ein Winkel hat seine Zahl, der andere ein Fragezeichen,
// die Zahl schreibt man ins Schreibfeld. Danach dreht man die Strecke am Griff hin und her: die zwei Winkel ändern sich,
// zusammen bleiben sie 180°. Gelöst nach insgesamt 120° Drehung.
(function () {
var App = window.App, S = App.S, C = App.C;
var DREH_NOETIG = 120;              // Grad
var NEIGUNG = 20 * Math.PI / 180;   // Richtung der Geraden gegen die Waagrechte
var MIN = 12 * Math.PI / 180;       // kleinster Winkel zwischen Strecke und Gerade

var TEXT = {
  halb: { de: 'eine halbe Drehung', en: 'a half turn', fi: 'puoli kierrosta', tr: 'yarım tur',
          fr: 'un demi-tour', es: 'media vuelta', ja: '半回転', ar: 'نصف دورة' },
  griff: { de: 'Dreh jetzt die Strecke am Griff hin und her', en: 'Now turn the segment back and forth by its handle',
           fi: 'Käännä nyt janaa kahvasta edestakaisin', tr: 'Şimdi doğru parçasını tutamağından ileri geri döndür',
           fr: 'Fais maintenant tourner le segment par sa poignée, dans un sens puis dans l’autre',
           es: 'Ahora gira el segmento por su asa de un lado a otro', ja: 'こんどは、線分を持ち手で行ったり来たり回そう',
           ar: 'الآن أدِر القطعة من مقبضها ذهابًا وإيابًا' },
  falsch: { de: 'Noch nicht. Beide Winkel zusammen sind eine halbe Drehung: 180°.',
            en: 'Not yet. Both angles together make a half turn: 180°.',
            fi: 'Ei vielä. Molemmat kulmat yhdessä ovat puoli kierrosta: 180°.',
            tr: 'Henüz değil. İki açı birlikte yarım tur eder: 180°.',
            fr: 'Pas encore. Les deux angles ensemble font un demi-tour : 180°.',
            es: 'Todavía no. Los dos ángulos juntos son media vuelta: 180°.',
            ja: 'まだです。2つの角を合わせると半回転、180°です。',
            ar: 'ليس بعد. الزاويتان معًا نصف دورة: 180°.' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Mitte der Geraden, halbe Länge der Geraden und Länge der Strecke
function mass() {
  var P = App.winkel.platz(2), r = Math.max(50, Math.min(S.w * 0.36, P.h * 0.55));
  return { m: [S.w / 2, P.my + r * 0.3], r: r, l: Math.min(S.w * 0.46, r * 1.35) };
}
function punkt(M, d, l) { return [M.m[0] + Math.cos(d) * l, M.m[1] - Math.sin(d) * l]; }
// Winkel a zwischen Strecke und rechtem Ende der Geraden, b zum linken Ende (ganze Grad, zusammen 180)
function winkel(Z) {
  var a = Math.round(Z.a * 180 / Math.PI);
  return { a: a, b: 180 - a };
}
function start(Z) {
  if (Z.schritt === 1 && !Z.ok) App.winkel.frage(winkel(Z).b, TEXT.falsch, function () { Z.ok = true; });
}

function drehen(Z, w) {
  var M = mass();
  if (abst(M.m, w) < 20 * S.k) return;
  var d = Math.atan2(M.m[1] - w[1], w[0] - M.m[0]) - NEIGUNG;   // Richtung gegen die Gerade
  d = ((d % App.winkel.TAU) + App.winkel.TAU) % App.winkel.TAU;
  if (d > Math.PI) d = d > 1.5 * Math.PI ? MIN : Math.PI - MIN;   // Finger unter der Geraden: am Rand bleiben
  d = Math.max(MIN, Math.min(Math.PI - MIN, d));
  Z.dreh += Math.abs(d - Z.a) * 180 / Math.PI;
  Z.a = d;
  if (Z.dreh >= DREH_NOETIG) App.winkel.geschafft();
}

App.level('winkel', {
  id: 'gerade-180',
  text: {
    de: { title: 'Winkel an der Geraden',
          task: 'Eine Gerade ist eine halbe Drehung: 180°. Tippe für den nächsten Schritt. Wie groß ist der Winkel mit dem Fragezeichen? Schreib die Zahl ins Feld.',
          done: 'Zwei Winkel an einer Geraden ergeben zusammen immer 180°. Das ist eine halbe Drehung.' },
    en: { title: 'Angles on a line',
          task: 'A straight line is a half turn: 180°. Tap for the next step. How big is the angle with the question mark? Write the number in the box.',
          done: 'Two angles on a straight line always add up to 180°. That is a half turn.' },
    fi: { title: 'Kulmat suoralla',
          task: 'Suora on puoli kierrosta: 180°. Napauta, niin näet seuraavan vaiheen. Kuinka suuri kysymysmerkin kulma on? Kirjoita luku kenttään.',
          done: 'Kaksi kulmaa suoralla ovat yhteensä aina 180°. Se on puoli kierrosta.' },
    tr: { title: 'Doğru üzerindeki açılar',
          task: 'Bir doğru yarım turdur: 180°. Sonraki adım için dokun. Soru işaretli açı kaç derece? Sayıyı kutuya yaz.',
          done: 'Bir doğru üzerindeki iki açının toplamı her zaman 180°. Bu yarım turdur.' },
    fr: { title: 'Angles sur une droite',
          task: 'Une droite, c’est un demi-tour : 180°. Touche l’écran pour l’étape suivante. Combien mesure l’angle avec le point d’interrogation ? Écris le nombre dans la case.',
          done: 'Deux angles sur une droite font toujours 180° ensemble. C’est un demi-tour.' },
    es: { title: 'Ángulos en una recta',
          task: 'Una recta es media vuelta: 180°. Toca para ver el siguiente paso. ¿Cuánto mide el ángulo con el signo de interrogación? Escribe el número en la casilla.',
          done: 'Dos ángulos sobre una recta suman siempre 180°. Eso es media vuelta.' },
    ja: { title: '直線の上の角',
          task: '直線は半回転、180°です。タップすると次に進みます。「?」の角は何度かな？数を書いてね。',
          done: '直線の上の2つの角を合わせると、いつも180°。これが半回転です。' },
    ar: { title: 'الزوايا على مستقيم',
          task: 'المستقيم نصف دورة: 180°. انقر للخطوة التالية. كم قياس الزاوية التي عليها علامة استفهام؟ اكتب العدد في المربع.',
          done: 'مجموع زاويتين على مستقيم دائمًا 180°. هذه نصف دورة.' }
  },
  werkzeuge: ['clear'],

  // Startwinkel zufällig 50° bis 80° in Fünferschritten, damit man die Zahl nicht auswendig weiß
  neu: function (Z) {
    Z.schritt = 0; Z.ok = false; Z.dreh = 0; Z.zieht = false;
    Z.a = (50 + 5 * Math.floor(Math.random() * 7)) * Math.PI / 180;
  },
  start: start,

  down: function (Z, w) {
    if (Z.schritt < 1) { Z.schritt++; start(Z); return; }   // Antippen: nächster Schritt
    if (!Z.ok) return;   // erst die Frage beantworten
    var M = mass();
    Z.zieht = abst(w, punkt(M, NEIGUNG + Z.a, M.r)) <= C.GRAB * 1.3 * S.k;   // nur am Griff
    if (Z.zieht) drehen(Z, w);
  },
  move: function (Z, w) { if (Z.zieht) drehen(Z, w); },
  up: function (Z) { Z.zieht = false; },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, M = mass(), m = M.m, r = M.r, F = H.farben;
    var links = punkt(M, NEIGUNG + Math.PI, M.l), rechts = punkt(M, NEIGUNG, M.l);
    if (Z.schritt < 1) {
      // die halbe Drehung über der Geraden, grau mit 180°
      H.feld(ctx, m, r * 0.8, NEIGUNG, Math.PI, F[2].fuell, F[2].linie, ws);
      var mid = NEIGUNG + Math.PI / 2;
      App.text(ctx, '180°', m[0] + Math.cos(mid) * r * 0.45, m[1] - Math.sin(mid) * r * 0.45, F[2].linie, 17);
    } else {
      var w = winkel(Z), p = punkt(M, NEIGUNG + Z.a, r);
      H.feld(ctx, m, r * 0.8, NEIGUNG, Z.a, F[1].fuell, F[1].linie, ws);                       // a: braun
      H.feld(ctx, m, r * 0.8, NEIGUNG + Z.a, Math.PI - Z.a, F[0].fuell, F[0].linie, ws);      // b: Tinte
      H.strecke(ctx, m, p, ink, ws);
      if (Z.ok) {   // Griff erst nach der richtigen Antwort
        ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k;
        ctx.beginPath(); ctx.arc(p[0], p[1], 15 * k, 0, H.TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
      }
      // Zahlen im Feld; kleine Winkel weiter außen, mit Pergament hinterlegt
      [[NEIGUNG, Z.a, w.a, F[1].linie, false], [NEIGUNG + Z.a, Math.PI - Z.a, w.b, F[0].linie, !Z.ok]].forEach(function (q) {
        var g = q[1] * 180 / Math.PI, mi = q[0] + q[1] / 2, ra = g >= 40 ? r * 0.5 : r * 0.8 + (22 + Math.max(0, 30 - g)) * k;
        var lx = m[0] + Math.cos(mi) * ra, ly = m[1] - Math.sin(mi) * ra;
        if (g < 40) { ctx.fillStyle = C.PARCH; App.dotAt(ctx, [lx, ly], false, 11); }
        App.text(ctx, q[4] ? '?' : q[2] + '°', lx, ly, q[3], q[4] ? 22 : 17);
      });
    }
    // die Gerade über ihre Enden hinaus, kräftig in Tinte
    var ex = Math.cos(NEIGUNG) * S.w, ey = Math.sin(NEIGUNG) * S.w;
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5 * ws * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(m[0] - ex, m[1] + ey); ctx.lineTo(m[0] + ex, m[1] - ey); ctx.stroke();
    ctx.fillStyle = ink; App.dotAt(ctx, m, false, 5);
  },

  // Unten: 180° bzw. a° + b° = 180°, darunter "eine halbe Drehung" oder was jetzt zu tun ist
  overlay: function (ctx, Z) {
    var H = App.winkel, F = H.farben, y = H.textY(2), teile;
    if (Z.schritt < 1) teile = [{ t: '180°', c: F[2].linie }];
    else {
      var w = winkel(Z);
      teile = [{ t: w.a + '°', c: F[1].linie }, { t: ' + ', c: C.INK }, { t: Z.ok ? w.b + '°' : '?', c: F[0].linie },
               { t: ' = 180°', c: C.INK }];
    }
    H.zeile(ctx, teile, y);
    var jetzt = Z.schritt === 1 && Z.ok && !Z.dreh;
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillStyle = jetzt ? C.INK : C.PENCIL;
    ctx.fillText(App.wahl(jetzt ? TEXT.griff : TEXT.halb), S.w / 2, y + 22);
    ctx.restore();
  },

  bild: function (Z) { return Z.schritt ? { v: 1, a: Z.a, ok: Z.ok, dreh: Z.dreh } : null; },
  ausBild: function (Z, b) { if (b.v === 1) { Z.schritt = 1; Z.a = b.a; Z.ok = b.ok; Z.dreh = b.dreh; } }
});
})();
