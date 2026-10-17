// Level im Gitter: Koordinaten: zwei Punkte nach Angabe setzen.
App.level('funktionen', {
  id: 'punkte',
  text: {
    de: { title: 'Punkte setzen',
          task: 'Setze A(3|2) und B(−2|4). Die erste Zahl geht nach rechts, die zweite nach oben. Minus heißt links oder unten.',
          done: 'Richtig! Der erste Wert ist die Position nach rechts, der zweite nach oben.' },
    en: { title: 'Plotting points',
          task: 'Plot A(3|2) and B(−2|4). The first number goes to the right, the second one goes up. Minus means left or down.',
          done: 'Right! The first value is the position to the right, the second one upwards.' },
    fi: { title: 'Pisteiden merkitseminen',
          task: 'Merkitse A(3|2) ja B(−2|4). Ensimmäinen luku kertoo matkan oikealle, toinen ylös. Miinus tarkoittaa vasemmalle tai alas.',
          done: 'Oikein! Ensimmäinen arvo on paikka oikealle, toinen ylöspäin.' },
    tr: { title: 'Nokta koymak',
          task: 'A(3|2) ve B(−2|4) noktalarını koy. İlk sayı sağa, ikinci sayı yukarı gider. Eksi, sola veya aşağı demektir.',
          done: 'Doğru! İlk değer sağa doğru konum, ikincisi yukarı doğru.' },
    fr: { title: 'Placer des points',
          task: 'Place A(3|2) et B(−2|4). Le premier nombre va vers la droite, le second vers le haut. Moins veut dire à gauche ou en bas.',
          done: 'Bravo ! La première valeur est la position vers la droite, la seconde vers le haut.' },
    es: { title: 'Colocar puntos',
          task: 'Coloca A(3|2) y B(−2|4). El primer número va a la derecha, el segundo hacia arriba. Menos significa izquierda o abajo.',
          done: '¡Correcto! El primer valor es la posición a la derecha, el segundo hacia arriba.' },
    ja: { title: '点をとる',
          task: 'A(3|2) と B(−2|4) をとりましょう。1つ目の数は右へ、2つ目の数は上へ。マイナスは左または下です。',
          done: '正解！1つ目の値は右への位置、2つ目は上への位置です。' },
    ar: { title: 'تحديد النقاط',
          task: 'حدّد A(3|2) و B(−2|4). العدد الأول يذهب إلى اليمين، والثاني إلى الأعلى. السالب يعني اليسار أو الأسفل.',
          done: 'صحيح! القيمة الأولى هي الموضع نحو اليمين، والثانية نحو الأعلى.' }
  },
  pts: [{ n: 'A', x: 3, y: 2 }, { n: 'B', x: -2, y: 4 }],
  tabelle: false, werkzeuge: ['point']   // nur Punkte setzen, keine Liste unten rechts; nochmal antippen entfernt einen Punkt
});
