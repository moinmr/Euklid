// Level im Gitter: zwei Punkte einer Geraden mit Koordinaten und gestricheltem Dreieck dazwischen.
// Wie weit nach rechts, wie weit nach oben? Nach dem Richtigen steht die Rechnung (x₂ − x₁, y₂ − y₁) am Dreieck. Drei Geraden.
App.level('funktionen', {
  id: 'punkt-zu-punkt',
  text: {
    de: { title: 'Von Punkt zu Punkt',
          task: 'Wie weit geht es vom linken Punkt zum rechten: nach rechts und nach oben? Nach unten ist negativ.',
          done: 'Richtig! Man muss nicht zählen: nach rechts = x rechts − x links, nach oben = y rechts − y links.' },
    en: { title: 'From point to point',
          task: 'How far is it from the left point to the right one: to the right and up? Down is negative.',
          done: 'Right! You don’t have to count: right = right x − left x, up = right y − left y.' },
    fi: { title: 'Pisteestä pisteeseen',
          task: 'Kuinka pitkä matka on vasemmasta pisteestä oikeaan: oikealle ja ylös? Alas on negatiivinen.',
          done: 'Oikein! Ei tarvitse laskea ruutuja: oikealle = oikean x − vasemman x, ylös = oikean y − vasemman y.' },
    tr: { title: 'Noktadan noktaya',
          task: 'Soldaki noktadan sağdakine ne kadar: sağa ve yukarı? Aşağı negatiftir.',
          done: 'Doğru! Saymana gerek yok: sağa = sağdaki x − soldaki x, yukarı = sağdaki y − soldaki y.' },
    fr: { title: 'D’un point à l’autre',
          task: 'Du point de gauche au point de droite : de combien vers la droite et vers le haut ? Vers le bas, c’est négatif.',
          done: 'Bravo ! Pas besoin de compter : vers la droite = x de droite − x de gauche, vers le haut = y de droite − y de gauche.' },
    es: { title: 'De punto a punto',
          task: '¿Cuánto hay del punto de la izquierda al de la derecha: hacia la derecha y hacia arriba? Hacia abajo es negativo.',
          done: '¡Correcto! No hace falta contar: a la derecha = x de la derecha − x de la izquierda, arriba = y de la derecha − y de la izquierda.' },
    ja: { title: '点から点へ',
          task: '左の点から右の点まで、右へいくつ、上へいくつ？下へはマイナスです。',
          done: '正解！数えなくてもいい：右へ＝右の x − 左の x、上へ＝右の y − 左の y。' },
    ar: { title: 'من نقطة إلى نقطة',
          task: 'كم المسافة من النقطة اليسرى إلى اليمنى: إلى اليمين وإلى الأعلى؟ إلى الأسفل سالب.',
          done: 'صحيح! لا حاجة للعدّ: إلى اليمين = x اليمنى − x اليسرى، إلى الأعلى = y اليمنى − y اليسرى.' }
  },
  zweipunkt: 'abstand', tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
