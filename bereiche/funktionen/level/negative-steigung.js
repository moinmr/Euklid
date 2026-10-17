// Level im Gitter: y = −x + 3
App.level('funktionen', {
  id: 'negative-steigung',
  text: {
    de: { title: 'Negative Steigung',
          task: 'Zeichne y = −x + 3. Setze die Punkte für x = 0, 1, 2, 3 und zieh die Gerade.',
          done: 'Richtig! Bei negativer Steigung geht die Gerade nach rechts nach unten.' },
    en: { title: 'Negative slope',
          task: 'Draw y = −x + 3. Plot the points for x = 0, 1, 2, 3 and draw the line.',
          done: 'Right! With a negative slope the line goes down to the right.' }
  },
  eq: { m: -1, b: 3 }, xs: [0, 1, 2, 3]
});
