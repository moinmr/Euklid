// Level: Satz des Thales, Schritt für Schritt bewiesen. Halbkreis über AB (Mitte O), C auf dem Halbkreis, Dreieck ABC.
// Gegeben ist nur α bei A (braun, zufällig 30° bis 60° in Fünferschritten, nicht 45°). Antippen zieht den Radius OC;
// OA, OB, OC sind mit r beschriftet. Dann fragt das Schreibfeld:
// 1. den Winkel bei C im Dreieck AOC (zwei Radien, also so groß wie α),
// 2. die zwei gleichen Winkel bei B und bei C im Dreieck BOC (180° − 2α, geteilt durch 2 = 90° − α),
// 3. den ganzen Winkel bei C (90°).
// Danach unten "35° + 55° + (35° + 55°) = 180°", und man zieht C am Griff auf dem Halbkreis (α 20° bis 70°): der Winkel
// bei C bleibt 90°. Gelöst nach insgesamt 30° Änderung von α.
// Zustand: Z.s Schritt (0 bis 4), Z.al α in Grad (Kommazahl beim Ziehen), Z.dreh wie weit schon gezogen.
(function () {
var App = window.App, S = App.S, C = App.C;
var AENDERUNG_NOETIG = 30, AL_MIN = 20, AL_MAX = 70, RAD = Math.PI / 180, FERTIG = 4;

var TEXT = {
  radius: { de: 'Tippe, um den Radius zu C zu zeichnen', en: 'Tap to draw the radius to C', fi: 'Napauta, niin säde C:hen piirtyy',
            tr: 'C’ye yarıçapı çizmek için dokun', fr: 'Touche l’écran pour tracer le rayon jusqu’à C', es: 'Toca para dibujar el radio hasta C',
            ja: 'タップするとCまでの半径をかくよ', ar: 'انقر لرسم نصف القطر إلى C' },
  ziehen: { de: 'Zieh C am Griff', en: 'Drag C by the handle', fi: 'Vedä C:tä kahvasta', tr: 'C’yi tutamaçtan sürükle',
            fr: 'Fais glisser C par la poignée', es: 'Arrastra C por el asa', ja: 'Cの取っ手を動かそう', ar: 'اسحب C من المقبض' },
  q1: { de: 'OA und OC sind gleich lang (beides Radien). Wie groß ist der Winkel mit dem Fragezeichen?',
        en: 'OA and OC are the same length (both are radii). How big is the angle with the question mark?',
        fi: 'OA ja OC ovat yhtä pitkät (molemmat säteitä). Kuinka suuri on kysymysmerkillä merkitty kulma?',
        tr: 'OA ile OC aynı uzunlukta (ikisi de yarıçap). Soru işaretli açı kaç derece?',
        fr: 'OA et OC ont la même longueur (ce sont deux rayons). Combien mesure l’angle avec le point d’interrogation ?',
        es: 'OA y OC miden lo mismo (los dos son radios). ¿Cuánto mide el ángulo con el signo de interrogación?',
        ja: 'OAとOCは同じ長さ（どちらも半径）。?の角は何度かな？',
        ar: 'OA وOC لهما الطول نفسه (كلاهما نصف قطر). كم قياس الزاوية التي عليها علامة الاستفهام؟' },
  q2: { de: 'Die beiden Winkel mit Fragezeichen sind gleich groß (OB und OC sind Radien). Wie groß ist einer?',
        en: 'The two angles with a question mark are equal (OB and OC are radii). How big is one of them?',
        fi: 'Kysymysmerkillä merkityt kaksi kulmaa ovat yhtä suuret (OB ja OC ovat säteitä). Kuinka suuri on yksi niistä?',
        tr: 'Soru işaretli iki açı eşit (OB ve OC yarıçap). Biri kaç derece?',
        fr: 'Les deux angles avec un point d’interrogation sont égaux (OB et OC sont des rayons). Combien mesure l’un d’eux ?',
        es: 'Los dos ángulos con signo de interrogación son iguales (OB y OC son radios). ¿Cuánto mide uno?',
        ja: '?の2つの角は同じ大きさ（OBとOCは半径）。1つは何度かな？',
        ar: 'الزاويتان اللتان عليهما علامة الاستفهام متساويتان (OB وOC نصفا قطر). كم قياس إحداهما؟' },
  q3: { de: 'Wie groß ist der ganze Winkel bei C?', en: 'How big is the whole angle at C?', fi: 'Kuinka suuri on koko kulma C:ssä?',
        tr: 'C’deki açının tamamı kaç derece?', fr: 'Combien mesure l’angle entier en C ?', es: '¿Cuánto mide el ángulo entero en C?',
        ja: 'Cの角ぜんぶで何度かな？', ar: 'كم قياس الزاوية كلها عند C؟' },
  f1: { de: 'Noch nicht. Ein Dreieck mit zwei gleich langen Seiten hat zwei gleich große Winkel. Schau auf den Winkel bei A.',
        en: 'Not yet. A triangle with two sides of the same length has two equal angles. Look at the angle at A.',
        fi: 'Ei vielä. Kolmiossa, jossa on kaksi yhtä pitkää sivua, on kaksi yhtä suurta kulmaa. Katso kulmaa A:ssa.',
        tr: 'Henüz değil. İki kenarı eşit olan üçgenin iki açısı da eşittir. A’daki açıya bak.',
        fr: 'Pas encore. Un triangle qui a deux côtés de même longueur a deux angles égaux. Regarde l’angle en A.',
        es: 'Todavía no. Un triángulo con dos lados iguales tiene dos ángulos iguales. Mira el ángulo en A.',
        ja: 'まだです。2つの辺が同じ長さの三角形は、2つの角も同じ大きさ。Aの角を見てみよう。',
        ar: 'ليس بعد. المثلث الذي له ضلعان متساويان له زاويتان متساويتان. انظر إلى الزاوية عند A.' },
  f2: { de: 'Noch nicht. Im großen Dreieck ABC sind alle Winkel zusammen 180°. Nimm die zwei bekannten weg und teile den Rest auf die zwei gleichen Winkel auf.',
        en: 'Not yet. In the big triangle ABC all the angles make 180° together. Take away the two you know and share the rest between the two equal angles.',
        fi: 'Ei vielä. Ison kolmion ABC kulmat ovat yhteensä 180°. Vähennä kaksi tunnettua ja jaa loput kahdelle yhtä suurelle kulmalle.',
        tr: 'Henüz değil. Büyük ABC üçgeninin açıları toplamı 180°. Bildiğin ikisini çıkar, kalanı iki eşit açıya paylaştır.',
        fr: 'Pas encore. Dans le grand triangle ABC, tous les angles font 180° ensemble. Enlève les deux que tu connais et partage le reste entre les deux angles égaux.',
        es: 'Todavía no. En el triángulo grande ABC todos los ángulos suman 180°. Quita los dos que conoces y reparte el resto entre los dos ángulos iguales.',
        ja: 'まだです。大きな三角形ABCの角は合わせて180°。わかっている2つをひいて、残りを同じ大きさの2つの角に分けよう。',
        ar: 'ليس بعد. في المثلث الكبير ABC مجموع كل الزوايا 180°. اطرح الزاويتين المعروفتين ووزّع الباقي على الزاويتين المتساويتين.' },
  f3: { de: 'Noch nicht. Der ganze Winkel bei C besteht aus den zwei Teilen.', en: 'Not yet. The whole angle at C is made of the two parts.',
        fi: 'Ei vielä. Koko kulma C:ssä koostuu kahdesta osasta.', tr: 'Henüz değil. C’deki açının tamamı iki parçadan oluşur.',
        fr: 'Pas encore. L’angle entier en C est fait des deux parties.', es: 'Todavía no. El ángulo entero en C está formado por las dos partes.',
        ja: 'まだです。Cの角ぜんぶは、2つの部分を合わせたものだよ。', ar: 'ليس بعد. الزاوية كلها عند C مكوّنة من الجزأين.' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Kleinerer Winkel zwischen zwei Richtungen: Anfang und Weite (mathematisch, gegen den Uhrzeigersinn)
function zwischen(d1, d2) {
  var T = App.winkel.TAU, sw = ((d2 - d1) % T + T) % T;
  return sw <= Math.PI ? [d1, sw] : [d2, T - sw];
}
// Maße: Mitte O von AB, Radius R. Oben Platz für C und 90°, unten für die Buchstaben A, O, B.
// Mit offenem Schreibfeld reicht das Bild bis knapp über die Karte.
function mass() {
  var H = App.winkel, P = H.platz(2), k = S.k, oben = 46 * k, unter = 22 * k;
  var ende = H.feldOffen() ? H.feldOben() - 14 : Math.min(P.unten, H.textY(2) - 10), h = Math.max(80, ende - P.oben);
  var R = Math.max(50, Math.min(S.w * 0.44, h - oben - unter));
  var y0 = P.oben + Math.max(0, (h - oben - R - unter) / 2);
  return { o: [S.w / 2, y0 + oben + R], R: R, f: Math.max(0.65, Math.min(1, R / 140)) };
}
// A links, B rechts, C auf dem Halbkreis (Mittelpunktswinkel 2α von B aus)
function ecken(Z) {
  var M = mass(), o = M.o, R = M.R, ph = 2 * Z.al * RAD;
  return { M: M, o: o, a: [o[0] - R, o[1]], b: [o[0] + R, o[1]], c: [o[0] + R * Math.cos(ph), o[1] - R * Math.sin(ph)] };
}
function zahlen(Z) { var a = Math.round(Z.al); return { a: a, b: 90 - a }; }
// Abstand der Zahl von der Ecke: bei spitzen Winkeln weiter weg, damit sie zwischen die Seiten passt
function zahlAbst(grad, k) { return (44 + Math.max(0, 45 - grad) * 0.9) * k; }
// Winkelfeld an p zwischen den Richtungen zu q1 und q2, mit Zahl (oder ?) auf der Winkelhalbierenden
function winkelFeld(ctx, p, q1, q2, r, f, txt, groesse, ws, ra) {
  var H = App.winkel, w = zwischen(H.richtung(p, q1), H.richtung(p, q2)), mid = w[0] + w[1] / 2;
  H.feld(ctx, p, r, w[0], w[1], f.fuell, f.linie, ws);
  if (txt) App.text(ctx, txt, p[0] + Math.cos(mid) * ra, p[1] - Math.sin(mid) * ra, f.linie, groesse);
}

function start(Z) {
  var H = App.winkel, z = zahlen(Z);
  function weiter() { Z.s++; start(Z); }
  if (Z.s === 1) H.frage(z.a, TEXT.f1, weiter, { text: TEXT.q1 });
  else if (Z.s === 2) H.frage(z.b, TEXT.f2, weiter, { text: TEXT.q2 });
  else if (Z.s === 3) H.frage(90, TEXT.f3, weiter, { text: TEXT.q3 });
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
          task: 'C liegt auf dem Halbkreis über AB. Zeig, dass der Winkel bei C immer 90° ist: Tippe, dann schreib die Zahlen ins Feld. Zum Schluss zieh C am Griff.',
          done: 'Satz des Thales: Liegt C auf dem Halbkreis über AB, ist der Winkel bei C immer 90°. Die Radien teilen das Dreieck in zwei Dreiecke mit je zwei gleichen Winkeln, darum gilt α + β + (α + β) = 180°.' },
    en: { title: 'Thales’s theorem',
          task: 'C lies on the half circle over AB. Show that the angle at C is always 90°: tap, then write the numbers in the box. At the end, drag C by the handle.',
          done: 'Thales’s theorem: if C lies on the half circle over AB, the angle at C is always 90°. The radii split the triangle into two triangles that each have two equal angles, so α + β + (α + β) = 180°.' },
    fi: { title: 'Thaleen lause',
          task: 'C on puoliympyrän kaarella janan AB yläpuolella. Näytä, että kulma C:ssä on aina 90°: napauta ja kirjoita luvut kenttään. Lopuksi vedä C:tä kahvasta.',
          done: 'Thaleen lause: jos C on puoliympyrän kaarella janan AB yläpuolella, kulma C:ssä on aina 90°. Säteet jakavat kolmion kahdeksi kolmioksi, joissa kummassakin on kaksi yhtä suurta kulmaa, joten α + β + (α + β) = 180°.' },
    tr: { title: 'Thales teoremi',
          task: 'C, AB üzerindeki yarım çemberin üstünde. C’deki açının her zaman 90° olduğunu göster: dokun, sonra sayıları kutuya yaz. En sonunda C’yi tutamaçtan sürükle.',
          done: 'Thales teoremi: C, AB üzerindeki yarım çemberin üstündeyse C’deki açı her zaman 90°’dir. Yarıçaplar üçgeni, her birinde iki eşit açı olan iki üçgene böler; bu yüzden α + β + (α + β) = 180°.' },
    fr: { title: 'Le cercle de Thalès',
          task: 'C est sur le demi-cercle au-dessus de AB. Montre que l’angle en C mesure toujours 90° : touche l’écran, puis écris les nombres dans la case. À la fin, fais glisser C par la poignée.',
          done: 'Cercle de Thalès : si C est sur le demi-cercle au-dessus de AB, l’angle en C mesure toujours 90°. Les rayons partagent le triangle en deux triangles qui ont chacun deux angles égaux, donc α + β + (α + β) = 180°.' },
    es: { title: 'Teorema de Tales',
          task: 'C está en la semicircunferencia sobre AB. Demuestra que el ángulo en C siempre mide 90°: toca y escribe los números en la casilla. Al final, arrastra C por el asa.',
          done: 'Teorema de Tales: si C está en la semicircunferencia sobre AB, el ángulo en C siempre mide 90°. Los radios dividen el triángulo en dos triángulos con dos ángulos iguales cada uno, así que α + β + (α + β) = 180°.' },
    ja: { title: 'タレスの定理',
          task: 'CはABの上の半円の上にあります。Cの角がいつも90°になることを示そう：タップして、数を書こう。最後にCの取っ手を動かしてみよう。',
          done: 'タレスの定理：CがABの上の半円の上にあれば、Cの角はいつも90°。半径で三角形が2つに分かれ、どちらも2つの角が同じ大きさなので、α + β + (α + β) = 180°。' },
    ar: { title: 'مبرهنة طاليس',
          task: 'تقع C على نصف الدائرة فوق AB. بيّن أن الزاوية عند C دائمًا 90°: انقر ثم اكتب الأعداد في المربع. في النهاية اسحب C من المقبض.',
          done: 'مبرهنة طاليس: إذا وقعت C على نصف الدائرة فوق AB فالزاوية عند C دائمًا 90°. تقسم أنصاف الأقطار المثلث إلى مثلثين لكل منهما زاويتان متساويتان، لذلك α + β + (α + β) = 180°.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) {
    var wahl = [30, 35, 40, 50, 55, 60];
    Z.s = 0; Z.dreh = 0; Z.zieht = false;
    Z.al = wahl[Math.floor(Math.random() * wahl.length)];
  },
  start: start,

  // Antippen: Radius OC, dann die Fragen; am Ende nur noch der Griff an C
  down: function (Z, w) {
    if (Z.s === 0) { Z.s = 1; start(Z); return; }
    if (Z.s < FERTIG) return;
    Z.zieht = abst(w, ecken(Z).c) <= C.GRAB * 1.3 * S.k;
    if (Z.zieht) ziehen(Z, w);
  },
  move: function (Z, w) { if (Z.zieht) ziehen(Z, w); },
  up: function (Z) { Z.zieht = false; },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, F = H.farben, k = S.k, ink = C.INK, E = ecken(Z), M = E.M, o = E.o, a = E.a, b = E.b, c = E.c;
    var z = zahlen(Z), fa = F[1], fb = F[0], fg = F[2], kf = k * M.f, r = 30 * kf, s = Z.s;
    var stark = function (f) { return { linie: f.linie, fuell: f.linie.replace('rgb(', 'rgba(').replace(')', ',0.3)') }; };
    // Halbkreis über AB, dünn gestrichelt
    ctx.save();
    ctx.setLineDash([4 * k, 6 * k]); ctx.strokeStyle = 'rgba(115,115,122,0.6)'; ctx.lineWidth = 1.3 * ws * k;
    ctx.beginPath(); ctx.arc(o[0], o[1], M.R, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.restore();
    // α bei A, immer
    winkelFeld(ctx, a, b, c, r, fa, z.a + '°', 16, ws, zahlAbst(z.a, kf));
    if (s >= 1) {
      // Teil bei C im Dreieck AOC: Frage 1, danach α
      if (s === 1) winkelFeld(ctx, c, a, o, 34 * kf, stark(fa), '?', 22, ws * 1.5, zahlAbst(z.a, kf) + 6 * kf);
      else winkelFeld(ctx, c, a, o, r, fa, z.a + '°', 16, ws, zahlAbst(z.a, kf));
    }
    if (s >= 2) {
      // bei B und Teil bei C im Dreieck BOC: Frage 2, danach β
      var f2 = s === 2 ? stark(fb) : fb, t2 = s === 2 ? '?' : z.b + '°', g2 = s === 2 ? 22 : 16, w2 = s === 2 ? ws * 1.5 : ws;
      winkelFeld(ctx, b, a, c, s === 2 ? 34 * kf : r, f2, t2, g2, w2, zahlAbst(z.b, kf) + (s === 2 ? 6 * kf : 0));
      winkelFeld(ctx, c, o, b, s === 2 ? 34 * kf : r, f2, t2, g2, w2, zahlAbst(z.b, kf) + (s === 2 ? 6 * kf : 0));
    }
    // ganzer Winkel bei C: grauer Bogen außen um beide Teile, Zahl oben über C (bei Frage 3 ein ?)
    var ua = [a[0] - c[0], a[1] - c[1]], ub = [b[0] - c[0], b[1] - c[1]], la = Math.hypot(ua[0], ua[1]), lb = Math.hypot(ub[0], ub[1]);
    var mc = [ua[0] / la + ub[0] / lb, ua[1] / la + ub[1] / lb], lm = Math.hypot(mc[0], mc[1]) || 1;
    if (s >= 3) {
      var wc = zwischen(H.richtung(c, a), H.richtung(c, b));
      ctx.beginPath(); ctx.arc(c[0], c[1], 66 * kf, -wc[0], -(wc[0] + wc[1]), true);
      ctx.strokeStyle = fg.linie; ctx.lineWidth = (s === 3 ? 2.4 : 1.6) * ws * k; ctx.stroke();
      var l9 = (s >= FERTIG ? 36 : 22) * k;
      App.text(ctx, s === 3 ? '?' : '90°', c[0] - mc[0] / lm * l9, c[1] - mc[1] / lm * l9, fg.linie, s === 3 ? 22 : 16);
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

  // Unten: "Tippe, um den Radius zu zeichnen"; am Ende "35° + 55° + (35° + 55°) = 180°" und "Zieh C am Griff"
  overlay: function (ctx, Z) {
    var H = App.winkel, F = H.farben, z = zahlen(Z);
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
    if (Z.s === 0) { ctx.fillText(App.wahl(TEXT.radius), S.w / 2, H.textY(1)); ctx.restore(); return; }
    ctx.restore();
    if (Z.s < FERTIG) return;
    var gruen = document.getElementById('fertig'), geloest = !!(gruen && !gruen.hidden), y = H.textY(2);
    if (geloest) y = Math.min(H.textY(1), gruen.getBoundingClientRect().top - 18);
    var A = { t: z.a + '°', c: F[1].linie }, B = { t: z.b + '°', c: F[0].linie }, plus = { t: ' + ', c: C.INK };
    H.zeile(ctx, [A, plus, B, plus, { t: '(', c: C.INK }, A, plus, B, { t: ') = 180°', c: C.INK }], y);
    if (geloest) return;
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
    ctx.fillText(App.wahl(TEXT.ziehen), S.w / 2, y + 24);
    ctx.restore();
  },

  bild: function (Z) { return Z.s ? { v: 1, s: Z.s, al: Z.al, dreh: Z.dreh } : null; },
  ausBild: function (Z, b) {
    if (b.v !== 1) return;
    Z.s = Math.max(0, Math.min(FERTIG, b.s | 0)); Z.al = Math.max(AL_MIN, Math.min(AL_MAX, b.al || 40)); Z.dreh = b.dreh || 0;
  }
});
})();
