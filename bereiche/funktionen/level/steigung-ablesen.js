// Level im Gitter: Was ist Steigung? Drei Geraden mit Steigung 1, 2 und 3 (gemischt) und gestricheltem Steigungsdreieck.
// Die Steigungen unten eintippen. Nach dem Lösen stehen die Gleichungen an den Geraden.
App.level('funktionen', {
  id: 'steigung-ablesen',
  text: {
    de: { title: 'Was ist Steigung?',
          task: 'Die Steigung sagt, wie viele Kästchen eine Gerade nach oben geht, wenn man 1 Kästchen nach rechts geht. Wie groß ist die Steigung von A, B und C?',
          done: 'Richtig! Die Steigung ist die Zahl vor dem x. Je größer sie ist, desto steiler ist die Gerade.' },
    en: { title: 'What is slope?',
          task: 'The slope tells how many squares a line goes up when you go 1 square to the right. What is the slope of A, B and C?',
          done: 'Right! The slope is the number in front of x. The bigger it is, the steeper the line.' },
    fi: { title: 'Mikä on kulmakerroin?',
          task: 'Kulmakerroin kertoo, montako ruutua suora nousee, kun mennään 1 ruutu oikealle. Mikä on suorien A, B ja C kulmakerroin?',
          done: 'Oikein! Kulmakerroin on x:n edessä oleva luku. Mitä suurempi se on, sitä jyrkempi suora.' },
    tr: { title: 'Eğim nedir?',
          task: 'Eğim, sağa 1 kare gidince doğrunun kaç kare yukarı çıktığını söyler. A, B ve C’nin eğimi kaç?',
          done: 'Doğru! Eğim, x’in önündeki sayıdır. Ne kadar büyükse doğru o kadar diktir.' },
    fr: { title: 'Qu’est-ce que la pente ?',
          task: 'La pente indique de combien de carreaux une droite monte quand on avance de 1 carreau vers la droite. Quelle est la pente de A, B et C ?',
          done: 'Bravo ! La pente est le nombre devant le x. Plus il est grand, plus la droite est raide.' },
    es: { title: '¿Qué es la pendiente?',
          task: 'La pendiente dice cuántos cuadritos sube una recta cuando avanzas 1 cuadrito a la derecha. ¿Cuál es la pendiente de A, B y C?',
          done: '¡Correcto! La pendiente es el número delante de la x. Cuanto mayor es, más empinada es la recta.' },
    ja: { title: '傾きってなに？',
          task: '傾きは、右へ1ます進むと直線が上へ何ます進むかを表します。A、B、C の傾きはいくつ？',
          done: '正解！傾きは x の前の数です。大きいほど直線は急になります。' },
    ar: { title: 'ما هو الميل؟',
          task: 'الميل يخبرنا بعدد المربعات التي يصعدها المستقيم عندما نتحرك مربعًا واحدًا إلى اليمين. ما ميل A وB وC؟',
          done: 'صحيح! الميل هو العدد الذي أمام x. كلما كان أكبر كان المستقيم أشد انحدارًا.' }
  },
  steigung: true, tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
