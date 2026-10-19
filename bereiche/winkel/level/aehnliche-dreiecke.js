// Level: Ähnliche Dreiecke in zwei Teilen.
// Teil 1, was ähnlich heißt: ein Dreieck und eine kleinere Kopie mit denselben Winkeln (α, β = 90° − α, 90°), unten
// "Ähnlich: gleiche Winkel, gleiche Form, nur eine andere Größe". Antippen: oben das Dreieck, unten drei zur Wahl
// (eine verkleinerte Kopie, eins mit anderen Winkeln, eins flachgedrückt). Man tippt das ähnliche an, sonst rote Karte.
// Teil 2, warum: das große rechtwinklige Dreieck (lange Seite unten, 90° oben bei C), das Schreibfeld fragt nach β,
// dann wird es durch die Höhe geteilt und fragt nach dem Winkel oben im linken (β) und im rechten kleinen Dreieck (α).
// Danach stehen die drei Dreiecke einzeln nebeneinander, alle mit α, β, 90°. Gelöst.
// Zustand: Z.s Schritt (0, 1: Teil 1; 2, 3, 4: die Fragen; 5: fertig), Z.al α in Grad, Z.ord Reihenfolge der Wahl.
(function () {
var App = window.App, S = App.S, C = App.C;
var RAD = Math.PI / 180, FERTIG = 5;

var TEXT = {
  frageFeld: { de: 'Wie groß ist der Winkel mit dem Fragezeichen?', en: 'How big is the angle with the question mark?', fi: 'Kuinka suuri on kysymysmerkillä merkitty kulma?', tr: 'Soru işaretli açı kaç derece?', fr: 'Combien mesure l’angle avec le point d’interrogation ?', es: '¿Cuánto mide el ángulo con el signo de interrogación?', ja: '「?」の角は何度かな？', ar: 'كم قياس الزاوية التي عليها علامة الاستفهام؟' },
  gleich: { de: 'Alle drei Dreiecke haben dieselben Winkel', en: 'All three triangles have the same angles',
            fi: 'Kaikilla kolmella kolmiolla on samat kulmat', tr: 'Üç üçgenin de açıları aynı',
            fr: 'Les trois triangles ont les mêmes angles', es: 'Los tres triángulos tienen los mismos ángulos',
            ja: '3つの三角形の角はみんな同じ', ar: 'للمثلثات الثلاثة الزوايا نفسها' },
  aehnlich: { de: 'Ähnlich: gleiche Winkel, gleiche Form, nur eine andere Größe', en: 'Similar: same angles, same shape, just a different size',
              fi: 'Yhdenmuotoinen: samat kulmat, sama muoto, vain eri koko', tr: 'Benzer: aynı açılar, aynı şekil, sadece farklı büyüklük',
              fr: 'Semblables : mêmes angles, même forme, seulement une autre taille', es: 'Semejantes: mismos ángulos, misma forma, solo otro tamaño',
              ja: '相似：角が同じ、形が同じ、大きさだけちがう', ar: 'متشابهان: الزوايا نفسها، الشكل نفسه، والحجم فقط مختلف' },
  weiter: { de: 'Tippe weiter', en: 'Tap to go on', fi: 'Napauta jatkaaksesi', tr: 'Devam etmek için dokun',
            fr: 'Touche l’écran pour continuer', es: 'Toca para seguir', ja: 'タップして続けよう', ar: 'انقر للمتابعة' },
  waehle: { de: 'Welches Dreieck unten ist dem oberen ähnlich? Tippe es an.', en: 'Which triangle below is similar to the one at the top? Tap it.',
            fi: 'Mikä alla olevista kolmioista on yhdenmuotoinen ylemmän kanssa? Napauta sitä.', tr: 'Aşağıdaki hangi üçgen üsttekine benzer? Ona dokun.',
            fr: 'Quel triangle du bas est semblable à celui du haut ? Touche-le.', es: '¿Qué triángulo de abajo es semejante al de arriba? Tócalo.',
            ja: '下のどの三角形が上の三角形と相似かな？タップしよう。', ar: 'أي مثلث في الأسفل يشبه المثلث العلوي؟ انقر عليه.' },
  falschWahl: { de: 'Noch nicht. Ähnliche Dreiecke haben dieselben Winkel. Vergleiche die Winkel.',
                en: 'Not yet. Similar triangles have the same angles. Compare the angles.',
                fi: 'Ei vielä. Yhdenmuotoisilla kolmioilla on samat kulmat. Vertaa kulmia.',
                tr: 'Henüz değil. Benzer üçgenlerin açıları aynıdır. Açıları karşılaştır.',
                fr: 'Pas encore. Des triangles semblables ont les mêmes angles. Compare les angles.',
                es: 'Todavía no. Los triángulos semejantes tienen los mismos ángulos. Compara los ángulos.',
                ja: 'まだです。相似な三角形は角が同じ。角をくらべてみよう。',
                ar: 'ليس بعد. المثلثات المتشابهة لها الزوايا نفسها. قارن الزوايا.' },
  h1: { de: 'Noch nicht. Im großen Dreieck sind alle drei Winkel zusammen 180°.', en: 'Not yet. The three angles of the big triangle make 180° together.',
        fi: 'Ei vielä. Ison kolmion kolme kulmaa ovat yhteensä 180°.', tr: 'Henüz değil. Büyük üçgenin üç açısı toplamı 180°.',
        fr: 'Pas encore. Les trois angles du grand triangle font 180° ensemble.', es: 'Todavía no. Los tres ángulos del triángulo grande suman 180°.',
        ja: 'まだです。大きな三角形の3つの角は合わせて180°。', ar: 'ليس بعد. مجموع زوايا المثلث الكبير الثلاث 180°.' },
  h2: { de: 'Noch nicht. Das linke kleine Dreieck hat {w}° und 90°. Zusammen sind alle drei Winkel 180°.',
        en: 'Not yet. The small triangle on the left has {w}° and 90°. All three angles make 180° together.',
        fi: 'Ei vielä. Vasemmassa pienessä kolmiossa on {w}° ja 90°. Kaikki kolme kulmaa ovat yhteensä 180°.',
        tr: 'Henüz değil. Soldaki küçük üçgende {w}° ve 90° var. Üç açının toplamı 180°.',
        fr: 'Pas encore. Le petit triangle de gauche a {w}° et 90°. Les trois angles font 180° ensemble.',
        es: 'Todavía no. El triángulo pequeño de la izquierda tiene {w}° y 90°. Los tres ángulos suman 180°.',
        ja: 'まだです。左の小さな三角形には{w}°と90°があります。3つの角は合わせて180°。',
        ar: 'ليس بعد. في المثلث الصغير الأيسر {w}° و90°. مجموع الزوايا الثلاث 180°.' },
  h3: { de: 'Noch nicht. Das rechte kleine Dreieck hat {w}° und 90°. Zusammen sind alle drei Winkel 180°.',
        en: 'Not yet. The small triangle on the right has {w}° and 90°. All three angles make 180° together.',
        fi: 'Ei vielä. Oikeassa pienessä kolmiossa on {w}° ja 90°. Kaikki kolme kulmaa ovat yhteensä 180°.',
        tr: 'Henüz değil. Sağdaki küçük üçgende {w}° ve 90° var. Üç açının toplamı 180°.',
        fr: 'Pas encore. Le petit triangle de droite a {w}° et 90°. Les trois angles font 180° ensemble.',
        es: 'Todavía no. El triángulo pequeño de la derecha tiene {w}° y 90°. Los tres ángulos suman 180°.',
        ja: 'まだです。右の小さな三角形には{w}°と90°があります。3つの角は合わせて180°。',
        ar: 'ليس بعد. في المثلث الصغير الأيمن {w}° و90°. مجموع الزوايا الثلاث 180°.' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
function mit(text, w) { var r = {}; Object.keys(text).forEach(function (l) { r[l] = text[l].replace('{w}', w); }); return r; }
// Kleinerer Winkel zwischen zwei Richtungen: Anfang und Weite (mathematisch, gegen den Uhrzeigersinn)
function zwischen(d1, d2) {
  var T = App.winkel.TAU, sw = ((d2 - d1) % T + T) % T;
  return sw <= Math.PI ? [d1, sw] : [d2, T - sw];
}
// Winkelfeld an p zwischen den Richtungen zu q1 und q2, mit Zahl (oder ?) auf der Winkelhalbierenden
function winkelFeld(ctx, p, q1, q2, r, f, txt, groesse, ws, ra) {
  var H = App.winkel, w = zwischen(H.richtung(p, q1), H.richtung(p, q2)), mid = w[0] + w[1] / 2;
  H.feld(ctx, p, r, w[0], w[1], f.fuell, f.linie, ws);
  if (txt) App.text(ctx, txt, p[0] + Math.cos(mid) * ra, p[1] - Math.sin(mid) * ra, f.linie, groesse);
}
// Abstand der Zahl von der Ecke: bei spitzen Winkeln weiter weg, damit sie zwischen die Seiten passt
function zahlAbst(grad, k) { return (46 + Math.max(0, 45 - grad) * 0.9) * k; }
function zahlen(Z) { var a = Math.round(Z.al); return { a: a, b: 90 - a }; }
function grad(p, q1, q2) { var H = App.winkel; return Math.round(H.grad(zwischen(H.richtung(p, q1), H.richtung(p, q2))[1])); }

// Ein Dreieck mit langer Seite unten von p nach rechts (Länge L), Spitze t; Winkel bei p braun, rechts Tinte, oben grau.
// Die Zahlen (ausgemessen) stehen unter den Ecken bzw. über der Spitze, damit sie auch bei schmalen Dreiecken lesbar sind.
function dreieck(ctx, p, L, t, ws) {
  var F = App.winkel.farben, k = S.k, q = [p[0] + L, p[1]], r = Math.min(20 * k, L * 0.22);
  ctx.fillStyle = 'rgba(56,41,25,0.05)';
  ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.lineTo(t[0], t[1]); ctx.closePath(); ctx.fill();
  winkelFeld(ctx, p, q, t, r, F[1], '', 0, ws);
  winkelFeld(ctx, q, p, t, r, F[0], '', 0, ws);
  winkelFeld(ctx, t, p, q, r, F[2], '', 0, ws);
  ctx.strokeStyle = C.INK; ctx.lineWidth = 2.2 * ws * k; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.lineTo(t[0], t[1]); ctx.closePath(); ctx.stroke();
  var yz = p[1] + 13 * k;
  App.text(ctx, grad(p, q, t) + '°', p[0] + 6 * k, yz, F[1].linie, 14);
  App.text(ctx, grad(q, p, t) + '°', q[0] - 6 * k, yz, F[0].linie, 14);
  App.text(ctx, grad(t, p, q) + '°', t[0], t[1] - 13 * k, F[2].linie, 14);
}
// Spitze eines rechtwinkligen Dreiecks mit langer Seite L von p aus und Winkel al bei p; hf drückt die Höhe zusammen
function spitze(p, L, al, hf) {
  var ca = Math.cos(al * RAD), sa = Math.sin(al * RAD);
  return [p[0] + L * ca * ca, p[1] - L * ca * sa * (hf || 1)];
}

/* ---------- Teil 1 ---------- */
// Schritt 0: großes Dreieck und kleinere Kopie auf einer Grundlinie
function teil0(Z) {
  var P = App.winkel.platz(2), L1 = Math.min(S.w * 0.5, (S.w - 40 - 30 * S.k) / 1.6), L2 = L1 * 0.6;
  var x0 = (S.w - (L1 + 30 * S.k + L2)) / 2, y = P.my + L1 * 0.25;
  return [{ p: [x0, y], L: L1 }, { p: [x0 + L1 + 30 * S.k, y], L: L2 }];
}
// Schritt 1: oben das Dreieck, unten drei zur Wahl in Fächern
function teil1(Z) {
  var P = App.winkel.platz(1), k = S.k, gap = 24 * k, Lc = (S.w - 40 - 2 * gap) / 3, Lr = Math.min(S.w * 0.5, (P.h - Lc * 0.5 - 110 * k) / 0.5);
  // der ganze Block (oben das Dreieck, Abstand, unten die drei) steht senkrecht in der Mitte
  var hoch = 22 * k + Lr * 0.5 + 70 * k + Lc * 0.5 + 18 * k, y0 = P.oben + Math.max(0, (P.h - hoch) / 2);
  var yr = y0 + 22 * k + Lr * 0.5, yc = yr + 70 * k + Lc * 0.5;
  return { ref: { p: [(S.w - Lr) / 2, yr], L: Lr }, Lc: Lc, gap: gap, yc: yc };
}
// Die drei zur Wahl: 0 ähnlich (kleiner), 1 andere Winkel, 2 flachgedrückt
function wahl(Z, i, T) {
  var x = 20 + i * (T.Lc + T.gap), art = Z.ord[i], L = art === 0 ? T.Lc * 0.8 : T.Lc, p = [x + (T.Lc - L) / 2, T.yc];
  var al2 = Z.al <= 45 ? Z.al + 15 : Z.al - 15;
  return { p: p, L: L, t: art === 0 ? spitze(p, L, Z.al) : art === 1 ? spitze(p, L, al2) : spitze(p, L, Z.al, 0.55), art: art };
}

/* ---------- Teil 2 ---------- */
// Höchste Spitze der kleinen Dreiecke (in Teilen von R, ohne Verkleinerung): 2 cos²α sinα ist höchstens etwa 0,77
var KOPIE_H = 0.77;
// Maße: Mitte O von AB, halbe Länge R. Mit den einzelnen Dreiecken darunter wird alles kleiner.
function mass(Z) {
  // mit offenem Schreibfeld steht unten keine Zeile: das Bild reicht bis knapp über die Karte
  var H = App.winkel, P = H.platz(2), k = S.k, unten = H.feldOffen() ? H.feldOben() - 14 : Math.min(P.unten, H.textY(2) - 10);
  var getrennt = Z.s >= FERTIG, hf = getrennt ? 1 : Math.sin(2 * Z.al * RAD), oben = 26 * k;
  var h = Math.max(70, unten - P.oben), my = P.oben + h / 2, R = Math.max(40, Math.min(S.w * 0.45, (h - oben - 8) / hf));
  var gx = 26 * k, g = 34 * k, unter = 24 * k, s = 1, yb;
  function verkl(R) { return Math.min(1, (S.w - 40 - gx) / (2 * R * Math.SQRT2)); }
  if (getrennt) {
    s = verkl(R);
    while (R > 40 && R + g + KOPIE_H * s * R + unter > h) { R *= 0.96; s = verkl(R); }
    yb = my - (R + g + KOPIE_H * s * R + unter) / 2 + R;
  } else yb = my + (R * hf + oben) / 2;
  return { o: [S.w / 2, yb], R: R, s: s, g: g, gx: gx, yk: yb + g + KOPIE_H * s * R, f: Math.max(0.6, Math.min(1, R / 140)) };
}
// Ecken: A links, B rechts, C (Mittelpunktswinkel 2α von B aus), D Fußpunkt der Höhe
function ecken(Z) {
  var M = mass(Z), o = M.o, R = M.R, ph = 2 * Z.al * RAD;
  var c = [o[0] + R * Math.cos(ph), o[1] - R * Math.sin(ph)];
  return { M: M, a: [o[0] - R, o[1]], b: [o[0] + R, o[1]], c: c, d: [c[0], o[1]] };
}

// Schritte 2 bis 4: die drei Fragen nacheinander
function start(Z) {
  var H = App.winkel, z = zahlen(Z);
  if (Z.s === 2) H.frage(z.b, TEXT.h1, function () { Z.s = 3; start(Z); }, { text: TEXT.frageFeld });
  else if (Z.s === 3) H.frage(z.b, mit(TEXT.h2, z.a), function () { Z.s = 4; start(Z); }, { text: TEXT.frageFeld });
  else if (Z.s === 4) H.frage(z.a, mit(TEXT.h3, z.b), function () { Z.s = FERTIG; H.geschafft(); }, { text: TEXT.frageFeld });
}

App.level('winkel', {
  id: 'aehnliche-dreiecke',
  text: {
    de: { title: 'Ähnliche Dreiecke',
          task: 'Ähnliche Dreiecke haben dieselben Winkel. Tippe weiter, finde das ähnliche Dreieck und dann die Winkel mit dem Fragezeichen.',
          done: 'Beide kleinen Dreiecke haben dieselben Winkel wie das große: α, β und 90°. Sie haben dieselbe Form, nur kleiner. Man nennt sie ähnlich.' },
    en: { title: 'Similar triangles',
          task: 'Similar triangles have the same angles. Tap to go on, find the similar triangle, then the angles with the question mark.',
          done: 'Both small triangles have the same angles as the big one: α, β and 90°. They have the same shape, only smaller. They are called similar.' },
    fi: { title: 'Yhdenmuotoiset kolmiot',
          task: 'Yhdenmuotoisilla kolmioilla on samat kulmat. Napauta, etsi yhdenmuotoinen kolmio ja sitten kysymysmerkillä merkityt kulmat.',
          done: 'Molemmilla pienillä kolmioilla on samat kulmat kuin isolla: α, β ja 90°. Niillä on sama muoto, vain pienempänä. Niitä sanotaan yhdenmuotoisiksi.' },
    tr: { title: 'Benzer üçgenler',
          task: 'Benzer üçgenlerin açıları aynıdır. Dokun, benzer üçgeni bul, sonra soru işaretli açıları bul.',
          done: 'İki küçük üçgenin açıları da büyük üçgeninkilerle aynı: α, β ve 90°. Şekilleri aynı, sadece daha küçükler. Bunlara benzer üçgenler denir.' },
    fr: { title: 'Triangles semblables',
          task: 'Des triangles semblables ont les mêmes angles. Touche l’écran, trouve le triangle semblable, puis les angles avec le point d’interrogation.',
          done: 'Les deux petits triangles ont les mêmes angles que le grand : α, β et 90°. Ils ont la même forme, en plus petit. On dit qu’ils sont semblables.' },
    es: { title: 'Triángulos semejantes',
          task: 'Los triángulos semejantes tienen los mismos ángulos. Toca, encuentra el triángulo semejante y luego los ángulos con el signo de interrogación.',
          done: 'Los dos triángulos pequeños tienen los mismos ángulos que el grande: α, β y 90°. Tienen la misma forma, solo que más pequeños. Se llaman semejantes.' },
    ja: { title: '相似な三角形',
          task: '相似な三角形は角が同じ。タップして、相似な三角形を見つけ、そのあと?の角を求めよう。',
          done: '2つの小さい三角形は、大きい三角形と同じ角 α、β、90° をもっています。形が同じで、大きさだけがちがいます。これを相似といいます。' },
    ar: { title: 'مثلثات متشابهة',
          task: 'المثلثات المتشابهة لها الزوايا نفسها. انقر، وجد المثلث المشابه، ثم الزوايا التي عليها علامة الاستفهام.',
          done: 'للمثلثين الصغيرين الزوايا نفسها التي للمثلث الكبير: α وβ و90°. لهما الشكل نفسه لكنهما أصغر. نسميهما متشابهين.' }
  },
  werkzeuge: ['clear'],

  // α zufällig 30° bis 60° in Fünferschritten, nicht 45° (sonst sind beide kleinen Dreiecke gleich groß)
  neu: function (Z) {
    var w = [30, 35, 40, 50, 55, 60], o = [0, 1, 2];
    Z.s = 0; Z.al = w[Math.floor(Math.random() * w.length)];
    for (var i = 2; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = o[i]; o[i] = o[j]; o[j] = t; }
    Z.ord = o;
  },
  start: start,

  down: function (Z, w) {
    var H = App.winkel;
    if (Z.s === 0) { Z.s = 1; return; }
    if (Z.s !== 1) return;
    var T = teil1(Z);
    if (w[1] < T.yc - T.Lc * 0.6 - 24 * S.k || w[1] > T.yc + 34 * S.k) return;
    var i = Math.max(0, Math.min(2, Math.floor((w[0] - 20 + T.gap / 2) / (T.Lc + T.gap))));
    if (Z.ord[i] !== 0) { H.falsch(TEXT.falschWahl); return; }
    H.falschWeg(); Z.s = 2; start(Z);
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, F = H.farben, k = S.k, ink = C.INK;
    if (Z.s === 0) {
      teil0(Z).forEach(function (d) { dreieck(ctx, d.p, d.L, spitze(d.p, d.L, Z.al), ws); });
      return;
    }
    if (Z.s === 1) {
      var T = teil1(Z);
      dreieck(ctx, T.ref.p, T.ref.L, spitze(T.ref.p, T.ref.L, Z.al), ws);
      for (var i = 0; i < 3; i++) { var W = wahl(Z, i, T); dreieck(ctx, W.p, W.L, W.t, ws); }
      // Trennlinie zwischen oben und unten
      ctx.strokeStyle = 'rgba(115,115,122,0.35)'; ctx.lineWidth = 1 * k;
      var yl = T.ref.p[1] + 30 * k;
      ctx.beginPath(); ctx.moveTo(20, yl); ctx.lineTo(S.w - 20, yl); ctx.stroke();
      return;
    }
    var E = ecken(Z), M = E.M, a = E.a, b = E.b, c = E.c, d = E.d, s = Z.s;
    var z = zahlen(Z), fa = F[1], fb = F[0], fg = F[2], kf = k * M.f, r = 30 * kf;
    var frag = { linie: fb.linie, fuell: 'rgba(56,41,25,0.22)' };
    // das gerade gefragte kleine Dreieck leicht hervorheben
    if (s === 3 || s === 4) {
      var e = s === 3 ? a : b;
      ctx.fillStyle = 'rgba(56,41,25,0.07)';
      ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill();
    }
    // α bei A; β bei B (zuerst gefragt)
    winkelFeld(ctx, a, b, c, r, fa, z.a + '°', 16, ws, zahlAbst(z.a, kf));
    if (s === 2) winkelFeld(ctx, b, a, c, 36 * kf, frag, '?', 22, ws * 1.5, zahlAbst(z.b, kf) + 6 * kf);
    else winkelFeld(ctx, b, a, c, r, fb, z.b + '°', 16, ws, zahlAbst(z.b, kf));
    // 90° bei C: grau, Zahl oben über C; nach dem Teilen nur noch als Bogen außen um die beiden Teile
    var ua = [a[0] - c[0], a[1] - c[1]], ub = [b[0] - c[0], b[1] - c[1]], la = Math.hypot(ua[0], ua[1]), lb = Math.hypot(ub[0], ub[1]);
    var mc = [ua[0] / la + ub[0] / lb, ua[1] / la + ub[1] / lb], lm = Math.hypot(mc[0], mc[1]) || 1;
    if (s === 2) winkelFeld(ctx, c, a, b, r, fg, '', 0, ws);
    else {
      var wc = zwischen(H.richtung(c, a), H.richtung(c, b));
      ctx.beginPath(); ctx.arc(c[0], c[1], 58 * kf, -wc[0], -(wc[0] + wc[1]), true);
      ctx.strokeStyle = fg.linie; ctx.lineWidth = 1.6 * ws * k; ctx.stroke();
    }
    App.text(ctx, '90°', c[0] - mc[0] / lm * 17 * k, c[1] - mc[1] / lm * 17 * k, fg.linie, 16);
    if (s >= 3) {
      // Teile bei C: links so groß wie β (Frage bei Schritt 3), rechts so groß wie α (Frage bei Schritt 4)
      if (s === 3) winkelFeld(ctx, c, a, d, 36 * kf, frag, '?', 22, ws * 1.5, zahlAbst(z.b, kf) + 6 * kf);
      else winkelFeld(ctx, c, a, d, r, fb, z.b + '°', 16, ws, zahlAbst(z.b, kf));
      if (s === 4) winkelFeld(ctx, c, d, b, 36 * kf, { linie: fa.linie, fuell: 'rgba(166,112,58,0.38)' }, '?', 22, ws * 1.5, zahlAbst(z.a, kf) + 6 * kf);
      else if (s > 4) winkelFeld(ctx, c, d, b, r, fa, z.a + '°', 16, ws, zahlAbst(z.a, kf));
      // Höhe gestrichelt, am Fußpunkt auf beiden Seiten 90° (grau)
      var rd = Math.min(16 * kf, (d[1] - c[1]) * 0.3);
      [a, b].forEach(function (e) {
        var lx = d[0] + (e[0] < d[0] ? -1 : 1) * (rd + 12 * k);
        H.feld(ctx, d, rd, e[0] < d[0] ? Math.PI / 2 : 0, Math.PI / 2, fg.fuell, fg.linie, ws);
        App.text(ctx, '90°', lx, d[1] - rd - 8 * k, fg.linie, 13);
      });
      ctx.save();
      ctx.setLineDash([7 * k, 6 * k]); ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke();
      ctx.restore();
    }
    // das große Dreieck
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5 * ws * k; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = ink; App.dotAt(ctx, a, false); App.dotAt(ctx, b, false); App.dotAt(ctx, c, false);
    if (s < FERTIG) return;
    // die zwei kleinen Dreiecke einzeln darunter: links ADC (2R·cos α lang), rechts CDB (2R·sin α lang)
    var ca = Math.cos(Z.al * RAD), sa = Math.sin(Z.al * RAD), L1 = 2 * M.R * M.s * ca, L2 = 2 * M.R * M.s * sa;
    var x0 = (S.w - (L1 + M.gx + L2)) / 2, p1 = [x0, M.yk], p2 = [x0 + L1 + M.gx, M.yk];
    dreieck(ctx, p1, L1, spitze(p1, L1, Z.al), ws);
    dreieck(ctx, p2, L2, spitze(p2, L2, Z.al), ws);
  },

  // Unten: Teil 1 der Satz und "Tippe weiter" bzw. die Aufgabe zur Wahl; am Ende "Alle drei Dreiecke haben dieselben Winkel"
  overlay: function (ctx, Z) {
    var H = App.winkel;
    // Text mittig; zu lange Texte brechen an Leerzeichen um. Gibt die Zahl der Zeilen zurück.
    function zeile(text, y, farbe, groesse) {
      ctx.save();
      ctx.font = '400 ' + groesse + 'px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = farbe;
      var woerter = App.wahl(text).split(' '), z = [], akt = '';
      woerter.forEach(function (w) {
        var t = akt ? akt + ' ' + w : w;
        if (akt && ctx.measureText(t).width > S.w - 32) { z.push(akt); akt = w; } else akt = t;
      });
      z.push(akt);
      z.forEach(function (t, i) { ctx.fillText(t, S.w / 2, y + i * groesse * 1.35); });
      ctx.restore();
      return z.length;
    }
    if (Z.s === 0) {
      var y0 = H.textY(3), n = zeile(TEXT.aehnlich, y0, C.INK, 16);
      zeile(TEXT.weiter, y0 + n * 21.6 + 4, C.PENCIL, 14.5); return;
    }
    if (Z.s === 1) { zeile(TEXT.waehle, H.textY(2), C.PENCIL, 14); return; }
    if (Z.s < FERTIG) return;   // die Frage steht im Schreibfeld
    var gruen = document.getElementById('fertig'), y = H.textY(1);
    if (gruen && !gruen.hidden) y = Math.min(y, gruen.getBoundingClientRect().top - 18);
    zeile(TEXT.gleich, y, C.INK, 16);
  },

  bild: function (Z) { return Z.s ? { v: 2, s: Z.s, al: Z.al, ord: Z.ord } : null; },
  ausBild: function (Z, b) {
    if (b.v === 1) { if (b.ok && b.getrennt) Z.s = FERTIG; Z.al = Math.max(30, Math.min(60, b.al)); return; }   // alter Ablauf: fertig bleibt fertig
    if (b.v !== 2) return;
    Z.s = Math.max(0, Math.min(FERTIG, b.s | 0)); Z.al = Math.max(20, Math.min(70, b.al));
    if (Array.isArray(b.ord) && b.ord.length === 3) Z.ord = b.ord.slice();
  }
});
})();
