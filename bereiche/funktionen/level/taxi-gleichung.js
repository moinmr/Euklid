// Level: Taxipreis mit Geradengleichung. Oben Grundgebühr und Preis pro km (zufällig). Erst die Gleichung y = px + g
// mit dem Finger ins Feld schreiben, dann kosten drei Fahrten (2, 5, 10 km); Auswahl mit typischen Denkfehlern.
(function () {
// Aufgabentext mit den Preisen des aktuellen Taxis
function mitPreis(f) { return function () { var t = App.funk.taxi(); return f(t.g + ' €', t.p + ' €'); }; }
function mitGl(f) { return function () { return f(App.funk.taxiGl()); }; }
App.level('funktionen', {
  id: 'taxi-gleichung',
  text: {
    de: { title: 'Taxipreis',
          task: mitPreis(function (g, p) { return 'Ein Taxi kostet ' + g + ' Grundgebühr plus ' + p + ' pro Kilometer. x sind die Kilometer, y ist der Preis. Schreib die Geradengleichung mit dem Finger ins Feld.'; }),
          done: mitGl(function (q) { return 'Richtig! Mit ' + q + ' rechnest du jeden Fahrpreis aus. Die Steigung ist der Preis pro Kilometer, der y-Achsenabschnitt die Grundgebühr.'; }) },
    en: { title: 'Taxi fare',
          task: mitPreis(function (g, p) { return 'A taxi costs a ' + g + ' base fare plus ' + p + ' per kilometre. x is the kilometres, y is the price. Write the equation of the line in the box with your finger.'; }),
          done: mitGl(function (q) { return 'Right! With ' + q + ' you can work out every fare. The slope is the price per kilometre, the y-intercept the base fare.'; }) },
    fi: { title: 'Taksin hinta',
          task: mitPreis(function (g, p) { return 'Taksi maksaa ' + g + ' perusmaksun ja ' + p + ' kilometriltä. x on kilometrit, y on hinta. Kirjoita suoran yhtälö sormella kenttään.'; }),
          done: mitGl(function (q) { return 'Oikein! Yhtälöllä ' + q + ' lasket minkä tahansa matkan hinnan. Kulmakerroin on kilometrihinta, y-akselin leikkauskohta perusmaksu.'; }) },
    tr: { title: 'Taksi ücreti',
          task: mitPreis(function (g, p) { return 'Bir taksi ' + g + ' açılış ücreti artı kilometre başına ' + p + ' tutuyor. x kilometre, y fiyat. Doğrunun denklemini parmağınla alana yaz.'; }),
          done: mitGl(function (q) { return 'Doğru! ' + q + ' ile her yolculuğun fiyatını hesaplarsın. Eğim kilometre ücreti, y eksenini kestiği yer açılış ücreti.'; }) },
    fr: { title: 'Le prix du taxi',
          task: mitPreis(function (g, p) { return 'Un taxi coûte ' + g + ' de prise en charge plus ' + p + ' par kilomètre. x, ce sont les kilomètres, y le prix. Écris l’équation de la droite avec ton doigt dans le cadre.'; }),
          done: mitGl(function (q) { return 'Bravo ! Avec ' + q + ', tu calcules le prix de chaque trajet. La pente est le prix par kilomètre, l’ordonnée à l’origine la prise en charge.'; }) },
    es: { title: 'La tarifa del taxi',
          task: mitPreis(function (g, p) { return 'Un taxi cuesta ' + g + ' de bajada de bandera más ' + p + ' por kilómetro. x son los kilómetros, y el precio. Escribe la ecuación de la recta con el dedo en el recuadro.'; }),
          done: mitGl(function (q) { return '¡Correcto! Con ' + q + ' calculas el precio de cualquier viaje. La pendiente es el precio por kilómetro, la ordenada en el origen la bajada de bandera.'; }) },
    ja: { title: 'タクシー料金',
          task: mitPreis(function (g, p) { return 'タクシーは基本料金' + g + '、1キロごとに' + p + 'です。x はキロ数、y は料金。直線の式を指でわくに書こう。'; }),
          done: mitGl(function (q) { return '正解！' + q + ' でどんな料金も計算できます。傾きは1キロごとの料金、切片は基本料金です。'; }) },
    ar: { title: 'أجرة التاكسي',
          task: mitPreis(function (g, p) { return 'تكلف سيارة الأجرة ' + g + ' أجرة أساسية زائد ' + p + ' لكل كيلومتر. x هو عدد الكيلومترات، وy هو السعر. اكتب معادلة المستقيم بإصبعك في المربع.'; }),
          done: mitGl(function (q) { return 'صحيح! بالمعادلة ⁦' + q + '⁩ تحسب أجرة أي رحلة. الميل هو سعر الكيلومتر، والجزء المقطوع من محور y هو الأجرة الأساسية.'; }) }
  },
  handschrift: true, tabelle: false, werkzeuge: ['clear']   // schreiben im Feld unten, Papierkorb fängt neu an
});
})();
