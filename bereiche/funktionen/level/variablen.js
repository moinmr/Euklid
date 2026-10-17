// Level: Zahlen mit Namen. Eingabe und Ausgabe bekommen Variablen-Namen (zufällig, z. B. a und b),
// die Funktion steht als Zeile da, jede Fütterung kommt in eine Tabelle.
// Runde 1: Frage mit den ersten Namen. Runde 2: gleiche Maschine, neue Namen (y rein, x raus).
App.level('funktionen', App.funk.einstieg({
  id: 'variablen',
  text: {
    de: { title: 'Zahlen mit Namen',
          task: 'Die Zahl, die reingeht, bekommt einen Namen, und die Zahl, die rauskommt, auch. So ein Name heißt Variable. Füttere die Maschine und schau dir die Tabelle an.',
          done: 'Richtig! Der Name ist egal. Wichtig ist nur, welche Zahl reingeht und welche rauskommt.' },
    en: { title: 'Numbers with names',
          task: 'The number that goes in gets a name, and so does the number that comes out. Such a name is called a variable. Feed the machine and look at the table.',
          done: 'Right! The name does not matter. What matters is which number goes in and which comes out.' },
    fi: { title: 'Luvut, joilla on nimi',
          task: 'Sisään menevä luku saa nimen, ja niin saa myös ulos tuleva luku. Tällaista nimeä kutsutaan muuttujaksi. Syötä koneeseen ja katso taulukkoa.',
          done: 'Oikein! Nimellä ei ole väliä. Tärkeää on vain, mikä luku menee sisään ja mikä tulee ulos.' },
    tr: { title: 'Adı olan sayılar',
          task: 'Giren sayıya bir ad verilir, çıkan sayıya da. Böyle bir ada değişken denir. Makineyi besle ve tabloya bak.',
          done: 'Doğru! Adın önemi yok. Önemli olan hangi sayının girip hangisinin çıktığı.' },
    fr: { title: 'Des nombres avec un nom',
          task: 'Le nombre qui entre reçoit un nom, et celui qui sort aussi. Un tel nom s’appelle une variable. Nourris la machine et regarde le tableau.',
          done: 'Bravo ! Le nom n’a pas d’importance. Ce qui compte, c’est quel nombre entre et lequel sort.' },
    es: { title: 'Números con nombre',
          task: 'El número que entra recibe un nombre, y el que sale también. Ese nombre se llama variable. Alimenta la máquina y mira la tabla.',
          done: '¡Correcto! El nombre no importa. Lo que importa es qué número entra y cuál sale.' },
    ja: { title: '名前のついた数',
          task: '入る数にも出る数にも名前をつけます。このような名前を変数といいます。マシンに数を入れて、表を見てみよう。',
          done: '正解！名前は何でもかまいません。大切なのは、どの数が入り、どの数が出るかです。' },
    ar: { title: 'أعداد لها أسماء',
          task: 'العدد الذي يدخل يأخذ اسمًا، وكذلك العدد الذي يخرج. يسمى هذا الاسم متغيرًا. أدخل أعدادًا في الآلة وانظر إلى الجدول.',
          done: 'صحيح! الاسم لا يهم. المهم هو أي عدد يدخل وأي عدد يخرج.' }
  },
  regel: function () { return { m: 1 + App.funk.rnd(2), b: 1 + App.funk.rnd(4) }; },
  namen: 'wechsel', fn: true, tabelle: true, frage: 'wert'
}));
