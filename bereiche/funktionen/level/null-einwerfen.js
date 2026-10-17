// Level im Gitter: eine Gerade ist vorgegeben, unten ihre Maschine □ → [m·x + b] → ?.
// Welche Zahl muss hinein, damit der Schnittpunkt mit der y-Achse herauskommt? Richtig ist 0.
App.level('funktionen', {
  id: 'null-einwerfen',
  text: {
    de: { title: 'Die Maschine und die y-Achse',
          task: 'Zu dieser Geraden gehört die Maschine unten. Der Punkt auf der y-Achse soll herauskommen. Welche Zahl gibst du hinein?',
          done: 'Richtig! Gibt man 0 in die Maschine, kommt der Schnittpunkt mit der y-Achse heraus.' },
    en: { title: 'The machine and the y-axis',
          task: 'The machine below belongs to this line. The point on the y-axis should come out. Which number do you put in?',
          done: 'Right! If you put 0 into the machine, out comes the point where the line crosses the y-axis.' },
    fi: { title: 'Kone ja y-akseli',
          task: 'Alla oleva kone kuuluu tähän suoraan. Ulos pitäisi tulla y-akselin piste. Minkä luvun syötät?',
          done: 'Oikein! Kun koneeseen syöttää 0, ulos tulee y-akselin leikkauspiste.' },
    tr: { title: 'Makine ve y ekseni',
          task: 'Aşağıdaki makine bu doğruya ait. y eksenindeki nokta çıksın. Hangi sayıyı girersin?',
          done: 'Doğru! Makineye 0 verirsen, y eksenini kestiği nokta çıkar.' },
    fr: { title: 'La machine et l’axe des y',
          task: 'La machine en bas correspond à cette droite. On veut obtenir le point sur l’axe des y. Quel nombre mets-tu ?',
          done: 'Bravo ! Si on met 0 dans la machine, on obtient le point d’intersection avec l’axe des y.' },
    es: { title: 'La máquina y el eje y',
          task: 'La máquina de abajo es de esta recta. Tiene que salir el punto del eje y. ¿Qué número metes?',
          done: '¡Correcto! Si le das 0 a la máquina, sale el punto de corte con el eje y.' },
    ja: { title: 'マシンと y 軸',
          task: '下のマシンはこの直線のマシンです。y 軸の上の点を出したい。どの数を入れる？',
          done: '正解！マシンに 0 を入れると、y 軸との交点が出てきます。' },
    ar: { title: 'الآلة ومحور y',
          task: 'الآلة في الأسفل تخص هذا المستقيم. نريد أن تخرج النقطة على محور y. أي عدد تدخل؟',
          done: 'صحيح! إذا أدخلت 0 في الآلة تخرج نقطة تقاطع المستقيم مع محور y.' }
  },
  nullfrage: true, tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
