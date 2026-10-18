// Level im Gitter: oben steht die allgemeine Geradengleichung y = mx + b (m Steigung, b y-Achsenabschnitt).
// Drei Gleichungen nacheinander, die Gerade ist jeweils gezeichnet; m und b ablesen und eintippen.
App.level('funktionen', {
  id: 'mb-ablesen',
  text: {
    de: { title: 'y = mx + b',
          task: 'Die allgemeine Geradengleichung ist y = mx + b. m ist die Steigung, b der y-Achsenabschnitt. Was ist m, was ist b?',
          done: 'Richtig! m steht vor dem x und ist die Steigung. b steht allein und ist der y-Achsenabschnitt.' },
    en: { title: 'y = mx + b',
          task: 'The general equation of a line is y = mx + b. m is the slope, b the y-intercept. What is m, what is b?',
          done: 'Right! m is in front of x and is the slope. b stands alone and is the y-intercept.' },
    fi: { title: 'y = mx + b',
          task: 'Suoran yleinen yhtälö on y = mx + b. m on kulmakerroin, b on y-akselin leikkauskohta. Mikä on m, mikä on b?',
          done: 'Oikein! m on x:n edessä ja on kulmakerroin. b on yksinään ja on y-akselin leikkauskohta.' },
    tr: { title: 'y = mx + b',
          task: 'Doğrunun genel denklemi y = mx + b’dir. m eğim, b y eksenini kestiği yerdir. m nedir, b nedir?',
          done: 'Doğru! m, x’in önünde durur ve eğimdir. b tek başına durur ve y eksenini kestiği yerdir.' },
    fr: { title: 'y = mx + b',
          task: 'L’équation générale d’une droite est y = mx + b. m est la pente, b l’ordonnée à l’origine. Que vaut m, que vaut b ?',
          done: 'Bravo ! m est devant le x : c’est la pente. b est seul : c’est l’ordonnée à l’origine.' },
    es: { title: 'y = mx + b',
          task: 'La ecuación general de la recta es y = mx + b. m es la pendiente, b la ordenada en el origen. ¿Cuánto vale m y cuánto b?',
          done: '¡Correcto! m va delante de la x y es la pendiente. b va solo y es la ordenada en el origen.' },
    ja: { title: 'y＝mx＋b',
          task: '直線の一般的な式は y＝mx＋b。m は傾き、b は切片（y 軸と交わるところ）です。m と b はいくつ？',
          done: '正解！x の前にあるのが m で傾き。ひとりで立っているのが b で切片です。' },
    ar: { title: '⁦y = mx + b⁩',
          task: 'المعادلة العامة للمستقيم هي ⁦y = mx + b⁩. m هو الميل، وb هو الجزء المقطوع من محور y. كم m وكم b؟',
          done: 'صحيح! m يقف أمام x وهو الميل. b يقف وحده وهو الجزء المقطوع من محور y.' }
  },
  zweipunkt: 'mb', tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
