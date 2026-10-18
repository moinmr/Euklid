// Level ohne Gitter: nur eine Gerade, zwei Punkte mit Koordinaten und das Dreieck. Die Steigung aus den Koordinaten
// ausrechnen, Kästchen zählen geht nicht. Nach dem Richtigen steht die Rechnung am Dreieck. Drei Geraden.
App.level('funktionen', {
  id: 'steigung-ohne-gitter',
  text: {
    de: { title: 'Steigung ohne Kästchen',
          task: 'Hier gibt es keine Kästchen zum Zählen. Berechne die Steigung aus den zwei Punkten.',
          done: 'Richtig! Steigung = (y₂ − y₁) : (x₂ − x₁). Zwei Punkte genügen.' },
    en: { title: 'Slope without squares',
          task: 'There are no squares to count here. Work out the slope from the two points.',
          done: 'Right! Slope = (y₂ − y₁) : (x₂ − x₁). Two points are enough.' },
    fi: { title: 'Kulmakerroin ilman ruutuja',
          task: 'Tässä ei ole ruutuja laskettavaksi. Laske kulmakerroin kahdesta pisteestä.',
          done: 'Oikein! Kulmakerroin = (y₂ − y₁) : (x₂ − x₁). Kaksi pistettä riittää.' },
    tr: { title: 'Karesiz eğim',
          task: 'Burada sayılacak kare yok. Eğimi iki noktadan hesapla.',
          done: 'Doğru! Eğim = (y₂ − y₁) : (x₂ − x₁). İki nokta yeter.' },
    fr: { title: 'La pente sans carreaux',
          task: 'Ici, pas de carreaux à compter. Calcule la pente à partir des deux points.',
          done: 'Bravo ! Pente = (y₂ − y₁) : (x₂ − x₁). Deux points suffisent.' },
    es: { title: 'Pendiente sin cuadritos',
          task: 'Aquí no hay cuadritos para contar. Calcula la pendiente con los dos puntos.',
          done: '¡Correcto! Pendiente = (y₂ − y₁) : (x₂ − x₁). Con dos puntos basta.' },
    ja: { title: 'ますなしで傾き',
          task: 'ここには数えるますがありません。2つの点から傾きを計算しよう。',
          done: '正解！傾き＝(y₂ − y₁)÷(x₂ − x₁)。2つの点があれば十分です。' },
    ar: { title: 'الميل بدون مربعات',
          task: 'لا توجد هنا مربعات للعدّ. احسب الميل من النقطتين.',
          done: 'صحيح! الميل = \u2066(y₂ − y₁) : (x₂ − x₁)\u2069. تكفي نقطتان.' }
  },
  zweipunkt: 'ohnegitter', tabelle: false, werkzeuge: ['clear']   // nichts zeichnen, unten nur der Papierkorb
});
