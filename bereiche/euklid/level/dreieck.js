// Level: Gleichseitiges Dreieck über AB, Ecke C mit Zirkelbögen um A und B gefunden.
App.level('euklid', {
  id: 'dreieck',
  text: {
    de: { title: 'Gleichseitiges Dreieck',
          task: 'Konstruiere über der Strecke AB ein gleichseitiges Dreieck. Benutze Zirkel und Linie.' },
    en: { title: 'Equilateral triangle',
          task: 'Construct an equilateral triangle on the segment AB. Use the compass and the line.' },
    fi: { title: 'Tasasivuinen kolmio',
          task: 'Piirrä janalle AB tasasivuinen kolmio. Käytä harppia ja viivaa.' },
    tr: { title: 'Eşkenar üçgen',
          task: 'AB doğru parçası üzerine bir eşkenar üçgen çiz. Pergel ve çizgiyi kullan.' },
    fr: { title: 'Triangle équilatéral',
          task: 'Construis un triangle équilatéral sur le segment AB. Utilise le compas et la ligne.' },
    es: { title: 'Triángulo equilátero',
          task: 'Construye un triángulo equilátero sobre el segmento AB. Usa el compás y la línea.' },
    ja: { title: '正三角形',
          task: '線分ABの上に正三角形を作図しましょう。コンパスと線を使います。' },
    ar: { title: 'مثلث متساوي الأضلاع',
          task: 'أنشئ مثلثًا متساوي الأضلاع على القطعة AB. استخدم الفرجار والخط.' }
  },
  pruefen: function (A, B, s, tol) {
    var E = App.euklid, adj = E.adjacency(), nA = adj.get(A);
    if (!nA) return false;
    var res = false;
    nA.forEach(function (C) {
      if (res || C === B || !(adj.get(B) && adj.get(B).has(C))) return;
      if (Math.abs(Math.hypot(C.x - A.x, C.y - A.y) - s) > tol || Math.abs(Math.hypot(C.x - B.x, C.y - B.y) - s) > tol) return;
      if (E.arcsThrough(C, s, tol, A).length && E.arcsThrough(C, s, tol, B).length) res = true;
    });
    return res;
  }
});
