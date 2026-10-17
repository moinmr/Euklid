// Level im Gitter: zwei zufällige Punkte sind vorgegeben. Mit einer Geraden verbinden, dann die Funktion selbst aufschreiben.
App.level('funktionen', {
  id: 'punkte-verbinden',
  text: {
    de: { title: 'Punkte verbinden',
          task: 'Verbinde die zwei Punkte mit einer Geraden. Schreib dann ihre Funktion auf.',
          done: 'Richtig! Durch zwei Punkte geht genau eine Gerade, und du hast ihre Funktion gefunden.' },
    en: { title: 'Connect the points',
          task: 'Connect the two points with a line. Then write down its function.',
          done: 'Right! Exactly one line goes through two points, and you found its function.' },
    fi: { title: 'Yhdistä pisteet',
          task: 'Yhdistä kaksi pistettä suoralla. Kirjoita sitten sen funktio.',
          done: 'Oikein! Kahden pisteen kautta kulkee täsmälleen yksi suora, ja löysit sen funktion.' },
    tr: { title: 'Noktaları birleştir',
          task: 'İki noktayı bir doğruyla birleştir. Sonra doğrunun fonksiyonunu yaz.',
          done: 'Doğru! İki noktadan tam olarak bir doğru geçer ve sen onun fonksiyonunu buldun.' },
    fr: { title: 'Relie les points',
          task: 'Relie les deux points par une droite. Puis écris sa fonction.',
          done: 'Bravo ! Par deux points passe une seule droite, et tu as trouvé sa fonction.' },
    es: { title: 'Une los puntos',
          task: 'Une los dos puntos con una recta. Después escribe su función.',
          done: '¡Correcto! Por dos puntos pasa una sola recta, y has encontrado su función.' },
    ja: { title: '点を結ぼう',
          task: '2つの点を直線で結ぼう。それから、その関数を書こう。',
          done: '正解！2つの点を通る直線は1本だけ。その関数を見つけました。' },
    ar: { title: 'صِل النقطتين',
          task: 'صِل النقطتين بمستقيم. ثم اكتب دالته.',
          done: 'صحيح! يمر بنقطتين مستقيم واحد فقط، وقد وجدت دالته.' }
  },
  verbinden: true, tabelle: false, werkzeug: 'line', werkzeuge: ['clear']   // nur Linien, unten nur der Papierkorb
});
