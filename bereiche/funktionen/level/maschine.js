// Level: Funktion raten. Die Regel ist geheim (zufällig y = m·x + b), Tabelle mit x und y.
// Nach drei Fütterungen: Welche Funktion steckt in der Maschine? Die Kennung bleibt 'maschine' (Fortschritt).
App.level('funktionen', App.funk.einstieg({
  id: 'maschine',
  text: {
    de: { title: 'Funktion raten',
          task: 'Die Regel ist geheim. Füttere die Maschine, schau dir die Tabelle an und finde die Funktion.',
          done: 'Richtig! Du hast die Funktion aus der Tabelle erkannt.' },
    en: { title: 'Guess the function',
          task: 'The rule is secret. Feed the machine, look at the table and find the function.',
          done: 'Right! You found the function from the table.' },
    fi: { title: 'Arvaa funktio',
          task: 'Sääntö on salainen. Syötä koneeseen, katso taulukkoa ja löydä funktio.',
          done: 'Oikein! Löysit funktion taulukon avulla.' },
    tr: { title: 'Fonksiyonu bul',
          task: 'Kural gizli. Makineyi besle, tabloya bak ve fonksiyonu bul.',
          done: 'Doğru! Fonksiyonu tablodan buldun.' },
    fr: { title: 'Devine la fonction',
          task: 'La règle est secrète. Nourris la machine, regarde le tableau et trouve la fonction.',
          done: 'Bravo ! Tu as trouvé la fonction grâce au tableau.' },
    es: { title: 'Adivina la función',
          task: 'La regla es secreta. Alimenta la máquina, mira la tabla y encuentra la función.',
          done: '¡Correcto! Encontraste la función a partir de la tabla.' },
    ja: { title: '関数を当てよう',
          task: 'きまりはひみつです。マシンに数を入れて、表を見て、関数を見つけよう。',
          done: '正解！表から関数を見つけました。' },
    ar: { title: 'خمّن الدالة',
          task: 'القاعدة سرية. أدخل أعدادًا في الآلة، وانظر إلى الجدول، واكتشف الدالة.',
          done: 'صحيح! اكتشفت الدالة من الجدول.' }
  },
  regel: function () { return { m: 2 + App.funk.rnd(2), b: App.funk.rnd(5) }; },
  namen: ['x', 'y'], geheim: true, tabelle: true, frage: 'funktion'
}));
