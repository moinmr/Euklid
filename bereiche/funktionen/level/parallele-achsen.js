// Level: Zwei Achsen. Jede Fütterung als Verbindung zwischen zwei parallelen Zahlenachsen:
// oben die Eingabe, unten die Ausgabe. Namen zufällig, auch y rein und x raus.
App.level('funktionen', App.funk.einstieg({
  id: 'parallele-achsen',
  text: {
    de: { title: 'Zwei Achsen',
          task: 'Jede Zahl, die reingeht, landet auf der oberen Achse, die Zahl, die rauskommt, auf der unteren. Eine Linie verbindet die beiden.',
          done: 'Richtig! Auf den Achsen siehst du, wohin jede Zahl wandert.' },
    en: { title: 'Two axes',
          task: 'Each number that goes in lands on the top axis, and the number that comes out lands on the bottom one. A line joins the two.',
          done: 'Right! The axes show where each number travels.' },
    fi: { title: 'Kaksi akselia',
          task: 'Jokainen sisään menevä luku osuu ylempään akseliin ja ulos tuleva luku alempaan. Viiva yhdistää ne.',
          done: 'Oikein! Akseleilta näet, minne kukin luku siirtyy.' },
    tr: { title: 'İki eksen',
          task: 'Giren her sayı üstteki eksene, çıkan sayı alttaki eksene düşer. Bir çizgi ikisini birleştirir.',
          done: 'Doğru! Eksenlerde her sayının nereye gittiğini görürsün.' },
    fr: { title: 'Deux axes',
          task: 'Chaque nombre qui entre se place sur l’axe du haut, et le nombre qui sort sur l’axe du bas. Un trait relie les deux.',
          done: 'Bravo ! Les axes montrent où va chaque nombre.' },
    es: { title: 'Dos ejes',
          task: 'Cada número que entra cae en el eje de arriba, y el que sale, en el de abajo. Una línea une los dos.',
          done: '¡Correcto! En los ejes ves adónde va cada número.' },
    ja: { title: '2本の軸',
          task: '入る数は上の軸に、出る数は下の軸にのります。線が2つの数をつなぎます。',
          done: '正解！軸を見ると、それぞれの数がどこへ行くかがわかります。' },
    ar: { title: 'محوران',
          task: 'كل عدد يدخل يقع على المحور العلوي، والعدد الذي يخرج يقع على المحور السفلي. خط يصل بينهما.',
          done: 'صحيح! يُظهر المحوران إلى أين ينتقل كل عدد.' }
  },
  regel: function () { return { m: 1 + App.funk.rnd(2), b: 1 + App.funk.rnd(4) }; },
  namen: 'zufall', einsetzen: true, fn: true, achsen: true, frage: 'wert'
}));
