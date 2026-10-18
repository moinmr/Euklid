// Level im Gitter: fünf Geraden nacheinander. m und b ablesen und die Gleichung y = mx + b mit dem Finger ins Feld schreiben.
App.level('funktionen', {
  id: 'gerade-schreiben',
  text: {
    de: { title: 'Gleichung schreiben',
          task: 'Lies m und b an der Geraden ab. Schreib ihre Gleichung y = mx + b mit dem Finger ins Feld.',
          done: 'Richtig! b liest du an der y-Achse ab, m zählst du: 1 nach rechts, dann hoch oder runter.' },
    en: { title: 'Write the equation',
          task: 'Read m and b from the line. Write its equation y = mx + b in the box with your finger.',
          done: 'Right! You read b on the y-axis, and you count m: 1 to the right, then up or down.' },
    fi: { title: 'Kirjoita yhtälö',
          task: 'Lue m ja b suoralta. Kirjoita sen yhtälö y = mx + b sormella kenttään.',
          done: 'Oikein! b luetaan y-akselilta, m lasketaan: 1 oikealle, sitten ylös tai alas.' },
    tr: { title: 'Denklemi yaz',
          task: 'm ve b’yi doğrudan oku. Denklemini y = mx + b parmağınla alana yaz.',
          done: 'Doğru! b’yi y ekseninden okursun, m’yi sayarsın: 1 sağa, sonra yukarı ya da aşağı.' },
    fr: { title: 'Écrire l’équation',
          task: 'Lis m et b sur la droite. Écris son équation y = mx + b avec ton doigt dans le cadre.',
          done: 'Bravo ! b se lit sur l’axe des y, m se compte : 1 vers la droite, puis vers le haut ou le bas.' },
    es: { title: 'Escribe la ecuación',
          task: 'Lee m y b en la recta. Escribe su ecuación y = mx + b con el dedo en el recuadro.',
          done: '¡Correcto! b se lee en el eje y, m se cuenta: 1 a la derecha y luego hacia arriba o hacia abajo.' },
    ja: { title: '式を書こう',
          task: '直線から m と b を読み取ろう。その式 y = mx + b を指でわくに書こう。',
          done: '正解！b は y 軸で読み、m は数えます。右へ1、それから上か下へ。' },
    ar: { title: 'اكتب المعادلة',
          task: 'اقرأ m وb من المستقيم. اكتب معادلته ⁦y = mx + b⁩ بإصبعك في المربع.',
          done: 'صحيح! تقرأ b على محور y، وتعدّ m: واحدًا إلى اليمين، ثم إلى الأعلى أو الأسفل.' }
  },
  zweipunkt: 'hand', tabelle: false, werkzeuge: ['clear']   // schreiben im Feld unten, Papierkorb fängt neu an
});
