// Level im Gitter: y = x + 2
App.level('funktionen', {
  id: 'achsenabschnitt',
  text: {
    de: { title: 'y-Achsenabschnitt',
          task: 'Zeichne y = x + 2. Die +2 sagt, wo die Gerade die y-Achse schneidet.',
          done: 'Richtig! Die +2 verschiebt die Gerade nach oben. Sie schneidet die y-Achse bei 2.' },
    en: { title: 'y-intercept',
          task: 'Draw y = x + 2. The +2 tells you where the line crosses the y-axis.',
          done: 'Right! The +2 moves the line up. It crosses the y-axis at 2.' }
  },
  eq: { m: 1, b: 2 }, xs: [0, 1, 2]
});
