// Level im Gitter: y = x + 2
App.level('funktionen', {
  id: 'achsenabschnitt',
  text: {
    de: { title: 'Achsenabschnitt',
          task: 'Zeichne y = x + 2. Die +2 sagt, wo die Gerade die y-Achse schneidet.',
          done: 'Richtig! Die +2 verschiebt die Gerade nach oben. Sie schneidet die y-Achse bei 2.' },
    en: { title: 'y-intercept',
          task: 'Draw y = x + 2. The +2 tells you where the line crosses the y-axis.',
          done: 'Right! The +2 moves the line up. It crosses the y-axis at 2.' },
    fi: { title: 'y-akselin leikkauskohta',
          task: 'Piirrä y = x + 2. +2 kertoo, missä suora leikkaa y-akselin.',
          done: 'Oikein! +2 siirtää suoraa ylöspäin. Se leikkaa y-akselin kohdassa 2.' },
    tr: { title: 'y-ekseni kesişimi',
          task: 'y = x + 2 doğrusunu çiz. +2, doğrunun y-eksenini nerede kestiğini söyler.',
          done: 'Doğru! +2 doğruyu yukarı kaydırır. Doğru y-eksenini 2’de keser.' },
    fr: { title: 'Ordonnée à l’origine',
          task: 'Trace y = x + 2. Le +2 indique où la droite coupe l’axe des y.',
          done: 'Bravo ! Le +2 déplace la droite vers le haut. Elle coupe l’axe des y en 2.' },
    es: { title: 'Ordenada en el origen',
          task: 'Dibuja y = x + 2. El +2 indica dónde la recta corta el eje y.',
          done: '¡Correcto! El +2 sube la recta. Corta el eje y en 2.' },
    ja: { title: 'y切片',
          task: 'y = x + 2 をかきましょう。+2 は直線がy軸と交わる場所を表します。',
          done: '正解！+2 は直線を上にずらします。直線はy軸と2で交わります。' },
    ar: { title: 'التقاطع مع محور y',
          task: 'ارسم y = x + 2. العدد 2+ يخبرك أين يقطع المستقيم محور y.',
          done: 'صحيح! العدد 2+ يرفع المستقيم إلى الأعلى. إنه يقطع محور y عند 2.' }
  },
  eq: { m: 1, b: 2 }, xs: [0, 1, 2]
});
