// Level: Eine Strecke zeichnen, aus ihrer Mitte eine zweite Strecke. Die zweite Strecke lässt sich drehen,
// die drei Winkel um die Mitte ändern sich mit, ihre Summe bleibt 360° (eine volle Umdrehung).
// Gelöst, wenn die zweite Strecke insgesamt um mindestens 120° gedreht wurde.
(function () {
var App = window.App, S = App.S, C = App.C;
var DREH_NOETIG = 120;   // Grad
var MIN_LAENGE = 40;     // px, kürzere Striche zählen nicht als Strecke

var TEXT = {
  falsch: { de: 'Die zweite Strecke muss in der Mitte der ersten beginnen.',
            en: 'The second segment has to start at the midpoint of the first one.',
            fi: 'Toisen janan täytyy alkaa ensimmäisen janan keskipisteestä.',
            tr: 'İkinci doğru parçası, birincinin orta noktasından başlamalı.',
            fr: 'Le deuxième segment doit partir du milieu du premier.',
            es: 'El segundo segmento tiene que empezar en el punto medio del primero.',
            ja: '2本目の線分は、1本目の線分の真ん中から始めよう。',
            ar: 'يجب أن تبدأ القطعة الثانية من منتصف القطعة الأولى.' },
  umdrehung: { de: 'eine volle Umdrehung', en: 'one full turn', fi: 'yksi täysi kierros', tr: 'tam bir tur',
               fr: 'un tour complet', es: 'una vuelta completa', ja: 'ちょうど1回転', ar: 'دورة كاملة' }
};

function mitte(Z) { return [(Z.a[0] + Z.b[0]) / 2, (Z.a[1] + Z.b[1]) / 2]; }
function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
function anMitte(Z, w) { return Z.phase === 1 && abst(w, mitte(Z)) <= C.GRAB * S.k; }

// Die drei Winkel um die Mitte: Strahlen zur Ecke A, zur Ecke B und zum Ende P der zweiten Strecke
function winkel(Z) {
  var H = App.winkel, m = mitte(Z);
  var st = [{ n: 'a', d: H.richtung(m, Z.a) }, { n: 'b', d: H.richtung(m, Z.b) }, { n: 'p', d: H.richtung(m, Z.p) }];
  st.sort(function (x, y) { return x.d - y.d; });
  var out = st.map(function (s, i) {
    var t = st[(i + 1) % 3], sw = t.d - s.d;
    if (sw <= 0) sw += H.TAU;
    var paar = s.n + t.n;
    // Farbe bleibt beim Drehen an ihrem Winkel: zwischen A und B grau, an A Tinte, an B Braun
    var f = (paar === 'ab' || paar === 'ba') ? 2 : (paar.indexOf('a') >= 0 ? 0 : 1);
    return { a0: s.d, sw: sw, f: f, grad: sw * 180 / Math.PI };
  });
  var r = H.runden(out.map(function (w) { return w.grad; }), 360);
  out.forEach(function (w, i) { w.zahl = r[i]; });
  return out.sort(function (x, y) { return x.f - y.f; });
}

function drehen(Z, w) {
  var m = mitte(Z);
  if (abst(m, w) < 20 * S.k) return;
  var d = Math.atan2(w[1] - m[1], w[0] - m[0]);
  if (Z.letzte !== null) {
    var dd = d - Z.letzte;
    dd = ((dd + Math.PI) % App.winkel.TAU + App.winkel.TAU) % App.winkel.TAU - Math.PI;
    Z.dreh += Math.abs(dd) * 180 / Math.PI;
  }
  Z.letzte = d;
  Z.p = [w[0], w[1]];
  if (Z.dreh >= DREH_NOETIG) App.winkel.geschafft();
}

// Neue Strecke von s nach e
function streckeFertig(Z, s, e) {
  if (abst(s, e) < MIN_LAENGE * S.k) return;
  if (Z.phase === 0) { Z.a = s; Z.b = e; Z.phase = 1; }
  else if (Z.phase === 1) { Z.p = e; Z.phase = 2; Z.letzte = null; Z.dreh = 0; drehen(Z, e); }
}

App.level('winkel', {
  id: 'volle-umdrehung',
  text: {
    de: { title: 'Eine volle Umdrehung',
          task: 'Zeichne eine Strecke. Zeichne dann aus ihrer Mitte eine zweite Strecke. Bewege die zweite Strecke und schau auf die drei Winkel.',
          done: 'Richtig! Die drei Winkel ergeben zusammen immer 360°. Das ist eine volle Umdrehung.' },
    en: { title: 'One full turn',
          task: 'Draw a segment. Then draw a second segment from its midpoint. Move the second segment and watch the three angles.',
          done: 'Right! The three angles always add up to 360°. That is one full turn.' },
    fi: { title: 'Yksi täysi kierros',
          task: 'Piirrä jana. Piirrä sitten sen keskipisteestä toinen jana. Liikuta toista janaa ja katso kolmea kulmaa.',
          done: 'Oikein! Kolme kulmaa ovat yhteensä aina 360°. Se on yksi täysi kierros.' },
    tr: { title: 'Tam bir tur',
          task: 'Bir doğru parçası çiz. Sonra orta noktasından ikinci bir doğru parçası çiz. İkinci doğru parçasını hareket ettir ve üç açıya bak.',
          done: 'Doğru! Üç açının toplamı her zaman 360°. Bu tam bir turdur.' },
    fr: { title: 'Un tour complet',
          task: 'Trace un segment. Puis trace un deuxième segment à partir de son milieu. Bouge le deuxième segment et regarde les trois angles.',
          done: 'Bravo ! Les trois angles font toujours 360° ensemble. C’est un tour complet.' },
    es: { title: 'Una vuelta completa',
          task: 'Dibuja un segmento. Después dibuja un segundo segmento desde su punto medio. Mueve el segundo segmento y mira los tres ángulos.',
          done: '¡Correcto! Los tres ángulos suman siempre 360°. Eso es una vuelta completa.' },
    ja: { title: 'ちょうど1回転',
          task: '線分を1本かこう。次に、その真ん中から2本目の線分をかこう。2本目を動かして、3つの角を見てみよう。',
          done: '正解！3つの角を合わせると、いつも360°。これがちょうど1回転です。' },
    ar: { title: 'دورة كاملة',
          task: 'ارسم قطعة مستقيمة. ثم ارسم من منتصفها قطعة ثانية. حرّك القطعة الثانية وانظر إلى الزوايا الثلاث.',
          done: 'صحيح! مجموع الزوايا الثلاث دائمًا 360°. هذه دورة كاملة.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) { Z.phase = 0; Z.a = Z.b = Z.p = null; Z.ls = null; Z.zug = null; Z.dreh = 0; Z.letzte = null; },

  down: function (Z, w) {
    if (Z.falsch) App.winkel.falschWeg();
    if (Z.phase === 2) { Z.zieht = true; drehen(Z, w); S.loupe = null; return; }
    var s = Z.ls || (anMitte(Z, w) ? mitte(Z) : [w[0], w[1]]);
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
    // Start der zweiten Strecke: nur in der Mitte der ersten
    if (Z.phase === 1 && !Z.ls) {
      var start = gezogen ? g.unten : w;
      if (!anMitte(Z, start)) { App.winkel.falsch(TEXT.falsch); return; }
    }
    if (Z.ls) { streckeFertig(Z, Z.ls, w); Z.ls = null; }        // zweites Tippen: Ende
    else if (gezogen) streckeFertig(Z, g.s, w);                   // in einem Zug gezogen
    else Z.ls = Z.phase === 1 ? mitte(Z) : [w[0], w[1]];          // erstes Tippen: Anfang
  },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, ws3 = Z.phase === 2 ? winkel(Z) : [];
    var m = Z.a ? mitte(Z) : null, r = 46 * k;
    ws3.forEach(function (w) { var f = H.farben[w.f]; H.feld(ctx, m, r, w.a0, w.sw, f.fuell, f.linie, ws); });
    if (Z.phase === 2) H.strecke(ctx, m, Z.p, ink, ws);
    if (Z.a) H.strecke(ctx, Z.a, Z.b, ink, ws);
    ws3.forEach(function (w) {
      // kleine Winkel: Zahl weiter außen und mit Pergament hinterlegt, damit sie nicht auf den Strecken liegt
      var mid = w.a0 + w.sw / 2, ra = r + (22 + Math.max(0, 30 - w.grad) * 1.6) * k;
      var lx = m[0] + Math.cos(mid) * ra, ly = m[1] - Math.sin(mid) * ra;
      if (w.grad < 30) { ctx.fillStyle = C.PARCH; App.dotAt(ctx, [lx, ly], false, 11); }
      App.text(ctx, w.zahl + '°', lx, ly, H.farben[w.f].linie, 15);
    });
    if (Z.phase >= 1) { ctx.fillStyle = ink; App.dotAt(ctx, mitte(Z), false, 5); }
    // Strecke, die gerade entsteht
    var s = Z.zug ? Z.zug.s : Z.ls;
    if (s) {
      var naheMitte = Z.phase === 1 && abst(s, mitte(Z)) < 1;
      if (naheMitte) { ctx.fillStyle = C.GREEN; App.dotAt(ctx, s, false, 11); }
      if (Z.zug && abst(s, Z.zug.e) > 4 * k) {
        ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 2 * ws * k; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(Z.zug.e[0], Z.zug.e[1]); ctx.stroke();
        ctx.fillStyle = C.PENCIL; App.dotAt(ctx, Z.zug.e, true);
      }
      ctx.fillStyle = naheMitte ? C.GREEN : C.PENCIL; App.dotAt(ctx, s, true);
    }
  },

  // Unten über der Leiste: 52° + 128° + 180° = 360°, darunter "eine volle Umdrehung"
  overlay: function (ctx, Z) {
    if (Z.phase !== 2) return;
    var H = App.winkel, ws = winkel(Z), y = S.h - (S.unten || 70) - (document.body.classList.contains('geschafft') ? 120 : 46);
    var teile = [];
    ws.forEach(function (w, i) {
      if (i) teile.push({ t: ' + ', c: C.INK });
      teile.push({ t: w.zahl + '°', c: H.farben[w.f].linie });
    });
    teile.push({ t: ' = 360°', c: C.INK });
    ctx.save();
    ctx.font = '400 20px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    var breite = teile.reduce(function (s, t) { return s + ctx.measureText(t.t).width; }, 0), x = (S.w - breite) / 2;
    teile.forEach(function (t) { ctx.fillStyle = t.c; ctx.fillText(t.t, x, y); x += ctx.measureText(t.t).width; });
    ctx.font = '400 14.5px ' + C.FONT; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
    ctx.fillText(App.wahl(TEXT.umdrehung), S.w / 2, y + 22);
    ctx.restore();
  },

  // Zeichnung merken, relativ zur Bildschirmgröße
  bild: function (Z) {
    if (!Z.phase) return null;
    function n(p) { return p ? [p[0] / S.w, p[1] / S.h] : null; }
    return { phase: Z.phase, a: n(Z.a), b: n(Z.b), p: n(Z.p) };
  },
  ausBild: function (Z, b) {
    function n(p) { return p ? [p[0] * S.w, p[1] * S.h] : null; }
    Z.phase = b.phase; Z.a = n(b.a); Z.b = n(b.b); Z.p = n(b.p);
  }
});
})();
