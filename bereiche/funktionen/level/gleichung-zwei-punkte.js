// Level im Gitter: zwei Punkte einer Geraden. Unten y = □ · (x − □) + □ ausfüllen: Steigung und einer der zwei Punkte.
// Zwei Geraden, eine steigende und eine fallende.
App.level('funktionen', {
  id: 'gleichung-zwei-punkte',
  text: {
    de: { title: 'Die Gleichung aus zwei Punkten',
          task: 'Fülle aus: y = Steigung · (x − x₁) + y₁. Für (x₁|y₁) nimm einen der zwei Punkte.',
          done: 'Richtig! So bekommst du aus zwei Punkten immer die Gleichung: y = (y₂ − y₁) : (x₂ − x₁) · (x − x₁) + y₁.' },
    en: { title: 'The equation from two points',
          task: 'Fill in: y = slope · (x − x₁) + y₁. For (x₁|y₁), take one of the two points.',
          done: 'Right! This way two points always give you the equation: y = (y₂ − y₁) : (x₂ − x₁) · (x − x₁) + y₁.' },
    fi: { title: 'Yhtälö kahdesta pisteestä',
          task: 'Täydennä: y = kulmakerroin · (x − x₁) + y₁. Pisteeksi (x₁|y₁) ota toinen kahdesta pisteestä.',
          done: 'Oikein! Näin saat kahdesta pisteestä aina yhtälön: y = (y₂ − y₁) : (x₂ − x₁) · (x − x₁) + y₁.' },
    tr: { title: 'İki noktadan denklem',
          task: 'Doldur: y = eğim · (x − x₁) + y₁. (x₁|y₁) için iki noktadan birini al.',
          done: 'Doğru! İki noktadan denklemi hep böyle bulursun: y = (y₂ − y₁) : (x₂ − x₁) · (x − x₁) + y₁.' },
    fr: { title: 'L’équation à partir de deux points',
          task: 'Complète : y = pente · (x − x₁) + y₁. Pour (x₁|y₁), prends un des deux points.',
          done: 'Bravo ! Avec deux points, on obtient toujours l’équation ainsi : y = (y₂ − y₁) : (x₂ − x₁) · (x − x₁) + y₁.' },
    es: { title: 'La ecuación con dos puntos',
          task: 'Completa: y = pendiente · (x − x₁) + y₁. Para (x₁|y₁), usa uno de los dos puntos.',
          done: '¡Correcto! Así sacas siempre la ecuación con dos puntos: y = (y₂ − y₁) : (x₂ − x₁) · (x − x₁) + y₁.' },
    ja: { title: '2つの点から式へ',
          task: 'うめよう：y＝傾き·(x − x₁)＋y₁。(x₁|y₁) には2つの点のどちらかを使おう。',
          done: '正解！2つの点があれば、いつもこうして式が作れます：y＝(y₂ − y₁)÷(x₂ − x₁)·(x − x₁)＋y₁。' },
    ar: { title: 'المعادلة من نقطتين',
          task: 'أكمل: \u2066y = الميل · (x − x₁) + y₁\u2069. خذ لـ \u2066(x₁|y₁)\u2069 إحدى النقطتين.',
          done: 'صحيح! هكذا تحصل دائمًا على المعادلة من نقطتين: \u2066y = (y₂ − y₁) : (x₂ − x₁) · (x − x₁) + y₁\u2069.' }
  },
  zweipunkt: 'gleichung', tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
