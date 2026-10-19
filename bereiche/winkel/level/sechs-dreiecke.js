// Level: Gleichseitige Dreiecke um einen Punkt. Jedes Antippen ist ein Schritt, keine Animation.
// Am Anfang liegt schon ein gleichseitiges Dreieck mit einer Ecke im Punkt, sein Winkel dort zeigt "?":
// man schreibt 60 ins Schreibfeld. Dann die Frage: Wie viele gleichseitige Dreiecke passen um den Punkt? (6). Danach legt
// jedes Antippen das nächste Dreieck daneben (Felder am Punkt abwechselnd braun und grau), unten "60° + 60° = 120°" und
// "2 × 1/6 Drehung". Nach sechs Dreiecken ist der Rand ein Sechseck: 6 × 60° = 360°, eine volle Umdrehung. Gelöst.
// Die Sechsecke um eine Ecke kommen im nächsten Level (sechsecke-ecke).
(function () {
var App = window.App, S = App.S, C = App.C;
var GRAD60 = Math.PI / 3;

var TEXT = {
  umdrehung: { de: 'eine volle Umdrehung', en: 'one full turn', fi: 'yksi täysi kierros', tr: 'tam bir tur',
               fr: 'un tour complet', es: 'una vuelta completa', ja: 'ちょうど1回転', ar: 'دورة كاملة' },
  drehung: { de: 'Drehung', en: 'turn', fi: 'kierros', tr: 'tur', fr: 'tour', es: 'vuelta', ja: '回転', ar: 'دورة' },
  weiter: { de: 'Tippe weiter', en: 'Tap to go on', fi: 'Napauta jatkaaksesi', tr: 'Devam etmek için dokun',
            fr: 'Touche l’écran pour continuer', es: 'Toca para seguir', ja: 'タップして先へ', ar: 'انقر للمتابعة' },
  winkel: { de: 'Wie groß ist der Winkel des Dreiecks am Punkt?', en: 'How big is the triangle’s angle at the point?',
            fi: 'Kuinka suuri on kolmion kulma pisteessä?', tr: 'Üçgenin noktadaki açısı kaç derece?',
            fr: 'Combien mesure l’angle du triangle au point ?', es: '¿Cuánto mide el ángulo del triángulo en el punto?',
            ja: '点のところの三角形の角は何度かな？', ar: 'كم قياس زاوية المثلث عند النقطة؟' },
  anzahl: { de: 'Wie viele gleichseitige Dreiecke passen um den Punkt?', en: 'How many equilateral triangles fit around the point?',
            fi: 'Montako tasasivuista kolmiota mahtuu pisteen ympärille?', tr: 'Noktanın etrafına kaç eşkenar üçgen sığar?',
            fr: 'Combien de triangles équilatéraux tiennent autour du point ?', es: '¿Cuántos triángulos equiláteros caben alrededor del punto?',
            ja: '点のまわりに正三角形はいくつ入るかな？', ar: 'كم مثلثًا متساوي الأضلاع يتسع حول النقطة؟' },
  falsch1: { de: 'Noch nicht. Im gleichseitigen Dreieck sind alle drei Winkel gleich groß. Zusammen sind sie 180°.',
             en: 'Not yet. In an equilateral triangle all three angles are the same size. Together they make 180°.',
             fi: 'Ei vielä. Tasasivuisen kolmion kaikki kolme kulmaa ovat yhtä suuret. Yhdessä ne ovat 180°.',
             tr: 'Henüz değil. Eşkenar üçgende üç açı da eşittir. Toplamları 180°.',
             fr: 'Pas encore. Dans un triangle équilatéral, les trois angles sont égaux. Ensemble, ils font 180°.',
             es: 'Todavía no. En un triángulo equilátero los tres ángulos son iguales. Juntos suman 180°.',
             ja: 'まだです。正三角形の3つの角はみんな同じ大きさ。合わせると180°です。',
             ar: 'ليس بعد. في المثلث المتساوي الأضلاع الزوايا الثلاث متساوية. مجموعها 180°.' },
  falsch2: { de: 'Noch nicht. Rundherum sind es 360°. Jedes Dreieck bringt 60°.',
             en: 'Not yet. All the way round is 360°. Each triangle brings 60°.',
             fi: 'Ei vielä. Koko kierros on 360°. Jokainen kolmio tuo 60°.',
             tr: 'Henüz değil. Tam tur 360°. Her üçgen 60° getirir.',
             fr: 'Pas encore. Un tour complet fait 360°. Chaque triangle apporte 60°.',
             es: 'Todavía no. Una vuelta entera son 360°. Cada triángulo aporta 60°.',
             ja: 'まだです。ぐるっと1周で360°。三角形1つで60°です。',
             ar: 'ليس بعد. الدورة الكاملة 360°. كل مثلث يعطي 60°.' }
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
// Mitte m und Seitenlänge s, damit das Sechseck (Breite 2s, Höhe 1,73s) ins Bild passt.
// Bei der ersten Frage liegt nur ein Dreieck da (Breite s, Höhe 0,87s): dann steht es selbst in der Mitte.
function mass1(Z) {
  var B = bereich();
  if (Z.t === 1) {
    var s1 = Math.min(S.w * 0.36, (B.h - 8) / 0.95);
    return { m: [S.w / 2 - s1 / 2, B.my + s1 * 0.433], s: s1 };
  }
  var s = Math.min(S.w * 0.36, (B.h - 8) / 1.8);
  return { m: [S.w / 2, B.my], s: s };
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

function offen1(Z) { return Z.t === 1 && !Z.ok1; }
function offen2(Z) { return Z.t === 1 && Z.ok1 && !Z.ok2; }
// nach der 60 gleich die zweite Frage: wie viele passen herum?
function start(Z) {
  if (offen1(Z)) App.winkel.frage(60, TEXT.falsch1, function () { Z.ok1 = true; start(Z); }, { text: TEXT.winkel });
  else if (offen2(Z)) App.winkel.frage(6, TEXT.falsch2, function () { Z.ok2 = true; }, { text: TEXT.anzahl, einheit: '' });
}

App.level('winkel', {
  id: 'sechs-dreiecke',
  text: {
    de: { title: 'Sechs Dreiecke',
          task: 'Ein gleichseitiges Dreieck liegt am Punkt. Wie groß ist sein Winkel dort, und wie viele gleichseitige Dreiecke passen um den Punkt? Die Zahlen schreibst du ins Feld.',
          done: 'Sechs gleichseitige Dreiecke passen um einen Punkt: 6 × 60° = 360°, eine volle Umdrehung. Zusammen sind sie ein Sechseck.' },
    en: { title: 'Six triangles',
          task: 'An equilateral triangle lies at the point. How big is its angle there, and how many equilateral triangles fit around the point? You write the numbers in the box.',
          done: 'Six equilateral triangles fit around a point: 6 × 60° = 360°, one full turn. Together they make a hexagon.' },
    fi: { title: 'Kuusi kolmiota',
          task: 'Tasasivuinen kolmio on pisteessä. Kuinka suuri sen kulma siinä on, ja montako tasasivuista kolmiota mahtuu pisteen ympärille? Kirjoitat luvut kenttään.',
          done: 'Kuusi tasasivuista kolmiota mahtuu pisteen ympärille: 6 × 60° = 360°, yksi täysi kierros. Yhdessä ne muodostavat kuusikulmion.' },
    tr: { title: 'Altı üçgen',
          task: 'Noktada bir eşkenar üçgen duruyor. Oradaki açısı kaç derece ve noktanın etrafına kaç eşkenar üçgen sığar? Sayıları kutuya yazarsın.',
          done: 'Bir noktanın etrafına altı eşkenar üçgen sığar: 6 × 60° = 360°, tam bir tur. Birlikte bir altıgen oluştururlar.' },
    fr: { title: 'Six triangles',
          task: 'Un triangle équilatéral est posé contre le point. Combien mesure son angle à cet endroit, et combien de triangles équilatéraux tiennent autour du point ? Tu écris les nombres dans la case.',
          done: 'Six triangles équilatéraux tiennent autour d’un point : 6 × 60° = 360°, un tour complet. Ensemble, ils forment un hexagone.' },
    es: { title: 'Seis triángulos',
          task: 'Hay un triángulo equilátero en el punto. ¿Cuánto mide su ángulo allí y cuántos triángulos equiláteros caben alrededor del punto? Escribes los números en la casilla.',
          done: 'Seis triángulos equiláteros caben alrededor de un punto: 6 × 60° = 360°, una vuelta completa. Juntos forman un hexágono.' },
    ja: { title: '6つの三角形',
          task: '点に正三角形が1つあります。そこの角は何度？点のまわりに正三角形はいくつ入るかな？数は自分で書こう。',
          done: '点のまわりに正三角形が6つ入ります：6 × 60° = 360°、ちょうど1回転。合わせると六角形になります。' },
    ar: { title: 'ستة مثلثات',
          task: 'يوجد مثلث متساوي الأضلاع عند النقطة. كم قياس زاويته هناك، وكم مثلثًا متساوي الأضلاع يتسع حول النقطة؟ تكتب الأعداد في المربع.',
          done: 'ستة مثلثات متساوية الأضلاع تتسع حول نقطة: 6 × 60° = 360°، دورة كاملة. ومعًا تصنع سداسيًا.' }
  },
  werkzeuge: ['clear'],

  // t: gelegte Dreiecke (0 bis 6), ok1: 60 geschrieben, ok2: 6 geschrieben
  neu: function (Z) { Z.t = 1; Z.ok1 = false; Z.ok2 = false; },   // das erste Dreieck liegt gleich da
  start: start,

  down: function (Z) {
    if (offen1(Z) || offen2(Z)) return;   // erst die Frage beantworten
    if (Z.t < 6) { Z.t++; start(Z); if (Z.t === 6) App.winkel.geschafft(); }
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    {
      // Dreiecke um den Punkt
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
    }
  },

  // Unten: Gleichung (20px), darunter Drehung bzw. Hinweis (14.5px)
  overlay: function (ctx, Z) {
    var H = App.winkel, y = H.textY(zeilen()), br = H.farben[1].linie, gr = H.farben[2].linie, teile = [], z2 = null, z2ink = false, wt = false;
    if (offen1(Z)) return;   // offene Frage: keine Rechnung
    if (offen2(Z)) return;   // die Frage steht im Schreibfeld
    {
      if (!Z.t) return;
      if (Z.t === 6) {
        teile = [{ t: '6 × 60° = 360°', c: C.INK }];
        z2 = App.wahl(TEXT.umdrehung); z2ink = true;
      } else {
        for (var i = 0; i < Z.t; i++) {
          if (i) teile.push({ t: ' + ', c: C.INK });
          teile.push({ t: offen1(Z) ? '?' : '60°', c: i % 2 ? gr : br });
        }
        if (Z.t > 1) teile.push({ t: ' = ' + 60 * Z.t + '°', c: C.INK });
        z2 = Z.t + ' × 1/6 ' + App.wahl(TEXT.drehung);
        wt = !offen1(Z);
      }
    }
    H.zeile(ctx, teile, y, teile.length > 9 ? 18 : 20);
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    var yy = y + 22;
    if (z2) { ctx.fillStyle = z2ink ? C.INK : C.PENCIL; ctx.fillText(z2, S.w / 2, yy); yy += 22; }
    if (wt) { ctx.fillStyle = C.PENCIL; ctx.fillText(App.wahl(TEXT.weiter), S.w / 2, yy); }
    ctx.restore();
  },

  bild: function (Z) { return Z.t ? { v: 2, t: Z.t, ok1: Z.ok1, ok2: Z.ok2 } : null; },
  ausBild: function (Z, b) {
    if (b.v === 2) { Z.t = b.t; Z.ok1 = !!b.ok1; Z.ok2 = !!b.ok2; }
    else if (b.v === 1) { Z.t = b.t; Z.ok1 = !!b.ok1; Z.ok2 = b.t > 1; }   // frühere Fassung ohne Frage nach der Anzahl
  }
});
})();
