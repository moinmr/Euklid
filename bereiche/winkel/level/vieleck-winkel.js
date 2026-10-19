// Level: Alle Winkel im Vieleck. Das Sechseck (danach das Fünfeck) aus dem Level davor, mit den Linien aus der oberen
// Ecke. Gegeben ist der Innenwinkel an Ecke 1 (grau). Schritt für Schritt fragt das Schreibfeld nach dem Winkel mit "?":
// 1. die zwei gleichen Winkel im Dreieck 1 (30° bzw. 36°), 2. der Rest der Ecke 2 (90° bzw. 72°), 3. der Winkel unten
// an der Spiegelachse (60° bzw. 72°), 4. der Winkel oben im Dreieck 2 (30° bzw. 36°). Dann stehen alle Winkel da und
// unten die obere Ecke: 30° + 30° + 30° + 30° = 120°. Antippen bringt das Fünfeck. Gelöst nach dem Fünfeck.
// Ecken: 0 oben, dann gegen den Uhrzeigersinn. Ein Winkel [v, a, b] liegt an Ecke v zwischen den Linien zu a und zu b.
(function () {
var App = window.App, S = App.S, C = App.C;

var TEXT = {
  frage1: { de: 'Die beiden Winkel mit Fragezeichen sind gleich groß. Wie groß ist einer?',
            en: 'The two angles with a question mark are equal. How big is one of them?',
            fi: 'Kysymysmerkillä merkityt kaksi kulmaa ovat yhtä suuret. Kuinka suuri on yksi niistä?',
            tr: 'Soru işaretli iki açı eşit. Biri kaç derece?',
            fr: 'Les deux angles avec un point d’interrogation sont égaux. Combien mesure l’un d’eux ?',
            es: 'Los dos ángulos con signo de interrogación son iguales. ¿Cuánto mide uno?',
            ja: '?の2つの角は同じ大きさ。1つは何度かな？',
            ar: 'الزاويتان اللتان عليهما علامة الاستفهام متساويتان. كم قياس إحداهما؟' },
  frage: { de: 'Wie groß ist der Winkel mit dem Fragezeichen?', en: 'How big is the angle with the question mark?',
           fi: 'Kuinka suuri on kysymysmerkillä merkitty kulma?', tr: 'Soru işaretli açı kaç derece?',
           fr: 'Combien mesure l’angle avec le point d’interrogation ?', es: '¿Cuánto mide el ángulo con el signo de interrogación?',
           ja: '?の角は何度かな？', ar: 'كم قياس الزاوية التي عليها علامة الاستفهام؟' },
  h1: { de: 'Noch nicht. Das Dreieck hat zusammen 180°. Nimm die {i}° weg und teile den Rest auf die zwei gleichen Winkel auf.',
        en: 'Not yet. The triangle has 180° in total. Take away the {i}° and share the rest between the two equal angles.',
        fi: 'Ei vielä. Kolmion kulmat ovat yhteensä 180°. Vähennä {i}° ja jaa loput kahdelle yhtä suurelle kulmalle.',
        tr: 'Henüz değil. Üçgenin açıları toplamı 180°. {i}°’yi çıkar, kalanı iki eşit açıya paylaştır.',
        fr: 'Pas encore. Le triangle fait 180° en tout. Enlève les {i}° et partage le reste entre les deux angles égaux.',
        es: 'Todavía no. El triángulo suma 180°. Quita los {i}° y reparte el resto entre los dos ángulos iguales.',
        ja: 'まだです。三角形の角は合わせて180°。{i}°をひいて、残りを同じ大きさの2つの角に分けよう。',
        ar: 'ليس بعد. مجموع زوايا المثلث 180°. اطرح {i}° ووزّع الباقي على الزاويتين المتساويتين.' },
  h2: { de: 'Noch nicht. Die ganze Ecke hat {i}°. Einen Teil davon kennst du schon.',
        en: 'Not yet. The whole corner is {i}°. You already know one part of it.',
        fi: 'Ei vielä. Koko kulma on {i}°. Yhden osan tiedät jo.',
        tr: 'Henüz değil. Köşenin tamamı {i}°. Bir parçasını zaten biliyorsun.',
        fr: 'Pas encore. L’angle entier fait {i}°. Tu connais déjà une partie.',
        es: 'Todavía no. La esquina entera mide {i}°. Ya conoces una parte.',
        ja: 'まだです。角全体は{i}°。その一部はもうわかっているよ。',
        ar: 'ليس بعد. الزاوية كلها {i}°. أنت تعرف جزءًا منها.' },
  h3halb: { de: 'Noch nicht. Die gestrichelte Linie teilt die Ecke unten in zwei gleiche Hälften. Die ganze Ecke hat {i}°.',
            en: 'Not yet. The dashed line cuts the bottom corner into two equal halves. The whole corner is {i}°.',
            fi: 'Ei vielä. Katkoviiva jakaa alakulman kahteen yhtä suureen puoliskoon. Koko kulma on {i}°.',
            tr: 'Henüz değil. Kesikli çizgi alttaki köşeyi iki eşit yarıya böler. Köşenin tamamı {i}°.',
            fr: 'Pas encore. La ligne en pointillés coupe l’angle du bas en deux moitiés égales. L’angle entier fait {i}°.',
            es: 'Todavía no. La línea discontinua divide la esquina de abajo en dos mitades iguales. La esquina entera mide {i}°.',
            ja: 'まだです。点線は下の角を同じ大きさの半分に分けます。角全体は{i}°。',
            ar: 'ليس بعد. الخط المتقطع يقسم الزاوية السفلى إلى نصفين متساويين. الزاوية كلها {i}°.' },
  h3spiegel: { de: 'Noch nicht. Das Fünfeck ist links und rechts gleich. Der Winkel ist so groß wie sein Spiegelbild an der gestrichelten Linie.',
               en: 'Not yet. The pentagon is the same on the left and right. The angle is as big as its mirror image across the dashed line.',
               fi: 'Ei vielä. Viisikulmio on vasemmalta ja oikealta samanlainen. Kulma on yhtä suuri kuin sen peilikuva katkoviivan toisella puolella.',
               tr: 'Henüz değil. Beşgenin sol ve sağ tarafı aynı. Açı, kesikli çizgiye göre ayna görüntüsü kadar büyük.',
               fr: 'Pas encore. Le pentagone est pareil à gauche et à droite. L’angle est aussi grand que son reflet de l’autre côté de la ligne en pointillés.',
               es: 'Todavía no. El pentágono es igual a la izquierda y a la derecha. El ángulo mide lo mismo que su reflejo al otro lado de la línea discontinua.',
               ja: 'まだです。五角形は左右が同じ形。この角は、点線で映した反対側の角と同じ大きさだよ。',
               ar: 'ليس بعد. المخمس متماثل يمينًا ويسارًا. الزاوية تساوي صورتها في المرآة على الجانب الآخر من الخط المتقطع.' },
  h4: { de: 'Noch nicht. Im Dreieck sind alle drei Winkel zusammen 180°. Zwei davon kennst du schon.',
        en: 'Not yet. The three angles of the triangle make 180° together. You already know two of them.',
        fi: 'Ei vielä. Kolmion kolme kulmaa ovat yhteensä 180°. Kaksi niistä tiedät jo.',
        tr: 'Henüz değil. Üçgenin üç açısı toplamı 180°. İkisini zaten biliyorsun.',
        fr: 'Pas encore. Les trois angles du triangle font 180° ensemble. Tu en connais déjà deux.',
        es: 'Todavía no. Los tres ángulos del triángulo suman 180°. Ya conoces dos.',
        ja: 'まだです。三角形の3つの角は合わせて180°。2つはもうわかっているよ。',
        ar: 'ليس بعد. مجموع زوايا المثلث الثلاث 180°. أنت تعرف اثنتين منها.' },
  weiter: { de: 'Tippe für die nächste Form', en: 'Tap for the next shape', fi: 'Napauta, niin tulee seuraava muoto',
            tr: 'Sonraki şekil için dokun', fr: 'Touche l’écran pour la forme suivante', es: 'Toca para la siguiente forma',
            ja: 'タップすると次の形', ar: 'انقر للشكل التالي' }
};

// Je Form: Ecken, Innenwinkel und die vier Schritte (Winkel mit "?", richtige Zahl, Hinweis)
var FORMEN = [
  { n: 6, innen: 120, schritte: [
    { w: [[0, 1, 2], [2, 0, 1]], z: 30, h: 'h1', f: 'frage1' },
    { w: [[2, 0, 3]], z: 90, h: 'h2', f: 'frage' },
    { w: [[3, 0, 2]], z: 60, h: 'h3halb', f: 'frage' },
    { w: [[0, 2, 3]], z: 30, h: 'h4', f: 'frage' }] },
  { n: 5, innen: 108, schritte: [
    { w: [[0, 1, 2], [2, 0, 1]], z: 36, h: 'h1', f: 'frage1' },
    { w: [[2, 0, 3]], z: 72, h: 'h2', f: 'frage' },
    { w: [[3, 0, 2]], z: 72, h: 'h3spiegel', f: 'frage' },
    { w: [[0, 2, 3]], z: 36, h: 'h4', f: 'frage' }] }
];
var FERTIG = 4;   // Z.s nach dem letzten Schritt

// Hinweis mit eingesetzter Gradzahl
function mit(text, i) {
  var r = {};
  Object.keys(text).forEach(function (l) { r[l] = text[l].replace('{i}', i); });
  return r;
}
// Ecken des regelmäßigen n-Ecks, Ecke 0 oben, mittig im Bildbereich, mit Rand für Zahlen außen an den Ecken
function ecken(n) {
  // mit offenem Schreibfeld stehen unten keine Textzeilen: das Bild reicht bis knapp über die Karte
  var H = App.winkel, P = H.platz(2), rand = 26;
  if (H.feldOffen()) { rand = 20; P = { oben: P.oben - 10, h: H.feldOben() - 14 - (P.oben - 10) }; }
  var h = Math.max(80, P.h - 2 * rand), unten = 0, seite = 0;
  for (var i = 0; i < n; i++) {
    var w = Math.PI / 2 + i * 2 * Math.PI / n;
    unten = Math.max(unten, -Math.sin(w)); seite = Math.max(seite, Math.abs(Math.cos(w)));
  }
  var R = Math.max(40, Math.min((S.w / 2 - 44) / seite, h / (1 + unten)));
  var cy = P.oben + rand + Math.max(0, (h - R * (1 + unten)) / 2) + R, p = [];
  for (var j = 0; j < n; j++) {
    var a = Math.PI / 2 + j * 2 * Math.PI / n;
    p.push([S.w / 2 + R * Math.cos(a), cy - R * Math.sin(a)]);
  }
  return { p: p, R: R };
}
// Kleinerer Winkel zwischen zwei Richtungen: Anfang und Weite (mathematisch, gegen den Uhrzeigersinn)
function zwischen(d1, d2) {
  var T = App.winkel.TAU, sw = ((d2 - d1) % T + T) % T;
  return sw <= Math.PI ? [d1, sw] : [d2, T - sw];
}
// Winkel [v, a, b] als Anfang und Weite an Ecke p[v]
function lage(p, w) { var H = App.winkel; return zwischen(H.richtung(p[w[0]], p[w[1]]), H.richtung(p[w[0]], p[w[2]])); }
function letzte(Z) { return Z.form === FORMEN.length - 1; }

function start(Z) {
  if (Z.s >= FERTIG) return;
  var F = FORMEN[Z.form], St = F.schritte[Z.s];
  App.winkel.frage(St.z, mit(TEXT[St.h], F.innen), function () {
    Z.s++;
    if (Z.s === FERTIG && letzte(Z)) App.winkel.geschafft();
    start(Z);
  }, { text: TEXT[St.f] });
}

App.level('winkel', {
  id: 'vieleck-winkel',
  text: {
    de: { title: 'Alle Winkel im Vieleck',
          task: 'Finde die Winkel mit dem Fragezeichen, einen nach dem anderen. Ein Dreieck hat 180°. Schreib die Zahl ins Feld.',
          done: 'Alle Winkel folgen aus zwei Dingen: Ein Dreieck hat 180°, und die Ecken des Vielecks sind gleich groß. Beim Fünfeck teilen die Linien die obere Ecke in 3 × 36°: genau die Spitze des Sterns.' },
    en: { title: 'All the angles in the polygon',
          task: 'Find the angles with the question mark, one after the other. A triangle has 180°. Write the number in the box.',
          done: 'All the angles follow from two facts: a triangle has 180°, and the corners of the polygon are all the same. In the pentagon the lines split the top corner into 3 × 36°: exactly the point of the star.' },
    fi: { title: 'Kaikki kulmat monikulmiossa',
          task: 'Etsi kysymysmerkillä merkityt kulmat yksi kerrallaan. Kolmion kulmat ovat yhteensä 180°. Kirjoita luku kenttään.',
          done: 'Kaikki kulmat seuraavat kahdesta asiasta: kolmion kulmat ovat yhteensä 180°, ja monikulmion kulmat ovat yhtä suuret. Viisikulmiossa viivat jakavat yläkulman osiin 3 × 36°: juuri tähden sakara.' },
    tr: { title: 'Çokgendeki bütün açılar',
          task: 'Soru işaretli açıları birer birer bul. Bir üçgenin açıları toplamı 180°. Sayıyı kutuya yaz.',
          done: 'Bütün açılar iki şeyden çıkar: bir üçgenin açıları toplamı 180°, çokgenin köşeleri de eşit. Beşgende çizgiler üst köşeyi 3 × 36° parçaya böler: tam yıldızın ucu.' },
    fr: { title: 'Tous les angles du polygone',
          task: 'Trouve les angles avec le point d’interrogation, l’un après l’autre. Un triangle fait 180°. Écris le nombre dans la case.',
          done: 'Tous les angles découlent de deux faits : un triangle fait 180°, et les angles du polygone sont tous égaux. Dans le pentagone, les lignes partagent l’angle du haut en 3 × 36° : exactement la pointe de l’étoile.' },
    es: { title: 'Todos los ángulos del polígono',
          task: 'Encuentra los ángulos con el signo de interrogación, uno tras otro. Un triángulo suma 180°. Escribe el número en la casilla.',
          done: 'Todos los ángulos salen de dos hechos: un triángulo suma 180° y las esquinas del polígono son iguales. En el pentágono las líneas dividen la esquina de arriba en 3 × 36°: justo la punta de la estrella.' },
    ja: { title: '多角形の中の角をぜんぶ',
          task: '?の角を1つずつ見つけよう。三角形の角は合わせて180°。数を書こう。',
          done: 'どの角も2つのことからわかります：三角形の角は合わせて180°、多角形の角はみんな同じ。五角形では線が上の角を3 × 36°に分けます。これが星の先の角です。' },
    ar: { title: 'كل الزوايا في المضلع',
          task: 'جد الزوايا التي عليها علامة الاستفهام واحدة تلو الأخرى. مجموع زوايا المثلث 180°. اكتب العدد في المربع.',
          done: 'كل الزوايا تنتج من أمرين: مجموع زوايا المثلث 180°، وزوايا المضلع متساوية. في المخمس تقسم الخطوط الزاوية العليا إلى 3 × 36°: وهي بالضبط رأس النجمة.' }
  },
  werkzeuge: ['clear'],

  // form: Sechseck oder Fünfeck, s: beantwortete Schritte (0 bis 4)
  neu: function (Z) { Z.form = 0; Z.s = 0; },
  start: start,

  down: function (Z) {
    if (Z.s >= FERTIG && !letzte(Z)) { Z.form++; Z.s = 0; start(Z); }   // nächste Form
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, F = FORMEN[Z.form], n = F.n, E = ecken(n), p = E.p, top = p[0];
    var fb = H.farben[1], fg = H.farben[2], alle = Z.s >= FERTIG;
    var ri = Math.max(22 * k, E.R * 0.24);
    // Dreiecke aus der oberen Ecke, abwechselnd braun und grau, ganz hell
    for (var t = 1; t <= n - 2; t++) {
      ctx.fillStyle = (t % 2 ? fb : fg).fuell.replace(/[\d.]+\)$/, '0.12)');
      ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(p[t][0], p[t][1]); ctx.lineTo(p[t + 1][0], p[t + 1][1]); ctx.closePath(); ctx.fill();
    }
    var schrift = [];
    function winkel(w, fuell, linie, txt, farbe, breit) {
      // Zahl knapp hinter dem Bogen, bei schmalen Winkeln weiter draußen, wo das Feld breiter ist
      var L = lage(p, w), c = p[w[0]], mid = L[0] + L[1] / 2, rl = ri + (L[1] < Math.PI / 4 ? 30 : 15) * k;
      H.feld(ctx, c, ri, L[0], L[1], fuell, linie, breit ? ws * 1.6 : ws);
      if (txt) schrift.push([txt, c[0] + Math.cos(mid) * rl, c[1] - Math.sin(mid) * rl, farbe, txt === '?' ? 20 : 14]);
    }
    if (alle) {
      // alle Winkel der Dreiecke, ausgemessen
      for (var u = 1; u <= n - 2; u++) {
        var f = u % 2 ? fb : fg, ecke = [[0, u, u + 1], [u, u + 1, 0], [u + 1, 0, u]];
        ecke.forEach(function (w) { winkel(w, f.fuell, f.linie, Math.round(H.grad(lage(p, w)[1])) + '°', f.linie); });
      }
    } else {
      // gegeben: die ganze Ecke 1 (grau); gefunden: braun mit Zahl; gefragt: kräftig braun mit "?"
      winkel([1, 0, 2], fg.fuell, fg.linie, F.innen + '°', fg.linie);
      F.schritte.forEach(function (St, i) {
        if (i > Z.s) return;
        St.w.forEach(function (w) {
          if (i < Z.s) winkel(w, fb.fuell, fb.linie, St.z + '°', fb.linie);
          else winkel(w, 'rgba(166,112,58,0.38)', fb.linie, '?', fb.linie, true);
        });
      });
      // Schritt 2: die ganze Ecke 2 als grauer Bogen, Zahl außen
      if (Z.s === 1) {
        var c2 = p[2], L2 = lage(p, [2, 1, 3]), m2 = L2[0] + L2[1] / 2;
        ctx.beginPath(); ctx.arc(c2[0], c2[1], ri * 1.7, -L2[0], -(L2[0] + L2[1]), true);
        ctx.strokeStyle = fg.linie; ctx.lineWidth = 1.6 * ws * k; ctx.stroke();
        schrift.push([F.innen + '°', c2[0] - Math.cos(m2) * 22 * k, c2[1] + Math.sin(m2) * 22 * k, fg.linie, 14]);
      }
    }
    // Umriss und Linien aus der oberen Ecke in Tinte
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5 * ws * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    p.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    for (var g = 2; g <= n - 2; g++) { ctx.moveTo(top[0], top[1]); ctx.lineTo(p[g][0], p[g][1]); }
    ctx.stroke();
    // Schritt 3: Spiegelachse gestrichelt, oben und unten über das Vieleck hinaus
    if (!alle && Z.s === 2) {
      var yu = Math.max.apply(null, p.map(function (q) { return q[1]; }));
      ctx.save(); ctx.setLineDash([5 * k, 5 * k]); ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 1.5 * ws * k;
      ctx.beginPath(); ctx.moveTo(top[0], top[1] - 18 * k); ctx.lineTo(top[0], yu + 18 * k); ctx.stroke(); ctx.restore();
    }
    // Zahlen zuletzt, mit hellem Rand, damit die Linien sie nicht verdecken
    schrift.forEach(function (a) {
      ctx.save();
      ctx.font = '400 ' + a[4] * k + 'px ' + C.FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = C.PARCH; ctx.lineWidth = 4 * k; ctx.lineJoin = 'round'; ctx.strokeText(a[0], a[1], a[2]);
      ctx.fillStyle = a[3]; ctx.fillText(a[0], a[1], a[2]);
      ctx.restore();
    });
  },

  // Unten, wenn alles gefunden ist: die obere Ecke "30° + 30° + 30° + 30° = 120°" und der Hinweis auf die nächste Form
  overlay: function (ctx, Z) {
    var H = App.winkel, F = FORMEN[Z.form];
    if (Z.s < FERTIG) return;
    var y = H.textY(letzte(Z) ? 1 : 2), teil = F.schritte[0].z, teile = [];
    for (var i = 0; i < F.n - 2; i++) {
      if (i) teile.push({ t: ' + ', c: C.INK });
      teile.push({ t: teil + '°', c: H.farben[i % 2 ? 2 : 1].linie });
    }
    teile.push({ t: ' = ' + F.innen + '°', c: C.INK });
    H.zeile(ctx, teile, y);
    if (!letzte(Z)) {
      ctx.save();
      ctx.font = '400 14.5px ' + C.FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.PENCIL;
      ctx.fillText(App.wahl(TEXT.weiter), S.w / 2, y + 24);
      ctx.restore();
    }
  },

  bild: function (Z) { return (Z.form || Z.s) ? { v: 1, form: Z.form, s: Z.s } : null; },
  ausBild: function (Z, b) {
    if (b.v !== 1) return;
    Z.form = Math.max(0, Math.min(FORMEN.length - 1, b.form | 0));
    Z.s = Math.max(0, Math.min(FERTIG, b.s | 0));
  }
});
})();
