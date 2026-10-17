// Level im Gitter: y = x + 1: Tabelle rechnen, Punkte setzen, Gerade ziehen.
App.level('funktionen', {
  id: 'wertetabelle',
  text: {
    de: { title: 'Wertetabelle',
          task: 'Zeichne y = x + 1. Rechne y für x = 0, 1, 2, 3, setze die Punkte und zieh die Gerade durch sie.',
          done: 'Richtig! Jeder Schritt nach rechts bringt die Gerade um 1 nach oben.' },
    en: { title: 'Table of values',
          task: 'Draw y = x + 1. Work out y for x = 0, 1, 2, 3, plot the points and draw the line through them.',
          done: 'Right! Each step to the right takes the line 1 up.' }
  },
  eq: { m: 1, b: 1 }, xs: [0, 1, 2, 3]
});
