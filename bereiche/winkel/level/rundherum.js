// Level: Einmal um eine Form herumgehen. Jedes Antippen ist ein Schritt: eine Seite entlanggehen oder sich an der
// Ecke drehen. Die Drehungen sind die Außenwinkel (gestrichelte Verlängerung, braunes Feld mit Gradzahl).
// Zurück am Start hat man sich einmal ganz gedreht: Dreieck 3 × 120°, Quadrat 4 × 90°, Fünfeck 5 × 72°, Sechseck 6 × 60°.
// Danach geht es mit dem nächsten Antippen zur nächsten Form. Ab dem Quadrat steht an der ersten Drehung ein
// Fragezeichen: die Gradzahl schreibt man ins Schreibfeld (360 geteilt durch die Zahl der Ecken), erst dann geht es weiter.
// Gelöst nach dem Sechseck.
(function () {
var App = window.App, S = App.S, C = App.C;
var FORMEN = [3, 4, 5, 6];

var TEXT = {
  umdrehung: { de: 'eine volle Umdrehung', en: 'one full turn', fi: 'yksi täysi kierros', tr: 'tam bir tur',
               fr: 'un tour complet', es: 'una vuelta completa', ja: 'ちょうど1回転', ar: 'دورة كاملة' },
  drehung: { de: 'Drehung', en: 'turn', fi: 'kierros', tr: 'tur', fr: 'tour', es: 'vuelta', ja: '回転', ar: 'دورة' },
  weiter: { de: 'Tippe für die nächste Form', en: 'Tap for the next shape', fi: 'Napauta, niin tulee seuraava muoto',
            tr: 'Sonraki şekil için dokun', fr: 'Touche l’écran pour la forme suivante', es: 'Toca para la siguiente forma',
            ja: 'タップすると次の形', ar: 'انقر للشكل التالي' },
  falsch: { de: 'Noch nicht. Alle Drehungen zusammen sind eine volle Umdrehung: 360°. Und alle Drehungen sind gleich groß.',
            en: 'Not yet. All the turns together make one full turn: 360°. And all the turns are the same size.',
            fi: 'Ei vielä. Kaikki käännökset yhdessä ovat yksi täysi kierros: 360°. Ja kaikki käännökset ovat yhtä suuret.',
            tr: 'Henüz değil. Bütün dönüşler birlikte tam bir tur eder: 360°. Ve bütün dönüşler eşittir.',
            fr: 'Pas encore. Tous les virages ensemble font un tour complet : 360°. Et tous les virages sont égaux.',
            es: 'Todavía no. Todos los giros juntos son una vuelta completa: 360°. Y todos los giros son iguales.',
            ja: 'まだです。全部の回転を合わせるとちょうど1回転、360°。そして回転はみんな同じ大きさです。',
            ar: 'ليس بعد. كل الدورانات معًا دورة كاملة: 360°. وكل الدورانات متساوية.' }
};

// Ecken der Form mit k Seiten: Start unten links, erste Seite nach rechts, gegen den Uhrzeigersinn, in der Bildmitte
function ecken(k) {
  var P = App.winkel.platz(App.winkel.feldOffen() ? 2 : 3), R = Math.max(50, Math.min(S.w * 0.3, P.h / 2 - 20)), s = 2 * R * Math.sin(Math.PI / k), ext = 2 * Math.PI / k;
  var p = [[0, 0]], h = 0;
  for (var i = 1; i < k; i++) { p.push([p[i - 1][0] + s * Math.cos(h), p[i - 1][1] - s * Math.sin(h)]); h += ext; }
  var mx = 0, my = 0;
  p.forEach(function (q) { mx += q[0] / k; my += q[1] / k; });
  return { p: p.map(function (q) { return [q[0] - mx + S.w / 2, q[1] - my + P.my]; }), s: s, ext: ext };
}
// Stand: j Antipper in dieser Form; gegangen = aufgerundet j/2, gedreht = abgerundet j/2
function stand(Z) {
  var k = FORMEN[Z.form];
  return { k: k, gegangen: Math.ceil(Z.j / 2), gedreht: Math.floor(Z.j / 2), fertig: Z.j >= 2 * k };
}
function bruch(k) { return '1/' + k; }
// Ab dem Quadrat: nach der ersten Drehung erst die Frage nach ihrer Gradzahl
function offen(Z) { return Z.form > 0 && Z.j === 2 && !Z.ok; }
function start(Z) {
  if (offen(Z)) App.winkel.frage(Math.round(360 / FORMEN[Z.form]), TEXT.falsch, function () { Z.ok = true; });
}

App.level('winkel', {
  id: 'rundherum',
  text: {
    de: { title: 'Einmal rundherum',
          task: 'Geh um die Form herum. Jedes Tippen ist ein Schritt: eine Seite gehen oder dich an der Ecke drehen. Wie weit hast du dich gedreht, wenn du wieder am Start bist? Ab dem Quadrat schreibst du die erste Drehung selbst ins Feld.',
          done: 'Wer einmal um eine Form herumgeht, dreht sich genau einmal ganz herum: 360°. Beim Dreieck sind das 3 × 120°, beim Sechseck 6 × 60°.' },
    en: { title: 'Once around',
          task: 'Walk around the shape. Every tap is one step: walk a side or turn at a corner. How far have you turned when you are back at the start? From the square on, you write the first turn in the box yourself.',
          done: 'If you walk once around a shape, you turn exactly once all the way round: 360°. For the triangle that is 3 × 120°, for the hexagon 6 × 60°.' },
    fi: { title: 'Kerran ympäri',
          task: 'Kävele muodon ympäri. Jokainen napautus on yksi askel: kävele sivu tai käänny kulmassa. Kuinka paljon olet kääntynyt, kun olet taas lähtöpisteessä? Neliöstä alkaen kirjoitat ensimmäisen käännöksen itse kenttään.',
          done: 'Kun kävelee kerran muodon ympäri, kääntyy täsmälleen yhden täyden kierroksen: 360°. Kolmiossa se on 3 × 120°, kuusikulmiossa 6 × 60°.' },
    tr: { title: 'Bir tur',
          task: 'Şeklin etrafında yürü. Her dokunuş bir adım: bir kenar boyunca yürü ya da köşede dön. Başlangıca döndüğünde ne kadar dönmüş olursun? Kareden itibaren ilk dönüşü kutuya kendin yazarsın.',
          done: 'Bir şeklin etrafında bir kez yürüyen, tam bir kez döner: 360°. Üçgende bu 3 × 120°, altıgende 6 × 60°.' },
    fr: { title: 'Faire le tour',
          task: 'Fais le tour de la forme. Chaque toucher est un pas : longer un côté ou tourner à un coin. De combien as-tu tourné quand tu reviens au départ ? À partir du carré, tu écris toi-même le premier virage dans la case.',
          done: 'Quand on fait une fois le tour d’une forme, on tourne exactement d’un tour complet : 360°. Pour le triangle, c’est 3 × 120°, pour l’hexagone 6 × 60°.' },
    es: { title: 'Una vuelta entera',
          task: 'Camina alrededor de la forma. Cada toque es un paso: recorrer un lado o girar en una esquina. ¿Cuánto has girado cuando vuelves al inicio? A partir del cuadrado, escribes tú el primer giro en la casilla.',
          done: 'Si das una vuelta alrededor de una forma, giras exactamente una vuelta completa: 360°. En el triángulo son 3 × 120°, en el hexágono 6 × 60°.' },
    ja: { title: 'ぐるっと1周',
          task: '形のまわりを歩こう。1回タップするごとに1歩：辺を進むか、角で向きを変えます。スタートにもどったとき、どれだけ回ったかな？正方形からは、最初の回転を自分で書こう。',
          done: '形のまわりを1周すると、ちょうど1回転します：360°。三角形なら3 × 120°、六角形なら6 × 60°です。' },
    ar: { title: 'دورة حول الشكل',
          task: 'امشِ حول الشكل. كل نقرة خطوة: امشِ على ضلع أو استدر عند الزاوية. كم استدرت عندما تعود إلى البداية؟ من المربع فصاعدًا تكتب الدوران الأول بنفسك في المربع.',
          done: 'من يمشي مرة حول شكل يستدير دورة كاملة تمامًا: 360°. في المثلث 3 × 120°، وفي السداسي 6 × 60°.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) { Z.form = 0; Z.j = 0; Z.ok = false; },
  start: start,

  down: function (Z) {
    var st = stand(Z);
    if (offen(Z)) return;   // erst die Frage beantworten
    if (!st.fertig) {
      Z.j++;
      start(Z);
      if (Z.form === FORMEN.length - 1 && stand(Z).fertig) App.winkel.geschafft();
    } else if (Z.form < FORMEN.length - 1) { Z.form++; Z.j = 0; Z.ok = false; }
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, st = stand(Z), E = ecken(st.k), p = E.p, n = st.k;
    var f = H.farben[1];
    // Seiten: schon gegangene kräftig in Tinte, die anderen grau
    for (var i = 0; i < n; i++) {
      var a = p[i], b = p[(i + 1) % n], weg = i < st.gegangen;
      ctx.strokeStyle = weg ? ink : C.PENCIL; ctx.lineWidth = (weg ? 3 : 1.6) * ws * k; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    // Drehungen an den Ecken: gestrichelte Verlängerung der Seite davor und das Feld der Drehung
    var deg = Math.round(360 / n);
    for (var t = 1; t <= st.gedreht; t++) {
      var q = p[t % n], h0 = (t - 1) * E.ext, L = E.s * 0.42;
      ctx.save(); ctx.setLineDash([6 * k, 6 * k]);
      ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 1.6 * ws * k;
      ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + Math.cos(h0) * L, q[1] - Math.sin(h0) * L); ctx.stroke();
      ctx.restore();
      H.feld(ctx, q, 26 * k, h0, E.ext, f.fuell, f.linie, ws);
      var mid = h0 + E.ext / 2;
      App.text(ctx, offen(Z) ? '?' : deg + '°', q[0] + Math.cos(mid) * 48 * k, q[1] - Math.sin(mid) * 48 * k, f.linie, offen(Z) ? 20 : 15);
    }
    // Start: kleiner Ring
    ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 1.6 * ws * k;
    ctx.beginPath(); ctx.arc(p[0][0], p[0][1], 10 * k, 0, H.TAU); ctx.stroke();
    // Läufer: Pfeilspitze an seiner Ecke, in Blickrichtung
    var wo = p[st.gegangen % n], blick = st.gedreht * E.ext, c = Math.cos(blick), s = -Math.sin(blick), g = 13 * k;
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(wo[0] + c * g, wo[1] + s * g);
    ctx.lineTo(wo[0] - c * g * 0.6 - s * g * 0.7, wo[1] - s * g * 0.6 + c * g * 0.7);
    ctx.lineTo(wo[0] - c * g * 0.6 + s * g * 0.7, wo[1] - s * g * 0.6 - c * g * 0.7);
    ctx.closePath(); ctx.fill();
  },

  // Unten über der Leiste: 120° + 120° = 240°, darunter 2 × 1/3 Drehung bzw. 3 × 1/3 = eine volle Umdrehung
  overlay: function (ctx, Z) {
    var H = App.winkel, st = stand(Z), y = H.feldOffen() ? H.textY(2) : H.textY(3);
    if (!st.gedreht) return;
    var deg = Math.round(360 / st.k), teile = [];
    for (var i = 0; i < st.gedreht; i++) teile.push(offen(Z) ? '?' : deg + '°');
    var z1 = teile.join(' + ') + (st.gedreht > 1 ? ' = ' + deg * st.gedreht + '°' : '');
    var z2 = st.gedreht + ' × ' + bruch(st.k) + ' ' + App.wahl(TEXT.drehung) + (st.fertig ? ' = ' + App.wahl(TEXT.umdrehung) : '');
    ctx.save();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.font = '400 ' + (st.k > 4 && st.gedreht > 4 ? 17 : 20) + 'px ' + C.FONT; ctx.fillStyle = H.farben[1].linie;
    ctx.fillText(z1, S.w / 2, y);
    ctx.font = '400 14.5px ' + C.FONT; ctx.fillStyle = st.fertig ? C.INK : C.PENCIL;
    ctx.fillText(z2, S.w / 2, y + 22);
    if (st.fertig && Z.form < FORMEN.length - 1) { ctx.fillStyle = C.PENCIL; ctx.fillText(App.wahl(TEXT.weiter), S.w / 2, y + 44); }
    ctx.restore();
  },

  bild: function (Z) { return (Z.form || Z.j) ? { v: 2, form: Z.form, j: Z.j, ok: Z.ok } : null; },
  ausBild: function (Z, b) {
    if (b.v === 2) { Z.form = b.form; Z.j = b.j; Z.ok = b.ok; }
    else if (b.v === 1) { Z.form = b.form; Z.j = b.j; Z.ok = Z.j > 2; }   // frühere Fassung
  }
});
})();
