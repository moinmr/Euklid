// Level im Gitter: y = mx + b herleiten. Eine Gerade mit ihren zwei Achsenschnittpunkten, unten Schritt für Schritt erklärt.
// Danach zwei Geraden zum Selbermachen: y = □x + □ eintippen. Grün erst nach der dritten.
App.level('funktionen', {
  id: 'mx-plus-b',
  text: {
    de: { title: 'Die Geradengleichung',
          task: 'Wie kommt man von einer Geraden zu ihrer Gleichung? Lies unten die Erklärung, dann bist du dran.',
          done: 'Richtig! Jede Gerade hat die Gleichung y = mx + b. b ist der Schnitt mit der y-Achse, m die Steigung.' },
    en: { title: 'The equation of a line',
          task: 'How do you get from a line to its equation? Read the explanation below, then it is your turn.',
          done: 'Right! Every line has the equation y = mx + b. b is where it crosses the y-axis, m is the slope.' },
    fi: { title: 'Suoran yhtälö',
          task: 'Miten suorasta saadaan sen yhtälö? Lue selitys alhaalta, sitten on sinun vuorosi.',
          done: 'Oikein! Jokaisen suoran yhtälö on y = mx + b. b on y-akselin leikkauskohta, m kulmakerroin.' },
    tr: { title: 'Doğru denklemi',
          task: 'Bir doğrudan denklemine nasıl ulaşılır? Aşağıdaki açıklamayı oku, sonra sıra sende.',
          done: 'Doğru! Her doğrunun denklemi y = mx + b’dir. b y eksenini kestiği yer, m eğimdir.' },
    fr: { title: 'L’équation d’une droite',
          task: 'Comment passer d’une droite à son équation ? Lis l’explication en bas, puis c’est à toi.',
          done: 'Bravo ! Toute droite a pour équation y = mx + b. b est l’intersection avec l’axe des y, m la pente.' },
    es: { title: 'La ecuación de la recta',
          task: '¿Cómo se pasa de una recta a su ecuación? Lee la explicación de abajo y luego te toca a ti.',
          done: '¡Correcto! Toda recta tiene la ecuación y = mx + b. b es el corte con el eje y, m la pendiente.' },
    ja: { title: '直線の式',
          task: '直線から式はどうやって求める？ 下の説明を読んだら、やってみよう。',
          done: '正解！どの直線も式は y = mx + b。b は y 軸と交わるところ、m は傾きです。' },
    ar: { title: 'معادلة المستقيم',
          task: 'كيف نصل من المستقيم إلى معادلته؟ اقرأ الشرح في الأسفل، ثم دورك.',
          done: 'صحيح! كل مستقيم معادلته y = mx + b. b هو تقاطعه مع محور y، و m هو الميل.' }
  },
  herleitung: true, tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
