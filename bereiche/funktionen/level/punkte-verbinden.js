// Level im Gitter: zwei zufällige Punkte sind vorgegeben und werden mit einer Geraden verbunden. Die Linie rastet nur an ihnen ein.
App.level('funktionen', {
  id: 'punkte-verbinden',
  text: {
    de: { title: 'Punkte verbinden',
          task: 'Verbinde die zwei Punkte mit einer Geraden.',
          done: 'Richtig! Jede Gerade ist durch zwei Punkte bestimmt.' },
    en: { title: 'Connect the points',
          task: 'Connect the two points with a straight line.',
          done: 'Right! Every straight line is determined by two points.' },
    fi: { title: 'Yhdistä pisteet',
          task: 'Yhdistä kaksi pistettä suoralla.',
          done: 'Oikein! Jokainen suora määräytyy kahdesta pisteestä.' },
    tr: { title: 'Noktaları birleştir',
          task: 'İki noktayı bir doğruyla birleştir.',
          done: 'Doğru! Her doğru iki noktayla belirlenir.' },
    fr: { title: 'Relie les points',
          task: 'Relie les deux points par une droite.',
          done: 'Bravo ! Toute droite est déterminée par deux points.' },
    es: { title: 'Une los puntos',
          task: 'Une los dos puntos con una recta.',
          done: '¡Correcto! Toda recta queda determinada por dos puntos.' },
    ja: { title: '点を結ぼう',
          task: '2つの点を直線で結ぼう。',
          done: '正解！直線は2つの点で決まります。' },
    ar: { title: 'صِل النقطتين',
          task: 'صِل النقطتين بمستقيم.',
          done: 'صحيح! كل مستقيم يتحدد بنقطتين.' }
  },
  verbinden: true, tabelle: false, werkzeug: 'line', werkzeuge: ['clear']   // nur Linien, unten nur der Papierkorb
});
