# Mathe-App (Euklid und Funktionen)

Lern-App für Kinder, gebaut als Web-App aus mehreren kleinen Dateien (ohne Build-Schritt), läuft als installierte App auf einem Samsung-Android-Handy. Der Entwickler arbeitet nur am Handy, ohne PC.

## Regeln für die Zusammenarbeit

- Marcus arbeitet nur am Handy, ohne PC, und programmiert selbst nicht. Claude macht alle Änderungen am Code, auch das Umsortieren von Leveln.
- Erklärungen in einfachen Worten, ohne Code-Details: was sich in der App ändert.
- Claude lädt fertige, getestete Änderungen selbst direkt in den Hauptzweig (`main`) hoch. Danach ist die App in ein bis zwei Minuten aktuell.
- Immer vom neuesten Stand im Repository ausgehen.
- Parallel arbeiten: Mehrere Threads dürfen gleichzeitig an verschiedenen Leveln arbeiten (je Thread eigene Level-Dateien). Änderungen am Kern (`kern/`, `index.html`, `sw.js`) oder an einem `bereich.js` macht immer nur ein Thread zur Zeit. Vor dem Hochladen den neuesten Stand holen und zusammenführen.
- Level dürfen frei umsortiert werden, der Fortschritt bleibt erhalten (siehe "Fortschritt und Level-Kennungen").

## So läuft die App

- Hosting: GitHub Pages, Repository `moinmr/euklid` (öffentlich), Adresse `https://moinmr.github.io/euklid/`.
- Dateien im Repository: siehe "Aufbau" unten, dazu `manifest.webmanifest` (Anzeige `standalone`, Hochformat), `sw.js` (Service Worker), `icon-192.png`, `icon-512.png`.
- Installation: In Chrome die Adresse öffnen, dann "App installieren". Änderungen am Manifest greifen nur nach Deinstallieren und Neuinstallieren.
- Fortschritt liegt im Browser (localStorage), nur auf diesem Gerät. Schlüssel: `euklid-fortschritt` (Euklid), `euklid-funk` (Funktionen), `mathe-sprache` (aktuelle Sprache), `mathe-sprachpaar` (die zwei gewählten Sprachen). Die alten Stände aus `euklid-fortschritt-v1` und `euklid-funk-v3` werden beim ersten Start einmal übernommen.

## Aufbau

```
index.html                      Rahmen: Startseite, Symbolleiste, Zeichenfläche
sw.js                           Service Worker: holt frisch vom Server, speichert alles für offline
kern/dateien.js                 Liste aller Dateien; lädt sie der Reihe nach (auch vom Service Worker gelesen)
kern/sprache.js                 die zwei Sprachen (Deutsch, Englisch) und die Texte des Kerns
kern/kern.js                    Farben, Zustand S, Ansicht und Gesten, Zeichnen, Lupe, Berührung
kern/speicher.js                Fortschritt nach Level-Kennung speichern und laden
kern/oberflaeche.js             Startseite, Knöpfe, Aufgabentext, Sprach-Umschalter
kern/stil.css                   Aussehen
bereiche/liste.js               welche Bereiche es gibt (Karten auf der Startseite), in dieser Reihenfolge
bereiche/<bereich>/bereich.js   Werkzeuge und Logik des Bereichs
bereiche/<bereich>/reihenfolge.js  Reihenfolge der Level (nur Kennungen)
bereiche/<bereich>/level/<id>.js   ein Level pro Datei, mit Texten in beiden Sprachen
```

- Neues Level: Datei `level/<id>.js` anlegen (`App.level('<bereich>', { id, text: { de: {...}, en: {...} }, ... })`) und die Kennung in `reihenfolge.js` eintragen. Sonst nichts.
- Umsortieren: nur `reihenfolge.js` ändern.
- Neuer Bereich: Ordner `bereiche/<id>/` mit `bereich.js` (`App.bereich({ id, name, icon, werkzeuge, init, levels, solved, open, draw, down, move, up, check, undo, clear, next, persist })`), `reihenfolge.js` und `level/`, dann die Kennung in `bereiche/liste.js` eintragen. Eigener Speicher-Schlüssel, z. B. `mathe-<id>`.
- Sprachen: alle in `kern/sprache.js` (`App.sprachen`: Deutsch, Englisch, Finnisch, Türkisch, Französisch, Spanisch, Japanisch, Arabisch). Mit dem Globus oben links auf der Startseite wählt man Sprache 1 und Sprache 2; der Knopf DE EN (aktuelle in Blau) wechselt nur zwischen diesen zwei. Gespeichert unter `mathe-sprachpaar` und `mathe-sprache`. Texte stehen als `{ de: ..., en: ..., fi: ... }`; fehlt eine Sprache, springt Deutsch ein. Neue Level und neue Texte immer in allen Sprachen anlegen. Arabisch (`rtl: true`): nur Texte laufen von rechts nach links, Leisten und Zeichnung bleiben.
- Offline: Der Service Worker liest die Dateiliste aus `kern/dateien.js`, `bereiche/liste.js` und den `reihenfolge.js`. Ändert sich eine dieser Dateien, installiert er sich neu und speichert alles. Eine neue Kern-Datei muss in `kern/dateien.js` eingetragen werden.

## Hängt eine alte Version

App ganz schließen und neu öffnen. Hilft das nicht: in Chrome `.../index.html?v=N` öffnen (N hochzählen).

## Look und Bedienung

- Pergament (`#f5ebd1`), Tinte (`#382919`), Bleistift (grau), Blau für Linien (`#1a59cc`), Grün für Treffer und Erfolg, Rot zum Trennen.
- Schrift Jost: Normal für alles, nur die Level-Überschrift unten fett. Zahlen im Bild und Text unten gleiche Schrift.
- Leiste oben (allgemein): Haus, Pfeile ‹ › (immer in der Mitte), Sprechblase (Aufgabentext ein/aus), Sprachknopf (zeigt die Sprache, zu der man wechselt). Darunter der Aufgabentext als schwebende Karte (verschiebt nichts, Tippen blendet aus); er erscheint bei jedem neuen Level. "Geschafft" erscheint als eigene Karte unten über der Werkzeugleiste (der Aufgabentext oben bleibt stehen), mit einem ›-Knopf (die ganze Karte geht weiter zum nächsten Level).
- Leiste unten (Werkzeuge des Levels): Punkt, Linie, Zirkel, Ecke schieben, Trennen, Rückgängig (gebogener Pfeil), Papierkorb, Ansicht zurücksetzen. Bei Maschinen-Leveln nur der Papierkorb. Der Papierkorb setzt das Level zurück und stellt es auf ungelöst.
- Startseite "Mathe" mit zwei Karten: Euklid, Funktionen. Haus-Symbol und Zurück-Taste führen zur Startseite.
- Keine Längenwerte. Winkel nur als Zahl mit Gradzeichen.
- Lupe über dem Finger (2,5-fach), darf aus dem Bildschirm laufen.
- Zwei Finger: zoomen, verschieben, drehen (bei Funktionen ohne Drehen).

## Bereich Euklid

Konstruieren mit Linie und Zirkel auf einer vorgegebenen Strecke AB (Canvas, Pointer Events).

- Linie: erst tippen = Start, dann tippen = Ende. Ecken rasten ein (grün = verbinden).
- Zirkel: Spitze setzen, Radius mit zweitem Touch, dann Bogen auf dem weißen Hilfskreis ziehen. Bögen sind nur Hilfslinien (Bleistift), sie verbinden sich nicht mit Linien.
- Ecke schieben (mit Verbinden), Trennen (rot nur wenn mehrere Kanten zusammenkommen).
- Level: 1 Gleichseitiges Dreieck, 2 Sechseck, 3 Mittelsenkrechte. Prüfung geometrisch mit Toleranz. Gelöste Level und Lösungsbild werden gemerkt, angefangene Zeichnungen auch.
- Referenz: die frühere Kivy-Version `geometrie_app.py` (Pydroid 3) ist die Vorlage der Logik.

## Bereich Funktionen

Leitidee: Der Schüler erlebt zuerst, dann bekommt es einen Namen, dann wird es aufgeschrieben. Eine Funktion ist eine Zuordnung, die jeder Eingabe genau eine Ausgabe gibt.

| Level | Titel | Erkenntnis |
|---|---|---|
| 1 | Zuverlässige Maschinen | Gleiche Eingabe gibt immer gleiche Ausgabe. Eine Maschine ist zufällig kaputt. Antwort erst möglich, wenn beide mit derselben Zahl mindestens zweimal getestet wurden. |
| 2 | Was ist eine Funktion? | Zahl rein, Zahl raus. Die Regel steht sichtbar in der Box (z. B. 2·□ + 1), □ ist der Platz für die Zahl. Dreimal füttern, dann "Was kommt bei ... heraus?". |
| 3 | Variablen | Variablen: Eingabe und Ausgabe haben Namen (zufällig, auch y rein und x raus). Drei zufällige Paare stehen in der vollen Tabelle, Box zeigt ?, Frage: Welche Funktion? (vier Antworten) |
| 4 | Zwei Zahlenachsen | Wie Level 3, nur stehen die drei Paare als Linien zwischen zwei parallelen Zahlenachsen (oben rein, unten raus). |
| 5 | Koordinatensystem | Wie Level 3 und 4, nur sind die drei Paare Punkte im Koordinatensystem (x nach rechts, y nach oben). Namen stehen in den Kästchen rein und raus. |
| 6 | Funktion aufschreiben | Regel geheim, drei Paare in der vollen Tabelle; man schreibt die Funktion selbst in zwei Kästchen und drückt Prüfen (Kennung `maschine`). |
| 7 | Taxipreis | Alltag: Grundgebühr plus Preis pro km (zufällig). Tabelle für 1, 2, 3, 5 km, falsche Antworten sind typische Denkfehler. |
| 8 | Punkte setzen | Koordinaten. A(3\|2), B(−2\|4). Keine Liste, unten nur der Papierkorb; ein Punkt verschwindet beim zweiten Antippen. Falsche Punkte werden rot, mit Hinweis unten; gelöst erst ohne falsche Punkte. |
| 9 | Punkte verbinden | Zwei zufällige Punkte sind vorgegeben (Kennung `punkte-verbinden`). Unten nur der Papierkorb: Gerade durch beide ziehen, dann unten y = □·x + □ selbst ausfüllen und prüfen. Eine Linie, die einen Punkt verfehlt, wird rot, mit Hinweis. |
| 10 | Wertetabelle | y = x + 1, Tabelle rechnen, Punkte setzen, Gerade ziehen. |
| 11 | Steigung | y = 2x |
| 12 | Achsenabschnitt | y = x + 2 |
| 13 | Steigung und Achsenabschnitt | y = 2x − 1 |
| 14 | Fallende Gerade | y = −x + 3 |

- Level 1 bis 7 sind DOM-Overlays (`#mach`). Level 2 bis 6 entstehen aus Bausteinen in `App.funk.einstieg` (bereich.js). Farben: Orange = rein, Lila = raus, Grün = richtig, Menüs braun. Level 8 bis 14 laufen auf dem Canvas mit Koordinatensystem (1 Einheit = 40 px, y nach oben).
- Punkte rasten auf Gitterpunkte, die Gerade wird über zwei Punkte unendlich verlängert. Prüfung über die Gleichung, nicht über irgendeine Gerade.
- Nach den Punkten schaltet die App selbst auf das Linien-Werkzeug um.

## Mögliche nächste Schritte

- Level "Vom Taxi ins Bild": Taxi-Tabelle als Punkte im Gitter.
- Rückwärts: "Welche Eingabe ergibt 9?" mit Graph ablesen.
- Gegenbeispiel Nicht-Funktion im Graph (Kreis, senkrechte Gerade).
- Wort "Funktion" und Schreibweise f(x) einführen, danach Parabeln.
- Euklid: weitere Level (Winkelhalbierende, Lot, Quadrat).
- Optional: eigene Kinderprofile, Sterne, Ton.

## Technik-Hinweise für neue Chats

- Kein Build-Schritt: einfache Skripte, alles hängt an `window.App`. `S` = Zustand Euklid und Ansicht (`App.S`), Funktionen-Zustand `F` und Maschinen-Zustand `M` liegen in `bereiche/funktionen/bereich.js`.
- Euklid-Level bringen `pruefen(A, B, s, tol)` mit (Hilfen in `App.euklid`). Funktionen-Level sind entweder Maschinen-Level (`start`, `html`, `click`, Hilfen in `App.funk`) oder Gitter-Level (nur Daten `pts` bzw. `eq` und `xs`).
- Tests am Rechner: Oberfläche mit Playwright und Touch- bzw. Maus-Eingabe (Chromium vorhanden). Beim Umbau in Dateien wurde die alte Einzeldatei Bild für Bild gegen die neue Fassung verglichen.
- Fortschritt und Level-Kennungen: Jedes Level hat eine feste Kennung (`id`, z. B. `dreieck`, `taxi`, `negative-steigung`), gleich dem Dateinamen. Gelöste Level, Lösungsbilder und angefangene Zeichnungen werden nach dieser Kennung gespeichert, nicht nach der Position. Darum dürfen Level frei umsortiert werden, und die Nummer im Titel ergibt sich aus der Position.
- Eine Kennung nie ändern, sonst ist der Stand dieses Levels weg. Neue Level bekommen eine neue, eindeutige Kennung.
- Die Speicher-Schlüssel nicht mehr hochzählen.
- Google Fonts (Jost) braucht Netz, offline fällt die Schrift auf die Systemschrift zurück.
