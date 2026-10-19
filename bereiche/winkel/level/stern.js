// Level: Zwei Sterne nacheinander, zuerst der Fünfstern, dann der Achtstern (jede Ecke mit der drittnächsten verbunden).
// Ein regelmäßiges Vieleck steht dünn in Grau da, jedes Antippen zieht die nächste Linie des Sterns in Tinte.
// Ist der Stern fertig, zeigt die obere Ecke den Innenwinkel des Vielecks (grau, mit Zahl) und die Spitze des Sterns
// (braun, mit ?). Die Linien aus einer Ecke teilen den Innenwinkel in gleiche Teile von je 180°/n:
// Fünfeck 108° = 3 × 36°, die Spitze ist ein Teil (36°); Achteck 135° = 6 × 22,5°, die Spitze ist zwei Teile (45°).
// Die Zahl schreibt man ins Schreibfeld. Richtig: alle Spitzen bekommen ihre Zahl.
// Antippen bringt den nächsten Stern. Gelöst nach dem Achtstern.
(function () {
var App = window.App, S = App.S, C = App.C;
// n Ecken, jede Ecke mit der m-ten nächsten verbunden, Winkel in der Spitze, Innenwinkel des Vielecks,
// rg Radius des grauen Innenwinkels (Anteil am Umkreis)
var STERNE = [{ n: 5, m: 2, spitze: 36, innen: 108, rg: 0.47 }, { n: 8, m: 3, spitze: 45, innen: 135, rg: 0.6 }];

var TEXT = {
  frageFeld: { de: 'Wie groß ist der Winkel in einer Spitze?', en: 'How big is the angle in one point of the star?', fi: 'Kuinka suuri on kulma yhdessä kärjessä?', tr: 'Bir uçtaki açı kaç derece?', fr: 'Combien mesure l’angle d’une pointe ?', es: '¿Cuánto mide el ángulo de una punta?', ja: '1つの先の角は何度かな？', ar: 'كم قياس الزاوية في رأس واحد؟' },
  linie: { de: 'Tippe für die nächste Linie', en: 'Tap for the next line', fi: 'Napauta, niin tulee seuraava viiva',
           tr: 'Sonraki çizgi için dokun', fr: 'Touche l’écran pour la ligne suivante', es: 'Toca para la siguiente línea',
           ja: 'タップすると次の線', ar: 'انقر للخط التالي' },
  weiter: { de: 'Tippe für den nächsten Stern', en: 'Tap for the next star', fi: 'Napauta, niin tulee seuraava tähti',
            tr: 'Sonraki yıldız için dokun', fr: 'Touche l’écran pour l’étoile suivante', es: 'Toca para la siguiente estrella',
            ja: 'タップすると次の星', ar: 'انقر للنجمة التالية' },
  falsch: [
    { de: 'Noch nicht. Die Linien aus einer Ecke teilen den Innenwinkel 108° in drei gleiche Teile.',
      en: 'Not yet. The lines from one corner split the inside angle of 108° into three equal parts.',
      fi: 'Ei vielä. Yhdestä kärjestä lähtevät viivat jakavat 108° sisäkulman kolmeen yhtä suureen osaan.',
      tr: 'Henüz değil. Bir köşeden çıkan çizgiler 108°’lik iç açıyı üç eşit parçaya böler.',
      fr: 'Pas encore. Les lignes qui partent d’un coin partagent l’angle intérieur de 108° en trois parts égales.',
      es: 'Todavía no. Las líneas que salen de una esquina dividen el ángulo interior de 108° en tres partes iguales.',
      ja: 'まだです。1つの角から出る線は、108°の内角を3つの同じ大きさに分けます。',
      ar: 'ليس بعد. الخطوط الخارجة من زاوية واحدة تقسم الزاوية الداخلية 108° إلى ثلاثة أجزاء متساوية.' },
    { de: 'Noch nicht. Die Linien aus der Ecke teilen 135° in 6 gleiche Teile. Die Spitze ist 2 davon.',
      en: 'Not yet. The lines from the corner split 135° into 6 equal parts. The point is 2 of them.',
      fi: 'Ei vielä. Kärjestä lähtevät viivat jakavat 135° kuuteen yhtä suureen osaan. Sakara on niistä 2.',
      tr: 'Henüz değil. Köşeden çıkan çizgiler 135°’yi 6 eşit parçaya böler. Uç bunların 2 tanesidir.',
      fr: 'Pas encore. Les lignes qui partent du coin partagent 135° en 6 parts égales. La pointe en fait 2.',
      es: 'Todavía no. Las líneas que salen de la esquina dividen 135° en 6 partes iguales. La punta es 2 de ellas.',
      ja: 'まだです。角から出る線は135°を6つの同じ大きさに分けます。星の先はそのうちの2つ分です。',
      ar: 'ليس بعد. الخطوط الخارجة من الزاوية تقسم 135° إلى 6 أجزاء متساوية. الرأس جزءان منها.' }
  ]
};

// Höhe der ersten von z Textzeilen unten. Ist die grüne Karte höher als gedacht (lange Texte, schmale Ansicht),
// rücken die Zeilen über sie (textY rechnet mit einer festen Höhe der Karte).
function zeilenY(z) {
  var y = App.winkel.textY(z), f = document.getElementById('fertig');
  if (f && !f.hidden && document.body.classList.contains('geschafft')) y = Math.min(y, f.getBoundingClientRect().top - 12 - 22 * z);
  return y;
}
// Ecken des Vielecks, Spitze oben, in der Bildmitte. R Umkreis, h Höhe einer Sternspitze (Ecke bis zur Einbuchtung)
function ecken(s) {
  var H = App.winkel, St = STERNE[s], n = St.n, P = H.platz(2), oben = P.oben, ende = Math.min(P.unten, zeilenY(2) - 30);
  // Bei offener Frage stehen unten keine Textzeilen: das Bild darf bis knapp über das Schreibfeld reichen
  if (H.feldOffen()) { oben -= 14; ende = H.feldOben() - 14; }
  if (ende < oben + 140) ende = oben + 140;
  P = { my: (oben + ende) / 2, h: ende - oben };
  var R = Math.max(60, Math.min(S.w * 0.42, P.h / 2 - 4));
  var unten = R * Math.cos(Math.PI / n), cy = P.my + (R - unten) / 2, p = [];
  for (var i = 0; i < n; i++) {
    var a = Math.PI / 2 + i * 2 * Math.PI / n;
    p.push([S.w / 2 + R * Math.cos(a), cy - R * Math.sin(a)]);
  }
  var rc = R * Math.cos(Math.PI * St.m / n) / Math.cos(Math.PI * (St.m - 1) / n);
  return { p: p, R: R, h: R - rc * Math.cos(Math.PI / n) };
}
// Kleinerer Winkel zwischen zwei Richtungen: Anfang und Weite (mathematisch, gegen den Uhrzeigersinn)
function zwischen(d1, d2) {
  var T = App.winkel.TAU, sw = ((d2 - d1) % T + T) % T;
  return sw <= Math.PI ? [d1, sw] : [d2, T - sw];
}
function fertig(Z) { return Z.j >= STERNE[Z.s].n; }
function start(Z) {
  if (!fertig(Z) || Z.ok) return;
  App.winkel.frage(STERNE[Z.s].spitze, TEXT.falsch[Z.s], function () {
    Z.ok = true;
    if (Z.s === STERNE.length - 1) App.winkel.geschafft();
  }, { text: TEXT.frageFeld });
}

App.level('winkel', {
  id: 'stern',
  text: {
    de: { title: 'Sterne',
          task: 'Tippe, um den Stern zu zeichnen. Wie groß ist der Winkel in einer Spitze? Schreib die Zahl ins Feld.',
          done: 'Die Spitzen eines Fünfsterns sind 36°, die eines Achtsterns 45°. Die Linien aus einer Ecke teilen den Winkel in gleiche Teile.' },
    en: { title: 'Stars',
          task: 'Tap to draw the star. How big is the angle in one point? Write the number in the box.',
          done: 'The points of a five-pointed star are 36°, those of an eight-pointed star 45°. The lines from one corner split the angle into equal parts.' },
    fi: { title: 'Tähdet',
          task: 'Napauta, niin tähti piirtyy. Kuinka suuri on kulma yhdessä sakarassa? Kirjoita luku kenttään.',
          done: 'Viisisakaraisen tähden sakarat ovat 36°, kahdeksansakaraisen 45°. Yhdestä kärjestä lähtevät viivat jakavat kulman yhtä suuriin osiin.' },
    tr: { title: 'Yıldızlar',
          task: 'Yıldızı çizmek için dokun. Bir ucundaki açı kaç derece? Sayıyı kutuya yaz.',
          done: 'Beş köşeli yıldızın uçları 36°, sekiz köşeli yıldızınkiler 45°. Bir köşeden çıkan çizgiler açıyı eşit parçalara böler.' },
    fr: { title: 'Étoiles',
          task: 'Touche l’écran pour dessiner l’étoile. Combien mesure l’angle d’une pointe ? Écris le nombre dans la case.',
          done: 'Les pointes d’une étoile à cinq branches mesurent 36°, celles d’une étoile à huit branches 45°. Les lignes qui partent d’un coin partagent l’angle en parts égales.' },
    es: { title: 'Estrellas',
          task: 'Toca para dibujar la estrella. ¿Cuánto mide el ángulo de una punta? Escribe el número en la casilla.',
          done: 'Las puntas de una estrella de cinco puntas miden 36°, las de una de ocho puntas 45°. Las líneas que salen de una esquina dividen el ángulo en partes iguales.' },
    ja: { title: '星',
          task: 'タップして星をかこう。星の先の角は何度かな？数を書いてね。',
          done: '五角の星の先は36°、八角の星の先は45°。1つの角から出る線は、角を同じ大きさに分けます。' },
    ar: { title: 'النجوم',
          task: 'انقر لترسم النجمة. كم قياس الزاوية في رأس واحد؟ اكتب العدد في المربع.',
          done: 'رؤوس النجمة الخماسية 36°، ورؤوس النجمة الثمانية 45°. الخطوط الخارجة من زاوية واحدة تقسم الزاوية إلى أجزاء متساوية.' }
  },
  werkzeuge: ['clear'],

  // s: welcher Stern, j: wie viele Linien gezogen, ok: Frage zu diesem Stern beantwortet
  neu: function (Z) { Z.s = 0; Z.j = 0; Z.ok = false; },
  start: start,

  down: function (Z) {
    if (!fertig(Z)) { Z.j++; start(Z); return; }   // Antippen: nächste Linie
    if (Z.ok && Z.s < STERNE.length - 1) { Z.s++; Z.j = 0; Z.ok = false; }   // nächster Stern
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, St = STERNE[Z.s], n = St.n, m = St.m, E = ecken(Z.s), p = E.p;
    var fb = H.farben[1], fg = H.farben[2];
    function ecke(i) { return p[((i % n) + n) % n]; }
    // Vieleck dünn in Grau
    ctx.strokeStyle = fg.linie; ctx.lineWidth = 1.2 * ws * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    p.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
    ctx.closePath(); ctx.stroke();
    // Frage offen: Innenwinkel oben grau mit Zahl, die übrigen Linien aus der Ecke dünn gestrichelt
    var frage = fertig(Z) && !Z.ok, v = p[0];
    if (frage) {
      ctx.save(); ctx.setLineDash([5 * k, 5 * k]); ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 1.2 * ws * k;
      ctx.beginPath();
      for (var d = 2; d <= n - 2; d++) if (d !== m && d !== n - m) { ctx.moveTo(v[0], v[1]); ctx.lineTo(p[d][0], p[d][1]); }
      ctx.stroke(); ctx.restore();
      var iw = zwischen(H.richtung(v, p[1]), H.richtung(v, p[n - 1])), rG = E.R * St.rg;
      H.feld(ctx, v, rG, iw[0], iw[1], fg.fuell, fg.linie, ws);
    }
    // Spitzen: bei offener Frage nur oben (mit ?), danach alle mit Zahl; die Schrift erst nach den Linien
    var schrift = [];
    if (fertig(Z)) {
      for (var i = 0; i < n; i++) {
        if (frage && i) break;
        var c = p[i], w = zwischen(H.richtung(c, ecke(i + m)), H.richtung(c, ecke(i - m))), mid = w[0] + w[1] / 2;
        var rB = frage ? Math.min(E.h * 0.85, E.R * (St.rg - 0.07)) : E.h * 0.7, ra = frage ? rB * 0.68 : E.h * 0.48;
        H.feld(ctx, c, rB, w[0], w[1], frage ? 'rgba(166,112,58,0.38)' : fb.fuell, fb.linie, frage ? ws * 1.6 : ws);
        schrift.push([frage ? '?' : St.spitze + '°', c[0] + Math.cos(mid) * ra, c[1] - Math.sin(mid) * ra, frage ? 22 : 14]);
      }
    }
    // Linien des Sterns in Tinte: von oben aus immer zur m-ten nächsten Ecke
    ctx.strokeStyle = C.INK; ctx.lineWidth = 2.5 * ws * k;
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    for (var t = 1; t <= Z.j; t++) { var q = ecke(t * m); ctx.lineTo(q[0], q[1]); }
    ctx.stroke();
    ctx.fillStyle = C.INK;
    for (var u = 0; u <= Math.min(Z.j, n - 1); u++) App.dotAt(ctx, ecke(u * m), false);
    schrift.forEach(function (a) { App.text(ctx, a[0], a[1], a[2], fb.linie, a[3]); });
    // Zahl des Innenwinkels zuletzt, auf einem Stück Papier, damit die Linien sie nicht verdecken
    if (frage) {
      var ty = v[1] + E.R * St.rg + 14 * k;
      ctx.font = '400 ' + 16 * k + 'px ' + C.FONT;
      var tb = ctx.measureText(St.innen + '°').width + 8 * k;
      ctx.fillStyle = C.PARCH; ctx.fillRect(v[0] - tb / 2, ty - 10 * k, tb, 20 * k);
      App.text(ctx, St.innen + '°', v[0], ty, fg.linie, 16);
    }
  },

  // Unten: "Tippe für die nächste Linie", nach der Antwort "Tippe für den nächsten Stern"
  overlay: function (ctx, Z) {
    var letzter = Z.s === STERNE.length - 1;
    if (fertig(Z) && !Z.ok) return;
    ctx.save();
    if (!fertig(Z)) {
      ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
      ctx.fillText(App.wahl(TEXT.linie), S.w / 2, zeilenY(1));
      ctx.restore();
      return;
    }
    if (!letzter) {
      ctx.font = '400 14.5px ' + C.FONT; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = C.PENCIL;
      ctx.fillText(App.wahl(TEXT.weiter), S.w / 2, zeilenY(1));
    }
    ctx.restore();
  },

  bild: function (Z) { return (Z.s || Z.j) ? { v: 1, s: Z.s, j: Z.j, ok: Z.ok } : null; },
  ausBild: function (Z, b) {
    if (b.v !== 1 && b.v !== 2) return;   // v2 hatte noch den Stift, der ist wieder weg
    Z.s = Math.max(0, Math.min(STERNE.length - 1, b.s | 0));
    Z.j = Math.max(0, Math.min(STERNE[Z.s].n, b.j | 0));
    Z.ok = !!b.ok && Z.j >= STERNE[Z.s].n;
  }
});
})();
