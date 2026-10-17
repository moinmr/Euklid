// Level im Gitter: y = 2x
App.level('funktionen', {
  id: 'steigung',
  text: {
    de: { title: 'Steigung',
          task: 'Zeichne y = 2x. Pro Schritt nach rechts geht es um 2 nach oben. Setze die Punkte und zieh die Gerade.',
          done: 'Richtig! Die Steigung ist 2: Pro Schritt nach rechts geht es 2 nach oben.' },
    en: { title: 'Slope',
          task: 'Draw y = 2x. For each step to the right it goes 2 up. Plot the points and draw the line.',
          done: 'Right! The slope is 2: for each step to the right it goes 2 up.' }
  },
  eq: { m: 2, b: 0 }, xs: [0, 1, 2]
});
