// Level: Das Taxi. Grundgebühr plus Preis pro km (zufällig), Tabelle für 1, 2, 3, 5 km. Falsche Antworten sind typische Denkfehler.
(function () {
// Aufgabentext mit den Preisen des aktuellen Taxis
function mitPreis(f) {
  return function () { var M = App.funk.M(); return f((M ? M.g : 3) + ' €', (M ? M.p : 2) + ' €'); };
}
App.level('funktionen', {
  id: 'taxi',
  text: {
    de: { title: 'Das Taxi',
          task: mitPreis(function (g, p) { return 'Ein Taxi kostet ' + g + ' Grundgebühr plus ' + p + ' pro Kilometer. Was kostet jede Fahrt?'; }),
          done: 'Richtig! Zu jeder Strecke gehört genau ein Preis. Das ist eine Funktion.' },
    en: { title: 'The taxi',
          task: mitPreis(function (g, p) { return 'A taxi costs a ' + g + ' base fare plus ' + p + ' per kilometre. What does each ride cost?'; }),
          done: 'Right! Each distance has exactly one price. That is a function.' },
    fi: { title: 'Taksi',
          task: mitPreis(function (g, p) { return 'Taksi maksaa ' + g + ' perusmaksun ja ' + p + ' kilometriltä. Paljonko kukin matka maksaa?'; }),
          done: 'Oikein! Jokaiseen matkaan kuuluu tasan yksi hinta. Se on funktio.' },
    tr: { title: 'Taksi',
          task: mitPreis(function (g, p) { return 'Bir taksi ' + g + ' açılış ücreti artı kilometre başına ' + p + ' tutuyor. Her yolculuk ne kadar?'; }),
          done: 'Doğru! Her mesafeye tam olarak bir fiyat düşer. Bu bir fonksiyondur.' },
    fr: { title: 'Le taxi',
          task: mitPreis(function (g, p) { return 'Un taxi coûte ' + g + ' de prise en charge plus ' + p + ' par kilomètre. Combien coûte chaque trajet ?'; }),
          done: 'Bravo ! À chaque distance correspond exactement un prix. C’est une fonction.' },
    es: { title: 'El taxi',
          task: mitPreis(function (g, p) { return 'Un taxi cuesta ' + g + ' de bajada de bandera más ' + p + ' por kilómetro. ¿Cuánto cuesta cada viaje?'; }),
          done: '¡Correcto! A cada distancia le corresponde exactamente un precio. Eso es una función.' },
    ja: { title: 'タクシー',
          task: mitPreis(function (g, p) { return 'タクシーは基本料金' + g + '、1キロごとに' + p + 'です。それぞれの料金はいくら？'; }),
          done: '正解！どの距離にもちょうど1つの料金が決まります。これが関数です。' },
    ar: { title: 'سيارة الأجرة',
          task: mitPreis(function (g, p) { return 'تكلف سيارة الأجرة ' + g + ' أجرة أساسية زائد ' + p + ' لكل كيلومتر. كم تكلف كل رحلة؟'; }),
          done: 'صحيح! لكل مسافة سعر واحد بالضبط. هذه دالة.' }
  },
  start: function (M) {
    var rnd = App.funk.rnd;
    M.g = 2 + rnd(3); M.p = 1 + rnd(3); M.rows = [1, 2, 3, 5]; M.i = 0; M.got = [];
    M.opts = opts(M);
  },
  html: function (M) {
    var html = '<div class="taxi"><div class="h">' +
      App.wahl({ de: 'Strecke', en: 'Distance', fi: 'Matka', tr: 'Mesafe', fr: 'Distance', es: 'Distancia', ja: '距離', ar: 'المسافة' }) +
      '</div><div class="h">' +
      App.wahl({ de: 'Preis', en: 'Price', fi: 'Hinta', tr: 'Fiyat', fr: 'Prix', es: 'Precio', ja: '料金', ar: 'السعر' }) + '</div>';
    for (var i = 0; i < M.rows.length; i++) {
      var cls = i < M.i ? 'good' : (i === M.i && !M.done ? 'cur' : '');
      // Aktuelle Zeile: Strecke in der Farbe für „rein“, Preis in der Farbe für „raus“
      var cur = cls === 'cur';
      html += '<div class="' + cls + (cur ? ' rein' : '') + '">' + M.rows[i] + ' km</div><div class="' + cls + (cur ? ' raus' : '') + '">' + (i < M.i ? M.got[i] + ' €' : '?') + '</div>';
    }
    html += '</div>';
    if (!M.done) {
      var km = M.rows[M.i];
      html += '<p class="q">' + App.wahl({ de: 'Was kostet eine Fahrt über ' + km + ' km?', en: 'What does a ' + km + ' km ride cost?',
        fi: 'Paljonko maksaa ' + km + ' km:n matka?', tr: km + ' km’lik yolculuk ne kadar?',
        fr: 'Combien coûte un trajet de ' + km + ' km ?', es: '¿Cuánto cuesta un viaje de ' + km + ' km?',
        ja: km + ' kmの料金はいくら？', ar: 'كم تكلف رحلة طولها ' + km + ' km؟' }) + '</p>' +
        App.funk.optButtons(M.opts, ' €');
    }
    return html;
  },
  click: function (M, act, d) {
    if (act !== 'ans') return;
    var km = M.rows[M.i], a = M.g + M.p * km;
    if (d.v === a) {
      M.got.push(a); M.i++; M.fb = '';
      if (M.i >= M.rows.length) {
        M.fb = { de: 'Alle Fahrten richtig berechnet.', en: 'All rides worked out correctly.', fi: 'Kaikki matkat laskettu oikein.',
                 tr: 'Tüm yolculuklar doğru hesaplandı.', fr: 'Tous les trajets sont bien calculés.', es: 'Todos los viajes calculados correctamente.',
                 ja: 'すべての料金を正しく計算できました。', ar: 'حسبت كل الرحلات بشكل صحيح.' };
        App.funk.finish();
      } else {
        M.opts = opts(M);
      }
    } else {
      M.fb = { de: 'Nicht ganz. Rechne: Grundgebühr plus Kilometer mal Preis pro Kilometer.',
               en: 'Not quite. Work it out: base fare plus kilometres times price per kilometre.',
               fi: 'Ei aivan. Laske: perusmaksu plus kilometrit kertaa kilometrihinta.',
               tr: 'Tam değil. Hesapla: açılış ücreti artı kilometre çarpı kilometre ücreti.',
               fr: 'Pas tout à fait. Calcule : prise en charge plus kilomètres fois prix par kilomètre.',
               es: 'Casi. Calcula: bajada de bandera más kilómetros por precio por kilómetro.',
               ja: 'おしい。基本料金 ＋ キロ数 × 1キロの料金 で計算しよう。',
               ar: 'ليس تمامًا. احسب: الأجرة الأساسية زائد عدد الكيلومترات ضرب سعر الكيلومتر.' };
    }
  }
});
function opts(M) {
  var km = M.rows[M.i], a = M.g + M.p * km;
  return App.funk.options(a, [a + M.p, a - M.p, a + 1, a - 1, M.p * km, M.g + km, M.g * km]);
}
})();
