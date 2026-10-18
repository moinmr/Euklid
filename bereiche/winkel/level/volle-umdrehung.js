// Level: Ein Kreis ist eine volle Umdrehung (360°). Nacheinander, mit je einem Antippen, erscheinen eine waagrechte Strecke
// durch den Mittelpunkt (180° + 180°) und eine senkrechte Strecke aus dem Mittelpunkt (90° + 90° + 180°).
// Bei der senkrechten Strecke stehen erst Fragezeichen: die zwei neuen Winkel schreibt man ins Schreibfeld (90).
// Danach hat das Ende der senkrechten Strecke einen Griff, daran dreht man sie; die Winkel ändern sich mit, die Summe bleibt 360°.
// Jedes Antippen zeigt den nächsten Schritt. Gelöst nach insgesamt 120° Drehung.
(function () {
var App = window.App, S = App.S, C = App.C;
var DREH_NOETIG = 120;   // Grad

var TEXT = {
  griff: { de: 'Dreh jetzt die senkrechte Strecke am Griff', en: 'Now turn the upright segment by its handle',
           fi: 'Käännä nyt pystysuoraa janaa kahvasta', tr: 'Şimdi dik doğru parçasını tutamağından döndür',
           fr: 'Fais maintenant tourner le segment vertical par sa poignée', es: 'Ahora gira el segmento vertical por su asa',
           ja: 'こんどは、たての線分を持ち手で回そう', ar: 'الآن أدِر القطعة العمودية من مقبضها' },
  umdrehung: { de: 'eine volle Umdrehung', en: 'one full turn', fi: 'yksi täysi kierros', tr: 'tam bir tur',
               fr: 'un tour complet', es: 'una vuelta completa', ja: 'ちょうど1回転', ar: 'دورة كاملة' },
  falsch: { de: 'Noch nicht. Die zwei Winkel sind gleich groß und ergeben zusammen 180°.',
            en: 'Not yet. The two angles are equal and add up to 180°.',
            fi: 'Ei vielä. Kaksi kulmaa ovat yhtä suuret ja yhteensä 180°.',
            tr: 'Henüz değil. İki açı eşittir ve toplamları 180°.',
            fr: 'Pas encore. Les deux angles sont égaux et font 180° ensemble.',
            es: 'Todavía no. Los dos ángulos son iguales y suman 180°.',
            ja: 'まだです。2つの角は等しく、合わせると180°です。',
            ar: 'ليس بعد. الزاويتان متساويتان ومجموعهما 180°.' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Kreis in der Bildmitte
function kreis() {
  var P = App.winkel.platz(2);
  return { m: [S.w / 2, P.my], r: Math.max(50, Math.min(S.w * 0.3, P.h / 2.5)) };
}
// Ende der senkrechten Strecke: Richtung Z.dir (mathematisch), Länge 1,2 r
function punkt(Z) { var K = kreis(), l = K.r * 1.2; return [K.m[0] + Math.cos(Z.dir) * l, K.m[1] - Math.sin(Z.dir) * l]; }
function fragen(Z) {
  App.winkel.frage(90, TEXT.falsch, function () { Z.ok = true; });
}
function start(Z) { if (Z.schritt === 2 && !Z.ok) fragen(Z); }
// Schritt: 0 nur Kreis, 1 waagrechte Strecke da, 2 senkrechte Strecke da (mit Griff)
function schritt(Z) { return Z.schritt; }
function enden(Z) {
  var K = kreis(), m = K.m, h = K.r * 1.2;
  return { a: [m[0] - h, m[1]], b: [m[0] + h, m[1]] };
}

// Die Winkel um den Mittelpunkt zwischen den Strahlen zu A, B (waagrecht) und P (zweite Strecke)
function winkel(Z) {
  var H = App.winkel, m = kreis().m, st = schritt(Z), e = enden(Z);
  if (st === 0) return [{ a0: 0, sw: H.TAU, f: 2, grad: 360, zahl: 360 }];
  var rs = [{ n: 'a', d: H.richtung(m, e.a) }, { n: 'b', d: H.richtung(m, e.b) }];
  if (st === 2) rs.push({ n: 'p', d: Z.dir });
  rs.sort(function (x, y) { return x.d - y.d; });
  var out = rs.map(function (s, i) {
    var t = rs[(i + 1) % rs.length], sw = t.d - s.d;
    if (sw <= 0) sw += H.TAU;
    var paar = s.n + t.n, f;
    // Farbe bleibt beim Drehen am Winkel: zwischen A und B grau, an A Tinte, an B Braun
    if (st === 1) f = paar === 'ba' ? 0 : 2;
    else f = (paar === 'ab' || paar === 'ba') ? 2 : (paar.indexOf('a') >= 0 ? 0 : 1);
    return { a0: s.d, sw: sw, f: f, grad: sw * 180 / Math.PI };
  });
  var r = H.runden(out.map(function (w) { return w.grad; }), 360);
  out.forEach(function (w, i) { w.zahl = r[i]; });
  return out.sort(function (x, y) { return x.f - y.f; });
}

function drehen(Z, w) {
  var m = kreis().m;
  if (abst(m, w) < 20 * S.k) return;
  var d = Math.atan2(m[1] - w[1], w[0] - m[0]);
  if (Z.letzte !== null) {
    var T = App.winkel.TAU, dd = d - Z.letzte;
    dd = ((dd + Math.PI) % T + T) % T - Math.PI;
    Z.dreh += Math.abs(dd) * 180 / Math.PI;
  }
  Z.letzte = d;
  Z.dir = d;
  if (Z.dreh >= DREH_NOETIG) App.winkel.geschafft();
}

App.level('winkel', {
  id: 'volle-umdrehung',
  text: {
    de: { title: 'Eine volle Umdrehung',
          task: 'Ein Kreis ist eine volle Umdrehung: 360°. Tippe für den nächsten Schritt. Wie groß sind die zwei neuen Winkel? Schreib die Zahl ins Feld. Dreh danach die senkrechte Strecke am Griff.',
          done: 'Die Winkel um einen Punkt ergeben zusammen immer 360°. Das ist eine volle Umdrehung.' },
    en: { title: 'One full turn',
          task: 'A circle is one full turn: 360°. Tap for the next step. How big are the two new angles? Write the number in the box. Then turn the upright segment by its handle.',
          done: 'The angles around a point always add up to 360°. That is one full turn.' },
    fi: { title: 'Yksi täysi kierros',
          task: 'Ympyrä on yksi täysi kierros: 360°. Napauta, niin näet seuraavan vaiheen. Kuinka suuret kaksi uutta kulmaa ovat? Kirjoita luku kenttään. Käännä sitten pystysuoraa janaa kahvasta.',
          done: 'Pisteen ympärillä olevat kulmat ovat yhteensä aina 360°. Se on yksi täysi kierros.' },
    tr: { title: 'Tam bir tur',
          task: 'Bir çember tam bir turdur: 360°. Sonraki adım için dokun. İki yeni açı kaç derece? Sayıyı kutuya yaz. Sonra dik doğru parçasını tutamağından döndür.',
          done: 'Bir noktanın etrafındaki açıların toplamı her zaman 360°. Bu tam bir turdur.' },
    fr: { title: 'Un tour complet',
          task: 'Un cercle, c’est un tour complet : 360°. Touche l’écran pour l’étape suivante. Combien mesurent les deux nouveaux angles ? Écris le nombre dans la case. Puis fais tourner le segment vertical par sa poignée.',
          done: 'Les angles autour d’un point font toujours 360° ensemble. C’est un tour complet.' },
    es: { title: 'Una vuelta completa',
          task: 'Un círculo es una vuelta completa: 360°. Toca para ver el siguiente paso. ¿Cuánto miden los dos ángulos nuevos? Escribe el número en la casilla. Después gira el segmento vertical por su asa.',
          done: 'Los ángulos alrededor de un punto suman siempre 360°. Eso es una vuelta completa.' },
    ja: { title: 'ちょうど1回転',
          task: '円はちょうど1回転、360°です。タップすると次に進みます。2つの新しい角は何度かな？数を書いてね。そのあと、たての線分を持ち手で回そう。',
          done: '1つの点のまわりの角を合わせると、いつも360°。これがちょうど1回転です。' },
    ar: { title: 'دورة كاملة',
          task: 'الدائرة دورة كاملة: 360°. انقر للخطوة التالية. كم قياس الزاويتين الجديدتين؟ اكتب العدد في المربع. ثم أدِر القطعة العمودية من مقبضها.',
          done: 'مجموع الزوايا حول نقطة دائمًا 360°. هذه دورة كاملة.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) { Z.schritt = 0; Z.ok = false; Z.dir = Math.PI / 2; Z.dreh = 0; Z.letzte = null; Z.zieht = false; },
  start: start,

  down: function (Z, w) {
    // Antippen: nächster Schritt
    if (Z.schritt < 2) { Z.schritt++; start(Z); return; }
    if (!Z.ok) return;   // erst die Frage beantworten
    Z.zieht = abst(w, punkt(Z)) <= C.GRAB * 1.3 * S.k;   // nur am Griff
    Z.letzte = null;
    if (Z.zieht) drehen(Z, w);
  },
  move: function (Z, w) { if (Z.zieht) drehen(Z, w); },
  up: function (Z) { Z.zieht = false; },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, K = kreis(), m = K.m, r = K.r, e = enden(Z);
    var wl = winkel(Z), st = schritt(Z);
    wl.forEach(function (w) { var f = H.farben[w.f]; H.feld(ctx, m, r, w.a0, w.sw, f.fuell, f.linie, ws); });
    var p = punkt(Z);
    if (st === 2) H.strecke(ctx, m, p, ink, ws);
    if (st >= 1) H.strecke(ctx, e.a, e.b, ink, ws);
    ctx.fillStyle = ink; App.dotAt(ctx, m, false, 5);
    // Griff am Ende der senkrechten Strecke
    if (st === 2 && Z.ok) {
      ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k;
      ctx.beginPath(); ctx.arc(p[0], p[1], 15 * k, 0, H.TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
    }
    wl.forEach(function (w) {
      var lx, ly;
      if (st === 0) { lx = m[0]; ly = m[1] - r * 0.45; }
      else {
        // Zahl im Winkelfeld; kleine Winkel außerhalb des Kreises, mit Pergament hinterlegt
        var mid = w.a0 + w.sw / 2, ra = w.grad >= 40 ? r * 0.6 : r + (22 + Math.max(0, 30 - w.grad) * 1.6) * k;
        lx = m[0] + Math.cos(mid) * ra; ly = m[1] - Math.sin(mid) * ra;
        if (w.grad < 40) { ctx.fillStyle = C.PARCH; App.dotAt(ctx, [lx, ly], false, 11); }
      }
      var frage = st === 2 && !Z.ok && w.f !== 2;   // die zwei neuen Winkel: erst ein Fragezeichen
      App.text(ctx, frage ? '?' : w.zahl + '°', lx, ly, H.farben[w.f].linie, frage ? 22 : 17);
    });
  },

  // Unten über der Leiste: 360° bzw. 180° + 180° = 360° bzw. a° + b° + c° = 360°, darunter "eine volle Umdrehung"
  overlay: function (ctx, Z) {
    var H = App.winkel, wl = winkel(Z), y = H.textY(2), frage = Z.schritt === 2 && !Z.ok;
    var teile = [];
    wl.forEach(function (w, i) {
      if (i) teile.push({ t: ' + ', c: C.INK });
      teile.push({ t: frage && w.f !== 2 ? '?' : w.zahl + '°', c: wl.length > 1 ? H.farben[w.f].linie : C.INK });
    });
    if (wl.length > 1) teile.push({ t: ' = 360°', c: C.INK });
    H.zeile(ctx, teile, y);
    ctx.save();
    // nach der richtigen Antwort, bis zum ersten Drehen: sagen, was jetzt zu tun ist
    var jetzt = Z.schritt === 2 && Z.ok && !Z.dreh;
    ctx.font = '400 14.5px ' + C.FONT; ctx.textAlign = 'center'; ctx.fillStyle = jetzt ? C.INK : C.PENCIL;
    ctx.fillText(App.wahl(jetzt ? TEXT.griff : TEXT.umdrehung), S.w / 2, y + 22);
    ctx.restore();
  },

  // Schritt, Antwort und Richtung der senkrechten Strecke merken
  bild: function (Z) { return Z.schritt ? { v: 4, schritt: Z.schritt, ok: Z.ok, dir: Z.dir, dreh: Z.dreh } : null; },
  ausBild: function (Z, b) {
    if (b.v === 4) { Z.schritt = b.schritt; Z.ok = b.ok; Z.dir = b.dir; Z.dreh = b.dreh; }
    else if (b.v === 3) { Z.schritt = 2; Z.ok = true; Z.dir = Math.atan2(-b.p[1], b.p[0]); Z.dreh = 1; }   // frühere Fassung
  }
});
})();
