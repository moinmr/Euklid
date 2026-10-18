// Level: Ein Kreis ist eine volle Umdrehung (360°). Eine Strecke durch den Mittelpunkt teilt ihn in 2 × 180°.
// Eine zweite Strecke aus dem Mittelpunkt steht erst senkrecht (90° + 90° + 180°) und lässt sich dann am Griff drehen;
// die Winkel ändern sich mit, die Summe bleibt 360°. Gelöst nach insgesamt 120° Drehung.
(function () {
var App = window.App, S = App.S, C = App.C;
var DREH_NOETIG = 120;   // Grad
var MIN_LAENGE = 40;     // px, kürzere Striche zählen nicht als Strecke

var TEXT = {
  durch: { de: 'Die Strecke muss durch den Mittelpunkt des Kreises gehen.',
           en: 'The segment has to go through the centre of the circle.',
           fi: 'Janan täytyy kulkea ympyrän keskipisteen kautta.',
           tr: 'Doğru parçası çemberin merkezinden geçmeli.',
           fr: 'Le segment doit passer par le centre du cercle.',
           es: 'El segmento tiene que pasar por el centro del círculo.',
           ja: '線分は円の中心を通るようにかこう。',
           ar: 'يجب أن تمر القطعة بمركز الدائرة.' },
  mitte: { de: 'Die zweite Strecke muss im Mittelpunkt beginnen.',
           en: 'The second segment has to start at the centre.',
           fi: 'Toisen janan täytyy alkaa keskipisteestä.',
           tr: 'İkinci doğru parçası merkezden başlamalı.',
           fr: 'Le deuxième segment doit partir du centre.',
           es: 'El segundo segmento tiene que empezar en el centro.',
           ja: '2本目の線分は中心から始めよう。',
           ar: 'يجب أن تبدأ القطعة الثانية من المركز.' },
  umdrehung: { de: 'eine volle Umdrehung', en: 'one full turn', fi: 'yksi täysi kierros', tr: 'tam bir tur',
               fr: 'un tour complet', es: 'una vuelta completa', ja: 'ちょうど1回転', ar: 'دورة كاملة' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
// Kreis in der Bildmitte
function kreis() { return { m: [S.w / 2, S.h * 0.52], r: Math.max(70, Math.min(S.w * 0.3, S.h * 0.2)) }; }
function amMittelpunkt(w) { return abst(w, kreis().m) <= C.GRAB * S.k; }
// Abstand des Mittelpunkts von der Geraden durch s und e
function geradeAbst(s, e, m) {
  var dx = e[0] - s[0], dy = e[1] - s[1], n = Math.hypot(dx, dy) || 1;
  return Math.abs((m[0] - s[0]) * dy - (m[1] - s[1]) * dx) / n;
}

// Die Winkel um den Mittelpunkt, zwischen den Strahlen zu A, B (erste Strecke) und P (zweite Strecke)
function winkel(Z) {
  var H = App.winkel, m = kreis().m;
  if (Z.phase === 0) return [{ a0: 0, sw: H.TAU, f: 2, grad: 360, zahl: 360 }];
  var st = [{ n: 'a', d: H.richtung(m, Z.a) }, { n: 'b', d: H.richtung(m, Z.b) }];
  if (Z.phase === 2) st.push({ n: 'p', d: H.richtung(m, Z.p) });
  st.sort(function (x, y) { return x.d - y.d; });
  var out = st.map(function (s, i) {
    var t = st[(i + 1) % st.length], sw = t.d - s.d;
    if (sw <= 0) sw += H.TAU;
    var paar = s.n + t.n, f;
    // Farbe bleibt beim Drehen am Winkel: zwischen A und B grau, an A Tinte, an B Braun (zwei Hälften: Tinte und Grau)
    if (Z.phase === 1) f = paar === 'ab' ? 0 : 2;
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

// Neue Strecke von s nach e
function streckeFertig(Z, s, e) {
  if (abst(s, e) < MIN_LAENGE * S.k) return;
  var K = kreis(), m = K.m;
  if (Z.phase === 0) {
    if (geradeAbst(s, e, m) > C.GRAB * S.k) { App.winkel.falsch(TEXT.durch); return; }
    // genau durch den Mittelpunkt, gleich lang zu beiden Seiten, etwas länger als der Kreis
    var dx = e[0] - s[0], dy = e[1] - s[1], n = Math.hypot(dx, dy);
    var h = Math.max(abst(m, s), abst(m, e), K.r * 1.2);
    Z.a = [m[0] - dx / n * h, m[1] - dy / n * h];
    Z.b = [m[0] + dx / n * h, m[1] + dy / n * h];
    Z.phase = 1;
  } else if (Z.phase === 1) {
    // rastet senkrecht ein, auf der Seite, zu der der Finger zeigt: 90° + 90° + 180°
    var ux = Z.b[0] - Z.a[0], uy = Z.b[1] - Z.a[1], un = Math.hypot(ux, uy);
    var px = -uy / un, py = ux / un;
    if ((e[0] - m[0]) * px + (e[1] - m[1]) * py < 0) { px = -px; py = -py; }
    var len = Math.max(abst(m, e), K.r * 1.2);
    Z.p = [m[0] + px * len, m[1] + py * len];
    Z.phase = 2; Z.letzte = Math.atan2(py, px); Z.dreh = 0;
  }
}

App.level('winkel', {
  id: 'volle-umdrehung',
  text: {
    de: { title: 'Eine volle Umdrehung',
          task: 'Ein Kreis ist eine volle Umdrehung: 360°. Zeichne eine Strecke durch den Mittelpunkt. Zeichne dann aus dem Mittelpunkt eine zweite Strecke und dreh sie am Griff.',
          done: 'Richtig! Die Winkel um einen Punkt ergeben zusammen immer 360°. Das ist eine volle Umdrehung.' },
    en: { title: 'One full turn',
          task: 'A circle is one full turn: 360°. Draw a segment through the centre. Then draw a second segment from the centre and turn it by its handle.',
          done: 'Right! The angles around a point always add up to 360°. That is one full turn.' },
    fi: { title: 'Yksi täysi kierros',
          task: 'Ympyrä on yksi täysi kierros: 360°. Piirrä jana keskipisteen kautta. Piirrä sitten keskipisteestä toinen jana ja käännä sitä kahvasta.',
          done: 'Oikein! Pisteen ympärillä olevat kulmat ovat yhteensä aina 360°. Se on yksi täysi kierros.' },
    tr: { title: 'Tam bir tur',
          task: 'Bir çember tam bir turdur: 360°. Merkezden geçen bir doğru parçası çiz. Sonra merkezden ikinci bir doğru parçası çiz ve onu tutamağından döndür.',
          done: 'Doğru! Bir noktanın etrafındaki açıların toplamı her zaman 360°. Bu tam bir turdur.' },
    fr: { title: 'Un tour complet',
          task: 'Un cercle, c’est un tour complet : 360°. Trace un segment qui passe par le centre. Puis trace un deuxième segment à partir du centre et fais-le tourner par sa poignée.',
          done: 'Bravo ! Les angles autour d’un point font toujours 360° ensemble. C’est un tour complet.' },
    es: { title: 'Una vuelta completa',
          task: 'Un círculo es una vuelta completa: 360°. Dibuja un segmento que pase por el centro. Después dibuja un segundo segmento desde el centro y gíralo por su asa.',
          done: '¡Correcto! Los ángulos alrededor de un punto suman siempre 360°. Eso es una vuelta completa.' },
    ja: { title: 'ちょうど1回転',
          task: '円はちょうど1回転、360°です。中心を通る線分をかこう。次に、中心から2本目の線分をかいて、持ち手で回してみよう。',
          done: '正解！1つの点のまわりの角を合わせると、いつも360°。これがちょうど1回転です。' },
    ar: { title: 'دورة كاملة',
          task: 'الدائرة دورة كاملة: 360°. ارسم قطعة تمر بالمركز. ثم ارسم من المركز قطعة ثانية وأدِرها من مقبضها.',
          done: 'صحيح! مجموع الزوايا حول نقطة دائمًا 360°. هذه دورة كاملة.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) { Z.phase = 0; Z.a = Z.b = Z.p = null; Z.ls = null; Z.zug = null; Z.dreh = 0; Z.letzte = null; Z.zieht = false; },

  down: function (Z, w) {
    if (Z.falsch) App.winkel.falschWeg();
    if (Z.phase === 2) {
      // nur am Griff (Ende der zweiten Strecke)
      Z.zieht = abst(w, Z.p) <= C.GRAB * 1.3 * S.k;
      if (Z.zieht) drehen(Z, w);
      return;
    }
    var s = Z.ls || (Z.phase === 1 && amMittelpunkt(w) ? kreis().m : [w[0], w[1]]);
    Z.zug = { s: s, unten: [w[0], w[1]], e: [w[0], w[1]] };
    S.loupe = S.sp;
  },
  move: function (Z, w) {
    if (Z.phase === 2) { if (Z.zieht) drehen(Z, w); return; }
    if (Z.zug) { Z.zug.e = [w[0], w[1]]; S.loupe = S.sp; }
  },
  up: function (Z, w) {
    S.loupe = null;
    if (Z.phase === 2) { Z.zieht = false; return; }
    var g = Z.zug; Z.zug = null;
    if (!g) return;
    var gezogen = abst(g.unten, w) > MIN_LAENGE * S.k;
    // Start der zweiten Strecke: nur im Mittelpunkt
    if (Z.phase === 1 && !Z.ls && !amMittelpunkt(gezogen ? g.unten : w)) { App.winkel.falsch(TEXT.mitte); return; }
    if (Z.ls) { var s = Z.ls; Z.ls = null; streckeFertig(Z, s, w); }   // zweites Tippen: Ende
    else if (gezogen) streckeFertig(Z, g.s, w);                       // in einem Zug gezogen
    else Z.ls = Z.phase === 1 ? kreis().m : [w[0], w[1]];             // erstes Tippen: Anfang
  },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, K = kreis(), m = K.m, r = K.r;
    var wl = winkel(Z);
    wl.forEach(function (w) { var f = H.farben[w.f]; H.feld(ctx, m, r, w.a0, w.sw, f.fuell, f.linie, ws); });
    if (Z.phase === 2) H.strecke(ctx, m, Z.p, ink, ws);
    if (Z.a) H.strecke(ctx, Z.a, Z.b, ink, ws);
    ctx.fillStyle = ink; App.dotAt(ctx, m, false, 5);
    // Griff am Ende der zweiten Strecke
    if (Z.phase === 2) {
      ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k;
      ctx.beginPath(); ctx.arc(Z.p[0], Z.p[1], 15 * k, 0, H.TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
    }
    wl.forEach(function (w) {
      var col = H.farben[w.f].linie, lx, ly;
      if (Z.phase === 0) { lx = m[0]; ly = m[1] - r * 0.45; }
      else {
        // Zahl im Winkelfeld; kleine Winkel außerhalb des Kreises, mit Pergament hinterlegt
        var mid = w.a0 + w.sw / 2, ra = w.grad >= 40 ? r * 0.6 : r + (22 + Math.max(0, 30 - w.grad) * 1.6) * k;
        lx = m[0] + Math.cos(mid) * ra; ly = m[1] - Math.sin(mid) * ra;
        if (w.grad < 40) { ctx.fillStyle = C.PARCH; App.dotAt(ctx, [lx, ly], false, 11); }
      }
      App.text(ctx, w.zahl + '°', lx, ly, col, 17);
    });
    // Strecke, die gerade entsteht
    var s = Z.zug ? Z.zug.s : Z.ls;
    if (s) {
      var amM = Z.phase === 1 && abst(s, m) < 1;
      if (Z.zug && abst(s, Z.zug.e) > 4 * k) {
        ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 2 * ws * k; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(Z.zug.e[0], Z.zug.e[1]); ctx.stroke();
        ctx.fillStyle = C.PENCIL; App.dotAt(ctx, Z.zug.e, true);
      }
      ctx.fillStyle = amM ? C.GREEN : C.PENCIL; App.dotAt(ctx, s, true);
    }
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

  // Zeichnung merken, relativ zum Kreis
  bild: function (Z) {
    if (!Z.phase) return null;
    var K = kreis();
    function n(p) { return p ? [(p[0] - K.m[0]) / K.r, (p[1] - K.m[1]) / K.r] : null; }
    return { v: 2, phase: Z.phase, a: n(Z.a), b: n(Z.b), p: n(Z.p) };
  },
  ausBild: function (Z, b) {
    if (b.v !== 2) return;   // Zeichnung aus der ersten Fassung des Levels: neu anfangen
    var K = kreis();
    function n(p) { return p ? [K.m[0] + p[0] * K.r, K.m[1] + p[1] * K.r] : null; }
    Z.phase = b.phase; Z.a = n(b.a); Z.b = n(b.b); Z.p = n(b.p);
  }
});
})();
