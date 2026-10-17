// Level: Mittelsenkrechte von AB, Linie durch die Schnittpunkte zweier gleich großer Kreise um A und B.
App.level('euklid', {
  id: 'mittelsenkrechte',
  y: 0.45,   // Strecke AB etwas höher als sonst
  text: {
    de: { title: 'Mittelsenkrechte',
          task: 'Konstruiere die Mittelsenkrechte der Strecke AB. Benutze Zirkel und Linie.' },
    en: { title: 'Perpendicular bisector',
          task: 'Construct the perpendicular bisector of the segment AB. Use the compass and the line.' }
  },
  pruefen: function (A, B, s, tol) {
    var S = App.S, arcHas = App.euklid.arcHas;
    var ux = (B.x - A.x) / s, uy = (B.y - A.y) / s, ups = [], downs = [];
    S.circles.forEach(function (ca) {
      if (Math.hypot(ca.c.x - A.x, ca.c.y - A.y) > tol) return;
      S.circles.forEach(function (cb) {
        if (Math.hypot(cb.c.x - B.x, cb.c.y - B.y) > tol || Math.abs(ca.r - cb.r) > tol) return;
        var a = (ca.r * ca.r - cb.r * cb.r + s * s) / (2 * s);
        var h2 = ca.r * ca.r - a * a;
        if (h2 <= tol * tol) return;
        var h = Math.sqrt(h2), mx = A.x + ux * a, my = A.y + uy * a;
        [1, -1].forEach(function (sg) {
          var P = [mx - uy * h * sg, my + ux * h * sg];
          if (arcHas(ca, P, tol) && arcHas(cb, P, tol)) (sg > 0 ? ups : downs).push(P);
        });
      });
    });
    if (!ups.length || !downs.length) return false;
    function nearSeg(P, e) {
      var ax = e.a.x, ay = e.a.y, dx = e.b.x - ax, dy = e.b.y - ay, ln2 = dx * dx + dy * dy;
      if (ln2 < 1e-9) return false;
      var t = Math.max(0, Math.min(1, ((P[0] - ax) * dx + (P[1] - ay) * dy) / ln2));
      return Math.hypot(ax + t * dx - P[0], ay + t * dy - P[1]) <= tol;
    }
    return S.edges.some(function (e) {
      return !e.locked && ups.some(function (P) { return nearSeg(P, e); }) && downs.some(function (Q) { return nearSeg(Q, e); });
    });
  }
});
