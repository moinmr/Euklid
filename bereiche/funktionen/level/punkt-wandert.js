// Level im Gitter: ein fester Punkt (x₁|y₁) und ein Punkt (x|y), den man auf der Geraden zieht. Am Dreieck dazwischen
// steht live x − x₁ und y − y₁, unten die Teilung. Es kommt immer die Steigung heraus; erst nach dem Ziehen prüfbar.
App.level('funktionen', {
  id: 'punkt-wandert',
  text: {
    de: { title: 'Ein Punkt wandert',
          task: 'Zieh den dicken Punkt auf der Geraden hin und her. Was kommt bei der Teilung unten immer heraus?',
          done: 'Richtig! Für jeden Punkt (x|y) auf der Geraden gilt: (y − y₁) : (x − x₁) = Steigung. Mal (x − x₁) genommen: y − y₁ = Steigung · (x − x₁).' },
    en: { title: 'A point on the move',
          task: 'Drag the big point back and forth along the line. What always comes out of the division below?',
          done: 'Right! For every point (x|y) on the line: (y − y₁) : (x − x₁) = slope. Multiplied by (x − x₁): y − y₁ = slope · (x − x₁).' },
    fi: { title: 'Piste liikkuu',
          task: 'Vedä isoa pistettä suoralla edestakaisin. Mitä alla olevasta jakolaskusta tulee aina?',
          done: 'Oikein! Jokaiselle suoran pisteelle (x|y) pätee: (y − y₁) : (x − x₁) = kulmakerroin. Kerrottuna (x − x₁):llä: y − y₁ = kulmakerroin · (x − x₁).' },
    tr: { title: 'Gezen nokta',
          task: 'Kalın noktayı doğru üzerinde ileri geri sürükle. Aşağıdaki bölmeden her zaman ne çıkıyor?',
          done: 'Doğru! Doğru üzerindeki her (x|y) noktası için: (y − y₁) : (x − x₁) = eğim. (x − x₁) ile çarpınca: y − y₁ = eğim · (x − x₁).' },
    fr: { title: 'Un point qui se promène',
          task: 'Fais glisser le gros point le long de la droite. Que donne toujours la division en bas ?',
          done: 'Bravo ! Pour chaque point (x|y) de la droite : (y − y₁) : (x − x₁) = pente. En multipliant par (x − x₁) : y − y₁ = pente · (x − x₁).' },
    es: { title: 'Un punto que se mueve',
          task: 'Arrastra el punto grande por la recta. ¿Qué sale siempre en la división de abajo?',
          done: '¡Correcto! Para cada punto (x|y) de la recta: (y − y₁) : (x − x₁) = pendiente. Multiplicando por (x − x₁): y − y₁ = pendiente · (x − x₁).' },
    ja: { title: '点が動く',
          task: '太い点を直線の上で動かそう。下のわり算はいつも何になる？',
          done: '正解！直線上のどの点 (x|y) でも：(y − y₁)÷(x − x₁)＝傾き。(x − x₁) をかけると：y − y₁＝傾き·(x − x₁)。' },
    ar: { title: 'نقطة تتحرك',
          task: 'اسحب النقطة الكبيرة على المستقيم ذهابًا وإيابًا. ماذا يخرج دائمًا من القسمة في الأسفل؟',
          done: 'صحيح! لكل نقطة \u2066(x|y)\u2069 على المستقيم: \u2066(y − y₁) : (x − x₁) = الميل\u2069. بالضرب في \u2066(x − x₁)\u2069: \u2066y − y₁ = الميل · (x − x₁)\u2069.' }
  },
  zweipunkt: 'wandern', tabelle: false, werkzeuge: ['clear']   // ziehen statt zeichnen, unten nur der Papierkorb
});
