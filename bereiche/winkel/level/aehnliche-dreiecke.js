// Level: Ein rechtwinkliges Dreieck ABC, die lange Seite AB unten, der rechte Winkel oben bei C (C liegt auf dem
// Halbkreis über AB, dünn angedeutet). α bei A braun (zufällig 30° bis 60° in Fünferschritten, nicht 45°), β bei B in
// Tinte, 90° bei C grau. Antippen zeigt die Höhe von C auf AB gestrichelt: zwei kleine Dreiecke. Der Winkel bei C im
// linken kleinen Dreieck zeigt "?", man schreibt ihn ins Schreibfeld (er ist so groß wie β). Danach haben beide Teile
// bei C ihre Zahl (links β, rechts α). Antippen zeigt die zwei kleinen Dreiecke einzeln unter dem großen, gleich
// ausgerichtet wie das große: dieselben Winkel, dieselbe Form, nur kleiner (ähnlich). Dann zieht man C am Griff auf dem
// Halbkreis (α 20° bis 70°), alles ändert sich mit. Gelöst nach insgesamt 30° Änderung von α.
// Zustand: Z.al ist α in Grad (Kommazahl beim Ziehen), daraus folgt die ganze Zeichnung.
(function () {
var App = window.App, S = App.S, C = App.C;
var AENDERUNG_NOETIG = 30;   // Grad, so weit muss sich α insgesamt ändern
var AL_MIN = 20, AL_MAX = 70;

var TEXT = {
  teilen: { de: 'Tippe, um das Dreieck zu teilen', en: 'Tap to split the triangle', fi: 'Napauta, niin kolmio jakautuu',
            tr: 'Üçgeni bölmek için dokun', fr: 'Touche pour couper le triangle', es: 'Toca para dividir el triángulo',
            ja: 'タップすると三角形が分かれます', ar: 'انقر لتقسيم المثلث' },
  einzeln: { de: 'Tippe, um die kleinen Dreiecke einzeln zu sehen', en: 'Tap to see the small triangles on their own',
             fi: 'Napauta, niin näet pienet kolmiot erikseen', tr: 'Küçük üçgenleri ayrı görmek için dokun',
             fr: 'Touche pour voir les petits triangles à part', es: 'Toca para ver los triángulos pequeños aparte',
             ja: 'タップすると小さい三角形を別々に見られます', ar: 'انقر لترى المثلثين الصغيرين منفصلين' },
  gleich: { de: 'Alle drei Dreiecke haben dieselben Winkel', en: 'All three triangles have the same angles',
            fi: 'Kaikilla kolmella kolmiolla on samat kulmat', tr: 'Üç üçgenin de açıları aynı',
            fr: 'Les trois triangles ont les mêmes angles', es: 'Los tres triángulos tienen los mismos ángulos',
            ja: '3つの三角形の角はみんな同じ', ar: 'للمثلثات الثلاثة الزوايا نفسها' },
  falsch: { de: 'Noch nicht. Im linken kleinen Dreieck gibt es α und einen rechten Winkel. Zusammen sind alle drei 180°.',
            en: 'Not yet. The small triangle on the left has α and a right angle. All three together make 180°.',
            fi: 'Ei vielä. Vasemmassa pienessä kolmiossa on α ja suora kulma. Kaikki kolme ovat yhteensä 180°.',
            tr: 'Henüz değil. Soldaki küçük üçgende α ve bir dik açı var. Üçünün toplamı 180°.',
            fr: 'Pas encore. Le petit triangle de gauche a α et un angle droit. Les trois ensemble font 180°.',
            es: 'Todavía no. El triángulo pequeño de la izquierda tiene α y un ángulo recto. Los tres juntos suman 180°.',
            ja: 'まだです。左の小さい三角形には α と直角があります。3つの角を合わせると180°です。',
            ar: 'ليس بعد. في المثلث الصغير الأيسر توجد α وزاوية قائمة. مجموع الزوايا الثلاث 180°.' }
};

var RAD = Math.PI / 180;
function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Kleinerer Winkel zwischen zwei Richtungen: Anfang und Weite (mathematisch, gegen den Uhrzeigersinn)
function zwischen(d1, d2) {
  var T = App.winkel.TAU, sw = ((d2 - d1) % T + T) % T;
  return sw <= Math.PI ? [d1, sw] : [d2, T - sw];
}
// Höchste Spitze der kleinen Dreiecke (in Teilen von R, ohne Verkleinerung): 2 cos²α sinα ist höchstens etwa 0,77
var KOPIE_H = 0.77;
// Maße: Mitte O von AB, halbe Länge R. Mit den einzelnen Dreiecken darunter wird alles kleiner.
// s ist die Verkleinerung der einzelnen Dreiecke, damit beide nebeneinander passen (für jedes α gleich, damit nichts springt).
function mass(Z) {
  // Platz wie App.winkel.platz, aber nie bis unter die Textzeile über dem Schreibfeld (auf kleinen Bildschirmen)
  var H = App.winkel, P = H.platz(2), k = S.k, unten = Math.min(P.unten, H.textY(2) - 10);
  var h = Math.max(70, unten - P.oben), my = P.oben + h / 2, R = Math.max(40, Math.min(S.w * 0.42, (h - 24) / 1.1));
  var gx = 26 * k, g = 34 * k, unter = 24 * k, s = 1, yb;
  function verkl(R) { return Math.min(1, (S.w - 40 - gx) / (2 * R * Math.SQRT2)); }
  if (Z.getrennt) {
    s = verkl(R);
    while (R > 40 && R + g + KOPIE_H * s * R + unter > h) { R *= 0.96; s = verkl(R); }
    yb = my - (R + g + KOPIE_H * s * R + unter) / 2 + R;
  } else yb = my + R / 2;
  // f: kleineres Dreieck, kleinere Winkelfelder und Zahlen näher an der Ecke
  return { o: [S.w / 2, yb], R: R, s: s, g: g, gx: gx, yk: yb + g + KOPIE_H * s * R, f: Math.max(0.6, Math.min(1, R / 140)) };
}
// Ecken: A links, B rechts, C auf dem Halbkreis (Mittelpunktswinkel 2α von B aus), D Fußpunkt der Höhe
function ecken(Z) {
  var M = mass(Z), o = M.o, R = M.R, ph = 2 * Z.al * RAD;
  var c = [o[0] + R * Math.cos(ph), o[1] - R * Math.sin(ph)];
  return { M: M, a: [o[0] - R, o[1]], b: [o[0] + R, o[1]], c: c, d: [c[0], o[1]] };
}
// Ganze Gradzahlen: α gerundet, β = 90° − α
function zahlen(Z) { var a = Math.round(Z.al); return { a: a, b: 90 - a }; }

function start(Z) {
  if (Z.schritt === 1 && !Z.ok) App.winkel.frage(zahlen(Z).b, TEXT.falsch, function () { Z.ok = true; });
}

// Zeichen für den rechten Winkel an der Ecke p zwischen den Richtungen u und v (Einheitsvektoren auf dem Bildschirm)
function rechterWinkel(ctx, p, u, v, l, farbe, ws) {
  ctx.strokeStyle = farbe; ctx.lineWidth = 1.6 * ws * S.k; ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(p[0] + u[0] * l, p[1] + u[1] * l);
  ctx.lineTo(p[0] + (u[0] + v[0]) * l, p[1] + (u[1] + v[1]) * l);
  ctx.lineTo(p[0] + v[0] * l, p[1] + v[1] * l);
  ctx.stroke();
}
function einheit(p, q) { var d = abst(p, q) || 1; return [(q[0] - p[0]) / d, (q[1] - p[1]) / d]; }
// Winkelfeld an p zwischen den Richtungen zu q1 und q2, mit Zahl (oder ?) auf der Winkelhalbierenden
function winkelFeld(ctx, p, q1, q2, r, f, txt, groesse, ws, ra) {
  var H = App.winkel, w = zwischen(H.richtung(p, q1), H.richtung(p, q2)), mid = w[0] + w[1] / 2;
  H.feld(ctx, p, r, w[0], w[1], f.fuell, f.linie, ws);
  if (txt) App.text(ctx, txt, p[0] + Math.cos(mid) * ra, p[1] - Math.sin(mid) * ra, f.linie, groesse);
}
// Abstand der Zahl von der Ecke: bei spitzen Winkeln weiter weg, damit sie zwischen die Seiten passt
function zahlAbst(grad, k) { return (46 + Math.max(0, 45 - grad) * 0.9) * k; }

// Ein kleines Dreieck, gleich ausgerichtet wie das große: lange Seite unten von p (α, braun) nach rechts (β, Tinte),
// rechter Winkel oben. Die Zahlen stehen unter den Ecken bzw. über der Spitze, damit sie auch bei schmalen Dreiecken lesbar sind.
function kopie(ctx, p, L, al, z, ws) {
  var H = App.winkel, F = H.farben, k = S.k, ca = Math.cos(al * RAD), sa = Math.sin(al * RAD);
  var q = [p[0] + L, p[1]], t = [p[0] + L * ca * ca, p[1] - L * ca * sa], r = Math.min(20 * k, L * 0.22);
  ctx.fillStyle = 'rgba(56,41,25,0.05)';
  ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.lineTo(t[0], t[1]); ctx.closePath(); ctx.fill();
  winkelFeld(ctx, p, q, t, r, F[1], '', 0, ws);
  winkelFeld(ctx, q, p, t, r, F[0], '', 0, ws);
  rechterWinkel(ctx, t, einheit(t, p), einheit(t, q), Math.min(9 * k, L * 0.08), F[2].linie, ws);
  ctx.strokeStyle = C.INK; ctx.lineWidth = 2.2 * ws * k; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.lineTo(t[0], t[1]); ctx.closePath(); ctx.stroke();
  var yz = p[1] + 13 * k;
  App.text(ctx, z.a + '°', p[0] + 6 * k, yz, F[1].linie, 14);
  App.text(ctx, z.b + '°', q[0] - 6 * k, yz, F[0].linie, 14);
  App.text(ctx, '90°', t[0], t[1] - 13 * k, F[2].linie, 14);
}

function ziehen(Z, w) {
  var o = mass(Z).o, dx = w[0] - o[0], dy = Math.max(0, o[1] - w[1]);   // unter AB zählt wie auf AB
  if (Math.hypot(dx, dy) < 10 * S.k) return;
  var al = Math.max(AL_MIN, Math.min(AL_MAX, Math.atan2(dy, dx) / RAD / 2));
  Z.dreh += Math.abs(al - Z.al);
  Z.al = al;
  if (Z.dreh >= AENDERUNG_NOETIG) App.winkel.geschafft();
}

App.level('winkel', {
  id: 'aehnliche-dreiecke',
  text: {
    de: { title: 'Ähnliche Dreiecke',
          task: 'Ein rechtwinkliges Dreieck wird durch eine Linie in zwei kleinere geteilt. Tippe für den nächsten Schritt. Welche Winkel haben die kleinen Dreiecke? Zieh dann die Ecke oben am Griff.',
          done: 'Beide kleinen Dreiecke haben dieselben Winkel wie das große: α, β und 90°. Sie haben dieselbe Form, nur kleiner. Man nennt sie ähnlich.' },
    en: { title: 'Similar triangles',
          task: 'A right triangle is split by a line into two smaller ones. Tap for the next step. Which angles do the small triangles have? Then drag the top corner by its handle.',
          done: 'Both small triangles have the same angles as the big one: α, β and 90°. They have the same shape, only smaller. They are called similar.' },
    fi: { title: 'Yhdenmuotoiset kolmiot',
          task: 'Suorakulmainen kolmio jaetaan viivalla kahdeksi pienemmäksi. Napauta, niin näet seuraavan vaiheen. Mitkä kulmat pienillä kolmioilla on? Vedä sitten yläkulmaa kahvasta.',
          done: 'Molemmilla pienillä kolmioilla on samat kulmat kuin isolla: α, β ja 90°. Niillä on sama muoto, vain pienempänä. Niitä sanotaan yhdenmuotoisiksi.' },
    tr: { title: 'Benzer üçgenler',
          task: 'Bir dik üçgen bir çizgiyle iki küçük üçgene bölünüyor. Sonraki adım için dokun. Küçük üçgenlerin açıları ne? Sonra üst köşeyi tutamağından sürükle.',
          done: 'İki küçük üçgenin açıları da büyük üçgeninkilerle aynı: α, β ve 90°. Şekilleri aynı, sadece daha küçükler. Bunlara benzer üçgenler denir.' },
    fr: { title: 'Triangles semblables',
          task: 'Un triangle rectangle est coupé par un trait en deux triangles plus petits. Touche l’écran pour l’étape suivante. Quels angles ont les petits triangles ? Puis fais glisser le coin du haut par sa poignée.',
          done: 'Les deux petits triangles ont les mêmes angles que le grand : α, β et 90°. Ils ont la même forme, en plus petit. On dit qu’ils sont semblables.' },
    es: { title: 'Triángulos semejantes',
          task: 'Un triángulo rectángulo se divide con una línea en dos más pequeños. Toca para ver el siguiente paso. ¿Qué ángulos tienen los triángulos pequeños? Después arrastra la esquina de arriba por su asa.',
          done: 'Los dos triángulos pequeños tienen los mismos ángulos que el grande: α, β y 90°. Tienen la misma forma, solo que más pequeños. Se llaman semejantes.' },
    ja: { title: '相似な三角形',
          task: '直角三角形を1本の線で2つの小さい三角形に分けます。タップすると次に進みます。小さい三角形の角は何度かな？それから、上の角を持ち手で動かそう。',
          done: '2つの小さい三角形は、大きい三角形と同じ角 α、β、90° をもっています。形が同じで、大きさだけがちがいます。これを相似といいます。' },
    ar: { title: 'مثلثات متشابهة',
          task: 'نقسم مثلثًا قائم الزاوية بخط إلى مثلثين أصغر. انقر للخطوة التالية. ما زوايا المثلثين الصغيرين؟ ثم اسحب الرأس العلوي من مقبضه.',
          done: 'للمثلثين الصغيرين الزوايا نفسها التي للمثلث الكبير: α وβ و90°. لهما الشكل نفسه لكنهما أصغر. نسميهما متشابهين.' }
  },
  werkzeuge: ['clear'],

  // α zufällig 30° bis 60° in Fünferschritten, nicht 45° (sonst sind beide kleinen Dreiecke gleich groß)
  neu: function (Z) {
    var wahl = [30, 35, 40, 50, 55, 60];
    Z.schritt = 0; Z.ok = false; Z.getrennt = false; Z.dreh = 0; Z.zieht = false;
    Z.al = wahl[Math.floor(Math.random() * wahl.length)];
  },
  start: start,

  // Antippen: 0 → Höhe (Frage), nach der Antwort → kleine Dreiecke einzeln; dann bleibt es so, und nur der Griff zählt
  down: function (Z, w) {
    if (Z.schritt < 1) { Z.schritt = 1; start(Z); return; }
    if (!Z.ok) return;   // erst die Frage beantworten
    if (!Z.getrennt) { Z.getrennt = true; return; }
    Z.zieht = abst(w, ecken(Z).c) <= C.GRAB * 1.3 * S.k;   // nur am Griff
    if (Z.zieht) ziehen(Z, w);
  },
  move: function (Z, w) { if (Z.zieht) ziehen(Z, w); },
  up: function (Z) { Z.zieht = false; },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, F = H.farben, k = S.k, ink = C.INK, E = ecken(Z), M = E.M, a = E.a, b = E.b, c = E.c, d = E.d;
    var z = zahlen(Z), fa = F[1], fb = F[0], fg = F[2], kf = k * M.f, r = 30 * kf;
    // Halbkreis über AB, dünn und gestrichelt: darauf liegt C
    ctx.save();
    ctx.setLineDash([4 * k, 6 * k]); ctx.strokeStyle = 'rgba(115,115,122,0.45)'; ctx.lineWidth = 1.2 * ws * k;
    ctx.beginPath(); ctx.arc(M.o[0], M.o[1], M.R, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.restore();
    // bei der Frage das linke kleine Dreieck leicht hervorheben
    if (Z.schritt === 1 && !Z.ok) {
      ctx.fillStyle = 'rgba(56,41,25,0.07)';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill();
    }
    // Winkel bei A und B
    winkelFeld(ctx, a, b, c, r, fa, z.a + '°', 16, ws, zahlAbst(z.a, kf));
    winkelFeld(ctx, b, a, c, r, fb, z.b + '°', 16, ws, zahlAbst(z.b, kf));
    var ua = einheit(c, a), ub = einheit(c, b);
    if (Z.schritt < 1) {
      // rechter Winkel bei C: grau mit Zeichen und Zahl
      var mc = [ua[0] + ub[0], ua[1] + ub[1]], lm = Math.hypot(mc[0], mc[1]) || 1;
      rechterWinkel(ctx, c, ua, ub, 12 * kf, fg.linie, ws);
      App.text(ctx, '90°', c[0] + mc[0] / lm * 40 * kf, c[1] + mc[1] / lm * 40 * kf, fg.linie, 16);
    } else {
      // Teile bei C: links (im Dreieck bei A) so groß wie β, rechts so groß wie α
      var frage = !Z.ok;
      winkelFeld(ctx, c, a, d, frage ? 36 * kf : r, frage ? { linie: fb.linie, fuell: 'rgba(56,41,25,0.22)' } : fb,
                 frage ? '?' : z.b + '°', frage ? 22 : 16, frage ? ws * 1.5 : ws, zahlAbst(z.b, kf) + (frage ? 6 * kf : 0));
      if (Z.ok) winkelFeld(ctx, c, d, b, r, fa, z.a + '°', 16, ws, zahlAbst(z.a, kf));
      // Höhe gestrichelt, Fußpunkt mit rechtem Winkel
      ctx.save();
      ctx.setLineDash([7 * k, 6 * k]); ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke();
      ctx.restore();
      var lr = Math.min(11 * kf, Math.max(4, (c[1] - d[1]) * -0.25));
      rechterWinkel(ctx, d, [0, -1], d[0] > M.o[0] ? [-1, 0] : [1, 0], lr, fg.linie, ws);
    }
    // das große Dreieck
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5 * ws * k; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = ink; App.dotAt(ctx, a, false); App.dotAt(ctx, b, false); App.dotAt(ctx, c, false);
    if (!Z.getrennt) return;
    // die zwei kleinen Dreiecke einzeln darunter: links ADC (2R·cos α lang), rechts CDB (2R·sin α lang)
    var ca = Math.cos(Z.al * RAD), sa = Math.sin(Z.al * RAD), L1 = 2 * M.R * M.s * ca, L2 = 2 * M.R * M.s * sa;
    var x0 = (S.w - (L1 + M.gx + L2)) / 2;
    kopie(ctx, [x0, M.yk], L1, Z.al, z, ws);
    kopie(ctx, [x0 + L1 + M.gx, M.yk], L2, Z.al, z, ws);
    // Griff an C
    ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k;
    ctx.beginPath(); ctx.arc(c[0], c[1], 15 * k, 0, H.TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
  },

  // Unten: α + β + 90° = 180° (bei der Frage α + 90° + ? = 180°), darunter ein Hinweis
  overlay: function (ctx, Z) {
    var H = App.winkel, F = H.farben, z = zahlen(Z), frage = Z.schritt === 1 && !Z.ok, y = H.textY(frage ? 1 : 2);
    // gelöst: der Satz steht schon in der grünen Karte; die Gleichung bleibt über der Karte, auch wenn sie hoch ist
    var gruen = document.getElementById('fertig'), geloest = !!(gruen && !gruen.hidden);
    if (geloest) y = Math.min(y, gruen.getBoundingClientRect().top - 18);
    var plus = { t: ' + ', c: C.INK }, teile;
    if (frage) teile = [{ t: z.a + '°', c: F[1].linie }, plus, { t: '90°', c: F[2].linie }, plus, { t: '?', c: F[0].linie }, { t: ' = 180°', c: C.INK }];
    else teile = [{ t: z.a + '°', c: F[1].linie }, plus, { t: z.b + '°', c: F[0].linie }, plus, { t: '90°', c: F[2].linie }, { t: ' = 180°', c: C.INK }];
    H.zeile(ctx, teile, y);
    if (frage || geloest) return;
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
    ctx.fillText(App.wahl(Z.schritt < 1 ? TEXT.teilen : Z.getrennt ? TEXT.gleich : TEXT.einzeln), S.w / 2, y + 22);
    ctx.restore();
  },

  bild: function (Z) {
    return Z.schritt ? { v: 1, al: Z.al, ok: Z.ok, getrennt: Z.getrennt, dreh: Z.dreh } : null;
  },
  ausBild: function (Z, b) {
    if (b.v !== 1) return;
    Z.schritt = 1; Z.al = Math.max(AL_MIN, Math.min(AL_MAX, b.al)); Z.ok = !!b.ok;
    Z.getrennt = Z.ok && !!b.getrennt; Z.dreh = b.dreh || 0;
  }
});
})();
