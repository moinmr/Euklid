// Level: Zwei Achsen. Drei zufällige Paare sind als Linien zwischen zwei parallelen Zahlenachsen vorgegeben
// (oben die Eingabe, unten die Ausgabe), in der Box steht ?. Frage: Welche Funktion ist es? Namen zufällig.
App.level('funktionen', App.funk.einstieg({
  id: 'parallele-achsen',
  text: {
    de: { title: 'Zwei Achsen',
          task: 'Auf den zwei Achsen sind drei Paare verbunden: oben die Zahl, die reingeht, unten die, die rauskommt. Welche Funktion steckt in der Maschine?',
          done: 'Richtig! Auf den Achsen siehst du, wohin jede Zahl wandert.' },
    en: { title: 'Two axes',
          task: 'Three pairs are joined on the two axes: on top the number that goes in, below the one that comes out. Which function is inside the machine?',
          done: 'Right! The axes show where each number travels.' },
    fi: { title: 'Kaksi akselia',
          task: 'Kahdella akselilla on yhdistetty kolme paria: ylhäällä sisään menevä luku, alhaalla ulos tuleva. Mikä funktio koneen sisällä on?',
          done: 'Oikein! Akseleilta näet, minne kukin luku siirtyy.' },
    tr: { title: 'İki eksen',
          task: 'İki eksende üç çift birleştirilmiş: üstte giren sayı, altta çıkan sayı. Makinenin içinde hangi fonksiyon var?',
          done: 'Doğru! Eksenlerde her sayının nereye gittiğini görürsün.' },
    fr: { title: 'Deux axes',
          task: 'Sur les deux axes, trois paires sont reliées : en haut le nombre qui entre, en bas celui qui sort. Quelle fonction se cache dans la machine ?',
          done: 'Bravo ! Les axes montrent où va chaque nombre.' },
    es: { title: 'Dos ejes',
          task: 'En los dos ejes hay tres parejas unidas: arriba el número que entra, abajo el que sale. ¿Qué función hay dentro de la máquina?',
          done: '¡Correcto! En los ejes ves adónde va cada número.' },
    ja: { title: '2本の軸',
          task: '2本の軸で3つの組が線でつながっています。上が入る数、下が出る数です。マシンの中の関数はどれ？',
          done: '正解！軸を見ると、それぞれの数がどこへ行くかがわかります。' },
    ar: { title: 'محوران',
          task: 'على المحورين ثلاثة أزواج موصولة: في الأعلى العدد الذي يدخل، وفي الأسفل العدد الذي يخرج. ما الدالة الموجودة داخل الآلة؟',
          done: 'صحيح! يُظهر المحوران إلى أين ينتقل كل عدد.' }
  },
  regel: function () { return { m: 1 + App.funk.rnd(2), b: 1 + App.funk.rnd(4) }; },
  namen: 'zufall', vorgabe: 3, geheim: true, achsen: true, frage: 'funktion'
}));
