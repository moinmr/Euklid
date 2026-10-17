// Level: Regelmäßiges Sechseck über AB, jede neue Ecke liegt auf einem Zirkelbogen.
App.level('euklid', {
  id: 'sechseck',
  text: {
    de: { title: 'Sechseck',
          task: 'Konstruiere über der Strecke AB ein regelmäßiges Sechseck. Benutze Zirkel und Linie.' },
    en: { title: 'Hexagon',
          task: 'Construct a regular hexagon on the segment AB. Use the compass and the line.' },
    fi: { title: 'Kuusikulmio',
          task: 'Piirrä janalle AB säännöllinen kuusikulmio. Käytä harppia ja viivaa.' },
    tr: { title: 'Altıgen',
          task: 'AB doğru parçası üzerine düzgün bir altıgen çiz. Pergel ve çizgiyi kullan.' },
    fr: { title: 'Hexagone',
          task: 'Construis un hexagone régulier sur le segment AB. Utilise le compas et la ligne.' },
    es: { title: 'Hexágono',
          task: 'Construye un hexágono regular sobre el segmento AB. Usa el compás y la línea.' },
    ja: { title: '六角形',
          task: '線分ABの上に正六角形を作図しましょう。コンパスと線を使います。' },
    ar: { title: 'سداسي',
          task: 'أنشئ سداسيًا منتظمًا على القطعة AB. استخدم الفرجار والخط.' }
  },
  pruefen: function (A, B, s, tol) {
    var E = App.euklid, vp = App.vp, unit = App.unit;
    var adj = E.adjacency(), cycles = [];
    function dfs(path) {
      var last = path[path.length - 1];
      if (path.length === 6) { if (adj.get(last) && adj.get(last).has(A)) cycles.push(path.slice()); return; }
      (adj.get(last) || new Set()).forEach(function (n) {
        if (path.indexOf(n) < 0) { path.push(n); dfs(path); path.pop(); }
      });
    }
    dfs([A, B]);
    return cycles.some(function (cyc) {
      var signs = new Set();
      for (var i = 0; i < 6; i++) {
        var p = cyc[(i + 5) % 6], q = cyc[i], r = cyc[(i + 1) % 6];
        if (Math.abs(Math.hypot(r.x - q.x, r.y - q.y) - s) > tol) return false;
        var u = unit(vp(q), vp(p)), w = unit(vp(q), vp(r));
        var ang = Math.acos(Math.max(-1, Math.min(1, u[0] * w[0] + u[1] * w[1]))) * 180 / Math.PI;
        if (Math.abs(ang - 120) > 8) return false;
        signs.add(u[0] * w[1] - u[1] * w[0] > 0);
      }
      return signs.size === 1 && cyc.slice(2).every(function (v) { return E.arcsThrough(v, s, tol).length > 0; });
    });
  }
});
