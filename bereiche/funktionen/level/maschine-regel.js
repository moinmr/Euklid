// Level: Die Maschine. Die Regel steht sichtbar in der Box, □ ist der Platz für die Zahl, die reingeht.
// Dreimal füttern, dann "Was kommt bei ... heraus?". Bausteine in App.funk.einstieg (bereich.js).
App.level('funktionen', App.funk.einstieg({
  id: 'maschine-regel',
  text: {
    de: { title: 'Die Maschine',
          task: 'Tippe auf eine Zahl. Sie fällt in die Maschine, und die Maschine rechnet mit ihr. Das Kästchen □ steht für deine Zahl.',
          done: 'Richtig! Die Maschine rechnet mit jeder Zahl nach derselben Regel.' },
    en: { title: 'The machine',
          task: 'Tap a number. It drops into the machine, and the machine calculates with it. The box □ stands for your number.',
          done: 'Right! The machine uses the same rule for every number.' },
    fi: { title: 'Kone',
          task: 'Napauta lukua. Se putoaa koneeseen, ja kone laskee sillä. Laatikko □ tarkoittaa sinun lukuasi.',
          done: 'Oikein! Kone laskee jokaisella luvulla saman säännön mukaan.' },
    tr: { title: 'Makine',
          task: 'Bir sayıya dokun. Sayı makineye düşer ve makine onunla hesap yapar. □ kutusu senin sayın yerine geçer.',
          done: 'Doğru! Makine her sayı için aynı kuralı kullanır.' },
    fr: { title: 'La machine',
          task: 'Touche un nombre. Il tombe dans la machine, et la machine calcule avec lui. La case □ représente ton nombre.',
          done: 'Bravo ! La machine utilise la même règle pour chaque nombre.' },
    es: { title: 'La máquina',
          task: 'Toca un número. Cae en la máquina y la máquina calcula con él. La casilla □ representa tu número.',
          done: '¡Correcto! La máquina usa la misma regla con cada número.' },
    ja: { title: 'マシン',
          task: '数をタップしよう。数がマシンに入り、マシンがその数で計算します。□ はきみが選んだ数のことです。',
          done: '正解！マシンはどの数にも同じきまりで計算します。' },
    ar: { title: 'الآلة',
          task: 'اضغط على عدد. يسقط في الآلة، والآلة تحسب به. المربع □ يمثل عددك.',
          done: 'صحيح! الآلة تستخدم القاعدة نفسها مع كل عدد.' }
  },
  regel: function () { return { m: 1 + App.funk.rnd(2), b: 1 + App.funk.rnd(4) }; },
  namen: null, liste: true, frage: 'wert'
}));
