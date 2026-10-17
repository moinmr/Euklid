// Level im Gitter: y = 2x
App.level('funktionen', {
  id: 'steigung',
  text: {
    de: { title: 'Steigung',
          task: 'Zeichne y = 2x. Pro Schritt nach rechts geht es um 2 nach oben. Setze die Punkte und zieh die Gerade.',
          done: 'Richtig! Die Steigung ist 2: Pro Schritt nach rechts geht es 2 nach oben.' },
    en: { title: 'Slope',
          task: 'Draw y = 2x. For each step to the right it goes 2 up. Plot the points and draw the line.',
          done: 'Right! The slope is 2: for each step to the right it goes 2 up.' },
    fi: { title: 'Kulmakerroin',
          task: 'Piirrä y = 2x. Jokaisella askeleella oikealle mennään 2 ylös. Merkitse pisteet ja vedä suora.',
          done: 'Oikein! Kulmakerroin on 2: jokaisella askeleella oikealle mennään 2 ylös.' },
    tr: { title: 'Eğim',
          task: 'y = 2x doğrusunu çiz. Sağa her adımda 2 yukarı çıkılır. Noktaları koy ve doğruyu çiz.',
          done: 'Doğru! Eğim 2: sağa her adımda 2 yukarı çıkılır.' },
    fr: { title: 'Pente',
          task: 'Trace y = 2x. À chaque pas vers la droite, on monte de 2. Place les points et trace la droite.',
          done: 'Bravo ! La pente est 2 : à chaque pas vers la droite, on monte de 2.' },
    es: { title: 'Pendiente',
          task: 'Dibuja y = 2x. Por cada paso a la derecha se sube 2. Coloca los puntos y traza la recta.',
          done: '¡Correcto! La pendiente es 2: por cada paso a la derecha se sube 2.' },
    ja: { title: '傾き',
          task: 'y = 2x をかきましょう。右へ1進むごとに2上がります。点をとって直線を引きます。',
          done: '正解！傾きは2：右へ1進むごとに2上がります。' },
    ar: { title: 'الميل',
          task: 'ارسم y = 2x. مع كل خطوة إلى اليمين نصعد 2. حدّد النقاط وارسم المستقيم.',
          done: 'صحيح! الميل هو 2: مع كل خطوة إلى اليمين نصعد 2.' }
  },
  eq: { m: 2, b: 0 }, xs: [0, 1, 2]
});
