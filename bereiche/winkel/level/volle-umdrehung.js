// Level: Ein Kreis ist eine volle Umdrehung (360°). Nacheinander, mit je einem Antippen, erscheinen eine waagrechte Strecke
// durch den Mittelpunkt (180° + 180°) und eine senkrechte Strecke aus dem Mittelpunkt (90° + 90° + 180°).
// Nur das Ende der senkrechten Strecke hat einen Griff, daran dreht man sie; die Winkel ändern sich mit, die Summe bleibt 360°.
// Jedes Antippen zeigt den nächsten Schritt. Gelöst nach insgesamt 120° Drehung.
(function () {
var App = window.App, S = App.S, C = App.C;
var DREH_NOETIG = 120;   // Grad

var TEXT = {
  umdrehung: { de: 'eine volle Umdrehung', en: 'one full turn', fi: 'yksi täysi kierros', tr: 'tam bir tur',
               fr: 'un tour complet', es: 'una vuelta completa', ja: 'ちょうど1回転', ar: 'دورة كاملة' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Kreis in der Bildmitte
function kreis() { return { m: [S.w / 2, S.h * 0.52], r: Math.max(70, Math.min(S.w * 0.3, S.h * 0.2)) }; }
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
  if (st === 2) rs.push({ n: 'p', d: H.richtung(m, Z.p) });
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
  var d = Math.atan2(w[1] - m[1], w[0] - m[0]), len = abst(m, Z.p);
  if (Z.letzte !== null) {
    var T = App.winkel.TAU, dd = d - Z.letzte;
    dd = ((dd + Math.PI) % T + T) % T - Math.PI;
    Z.dreh += Math.abs(dd) * 180 / Math.PI;
  }
  Z.letzte = d;
  Z.p = [m[0] + Math.cos(d) * len, m[1] + Math.sin(d) * len];
  if (Z.dreh >= DREH_NOETIG) App.winkel.geschafft();
}

App.level('winkel', {
  id: 'volle-umdrehung',
  text: {
    de: { title: 'Eine volle Umdrehung',
          task: 'Ein Kreis ist eine volle Umdrehung: 360°. Tippe für den nächsten Schritt. Dreh am Ende die senkrechte Strecke am Griff.',
          done: 'Die Winkel um einen Punkt ergeben zusammen immer 360°. Das ist eine volle Umdrehung.' },
    en: { title: 'One full turn',
          task: 'A circle is one full turn: 360°. Tap for the next step. At the end, turn the upright segment by its handle.',
          done: 'The angles around a point always add up to 360°. That is one full turn.' },
    fi: { title: 'Yksi täysi kierros',
          task: 'Ympyrä on yksi täysi kierros: 360°. Napauta, niin näet seuraavan vaiheen. Käännä lopuksi pystysuoraa janaa kahvasta.',
          done: 'Pisteen ympärillä olevat kulmat ovat yhteensä aina 360°. Se on yksi täysi kierros.' },
    tr: { title: 'Tam bir tur',
          task: 'Bir çember tam bir turdur: 360°. Sonraki adım için dokun. En sonda dik doğru parçasını tutamağından döndür.',
          done: 'Bir noktanın etrafındaki açıların toplamı her zaman 360°. Bu tam bir turdur.' },
    fr: { title: 'Un tour complet',
          task: 'Un cercle, c’est un tour complet : 360°. Touche l’écran pour l’étape suivante. À la fin, fais tourner le segment vertical par sa poignée.',
          done: 'Les angles autour d’un point font toujours 360° ensemble. C’est un tour complet.' },
    es: { title: 'Una vuelta completa',
          task: 'Un círculo es una vuelta completa: 360°. Toca para ver el siguiente paso. Al final, gira el segmento vertical por su asa.',
          done: 'Los ángulos alrededor de un punto suman siempre 360°. Eso es una vuelta completa.' },
    ja: { title: 'ちょうど1回転',
          task: '円はちょうど1回転、360°です。タップすると次に進みます。最後に、たての線分を持ち手で回そう。',
          done: '1つの点のまわりの角を合わせると、いつも360°。これがちょうど1回転です。' },
    ar: { title: 'دورة كاملة',
          task: 'الدائرة دورة كاملة: 360°. انقر للخطوة التالية. في النهاية أدِر القطعة العمودية من مقبضها.',
          done: 'مجموع الزوايا حول نقطة دائمًا 360°. هذه دورة كاملة.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) {
    var K = kreis();
    Z.schritt = 0; Z.p = [K.m[0], K.m[1] - K.r * 1.2];
    Z.dreh = 0; Z.letzte = -Math.PI / 2; Z.zieht = false;
  },

  down: function (Z, w) {
    // Antippen: nächster Schritt
    if (Z.schritt < 2) { Z.schritt++; return; }
    Z.zieht = abst(w, Z.p) <= C.GRAB * 1.3 * S.k;   // nur am Griff
    if (Z.zieht) drehen(Z, w);
  },
  move: function (Z, w) { if (Z.zieht) drehen(Z, w); },
  up: function (Z) { Z.zieht = false; },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, K = kreis(), m = K.m, r = K.r, e = enden(Z);
    var wl = winkel(Z), st = schritt(Z);
    wl.forEach(function (w) { var f = H.farben[w.f]; H.feld(ctx, m, r, w.a0, w.sw, f.fuell, f.linie, ws); });
    if (st === 2) H.strecke(ctx, m, Z.p, ink, ws);
    if (st >= 1) H.strecke(ctx, e.a, e.b, ink, ws);
    ctx.fillStyle = ink; App.dotAt(ctx, m, false, 5);
    // Griff am Ende der senkrechten Strecke
    if (st === 2) {
      ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k;
      ctx.beginPath(); ctx.arc(Z.p[0], Z.p[1], 15 * k, 0, H.TAU); ctx.stroke();
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
      App.text(ctx, w.zahl + '°', lx, ly, H.farben[w.f].linie, 17);
    });
  },

  // Unten über der Leiste: 360° bzw. 180° + 180° = 360° bzw. a° + b° + c° = 360°, darunter "eine volle Umdrehung"
  overlay: function (ctx, Z) {
    var H = App.winkel, wl = winkel(Z), y = S.h - (S.unten || 70) - (document.body.classList.contains('geschafft') ? 120 : 46);
    var teile = [];
    wl.forEach(function (w, i) {
      if (i) teile.push({ t: ' + ', c: C.INK });
      teile.push({ t: w.zahl + '°', c: wl.length > 1 ? H.farben[w.f].linie : C.INK });
    });
    if (wl.length > 1) teile.push({ t: ' = 360°', c: C.INK });
    ctx.save();
    ctx.font = '400 20px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    var breite = teile.reduce(function (s, t) { return s + ctx.measureText(t.t).width; }, 0), x = (S.w - breite) / 2;
    teile.forEach(function (t) { ctx.fillStyle = t.c; ctx.fillText(t.t, x, y); x += ctx.measureText(t.t).width; });
    ctx.font = '400 14.5px ' + C.FONT; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
    ctx.fillText(App.wahl(TEXT.umdrehung), S.w / 2, y + 22);
    ctx.restore();
  },

  // Stellung der senkrechten Strecke merken, relativ zum Kreis (erst, wenn sie gedreht wurde)
  bild: function (Z) {
    if (!Z.dreh) return null;
    var K = kreis();
    return { v: 3, p: [(Z.p[0] - K.m[0]) / K.r, (Z.p[1] - K.m[1]) / K.r] };
  },
  ausBild: function (Z, b) {
    if (b.v !== 3) return;   // Zeichnung aus einer früheren Fassung des Levels: neu anfangen
    var K = kreis();
    Z.p = [K.m[0] + b.p[0] * K.r, K.m[1] + b.p[1] * K.r];
    Z.letzte = Math.atan2(Z.p[1] - K.m[1], Z.p[0] - K.m[0]);
    Z.schritt = 2;   // Schritte schon gesehen
  }
});
})();
