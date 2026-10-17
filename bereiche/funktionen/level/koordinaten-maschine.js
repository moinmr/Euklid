// Level: Ins Koordinatensystem. Wie Zwei Achsen, nur steht die Achse für y senkrecht.
// Drei zufällige Paare sind schon Punkte, in der Box steht ?. Frage: Welche Funktion ist es?
App.level('funktionen', App.funk.einstieg({
  id: 'koordinaten-maschine',
  text: {
    de: { title: 'Ins Koordinatensystem',
          task: 'Jetzt steht die Achse für y senkrecht. Jedes Zahlenpaar ist ein Punkt: erst nach rechts bis x, dann nach oben bis y. Welche Funktion gehört zu den drei Punkten?',
          done: 'Richtig! Jedes Paar aus x und y ist ein Punkt. Alle Punkte zusammen zeigen die Funktion.' },
    en: { title: 'Into the coordinate plane',
          task: 'Now the y axis stands upright. Each pair of numbers is a point: first right to x, then up to y. Which function belongs to the three points?',
          done: 'Right! Each pair of x and y is a point. All the points together show the function.' },
    fi: { title: 'Koordinaatistoon',
          task: 'Nyt y-akseli on pystyssä. Jokainen lukupari on piste: ensin oikealle kohtaan x, sitten ylös kohtaan y. Mikä funktio kuuluu kolmeen pisteeseen?',
          done: 'Oikein! Jokainen x:n ja y:n pari on piste. Kaikki pisteet yhdessä näyttävät funktion.' },
    tr: { title: 'Koordinat sistemine',
          task: 'Şimdi y ekseni dik duruyor. Her sayı çifti bir noktadır: önce sağa x kadar, sonra yukarı y kadar. Üç noktaya hangi fonksiyon ait?',
          done: 'Doğru! Her x ve y çifti bir noktadır. Tüm noktalar birlikte fonksiyonu gösterir.' },
    fr: { title: 'Dans le repère',
          task: 'Maintenant, l’axe des y est vertical. Chaque paire de nombres est un point : d’abord vers la droite jusqu’à x, puis vers le haut jusqu’à y. Quelle fonction correspond aux trois points ?',
          done: 'Bravo ! Chaque paire x et y est un point. Tous les points ensemble montrent la fonction.' },
    es: { title: 'Al sistema de coordenadas',
          task: 'Ahora el eje y está de pie. Cada pareja de números es un punto: primero a la derecha hasta x, luego hacia arriba hasta y. ¿Qué función corresponde a los tres puntos?',
          done: '¡Correcto! Cada pareja de x e y es un punto. Todos los puntos juntos muestran la función.' },
    ja: { title: '座標平面へ',
          task: '今度は y の軸がたてになります。数の組はそれぞれ点です。まず右へ x まで、次に上へ y まで。3つの点に合う関数はどれ？',
          done: '正解！x と y の組はそれぞれ1つの点です。すべての点をあわせると関数が見えます。' },
    ar: { title: 'إلى المستوى الإحداثي',
          task: 'الآن يقف محور y عموديًا. كل زوج من الأعداد نقطة: أولًا إلى اليمين حتى x، ثم إلى الأعلى حتى y. ما الدالة التي تنتمي إليها النقاط الثلاث؟',
          done: 'صحيح! كل زوج من x وy نقطة. كل النقاط معًا تُظهر الدالة.' }
  },
  regel: function () { return { m: 1 + App.funk.rnd(2), b: 1 + App.funk.rnd(4) }; },
  namen: ['x', 'y'], vorgabe: 3, geheim: true, koord: true, frage: 'funktion'
}));
