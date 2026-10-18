// Level: Was ist ein Grad? Ein Zeiger aus der Kreismitte, am Griff an seiner Spitze dreht man ihn.
// Das Feld zeigt, wie weit er sich schon gedreht hat, mit der Gradzahl. Drei Aufgaben nacheinander:
// eine Vierteldrehung (90°), eine halbe Drehung (180°), eine ganze Drehung (360°). Beim Loslassen in der Nähe
// rastet der Zeiger ein und es steht da, wie viel Grad das sind; Antippen bringt die nächste Aufgabe.
// Zu weit gedreht: rote Karte mit Hinweis.
// Gelöst nach der ganzen Drehung.
(function () {
var App = window.App, S = App.S, C = App.C;
var ZIELE = [90, 180, 360], BRUCH = ['1/4', '1/2', '1'];
var EINRASTEN = 10;   // Grad

var TEXT = {
  auftrag: [
    { de: 'Dreh den Zeiger eine Vierteldrehung', en: 'Turn the pointer a quarter turn', fi: 'Käännä osoitinta neljänneskierros',
      tr: 'İbreyi çeyrek tur döndür', fr: 'Fais tourner l’aiguille d’un quart de tour', es: 'Gira la aguja un cuarto de vuelta',
      ja: '針を1/4回転させよう', ar: 'أدِر المؤشر ربع دورة' },
    { de: 'Dreh den Zeiger eine halbe Drehung', en: 'Turn the pointer a half turn', fi: 'Käännä osoitinta puoli kierrosta',
      tr: 'İbreyi yarım tur döndür', fr: 'Fais tourner l’aiguille d’un demi-tour', es: 'Gira la aguja media vuelta',
      ja: '針を半回転させよう', ar: 'أدِر المؤشر نصف دورة' },
    { de: 'Dreh den Zeiger eine ganze Drehung', en: 'Turn the pointer a whole turn', fi: 'Käännä osoitinta kokonainen kierros',
      tr: 'İbreyi tam bir tur döndür', fr: 'Fais faire un tour complet à l’aiguille', es: 'Gira la aguja una vuelta entera',
      ja: '針を1回転させよう', ar: 'أدِر المؤشر دورة كاملة' }
  ],
  falsch: [
    { de: 'Noch nicht. Eine Vierteldrehung ist ein Viertel vom Kreis.', en: 'Not yet. A quarter turn is a quarter of the circle.',
      fi: 'Ei vielä. Neljänneskierros on neljännes ympyrästä.', tr: 'Henüz değil. Çeyrek tur, çemberin dörtte biridir.',
      fr: 'Pas encore. Un quart de tour, c’est un quart du cercle.', es: 'Todavía no. Un cuarto de vuelta es un cuarto del círculo.',
      ja: 'まだです。1/4回転は円の4分の1です。', ar: 'ليس بعد. ربع الدورة هو ربع الدائرة.' },
    { de: 'Noch nicht. Nach einer halben Drehung zeigt der Zeiger genau in die andere Richtung.',
      en: 'Not yet. After a half turn the pointer points exactly the other way.',
      fi: 'Ei vielä. Puolen kierroksen jälkeen osoitin osoittaa täsmälleen vastakkaiseen suuntaan.',
      tr: 'Henüz değil. Yarım turdan sonra ibre tam ters yönü gösterir.',
      fr: 'Pas encore. Après un demi-tour, l’aiguille montre exactement l’autre direction.',
      es: 'Todavía no. Después de media vuelta la aguja apunta justo al lado contrario.',
      ja: 'まだです。半回転すると、針はちょうど反対の向きになります。',
      ar: 'ليس بعد. بعد نصف دورة يشير المؤشر إلى الاتجاه المعاكس تمامًا.' },
    { de: 'Noch nicht. Nach einer ganzen Drehung ist der Zeiger wieder am Start.',
      en: 'Not yet. After a whole turn the pointer is back at the start.',
      fi: 'Ei vielä. Kokonaisen kierroksen jälkeen osoitin on taas alussa.',
      tr: 'Henüz değil. Tam bir turdan sonra ibre yine başlangıçtadır.',
      fr: 'Pas encore. Après un tour complet, l’aiguille est revenue au départ.',
      es: 'Todavía no. Después de una vuelta entera la aguja vuelve al inicio.',
      ja: 'まだです。1回転すると、針はスタートにもどります。',
      ar: 'ليس بعد. بعد دورة كاملة يعود المؤشر إلى البداية.' }
  ],
  drehung: { de: 'Drehung', en: 'turn', fi: 'kierros', tr: 'tur', fr: 'tour', es: 'vuelta', ja: '回転', ar: 'دورة' },
  weiter: { de: 'Tippe für die nächste Aufgabe', en: 'Tap for the next task', fi: 'Napauta, niin tulee seuraava tehtävä',
            tr: 'Sonraki görev için dokun', fr: 'Touche l’écran pour la suite', es: 'Toca para la siguiente tarea',
            ja: 'タップすると次の問題', ar: 'انقر للمهمة التالية' }
};

function abst(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }
function kreis() {
  var P = App.winkel.platz(2);
  return { m: [S.w / 2, P.my], r: Math.max(60, Math.min(S.w * 0.32, P.h / 2 - 24)) };
}
// Spitze des Zeigers: Start nach rechts, gedreht um Z.a Grad (positiv gegen den Uhrzeigersinn)
function spitze(Z) {
  var K = kreis(), d = Z.a * Math.PI / 180;
  return [K.m[0] + Math.cos(d) * K.r, K.m[1] - Math.sin(d) * K.r];
}

function drehen(Z, w) {
  var m = kreis().m;
  if (abst(m, w) < 20 * S.k) return;
  var d = Math.atan2(m[1] - w[1], w[0] - m[0]) * 180 / Math.PI;
  if (Z.letzte !== null) {
    var dd = ((d - Z.letzte + 180) % 360 + 360) % 360 - 180;
    Z.a = Math.max(-360, Math.min(360, Z.a + dd));
  }
  Z.letzte = d;
}

App.level('winkel', {
  id: 'drehungen',
  text: {
    de: { title: 'Drehungen',
          task: 'Dreh den Zeiger am Griff. Eine ganze Drehung hat 360 Grad (360°). Wie viel Grad sind eine Vierteldrehung und eine halbe Drehung?',
          done: 'Eine Vierteldrehung sind 90°, eine halbe Drehung 180° und eine ganze Drehung 360°.' },
    en: { title: 'Turns',
          task: 'Turn the pointer by its handle. A whole turn has 360 degrees (360°). How many degrees are a quarter turn and a half turn?',
          done: 'A quarter turn is 90°, a half turn 180° and a whole turn 360°.' },
    fi: { title: 'Kierrokset',
          task: 'Käännä osoitinta kahvasta. Kokonaisessa kierroksessa on 360 astetta (360°). Montako astetta on neljänneskierros ja puoli kierrosta?',
          done: 'Neljänneskierros on 90°, puoli kierrosta 180° ja kokonainen kierros 360°.' },
    tr: { title: 'Dönüşler',
          task: 'İbreyi tutamağından döndür. Tam bir tur 360 derecedir (360°). Çeyrek tur ve yarım tur kaç derece?',
          done: 'Çeyrek tur 90°, yarım tur 180° ve tam tur 360°.' },
    fr: { title: 'Les tours',
          task: 'Fais tourner l’aiguille par sa poignée. Un tour complet fait 360 degrés (360°). Combien de degrés font un quart de tour et un demi-tour ?',
          done: 'Un quart de tour fait 90°, un demi-tour 180° et un tour complet 360°.' },
    es: { title: 'Giros',
          task: 'Gira la aguja por su asa. Una vuelta entera tiene 360 grados (360°). ¿Cuántos grados son un cuarto de vuelta y media vuelta?',
          done: 'Un cuarto de vuelta son 90°, media vuelta 180° y una vuelta entera 360°.' },
    ja: { title: '回転',
          task: '持ち手で針を回そう。1回転は360度（360°）です。1/4回転と半回転は何度かな？',
          done: '1/4回転は90°、半回転は180°、1回転は360°です。' },
    ar: { title: 'الدورات',
          task: 'أدِر المؤشر من مقبضه. الدورة الكاملة 360 درجة (360°). كم درجة في ربع الدورة ونصف الدورة؟',
          done: 'ربع الدورة 90°، ونصف الدورة 180°، والدورة الكاملة 360°.' }
  },
  werkzeuge: ['clear'],

  neu: function (Z) { Z.stufe = 0; Z.a = 0; Z.da = false; Z.zieht = false; Z.letzte = null; },

  down: function (Z, w) {
    var H = App.winkel;
    if (Z.falsch) H.falschWeg();
    if (Z.da) {   // Antippen: nächste Aufgabe
      if (Z.stufe < ZIELE.length - 1) { Z.stufe++; Z.a = 0; Z.da = false; }
      return;
    }
    Z.zieht = abst(w, spitze(Z)) <= C.GRAB * 1.3 * S.k;   // nur am Griff
    Z.letzte = null;
    if (Z.zieht) drehen(Z, w);
  },
  move: function (Z, w) { if (Z.zieht) drehen(Z, w); },
  up: function (Z) {
    if (!Z.zieht) return;
    Z.zieht = false;
    var ziel = ZIELE[Z.stufe], b = Math.abs(Z.a);
    if (Math.abs(b - ziel) <= EINRASTEN) {
      Z.a = Z.a < 0 ? -ziel : ziel; Z.da = true;
      if (Z.stufe === ZIELE.length - 1) App.winkel.geschafft();
    } else if (b > ziel) App.winkel.falsch(TEXT.falsch[Z.stufe]);   // zu weit gedreht; zu kurz: einfach weiterdrehen
  },

  draw: function (ctx, Z, ws) {
    var H = App.winkel, k = S.k, ink = C.INK, K = kreis(), m = K.m, r = K.r, f = H.farben[1];
    // Kreis dünn in Grau, Startrichtung gestrichelt
    ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 1.4 * ws * k;
    ctx.beginPath(); ctx.arc(m[0], m[1], r, 0, H.TAU); ctx.stroke();
    ctx.save(); ctx.setLineDash([6 * k, 6 * k]);
    ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(m[0] + r, m[1]); ctx.stroke();
    ctx.restore();
    // gedrehter Teil als braunes Feld
    var sw = Math.abs(Z.a) * Math.PI / 180;
    if (sw > 0.001) {
      if (Z.a > 0) H.feld(ctx, m, r * 0.82, 0, sw, f.fuell, f.linie, ws);
      else H.feld(ctx, m, r * 0.82, -sw, sw, f.fuell, f.linie, ws);
    }
    // Zeiger mit Griff an der Spitze
    var p = spitze(Z);
    H.strecke(ctx, m, p, ink, ws);
    ctx.fillStyle = ink; App.dotAt(ctx, m, false, 5);
    if (!Z.da) {
      ctx.strokeStyle = ink; ctx.lineWidth = 2 * ws * k;
      ctx.beginPath(); ctx.arc(p[0], p[1], 15 * k, 0, H.TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(56,41,25,0.12)'; ctx.fill();
    }
    // Gradzahl im Feld
    if (Math.abs(Z.a) >= 1) {
      var mid = (Z.a / 2) * Math.PI / 180, ra = Math.abs(Z.a) >= 330 ? 0 : r * 0.45;
      if (Math.abs(Z.a) >= 330) mid = 0;
      var lx = m[0] + Math.cos(mid) * ra, ly = m[1] - Math.sin(mid) * ra + (ra ? 0 : r * 0.4);
      App.text(ctx, Math.round(Math.abs(Z.a)) + '°', lx, ly, f.linie, Z.da ? 20 : 17);
    }
  },

  // Unten: Auftrag bzw. 1/4 Drehung = 90°, darunter "Tippe für die nächste Aufgabe"
  overlay: function (ctx, Z) {
    var H = App.winkel, y = H.textY(2);
    ctx.save();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    if (Z.da) {
      ctx.font = '400 20px ' + C.FONT; ctx.fillStyle = H.farben[1].linie;
      ctx.fillText(BRUCH[Z.stufe] + ' ' + App.wahl(TEXT.drehung) + ' = ' + ZIELE[Z.stufe] + '°', S.w / 2, y);
      if (Z.stufe < ZIELE.length - 1) {
        ctx.font = '400 14.5px ' + C.FONT; ctx.fillStyle = C.PENCIL;
        ctx.fillText(App.wahl(TEXT.weiter), S.w / 2, y + 22);
      }
    } else {
      ctx.font = '400 17px ' + C.FONT; ctx.fillStyle = C.INK;
      ctx.fillText(App.wahl(TEXT.auftrag[Z.stufe]), S.w / 2, y + 11);
    }
    ctx.restore();
  },

  bild: function (Z) { return (Z.stufe || Z.a) ? { v: 1, stufe: Z.stufe, a: Z.a, da: Z.da } : null; },
  ausBild: function (Z, b) { if (b.v === 1) { Z.stufe = b.stufe; Z.a = b.a; Z.da = b.da; } }
});
})();
