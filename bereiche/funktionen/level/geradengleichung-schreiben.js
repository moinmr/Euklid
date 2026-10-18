// Level: die allgemeine Geradengleichung y = mx + b mit dem Finger ins Feld schreiben. Die App liest die Zeichen
// (Handschrift-Erkennung in bereich.js) und zeigt darunter, was sie liest. Richtig sind y = mx + b und y = b + mx.
App.level('funktionen', {
  id: 'geradengleichung-schreiben',
  text: {
    de: { title: 'Die allgemeine Geradengleichung',
          task: 'Wie heißt die allgemeine Geradengleichung? Schreib sie mit dem Finger ins Feld.',
          done: 'Richtig! y = mx + b. Mit dem Punkt (0|b) auf der y-Achse wird aus y = m · (x − x₁) + y₁ genau das. m ist die Steigung, b der y-Achsenabschnitt.' },
    en: { title: 'The general equation of a line',
          task: 'What is the general equation of a line? Write it in the box with your finger.',
          done: 'Right! y = mx + b. With the point (0|b) on the y-axis, y = m · (x − x₁) + y₁ becomes exactly this. m is the slope, b the y-intercept.' },
    fi: { title: 'Suoran yleinen yhtälö',
          task: 'Mikä on suoran yleinen yhtälö? Kirjoita se sormella kenttään.',
          done: 'Oikein! y = mx + b. Kun käytetään y-akselin pistettä (0|b), yhtälöstä y = m · (x − x₁) + y₁ tulee juuri tämä. m on kulmakerroin, b on y-akselin leikkauskohta.' },
    tr: { title: 'Doğrunun genel denklemi',
          task: 'Doğrunun genel denklemi nedir? Parmağınla alana yaz.',
          done: 'Doğru! y = mx + b. y eksenindeki (0|b) noktasıyla y = m · (x − x₁) + y₁ tam olarak buna dönüşür. m eğim, b y eksenini kestiği yer.' },
    fr: { title: 'L’équation générale d’une droite',
          task: 'Quelle est l’équation générale d’une droite ? Écris-la avec ton doigt dans le cadre.',
          done: 'Bravo ! y = mx + b. Avec le point (0|b) sur l’axe des y, y = m · (x − x₁) + y₁ devient exactement cela. m est la pente, b l’ordonnée à l’origine.' },
    es: { title: 'La ecuación general de la recta',
          task: '¿Cuál es la ecuación general de la recta? Escríbela con el dedo en el recuadro.',
          done: '¡Correcto! y = mx + b. Con el punto (0|b) del eje y, y = m · (x − x₁) + y₁ se convierte justo en esto. m es la pendiente, b la ordenada en el origen.' },
    ja: { title: '直線の一般的な式',
          task: '直線の一般的な式は？指でわくの中に書こう。',
          done: '正解！y＝mx＋b。y 軸上の点 (0|b) を使うと、y＝m·(x − x₁)＋y₁ がちょうどこれになります。m は傾き、b は切片です。' },
    ar: { title: 'المعادلة العامة للمستقيم',
          task: 'ما المعادلة العامة للمستقيم؟ اكتبها بإصبعك في المربع.',
          done: 'صحيح! ⁦y = mx + b⁩. مع النقطة ⁦(0|b)⁩ على محور y تصبح ⁦y = m · (x − x₁) + y₁⁩ هذه المعادلة تمامًا. m هو الميل، وb هو الجزء المقطوع من محور y.' }
  },
  handschrift: true, tabelle: false, werkzeuge: ['clear']   // schreiben im Feld unten, Papierkorb fängt neu an
});
