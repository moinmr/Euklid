// Level im Gitter: y = x + 1: Tabelle rechnen, Punkte setzen, Gerade ziehen.
App.level('funktionen', {
  id: 'wertetabelle',
  text: {
    de: { title: 'Wertetabelle',
          task: 'Zeichne y = x + 1. Rechne y für x = 0, 1, 2, 3, setze die Punkte und zieh die Gerade durch sie.',
          done: 'Richtig! Jeder Schritt nach rechts bringt die Gerade um 1 nach oben.' },
    en: { title: 'Table of values',
          task: 'Draw y = x + 1. Work out y for x = 0, 1, 2, 3, plot the points and draw the line through them.',
          done: 'Right! Each step to the right takes the line 1 up.' },
    fi: { title: 'Arvotaulukko',
          task: 'Piirrä y = x + 1. Laske y, kun x = 0, 1, 2, 3, merkitse pisteet ja vedä suora niiden kautta.',
          done: 'Oikein! Jokainen askel oikealle nostaa suoraa yhdellä.' },
    tr: { title: 'Değer tablosu',
          task: 'y = x + 1 doğrusunu çiz. x = 0, 1, 2, 3 için y’yi hesapla, noktaları koy ve doğruyu onlardan geçir.',
          done: 'Doğru! Sağa her adım doğruyu 1 yukarı çıkarır.' },
    fr: { title: 'Tableau de valeurs',
          task: 'Trace y = x + 1. Calcule y pour x = 0, 1, 2, 3, place les points et trace la droite qui passe par eux.',
          done: 'Bravo ! Chaque pas vers la droite fait monter la droite de 1.' },
    es: { title: 'Tabla de valores',
          task: 'Dibuja y = x + 1. Calcula y para x = 0, 1, 2, 3, coloca los puntos y traza la recta que pasa por ellos.',
          done: '¡Correcto! Cada paso a la derecha sube la recta 1.' },
    ja: { title: '値の表',
          task: 'y = x + 1 をかきましょう。x = 0, 1, 2, 3 のときの y を計算し、点をとって直線を引きます。',
          done: '正解！右へ1進むごとに、直線は1上がります。' },
    ar: { title: 'جدول القيم',
          task: 'ارسم y = x + 1. احسب y عندما x = 0, 1, 2, 3، وحدّد النقاط ثم ارسم المستقيم المار بها.',
          done: 'صحيح! كل خطوة إلى اليمين ترفع المستقيم بمقدار 1.' }
  },
  eq: { m: 1, b: 1 }, xs: [0, 1, 2, 3]
});
