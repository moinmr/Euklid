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

Jedes Winkel-Level bringt sein Verhalten selbst mit (`neu`, `down`, `move`, `up`, `draw`, `overlay`, `bild`, `ausBild`), `bereich.js` macht Fortschritt, grüne und rote Karte, Knöpfe und Hilfen (`App.winkel`: Winkelfelder, gerundete Gradzahlen mit fester Summe, Farben Tinte/Braun/Grau, Schreibfeld für Zahlen mit Ziffern-Erkennung). Optional `start(Z)` nach dem Laden, z. B. um das Schreibfeld einzublenden. Unten nur der Papierkorb, kein Drehen der Ansicht.

| Level | Titel | Erkenntnis |
|---|---|---|
| 1 | Drehungen | Ein Zeiger aus der Kreismitte (Start nach rechts, gestrichelt), Griff an der Spitze. Das braune Feld zeigt live, wie weit er gedreht ist, mit Gradzahl (beide Richtungen). Drei Aufgaben nacheinander: Vierteldrehung, halbe, ganze Drehung. Beim Loslassen bis 10° daneben rastet er ein, unten „1/4 Drehung = 90°“, Antippen bringt die nächste Aufgabe. Zu weit gedreht: rote Karte. Gelöst nach der ganzen Drehung (Kennung `drehungen`). |
| 2 | Winkel an der Geraden | Eine schräge Gerade, darüber grau der Winkel an der Geraden „180°“ (so viel wie eine halbe Drehung). Antippen zeigt eine Strecke aus der Mitte mit Griff, beide Winkel mit Zahl, unten „a° + b° = 180°“ und bis zum ersten Drehen „Dreh jetzt die Strecke am Griff hin und her“. Nach insgesamt 120° Drehung, beim Loslassen, drei Aufgaben mit einer neuen schrägen Geraden (zufällig): 2, 3, dann 4 Winkel an der Geraden (Fünferschritte, zusammen 180), einer mit „?“, Zahl ins Feld; Antippen bringt die nächste. Gelöst nach der dritten (Kennung `gerade-180`; ersetzt das frühere Level `volle-umdrehung`). |
| 3 | Winkel im Z | Zwei parallele Geraden (grau). Antippen zeigt eine schräge Strecke durch die Mitte, das Z kräftig in Tinte, die zwei Wechselwinkel in Braun mit Zahl (Start zufällig 45° bis 70°). Am Griff oben dreht man die Strecke um ihre Mitte (25° bis 155°), unten „a° = a°, Die Winkel im Z sind gleich groß“. Nach insgesamt 60° Drehung, beim Loslassen: eine neue Z-Form (anderer Winkel), unten „?“, man schreibt die Zahl ins Feld; richtig: gelöst (Kennung `z-winkel`). Grüner Text nennt das Wort Wechselwinkel. |
| 4 | Winkel im Dreieck | Zwei Parallelen, unten die Strecke AB. Antippen zeigt nacheinander zwei Z-Formen: links von A nach oben (α = 60°, braun), rechts von B nach oben (β = 65°, Tinte). Die rechte obere Ecke schiebt man am Griff nach links, sie rastet an der linken ein: ein Dreieck, oben liegen α, γ (grau, erst „?“) und β nebeneinander auf der Geraden. γ schreibt man ins Feld; richtig: unten „α + γ + β = 180°“, dann schiebt man die drei Ecken an ihren Griffen hin und her (A und B auf der unteren Geraden, die Spitze auf der oberen). Beim Loslassen die letzte Frage (ohne Zahlen im Bild): Wie groß ist die Summe der Innenwinkel in jedem Dreieck? 180: gelöst (Kennung `dreieck-180`). |
| 5 | Parallelogramm | Zwei Parallelen, Antippen zeigt das Parallelogramm ABCD. A hat eine Zahl (zufällig 50° bis 75°), C zeigt „?“: man schreibt die Zahl ins Feld (gegenüberliegende Winkel gleich, Z-Formen). Danach alle vier Winkel, unten „a° + b° = 180°“, Diagonalen gestrichelt und ein Griff an D: die obere Seite waagrecht schieben. Rastet bei 90° ein: Diagonalen gleich lang, ein Rechteck, gelöst (Kennung `parallelogramm`). |
| 6 | Einmal rundherum | Ein Pfeil läuft um eine Form, jedes Antippen ist ein Schritt: eine Seite gehen oder an der Ecke drehen. Die Drehung ist der Außenwinkel (gestrichelte Verlängerung, braunes Feld mit Gradzahl). Unten „120° + 120° = 240°“ und „2 × 1/3 Drehung“, zurück am Start „= eine volle Umdrehung“, dann „Tippe für die nächste Form“: Dreieck, Quadrat, Fünfeck, Sechseck. Ab dem Quadrat zeigt die erste Drehung „?“, man schreibt die Gradzahl ins Feld, erst dann geht es weiter. Gelöst nach dem Sechseck (Kennung `rundherum`). |
| 7 | Innenwinkel | Dieselben Formen (Dreieck bis Sechseck). Bei Dreieck und Quadrat an der Ecke unten rechts: gestrichelte Verlängerung, Drehung grau mit Zahl, darüber „? + 120° = 180°“; bei Fünfeck und Sechseck nur der hervorgehobene Innenwinkel mit „?“, die Hilfe erscheint erst nach der Antwort. Den Innenwinkel mit dem Finger ins Schreibfeld schreiben, Prüfen. Falsch: rote Karte über dem Feld. Richtig: alle Innenwinkel mit Zahl, Antippen bringt die nächste Form. Gelöst nach dem Sechseck (Kennung `innenwinkel`). |
| 8 | Sechs Dreiecke | Antippen legt gleichseitige Dreiecke um einen Punkt; der erste Winkel ist eine Frage (60). Sechs Dreiecke: ein Sechseck, „6 × 60° = 360°“. Dann an einer Ecke 60° + 60° = 120° und die Frage, wie viele Sechsecke um eine Ecke passen (3); Antippen legt sie an, „3 × 120° = 360°“, gelöst (Kennung `sechs-dreiecke`). |
| 9 | Mosaik | Plättchen Dreieck, Quadrat, Fünfeck, Sechseck (60°, 90°, 108°, 120°) zum Antippen; sie legen sich nacheinander um eine Ecke, unten die Summe und „noch … frei“. Zu viel: rote Karte. Letztes Vieleck antippen nimmt es weg. Genau 360°: Füllung gefunden (als Symbole gemerkt, doppelte zählen nicht). Gelöst nach drei verschiedenen Füllungen; Fünfecke passen nie (Kennung `mosaik`). |
| 10 | Dreiecke im Vieleck | Quadrat, Fünfeck, Sechseck: Antippen zieht Diagonalen aus der oberen Ecke, die Dreiecke abschneiden; die Winkel an der Ecke sind alle gleich (45°, 36°, 30°). Frage „(n − 2) × 180° = ?“ (540, 720; Quadrat als Beispiel), danach alle Innenwinkel und „540° : 5 = 108°“. Gelöst nach dem Sechseck (Kennung `vieleck-dreiecke`). |
| 11 | Sterne | Fünfstern und Achtstern (jede Ecke zur drittnächsten): Antippen zieht die Linien. An der oberen Ecke steht der Innenwinkel (108° bzw. 135°), die Spitze zeigt „?“ (36 bzw. 45, die Linien teilen den Winkel in gleiche Teile). Danach alle Spitzen, „5 × 36° = 180°“, „8 × 45° = 360°“. Gelöst nach dem Achtstern (Kennung `stern`). |
| 12 | Ähnliche Dreiecke | Rechtwinkliges Dreieck mit α (zufällig) und β. Antippen zieht die Höhe; der Teil des rechten Winkels im linken kleinen Dreieck ist eine Frage (β = 90 − α). Danach Antippen zeigt die zwei kleinen Dreiecke einzeln in gleicher Lage: dieselben Winkel. Griff an C bewegt C auf dem Halbkreis; gelöst nach 30° Änderung (Kennung `aehnliche-dreiecke`). |

- Fragen: `App.winkel.frage(zahl, hinweis, fertig)` blendet das Schreibfeld ein (Ziffern-Erkennung 0 bis 9 in `App.winkel.ziffern`, gleiche Art wie die Handschrift in Funktionen) und prüft. Unlesbar oder falsch: rote Karte über dem Feld.
- Platz: `App.winkel.platz(zeilen)` gibt den Bereich zwischen Aufgabentext und den Textzeilen unten (mit offenem Schreibfeld kleiner), `App.winkel.textY(zeilen)` die Höhe der ersten Textzeile. Zustände in den Leveln sind Winkel oder relative Maße, damit das Bild sich anpassen darf.

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
