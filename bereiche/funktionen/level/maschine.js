// Level: Funktion aufschreiben. Die Regel ist geheim (zufällig y = m·x + b), drei Paare stehen schon in der Tabelle.
// Man schreibt die Funktion selbst: Kästchen antippen, dann Zahl. Die Kennung bleibt 'maschine' (Fortschritt).
App.level('funktionen', App.funk.einstieg({
  id: 'maschine',
  text: {
    de: { title: 'Funktion aufschreiben',
          task: 'Die Regel ist geheim. In der Tabelle stehen drei Paare. Schreib die Funktion selbst: Tippe auf ein Kästchen und dann auf eine Zahl.',
          done: 'Richtig! Du hast die Funktion selbst aufgeschrieben.' },
    en: { title: 'Write the function',
          task: 'The rule is secret. The table shows three pairs. Write the function yourself: tap a box, then a number.',
          done: 'Right! You wrote the function yourself.' },
    fi: { title: 'Kirjoita funktio',
          task: 'Sääntö on salainen. Taulukossa on kolme paria. Kirjoita funktio itse: napauta laatikkoa ja sitten lukua.',
          done: 'Oikein! Kirjoitit funktion itse.' },
    tr: { title: 'Fonksiyonu yaz',
          task: 'Kural gizli. Tabloda üç çift var. Fonksiyonu kendin yaz: bir kutuya, sonra bir sayıya dokun.',
          done: 'Doğru! Fonksiyonu kendin yazdın.' },
    fr: { title: 'Écris la fonction',
          task: 'La règle est secrète. Le tableau montre trois paires. Écris la fonction toi-même : touche une case, puis un nombre.',
          done: 'Bravo ! Tu as écrit la fonction toi-même.' },
    es: { title: 'Escribe la función',
          task: 'La regla es secreta. La tabla muestra tres parejas. Escribe tú la función: toca una casilla y luego un número.',
          done: '¡Correcto! Has escrito la función tú solo.' },
    ja: { title: '関数を書こう',
          task: 'きまりはひみつです。表に3つの組があります。関数を自分で書こう：□をタップしてから数をタップします。',
          done: '正解！関数を自分で書けました。' },
    ar: { title: 'اكتب الدالة',
          task: 'القاعدة سرية. في الجدول ثلاثة أزواج. اكتب الدالة بنفسك: انقر على مربع ثم على عدد.',
          done: 'صحيح! كتبت الدالة بنفسك.' }
  },
  regel: function () { return { m: 2 + App.funk.rnd(2), b: App.funk.rnd(5) }; },
  namen: ['x', 'y'], vorgabe: 3, geheim: true, tabelle: 'voll', frage: 'schreiben'
}));
