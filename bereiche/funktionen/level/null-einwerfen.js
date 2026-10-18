// Level im Gitter: eine Gerade ist vorgegeben, unten nur Zahlentasten und Prüfen.
// Welche Zahl muss hinein, damit der Schnittpunkt mit der y-Achse herauskommt? Richtig ist 0.
App.level('funktionen', {
  id: 'null-einwerfen',
  text: {
    de: { title: 'Die Maschine und die y-Achse',
          task: 'Zu dieser Geraden gehört eine Maschine. Welche Zahl gibst du hinein, damit der Punkt auf der y-Achse herauskommt?',
          done: 'Richtig! Gibt man 0 in die Maschine, kommt der Schnittpunkt mit der y-Achse heraus.' },
    en: { title: 'The machine and the y-axis',
          task: 'This line has a machine. Which number do you put in so that the point on the y-axis comes out?',
          done: 'Right! If you put 0 into the machine, out comes the point where the line crosses the y-axis.' },
    fi: { title: 'Kone ja y-akseli',
          task: 'Tähän suoraan kuuluu kone. Minkä luvun syötät, jotta ulos tulee y-akselin piste?',
          done: 'Oikein! Kun koneeseen syöttää 0, ulos tulee y-akselin leikkauspiste.' },
    tr: { title: 'Makine ve y ekseni',
          task: 'Bu doğrunun bir makinesi var. y eksenindeki noktanın çıkması için hangi sayıyı girersin?',
          done: 'Doğru! Makineye 0 verirsen, y eksenini kestiği nokta çıkar.' },
    fr: { title: 'La machine et l’axe des y',
          task: 'Cette droite a une machine. Quel nombre mets-tu pour obtenir le point sur l’axe des y ?',
          done: 'Bravo ! Si on met 0 dans la machine, on obtient le point d’intersection avec l’axe des y.' },
    es: { title: 'La máquina y el eje y',
          task: 'Esta recta tiene una máquina. ¿Qué número metes para que salga el punto del eje y?',
          done: '¡Correcto! Si le das 0 a la máquina, sale el punto de corte con el eje y.' },
    ja: { title: 'マシンと y 軸',
          task: 'この直線にはマシンがあります。y 軸の上の点が出てくるには、どの数を入れる？',
          done: '正解！マシンに 0 を入れると、y 軸との交点が出てきます。' },
    ar: { title: 'الآلة ومحور y',
          task: 'لهذا المستقيم آلة. أي عدد تدخل حتى تخرج النقطة على محور y؟',
          done: 'صحيح! إذا أدخلت 0 في الآلة تخرج نقطة تقاطع المستقيم مع محور y.' }
  },
  nullfrage: true, tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
