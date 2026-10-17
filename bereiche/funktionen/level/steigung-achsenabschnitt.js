// Level im Gitter: y = 2x − 1
App.level('funktionen', {
  id: 'steigung-achsenabschnitt',
  text: {
    de: { title: 'Steigung und Achsenabschnitt',
          task: 'Zeichne y = 2x − 1. Setze die Punkte für x = 0, 1, 2 und zieh die Gerade.',
          done: 'Richtig! Steigung 2, und die Gerade schneidet die y-Achse bei −1.' },
    en: { title: 'Slope and intercept',
          task: 'Draw y = 2x − 1. Plot the points for x = 0, 1, 2 and draw the line.',
          done: 'Right! Slope 2, and the line crosses the y-axis at −1.' },
    fi: { title: 'Kulmakerroin ja leikkauskohta',
          task: 'Piirrä y = 2x − 1. Merkitse pisteet, kun x = 0, 1, 2, ja vedä suora.',
          done: 'Oikein! Kulmakerroin 2, ja suora leikkaa y-akselin kohdassa −1.' },
    tr: { title: 'Eğim ve kesişim',
          task: 'y = 2x − 1 doğrusunu çiz. x = 0, 1, 2 için noktaları koy ve doğruyu çiz.',
          done: 'Doğru! Eğim 2 ve doğru y-eksenini −1’de keser.' },
    fr: { title: 'Pente et ordonnée à l’origine',
          task: 'Trace y = 2x − 1. Place les points pour x = 0, 1, 2 et trace la droite.',
          done: 'Bravo ! Pente 2, et la droite coupe l’axe des y en −1.' },
    es: { title: 'Pendiente y ordenada',
          task: 'Dibuja y = 2x − 1. Coloca los puntos para x = 0, 1, 2 y traza la recta.',
          done: '¡Correcto! Pendiente 2, y la recta corta el eje y en −1.' },
    ja: { title: '傾きと切片',
          task: 'y = 2x − 1 をかきましょう。x = 0, 1, 2 の点をとって直線を引きます。',
          done: '正解！傾きは2、直線はy軸と−1で交わります。' },
    ar: { title: 'الميل والتقاطع',
          task: 'ارسم y = 2x − 1. حدّد النقاط عندما x = 0, 1, 2 وارسم المستقيم.',
          done: 'صحيح! الميل 2، والمستقيم يقطع محور y عند −1.' }
  },
  eq: { m: 2, b: -1 }, xs: [0, 1, 2]
});
