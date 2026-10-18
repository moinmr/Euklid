# Mathe-App (Funktionen, Winkel, Euklid)

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
- Fortschritt liegt im Browser (localStorage), nur auf diesem Gerät. Schlüssel: `euklid-fortschritt` (Euklid), `euklid-funk` (Funktionen), `mathe-winkel` (Winkel), `mathe-sprache` (aktuelle Sprache), `mathe-sprachpaar` (die zwei gewählten Sprachen). Die alten Stände aus `euklid-fortschritt-v1` und `euklid-funk-v3` werden beim ersten Start einmal übernommen.

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
- Startseite "Mathe" mit drei Karten in dieser Reihenfolge: Funktionen, Winkel, Euklid. Ein Bereich ohne Level zeigt eine gedämpfte Karte "Level kommen bald" und lässt sich nicht öffnen. Haus-Symbol und Zurück-Taste führen zur Startseite.
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

## Bereich Winkel

Jedes Winkel-Level bringt sein Verhalten selbst mit (`neu`, `down`, `move`, `up`, `draw`, `overlay`, `bild`, `ausBild`), `bereich.js` macht Fortschritt, grüne und rote Karte, Knöpfe und Hilfen (`App.winkel`: Winkelfelder, gerundete Gradzahlen mit fester Summe, Farben Tinte/Braun/Grau). Unten nur der Papierkorb, kein Drehen der Ansicht.

| Level | Titel | Erkenntnis |
|---|---|---|
| 1 | Eine volle Umdrehung | Kein Zeichnen, keine Animation: Ein Kreis zeigt 360°. Antippen zeigt den nächsten Schritt: eine waagrechte Strecke durch den Mittelpunkt (180° + 180°), dann eine senkrechte aus dem Mittelpunkt (90° + 90° + 180°). Nur das Ende der senkrechten Strecke hat einen Griff (Ring), daran dreht man sie; Winkelfelder im Kreis (Tinte, Braun, Grau) und Zahlen ändern sich live, unten „a° + b° + c° = 360°, eine volle Umdrehung“. Gelöst nach insgesamt 120° Drehung (Kennung `volle-umdrehung`). |
| 2 | Winkel im Z | Zwei parallele Geraden (grau). Antippen zeigt eine schräge Strecke durch die Mitte dazwischen, das Z kräftig in Tinte, die zwei Wechselwinkel in Braun mit Zahl. Am Griff oben dreht man die Strecke um ihre Mitte (25° bis 155°), beide Winkel bleiben gleich, unten „a° = a°, Die Winkel im Z sind gleich groß“. Gelöst nach insgesamt 60° Drehung (Kennung `z-winkel`). Grüner Text nennt das Wort Wechselwinkel. |
| 3 | Winkel im Dreieck | Zwei Parallelen, unten die Strecke AB. Antippen zeigt nacheinander zwei Z-Formen: links von A nach oben (α = 60°, unten und oben braun), rechts von B nach oben (β = 65°, Tinte). Die rechte obere Ecke schiebt man am Griff nach links, sie rastet an der linken ein: ein Dreieck, oben liegen α, γ (grau) und β nebeneinander auf der Geraden, unten „α + γ + β = 180°“. Danach lässt sich die Spitze weiter schieben, die Summe bleibt 180°. Gelöst beim Einrasten (Kennung `dreieck-180`). |

## Bereich Funktionen

Leitidee: Der Schüler erlebt zuerst, dann bekommt es einen Namen, dann wird es aufgeschrieben. Eine Funktion ist eine Zuordnung, die jeder Eingabe genau eine Ausgabe gibt.

| Level | Titel | Erkenntnis |
|---|---|---|
| 1 | Was ist eine Funktion? | Zahl rein, Zahl raus. Die Regel steht sichtbar in der Box (z. B. 2·□ + 1), □ ist der Platz für die Zahl. Dreimal füttern, dann "Was kommt bei ... heraus?". |
| 2 | Zuverlässige Maschinen | Gleiche Eingabe gibt immer gleiche Ausgabe. Eine Maschine ist zufällig kaputt. Antwort erst möglich, wenn beide mit derselben Zahl mindestens zweimal getestet wurden. |
| 3 | Variablen | Variablen: Eingabe und Ausgabe haben Namen (zufällig, auch y rein und x raus). Drei zufällige Paare stehen in der vollen Tabelle, Box zeigt ?, Frage: Welche Funktion? (vier Antworten) |
| 4 | Zwei Zahlenachsen | Wie Level 3, nur stehen die drei Paare als Linien zwischen zwei parallelen Zahlenachsen (oben rein, unten raus). |
| 5 | Koordinatensystem | Wie Level 3 und 4, nur sind die drei Paare Punkte im Koordinatensystem (x nach rechts, y nach oben). Namen stehen in den Kästchen rein und raus. |
| 6 | Funktion aufschreiben | Regel geheim, drei Paare in der vollen Tabelle; man schreibt die Funktion selbst in zwei Kästchen und drückt Prüfen (Kennung `maschine`). |
| 7 | Punkte setzen | Koordinaten. A(3\|2), B(−2\|4). Keine Liste, unten nur der Papierkorb; ein Punkt verschwindet beim zweiten Antippen. Falsche Punkte werden rot, mit Hinweis unten, und verschwinden beim nächsten Tippen; gelöst erst ohne falsche Punkte. |
| 8 | Punkte verbinden | Zwei zufällige Punkte sind vorgegeben (Kennung `punkte-verbinden`). Unten nur der Papierkorb. Die Linie rastet nur an den zwei Punkten ein, sonst werden keine Punkte gezeigt. Verfehlt sie einen Punkt, wird sie rot, mit Hinweis, und verschwindet beim nächsten Versuch. Gelöst: „Jede Gerade ist durch zwei Punkte bestimmt.“ |
| 9 | Die Maschine und die y-Achse | Eine zufällige Gerade y = mx + b ist vorgegeben (Kennung `null-einwerfen`), der Punkt auf der y-Achse als (?\|b). Unten nur die Zahlentasten −4 bis 4 und Prüfen. Welche Zahl muss in die Maschine? Falsche Zahl: roter Punkt und Hinweis „Auf der y-Achse ist x immer 0“. Richtig ist 0. |
| 10 | Was ist Steigung? | Fünf Geraden nacheinander (Kennung `steigung-ablesen`), steigend und fallend, Steigung −3 bis 3. Jede mit gestricheltem Steigungsdreieck, 1, 2 oder 3 Kästchen nach rechts (beschriftet). Keine Gleichungen im Gitter. Steigung eintippen (Tasten −3 bis 3), Prüfen, „n / 5“. Grün erst nach der fünften Geraden. |
| 11 | Steigung ohne Kästchen | Zwei Punkte mit Koordinaten und Dreieck, aber ohne Gitter und Achsen (Kennung `steigung-ohne-gitter`), größere Koordinaten. Steigung (−3 bis 3) aus den Koordinaten berechnen. Drei Geraden. |
| 12 | Ein Punkt wandert | Fester Punkt (x₁\|y₁) und ein Punkt (x\|y), den man in Zehnteln auf der Geraden zieht (Kennung `punkt-wandert`). Am Dreieck live x − x₁ und y − y₁, unten „Δy : Δx = □“. Prüfbar erst, wenn der Punkt bewegt wurde. Erkenntnis: immer die Steigung. |
| 13 | y = mx + b | Oben: die allgemeine Geradengleichung ist y = mx + b, m Steigung, b y-Achsenabschnitt (Kennung `mb-ablesen`). Drei Gleichungen nacheinander mit gezeichneter Gerade: erst m 2 oder 3 mit b > 0, dann x oder −x mit b < 0, dann m −2 oder −3 mit b 0, 2 oder 3. Unten m = □ und b = □, Tasten −4 bis 4. Falsch: roter Hinweis zu m oder b. |
| 14 | Gleichung schreiben | Fünf Geraden im Gitter nacheinander (Kennung `gerade-schreiben`, zweipunkt `'hand'`): steigend, m = ±1 mit b < 0, fallend, b = 0, beides negativ; m und b von −3 bis 3. Die Gleichung mit dem Finger ins Feld schreiben (dieselbe Handschrift-Erkennung wie beim Taxi), y = mx + b oder y = b + mx, auch x, −x und ohne b. Falsch: Hinweis zu m (1 nach rechts, wie weit hoch oder runter) oder zu b (wo kreuzt die y-Achse). |
| 15 | Taxipreis | Grundgebühr 2 bis 4 € und Preis pro km 1 bis 3 € (zufällig, Kennung `taxi-gleichung`). Erst die Geradengleichung y = px + g mit dem Finger ins Feld schreiben; eine kleine Handschrift-Erkennung ($P-Punktwolken mit Vorlagen für y = m x + b, Ziffern 0 bis 5 und Ablenker c, a, n, −) liest mit, darunter steht, was gelesen wurde. ↶ nimmt den letzten Strich zurück. Danach drei Fahrten (2, 5, 10 km) mit vier Antworten (typische Denkfehler). Statt Gitter eine eigene Grafik: nur positive Achsen, x = Strecke, y = Preis, bis 10 km und passend skaliert; die Gerade erscheint nach richtiger Gleichung, beantwortete Fahrten als lila Punkte mit Preis. Währung und Einheit je nach Sprache: Englisch $ und Meilen, Japanisch Yen (Preise mal 100), Türkisch ₺, Arabisch Riyal, sonst € und km. |

- Level 1 bis 6 sind DOM-Overlays (`#mach`). Level 1 und 3 bis 6 entstehen aus Bausteinen in `App.funk.einstieg` (bereich.js). Farben: Orange = rein, Lila = raus, Grün = richtig, Menüs braun. Level 7 bis 14 laufen auf dem Canvas mit Koordinatensystem (1 Einheit = 40 px, y nach oben).
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
