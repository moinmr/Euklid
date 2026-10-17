# Mathe-App (Euklid und Funktionen)

Lern-App für Kinder, gebaut als Web-App (eine einzige Datei `index.html`), läuft als installierte App auf einem Samsung-Android-Handy. Der Entwickler arbeitet nur am Handy, ohne PC.

## Regeln für die Zusammenarbeit

- Marcus arbeitet nur am Handy, ohne PC, und programmiert selbst nicht. Claude macht alle Änderungen am Code, auch das Umsortieren von Leveln.
- Erklärungen in einfachen Worten, ohne Code-Details: was sich in der App ändert und wie man es hochlädt.
- Immer eine fertige, getestete `index.html` als Datei liefern. Claude lädt nichts selbst hoch (kein Push), das macht Marcus.
- Immer von der neuesten `index.html` ausgehen (zuletzt die Projektdatei `mathe-app/index.html`).
- Level dürfen frei umsortiert werden, der Fortschritt bleibt erhalten (siehe "Fortschritt und Level-Kennungen").

## So läuft die App

- Hosting: GitHub Pages, Repository `moinmr/euklid` (öffentlich), Adresse `https://moinmr.github.io/euklid/`.
- Dateien im Repository: `index.html` (die ganze App), `manifest.webmanifest` (Anzeige `standalone`, Hochformat), `sw.js` (Service Worker, holt Updates direkt vom Server), `icon-192.png`, `icon-512.png`.
- Installation: In Chrome die Adresse öffnen, dann "App installieren". Änderungen am Manifest greifen nur nach Deinstallieren und Neuinstallieren.
- Fortschritt liegt im Browser (localStorage), nur auf diesem Gerät. Schlüssel: `euklid-fortschritt` (Euklid), `euklid-funk` (Funktionen). Die alten Stände aus `euklid-fortschritt-v1` und `euklid-funk-v3` werden beim ersten Start einmal übernommen.

## Update-Ablauf (am Handy)

1. Neue `index.html` im Chat herunterladen.
2. In GitHub: Repository öffnen, "Add file", "Upload files", Datei wählen, "Commit changes". Die alte Datei nicht vorher löschen (sonst kurz 404).
3. Ein bis zwei Minuten warten. App ganz schließen und neu öffnen.
4. Hängt eine alte Version: in Chrome `.../index.html?v=N` öffnen (N hochzählen).

## Look und Bedienung

- Pergament (`#f5ebd1`), Tinte (`#382919`), Bleistift (grau), Blau für Linien (`#1a59cc`), Grün für Treffer und Erfolg, Rot zum Trennen.
- Schrift Jost: Normal für alles, nur die Level-Überschrift unten fett. Zahlen im Bild und Text unten gleiche Schrift.
- Symbolleiste oben: dünne Linien-Symbole ohne Hintergrund (Haus, Punkt, Linie, Zirkel, Ecke schieben, Trennen, Zurück, Papierkorb, Ansicht zurücksetzen, Treppe). Aufgabentext unten.
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
| 1 | Die Maschine | Es gibt eine Regel. Zufällige Regel m·x+b, Eingabe 0 bis 9 durch Tasten, danach "Was kommt bei 10 heraus?" mit Auswahl. Tipp nach zwei Fehlern. |
| 2 | Zwei Maschinen | Gleiche Eingabe gibt immer gleiche Ausgabe. Eine Maschine ist zufällig kaputt. Antwort erst möglich, wenn beide mit derselben Zahl mindestens zweimal getestet wurden. |
| 3 | Das Taxi | Alltag: Grundgebühr plus Preis pro km (zufällig). Tabelle für 1, 2, 3, 5 km, falsche Antworten sind typische Denkfehler. |
| 4 | Punkte setzen | Koordinaten. A(3\|2), B(−2\|4). |
| 5 | Wertetabelle | y = x + 1, Tabelle rechnen, Punkte setzen, Gerade ziehen. |
| 6 | Steigung | y = 2x |
| 7 | y-Achsenabschnitt | y = x + 2 |
| 8 | Steigung und Achsenabschnitt | y = 2x − 1 |
| 9 | Negative Steigung | y = −x + 3 |

- Level 1 bis 3 sind DOM-Overlays (`#mach`), Level 4 bis 9 laufen auf dem Canvas mit Koordinatensystem (1 Einheit = 40 px, y nach oben).
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

- Alles in `index.html`: CSS, Markup, JavaScript (`S` = Zustand Euklid und Ansicht, `F` = Zustand Funktionen, `M` = aktuelles Maschinen-Level, `LEVELS` und `FLEVELS` = Level-Listen).
- Tests am Rechner: Logik mit Node (Skript ohne `document` exportiert die Funktionen), Oberfläche mit Playwright und Touch-Eingabe (Chromium vorhanden).
- Fortschritt und Level-Kennungen: Jedes Level in `LEVELS` und `FLEVELS` hat eine feste Kennung (`id`, z. B. `dreieck`, `taxi`, `negative-steigung`). Gelöste Level, Lösungsbilder und angefangene Zeichnungen werden nach dieser Kennung gespeichert, nicht nach der Position. Darum dürfen Level frei umsortiert werden, und die Nummer im Titel ergibt sich aus der Position.
- Eine Kennung nie ändern, sonst ist der Stand dieses Levels weg. Neue Level bekommen eine neue, eindeutige Kennung.
- Die Speicher-Schlüssel nicht mehr hochzählen.
- Google Fonts (Jost) braucht Netz, offline fällt die Schrift auf die Systemschrift zurück.
