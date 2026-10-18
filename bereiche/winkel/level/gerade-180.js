// Level: Winkel an einer Geraden. Eine schräge Gerade, darüber der Winkel an der Geraden (180°, so viel wie eine halbe Drehung).
// Antippen zeigt eine Strecke aus der Mitte der Geraden mit Griff. Man dreht sie hin und her: die zwei Winkel ändern sich,
// zusammen bleiben sie 180°. Nach insgesamt 120° Drehung, beim Loslassen, kommen drei Aufgaben mit einer neuen schrägen
// Geraden: 2, 3, dann 4 Winkel an der Geraden, einer davon mit Fragezeichen; die Zahl schreibt man ins Schreibfeld.
// Antippen bringt die nächste Aufgabe. Gelöst nach der dritten Aufgabe.
(function () {
var App = window.App, S = App.S, C = App.C;
var DREH_NOETIG = 120;   // Grad
var NEIGUNG = 20;        // Grad, Richtung der Geraden beim Drehen
var MIN = 12;            // Grad, kleinster Winkel zwischen Strecke und Gerade
var ANZAHL = [2, 3, 4];  // Winkel in den drei Aufgaben

var TEXT = {
  frageFeld: { de: 'Wie groß ist der Winkel mit dem Fragezeichen?', en: 'How big is the angle with the question mark?', fi: 'Kuinka suuri on kysymysmerkillä merkitty kulma?', tr: 'Soru işaretli açı kaç derece?', fr: 'Combien mesure l’angle avec le point d’interrogation ?', es: '¿Cuánto mide el ángulo con el signo de interrogación?', ja: '「?」の角は何度かな？', ar: 'كم قياس الزاوية التي عليها علامة الاستفهام؟' },
  halb: { de: 'eine halbe Drehung', en: 'a half turn', fi: 'puoli kierrosta', tr: 'yarım tur',
          fr: 'un demi-tour', es: 'media vuelta', ja: '半回転', ar: 'نصف دورة' },
  griff: { de: 'Dreh jetzt die Strecke am Griff hin und her', en: 'Now turn the segment back and forth by its handle',
           fi: 'Käännä nyt janaa kahvasta edestakaisin', tr: 'Şimdi doğru parçasını tutamağından ileri geri döndür',
           fr: 'Fais maintenant tourner le segment par sa poignée, dans un sens puis dans l’autre',
           es: 'Ahora gira el segmento por su asa de un lado a otro', ja: 'こんどは、線分を持ち手で行ったり来たり回そう',
           ar: 'الآن أدِر القطعة من مقبضها ذهابًا وإيابًا' },
  weiter: { de: 'Tippe für die nächste Aufgabe', en: 'Tap for the next task', fi: 'Napauta, niin tulee seuraava tehtävä',
            tr: 'Sonraki görev için dokun', fr: 'Touche l’écran pour la suite', es: 'Toca para la siguiente tarea',
            ja: 'タップすると次の問題', ar: 'انقر للمهمة التالية' },
  falsch: { de: 'Noch nicht. Alle Winkel an der Geraden zusammen sind 180°.',
            en: 'Not yet. All the angles on the line together make 180°.',
            fi: 'Ei vielä. Kaikki suoran kulmat yhdessä ovat 180°.',
            tr: 'Henüz değil. Doğru üzerindeki bütün açılar birlikte 180°.',
            fr: 'Pas encore. Tous les angles sur la droite font 180° ensemble.',
            es: 'Todavía no. Todos los ángulos sobre la recta juntos son 180°.',
            ja: 'まだです。直線の上の角を全部合わせると180°です。',
            ar: 'ليس بعد. مجموع كل الزوايا على المستقيم 180°.' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Mitte der Geraden und Länge der Strecken
function mass() {
  var P = App.winkel.platz(2), r = Math.max(50, Math.min(S.w * 0.36, P.h * 0.55));
  return { m: [S.w / 2, P.my + r * 0.15], r: r, g: r * 0.7 };   // g: Abstand des Griffs unten
}
function punkt(M, grad, l) { var d = grad * Math.PI / 180; return [M.m[0] + Math.cos(d) * l, M.m[1] - Math.sin(d) * l]; }

// Das Bild gerade: Neigung der Geraden und die Winkel an ihr von rechts nach links (Grad), frage = Index mit "?" oder -1
function bildJetzt(Z) {
  if (Z.auf >= 0) return Z.fig;
  var a = Math.round(Z.a);
  return { neig: NEIGUNG, teile: [a, 180 - a], frage: -1, roh: [Z.a, 180 - Z.a] };
}
// Neue Aufgabe: schräge Gerade und n Winkel in Fünferschritten, zusammen 180, einer davon gefragt
function aufgabe(n) {
  var min = n === 4 ? 20 : 25, teile, rest;
  do {
    teile = []; rest = 180;
    for (var i = 0; i < n - 1; i++) {
      var g = min + 5 * Math.floor(Math.random() * ((180 - min * n) / 5 + 1));
      teile.push(g); rest -= g;
    }
  } while (rest < min);
  teile.push(rest);
  var neig = [-25, -15, 15, 25][Math.floor(Math.random() * 4)];
  return { neig: neig, teile: teile, frage: Math.floor(Math.random() * n) };
}
function offen(Z) { return Z.auf >= 0 && !Z.ok; }
function start(Z) {
  if (!offen(Z)) return;
  App.winkel.frage(Z.fig.teile[Z.fig.frage], TEXT.falsch, function () {
    Z.ok = true;
    if (Z.auf === ANZAHL.length - 1) App.winkel.geschafft();
  }, { text: TEXT.frageFeld });
}
function naechste(Z) {
  Z.auf++; Z.ok = false; Z.fig = aufgabe(ANZAHL[Z.auf]);
  start(Z);
}

function drehen(Z, w) {
  var M = mass();
  if (abst(M.m, w) < 20 * S.k) return;
  var d = Math.atan2(M.m[1] - w[1], w[0] - M.m[0]) * 180 / Math.PI - NEIGUNG;   // Richtung gegen die Gerade
  d = ((d % 360) + 360) % 360;
  if (d > 180) d -= 180;   // Finger unter der Geraden (dort ist der Griff): zählt wie die Gegenrichtung
  d = Math.max(MIN, Math.min(180 - MIN, d));
  Z.dreh += Math.abs(d - Z.a);
  Z.a = d;
}

App.level('winkel', {
  id: 'gerade-180',
  text: {
    de: { title: 'Winkel an der Geraden',
          task: 'Der Winkel an einer Geraden ist 180°, so viel wie eine halbe Drehung. Tippe für den nächsten Schritt und dreh die Strecke am Griff hin und her. Danach kommen drei Aufgaben: Wie groß ist der Winkel mit dem Fragezeichen?',
          done: 'Alle Winkel an einer Geraden ergeben zusammen immer 180°, egal wie viele es sind. Das ist eine halbe Drehung.' },
    en: { title: 'Angles on a line',
          task: 'The angle along a straight line is 180°, as much as a half turn. Tap for the next step and turn the segment back and forth by its handle. Then come three tasks: how big is the angle with the question mark?',
          done: 'All the angles on a straight line always add up to 180°, however many there are. That is a half turn.' },
    fi: { title: 'Kulmat suoralla',
          task: 'Suoran kulma on 180°, yhtä paljon kuin puoli kierrosta. Napauta, niin näet seuraavan vaiheen, ja käännä janaa kahvasta edestakaisin. Sitten tulee kolme tehtävää: kuinka suuri kysymysmerkin kulma on?',
          done: 'Suoran kaikki kulmat ovat yhteensä aina 180°, olipa niitä kuinka monta tahansa. Se on puoli kierrosta.' },
    tr: { title: 'Doğru üzerindeki açılar',
          task: 'Bir doğru boyunca açı 180°, yarım tur kadar. Sonraki adım için dokun ve doğru parçasını tutamağından ileri geri döndür. Sonra üç görev gelir: soru işaretli açı kaç derece?',
          done: 'Bir doğru üzerindeki bütün açıların toplamı, kaç tane olursa olsun, her zaman 180°. Bu yarım turdur.' },
    fr: { title: 'Angles sur une droite',
          task: 'L’angle le long d’une droite mesure 180°, autant qu’un demi-tour. Touche l’écran pour l’étape suivante et fais tourner le segment par sa poignée, dans un sens puis dans l’autre. Ensuite viennent trois exercices : combien mesure l’angle avec le point d’interrogation ?',
          done: 'Tous les angles sur une droite font toujours 180° ensemble, quel que soit leur nombre. C’est un demi-tour.' },
    es: { title: 'Ángulos en una recta',
          task: 'El ángulo a lo largo de una recta mide 180°, lo mismo que media vuelta. Toca para ver el siguiente paso y gira el segmento por su asa de un lado a otro. Después vienen tres tareas: ¿cuánto mide el ángulo con el signo de interrogación?',
          done: 'Todos los ángulos sobre una recta suman siempre 180°, sean cuantos sean. Eso es media vuelta.' },
    ja: { title: '直線の上の角',
          task: '直線の角は180°、半回転と同じです。タップすると次に進みます。線分を持ち手で行ったり来たり回そう。そのあと3つの問題：「?」の角は何度かな？',
          done: '直線の上の角は、いくつあっても、全部合わせるといつも180°。これが半回転です。' },
    ar: { title: 'الزوايا على مستقيم',
          task: 'الزاوية على امتداد مستقيم 180°، أي ما يساوي نصف دورة. انقر للخطوة التالية وأدِر القطعة من مقبضها ذهابًا وإيابًا. بعد ذلك ثلاث مهام: كم قياس الزاوية التي عليها علامة استفهام؟',
          done: 'مجموع كل الزوايا على مستقيم دائمًا 180°، مهما كان عددها. هذه نصف دورة.' }
  },
  werkzeuge: ['clear'],

  // Startwinkel beim Drehen zufällig 50° bis 80° in Fünferschritten
  neu: function (Z) {
    Z.schritt = 0; Z.dreh = 0; Z.zieht = false; Z.auf = -1; Z.ok = false; Z.fig = null;
    Z.a = 50 + 5 * Math.floor(Math.random() * 7);
  },
  start: start,

  down: function (Z, w) {
    if (Z.schritt < 1) { Z.schritt++; return; }   // Antippen: nächster Schritt
    if (Z.auf >= 0) {   // Aufgaben: nach der richtigen Antwort bringt Antippen die nächste
      if (Z.ok && Z.auf < ANZAHL.length - 1) naechste(Z);
      return;
    }
    var M = mass();
    Z.zieht = abst(w, punkt(M, NEIGUNG + Z.a + 180, M.g)) <= C.GRAB * 1.3 * S.k;   // nur am Griff
    if (Z.zieht) drehen(Z, w);
  },
  move: function (Z, w) { if (Z.zieht) drehen(Z, w); },
  // Genug gedreht: beim Loslassen kommt die erste Aufgabe
  up: function (Z) {
    if (!Z.zieht) return;
    Z.zieht = false;
    if (Z.dreh >= DREH_NOETIG) naechste(Z);
  },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, M = mass(), m = M.m, r = M.r, F = H.farben;
    var b = Z.schritt < 1 ? null : bildJetzt(Z), neig = b ? b.neig : NEIGUNG;
    if (!b) {
      // der Winkel an der Geraden, grau mit 180°
      H.feld(ctx, m, r * 0.8, neig * Math.PI / 180, Math.PI, F[2].fuell, F[2].linie, ws);
      var mid = neig + 90, q = punkt(M, mid, r * 0.45);
      App.text(ctx, '180°', q[0], q[1], F[2].linie, 17);
    } else {
      // Farben im Wechsel: Braun, Tinte, Grau, Braun
      var farbe = [F[1], F[0], F[2], F[1]], w = b.roh || b.teile, an = neig, enden = [];
      w.forEach(function (g, i) {
        H.feld(ctx, m, r * 0.8, an * Math.PI / 180, g * Math.PI / 180, farbe[i].fuell, farbe[i].linie, ws);
        an += g;
        if (i < w.length - 1) enden.push(an);
      });
      enden.forEach(function (d) { H.strecke(ctx, m, punkt(M, d, r), ink, ws); });
      if (Z.auf < 0) {   // Griff beim Drehen: unter der Geraden, auf der Verlängerung der Strecke, damit der Finger die Winkel nicht verdeckt
        var p = punkt(M, enden[0] + 180, M.g);
        ctx.strokeStyle = ink; ctx.lineWidth = 1.6 * ws * k; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
        ctx.lineWidth = 2 * ws * k;
        ctx.beginPath(); ctx.arc(p[0], p[1], 15 * k, 0, H.TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
      }
      // Zahlen im Feld; kleine Winkel weiter außen, mit Pergament hinterlegt
      an = neig;
      w.forEach(function (g, i) {
        var frage = i === b.frage && !Z.ok, mi = an + g / 2;
        var ra = g >= 40 ? r * 0.55 : r * 0.8 + (22 + Math.max(0, 30 - g)) * k;
        var q = punkt(M, mi, ra);
        if (g < 40) { ctx.fillStyle = C.PARCH; App.dotAt(ctx, q, false, 11); }
        App.text(ctx, frage ? '?' : b.teile[i] + '°', q[0], q[1], farbe[i].linie, frage ? 22 : 17);
        an += g;
      });
    }
    // die Gerade über ihre Enden hinaus, kräftig in Tinte
    var d = neig * Math.PI / 180, ex = Math.cos(d) * S.w, ey = Math.sin(d) * S.w;
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5 * ws * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(m[0] - ex, m[1] + ey); ctx.lineTo(m[0] + ex, m[1] - ey); ctx.stroke();
    ctx.fillStyle = ink; App.dotAt(ctx, m, false, 5);
  },

  // Unten: 180° bzw. a° + b° (+ …) = 180°, darunter was jetzt zu tun ist oder "eine halbe Drehung"
  overlay: function (ctx, Z) {
    var H = App.winkel, F = H.farben, y = H.textY(2), teile = [], unten;
    if (Z.schritt < 1) teile = [{ t: '180°', c: F[2].linie }];
    else {
      var b = bildJetzt(Z), farbe = [F[1], F[0], F[2], F[1]];
      // in der Reihenfolge, wie man sie im Bild von links nach rechts sieht
      for (var i = b.teile.length - 1; i >= 0; i--) {
        if (i < b.teile.length - 1) teile.push({ t: ' + ', c: C.INK });
        teile.push({ t: i === b.frage && !Z.ok ? '?' : b.teile[i] + '°', c: farbe[i].linie });
      }
      teile.push({ t: ' = 180°', c: C.INK });
    }
    H.zeile(ctx, teile, y);
    if (Z.schritt === 1 && !Z.dreh) unten = { t: TEXT.griff, c: C.INK };   // bis zum ersten Drehen
    else if (Z.auf >= 0 && Z.ok && Z.auf < ANZAHL.length - 1) unten = { t: TEXT.weiter, c: C.PENCIL };
    else if (!offen(Z)) unten = { t: TEXT.halb, c: C.PENCIL };
    if (!unten) return;
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillStyle = unten.c;
    ctx.fillText(App.wahl(unten.t), S.w / 2, y + 22);
    ctx.restore();
  },

  bild: function (Z) {
    return Z.schritt ? { v: 2, a: Z.a, dreh: Z.dreh, auf: Z.auf, ok: Z.ok, fig: Z.fig } : null;
  },
  ausBild: function (Z, b) {
    if (b.v !== 2) return;   // frühere Fassung: neu anfangen
    Z.schritt = 1; Z.a = b.a; Z.dreh = b.dreh; Z.auf = b.auf; Z.ok = b.ok; Z.fig = b.fig;
  }
});
})();
