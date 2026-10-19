// Level: Satz des Thales, ohne Zahlen bewiesen. Halbkreis über AB (Mitte O), C auf dem Halbkreis, Dreieck ABC mit α bei A
// (braun) und β bei B (Tinte). Antippen zieht den Radius OC; OA, OB, OC heißen r. Dann tippt man an, welcher Teil des
// Winkels bei C so groß ist wie α (Dreieck AOC hat zwei Radien), danach den Teil, der so groß ist wie β. Antippen zeigt
// unten "α + β + (α + β) = 180°", noch einmal Antippen "α + β = 90°" und 90° über C. Dann zieht man C am Griff auf dem
// Halbkreis (α 20° bis 70°): es bleibt so. Gelöst nach insgesamt 30° Änderung von α.
// Zustand: Z.s Schritt (0 bis 5), Z.al α in Grad (nur für die Zeichnung), Z.dreh wie weit schon gezogen.
(function () {
var App = window.App, S = App.S, C = App.C;
var AENDERUNG_NOETIG = 30, AL_MIN = 20, AL_MAX = 70, RAD = Math.PI / 180, FERTIG = 5;

var TEXT = {
  radius: { de: 'Tippe, um den Radius zu C zu zeichnen', en: 'Tap to draw the radius to C', fi: 'Napauta, niin säde C:hen piirtyy',
            tr: 'C’ye yarıçapı çizmek için dokun', fr: 'Touche l’écran pour tracer le rayon jusqu’à C', es: 'Toca para dibujar el radio hasta C',
            ja: 'タップするとCまでの半径をかくよ', ar: 'انقر لرسم نصف القطر إلى C' },
  ziehen: { de: 'Zieh C am Griff', en: 'Drag C by the handle', fi: 'Vedä C:tä kahvasta', tr: 'C’yi tutamaçtan sürükle',
            fr: 'Fais glisser C par la poignée', es: 'Arrastra C por el asa', ja: 'Cの取っ手を動かそう', ar: 'اسحب C من المقبض' },
  tippA: { de: 'Welcher Winkel bei C ist so groß wie α? Tippe ihn an.', en: 'Which angle at C is as big as α? Tap it.',
           fi: 'Mikä kulma C:ssä on yhtä suuri kuin α? Napauta sitä.', tr: 'C’deki hangi açı α kadar büyük? Ona dokun.',
           fr: 'Quel angle en C est aussi grand que α ? Touche-le.', es: '¿Qué ángulo en C mide lo mismo que α? Tócalo.',
           ja: 'Cのどちらの角がαと同じ大きさかな？タップしよう。', ar: 'أي زاوية عند C تساوي α؟ انقر عليها.' },
  tippB: { de: 'Welcher Winkel bei C ist so groß wie β? Tippe ihn an.', en: 'Which angle at C is as big as β? Tap it.',
           fi: 'Mikä kulma C:ssä on yhtä suuri kuin β? Napauta sitä.', tr: 'C’deki hangi açı β kadar büyük? Ona dokun.',
           fr: 'Quel angle en C est aussi grand que β ? Touche-le.', es: '¿Qué ángulo en C mide lo mismo que β? Tócalo.',
           ja: 'Cのどちらの角がβと同じ大きさかな？タップしよう。', ar: 'أي زاوية عند C تساوي β؟ انقر عليها.' },
  falschA: { de: 'Noch nicht. Schau auf das Dreieck AOC: OA und OC sind gleich lang (Radien), darum sind die Winkel bei A und C gleich.',
             en: 'Not yet. Look at triangle AOC: OA and OC are the same length (radii), so the angles at A and C are equal.',
             fi: 'Ei vielä. Katso kolmiota AOC: OA ja OC ovat yhtä pitkät (säteitä), joten kulmat A:ssa ja C:ssä ovat yhtä suuret.',
             tr: 'Henüz değil. AOC üçgenine bak: OA ile OC aynı uzunlukta (yarıçap), bu yüzden A ve C’deki açılar eşit.',
             fr: 'Pas encore. Regarde le triangle AOC : OA et OC ont la même longueur (rayons), donc les angles en A et en C sont égaux.',
             es: 'Todavía no. Mira el triángulo AOC: OA y OC miden lo mismo (radios), así que los ángulos en A y en C son iguales.',
             ja: 'まだです。三角形AOCを見よう：OAとOCは同じ長さ（半径）なので、AとCの角は同じ大きさ。',
             ar: 'ليس بعد. انظر إلى المثلث AOC: OA وOC لهما الطول نفسه (نصفا قطر)، لذلك الزاويتان عند A وC متساويتان.' },
  falschB: { de: 'Noch nicht. Schau auf das Dreieck BOC: OB und OC sind gleich lang (Radien), darum sind die Winkel bei B und C gleich.',
             en: 'Not yet. Look at triangle BOC: OB and OC are the same length (radii), so the angles at B and C are equal.',
             fi: 'Ei vielä. Katso kolmiota BOC: OB ja OC ovat yhtä pitkät (säteitä), joten kulmat B:ssä ja C:ssä ovat yhtä suuret.',
             tr: 'Henüz değil. BOC üçgenine bak: OB ile OC aynı uzunlukta (yarıçap), bu yüzden B ve C’deki açılar eşit.',
             fr: 'Pas encore. Regarde le triangle BOC : OB et OC ont la même longueur (rayons), donc les angles en B et en C sont égaux.',
             es: 'Todavía no. Mira el triángulo BOC: OB y OC miden lo mismo (radios), así que los ángulos en B y en C son iguales.',
             ja: 'まだです。三角形BOCを見よう：OBとOCは同じ長さ（半径）なので、BとCの角は同じ大きさ。',
             ar: 'ليس بعد. انظر إلى المثلث BOC: OB وOC لهما الطول نفسه (نصفا قطر)، لذلك الزاويتان عند B وC متساويتان.' },
  weiter: { de: 'Tippe weiter', en: 'Tap to go on', fi: 'Napauta jatkaaksesi', tr: 'Devam etmek için dokun',
            fr: 'Touche l’écran pour continuer', es: 'Toca para seguir', ja: 'タップして続けよう', ar: 'انقر للمتابعة' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Kleinerer Winkel zwischen zwei Richtungen: Anfang und Weite (mathematisch, gegen den Uhrzeigersinn)
function zwischen(d1, d2) {
  var T = App.winkel.TAU, sw = ((d2 - d1) % T + T) % T;
  return sw <= Math.PI ? [d1, sw] : [d2, T - sw];
}
// Maße: Mitte O von AB, Radius R. Oben Platz für C und 90°, unten für die Buchstaben A, O, B und drei Textzeilen.
function mass() {
  var H = App.winkel, P = H.platz(3), k = S.k, oben = 46 * k, unter = 22 * k;
  var ende = Math.min(P.unten, H.textY(3) - 10), h = Math.max(80, ende - P.oben);
  var R = Math.max(50, Math.min(S.w * 0.44, h - oben - unter));
  var y0 = P.oben + Math.max(0, (h - oben - R - unter) / 2);
  return { o: [S.w / 2, y0 + oben + R], R: R, f: Math.max(0.65, Math.min(1, R / 140)) };
}
// A links, B rechts, C auf dem Halbkreis (Mittelpunktswinkel 2α von B aus)
function ecken(Z) {
  var M = mass(), o = M.o, R = M.R, ph = 2 * Z.al * RAD;
  return { M: M, o: o, a: [o[0] - R, o[1]], b: [o[0] + R, o[1]], c: [o[0] + R * Math.cos(ph), o[1] - R * Math.sin(ph)] };
}
// Winkelfeld an p zwischen den Richtungen zu q1 und q2, mit Zahl (oder ?) auf der Winkelhalbierenden
function winkelFeld(ctx, p, q1, q2, r, f, txt, groesse, ws, ra) {
  var H = App.winkel, w = zwischen(H.richtung(p, q1), H.richtung(p, q2)), mid = w[0] + w[1] / 2;
  H.feld(ctx, p, r, w[0], w[1], f.fuell, f.linie, ws);
  if (txt) App.text(ctx, txt, p[0] + Math.cos(mid) * ra, p[1] - Math.sin(mid) * ra, f.linie, groesse);
}

// Angetippter Teil des Winkels bei C: 'a' (Seite von A) oder 'b' (Seite von B), null wenn zu weit weg von C
function teil(Z, w) {
  var E = ecken(Z), o = E.o, c = E.c;
  if (abst(w, c) > E.M.R * 0.55) return null;
  function seite(p) { return (c[0] - o[0]) * (p[1] - o[1]) - (c[1] - o[1]) * (p[0] - o[0]); }
  return (seite(w) > 0) === (seite(E.a) > 0) ? 'a' : 'b';
}
function ziehen(Z, w) {
  var o = mass().o, dx = w[0] - o[0], dy = Math.max(0, o[1] - w[1]);   // unter AB zählt wie auf AB
  if (Math.hypot(dx, dy) < 10 * S.k) return;
  var al = Math.max(AL_MIN, Math.min(AL_MAX, Math.atan2(dy, dx) / RAD / 2));
  Z.dreh += Math.abs(al - Z.al);
  Z.al = al;
  if (Z.dreh >= AENDERUNG_NOETIG) App.winkel.geschafft();
}

App.level('winkel', {
  id: 'thales',
  text: {
    de: { title: 'Satz des Thales',
          task: 'C liegt auf dem Halbkreis über AB. Zeig ohne Zahlen, dass der Winkel bei C immer 90° ist: Tippe Schritt für Schritt. Zum Schluss zieh C am Griff.',
          done: 'Satz des Thales: Liegt C auf dem Halbkreis über AB, ist der Winkel bei C immer 90°. Die Radien teilen das Dreieck in zwei Dreiecke mit je zwei gleichen Winkeln, darum gilt α + β + (α + β) = 180°.' },
    en: { title: 'Thales’s theorem',
          task: 'C lies on the half circle over AB. Show without numbers that the angle at C is always 90°: tap step by step. At the end, drag C by the handle.',
          done: 'Thales’s theorem: if C lies on the half circle over AB, the angle at C is always 90°. The radii split the triangle into two triangles that each have two equal angles, so α + β + (α + β) = 180°.' },
    fi: { title: 'Thaleen lause',
          task: 'C on puoliympyrän kaarella janan AB yläpuolella. Näytä ilman lukuja, että kulma C:ssä on aina 90°: napauta vaihe vaiheelta. Lopuksi vedä C:tä kahvasta.',
          done: 'Thaleen lause: jos C on puoliympyrän kaarella janan AB yläpuolella, kulma C:ssä on aina 90°. Säteet jakavat kolmion kahdeksi kolmioksi, joissa kummassakin on kaksi yhtä suurta kulmaa, joten α + β + (α + β) = 180°.' },
    tr: { title: 'Thales teoremi',
          task: 'C, AB üzerindeki yarım çemberin üstünde. C’deki açının her zaman 90° olduğunu sayı kullanmadan göster: adım adım dokun. En sonunda C’yi tutamaçtan sürükle.',
          done: 'Thales teoremi: C, AB üzerindeki yarım çemberin üstündeyse C’deki açı her zaman 90°’dir. Yarıçaplar üçgeni, her birinde iki eşit açı olan iki üçgene böler; bu yüzden α + β + (α + β) = 180°.' },
    fr: { title: 'Le cercle de Thalès',
          task: 'C est sur le demi-cercle au-dessus de AB. Montre sans nombres que l’angle en C mesure toujours 90° : touche l’écran étape par étape. À la fin, fais glisser C par la poignée.',
          done: 'Cercle de Thalès : si C est sur le demi-cercle au-dessus de AB, l’angle en C mesure toujours 90°. Les rayons partagent le triangle en deux triangles qui ont chacun deux angles égaux, donc α + β + (α + β) = 180°.' },
    es: { title: 'Teorema de Tales',
          task: 'C está en la semicircunferencia sobre AB. Demuestra sin números que el ángulo en C siempre mide 90°: toca paso a paso. Al final, arrastra C por el asa.',
          done: 'Teorema de Tales: si C está en la semicircunferencia sobre AB, el ángulo en C siempre mide 90°. Los radios dividen el triángulo en dos triángulos con dos ángulos iguales cada uno, así que α + β + (α + β) = 180°.' },
    ja: { title: 'タレスの定理',
          task: 'CはABの上の半円の上にあります。Cの角がいつも90°になることを、数を使わずに示そう：1歩ずつタップしよう。最後にCの取っ手を動かしてみよう。',
          done: 'タレスの定理：CがABの上の半円の上にあれば、Cの角はいつも90°。半径で三角形が2つに分かれ、どちらも2つの角が同じ大きさなので、α + β + (α + β) = 180°。' },
    ar: { title: 'مبرهنة طاليس',
          task: 'تقع C على نصف الدائرة فوق AB. بيّن دون أعداد أن الزاوية عند C دائمًا 90°: انقر خطوة خطوة. في النهاية اسحب C من المقبض.',
          done: 'مبرهنة طاليس: إذا وقعت C على نصف الدائرة فوق AB فالزاوية عند C دائمًا 90°. تقسم أنصاف الأقطار المثلث إلى مثلثين لكل منهما زاويتان متساويتان، لذلك α + β + (α + β) = 180°.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) {
    var wahl = [30, 35, 40, 50, 55, 60];
    Z.s = 0; Z.dreh = 0; Z.zieht = false;
    Z.al = wahl[Math.floor(Math.random() * wahl.length)];
  },

  // Antippen: Radius OC, dann die Fragen; am Ende nur noch der Griff an C
  down: function (Z, w) {
    var H = App.winkel;
    if (Z.s === 0 || Z.s === 3 || Z.s === 4) { Z.s++; return; }   // Radius, dann die zwei Gleichungen
    if (Z.s === 1 || Z.s === 2) {
      var t = teil(Z, w), soll = Z.s === 1 ? 'a' : 'b';
      if (!t) return;
      if (t !== soll) { H.falsch(Z.s === 1 ? TEXT.falschA : TEXT.falschB); return; }
      H.falschWeg(); Z.s++; return;
    }
    Z.zieht = abst(w, ecken(Z).c) <= C.GRAB * 1.3 * S.k;
    if (Z.zieht) ziehen(Z, w);
  },
  move: function (Z, w) { if (Z.zieht) ziehen(Z, w); },
  up: function (Z) { Z.zieht = false; },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, F = H.farben, k = S.k, ink = C.INK, E = ecken(Z), M = E.M, o = E.o, a = E.a, b = E.b, c = E.c;
    var fa = F[1], fb = F[0], fg = F[2], kf = k * M.f, r = 30 * kf, s = Z.s;
    // Halbkreis über AB, dünn gestrichelt
    ctx.save();
    ctx.setLineDash([4 * k, 6 * k]); ctx.strokeStyle = 'rgba(115,115,122,0.6)'; ctx.lineWidth = 1.3 * ws * k;
    ctx.beginPath(); ctx.arc(o[0], o[1], M.R, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.restore();
    // α bei A und β bei B, immer, mit Buchstaben
    winkelFeld(ctx, a, b, c, r, fa, 'α', 18, ws, 46 * kf);
    winkelFeld(ctx, b, a, c, r, fb, 'β', 18, ws, 46 * kf);
    // die zwei Teile bei C: zur Wahl mit ?, gefunden mit α bzw. β
    if (s >= 1) {
      var fr = function (f) { return { linie: f.linie, fuell: 'rgba(115,115,122,0.12)' }; };
      winkelFeld(ctx, c, a, o, s === 1 ? 34 * kf : r, s === 1 ? fr(fg) : fa, s === 1 ? '?' : 'α', s === 1 ? 20 : 18, ws, 50 * kf);
      winkelFeld(ctx, c, o, b, s <= 2 ? 34 * kf : r, s <= 2 ? fr(fg) : fb, s <= 2 ? '?' : 'β', s <= 2 ? 20 : 18, ws, 50 * kf);
    }
    // am Ende der ganze Winkel bei C: grauer Bogen außen um beide Teile, 90° oben über C
    var ua = [a[0] - c[0], a[1] - c[1]], ub = [b[0] - c[0], b[1] - c[1]], la = Math.hypot(ua[0], ua[1]), lb = Math.hypot(ub[0], ub[1]);
    var mc = [ua[0] / la + ub[0] / lb, ua[1] / la + ub[1] / lb], lm = Math.hypot(mc[0], mc[1]) || 1;
    if (s >= FERTIG) {
      var wc = zwischen(H.richtung(c, a), H.richtung(c, b));
      ctx.beginPath(); ctx.arc(c[0], c[1], 66 * kf, -wc[0], -(wc[0] + wc[1]), true);
      ctx.strokeStyle = fg.linie; ctx.lineWidth = 1.6 * ws * k; ctx.stroke();
      var l9 = (s >= FERTIG ? 36 : 22) * k;
      App.text(ctx, '90°', c[0] - mc[0] / lm * l9, c[1] - mc[1] / lm * l9, fg.linie, 16);
    }
    // Radien in Grau mit r, sobald OC da ist
    if (s >= 1) {
      ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
      [[o, a], [o, b], [o, c]].forEach(function (st) {
        var m = [(st[0][0] + st[1][0]) / 2, (st[0][1] + st[1][1]) / 2], dx = st[1][0] - st[0][0], dy = st[1][1] - st[0][1], l = Math.hypot(dx, dy) || 1;
        var nx = -dy / l, ny = dx / l;
        if (ny > 0 || (Math.abs(ny) < 0.01 && nx < 0)) { nx = -nx; ny = -ny; }   // Beschriftung oberhalb bzw. links der Linie
        if (st[1] !== c) { nx = 0; ny = 1; }   // auf AB: unter der Linie
        App.text(ctx, 'r', m[0] + nx * 12 * k, m[1] + ny * 12 * k, fg.linie, 15);
      });
    }
    // Dreieck ABC
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5 * ws * k; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = ink; [a, b, c, o].forEach(function (p) { App.dotAt(ctx, p, false); });
    // Buchstaben: A, O, B unter der Linie, C außen neben C
    App.text(ctx, 'A', a[0], a[1] + 16 * k, ink, 15);
    App.text(ctx, 'B', b[0], b[1] + 16 * k, ink, 15);
    App.text(ctx, 'O', o[0], o[1] + 16 * k, ink, 15);
    var oc = [c[0] - o[0], c[1] - o[1]], loc = Math.hypot(oc[0], oc[1]) || 1, seit = c[0] < o[0] ? -1 : 1;
    App.text(ctx, 'C', c[0] + oc[0] / loc * 8 * k + seit * 26 * k, c[1] + oc[1] / loc * 8 * k - 6 * k, ink, 15);
    // Griff an C
    if (s >= FERTIG) {
      ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k;
      ctx.beginPath(); ctx.arc(c[0], c[1], 15 * k, 0, H.TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
    }
  },

  // Unten: Hinweis bzw. Aufgabe zum Antippen; dann "α + β + (α + β) = 180°" und "α + β = 90°"
  overlay: function (ctx, Z) {
    var H = App.winkel, F = H.farben, s = Z.s, A = { t: 'α', c: F[1].linie }, B = { t: 'β', c: F[0].linie }, plus = { t: ' + ', c: C.INK };
    function hinweis(text, y) {
      ctx.save();
      ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
      ctx.fillText(App.wahl(text), S.w / 2, y);
      ctx.restore();
    }
    if (s < 3) { hinweis(s === 0 ? TEXT.radius : s === 1 ? TEXT.tippA : TEXT.tippB, H.textY(1)); return; }
    var gruen = document.getElementById('fertig'), geloest = !!(gruen && !gruen.hidden), y = H.textY(3);
    if (geloest) y = Math.min(H.textY(2), gruen.getBoundingClientRect().top - 18 - 26);
    H.zeile(ctx, [A, plus, B, plus, { t: '(', c: C.INK }, A, plus, B, { t: ') = 180°', c: C.INK }], y);
    if (s >= FERTIG) H.zeile(ctx, [A, plus, B, { t: ' = 90°', c: C.INK }], y + 26);
    if (!geloest) hinweis(s >= FERTIG ? TEXT.ziehen : TEXT.weiter, s >= FERTIG ? y + 52 : y + 26);
  },

  bild: function (Z) { return Z.s ? { v: 2, s: Z.s, al: Z.al, dreh: Z.dreh } : null; },
  ausBild: function (Z, b) {
    if (b.v !== 1 && b.v !== 2) return;
    // v1 war der Beweis mit Zahlen: fertig bleibt fertig, sonst von vorn
    Z.s = b.v === 2 ? Math.max(0, Math.min(FERTIG, b.s | 0)) : ((b.s | 0) >= 4 ? FERTIG : 0); Z.al = Math.max(AL_MIN, Math.min(AL_MAX, b.al || 40)); Z.dreh = b.dreh || 0;
  }
});
})();
