// Level: Dieselben Formen wie in "Einmal rundherum" (Dreieck, Quadrat, Fünfeck, Sechseck). An einer Ecke stehen
// die Drehung von dort (grau, mit Zahl) und der Innenwinkel (braun, mit ?). Den Innenwinkel schreibt man mit dem
// Finger ins Feld und drückt Prüfen. Richtig: alle Innenwinkel bekommen ihre Zahl, Antippen bringt die nächste Form.
// Gelöst nach dem Sechseck.
(function () {
var App = window.App, S = App.S, C = App.C;
var FORMEN = [3, 4, 5, 6];

var TEXT = {
  falsch: { de: 'Noch nicht. Die Drehung an der Ecke und der Innenwinkel ergeben zusammen 180°.',
            en: 'Not yet. The turn at the corner and the inside angle add up to 180°.',
            fi: 'Ei vielä. Kulman kääntö ja sisäkulma ovat yhteensä 180°.',
            tr: 'Henüz değil. Köşedeki dönüş ile iç açının toplamı 180°.',
            fr: 'Pas encore. Le virage au coin et l’angle intérieur font 180° ensemble.',
            es: 'Todavía no. El giro en la esquina y el ángulo interior suman 180°.',
            ja: 'まだです。角での回転と内角を合わせると180°です。',
            ar: 'ليس بعد. مجموع الدوران عند الزاوية والزاوية الداخلية 180°.' },
  lesen: { de: 'Ich kann die Zahl nicht lesen. Schreib die Ziffern etwas größer und mit Abstand.',
           en: 'I can’t read the number. Write the digits a bit bigger and apart.',
           fi: 'En pysty lukemaan lukua. Kirjoita numerot vähän isommin ja erilleen.',
           tr: 'Sayıyı okuyamıyorum. Rakamları biraz daha büyük ve aralıklı yaz.',
           fr: 'Je n’arrive pas à lire le nombre. Écris les chiffres un peu plus grands et espacés.',
           es: 'No puedo leer el número. Escribe las cifras un poco más grandes y separadas.',
           ja: '数が読めません。数字を少し大きく、間をあけて書こう。',
           ar: 'لا أستطيع قراءة العدد. اكتب الأرقام أكبر قليلًا وبمسافات بينها.' },
  weiter: { de: 'Tippe für die nächste Form', en: 'Tap for the next shape', fi: 'Napauta, niin tulee seuraava muoto',
            tr: 'Sonraki şekil için dokun', fr: 'Touche l’écran pour la forme suivante', es: 'Toca para la siguiente forma',
            ja: 'タップすると次の形', ar: 'انقر للشكل التالي' }
};

function innen(k) { return 180 - 360 / k; }
// Platz zwischen Aufgabentext und Schreibfeld; Ecken der Form wie in "Einmal rundherum" (Start unten links)
function ecken(k) {
  var hud = document.getElementById('hud'), oben = (hud && hud.firstChild ? hud.getBoundingClientRect().bottom : 60) + 30;
  var unten = App.winkel.feldOben() - 70, cy = (oben + unten) / 2;
  var R = Math.max(50, Math.min(S.w * 0.3, (unten - oben) / 2));
  var s = 2 * R * Math.sin(Math.PI / k), ext = 2 * Math.PI / k, p = [[0, 0]], h = 0;
  for (var i = 1; i < k; i++) { p.push([p[i - 1][0] + s * Math.cos(h), p[i - 1][1] - s * Math.sin(h)]); h += ext; }
  var mx = 0, my = 0;
  p.forEach(function (q) { mx += q[0] / k; my += q[1] / k; });
  return { p: p.map(function (q) { return [q[0] - mx + S.w / 2, q[1] - my + cy]; }), s: s, ext: ext };
}

function pruefen(Z, text) {
  var H = App.winkel, k = FORMEN[Z.form];
  if (!text || text.indexOf('?') >= 0) { H.falsch(TEXT.lesen); return; }
  if (Number(text) !== innen(k)) { H.falsch(TEXT.falsch); H.feldLeeren(); return; }
  Z.ok = true; H.feldWeg();
  if (Z.form === FORMEN.length - 1) H.geschafft();
}
function start(Z) {
  if (Z.ok) App.winkel.feldWeg();
  else App.winkel.schreibfeld(function (t) { pruefen(Z, t); });
}

App.level('winkel', {
  id: 'innenwinkel',
  text: {
    de: { title: 'Innenwinkel',
          task: 'Wie groß ist der Innenwinkel? Schreib die Zahl mit dem Finger ins Feld und drück Prüfen.',
          done: 'Drehung und Innenwinkel an einer Ecke ergeben zusammen 180°. Dreieck 60°, Quadrat 90°, Fünfeck 108°, Sechseck 120°.' },
    en: { title: 'Inside angles',
          task: 'How big is the inside angle? Write the number in the box with your finger and press Check.',
          done: 'The turn and the inside angle at a corner add up to 180°. Triangle 60°, square 90°, pentagon 108°, hexagon 120°.' },
    fi: { title: 'Sisäkulmat',
          task: 'Kuinka suuri sisäkulma on? Kirjoita luku sormella kenttään ja paina Tarkista.',
          done: 'Kulman kääntö ja sisäkulma ovat yhteensä 180°. Kolmio 60°, neliö 90°, viisikulmio 108°, kuusikulmio 120°.' },
    tr: { title: 'İç açılar',
          task: 'İç açı kaç derece? Sayıyı parmağınla kutuya yaz ve Kontrol et’e bas.',
          done: 'Bir köşedeki dönüş ile iç açının toplamı 180°. Üçgen 60°, kare 90°, beşgen 108°, altıgen 120°.' },
    fr: { title: 'Angles intérieurs',
          task: 'Combien mesure l’angle intérieur ? Écris le nombre avec ton doigt dans la case et appuie sur Vérifier.',
          done: 'Le virage et l’angle intérieur à un coin font 180° ensemble. Triangle 60°, carré 90°, pentagone 108°, hexagone 120°.' },
    es: { title: 'Ángulos interiores',
          task: '¿Cuánto mide el ángulo interior? Escribe el número con el dedo en la casilla y pulsa Comprobar.',
          done: 'El giro y el ángulo interior en una esquina suman 180°. Triángulo 60°, cuadrado 90°, pentágono 108°, hexágono 120°.' },
    ja: { title: '内角',
          task: '内角は何度かな？指で数を書いて「たしかめる」をおそう。',
          done: '1つの角での回転と内角を合わせると180°。三角形60°、正方形90°、五角形108°、六角形120°。' },
    ar: { title: 'الزوايا الداخلية',
          task: 'كم قياس الزاوية الداخلية؟ اكتب العدد بإصبعك في المربع واضغط تحقق.',
          done: 'مجموع الدوران والزاوية الداخلية عند زاوية واحدة 180°. المثلث 60°، المربع 90°، الخماسي 108°، السداسي 120°.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) { Z.form = 0; Z.ok = false; },
  start: start,

  down: function (Z) {
    if (Z.ok && Z.form < FORMEN.length - 1) { Z.form++; Z.ok = false; start(Z); }   // Antippen: nächste Form
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, n = FORMEN[Z.form], E = ecken(n), p = E.p, fb = H.farben[1], fg = H.farben[2];
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5 * ws * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    p.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
    ctx.closePath(); ctx.stroke();
    var ri = 26 * k, ein = innen(n);
    // Ecke unten rechts: gestrichelte Verlängerung, Drehung grau mit Zahl, Innenwinkel braun mit ? (oder Zahl)
    var q = p[1], L = E.s * 0.4;
    ctx.save(); ctx.setLineDash([6 * k, 6 * k]);
    ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 1.6 * ws * k;
    ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + L, q[1]); ctx.stroke();
    ctx.restore();
    H.feld(ctx, q, ri, 0, E.ext, fg.fuell, fg.linie, ws);
    App.text(ctx, Math.round(360 / n) + '°', q[0] + Math.cos(E.ext / 2) * 46 * k, q[1] - Math.sin(E.ext / 2) * 46 * k, fg.linie, 15);
    // Innenwinkel: an Ecke i zwischen der Richtung zur nächsten und zur vorigen Ecke
    for (var i = 0; i < n; i++) {
      if (!Z.ok && i !== 1) continue;
      // der gesuchte Winkel hervorgehoben: größer und kräftiger
      var c = p[i], a0 = i * E.ext, sw = Math.PI - E.ext, mid = a0 + sw / 2, gross = !Z.ok, rr = (gross ? 36 : 26) * k, ra = rr + 20 * k;
      H.feld(ctx, c, rr, a0, sw, gross ? 'rgba(166,112,58,0.38)' : fb.fuell, fb.linie, gross ? ws * 1.6 : ws);
      App.text(ctx, Z.ok ? ein + '°' : '?', c[0] + Math.cos(mid) * ra, c[1] - Math.sin(mid) * ra, fb.linie, gross ? 22 : 16);
    }
  },

  // Über dem Schreibfeld: ? + 120° = 180°, nach der richtigen Antwort 60° + 120° = 180°
  overlay: function (ctx, Z) {
    var H = App.winkel, n = FORMEN[Z.form], aussen = Math.round(360 / n);
    var y = Z.ok ? S.h - (S.unten || 70) - (document.body.classList.contains('geschafft') ? 130 : 66) : H.feldOben() - 34;
    var teile = [{ t: Z.ok ? innen(n) + '°' : '?', c: H.farben[1].linie }, { t: ' + ', c: C.INK },
                 { t: aussen + '°', c: H.farben[2].linie }, { t: ' = 180°', c: C.INK }];
    ctx.save();
    ctx.font = '400 20px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    var breite = teile.reduce(function (s, t) { return s + ctx.measureText(t.t).width; }, 0), x = (S.w - breite) / 2;
    teile.forEach(function (t) { ctx.fillStyle = t.c; ctx.fillText(t.t, x, y); x += ctx.measureText(t.t).width; });
    if (Z.ok && Z.form < FORMEN.length - 1) {
      ctx.font = '400 14.5px ' + C.FONT; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
      ctx.fillText(App.wahl(TEXT.weiter), S.w / 2, y + 24);
    }
    ctx.restore();
  },

  bild: function (Z) { return (Z.form || Z.ok) ? { v: 1, form: Z.form, ok: Z.ok } : null; },
  ausBild: function (Z, b) { if (b.v === 1) { Z.form = b.form; Z.ok = b.ok; } }
});
})();
