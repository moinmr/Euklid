// Level im Gitter: Was ist Steigung? Fünf Geraden nacheinander, steigende und fallende, jede mit gestricheltem
// Steigungsdreieck, das 1, 2 oder 3 Kästchen nach rechts geht. Die Steigung unten eintippen; grün erst nach der fünften.
App.level('funktionen', {
  id: 'steigung-ablesen',
  text: {
    de: { title: 'Was ist Steigung?',
          task: 'Steigung = Kästchen nach oben geteilt durch Kästchen nach rechts. Geht die Gerade nach unten, ist sie negativ.',
          done: 'Richtig! Du hast die Steigung von fünf Geraden bestimmt. Je größer die Zahl, desto steiler. Ist sie negativ, fällt die Gerade.' },
    en: { title: 'What is slope?',
          task: 'Slope = squares up divided by squares to the right. If the line goes down, the slope is negative.',
          done: 'Right! You found the slope of five lines. The bigger the number, the steeper. If it is negative, the line goes down.' },
    fi: { title: 'Mikä on kulmakerroin?',
          task: 'Kulmakerroin = ruudut ylös jaettuna ruuduilla oikealle. Jos suora laskee, se on negatiivinen.',
          done: 'Oikein! Määritit viiden suoran kulmakertoimen. Mitä suurempi luku, sitä jyrkempi. Jos se on negatiivinen, suora laskee.' },
    tr: { title: 'Eğim nedir?',
          task: 'Eğim = yukarı kare sayısı bölü sağa kare sayısı. Doğru aşağı iniyorsa eğim negatiftir.',
          done: 'Doğru! Beş doğrunun eğimini buldun. Sayı ne kadar büyükse doğru o kadar dik. Negatifse doğru aşağı iner.' },
    fr: { title: 'Qu’est-ce que la pente ?',
          task: 'Pente = carreaux vers le haut divisés par carreaux vers la droite. Si la droite descend, la pente est négative.',
          done: 'Bravo ! Tu as trouvé la pente de cinq droites. Plus le nombre est grand, plus c’est raide. S’il est négatif, la droite descend.' },
    es: { title: '¿Qué es la pendiente?',
          task: 'Pendiente = cuadritos hacia arriba entre cuadritos a la derecha. Si la recta baja, la pendiente es negativa.',
          done: '¡Correcto! Has hallado la pendiente de cinco rectas. Cuanto mayor el número, más empinada. Si es negativo, la recta baja.' },
    ja: { title: '傾きってなに？',
          task: '傾き＝上へのます数÷右へのます数。直線が下がるときは、傾きはマイナスです。',
          done: '正解！5本の直線の傾きを求めました。数が大きいほど急です。マイナスなら直線は下がります。' },
    ar: { title: 'ما هو الميل؟',
          task: 'الميل = عدد المربعات إلى الأعلى مقسومًا على عدد المربعات إلى اليمين. إذا نزل المستقيم يكون الميل سالبًا.',
          done: 'صحيح! وجدت ميل خمسة مستقيمات. كلما كبر العدد زاد الانحدار. وإذا كان سالبًا ينزل المستقيم.' }
  },
  steigung: true, tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
