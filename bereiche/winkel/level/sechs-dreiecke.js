// Level: Sechs gleichseitige Dreiecke um einen Punkt. Jedes Antippen ist ein Schritt, keine Animation.
// Teil 1: Ein Punkt in der Mitte. Antippen legt ein gleichseitiges Dreieck mit einer Ecke im Punkt, sein Winkel dort
// zeigt "?": man schreibt 60 ins Schreibfeld. Danach legt jedes Antippen das nächste Dreieck daneben (Felder am Punkt
// abwechselnd braun und grau), unten "60° + 60° = 120°" und "2 × 1/6 Drehung". Nach sechs Dreiecken ist der Rand ein
// Sechseck: 6 × 60° = 360°, eine volle Umdrehung.
// Teil 2: An einer äußeren Ecke des Sechsecks treffen zwei Dreieckswinkel zusammen: 60° + 60° = 120°, der Winkel des
// Sechsecks. Frage: Wie viele Sechsecke passen um eine Ecke? (3). Danach legt jedes Antippen ein weiteres Sechseck an
// diese Ecke, unten "120° + 120° + 120° = 360°". Gelöst nach dem dritten Sechseck.
(function () {
var App = window.App, S = App.S, C = App.C;
var GRAD60 = Math.PI / 3;

var TEXT = {
  umdrehung: { de: 'eine volle Umdrehung', en: 'one full turn', fi: 'yksi täysi kierros', tr: 'tam bir tur',
               fr: 'un tour complet', es: 'una vuelta completa', ja: 'ちょうど1回転', ar: 'دورة كاملة' },
  drehung: { de: 'Drehung', en: 'turn', fi: 'kierros', tr: 'tur', fr: 'tour', es: 'vuelta', ja: '回転', ar: 'دورة' },
  weiter: { de: 'Tippe weiter', en: 'Tap to go on', fi: 'Napauta jatkaaksesi', tr: 'Devam etmek için dokun',
            fr: 'Touche l’écran pour continuer', es: 'Toca para seguir', ja: 'タップして先へ', ar: 'انقر للمتابعة' },
  sechseck: { de: 'Wie viele Sechsecke passen um eine Ecke?', en: 'How many hexagons fit around one corner?',
              fi: 'Montako kuusikulmiota mahtuu yhden kulman ympärille?', tr: 'Bir köşenin etrafına kaç altıgen sığar?',
              fr: 'Combien d’hexagones tiennent autour d’un coin ?', es: '¿Cuántos hexágonos caben alrededor de una esquina?',
              ja: '1つの角のまわりに六角形はいくつ入るかな？', ar: 'كم سداسيًا يتسع حول زاوية واحدة؟' },
  falsch1: { de: 'Noch nicht. Im gleichseitigen Dreieck sind alle drei Winkel gleich groß. Zusammen sind sie 180°.',
             en: 'Not yet. In an equilateral triangle all three angles are the same size. Together they make 180°.',
             fi: 'Ei vielä. Tasasivuisen kolmion kaikki kolme kulmaa ovat yhtä suuret. Yhdessä ne ovat 180°.',
             tr: 'Henüz değil. Eşkenar üçgende üç açı da eşittir. Toplamları 180°.',
             fr: 'Pas encore. Dans un triangle équilatéral, les trois angles sont égaux. Ensemble, ils font 180°.',
             es: 'Todavía no. En un triángulo equilátero los tres ángulos son iguales. Juntos suman 180°.',
             ja: 'まだです。正三角形の3つの角はみんな同じ大きさ。合わせると180°です。',
             ar: 'ليس بعد. في المثلث المتساوي الأضلاع الزوايا الثلاث متساوية. مجموعها 180°.' },
  falsch2: { de: 'Noch nicht. Zusammen müssen es 360° sein. Jedes Sechseck bringt 120°.',
             en: 'Not yet. Together it must be 360°. Each hexagon brings 120°.',
             fi: 'Ei vielä. Yhteensä pitää olla 360°. Jokainen kuusikulmio tuo 120°.',
             tr: 'Henüz değil. Toplam 360° olmalı. Her altıgen 120° getirir.',
             fr: 'Pas encore. Il faut 360° en tout. Chaque hexagone apporte 120°.',
             es: 'Todavía no. Juntos tienen que ser 360°. Cada hexágono aporta 120°.',
             ja: 'まだです。合わせて360°になるはず。六角形1つで120°です。',
             ar: 'ليس بعد. يجب أن يكون المجموع 360°. كل سداسي يعطي 120°.' }
};

// Richtung als Bildschirm-Vektor (Winkel mathematisch, y nach unten)
function dir(a) { return [Math.cos(a), -Math.sin(a)]; }
function plus(p, a, l) { var d = dir(a); return [p[0] + d[0] * l, p[1] + d[1] * l]; }
function zeilen() { return App.winkel.feldOffen() ? 2 : 3; }
// Bildbereich: platz(), aber nie bis in die Textzeilen unten (auf kleinen Bildschirmen mit offenem Schreibfeld)
function bereich() {
  var H = App.winkel, P = H.platz(zeilen()), unten = Math.min(P.unten, H.textY(zeilen()) - 16);
  var h = Math.max(50, unten - P.oben);
  return { h: h, my: P.oben + h / 2 };
}
// Teil 1: Mitte m und Seitenlänge s, damit das Sechseck (Breite 2s, Höhe 1,73s) ins Bild passt.
// Bei der ersten Frage liegt nur ein Dreieck da (Breite s, Höhe 0,87s): dann steht es selbst in der Mitte.
function mass1(Z) {
  var B = bereich();
  if (offen1(Z)) {
    var s1 = Math.min(S.w * 0.36, (B.h - 8) / 0.95);
    return { m: [S.w / 2 - s1 / 2, B.my + s1 * 0.433], s: s1 };
  }
  var s = Math.min(S.w * 0.36, (B.h - 8) / 1.8);
  return { m: [S.w / 2, B.my], s: s };
}
// Teil 2: drei Sechsecke um die Ecke V (Breite 3,5s, Höhe 3,46s), V etwas rechts der Mitte.
// Während der Frage nur das erste Sechseck und das Fragezeichen rechts der Ecke (Breite 3s, Höhe 1,73s).
function mass2(Z) {
  var B = bereich();
  if (offen2(Z)) {
    var s1 = Math.min((S.w - 32) / 3.2, (B.h - 8) / 1.8, S.w * 0.2);
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
function farbe(i) { return App.winkel.farben[i % 2 ? 2 : 1]; }   // Dreiecke abwechselnd braun und grau
// Farbe des Sechsecks j an der Ecke: braun, grau, Tinte
function farbe2(j) { return App.winkel.farben[[1, 2, 0][j]]; }

function offen1(Z) { return Z.t === 1 && !Z.ok1; }
function offen2(Z) { return Z.e === 2 && !Z.ok2; }
function start(Z) {
  if (offen1(Z)) App.winkel.frage(60, TEXT.falsch1, function () { Z.ok1 = true; });
  else if (offen2(Z)) App.winkel.frage(3, TEXT.falsch2, function () { Z.ok2 = true; });
}

App.level('winkel', {
  id: 'sechs-dreiecke',
  text: {
    de: { title: 'Sechs Dreiecke',
          task: 'Tippe: Gleichseitige Dreiecke legen sich um den Punkt. Wie groß ist ihr Winkel, und wie viele passen herum? Die Zahlen schreibst du ins Feld.',
          done: 'Sechs gleichseitige Dreiecke passen um einen Punkt: 6 × 60° = 360°, zusammen ein Sechseck. Drei Sechsecke passen um eine Ecke: 3 × 120° = 360°.' },
    en: { title: 'Six triangles',
          task: 'Tap: equilateral triangles are placed around the point. How big is their angle, and how many fit around? You write the numbers in the box.',
          done: 'Six equilateral triangles fit around a point: 6 × 60° = 360°, together a hexagon. Three hexagons fit around a corner: 3 × 120° = 360°.' },
    fi: { title: 'Kuusi kolmiota',
          task: 'Napauta: tasasivuisia kolmioita asettuu pisteen ympärille. Kuinka suuri niiden kulma on, ja montako mahtuu ympärille? Kirjoitat luvut kenttään.',
          done: 'Kuusi tasasivuista kolmiota mahtuu pisteen ympärille: 6 × 60° = 360°, yhdessä kuusikulmio. Kolme kuusikulmiota mahtuu kulman ympärille: 3 × 120° = 360°.' },
    tr: { title: 'Altı üçgen',
          task: 'Dokun: eşkenar üçgenler noktanın etrafına yerleşir. Açıları kaç derece ve etrafa kaç tane sığar? Sayıları kutuya yazarsın.',
          done: 'Bir noktanın etrafına altı eşkenar üçgen sığar: 6 × 60° = 360°, birlikte bir altıgen. Bir köşenin etrafına üç altıgen sığar: 3 × 120° = 360°.' },
    fr: { title: 'Six triangles',
          task: 'Touche l’écran : des triangles équilatéraux se placent autour du point. Combien mesure leur angle, et combien en tiennent autour ? Tu écris les nombres dans la case.',
          done: 'Six triangles équilatéraux tiennent autour d’un point : 6 × 60° = 360°, ensemble un hexagone. Trois hexagones tiennent autour d’un coin : 3 × 120° = 360°.' },
    es: { title: 'Seis triángulos',
          task: 'Toca: se colocan triángulos equiláteros alrededor del punto. ¿Cuánto mide su ángulo y cuántos caben alrededor? Escribes los números en la casilla.',
          done: 'Seis triángulos equiláteros caben alrededor de un punto: 6 × 60° = 360°, juntos un hexágono. Tres hexágonos caben alrededor de una esquina: 3 × 120° = 360°.' },
    ja: { title: '6つの三角形',
          task: 'タップすると、点のまわりに正三角形がならびます。その角は何度？まわりにいくつ入るかな？数は自分で書こう。',
          done: '点のまわりに正三角形が6つ入ります：6 × 60° = 360°、合わせて六角形。1つの角のまわりに六角形が3つ入ります：3 × 120° = 360°。' },
    ar: { title: 'ستة مثلثات',
          task: 'انقر: توضع مثلثات متساوية الأضلاع حول النقطة. كم قياس زاويتها، وكم منها يتسع حولها؟ تكتب الأعداد في المربع.',
          done: 'ستة مثلثات متساوية الأضلاع تتسع حول نقطة: 6 × 60° = 360°، ومعًا تصنع سداسيًا. ثلاثة سداسيات تتسع حول زاوية: 3 × 120° = 360°.' }
  },
  werkzeuge: ['clear'],
  overlayBeiFrage: true,   // bei der zweiten Frage steht sie unten

  // t: gelegte Dreiecke (0 bis 6), ok1: 60 geschrieben; e: Schritte in Teil 2 (1 Ecke gezeigt, 2 Frage),
  // ok2: 3 geschrieben; h: weitere Sechsecke an der Ecke (0 bis 2)
  neu: function (Z) { Z.t = 0; Z.ok1 = false; Z.e = 0; Z.ok2 = false; Z.h = 0; },
  start: start,

  down: function (Z) {
    if (offen1(Z) || offen2(Z)) return;   // erst die Frage beantworten
    if (Z.t < 6) { Z.t++; start(Z); }
    else if (Z.e < 2) { Z.e++; start(Z); }
    else if (Z.h < 2) { Z.h++; if (Z.h === 2) App.winkel.geschafft(); }
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (Z.e === 0) {
      // Teil 1: Dreiecke um den Punkt
      var M = mass1(Z), s = M.s, m = M.m, rf = Math.max(16 * k, Math.min(28 * k, s * 0.26)), ganz = Z.t === 6;
      for (var i = 0; i < Z.t; i++) {
        var a = plus(m, i * GRAD60, s), b = plus(m, (i + 1) * GRAD60, s), f = farbe(i);
        vieleck(ctx, [m, a, b], f.fuell.replace(/[\d.]+\)$/, '0.08)'), null);
        H.feld(ctx, m, rf, i * GRAD60, GRAD60, f.fuell, f.linie, ws);
        var frag = offen1(Z) && i === 0;
        var l = plus(m, (i + 0.5) * GRAD60, s * 0.5);
        App.text(ctx, frag ? '?' : '60°', l[0], l[1], f.linie, frag ? 22 : 15);
      }
      // Kanten: einzeln in Tinte; mit sechs Dreiecken der Rand kräftig, die Speichen dünn
      for (var j = 0; j < Z.t; j++) {
        var p = plus(m, j * GRAD60, s), q = plus(m, (j + 1) * GRAD60, s);
        ctx.strokeStyle = ganz ? C.PENCIL : ink; ctx.lineWidth = (ganz ? 1.4 : 2.2) * ws * k;
        ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(p[0], p[1]);
        if (!ganz) { ctx.moveTo(m[0], m[1]); ctx.lineTo(q[0], q[1]); }
        ctx.stroke();
        if (!ganz) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
      }
      if (ganz) vieleck(ctx, sechseck(m, s), null, ink, 3.5 * ws * k);
      ctx.fillStyle = ink; App.dotAt(ctx, m, false);
      return;
    }
    // Teil 2: das erste Sechseck links der Ecke V, weitere oben rechts und unten rechts
    var M2 = mass2(Z), s2 = M2.s, v = M2.v, r2 = Math.max(14 * k, Math.min(26 * k, s2 * 0.3));
    var mitten = [plus(v, Math.PI, s2), plus(v, GRAD60, s2), plus(v, -GRAD60, s2)];
    var anfang = [2 * GRAD60, 0, 4 * GRAD60];   // Richtung, ab der das Sechseck j an V liegt (je 120°)
    var zahl = Z.ok2 ? 1 + Z.h : 1;
    for (var n = 0; n < zahl; n++) {
      var fn = farbe2(n);
      vieleck(ctx, sechseck(mitten[n], s2), fn.fuell.replace(/[\d.]+\)$/, '0.07)'), null);
    }
    // Dreiecke im ersten Sechseck dünn
    ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 1.2 * ws * k;
    sechseck(mitten[0], s2).forEach(function (p) {
      ctx.beginPath(); ctx.moveTo(mitten[0][0], mitten[0][1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    });
    for (var u = 0; u < zahl; u++) vieleck(ctx, sechseck(mitten[u], s2), null, ink, 3 * ws * k);
    if (Z.e === 1) {
      // zwei Dreieckswinkel an der Ecke: braun (Dreieck oben) und grau (Dreieck unten)
      [[2 * GRAD60, H.farben[1]], [3 * GRAD60, H.farben[2]]].forEach(function (w) {
        H.feld(ctx, v, r2 * 1.2, w[0], GRAD60, w[1].fuell, w[1].linie, ws);
        var l = plus(v, w[0] + GRAD60 / 2, Math.max(s2 * 0.55, r2 + 16 * k));
        beschrift(ctx, '60°', l, w[1].linie, 15);
      });
    } else {
      for (var o = 0; o < zahl; o++) {
        var fo = farbe2(o);
        H.feld(ctx, v, r2, anfang[o], 2 * GRAD60, fo.fuell, fo.linie, ws);
        var lo = plus(v, anfang[o] + GRAD60, Math.max(s2 * 0.55, r2 + 16 * k));
        beschrift(ctx, '120°', lo, fo.linie, 15);
      }
      if (offen2(Z)) App.text(ctx, '?', v[0] + s2 * 0.7, v[1], ink, 22);
    }
    ctx.fillStyle = ink; App.dotAt(ctx, v, false);
  },

  // Unten: Gleichung (20px), darunter Drehung bzw. Hinweis (14.5px)
  overlay: function (ctx, Z) {
    var H = App.winkel, y = H.textY(zeilen()), br = H.farben[1].linie, gr = H.farben[2].linie, teile = [], z2 = null, z2ink = false, wt = false;
    if (offen1(Z)) return;   // offene Frage: keine Rechnung
    if (Z.e === 0) {
      if (!Z.t) return;
      if (Z.t === 6) {
        teile = [{ t: '6 × 60° = 360°', c: C.INK }];
        z2 = App.wahl(TEXT.umdrehung); z2ink = true; wt = true;
      } else {
        for (var i = 0; i < Z.t; i++) {
          if (i) teile.push({ t: ' + ', c: C.INK });
          teile.push({ t: offen1(Z) ? '?' : '60°', c: i % 2 ? gr : br });
        }
        if (Z.t > 1) teile.push({ t: ' = ' + 60 * Z.t + '°', c: C.INK });
        z2 = Z.t + ' × 1/6 ' + App.wahl(TEXT.drehung);
        wt = !offen1(Z);
      }
    } else if (Z.e === 1) {
      teile = [{ t: '60°', c: br }, { t: ' + ', c: C.INK }, { t: '60°', c: gr }, { t: ' = 120°', c: C.INK }];
      wt = true;
    } else if (!Z.ok2) {
      z2 = App.wahl(TEXT.sechseck); z2ink = true;   // nur die Frage, keine Rechnung
    } else {
      for (var j = 0; j <= Z.h; j++) {
        if (j) teile.push({ t: ' + ', c: C.INK });
        teile.push({ t: '120°', c: farbe2(j).linie });
      }
      if (Z.h) teile.push({ t: ' = ' + 120 * (Z.h + 1) + '°', c: C.INK });
      if (Z.h === 2) { z2 = App.wahl(TEXT.umdrehung); z2ink = true; } else wt = true;
    }
    H.zeile(ctx, teile, y, teile.length > 9 ? 18 : 20);
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    var yy = y + 22;
    if (z2) { ctx.fillStyle = z2ink ? C.INK : C.PENCIL; ctx.fillText(z2, S.w / 2, yy); yy += 22; }
    if (wt) { ctx.fillStyle = C.PENCIL; ctx.fillText(App.wahl(TEXT.weiter), S.w / 2, yy); }
    ctx.restore();
  },

  bild: function (Z) { return Z.t ? { v: 1, t: Z.t, ok1: Z.ok1, e: Z.e, ok2: Z.ok2, h: Z.h } : null; },
  ausBild: function (Z, b) {
    if (b.v === 1) { Z.t = b.t; Z.ok1 = !!b.ok1; Z.e = b.e || 0; Z.ok2 = !!b.ok2; Z.h = b.h || 0; }
  }
});
})();
