// Level: die allgemeine Geradengleichung y = mx + b mit dem Finger ins Feld schreiben. Die App liest die Zeichen
// (Handschrift-Erkennung in bereich.js) und zeigt darunter, was sie liest. Richtig sind y = mx + b und y = b + mx.
App.level('funktionen', {
  id: 'geradengleichung-schreiben',
  text: {
    de: { title: 'Die allgemeine Geradengleichung',
          task: 'Wie heißt die allgemeine Geradengleichung? Schreib sie mit dem Finger ins Feld.',
          done: 'Richtig! y = mx + b. m ist die Steigung, b der y-Achsenabschnitt.' },
    en: { title: 'The general equation of a line',
          task: 'What is the general equation of a line? Write it in the box with your finger.',
          done: 'Right! y = mx + b. m is the slope, b the y-intercept.' },
    fi: { title: 'Suoran yleinen yhtälö',
          task: 'Mikä on suoran yleinen yhtälö? Kirjoita se sormella kenttään.',
          done: 'Oikein! y = mx + b. m on kulmakerroin, b on y-akselin leikkauskohta.' },
    tr: { title: 'Doğrunun genel denklemi',
          task: 'Doğrunun genel denklemi nedir? Parmağınla alana yaz.',
          done: 'Doğru! y = mx + b. m eğim, b y eksenini kestiği yer.' },
    fr: { title: 'L’équation générale d’une droite',
          task: 'Quelle est l’équation générale d’une droite ? Écris-la avec ton doigt dans le cadre.',
          done: 'Bravo ! y = mx + b. m est la pente, b l’ordonnée à l’origine.' },
    es: { title: 'La ecuación general de la recta',
          task: '¿Cuál es la ecuación general de la recta? Escríbela con el dedo en el recuadro.',
          done: '¡Correcto! y = mx + b. m es la pendiente, b la ordenada en el origen.' },
    ja: { title: '直線の一般的な式',
          task: '直線の一般的な式は？指でわくの中に書こう。',
          done: '正解！y＝mx＋b。m は傾き、b は切片です。' },
    ar: { title: 'المعادلة العامة للمستقيم',
          task: 'ما المعادلة العامة للمستقيم؟ اكتبها بإصبعك في المربع.',
          done: 'صحيح! \u2066y = mx + b\u2069. m هو الميل، وb هو الجزء المقطوع من محور y.' }
  },
  handschrift: true, tabelle: false, werkzeuge: ['clear']   // schreiben im Feld unten, Papierkorb fängt neu an
});
