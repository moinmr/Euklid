// Level im Gitter: y = mx + b herleiten. Drei Geraden nacheinander: erst der Schnitt mit der y-Achse,
// dann die Steigung, dann Kästchen für Kästchen nach rechts, zum Schluss die Gleichung eintippen.
App.level('funktionen', {
  id: 'mx-plus-b',
  text: {
    de: { title: 'Die Geradengleichung',
          task: 'Finde die Gleichung der Geraden: Schnitt mit der y-Achse, Steigung, dann Schritt für Schritt nach rechts.',
          done: 'Richtig! Jede Gerade hat die Form y = mx + b. m ist die Steigung, b ist der Schnitt mit der y-Achse.' },
    en: { title: 'The equation of a line',
          task: 'Find the equation of the line: where it crosses the y-axis, the slope, then step by step to the right.',
          done: 'Right! Every line has the form y = mx + b. m is the slope, b is where it crosses the y-axis.' },
    fi: { title: 'Suoran yhtälö',
          task: 'Etsi suoran yhtälö: y-akselin leikkauskohta, kulmakerroin ja sitten askel kerrallaan oikealle.',
          done: 'Oikein! Jokainen suora on muotoa y = mx + b. m on kulmakerroin, b on y-akselin leikkauskohta.' },
    tr: { title: 'Doğru denklemi',
          task: 'Doğrunun denklemini bul: y eksenini kestiği yer, eğim, sonra adım adım sağa.',
          done: 'Doğru! Her doğru y = mx + b biçimindedir. m eğim, b y eksenini kestiği yerdir.' },
    fr: { title: 'L’équation d’une droite',
          task: 'Trouve l’équation de la droite : l’intersection avec l’axe des y, la pente, puis pas à pas vers la droite.',
          done: 'Bravo ! Toute droite a la forme y = mx + b. m est la pente, b est l’intersection avec l’axe des y.' },
    es: { title: 'La ecuación de la recta',
          task: 'Halla la ecuación de la recta: el corte con el eje y, la pendiente y luego paso a paso a la derecha.',
          done: '¡Correcto! Toda recta tiene la forma y = mx + b. m es la pendiente, b es el corte con el eje y.' },
    ja: { title: '直線の式',
          task: '直線の式を見つけよう：y 軸との交点、傾き、それから1ますずつ右へ。',
          done: '正解！どの直線も y = mx + b の形です。m は傾き、b は y 軸と交わるところです。' },
    ar: { title: 'معادلة المستقيم',
          task: 'جد معادلة المستقيم: تقاطعه مع محور y، ثم الميل، ثم خطوة خطوة إلى اليمين.',
          done: 'صحيح! كل مستقيم له الشكل y = mx + b. m هو الميل، و b هو تقاطعه مع محور y.' }
  },
  herleitung: true, tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
