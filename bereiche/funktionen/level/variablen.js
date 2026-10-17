// Level: Zahlen mit Namen. Eingabe und Ausgabe haben Variablen-Namen (zufällig, auch y rein und x raus).
// Drei zufällige Paare stehen schon in der vollen Tabelle, in der Box steht ?. Frage: Welche Funktion ist es?
App.level('funktionen', App.funk.einstieg({
  id: 'variablen',
  text: {
    de: { title: 'Zahlen mit Namen',
          task: 'Die Zahl, die reingeht, hat einen Namen, und die Zahl, die rauskommt, auch. So ein Name heißt Variable. In der Tabelle stehen drei Paare. Welche Funktion steckt in der Maschine?',
          done: 'Richtig! Der Name ist egal. Wichtig ist nur, welche Zahl reingeht und welche rauskommt.' },
    en: { title: 'Numbers with names',
          task: 'The number that goes in has a name, and so does the number that comes out. Such a name is called a variable. The table shows three pairs. Which function is inside the machine?',
          done: 'Right! The name does not matter. What matters is which number goes in and which comes out.' },
    fi: { title: 'Luvut, joilla on nimi',
          task: 'Sisään menevällä luvulla on nimi, ja niin on myös ulos tulevalla luvulla. Tällaista nimeä kutsutaan muuttujaksi. Taulukossa on kolme paria. Mikä funktio koneen sisällä on?',
          done: 'Oikein! Nimellä ei ole väliä. Tärkeää on vain, mikä luku menee sisään ja mikä tulee ulos.' },
    tr: { title: 'Adı olan sayılar',
          task: 'Giren sayının bir adı var, çıkan sayının da. Böyle bir ada değişken denir. Tabloda üç çift var. Makinenin içinde hangi fonksiyon var?',
          done: 'Doğru! Adın önemi yok. Önemli olan hangi sayının girip hangisinin çıktığı.' },
    fr: { title: 'Des nombres avec un nom',
          task: 'Le nombre qui entre a un nom, et celui qui sort aussi. Un tel nom s’appelle une variable. Le tableau montre trois paires. Quelle fonction se cache dans la machine ?',
          done: 'Bravo ! Le nom n’a pas d’importance. Ce qui compte, c’est quel nombre entre et lequel sort.' },
    es: { title: 'Números con nombre',
          task: 'El número que entra tiene un nombre, y el que sale también. Ese nombre se llama variable. La tabla muestra tres parejas. ¿Qué función hay dentro de la máquina?',
          done: '¡Correcto! El nombre no importa. Lo que importa es qué número entra y cuál sale.' },
    ja: { title: '名前のついた数',
          task: '入る数にも出る数にも名前があります。このような名前を変数といいます。表に3つの組があります。マシンの中の関数はどれ？',
          done: '正解！名前は何でもかまいません。大切なのは、どの数が入り、どの数が出るかです。' },
    ar: { title: 'أعداد لها أسماء',
          task: 'العدد الذي يدخل له اسم، وكذلك العدد الذي يخرج. يسمى هذا الاسم متغيرًا. في الجدول ثلاثة أزواج. ما الدالة الموجودة داخل الآلة؟',
          done: 'صحيح! الاسم لا يهم. المهم هو أي عدد يدخل وأي عدد يخرج.' }
  },
  regel: function () { return { m: 1 + App.funk.rnd(2), b: 1 + App.funk.rnd(4) }; },
  namen: 'zufall', vorgabe: 3, geheim: true, tabelle: 'voll', frage: 'funktion'
}));
