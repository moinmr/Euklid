// Level: Warum die Winkel im Dreieck zusammen 180° ergeben. Zwei Parallelen, unten die Strecke AB.
// Antippen zeigt nacheinander zwei Z-Formen: links von A nach oben (Winkel α unten und oben gleich),
// rechts von B nach oben (β unten und oben gleich). Die rechte obere Ecke schiebt man am Griff zur linken:
// sie rasten zusammen, es entsteht ein Dreieck. Oben liegen α, γ und β nebeneinander auf der Geraden: 180°.
// Sobald das Dreieck da ist, die Frage: Wie groß ist die Summe der drei Innenwinkel? Gelöst bei 180, danach wird
// nichts mehr verschoben.
// Die Ecken stehen in Z.x1, Z.x2 (oben) und Z.xa, Z.xb (unten) relativ zur Mitte, in Einheiten des halben Abstands d der Parallelen.
(function () {
var App = window.App, S = App.S, C = App.C;
var EINRASTEN = 24;   // px
var XA = -1.6, XB = 1.6;   // Ecken A und B am Anfang, in Einheiten von d

var TEXT = {
  gleich: { de: 'Die Winkel im Z sind gleich groß', en: 'The angles in the Z are equal', fi: 'Z:n kulmat ovat yhtä suuret',
            tr: 'Z’deki açılar eşittir', fr: 'Les angles du Z sont égaux', es: 'Los ángulos de la Z son iguales',
            ja: 'Zの中の2つの角は等しい', ar: 'الزاويتان في شكل Z متساويتان' },
  summe: { de: 'Die Winkel im Dreieck ergeben zusammen 180°', en: 'The angles in the triangle add up to 180°',
           fi: 'Kolmion kulmat ovat yhteensä 180°', tr: 'Üçgenin açılarının toplamı 180°',
           fr: 'Les angles du triangle font 180° ensemble', es: 'Los ángulos del triángulo suman 180°',
           ja: '三角形の3つの角を合わせると180°', ar: 'مجموع زوايا المثلث 180°' },
  frage: { de: 'Wie groß ist die Summe der drei Innenwinkel?', en: 'What is the sum of the three interior angles?',
           fi: 'Kuinka suuri on kolmen kulman summa?', tr: 'Üç iç açının toplamı kaç derece?',
           fr: 'Combien vaut la somme des trois angles ?', es: '¿Cuánto suman los tres ángulos interiores?',
           ja: '3つの角の和は何度かな？', ar: 'كم مجموع الزوايا الداخلية الثلاث؟' },
  falsch2: { de: 'Noch nicht. Oben liegen die drei Winkel auf einer Geraden, eine halbe Drehung.',
             en: 'Not yet. At the top, the three angles lie on a straight line, half a turn.',
             fi: 'Ei vielä. Ylhäällä kolme kulmaa ovat suoralla, puoli kierrosta.',
             tr: 'Henüz değil. Üstte üç açı bir doğru üzerinde, yarım tur.',
             fr: 'Pas encore. En haut, les trois angles sont sur une droite, un demi-tour.',
             es: 'Todavía no. Arriba, los tres ángulos están sobre una recta, media vuelta.',
             ja: 'まだです。上では3つの角が1本の直線の上、つまり半回転にならんでいます。',
             ar: 'ليس بعد. في الأعلى تقع الزوايا الثلاث على مستقيم، أي نصف دورة.' }
};

// Frage unten über dem Schreibfeld, auf schmalen Bildschirmen auf zwei Zeilen
function frageZeilen(ctx, t) {
  ctx.save();
  ctx.font = '500 16px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.INK;
  var zeilen = [t], max = S.w - 32;
  if (ctx.measureText(t).width > max) {
    var wo = t.split(' '), best = null;
    for (var i = 1; i < wo.length; i++) {
      var a = wo.slice(0, i).join(' '), b = wo.slice(i).join(' '), m = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
      if (!best || m < best[0]) best = [m, a, b];
    }
    if (best) zeilen = [best[1], best[2]];
  }
  var y = App.winkel.textY(zeilen.length), breit = 0;
  zeilen.forEach(function (z) { breit = Math.max(breit, ctx.measureText(z).width); });
  // Papiergrund dahinter: auf kleinen Bildschirmen reicht das Bild bis hierher
  ctx.fillStyle = C.PARCH; ctx.globalAlpha = 0.9;
  ctx.fillRect(S.w / 2 - breit / 2 - 8, y - 14, breit + 16, 22 * zeilen.length + 6);
  ctx.globalAlpha = 1; ctx.fillStyle = C.INK;
  zeilen.forEach(function (z, i) { ctx.fillText(z, S.w / 2, y + 22 * i); });
  ctx.restore();
}
function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Mitte, halber Abstand d der Parallelen und die Ecken A, B unten
function mass(Z) {
  var P = App.winkel.platz(2);
  var d = Math.max(30, Math.min(S.w * 0.24, (P.h - 16) / 2)), m = [S.w / 2, P.my + 4];
  var M = { m: m, d: d, yo: m[1] - d, yu: m[1] + d };
  M.a = [px(M, Z ? Z.xa : XA), M.yu]; M.b = [px(M, Z ? Z.xb : XB), M.yu];
  return M;
}
// x relativ zur Mitte in Einheiten von d, auf den Bildschirm begrenzt
function px(M, u) { return Math.max(16, Math.min(S.w - 16, M.m[0] + u * M.d)); }
function start(Z) {
  if (Z.zu && !Z.ok) App.winkel.frage(180, TEXT.falsch2, function () { Z.ok = true; App.winkel.geschafft(); });
}
function grad(rad) { return rad * 180 / Math.PI; }
// Kleinerer Winkel zwischen zwei Richtungen: Anfang und Weite (mathematisch, gegen den Uhrzeigersinn)
function zwischen(d1, d2) {
  var T = App.winkel.TAU, sw = ((d2 - d1) % T + T) % T;
  return sw <= Math.PI ? [d1, sw] : [d2, T - sw];
}
// Oben an der Ecke t der Wechselwinkel zum Winkel unten bei u: zwischen der Strecke nach unten zu u und der Geraden
// in die Richtung, die unten von der anderen Ecke weg zeigt (α: nach links, β: nach rechts). So bleibt er auch
// richtig, wenn der Winkel unten stumpf ist.
function oben(t, u, richtung) { return zwischen(App.winkel.richtung(t, u), richtung); }
function unten(u, t, nach) { return zwischen(App.winkel.richtung(u, t), App.winkel.richtung(u, nach)); }

// Alle Winkel mit ganzen Gradzahlen; im Dreieck so gerundet, dass α + β + γ genau 180 ergibt
function winkel(Z) {
  var M = mass(Z), a = M.a, b = M.b, t1 = [px(M, Z.x1), M.yo], t2 = [px(M, Z.x2), M.yo];
  var w = { a: unten(a, t1, b), a2: oben(t1, a, Math.PI), b: unten(b, t2, a), b2: oben(t2, b, 0) };
  var al = grad(w.a[1]), be = grad(w.b[1]);
  if (Z.zu) {
    w.c = zwischen(App.winkel.richtung(t1, a), App.winkel.richtung(t1, b));
    var r = App.winkel.runden([al, be, 180 - al - be], 180);
    w.za = r[0]; w.zb = r[1]; w.zc = r[2];
  } else { w.za = Math.round(al); w.zb = Math.round(be); }
  w.t1 = t1; w.t2 = t2;
  return w;
}

App.level('winkel', {
  id: 'dreieck-180',
  text: {
    de: { title: 'Winkel im Dreieck',
          task: 'Tippe für die zwei Z-Formen. Schieb dann die rechte Ecke oben am Griff zur linken. Wie groß ist die Summe der drei Innenwinkel?',
          done: 'Oben liegen die drei Winkel des Dreiecks nebeneinander auf einer Geraden. Darum ergeben sie zusammen 180°.' },
    en: { title: 'Angles in a triangle',
          task: 'Tap for the two Z shapes. Then push the upper right corner by its handle to the left one until a triangle appears. What is the sum of the three interior angles?',
          done: 'At the top, the three angles of the triangle lie side by side on a straight line. That is why they add up to 180°.' },
    fi: { title: 'Kolmion kulmat',
          task: 'Napauta, niin näet kaksi Z-muotoa. Työnnä sitten oikeaa yläkulmaa kahvasta vasempaan, kunnes syntyy kolmio. Kuinka suuri on kolmen kulman summa?',
          done: 'Ylhäällä kolmion kolme kulmaa ovat vierekkäin suoralla. Siksi ne ovat yhteensä 180°.' },
    tr: { title: 'Üçgendeki açılar',
          task: 'İki Z şekli için dokun. Sonra sağ üst köşeyi tutamağından sola it, ta ki bir üçgen oluşana kadar. Üç iç açının toplamı kaç derece?',
          done: 'Üstte üçgenin üç açısı bir doğru üzerinde yan yana durur. Bu yüzden toplamları 180°.' },
    fr: { title: 'Les angles du triangle',
          task: 'Touche l’écran pour voir les deux Z. Puis pousse le coin en haut à droite par sa poignée vers celui de gauche, jusqu’à obtenir un triangle. Combien vaut la somme des trois angles ?',
          done: 'En haut, les trois angles du triangle sont côte à côte sur une droite. C’est pourquoi ils font 180° ensemble.' },
    es: { title: 'Ángulos del triángulo',
          task: 'Toca para ver las dos Z. Después empuja la esquina de arriba a la derecha por su asa hacia la de la izquierda, hasta que salga un triángulo. ¿Cuánto suman los tres ángulos interiores?',
          done: 'Arriba, los tres ángulos del triángulo quedan uno junto a otro sobre una recta. Por eso suman 180°.' },
    ja: { title: '三角形の角',
          task: 'タップすると2つのZが出てきます。それから、右上の角を持ち手で左の角までおして、三角形を作ろう。3つの角の和は何度かな？',
          done: '上では、三角形の3つの角が1本の直線の上にならびます。だから合わせると180°になります。' },
    ar: { title: 'زوايا المثلث',
          task: 'انقر لترى شكلي Z. ثم ادفع الزاوية العلوية اليمنى من مقبضها نحو اليسرى حتى يتكوّن مثلث. كم مجموع الزوايا الداخلية الثلاث؟',
          done: 'في الأعلى تقع زوايا المثلث الثلاث متجاورة على مستقيم واحد. لذلك مجموعها 180°.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) {
    Z.schritt = 0; Z.zu = false; Z.ok = false; Z.zieht = false;
    Z.xa = XA; Z.xb = XB;
    Z.x1 = XA + 2 / Math.tan(60 * Math.PI / 180);   // links: α = 60°
    Z.x2 = XB - 2 / Math.tan(65 * Math.PI / 180);   // rechts: β = 65°
  },
  start: start,

  down: function (Z, w) {
    if (Z.schritt < 2) { Z.schritt++; return; }   // Antippen: nächster Schritt
    if (Z.zu) return;   // Dreieck fertig: nichts mehr verschieben
    var M = mass(Z);
    Z.zieht = abst(w, [px(M, Z.x2), M.yo]) <= C.GRAB * 1.3 * S.k;   // nur am Griff
  },
  move: function (Z, w) {
    if (!Z.zieht || Z.zu) return;
    var M = mass(Z), x = (Math.max(24, Math.min(S.w - 24, w[0])) - M.m[0]) / M.d;
    Z.x2 = x;
    // rastet ein, auch wenn ein schneller Finger über die linke Ecke hinaus springt
    if ((Z.x2 - Z.x1) * M.d <= EINRASTEN * S.k) { Z.x2 = Z.x1; Z.zu = true; Z.zieht = false; start(Z); }
  },
  up: function (Z) { Z.zieht = false; },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, M = mass(Z), F = H.farben;
    var fa = F[1], fb = F[0], fc = F[2];   // α Braun, β Tinte, γ Grau
    ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 2 * ws * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-S.w, M.yo); ctx.lineTo(2 * S.w, M.yo); ctx.moveTo(-S.w, M.yu); ctx.lineTo(2 * S.w, M.yu); ctx.stroke();
    H.strecke(ctx, M.a, M.b, ink, ws);
    if (Z.schritt < 1) return;
    var w = winkel(Z), r = Math.min(32 * k, M.d * 0.5), q = r / (32 * k);
    if (Z.zu) {
      ctx.fillStyle = 'rgba(56,41,25,0.06)';
      ctx.beginPath(); ctx.moveTo(M.a[0], M.a[1]); ctx.lineTo(M.b[0], M.b[1]); ctx.lineTo(w.t1[0], w.t1[1]); ctx.closePath(); ctx.fill();
    }
    var felder = [[M.a, w.a, fa, w.za], [w.t1, w.a2, fa, w.za]];
    if (Z.schritt >= 2) felder.push([M.b, w.b, fb, w.zb], [w.t2, w.b2, fb, w.zb]);
    if (Z.zu) felder.push([w.t1, w.c, fc, w.zc]);
    felder.forEach(function (f) { H.feld(ctx, f[0], r, f[1][0], f[1][1], f[2].fuell, f[2].linie, ws); });
    H.strecke(ctx, M.a, w.t1, ink, ws);
    if (Z.schritt >= 2) H.strecke(ctx, M.b, w.t2, ink, ws);
    if (Z.schritt >= 2 && !Z.zu) {
      // Griff an der rechten oberen Ecke, bis das Dreieck da ist
      ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k;
      ctx.beginPath(); ctx.arc(w.t2[0], w.t2[1], 15 * k, 0, H.TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
    }
    felder.forEach(function (f) {
      var mid = f[1][0] + f[1][1] / 2, ra = Math.max(r + 12 * k, (52 + Math.max(0, 40 - grad(f[1][1])) * 0.8) * k * q);
      var lx = Math.max(20, Math.min(S.w - 20, f[0][0] + Math.cos(mid) * ra));   // Zahl bleibt auf dem Bildschirm
      App.text(ctx, f[3] + '°', lx, f[0][1] - Math.sin(mid) * ra, f[2].linie, 16);
    });
  },

  // Unten über der Leiste: erst die gleichen Z-Winkel, im Dreieck α + γ + β = 180°
  overlayBeiFrage: true,   // bei der Frage steht sie unten
  overlay: function (ctx, Z) {
    if (Z.schritt < 1) return;
    var H = App.winkel, F = H.farben;
    if (Z.zu && !Z.ok) { frageZeilen(ctx, App.wahl(TEXT.frage)); return; }   // Frage offen: keine Rechnung
    var w = winkel(Z), frage = false, y = H.textY(2);
    var teile;
    if (Z.zu) teile = [{ t: w.za + '°', c: F[1].linie }, { t: ' + ', c: C.INK }, { t: frage ? '?' : w.zc + '°', c: F[2].linie },
                       { t: ' + ', c: C.INK }, { t: w.zb + '°', c: F[0].linie }, { t: ' = 180°', c: C.INK }];
    else {
      teile = [{ t: w.za + '° = ' + w.za + '°', c: F[1].linie }];
      if (Z.schritt >= 2) teile.push({ t: '     ', c: C.INK }, { t: w.zb + '° = ' + w.zb + '°', c: F[0].linie });
    }
    H.zeile(ctx, teile, y);
    if (frage) return;
    ctx.save();
    ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
    ctx.fillText(App.wahl(Z.zu ? TEXT.summe : TEXT.gleich), S.w / 2, y + 22);
    ctx.restore();
  },

  // Lage der drei Ecken merken, relativ zur Mitte und zum Abstand der Parallelen
  bild: function (Z) { return Z.zu ? { v: 5, x: Z.x1, xa: Z.xa, xb: Z.xb, ok: Z.ok } : null; },
  ausBild: function (Z, b) {
    if (b.v < 1 || b.v > 5) return;
    Z.x1 = Z.x2 = b.x; Z.zu = true; Z.schritt = 2;
    Z.xa = b.v >= 4 ? b.xa : XA; Z.xb = b.v >= 4 ? b.xb : XB;
    Z.ok = b.v === 1 || (b.v >= 3 && b.v <= 4 ? b.ok2 : b.ok);   // frühere Fassungen: erst die letzte Frage hieß fertig
  }
});
})();
