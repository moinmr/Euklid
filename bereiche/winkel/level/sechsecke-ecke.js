// Level: Wie viele Sechsecke passen um eine Ecke? Jedes Antippen ist ein Schritt, keine Animation.
// Am Anfang ein Sechseck aus sechs gleichseitigen Dreiecken (dünn eingezeichnet), rechts davon die Ecke V.
// Antippen zeigt an V die zwei Dreieckswinkel: 60° + 60° = 120°, der Winkel des Sechsecks. Nächstes Antippen: die Frage
// "Wie viele Sechsecke passen um eine Ecke?" (3). Danach legt jedes Antippen ein weiteres Sechseck an diese Ecke,
// unten "120° + 120° + 120° = 360°". Gelöst nach dem dritten Sechseck.
(function () {
var App = window.App, S = App.S, C = App.C;
var GRAD60 = Math.PI / 3;

var TEXT = {
  umdrehung: { de: 'eine volle Umdrehung', en: 'one full turn', fi: 'yksi täysi kierros', tr: 'tam bir tur',
               fr: 'un tour complet', es: 'una vuelta completa', ja: 'ちょうど1回転', ar: 'دورة كاملة' },
  weiter: { de: 'Tippe weiter', en: 'Tap to go on', fi: 'Napauta jatkaaksesi', tr: 'Devam etmek için dokun',
            fr: 'Touche l’écran pour continuer', es: 'Toca para seguir', ja: 'タップして先へ', ar: 'انقر للمتابعة' },
  sechseck: { de: 'Wie viele Sechsecke passen um eine Ecke?', en: 'How many hexagons fit around one corner?',
              fi: 'Montako kuusikulmiota mahtuu yhden kulman ympärille?', tr: 'Bir köşenin etrafına kaç altıgen sığar?',
              fr: 'Combien d’hexagones tiennent autour d’un coin ?', es: '¿Cuántos hexágonos caben alrededor de una esquina?',
              ja: '1つの角のまわりに六角形はいくつ入るかな？', ar: 'كم سداسيًا يتسع حول زاوية واحدة؟' },
  falsch: { de: 'Noch nicht. Zusammen müssen es 360° sein. Jedes Sechseck bringt 120°.',
            en: 'Not yet. Together it must be 360°. Each hexagon brings 120°.',
            fi: 'Ei vielä. Yhteensä pitää olla 360°. Jokainen kuusikulmio tuo 120°.',
            tr: 'Henüz değil. Toplam 360° olmalı. Her altıgen 120° getirir.',
            fr: 'Pas encore. Il faut 360° en tout. Chaque hexagone apporte 120°.',
            es: 'Todavía no. Juntos tienen que ser 360°. Cada hexágono aporta 120°.',
            ja: 'まだです。合わせて360°になるはず。六角形1つで120°です。',
            ar: 'ليس بعد. يجب أن يكون المجموع 360°. كل سداسي يعطي 120°.' }
};

function dir(a) { return [Math.cos(a), -Math.sin(a)]; }
function plus(p, a, l) { var d = dir(a); return [p[0] + d[0] * l, p[1] + d[1] * l]; }
function zeilen() { return App.winkel.feldOffen() ? 2 : 3; }
// Bildbereich: platz(), aber nie bis in die Textzeilen unten (auf kleinen Bildschirmen mit offenem Schreibfeld)
function bereich() {
  var H = App.winkel, P = H.platz(zeilen()), unten = Math.min(P.unten, H.textY(zeilen()) - 16);
  var h = Math.max(50, unten - P.oben);
  return { h: h, my: P.oben + h / 2 };
}
// Drei Sechsecke um die Ecke V (Breite 3,5s, Höhe 3,46s), V etwas rechts der Mitte.
// Solange nur das erste Sechseck da ist (Breite 3s, Höhe 1,73s), wird es größer gezeichnet.
function mass(Z) {
  var B = bereich();
  if (!Z.ok) {
    var s1 = Math.min((S.w - 32) / 3.2, (B.h - 8) / 1.8, S.w * 0.22);
    return { v: [S.w / 2 + 0.5 * s1, B.my], s: s1 };
  }
  var s = Math.min((S.w - 32) / 3.5, (B.h - 6) / 3.46);
  return { v: [S.w / 2 + 0.25 * s, B.my], s: s };
}
// Ecken eines Sechsecks um c mit Seite s (Ecke 0 rechts)
function sechseck(c, s) { var p = []; for (var i = 0; i < 6; i++) p.push(plus(c, i * GRAD60, s)); return p; }
function vieleck(ctx, p, fuell, linie, breite) {
  ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
  p.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
  ctx.closePath();
  if (fuell) { ctx.fillStyle = fuell; ctx.fill(); }
  if (linie) { ctx.strokeStyle = linie; ctx.lineWidth = breite; ctx.lineJoin = 'round'; ctx.stroke(); }
}
// Beschriftung mit hellem Rand, damit sie auch auf den dünnen Dreieckskanten lesbar bleibt
function beschrift(ctx, txt, p, col, size) {
  ctx.save();
  ctx.font = '400 ' + (size * S.k) + 'px ' + C.FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.strokeStyle = C.PARCH; ctx.lineWidth = 4 * S.k; ctx.lineJoin = 'round';
  ctx.strokeText(txt, p[0], p[1]);
  ctx.fillStyle = col; ctx.fillText(txt, p[0], p[1]);
  ctx.restore();
}
// Farbe des Sechsecks j an der Ecke: braun, grau, Tinte
function farbe(j) { return App.winkel.farben[[1, 2, 0][j]]; }

function offen(Z) { return Z.e === 2 && !Z.ok; }
function start(Z) { if (offen(Z)) App.winkel.frage(3, TEXT.falsch, function () { Z.ok = true; }, { text: TEXT.sechseck, einheit: '' }); }

App.level('winkel', {
  id: 'sechsecke-ecke',
  text: {
    de: { title: 'Sechsecke um eine Ecke',
          task: 'Ein Sechseck besteht aus sechs gleichseitigen Dreiecken. Tippe für den nächsten Schritt. Wie viele Sechsecke passen um eine Ecke? Die Zahl schreibst du ins Feld.',
          done: 'Jeder Winkel im Sechseck ist 60° + 60° = 120°. Drei Sechsecke passen um eine Ecke: 3 × 120° = 360°.' },
    en: { title: 'Hexagons around a corner',
          task: 'A hexagon is made of six equilateral triangles. Tap for the next step. How many hexagons fit around one corner? You write the number in the box.',
          done: 'Each angle in the hexagon is 60° + 60° = 120°. Three hexagons fit around a corner: 3 × 120° = 360°.' },
    fi: { title: 'Kuusikulmiot kulman ympärillä',
          task: 'Kuusikulmio koostuu kuudesta tasasivuisesta kolmiosta. Napauta, niin näet seuraavan vaiheen. Montako kuusikulmiota mahtuu yhden kulman ympärille? Kirjoitat luvun kenttään.',
          done: 'Kuusikulmion jokainen kulma on 60° + 60° = 120°. Kolme kuusikulmiota mahtuu kulman ympärille: 3 × 120° = 360°.' },
    tr: { title: 'Bir köşenin etrafında altıgenler',
          task: 'Bir altıgen altı eşkenar üçgenden oluşur. Sonraki adım için dokun. Bir köşenin etrafına kaç altıgen sığar? Sayıyı kutuya yazarsın.',
          done: 'Altıgenin her açısı 60° + 60° = 120°. Bir köşenin etrafına üç altıgen sığar: 3 × 120° = 360°.' },
    fr: { title: 'Hexagones autour d’un coin',
          task: 'Un hexagone est fait de six triangles équilatéraux. Touche l’écran pour l’étape suivante. Combien d’hexagones tiennent autour d’un coin ? Tu écris le nombre dans la case.',
          done: 'Chaque angle de l’hexagone mesure 60° + 60° = 120°. Trois hexagones tiennent autour d’un coin : 3 × 120° = 360°.' },
    es: { title: 'Hexágonos alrededor de una esquina',
          task: 'Un hexágono está hecho de seis triángulos equiláteros. Toca para ver el siguiente paso. ¿Cuántos hexágonos caben alrededor de una esquina? Escribes el número en la casilla.',
          done: 'Cada ángulo del hexágono mide 60° + 60° = 120°. Tres hexágonos caben alrededor de una esquina: 3 × 120° = 360°.' },
    ja: { title: '角のまわりの六角形',
          task: '六角形は6つの正三角形でできています。タップすると次に進みます。1つの角のまわりに六角形はいくつ入るかな？数は自分で書こう。',
          done: '六角形の角はどれも 60° + 60° = 120°。1つの角のまわりに六角形が3つ入ります：3 × 120° = 360°。' },
    ar: { title: 'سداسيات حول زاوية',
          task: 'يتكوّن السداسي من ستة مثلثات متساوية الأضلاع. انقر للخطوة التالية. كم سداسيًا يتسع حول زاوية واحدة؟ تكتب العدد في المربع.',
          done: 'كل زاوية في السداسي 60° + 60° = 120°. ثلاثة سداسيات تتسع حول زاوية: 3 × 120° = 360°.' }
  },
  werkzeuge: ['clear'],

  // e: Schritte (1 Winkel an der Ecke gezeigt, 2 Frage), ok: 3 geschrieben; h: weitere Sechsecke an der Ecke (0 bis 2)
  neu: function (Z) { Z.e = 0; Z.ok = false; Z.h = 0; },
  start: start,

  down: function (Z) {
    if (offen(Z)) return;   // erst die Frage beantworten
    if (Z.e < 2) { Z.e++; start(Z); }
    else if (Z.h < 2) { Z.h++; if (Z.h === 2) App.winkel.geschafft(); }
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // das erste Sechseck links der Ecke V, weitere oben rechts und unten rechts
    var M = mass(Z), s = M.s, v = M.v, r = Math.max(14 * k, Math.min(26 * k, s * 0.3));
    var mitten = [plus(v, Math.PI, s), plus(v, GRAD60, s), plus(v, -GRAD60, s)];
    var anfang = [2 * GRAD60, 0, 4 * GRAD60];   // Richtung, ab der das Sechseck j an V liegt (je 120°)
    var zahl = Z.ok ? 1 + Z.h : 1;
    for (var n = 0; n < zahl; n++) vieleck(ctx, sechseck(mitten[n], s), farbe(n).fuell.replace(/[\d.]+\)$/, '0.07)'), null);
    // Dreiecke im ersten Sechseck dünn
    ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 1.2 * ws * k;
    sechseck(mitten[0], s).forEach(function (p) {
      ctx.beginPath(); ctx.moveTo(mitten[0][0], mitten[0][1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    });
    for (var u = 0; u < zahl; u++) vieleck(ctx, sechseck(mitten[u], s), null, ink, 3 * ws * k);
    if (Z.e === 1) {
      // zwei Dreieckswinkel an der Ecke: braun (Dreieck oben) und grau (Dreieck unten)
      [[2 * GRAD60, H.farben[1]], [3 * GRAD60, H.farben[2]]].forEach(function (w) {
        H.feld(ctx, v, r * 1.2, w[0], GRAD60, w[1].fuell, w[1].linie, ws);
        var l = plus(v, w[0] + GRAD60 / 2, Math.max(s * 0.55, r + 16 * k));
        beschrift(ctx, '60°', l, w[1].linie, 15);
      });
    } else if (Z.e === 2) {
      for (var o = 0; o < zahl; o++) {
        var fo = farbe(o);
        H.feld(ctx, v, r, anfang[o], 2 * GRAD60, fo.fuell, fo.linie, ws);
        var lo = plus(v, anfang[o] + GRAD60, Math.max(s * 0.55, r + 16 * k));
        beschrift(ctx, '120°', lo, fo.linie, 15);
      }
      if (offen(Z)) App.text(ctx, '?', v[0] + s * 0.7, v[1], ink, 22);
    }
    ctx.fillStyle = ink; App.dotAt(ctx, v, false);
  },

  // Unten: Gleichung (20px), darunter Frage bzw. Hinweis (14.5px)
  overlay: function (ctx, Z) {
    var H = App.winkel, y = H.textY(zeilen()), br = H.farben[1].linie, gr = H.farben[2].linie, teile = [], z2 = null, wt = false;
    if (Z.e === 0) wt = true;
    else if (Z.e === 1) {
      teile = [{ t: '60°', c: br }, { t: ' + ', c: C.INK }, { t: '60°', c: gr }, { t: ' = 120°', c: C.INK }];
      wt = true;
    } else if (!Z.ok) return;   // die Frage steht im Schreibfeld
    else {
      for (var j = 0; j <= Z.h; j++) {
        if (j) teile.push({ t: ' + ', c: C.INK });
        teile.push({ t: '120°', c: farbe(j).linie });
      }
      if (Z.h) teile.push({ t: ' = ' + 120 * (Z.h + 1) + '°', c: C.INK });
      if (Z.h === 2) z2 = App.wahl(TEXT.umdrehung); else wt = true;
    }
    if (teile.length) H.zeile(ctx, teile, y);
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    var yy = y + 22;
    if (z2) { ctx.fillStyle = C.INK; ctx.fillText(z2, S.w / 2, yy); yy += 22; }
    if (wt) { ctx.fillStyle = C.PENCIL; ctx.fillText(App.wahl(TEXT.weiter), S.w / 2, yy); }
    ctx.restore();
  },

  bild: function (Z) { return Z.e ? { v: 1, e: Z.e, ok: Z.ok, h: Z.h } : null; },
  ausBild: function (Z, b) {
    if (b.v === 1) { Z.e = b.e; Z.ok = !!b.ok; Z.h = b.h || 0; }
  }
});
})();
