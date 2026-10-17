// Level im Gitter: eine zufällige Gerade ist vorgegeben. Ihre Schnittpunkte mit der x-Achse und der y-Achse unten eintippen.
App.level('funktionen', {
  id: 'achsen-schnitt',
  text: {
    de: { title: 'Schnittpunkte mit den Achsen',
          task: 'Wo schneidet die Gerade die x-Achse und wo die y-Achse? Tippe die Zahlen unten ein.',
          done: 'Richtig! Auf der x-Achse ist y = 0, auf der y-Achse ist x = 0.' },
    en: { title: 'Crossing the axes',
          task: 'Where does the line cross the x-axis, and where the y-axis? Type the numbers below.',
          done: 'Right! On the x-axis y = 0, on the y-axis x = 0.' },
    fi: { title: 'Leikkauspisteet akselien kanssa',
          task: 'Missä suora leikkaa x-akselin ja missä y-akselin? Kirjoita luvut alas.',
          done: 'Oikein! x-akselilla y = 0, y-akselilla x = 0.' },
    tr: { title: 'Eksenlerle kesişim',
          task: 'Doğru x eksenini nerede, y eksenini nerede kesiyor? Sayıları aşağıya yaz.',
          done: 'Doğru! x ekseninde y = 0, y ekseninde x = 0.' },
    fr: { title: 'Intersections avec les axes',
          task: 'Où la droite coupe-t-elle l’axe des x, et où l’axe des y ? Tape les nombres en bas.',
          done: 'Bravo ! Sur l’axe des x, y = 0 ; sur l’axe des y, x = 0.' },
    es: { title: 'Cortes con los ejes',
          task: '¿Dónde corta la recta el eje x y dónde el eje y? Escribe los números abajo.',
          done: '¡Correcto! En el eje x, y = 0; en el eje y, x = 0.' },
    ja: { title: '軸との交点',
          task: '直線は x 軸とどこで交わる？ y 軸とはどこ？ 下に数を入れよう。',
          done: '正解！x 軸の上では y = 0、y 軸の上では x = 0 です。' },
    ar: { title: 'التقاطع مع المحورين',
          task: 'أين يقطع المستقيم محور x، وأين يقطع محور y؟ اكتب العددين في الأسفل.',
          done: 'صحيح! على محور x يكون y = 0، وعلى محور y يكون x = 0.' }
  },
  schnitt: true, tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
