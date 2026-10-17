// Level im Gitter: y = 2x − 1
App.level('funktionen', {
  id: 'steigung-achsenabschnitt',
  text: {
    de: { title: 'Steigung und Achsenabschnitt',
          task: 'Zeichne y = 2x − 1. Setze die Punkte für x = 0, 1, 2 und zieh die Gerade.',
          done: 'Richtig! Steigung 2, und die Gerade schneidet die y-Achse bei −1.' },
    en: { title: 'Slope and intercept',
          task: 'Draw y = 2x − 1. Plot the points for x = 0, 1, 2 and draw the line.',
          done: 'Right! Slope 2, and the line crosses the y-axis at −1.' }
  },
  eq: { m: 2, b: -1 }, xs: [0, 1, 2]
});
