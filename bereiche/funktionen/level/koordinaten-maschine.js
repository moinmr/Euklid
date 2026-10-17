// Level: Ins Koordinatensystem. Wie bei den zwei Achsen, nur steht die Achse für die Ausgabe jetzt senkrecht.
// Jede Fütterung wird ein Punkt. Frage: Welcher Punkt gehört zu x = ...? (Reihenfolge x vor y)
App.level('funktionen', App.funk.einstieg({
  id: 'koordinaten-maschine',
  text: {
    de: { title: 'Ins Koordinatensystem',
          task: 'Jetzt steht die Achse für y senkrecht. Jedes Zahlenpaar wird ein Punkt: erst nach rechts bis x, dann nach oben bis y.',
          done: 'Richtig! Jedes Paar aus x und y ist ein Punkt. Alle Punkte zusammen zeigen die Funktion.' },
    en: { title: 'Into the coordinate plane',
          task: 'Now the y axis stands upright. Each pair of numbers becomes a point: first right to x, then up to y.',
          done: 'Right! Each pair of x and y is a point. All the points together show the function.' },
    fi: { title: 'Koordinaatistoon',
          task: 'Nyt y-akseli on pystyssä. Jokaisesta lukuparista tulee piste: ensin oikealle kohtaan x, sitten ylös kohtaan y.',
          done: 'Oikein! Jokainen x:n ja y:n pari on piste. Kaikki pisteet yhdessä näyttävät funktion.' },
    tr: { title: 'Koordinat sistemine',
          task: 'Şimdi y ekseni dik duruyor. Her sayı çifti bir nokta olur: önce sağa x kadar, sonra yukarı y kadar.',
          done: 'Doğru! Her x ve y çifti bir noktadır. Tüm noktalar birlikte fonksiyonu gösterir.' },
    fr: { title: 'Dans le repère',
          task: 'Maintenant, l’axe des y est vertical. Chaque paire de nombres devient un point : d’abord vers la droite jusqu’à x, puis vers le haut jusqu’à y.',
          done: 'Bravo ! Chaque paire x et y est un point. Tous les points ensemble montrent la fonction.' },
    es: { title: 'Al sistema de coordenadas',
          task: 'Ahora el eje y está de pie. Cada pareja de números se convierte en un punto: primero a la derecha hasta x, luego hacia arriba hasta y.',
          done: '¡Correcto! Cada pareja de x e y es un punto. Todos los puntos juntos muestran la función.' },
    ja: { title: '座標平面へ',
          task: '今度は y の軸がたてになります。数の組はそれぞれ点になります。まず右へ x まで、次に上へ y まで。',
          done: '正解！x と y の組はそれぞれ1つの点です。すべての点をあわせると関数が見えます。' },
    ar: { title: 'إلى المستوى الإحداثي',
          task: 'الآن يقف محور y عموديًا. كل زوج من الأعداد يصبح نقطة: أولًا إلى اليمين حتى x، ثم إلى الأعلى حتى y.',
          done: 'صحيح! كل زوج من x وy نقطة. كل النقاط معًا تُظهر الدالة.' }
  },
  regel: function () { return { m: 1 + App.funk.rnd(2), b: 1 + App.funk.rnd(4) }; },
  namen: ['x', 'y'], fn: true, koord: true, frage: 'punkt'
}));
