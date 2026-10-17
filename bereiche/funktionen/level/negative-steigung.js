// Level im Gitter: y = −x + 3
App.level('funktionen', {
  id: 'negative-steigung',
  text: {
    de: { title: 'Negative Steigung',
          task: 'Zeichne y = −x + 3. Setze die Punkte für x = 0, 1, 2, 3 und zieh die Gerade.',
          done: 'Richtig! Bei negativer Steigung geht die Gerade nach rechts nach unten.' },
    en: { title: 'Negative slope',
          task: 'Draw y = −x + 3. Plot the points for x = 0, 1, 2, 3 and draw the line.',
          done: 'Right! With a negative slope the line goes down to the right.' },
    fi: { title: 'Negatiivinen kulmakerroin',
          task: 'Piirrä y = −x + 3. Merkitse pisteet, kun x = 0, 1, 2, 3, ja vedä suora.',
          done: 'Oikein! Kun kulmakerroin on negatiivinen, suora laskee oikealle mentäessä.' },
    tr: { title: 'Negatif eğim',
          task: 'y = −x + 3 doğrusunu çiz. x = 0, 1, 2, 3 için noktaları koy ve doğruyu çiz.',
          done: 'Doğru! Eğim negatif olunca doğru sağa doğru alçalır.' },
    fr: { title: 'Pente négative',
          task: 'Trace y = −x + 3. Place les points pour x = 0, 1, 2, 3 et trace la droite.',
          done: 'Bravo ! Avec une pente négative, la droite descend vers la droite.' },
    es: { title: 'Pendiente negativa',
          task: 'Dibuja y = −x + 3. Coloca los puntos para x = 0, 1, 2, 3 y traza la recta.',
          done: '¡Correcto! Con pendiente negativa, la recta baja hacia la derecha.' },
    ja: { title: '負の傾き',
          task: 'y = −x + 3 をかきましょう。x = 0, 1, 2, 3 の点をとって直線を引きます。',
          done: '正解！傾きが負のとき、直線は右へ行くほど下がります。' },
    ar: { title: 'الميل السالب',
          task: 'ارسم y = −x + 3. حدّد النقاط عندما x = 0, 1, 2, 3 وارسم المستقيم.',
          done: 'صحيح! عندما يكون الميل سالبًا ينزل المستقيم نحو اليمين.' }
  },
  eq: { m: -1, b: 3 }, xs: [0, 1, 2, 3]
});
