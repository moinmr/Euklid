// Level: Winkel übertragen (Euklid I.23). Der feste Winkel bei D zwischen DE und DF wird an AB in A angetragen.
// Kreis um D schneidet die Schenkel in Q und R, gleich großer Kreis um A schneidet AB in P,
// Kreis um P mit Radius QR schneidet den Kreis um A in X, die Linie von A durch X gibt den Winkel.
App.level('euklid', {
  id: 'winkel-uebertragen',
  y: 0.30,   // Strecke AB tiefer, darüber der feste Winkel
  punkte: (function () {
    var D = [0.15, -1.2], r = 0.9, a = 15 * Math.PI / 180, b = -40 * Math.PI / 180;   // Winkel 55°, schräg gedreht
    return { D: D,
             E: [D[0] + r * Math.cos(a), D[1] + r * Math.sin(a)],
             F: [D[0] + r * Math.cos(b), D[1] + r * Math.sin(b)] };
  })(),
  kanten: [['D', 'E'], ['D', 'F']],
  text: {
    de: { title: 'Winkel übertragen',
          task: 'Übertrage den Winkel bei D an die Strecke AB, mit der Spitze in A. Benutze Zirkel und Linie.' },
    en: { title: 'Copy an angle',
          task: 'Copy the angle at D onto the segment AB, with its vertex at A. Use the compass and the line.' },
    fi: { title: 'Kulman siirtäminen',
          task: 'Siirrä kulma D janalle AB niin, että sen kärki on A:ssa. Käytä harppia ja viivaa.' },
    tr: { title: 'Açı aktarma',
          task: 'D’deki açıyı, köşesi A’da olacak şekilde AB doğru parçasına aktar. Pergel ve çizgiyi kullan.' },
    fr: { title: 'Reporter un angle',
          task: 'Reporte l’angle en D sur le segment AB, avec son sommet en A. Utilise le compas et la ligne.' },
    es: { title: 'Copiar un ángulo',
          task: 'Copia el ángulo en D sobre el segmento AB, con el vértice en A. Usa el compás y la línea.' },
    ja: { title: '角を写す',
          task: 'Dの角を、頂点がAになるように線分ABに写しましょう。コンパスと線を使います。' },
    ar: { title: 'نقل زاوية',
          task: 'انقل الزاوية عند D إلى القطعة AB بحيث يكون رأسها في A. استخدم الفرجار والخط.' }
  },
  pruefen: function (A, B, s, tol) {
    var S = App.S, arcHas = App.euklid.arcHas;
    var fest = {};
    S.base.forEach(function (v) { fest[v.name] = v; });
    var D = fest.D, E = fest.E, F = fest.F;
    function dir(P, Q) { var d = Math.hypot(Q.x - P.x, Q.y - P.y); return [(Q.x - P.x) / d, (Q.y - P.y) / d, d]; }
    var de = dir(D, E), df = dir(D, F), ab = dir(A, B);
    var near = function (c, P) { return Math.hypot(c.c.x - P[0], c.c.y - P[1]) <= tol; };
    var xs = [];
    // 1. Kreis um D, der beide Schenkel trifft: Q auf DE, R auf DF
    S.circles.forEach(function (cd) {
      if (!near(cd, [D.x, D.y]) || cd.r < 2 * tol || cd.r > Math.min(de[2], df[2]) + tol) return;
      var Q = [D.x + de[0] * cd.r, D.y + de[1] * cd.r], R = [D.x + df[0] * cd.r, D.y + df[1] * cd.r];
      if (!arcHas(cd, Q, tol) || !arcHas(cd, R, tol)) return;
      var qr = Math.hypot(R[0] - Q[0], R[1] - Q[1]);
      // 2. gleich großer Kreis um A, trifft AB in P
      S.circles.forEach(function (ca) {
        if (ca === cd || !near(ca, [A.x, A.y]) || Math.abs(ca.r - cd.r) > tol || ca.r > s + tol) return;
        var P = [A.x + ab[0] * ca.r, A.y + ab[1] * ca.r];
        if (!arcHas(ca, P, tol)) return;
        // 3. Kreis um P mit der Öffnungsweite QR, Schnittpunkt X mit dem Kreis um A
        S.circles.forEach(function (cp) {
          if (cp === ca || cp === cd || !near(cp, P) || Math.abs(cp.r - qr) > tol) return;
          var dx = cp.c.x - ca.c.x, dy = cp.c.y - ca.c.y, d = Math.hypot(dx, dy);
          if (d < 1e-6) return;
          var a = (ca.r * ca.r - cp.r * cp.r + d * d) / (2 * d), h2 = ca.r * ca.r - a * a;
          if (h2 < 0) return;
          var h = Math.sqrt(h2), mx = ca.c.x + dx / d * a, my = ca.c.y + dy / d * a;
          [1, -1].forEach(function (sg) {
            var X = [mx - dy / d * h * sg, my + dx / d * h * sg];
            if (arcHas(ca, X, tol) && arcHas(cp, X, tol)) xs.push(X);
          });
        });
      });
    });
    if (!xs.length) return false;
    // 4. eine eigene Linie von A durch X (beide Seiten von AB zählen)
    function nearSeg(P, e) {
      var ax = e.a.x, ay = e.a.y, dx = e.b.x - ax, dy = e.b.y - ay, ln2 = dx * dx + dy * dy;
      if (ln2 < 1e-9) return false;
      var t = Math.max(0, Math.min(1, ((P[0] - ax) * dx + (P[1] - ay) * dy) / ln2));
      return Math.hypot(ax + t * dx - P[0], ay + t * dy - P[1]) <= tol;
    }
    return S.edges.some(function (e) {
      return !e.locked && nearSeg([A.x, A.y], e) && xs.some(function (X) { return nearSeg(X, e); });
    });
  }
});
