// Level im Gitter: Herleitung an einer Beispielgeraden durch (1|1) und (3|5), in vier Schritten mit Weiter:
// Steigung m = Δy : Δx mit Zahlen, dann allgemein, dann bis zu einem beliebigen Punkt (x|y), dann y = m · (x − x₁) + y₁.
App.level('funktionen', {
  id: 'gleichung-zwei-punkte',
  text: {
    de: { title: 'Die Gleichung aus zwei Punkten',
          task: 'Wie kommt man von zwei Punkten zur Gleichung der Geraden? Tippe unten auf Weiter.',
          done: 'Geschafft! Mit m = Δy : Δx und einem Punkt (x₁|y₁) gilt: y = m · (x − x₁) + y₁.' },
    en: { title: 'The equation from two points',
          task: 'How do you get from two points to the equation of the line? Tap Next below.',
          done: 'Done! With m = Δy : Δx and a point (x₁|y₁): y = m · (x − x₁) + y₁.' },
    fi: { title: 'Yhtälö kahdesta pisteestä',
          task: 'Miten kahdesta pisteestä saadaan suoran yhtälö? Napauta alla Seuraava.',
          done: 'Valmis! Kun m = Δy : Δx ja piste on (x₁|y₁), pätee: y = m · (x − x₁) + y₁.' },
    tr: { title: 'İki noktadan denklem',
          task: 'İki noktadan doğrunun denklemine nasıl gidilir? Aşağıda Devam’a dokun.',
          done: 'Başardın! m = Δy : Δx ve bir (x₁|y₁) noktası ile: y = m · (x − x₁) + y₁.' },
    fr: { title: 'L’équation à partir de deux points',
          task: 'Comment passer de deux points à l’équation de la droite ? Touche Suivant en bas.',
          done: 'Réussi ! Avec m = Δy : Δx et un point (x₁|y₁) : y = m · (x − x₁) + y₁.' },
    es: { title: 'La ecuación con dos puntos',
          task: '¿Cómo se pasa de dos puntos a la ecuación de la recta? Toca Siguiente abajo.',
          done: '¡Hecho! Con m = Δy : Δx y un punto (x₁|y₁): y = m · (x − x₁) + y₁.' },
    ja: { title: '2つの点から式へ',
          task: '2つの点から直線の式はどうやって作る？下の「つぎへ」をタップしよう。',
          done: 'できた！m＝Δy÷Δx と点 (x₁|y₁) があれば：y＝m·(x − x₁)＋y₁。' },
    ar: { title: 'المعادلة من نقطتين',
          task: 'كيف نصل من نقطتين إلى معادلة المستقيم؟ اضغط «التالي» في الأسفل.',
          done: 'أحسنت! مع ⁦m = Δy : Δx⁩ ونقطة ⁦(x₁|y₁)⁩: ⁦y = m · (x − x₁) + y₁⁩.' }
  },
  zweipunkt: 'herleiten', tabelle: false, werkzeuge: ['clear']   // nur Weiter, unten nur der Papierkorb
});
