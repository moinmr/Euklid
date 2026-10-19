// Level: Winkelhalbierende des Winkels bei A zwischen AB und AC.
// Kreis um A schneidet beide Schenkel in P und Q, gleich große Kreise um P und Q schneiden sich in X,
// die Linie von A durch X halbiert den Winkel.
App.level('euklid', {
  id: 'winkelhalbierende',
  y: 0.30,   // Strecke AB tiefer, damit über ihr Platz für den Schenkel AC ist
  punkte: { C: [1.3 * Math.cos(70 * Math.PI / 180), -1.3 * Math.sin(70 * Math.PI / 180)] },   // C etwas weiter weg als B
  kanten: [['A', 'C']],
  text: {
    de: { title: 'Winkelhalbierende',
          task: 'Halbiere den Winkel bei A zwischen AB und AC. Benutze Zirkel und Linie.' },
    en: { title: 'Angle bisector',
          task: 'Bisect the angle at A between AB and AC. Use the compass and the line.' },
    fi: { title: 'Kulman puolittaja',
          task: 'Puolita kulma A janojen AB ja AC välissä. Käytä harppia ja viivaa.' },
    tr: { title: 'Açıortay',
          task: 'AB ile AC arasındaki A açısını ikiye böl. Pergel ve çizgiyi kullan.' },
    fr: { title: 'Bissectrice',
          task: 'Partage en deux l’angle en A entre AB et AC. Utilise le compas et la ligne.' },
    es: { title: 'Bisectriz',
          task: 'Divide en dos el ángulo en A entre AB y AC. Usa el compás y la línea.' },
    ja: { title: '角の二等分線',
          task: 'ABとACの間のAの角を二等分しましょう。コンパスと線を使います。' },
    ar: { title: 'منصف الزاوية',
          task: 'نصّف الزاوية عند A بين AB وAC. استخدم الفرجار والخط.' }
  },
  pruefen: function (A, B, s, tol) {
    var S = App.S, arcHas = App.euklid.arcHas;
    var Cp = S.base[2];
    var ux = (B.x - A.x) / s, uy = (B.y - A.y) / s;
    var sc = Math.hypot(Cp.x - A.x, Cp.y - A.y), vx = (Cp.x - A.x) / sc, vy = (Cp.y - A.y) / sc;
    var near = function (c, P) { return Math.hypot(c.c.x - P[0], c.c.y - P[1]) <= tol; };
    var xs = [];
    // 1. Kreis um A, der beide Schenkel trifft: P auf AB, Q auf AC
    S.circles.forEach(function (ca) {
      if (Math.hypot(ca.c.x - A.x, ca.c.y - A.y) > tol || ca.r < 2 * tol || ca.r > Math.min(s, sc) + tol) return;
      var P = [A.x + ux * ca.r, A.y + uy * ca.r], Q = [A.x + vx * ca.r, A.y + vy * ca.r];
      if (!arcHas(ca, P, tol) || !arcHas(ca, Q, tol)) return;
      // 2. gleich große Kreise um P und Q, ihr Schnittpunkt X (nicht A)
      S.circles.forEach(function (cp) {
        if (!near(cp, P)) return;
        S.circles.forEach(function (cq) {
          if (cq === cp || !near(cq, Q) || Math.abs(cp.r - cq.r) > tol) return;
          var dx = cq.c.x - cp.c.x, dy = cq.c.y - cp.c.y, d = Math.hypot(dx, dy);
          if (d < 1e-6) return;
          var a = (cp.r * cp.r - cq.r * cq.r + d * d) / (2 * d), h2 = cp.r * cp.r - a * a;
          if (h2 < 0) return;
          var h = Math.sqrt(h2), mx = cp.c.x + dx / d * a, my = cp.c.y + dy / d * a;
          [1, -1].forEach(function (sg) {
            var X = [mx - dy / d * h * sg, my + dx / d * h * sg];
            if (Math.hypot(X[0] - A.x, X[1] - A.y) < 3 * tol) return;
            if (arcHas(cp, X, tol) && arcHas(cq, X, tol)) xs.push(X);
          });
        });
      });
    });
    if (!xs.length) return false;
    // 3. eine eigene Linie durch A und X
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
