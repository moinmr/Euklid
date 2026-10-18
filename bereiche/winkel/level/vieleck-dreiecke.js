// Level: Dreiecke im Vieleck. Drei regelmäßige Formen nacheinander (Quadrat, Fünfeck, Sechseck), eine Ecke oben.
// Jedes Antippen zieht die nächste Diagonale aus der oberen Ecke; jede schneidet ein Dreieck ab (abwechselnd braun
// und grau gefüllt, mit Nummer). Die kleinen Winkel an der oberen Ecke bekommen Feld und Zahl: alle gleich, 180° : n.
// Sind alle Diagonalen da, steht unten "n − 2 × 180° = ?". Das Quadrat ist das Beispiel (2 × 180° = 360°, ohne Frage),
// beim Fünfeck (540) und Sechseck (720) schreibt man die Summe ins Schreibfeld. Danach haben alle Innenwinkel ihre Zahl
// und darunter steht "540° : 5 = 108°". Antippen bringt die nächste Form. Gelöst nach der Antwort beim Sechseck.
(function () {
var App = window.App, S = App.S, C = App.C;
var FORMEN = [4, 5, 6];

var TEXT = {
  falsch: { de: 'Noch nicht. Jedes Dreieck hat zusammen 180°. Alle Dreiecke zusammen sind alle Winkel des Vielecks.',
            en: 'Not yet. Each triangle has 180° in total. All the triangles together are all the angles of the shape.',
            fi: 'Ei vielä. Jokaisen kolmion kulmat ovat yhteensä 180°. Kaikki kolmiot yhdessä ovat kaikki monikulmion kulmat.',
            tr: 'Henüz değil. Her üçgenin açıları toplam 180°. Bütün üçgenler birlikte çokgenin bütün açılarıdır.',
            fr: 'Pas encore. Chaque triangle a 180° en tout. Tous les triangles ensemble font tous les angles de la forme.',
            es: 'Todavía no. Cada triángulo tiene 180° en total. Todos los triángulos juntos son todos los ángulos de la forma.',
            ja: 'まだです。三角形1つの角を合わせると180°。全部の三角形を合わせると、多角形の角が全部そろいます。',
            ar: 'ليس بعد. مجموع زوايا كل مثلث 180°. كل المثلثات معًا هي كل زوايا المضلع.' },
  weiter: { de: 'Tippe für die nächste Form', en: 'Tap for the next shape', fi: 'Napauta, niin tulee seuraava muoto',
            tr: 'Sonraki şekil için dokun', fr: 'Touche l’écran pour la forme suivante', es: 'Toca para la siguiente forma',
            ja: 'タップすると次の形', ar: 'انقر للشكل التالي' }
};

function innen(n) { return 180 - 360 / n; }
// Höhe, um die eine Karte unten ins Bild ragt: die rote über dem Schreibfeld, oder die grüne, wenn sie auf einer
// schmalen Ansicht höher ist als vorgesehen. Bild und Textzeilen rücken so lange darüber.
function karte() {
  var H = App.winkel, rot = document.getElementById('falsch'), gruen = document.getElementById('fertig');
  if (rot && !rot.hidden && H.feldOffen()) {
    // nur, wenn darüber noch genug Platz bleibt; sonst liegt die Karte kurz über dem Bild
    var d = Math.max(0, H.feldOben() - 12 - rot.getBoundingClientRect().top + 6);
    return H.textY(1) - d - H.platz(1).oben < 150 ? 0 : d;
  }
  if (gruen && !gruen.hidden && !H.feldOffen() && document.body.classList.contains('geschafft'))
    return Math.max(0, H.textY(3) + 22 * 3 - 8 - gruen.getBoundingClientRect().top);
  return 0;
}
// Ecken des regelmäßigen n-Ecks, Ecke 0 oben, gegen den Uhrzeigersinn. Die Form steht mittig im Bildbereich,
// rundherum bleibt Platz für die Zahlen der Innenwinkel außen an den Ecken.
function ecken(n, zahlen) {
  // oben vom Bildbereich, unten bis kurz über die erste Textzeile (auch wenn es am Handy mit Schreibfeld eng wird);
  // Rand für die Zahlen außen an den Ecken nur, wenn sie da sind
  var H = App.winkel, P = H.platz(H.feldOffen() ? 1 : 3), rand = zahlen ? 24 : 6;
  var h = (H.feldOffen() ? H.textY(1) : H.textY(3)) - 26 - karte() - P.oben - 2 * rand;
  var unten = 0, seite = 0;
  for (var i = 0; i < n; i++) {
    var w = Math.PI / 2 + i * 2 * Math.PI / n;
    unten = Math.max(unten, -Math.sin(w)); seite = Math.max(seite, Math.abs(Math.cos(w)));
  }
  var R = Math.max(30, Math.min((S.w / 2 - 40) / seite, h / (1 + unten)));
  var cy = P.oben + rand + Math.max(0, (h - R * (1 + unten)) / 2) + R, p = [];
  for (var j = 0; j < n; j++) {
    var a = Math.PI / 2 + j * 2 * Math.PI / n;
    p.push([S.w / 2 + R * Math.cos(a), cy - R * Math.sin(a)]);
  }
  return { p: p, R: R };
}
// Stand: Z.j Diagonalen gezogen; fertig, wenn alle n − 3 da sind
function fertig(Z) { return Z.j >= FORMEN[Z.form] - 3; }
// Dreiecke, die schon abgeschnitten sind (die letzte Diagonale schneidet zwei ab)
function dreiecke(Z) { var n = FORMEN[Z.form]; return fertig(Z) ? n - 2 : Z.j; }
// Ergebnis zeigen: beim Quadrat sofort (Beispiel), sonst nach der richtigen Antwort
function ergebnis(Z) { return fertig(Z) && (Z.form === 0 || Z.ok); }
function offen(Z) { return fertig(Z) && Z.form > 0 && !Z.ok; }
function start(Z) {
  if (!offen(Z)) return;
  // wie App.winkel.frage, aber nach der roten Karte neu zeichnen, damit das Bild über die Karte rückt
  var H = App.winkel, richtig = (FORMEN[Z.form] - 2) * 180;
  H.schreibfeld(function (t) {
    if (!t || t.indexOf('?') >= 0) { H.falsch(H.LESEN); App.render(); return; }
    if (Number(t) !== richtig) { H.falsch(TEXT.falsch); H.feldLeeren(); App.render(); return; }
    H.falschWeg(); H.feldWeg();
    Z.ok = true;
    if (Z.form === FORMEN.length - 1) H.geschafft();
    App.render();
  });
}
// Kleinerer Winkel zwischen zwei Richtungen: Anfang und Weite (mathematisch, gegen den Uhrzeigersinn)
function zwischen(d1, d2) {
  var T = App.winkel.TAU, sw = ((d2 - d1) % T + T) % T;
  return sw <= Math.PI ? [d1, sw] : [d2, T - sw];
}

App.level('winkel', {
  id: 'vieleck-dreiecke',
  text: {
    de: { title: 'Dreiecke im Vieleck',
          task: 'Tippe: Linien aus der oberen Ecke teilen das Vieleck in Dreiecke. Wie groß sind alle Winkel zusammen? Schreib die Zahl ins Feld.',
          done: 'Linien aus einer Ecke teilen ein n-Eck in n − 2 Dreiecke. Darum sind alle Winkel zusammen (n − 2) × 180°. Die Winkel an der Ecke sind alle gleich groß.' },
    en: { title: 'Triangles in a polygon',
          task: 'Tap: lines from the top corner cut the shape into triangles. How big are all the angles together? Write the number in the box.',
          done: 'Lines from one corner cut a shape with n corners into n − 2 triangles. So all the angles together are (n − 2) × 180°. The angles at that corner are all the same size.' },
    fi: { title: 'Kolmiot monikulmiossa',
          task: 'Napauta: viivat yläkulmasta jakavat monikulmion kolmioiksi. Kuinka suuret kaikki kulmat ovat yhteensä? Kirjoita luku kenttään.',
          done: 'Viivat yhdestä kulmasta jakavat n-kulmion n − 2 kolmioksi. Siksi kaikki kulmat ovat yhteensä (n − 2) × 180°. Kulmat siinä kulmassa ovat kaikki yhtä suuret.' },
    tr: { title: 'Çokgendeki üçgenler',
          task: 'Dokun: üst köşeden çıkan çizgiler çokgeni üçgenlere böler. Bütün açıların toplamı kaç derece? Sayıyı kutuya yaz.',
          done: 'Bir köşeden çıkan çizgiler n köşeli bir çokgeni n − 2 üçgene böler. Bu yüzden bütün açıların toplamı (n − 2) × 180°. O köşedeki açıların hepsi eşittir.' },
    fr: { title: 'Des triangles dans le polygone',
          task: 'Touche : des lignes partant du coin du haut découpent la forme en triangles. Combien font tous les angles ensemble ? Écris le nombre dans la case.',
          done: 'Des lignes partant d’un coin découpent une forme à n coins en n − 2 triangles. Donc tous les angles ensemble font (n − 2) × 180°. Les angles à ce coin sont tous égaux.' },
    es: { title: 'Triángulos en el polígono',
          task: 'Toca: las líneas desde la esquina de arriba dividen la forma en triángulos. ¿Cuánto suman todos los ángulos? Escribe el número en la casilla.',
          done: 'Las líneas desde una esquina dividen una forma de n esquinas en n − 2 triángulos. Por eso todos los ángulos juntos suman (n − 2) × 180°. Los ángulos en esa esquina son todos iguales.' },
    ja: { title: '多角形の中の三角形',
          task: 'タップしよう：上の角から引いた線で、多角形が三角形に分かれます。角を全部合わせると何度かな？数を書こう。',
          done: '1つの角から線を引くと、n角形はn − 2個の三角形に分かれます。だから角を全部合わせると(n − 2) × 180°。その角のところの角はみんな同じ大きさです。' },
    ar: { title: 'مثلثات داخل المضلع',
          task: 'انقر: خطوط من الزاوية العليا تقسم المضلع إلى مثلثات. كم مجموع كل الزوايا؟ اكتب العدد في المربع.',
          done: 'خطوط من زاوية واحدة تقسم مضلعًا له n زاوية إلى n − 2 مثلثات. لذلك مجموع كل الزوايا (n − 2) × 180°. والزوايا عند تلك الزاوية كلها متساوية.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) { Z.form = 0; Z.j = 0; Z.ok = false; },
  start: start,

  down: function (Z) {
    if (!fertig(Z)) { Z.j++; start(Z); return; }                                       // nächste Diagonale
    if (ergebnis(Z) && Z.form < FORMEN.length - 1) { Z.form++; Z.j = 0; Z.ok = false; }  // nächste Form
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, n = FORMEN[Z.form], E = ecken(n, ergebnis(Z)), p = E.p, top = p[0];
    var fb = H.farben[1], fg = H.farben[2], d = dreiecke(Z), klein = 180 / n;
    // Dreiecke (Ecke 0, Ecke t, Ecke t+1), abwechselnd braun und grau gefüllt, mit Nummer in der Mitte
    for (var t = 1; t <= d; t++) {
      var a = p[t], b = p[t + 1];
      ctx.fillStyle = t % 2 ? fb.fuell : fg.fuell;
      ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.closePath(); ctx.fill();
    }
    // Umriss und Diagonalen in Tinte
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5 * ws * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    p.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
    ctx.closePath(); ctx.stroke();
    for (var g = 1; g <= Z.j; g++) {
      ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(p[g + 1][0], p[g + 1][1]); ctx.stroke();
    }
    // Innenwinkel an allen Ecken (Tinte): während der Frage nur die Felder, danach mit Zahl außen an der Ecke
    // (innen liegen dort die Diagonalen und die kleinen Winkel)
    if (fertig(Z)) {
      var ri = Math.max(18 * k, E.R * 0.17);
      for (var i = 0; i < n; i++) {
        var c = p[i], w = zwischen(H.richtung(c, p[(i + 1) % n]), H.richtung(c, p[(i + n - 1) % n])), mid = w[0] + w[1] / 2;
        if (i > 0) H.feld(ctx, c, ri, w[0], w[1], H.farben[0].fuell, H.farben[0].linie, ws);
        if (ergebnis(Z)) App.text(ctx, innen(n) + '°', c[0] - Math.cos(mid) * 17 * k, c[1] + Math.sin(mid) * 17 * k, ink, 15);
      }
    }
    // Die kleinen Winkel an der oberen Ecke: Feld in der Farbe des Dreiecks, alle 180° : n
    var eng = E.R < 80, rt = Math.max((eng ? 14 : 30) * k, E.R * 0.3), rl = rt + (eng ? 15 : 21) * k;
    for (var u = 1; u <= d; u++) {
      var f = u % 2 ? fb : fg, ww = zwischen(H.richtung(top, p[u]), H.richtung(top, p[u + 1])), m = ww[0] + ww[1] / 2;
      H.feld(ctx, top, rt, ww[0], ww[1], u % 2 ? 'rgba(166,112,58,0.42)' : 'rgba(115,115,122,0.40)', f.linie, ws);
      if (E.R >= 60) App.text(ctx, klein + '°', top[0] + Math.cos(m) * rl, top[1] - Math.sin(m) * rl, f.linie, eng ? 12 : 14);
      // Nummer des Dreiecks in seinem Schwerpunkt
      var sx = (top[0] + p[u][0] + p[u + 1][0]) / 3, sy = (top[1] + p[u][1] + p[u + 1][1]) / 3;
      sy = Math.max(sy, top[1] + rl + (eng ? 14 : 22) * k);
      App.text(ctx, String(u), sx, sy, C.PENCIL, eng ? 13 : 16);
    }
  },

  // Unten: 3 × 180° = ? bzw. = 540°, danach 540° : 5 = 108° und der Hinweis auf die nächste Form
  overlay: function (ctx, Z) {
    var H = App.winkel, n = FORMEN[Z.form];
    if (!fertig(Z)) return;
    var y = (H.feldOffen() ? H.textY(1) : H.textY(3)) - karte(), summe = (n - 2) * 180, zeigen = ergebnis(Z);
    H.zeile(ctx, [{ t: (n - 2) + ' × ', c: C.INK }, { t: '180°', c: C.INK }, { t: ' = ', c: C.INK },
                  { t: zeigen ? summe + '°' : '?', c: C.INK }], y, zeigen ? 20 : 22);
    if (!zeigen) return;
    H.zeile(ctx, [{ t: summe + '° : ' + n + ' = ', c: C.INK }, { t: innen(n) + '°', c: C.INK }], y + 25);
    if (Z.form < FORMEN.length - 1) {
      ctx.save();
      ctx.font = '400 14.5px ' + C.FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.PENCIL;
      ctx.fillText(App.wahl(TEXT.weiter), S.w / 2, y + 49);
      ctx.restore();
    }
  },

  bild: function (Z) { return (Z.form || Z.j) ? { v: 1, form: Z.form, j: Z.j, ok: Z.ok } : null; },
  ausBild: function (Z, b) { if (b.v === 1) { Z.form = b.form; Z.j = b.j; Z.ok = b.ok; } }
});
})();
