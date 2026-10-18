// Level: Zwei parallele Geraden. Antippen zeigt eine schräge Strecke dazwischen, zusammen eine Z-Form.
// Oben steht die Gradzahl, unten ein Fragezeichen: die Zahl schreibt man ins Schreibfeld (der Winkel ist bei jedem
// Neustart ein anderer, 45° bis 70°). Die beiden Winkel im Z (Wechselwinkel) sind immer gleich groß. Danach dreht man am Griff oben die schräge Strecke
// um ihre Mitte, beide Winkel ändern sich mit und bleiben gleich. Gelöst nach insgesamt 60° Drehung.
(function () {
var App = window.App, S = App.S, C = App.C;
var DREH_NOETIG = 60;              // Grad
var MIN = 25 * Math.PI / 180;      // flachste Neigung, damit die Ecken auf dem Bildschirm bleiben

var TEXT = {
  gleich: { de: 'Die Winkel im Z sind gleich groß', en: 'The angles in the Z are equal', fi: 'Z:n kulmat ovat yhtä suuret',
            tr: 'Z’deki açılar eşittir', fr: 'Les angles du Z sont égaux', es: 'Los ángulos de la Z son iguales',
            ja: 'Zの中の2つの角は等しい', ar: 'الزاويتان في شكل Z متساويتان' },
  falsch: { de: 'Noch nicht. Schau dir den Winkel oben an.', en: 'Not yet. Look at the angle at the top.',
            fi: 'Ei vielä. Katso ylempää kulmaa.', tr: 'Henüz değil. Üstteki açıya bak.',
            fr: 'Pas encore. Regarde l’angle en haut.', es: 'Todavía no. Mira el ángulo de arriba.',
            ja: 'まだです。上の角を見てみよう。', ar: 'ليس بعد. انظر إلى الزاوية في الأعلى.' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Mitte zwischen den Parallelen und ihr halber Abstand d
function mass() {
  var P = App.winkel.platz(2), r = Math.max(50, Math.min(S.w * 0.3, P.h / 3.2));
  return { m: [S.w / 2, P.my], d: r * 0.75 };
}
function start(Z) {
  if (Z.schritt === 1 && !Z.ok) App.winkel.frage(zWinkel(Z).grad, TEXT.falsch, function () { Z.ok = true; });
}
// Ecken des Z: oben T, unten B, für die Neigung th (Bogenmaß, gegen die Waagrechte, 0 bis π)
function ecken(th) {
  var M = mass(), dx = M.d / Math.tan(th);
  return { t: [M.m[0] + dx, M.m[1] - M.d], b: [M.m[0] - dx, M.m[1] + M.d] };
}
// Griff: ein Stück über der oberen Ecke auf der schrägen Strecke
function griff(Z) {
  var M = mass(), l = M.d / Math.sin(Z.th) + 46 * S.k;
  return [M.m[0] + Math.cos(Z.th) * l, M.m[1] - Math.sin(Z.th) * l];
}
// Kleinerer Winkel zwischen zwei Richtungen: Anfang und Weite (mathematisch, gegen den Uhrzeigersinn)
function zwischen(d1, d2) {
  var T = App.winkel.TAU, sw = ((d2 - d1) % T + T) % T;
  return sw <= Math.PI ? [d1, sw] : [d2, T - sw];
}
// Die zwei Winkel im Z: an jeder Ecke zwischen der schrägen Strecke und der Parallelen zur anderen Ecke hin
function zWinkel(Z) {
  var H = App.winkel, e = ecken(Z.th);
  var seite = e.b[0] < e.t[0] ? Math.PI : 0;   // oben zeigt der Z-Strich zur Seite von B, unten zur Seite von T
  if (Math.abs(e.b[0] - e.t[0]) < 0.5) seite = Math.PI;
  var oben = zwischen(H.richtung(e.t, e.b), seite), unten = zwischen(H.richtung(e.b, e.t), seite === 0 ? Math.PI : 0);
  var grad = Math.round(Math.min(Z.th, Math.PI - Z.th) * 180 / Math.PI);
  return { e: e, oben: oben, unten: unten, grad: grad, seite: seite };
}

function drehen(Z, w) {
  var M = mass(), dx = w[0] - M.m[0], dy = M.m[1] - w[1];
  if (Math.hypot(dx, dy) < 20 * S.k) return;
  if (dy < 0) { dx = -dx; dy = -dy; }   // Finger unter der Mitte: zählt wie das obere Ende
  var th = Math.max(MIN, Math.min(Math.PI - MIN, Math.atan2(dy, dx)));
  Z.dreh += Math.abs(th - Z.th) * 180 / Math.PI;
  Z.th = th;
  if (Z.dreh >= DREH_NOETIG) App.winkel.geschafft();
}

App.level('winkel', {
  id: 'z-winkel',
  text: {
    de: { title: 'Winkel im Z',
          task: 'Zwei Geraden sind parallel. Tippe für den nächsten Schritt. Wie groß ist der Winkel unten? Schreib die Zahl ins Feld. Dreh dann die schräge Strecke am Griff und schau auf die zwei Winkel.',
          done: 'Die Winkel in der Z-Form sind immer gleich groß. Man nennt sie Wechselwinkel.' },
    en: { title: 'Angles in a Z',
          task: 'Two lines are parallel. Tap for the next step. How big is the angle at the bottom? Write the number in the box. Then turn the slanted segment by its handle and watch the two angles.',
          done: 'The angles in the Z shape are always equal. They are called alternate angles.' },
    fi: { title: 'Kulmat Z-muodossa',
          task: 'Kaksi suoraa ovat yhdensuuntaiset. Napauta, niin näet seuraavan vaiheen. Kuinka suuri alempi kulma on? Kirjoita luku kenttään. Käännä sitten vinoa janaa kahvasta ja katso kahta kulmaa.',
          done: 'Z-muodon kulmat ovat aina yhtä suuret. Niitä kutsutaan vuorokulmiksi.' },
    tr: { title: 'Z’deki açılar',
          task: 'İki doğru paraleldir. Sonraki adım için dokun. Alttaki açı kaç derece? Sayıyı kutuya yaz. Sonra eğik doğru parçasını tutamağından döndür ve iki açıya bak.',
          done: 'Z şeklindeki açılar her zaman eşittir. Bunlara iç ters açılar denir.' },
    fr: { title: 'Les angles du Z',
          task: 'Deux droites sont parallèles. Touche l’écran pour l’étape suivante. Combien mesure l’angle du bas ? Écris le nombre dans la case. Puis fais tourner le segment oblique par sa poignée et regarde les deux angles.',
          done: 'Les angles en forme de Z sont toujours égaux. On les appelle angles alternes-internes.' },
    es: { title: 'Ángulos en la Z',
          task: 'Dos rectas son paralelas. Toca para ver el siguiente paso. ¿Cuánto mide el ángulo de abajo? Escribe el número en la casilla. Después gira el segmento inclinado por su asa y mira los dos ángulos.',
          done: 'Los ángulos en forma de Z son siempre iguales. Se llaman ángulos alternos internos.' },
    ja: { title: 'Zの中の角',
          task: '2本の直線は平行です。タップすると次に進みます。下の角は何度かな？数を書いてね。それから、ななめの線分を持ち手で回して、2つの角を見てみよう。',
          done: 'Zの形の2つの角は、いつも等しくなります。これを錯角といいます。' },
    ar: { title: 'الزوايا في شكل Z',
          task: 'مستقيمان متوازيان. انقر للخطوة التالية. كم قياس الزاوية في الأسفل؟ اكتب العدد في المربع. ثم أدِر القطعة المائلة من مقبضها وانظر إلى الزاويتين.',
          done: 'الزاويتان في شكل Z متساويتان دائمًا. تُسمَّيان زاويتين متبادلتين.' }
  },
  werkzeuge: ['clear'],

  // Startwinkel zufällig 45° bis 70° in Fünferschritten, damit man die Zahl nicht auswendig weiß
  neu: function (Z) {
    Z.schritt = 0; Z.ok = false; Z.dreh = 0; Z.zieht = false;
    Z.th = (45 + 5 * Math.floor(Math.random() * 6)) * Math.PI / 180;
  },
  start: start,

  down: function (Z, w) {
    if (Z.schritt < 1) { Z.schritt++; start(Z); return; }   // Antippen: nächster Schritt
    if (!Z.ok) return;   // erst die Frage beantworten
    Z.zieht = abst(w, griff(Z)) <= C.GRAB * 1.3 * S.k;   // nur am Griff
    if (Z.zieht) drehen(Z, w);
  },
  move: function (Z, w) { if (Z.zieht) drehen(Z, w); },
  up: function (Z) { Z.zieht = false; },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, M = mass(), m = M.m;
    // die zwei Parallelen über die ganze Breite
    var yo = m[1] - M.d, yu = m[1] + M.d, x0 = -S.w, x1 = 2 * S.w;
    ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 2 * ws * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, yo); ctx.lineTo(x1, yo); ctx.moveTo(x0, yu); ctx.lineTo(x1, yu); ctx.stroke();
    if (Z.schritt < 1) return;
    var z = zWinkel(Z), e = z.e, f = H.farben[1], L = M.d * 1.6;
    // Felder der zwei Winkel, beide in derselben Farbe: sie sind gleich
    H.feld(ctx, e.t, 34 * k, z.oben[0], z.oben[1], f.fuell, f.linie, ws);
    H.feld(ctx, e.b, 34 * k, z.unten[0], z.unten[1], f.fuell, f.linie, ws);
    // schräge Strecke durch die Mitte bis zum Griff, und das Z kräftig in Tinte
    var g = griff(Z), u = [2 * m[0] - g[0], 2 * m[1] - g[1]];
    ctx.strokeStyle = ink; ctx.lineWidth = 1.6 * ws * k;
    ctx.beginPath(); ctx.moveTo(u[0], u[1]); ctx.lineTo(g[0], g[1]); ctx.stroke();
    var so = z.seite === Math.PI ? -1 : 1;
    ctx.lineWidth = 3 * ws * k; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(e.t[0] + so * L, e.t[1]); ctx.lineTo(e.t[0], e.t[1]); ctx.lineTo(e.b[0], e.b[1]); ctx.lineTo(e.b[0] - so * L, e.b[1]);
    ctx.stroke();
    ctx.fillStyle = ink; App.dotAt(ctx, m, false, 4);
    // Griff, erst nach der richtigen Antwort
    if (Z.ok) {
      ctx.lineWidth = 2 * ws * k;
      ctx.beginPath(); ctx.arc(g[0], g[1], 15 * k, 0, H.TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
    }
    // Zahlen an den Winkeln; unten erst ein Fragezeichen
    [[e.t, z.oben, false], [e.b, z.unten, !Z.ok]].forEach(function (q) {
      var mid = q[1][0] + q[1][1] / 2, ra = (58 + Math.max(0, 40 - z.grad) * 0.8) * k;
      App.text(ctx, q[2] ? '?' : z.grad + '°', q[0][0] + Math.cos(mid) * ra, q[0][1] - Math.sin(mid) * ra, f.linie, q[2] ? 22 : 17);
    });
  },

  // Unten über der Leiste: 60° = 60°, darunter "Die Winkel im Z sind gleich groß"
  overlay: function (ctx, Z) {
    if (Z.schritt < 1) return;
    var H = App.winkel, z = zWinkel(Z), y = H.textY(Z.ok ? 2 : 1);
    ctx.save();
    ctx.font = '400 20px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillStyle = H.farben[1].linie;
    ctx.fillText(z.grad + '° = ' + (Z.ok ? z.grad + '°' : '?'), S.w / 2, y);
    if (Z.ok) {   // der Satz verrät die Antwort, darum erst danach
      ctx.font = '400 14.5px ' + C.FONT; ctx.fillStyle = C.PENCIL;
      ctx.fillText(App.wahl(TEXT.gleich), S.w / 2, y + 22);
    }
    ctx.restore();
  },

  bild: function (Z) { return Z.schritt ? { v: 2, th: Z.th, ok: Z.ok, dreh: Z.dreh } : null; },
  ausBild: function (Z, b) {
    if (b.v === 2) { Z.th = b.th; Z.schritt = 1; Z.ok = b.ok; Z.dreh = b.dreh; }
    else if (b.v === 1) { Z.th = b.th; Z.schritt = 1; Z.ok = true; }   // frühere Fassung
  }
});
})();
