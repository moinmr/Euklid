// Level im Gitter: Koordinaten: zwei Punkte nach Angabe setzen.
App.level('funktionen', {
  id: 'punkte',
  text: {
    de: { title: 'Punkte setzen',
          task: 'Setze A(3|2) und B(−2|4). Die erste Zahl geht nach rechts, die zweite nach oben. Minus heißt links oder unten.',
          done: 'Richtig! Der erste Wert ist die Position nach rechts, der zweite nach oben.' },
    en: { title: 'Plotting points',
          task: 'Plot A(3|2) and B(−2|4). The first number goes to the right, the second one goes up. Minus means left or down.',
          done: 'Right! The first value is the position to the right, the second one upwards.' }
  },
  pts: [{ n: 'A', x: 3, y: 2 }, { n: 'B', x: -2, y: 4 }]
});
