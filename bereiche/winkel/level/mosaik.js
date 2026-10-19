// Level: Mosaik. In der Mitte ein Punkt, die Ecke eines Mosaiks. Unten eine Reihe Plättchen: Dreieck, Quadrat,
// Fünfeck, Sechseck mit ihrem Innenwinkel (60°, 90°, 108°, 120°). Antippen eines Plättchens legt dieses Vieleck mit
// einer Ecke an den Punkt, gegen den Uhrzeigersinn direkt neben das vorige (gleiche Seitenlänge, abwechselnd braun
// und grau, Winkelfeld mit Zahl am Punkt). Unten die Summe und wie viel noch frei ist. Ginge es über 360° hinaus:
// rote Karte. Antippen des zuletzt gelegten Vielecks nimmt es wieder weg. Genau 360°: die Ecke ist voll, die
// Zusammensetzung (ohne Reihenfolge) wird gemerkt und unten mit kleinen Symbolen gezeigt; doppelte zählen nicht,
// und nur gemischte Füllungen zählen (nur Dreiecke, nur Quadrate oder nur Sechsecke gab es schon in früheren Leveln).
// Antippen der Zeichenfläche leert dann die Ecke. Gelöst nach drei verschiedenen gemischten Füllungen
// (möglich sind vier: 4 Dreiecke + Sechseck, 2 Dreiecke + 2 Sechsecke, 3 Dreiecke + 2 Quadrate, Dreieck + 2 Quadrate + Sechseck).
// Fünfecke füllen nie eine Ecke: 108° passt mit 60°, 90°, 108° und 120° nie genau auf 360°.
(function () {
var App = window.App, S = App.S, C = App.C;
var FORMEN = [3, 4, 5, 6];      // Plättchen unten, Zahl der Ecken
var ZIELE = 3;                  // so viele verschiedene Füllungen braucht es
var START = 0;                  // Richtung der ersten Seite (Bogenmaß, nach rechts)

var TEXT = {
  frei: { de: 'noch {n}° frei', en: '{n}° still free', fi: 'vielä {n}° vapaana', tr: '{n}° daha boş',
          fr: 'encore {n}° de libre', es: 'quedan {n}° libres', ja: 'あと{n}°あいている', ar: 'باقي {n}° فارغة' },
  voll: { de: 'Die Ecke ist voll: genau 360°', en: 'The corner is full: exactly 360°', fi: 'Kulma on täynnä: tasan 360°',
          tr: 'Köşe doldu: tam 360°', fr: 'Le coin est plein : exactement 360°', es: 'La esquina está llena: exactamente 360°',
          ja: '角がいっぱい：ちょうど360°', ar: 'الزاوية ممتلئة: 360° تمامًا' },
  gleich: { de: 'Nur eine Sorte zählt nicht. Nimm verschiedene Vielecke.', en: 'Only one kind doesn’t count. Use different shapes.',
            fi: 'Vain yksi laji ei kelpaa. Käytä eri monikulmioita.', tr: 'Tek tür sayılmaz. Farklı çokgenler kullan.',
            fr: 'Une seule sorte ne compte pas. Prends des polygones différents.', es: 'Una sola clase no cuenta. Usa polígonos distintos.',
            ja: '1種類だけでは数えないよ。ちがう形をまぜよう。', ar: 'نوع واحد لا يُحسب. استخدم مضلعات مختلفة.' },
  schon: { de: 'Diese Art hast du schon gefunden.', en: 'You already found this one.', fi: 'Tämän löysit jo.',
           tr: 'Bunu zaten buldun.', fr: 'Tu as déjà trouvé celle-ci.', es: 'Esta ya la encontraste.',
           ja: 'これはもう見つけたよ。', ar: 'وجدت هذه من قبل.' },
  leeren: { de: 'Tippe, um die Ecke zu leeren', en: 'Tap to empty the corner', fi: 'Napauta, niin kulma tyhjenee',
            tr: 'Köşeyi boşaltmak için dokun', fr: 'Touche l’écran pour vider le coin', es: 'Toca para vaciar la esquina',
            ja: 'タップすると角が空になる', ar: 'انقر لتفريغ الزاوية' },
  weg: { de: 'Zum Wegnehmen tippe auf das letzte Vieleck', en: 'To take one away, tap the last shape',
         fi: 'Napauta viimeistä monikulmiota, niin se lähtee pois', tr: 'Geri almak için son çokgene dokun',
         fr: 'Pour en retirer un, touche le dernier polygone', es: 'Para quitar uno, toca el último polígono',
         ja: '最後の形をタップすると取りのぞける', ar: 'لإزالة شكل، انقر على آخر مضلع' },
  gefunden: { de: 'Gefunden:', en: 'Found:', fi: 'Löydetyt:', tr: 'Bulunanlar:', fr: 'Trouvés :', es: 'Encontrados:',
              ja: '見つけた：', ar: 'وجدت:' },
  falsch: { de: 'Passt nicht: es sind nur noch {n}° frei.', en: 'It doesn’t fit: only {n}° are still free.',
            fi: 'Ei mahdu: vain {n}° on enää vapaana.', tr: 'Sığmıyor: sadece {n}° boş kaldı.',
            fr: 'Ça ne rentre pas : il ne reste que {n}° de libre.', es: 'No cabe: solo quedan {n}° libres.',
            ja: '入らないよ：あと{n}°しかあいていない。', ar: 'لا يتسع: لم يبقَ إلا {n}° فارغة.' }
};
// Text mit eingesetzter Zahl, in allen Sprachen
function mitZahl(t, n) {
  var r = {};
  Object.keys(t).forEach(function (l) { r[l] = t[l].replace('{n}', n); });
  return r;
}

function innen(n) { return 180 - 360 / n; }
function summe(Z) { return Z.liste.reduce(function (s, n) { return s + innen(n); }, 0); }
function voll(Z) { return Z.liste.length > 0 && summe(Z) === 360; }
// Zusammensetzung ohne Reihenfolge: Anzahl je Form, z. B. "1,2,0,1" (Dreiecke, Quadrate, Fünfecke, Sechsecke)
// nur eine Sorte Vieleck in der Ecke
function einerlei(liste) { return liste.every(function (n) { return n === liste[0]; }); }
function art(liste) {
  return FORMEN.map(function (n) { return liste.filter(function (m) { return m === n; }).length; }).join(',');
}
// Farbe des i-ten Vielecks: abwechselnd Braun und Grau
function farbe(i) { return App.winkel.farben[i % 2 ? 2 : 1]; }

// Maße von unten nach oben: drei Textzeilen und zwei Reihen gefundener Füllungen über der grünen Karte (bzw. dem
// Platz für sie), darüber die Plättchenreihe, darüber das Bild mit dem Punkt in der Mitte. Bei kleinen Bildschirmen
// ist unten nur Platz für die rote Karte frei; erscheint die grüne Karte, rückt alles über sie (das Bild wird kleiner).
// Wird das Bild so zu klein, stehen die Plättchen zu viert (2 × 2) rechts neben dem Bild.
function lage() {
  var oben = App.winkel.platz(1).oben, karte = document.getElementById('fertig'), klein = S.h < 700, kante;
  if (karte && !karte.hidden) kante = karte.getBoundingClientRect().top - 6;
  else kante = S.h - (S.unten || 70) - (klein ? 52 : 84);
  var y1 = kante - 90, ch = klein ? 54 : 62;
  // das Sechseck reicht 2 Seitenlängen weit vom Punkt weg
  function seite(b, h) { return Math.max(22, Math.min((b / 2 - 8) / 2, (h / 2 - 2) / 2)); }
  // Plättchen in einer Reihe unter dem Bild
  var cw = Math.min(84, (S.w - 32) / 4), yb = y1 - 19 - ch / 2, bu = Math.max(oben + 100, yb - ch / 2 - 8);
  var L = { m: [S.w / 2, (oben + bu) / 2], s: seite(S.w - 16, bu - oben), cw: cw, ch: ch, y1: y1, p: [] };
  FORMEN.forEach(function (n, i) { L.p.push([S.w / 2 + (i - 1.5) * cw, yb]); });
  // sonst 2 × 2 rechts neben dem Bild, wenn das Bild so größer wird
  var cw2 = 58, ch2 = 54, br = S.w - 16 - 2 * cw2 - 4, bu2 = y1 - 19, s2 = seite(br - 16, bu2 - oben);
  if (L.s < 44 && s2 > L.s + 4 && bu2 - oben >= 2 * ch2 + 8) {
    var my = (oben + bu2) / 2;
    L = { m: [16 + (br - 16) / 2, my], s: s2, cw: cw2, ch: ch2, y1: y1, p: [] };
    FORMEN.forEach(function (n, i) {
      L.p.push([S.w - 16 - cw2 * (i % 2 ? 0.5 : 1.5), my + (i < 2 ? -0.5 : 0.5) * (ch2 + 6)]);
    });
  }
  return L;
}
// Ecken eines regelmäßigen n-Ecks mit einer Ecke im Punkt m, erste Seite in Richtung a, gegen den Uhrzeigersinn
function vieleck(m, s, a, n) {
  var p = [m.slice()], h = a, ext = 2 * Math.PI / n;
  for (var i = 1; i < n; i++) {
    var q = p[i - 1];
    p.push([q[0] + s * Math.cos(h), q[1] - s * Math.sin(h)]);
    h += ext;
  }
  return p;
}
// Alle gelegten Vielecke mit Startrichtung und Winkel am Punkt
function gelegt(Z, L) {
  var a = START;
  return Z.liste.map(function (n, i) {
    var sw = innen(n) * Math.PI / 180, r = { n: n, a: a, sw: sw, p: vieleck(L.m, L.s, a, n), f: farbe(i) };
    a += sw;
    return r;
  });
}
function drin(p, w) {
  var ja = false;
  for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
    if ((p[i][1] > w[1]) !== (p[j][1] > w[1]) &&
        w[0] < (p[j][0] - p[i][0]) * (w[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) ja = !ja;
  }
  return ja;
}
// Kleines regelmäßiges Vieleck mit waagrechter Unterkante (für Plättchen und gefundene Füllungen)
function symbol(ctx, cx, cy, r, n, fuell, linie, lw) {
  ctx.beginPath();
  for (var i = 0; i < n; i++) {
    var t = -Math.PI / 2 - Math.PI / n + 2 * Math.PI * i / n, x = cx + r * Math.cos(t), y = cy - r * Math.sin(t);
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fuell; ctx.fill();
  ctx.strokeStyle = linie; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
}

function legen(Z, n) {
  if (voll(Z)) { Z.liste = []; Z.doppelt = false; Z.gleich = false; }
  var frei = 360 - summe(Z);
  if (innen(n) > frei) { App.winkel.falsch(mitZahl(TEXT.falsch, frei)); return; }
  Z.liste.push(n);
  if (!voll(Z)) return;
  var k = art(Z.liste);
  Z.gleich = einerlei(Z.liste);
  Z.doppelt = !Z.gleich && Z.gefunden.indexOf(k) >= 0;
  if (!Z.doppelt && !Z.gleich) {
    Z.gefunden.push(k);
    if (Z.gefunden.length >= ZIELE) App.winkel.geschafft();
  }
}

App.level('winkel', {
  id: 'mosaik',
  text: {
    de: { title: 'Mosaik',
          task: 'Leg Vielecke um die Ecke, bis sie voll ist: genau 360°. Tippe unten auf ein Vieleck. Finde drei Arten mit verschiedenen Vielecken gemischt.',
          done: 'Um eine Ecke müssen die Winkel genau 360° ergeben. Dreiecke, Quadrate und Sechsecke passen, Fünfecke nie.' },
    en: { title: 'Mosaic',
          task: 'Put shapes around the corner until it is full: exactly 360°. Tap a shape below. Find three ways that mix different shapes.',
          done: 'Around a corner the angles must add up to exactly 360°. Triangles, squares and hexagons fit, pentagons never.' },
    fi: { title: 'Mosaiikki',
          task: 'Laita monikulmioita kulman ympärille, kunnes se on täynnä: tasan 360°. Napauta monikulmiota alhaalla. Löydä kolme tapaa, joissa on eri monikulmioita sekaisin.',
          done: 'Kulman ympärillä kulmien summan pitää olla tasan 360°. Kolmiot, neliöt ja kuusikulmiot sopivat, viisikulmiot eivät koskaan.' },
    tr: { title: 'Mozaik',
          task: 'Köşe dolana kadar etrafına çokgenler koy: tam 360°. Aşağıdaki bir çokgene dokun. Farklı çokgenleri karıştıran üç yol bul.',
          done: 'Bir köşenin etrafındaki açıların toplamı tam 360° olmalı. Üçgenler, kareler ve altıgenler uyar, beşgenler asla.' },
    fr: { title: 'Mosaïque',
          task: 'Pose des polygones autour du coin jusqu’à ce qu’il soit plein : exactement 360°. Touche un polygone en bas. Trouve trois façons qui mélangent des polygones différents.',
          done: 'Autour d’un coin, les angles doivent faire exactement 360°. Triangles, carrés et hexagones vont bien, les pentagones jamais.' },
    es: { title: 'Mosaico',
          task: 'Pon polígonos alrededor de la esquina hasta que esté llena: exactamente 360°. Toca un polígono abajo. Encuentra tres maneras que mezclen polígonos distintos.',
          done: 'Alrededor de una esquina los ángulos deben sumar exactamente 360°. Triángulos, cuadrados y hexágonos encajan, los pentágonos nunca.' },
    ja: { title: 'モザイク',
          task: '角のまわりに多角形をならべて、いっぱいにしよう：ちょうど360°。下の形をタップ。ちがう形をまぜたならべ方を3つ見つけよう。',
          done: '1つの角のまわりの角を合わせると、ちょうど360°。三角形、正方形、六角形はぴったり合うけれど、五角形はけっして合わない。' },
    ar: { title: 'فسيفساء',
          task: 'ضع مضلعات حول الزاوية حتى تمتلئ: 360° تمامًا. انقر على مضلع في الأسفل. جد ثلاث طرق تخلط مضلعات مختلفة.',
          done: 'حول الزاوية يجب أن يكون مجموع الزوايا 360° تمامًا. المثلثات والمربعات والسداسيات تتلاءم، أما الخماسيات فأبدًا.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) { Z.liste = []; Z.gefunden = []; Z.doppelt = false; Z.gleich = false; },

  down: function (Z, w) {
    if (Z.falsch) App.winkel.falschWeg();   // die rote Karte verschwindet beim nächsten Versuch
    var L = lage();
    // Plättchen unten
    for (var i = 0; i < FORMEN.length; i++) {
      if (Math.abs(w[0] - L.p[i][0]) <= L.cw / 2 && Math.abs(w[1] - L.p[i][1]) <= L.ch / 2) { legen(Z, FORMEN[i]); return; }
    }
    // volle Ecke: Antippen leert sie für den nächsten Versuch
    if (voll(Z)) { Z.liste = []; Z.doppelt = false; Z.gleich = false; return; }
    // das zuletzt gelegte Vieleck antippen: wieder wegnehmen
    var g = gelegt(Z, L);
    if (g.length && drin(g[g.length - 1].p, w)) Z.liste.pop();
  },
  move: function () {},
  up: function () {},

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, L = lage(), m = L.m;
    // gelegte Vielecke: Füllung braun/grau, Rand Tinte, Winkelfeld am Punkt mit Zahl
    gelegt(Z, L).forEach(function (v) {
      ctx.beginPath(); ctx.moveTo(v.p[0][0], v.p[0][1]);
      v.p.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
      ctx.closePath();
      ctx.fillStyle = v.f.fuell; ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k; ctx.lineJoin = 'round'; ctx.stroke();
      H.feld(ctx, m, L.s * 0.3, v.a, v.sw, v.f.fuell, v.f.linie, ws);
      // kleines Bild: kleinere Zahl, etwas weiter außen, damit sie zwischen die Seiten passt
      var mid = v.a + v.sw / 2, klein = L.s < 50, ra = klein ? L.s * 0.6 : L.s * 0.3 + 16 * k;
      App.text(ctx, innen(v.n) + '°', m[0] + Math.cos(mid) * ra, m[1] - Math.sin(mid) * ra, v.f.linie, klein ? 11 : 14);
    });
    // die Ecke des Mosaiks
    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.arc(m[0], m[1], 4.5 * k, 0, H.TAU); ctx.fill();
    // Plättchen zum Antippen
    var r = Math.min(L.ch < 60 ? 14 : 17, L.cw * 0.22);
    FORMEN.forEach(function (n, i) {
      var x = L.p[i][0], top = L.p[i][1] - L.ch / 2, b = L.cw - 8;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - b / 2, top, b, L.ch, 10); else ctx.rect(x - b / 2, top, b, L.ch);
      ctx.fillStyle = 'rgba(56,41,25,0.05)'; ctx.fill();
      ctx.strokeStyle = 'rgba(56,41,25,0.28)'; ctx.lineWidth = 1.2; ctx.stroke();
      symbol(ctx, x, top + L.ch / 2 - 7, r, n, H.farben[i % 2 ? 2 : 1].fuell, ink, 1.8);
      ctx.fillStyle = ink; ctx.font = '400 13px ' + C.FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(innen(n) + '°', x, top + L.ch - 11);
    });
  },

  // Unten: 120° + 90° + 90° = 300°, darunter "noch 60° frei" (bzw. voll), ein Hinweis und die gefundenen Füllungen
  overlay: function (ctx, Z) {
    var H = App.winkel, L = lage(), y = L.y1, sum = summe(Z);
    ctx.save();
    if (Z.liste.length) {
      var teile = [];
      Z.liste.forEach(function (n, i) {
        if (i) teile.push({ t: ' + ', c: C.INK });
        teile.push({ t: innen(n) + '°', c: farbe(i).linie });
      });
      if (Z.liste.length > 1) teile.push({ t: ' = ' + sum + '°', c: C.INK });
      ctx.font = '400 20px ' + C.FONT;
      var breite = teile.reduce(function (s, t) { return s + ctx.measureText(t.t).width; }, 0);
      H.zeile(ctx, teile, y, Math.min(20, Math.floor(20 * (S.w - 24) / breite)));
    }
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.font = '400 14.5px ' + C.FONT;
    if (voll(Z)) {
      ctx.fillStyle = Z.doppelt || Z.gleich ? C.PENCIL : C.INK;
      ctx.fillText(App.wahl(Z.gleich ? TEXT.gleich : Z.doppelt ? TEXT.schon : TEXT.voll), S.w / 2, y + 22);
      ctx.fillStyle = C.PENCIL;
      ctx.fillText(App.wahl(TEXT.leeren), S.w / 2, y + 44);
    } else {
      ctx.fillStyle = C.PENCIL;
      ctx.fillText(App.wahl(mitZahl(TEXT.frei, 360 - sum)), S.w / 2, y + 22);
      if (Z.liste.length) ctx.fillText(App.wahl(TEXT.weg), S.w / 2, y + 44);
    }
    // gefundene Füllungen als kleine Symbole: je Füllung eine Gruppe, z. B. ⬡⬡⬡ oder ⬡◻◻△
    if (Z.gefunden.length) {
      ctx.font = '400 13px ' + C.FONT; ctx.direction = 'ltr';
      var label = App.wahl(TEXT.gefunden), lw = ctx.measureText(label).width + 10, platzW = S.w - 32;
      var gruppen = Z.gefunden.map(function (key) {
        var anz = key.split(',').map(Number), formen = [];
        [3, 2, 1, 0].forEach(function (j) { for (var c = 0; c < anz[j]; c++) formen.push(FORMEN[j]); });   // Sechsecke zuerst
        return formen;
      });
      // Symbolgröße so wählen, dass alles in höchstens zwei Reihen passt
      var r = 6.5, reihen;
      for (;;) {
        var d = 2 * r + 3, luecke = 3.5 * r;
        reihen = [[]]; var x = lw;
        gruppen.forEach(function (g) {
          var gb = g.length * d - 3;
          if (x + gb > platzW && reihen[reihen.length - 1].length) { reihen.push([]); x = lw; }
          reihen[reihen.length - 1].push(g); x += gb + luecke;
        });
        if (reihen.length <= 2 || r <= 4) break;
        r -= 0.5;
      }
      var ry = y + 64;
      reihen.forEach(function (reihe, ri) {
        var gesamt = lw + reihe.reduce(function (s, g) { return s + g.length * d - 3 + luecke; }, 0) - luecke;
        var x0 = (S.w - gesamt) / 2;
        if (ri === 0) {
          ctx.fillStyle = C.PENCIL; ctx.textAlign = 'left'; ctx.fillText(label, x0, ry);
        }
        var x = x0 + lw;
        reihe.forEach(function (g) {
          g.forEach(function (n, j) {
            symbol(ctx, x + r + j * d, ry + (n === 3 ? 1 : 0), r, n, H.farben[n === 4 ? 2 : 1].fuell, C.INK, 1.2);
          });
          x += g.length * d - 3 + luecke;
        });
        ry += 2 * r + 5;
      });
    }
    ctx.restore();
  },

  bild: function (Z) {
    return (Z.liste.length || Z.gefunden.length) ? { v: 1, liste: Z.liste.slice(), gefunden: Z.gefunden.slice(), doppelt: Z.doppelt } : null;
  },
  ausBild: function (Z, b) {
    if (b.v !== 1) return;
    Z.liste = (b.liste || []).filter(function (n) { return FORMEN.indexOf(n) >= 0; });
    Z.gefunden = (b.gefunden || []).filter(function (k) { return k.split(',').filter(function (a) { return a !== '0'; }).length > 1; });   // nur gemischte
    Z.gleich = voll(Z) && einerlei(Z.liste);
    Z.doppelt = !!b.doppelt && voll(Z);
  }
});
})();
