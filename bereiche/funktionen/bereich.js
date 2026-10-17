/* Bereich Funktionen. Zwei Arten von Leveln (in level/, Reihenfolge in reihenfolge.js):
   - Maschinen-Level (DOM-Fläche #mach): bringen start(M), html(M) und click(M, act, d) mit.
     Hilfen dafür in App.funk (Zahlentasten, Antwortknöpfe, finish ...).
   - Gitter-Level (Canvas mit Koordinatensystem): nur Daten, pts (Punkte setzen) oder eq und xs (Gerade). */
(function () {
'use strict';
var App = window.App, S = App.S, C = App.C;
var V = App.V, vp = App.vp, render = App.render, dotAt = App.dotAt, mark = App.mark, text = App.text;
var GRAB = C.GRAB, INK = C.INK, BLUE = C.BLUE;
var U = 40;   // Pixel pro Einheit im Koordinatensystem
var M = null;   // Zustand des aktuellen Maschinen-Levels
var FLEVELS = [];
var F = { level: 0, pts: [], lines: [], gid: 0, solved: new Set(), solutions: {}, work: {} };
var FKEY = 'euklid-funk';
var OLD_FKEY = 'euklid-funk-v3';   // alter Stand nach Position, wird einmal übernommen
var mach = null;

function isMach(lv) { return typeof lv.start === 'function'; }
function fmt(n) { return n < 0 ? '−' + (-n) : String(n); }
function eqStr(q) {
  var t = q.m === 1 ? 'x' : (q.m === -1 ? '−x' : fmt(q.m) + 'x');
  if (q.b > 0) t += ' + ' + q.b; else if (q.b < 0) t += ' − ' + (-q.b);
  return 'y = ' + t;
}
function fNeed(lv) {
  if (lv.eq) return lv.xs.map(function (x) { return [x, lv.eq.m * x + lv.eq.b]; });
  return lv.pts.map(function (p) { return [p.x, p.y]; });
}
function fHas(x, y) { return F.pts.some(function (p) { return p.x === x && p.y === y; }); }
function fcopy(sn) {
  return {
    pts: sn.pts.map(function (p) { return p.fest ? { x: p.x, y: p.y, gid: 0, fest: true } : { x: p.x, y: p.y, gid: p.gid }; }),
    lines: sn.lines.map(function (l) { return l.fest ? { a: l.a.slice(), b: l.b.slice(), gid: 0, fest: true } : { a: l.a.slice(), b: l.b.slice(), gid: l.gid }; }),
    fn: !!sn.fn, runde: sn.runde || 0
  };
}
function fnow() { return fcopy({ pts: F.pts, lines: F.lines, fn: F.fn, runde: F.runde }); }
// Gerade durch die zwei vorgegebenen Punkte (Level mit verbinden)
function fRegel() {
  var q = F.pts.filter(function (p) { return p.fest; });
  if (q.length < 2) return null;
  var m = (q[1].y - q[0].y) / (q[1].x - q[0].x);
  return { m: m, b: q[0].y - m * q[0].x };
}
// Zwei zufällige Punkte auf y = m·x + b mit m 1 oder 2, b 0 bis 3, beide mit y von 0 bis 4
function fFestPunkte() {
  for (;;) {
    var m = 1 + rnd(2), b = rnd(4), x1 = rnd(7) - 3, x2 = rnd(7) - 3, y1 = m * x1 + b, y2 = m * x2 + b;
    if (x2 - x1 >= 2 && y1 >= 0 && y2 >= 0 && y1 <= 4 && y2 <= 4) {
      return [{ x: x1, y: y1, gid: 0, fest: true }, { x: x2, y: y2, gid: 0, fest: true }];
    }
  }
}
// Level mit schnitt: vorgegebene Gerade durch (xs|0) und (0|ys), beide ganzzahlig und nicht 0
function fFestLinie() {
  var xs = 0, ys = 1 + rnd(3);
  while (!xs) xs = rnd(9) - 4;
  return { a: [xs * U, 0], b: [0, -ys * U], gid: 0, fest: true };
}
// Level mit steigung: fünf Geraden nacheinander, auch fallende. Jede hat ein Steigungsdreieck:
// a ist der Anfang, b liegt d nach rechts und m·d nach oben (bei negativem m nach unten). d ist 1, 2 oder 3.
function fFestSteigung() {
  var paare = [];
  [-3, -2, -1, 1, 2, 3].forEach(function (m) { [1, 2, 3].forEach(function (d) { if (Math.abs(m * d) <= 4) paare.push([m, d]); }); });
  for (;;) {
    var w = shuffle(paare.slice()).slice(0, 5);
    // mindestens eine steigende, eine fallende und eine mit mehr als 1 nach rechts
    if (w.some(function (p) { return p[0] > 0; }) && w.some(function (p) { return p[0] < 0; }) && w.some(function (p) { return p[1] > 1; })) {
      return w.map(function (p) {
        var m = p[0], d = p[1], x = 1, y = m > 0 ? 1 : 1 - m * d;
        return { a: [x * U, -y * U], b: [(x + d) * U, -(y + m * d) * U], gid: 0, fest: true };
      });
    }
  }
}
function fLauf(l) { return Math.round((l.b[0] - l.a[0]) / U); }
function fSteig(l) { return Math.round((l.a[1] - l.b[1]) / U) / fLauf(l); }
// Ansicht so legen, dass das Dreieck der aktuellen Geraden zwischen Aufgabe und Eingabekarte liegt
function steigAnsicht() {
  var l = F.lines[F.runde], hud = document.getElementById('hud');
  if (!l || !schreib) return;
  var oben = hud && hud.firstChild ? hud.getBoundingClientRect().bottom : 60;
  var unten = schreib.hidden ? S.h - (S.unten || 70) : schreib.getBoundingClientRect().top;
  var ym = (-l.a[1] - l.b[1]) / 2 / U, xm = (l.a[0] + l.b[0]) / 2 / U;
  S.oy = (oben + unten) / 2 + ym * U;
  S.ox = S.w / 2 - xm * U;
  App.applyView();
}
function fSchnitt() {
  var l = F.lines.filter(function (l) { return l.fest; })[0];
  return l ? { x: Math.round(l.a[0] / U), y: -Math.round(l.b[1] / U) } : null;
}
function fLattice(pos) { return V([Math.round(pos[0] / U) * U, Math.round(pos[1] / U) * U]); }
function fSnap(pos) {
  var g = fLattice(pos);
  return Math.hypot(g.x - pos[0], g.y - pos[1]) < GRAB * 0.7 * S.k ? g : null;
}
function extLine(ctx, a, b, width) {
  var dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, L = 8000;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a[0] - dx / n * L, a[1] - dy / n * L);
  ctx.lineTo(a[0] + dx / n * L, a[1] + dy / n * L);
  ctx.stroke();
}

function buildFunk(ctx, ws) {
  var k = S.k, i;
  var cs = [[0, 0], [S.w, 0], [0, S.h], [S.w, S.h]].map(App.toWorld);
  var xs = cs.map(function (c) { return c[0]; }), ys = cs.map(function (c) { return c[1]; });
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  var steps = [1, 2, 5, 10, 20, 50, 100], st = 100;
  for (i = 0; i < steps.length; i++) { if (steps[i] * U * S.vs >= 26) { st = steps[i]; break; } }
  var sp = st * U, gx, gy;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(56,41,26,0.13)'; ctx.lineWidth = 1 * ws * k;
  ctx.beginPath();
  for (gx = Math.ceil(x0 / sp) * sp; gx <= x1; gx += sp) { ctx.moveTo(gx, y0); ctx.lineTo(gx, y1); }
  for (gy = Math.ceil(y0 / sp) * sp; gy <= y1; gy += sp) { ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); }
  ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5 * ws * k;
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.moveTo(0, y0); ctx.lineTo(0, y1); ctx.stroke();
  var lab = 'rgba(56,41,26,0.65)';
  var ly = Math.min(Math.max(14 * k, y0 + 135 * k), y1 - 14 * k);
  var lx = Math.min(Math.max(-14 * k, x0 + 16 * k), x1 - 16 * k);
  for (gx = Math.ceil(x0 / sp) * sp; gx <= x1; gx += sp) {
    var nx = Math.round(gx / U);
    if (nx !== 0) text(ctx, fmt(nx), gx, ly, lab, 11);
  }
  for (gy = Math.ceil(y0 / sp) * sp; gy <= y1; gy += sp) {
    var ny = -Math.round(gy / U);
    if (ny !== 0) text(ctx, fmt(ny), lx, gy, lab, 11);
  }
  if (y0 < 0 && y1 > 0 && x0 < 0 && x1 > 0) text(ctx, '0', -9 * k, 13 * k, lab, 11);
  if (y0 < 0 && y1 > 0) text(ctx, 'x', x1 - 14 * k, -13 * k, INK, 13);
  if (x0 < 0 && x1 > 0) text(ctx, 'y', 13 * k, y0 + 122 * k, INK, 13);

  ctx.lineCap = 'round';
  var lvz = FLEVELS[F.level], nurFeste = !!(lvz && (lvz.verbinden || lvz.schnitt || lvz.steigung));   // nur die vorgegebenen Punkte zeigen
  F.lines.forEach(function (l, i) {
    if (lvz && lvz.steigung && i !== F.runde) return;   // immer nur die aktuelle Gerade
    var col = l.fest ? INK : fLinieFalsch(l) ? C.RED : BLUE;   // vorgegebene Gerade dunkel, falsche Linie rot
    ctx.strokeStyle = col; extLine(ctx, l.a, l.b, 2.5 * ws * k);
    if (!nurFeste) { ctx.fillStyle = col; dotAt(ctx, l.a, false); dotAt(ctx, l.b, false); }
  });
  if (lvz && lvz.steigung && F.lines[F.runde]) {
    // Steigungsdreieck gestrichelt: d nach rechts (beschriftet), dann nach oben oder unten (zum Zählen)
    var sl = F.lines[F.runde], ecke = [sl.b[0], sl.a[1]], hoch = sl.b[1] < sl.a[1];
    ctx.save(); ctx.strokeStyle = INK; ctx.globalAlpha = 0.75; ctx.lineWidth = 2 * ws * k; ctx.setLineDash([6 * k, 5 * k]);
    ctx.beginPath(); ctx.moveTo(sl.a[0], sl.a[1]); ctx.lineTo(ecke[0], ecke[1]); ctx.lineTo(sl.b[0], sl.b[1]); ctx.stroke(); ctx.restore();
    text(ctx, String(fLauf(sl)), (sl.a[0] + ecke[0]) / 2, ecke[1] + (hoch ? 13 : -13) * k, INK, 14);
  }
  F.pts.forEach(function (p) {
    var col = fPunktFalsch(p) ? C.RED : BLUE;   // falscher Punkt rot
    ctx.fillStyle = col; dotAt(ctx, [p.x * U, -p.y * U], false, 5);
    text(ctx, '(' + fmt(p.x) + '|' + fmt(p.y) + ')', p.x * U + 24 * k, -p.y * U - 13 * k, col, 12);
  });
  // Vorschau
  ctx.fillStyle = BLUE; ctx.strokeStyle = BLUE;
  if (S.ls && !nurFeste) dotAt(ctx, vp(S.ls), true);
  if (S.drawing && S.end) {
    var e = S.target ? vp(S.target) : S.end;
    if (S.tool === 'line' && S.lmode === 'end' && S.ls && Math.hypot(e[0] - S.ls.x, e[1] - S.ls.y) > 1) {
      ctx.globalAlpha = 0.55; extLine(ctx, vp(S.ls), e, 2 * ws * k); ctx.globalAlpha = 1;
    }
    if (!nurFeste) { ctx.fillStyle = BLUE; dotAt(ctx, e, true); if (S.target) mark(ctx, S.target); }
  }
}

// Tabelle bzw. Punkteliste unten rechts über den Werkzeugen (Bildschirmkoordinaten)
function drawTable(ctx) {
  var lv = FLEVELS[F.level];
  if (!lv || isMach(lv) || lv.tabelle === false) return;
  var title, head = null, rows;
  if (lv.eq) {
    title = eqStr(lv.eq); head = ['x', 'y'];
    rows = lv.xs.map(function (x) {
      var y = lv.eq.m * x + lv.eq.b, ok = fHas(x, y);
      return { a: fmt(x), b: ok ? fmt(y) : '?', ok: ok };
    });
  } else {
    title = App.wahl({ de: 'Punkte', en: 'Points', fi: 'Pisteet', tr: 'Noktalar', fr: 'Points', es: 'Puntos', ja: '点', ar: 'النقاط' });
    rows = lv.pts.map(function (p) {
      var ok = fHas(p.x, p.y);
      return { a: p.n + '(' + fmt(p.x) + '|' + fmt(p.y) + ')', b: ok ? '✓' : '', ok: ok, wide: true };
    });
  }
  var rh = 22, bw = lv.eq ? 96 : 124, bh = 34 + (head ? rh : 0) + rows.length * rh + 6;
  var bx = S.w - bw - 12, by = S.h - (S.unten || 70) - bh - 4, y = by + 27;
  ctx.save();
  ctx.fillStyle = 'rgba(245,235,209,0.94)';
  ctx.strokeStyle = 'rgba(56,41,26,0.45)'; ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 10); else ctx.rect(bx, by, bw, bh);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.font = '700 14px ' + C.FONT;
  ctx.fillText(title, bx + bw / 2, by + 16);
  ctx.font = '400 14px ' + C.FONT;
  if (head) {
    ctx.fillStyle = 'rgba(56,41,26,0.6)';
    ctx.fillText(head[0], bx + bw * 0.28, y + 6); ctx.fillText(head[1], bx + bw * 0.72, y + 6);
    y += rh;
  }
  rows.forEach(function (r) {
    ctx.fillStyle = r.ok ? 'rgb(26,140,45)' : INK;
    if (r.wide) {
      ctx.textAlign = 'left'; ctx.fillText(r.a, bx + 12, y + 6);
      ctx.textAlign = 'right'; ctx.fillText(r.b, bx + bw - 12, y + 6);
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(r.a, bx + bw * 0.28, y + 6); ctx.fillText(r.b, bx + bw * 0.72, y + 6);
    }
    y += rh;
  });
  ctx.restore();
}

function fTarget(pos) {
  if (FLEVELS[F.level].verbinden) {
    var g = fSnap(pos);
    return g && F.pts.some(function (p) { return p.fest && p.x * U === g.x && -p.y * U === g.y; }) ? g : null;
  }
  return S.tool === 'point' ? fLattice(pos) : fSnap(pos);
}
function fDown(pos) {
  if (FLEVELS[F.level].schnitt || FLEVELS[F.level].steigung) return true;
  S.drawing = true; S.lmode = S.ls ? 'end' : 'start';
  S.end = [pos[0], pos[1]]; S.target = fTarget(pos);
  S.loupe = S.sp; render();
  return true;
}
function fMove(pos) {
  if (FLEVELS[F.level].schnitt || FLEVELS[F.level].steigung) return true;
  if (S.drawing) { S.end = [pos[0], pos[1]]; S.target = fTarget(pos); }
  S.loupe = S.sp; render();
  return true;
}
function fUp(pos) {
  if (S.drawing) {
    var b = S.target ? vp(S.target) : S.end;
    if (S.tool === 'point') {
      var px = Math.round(b[0] / U), py = -Math.round(b[1] / U);
      // Falsche Punkte verschwinden beim nächsten Tippen von selbst. Liegt schon alles Richtige
      // oder wurde der falsche Punkt selbst angetippt, wird nur gelöscht.
      var weg = F.pts.filter(fPunktFalsch), lvp = FLEVELS[F.level];
      if (weg.length) {
        F.pts = F.pts.filter(function (p) { return !fPunktFalsch(p); });
        var nur = weg.some(function (p) { return p.x === px && p.y === py; }) ||
          lvp.pts.every(function (q) { return fHas(q.x, q.y); });
        if (nur) { px = null; }
      }
      if (px === null) {
        // nichts weiter
      } else if (fHas(px, py)) {
        F.pts = F.pts.filter(function (p) { return p.fest || p.x !== px || p.y !== py; });
      } else {
        F.gid += 1; F.pts.push({ x: px, y: py, gid: F.gid });
        var lv = FLEVELS[F.level];
        if (lv.eq && !F.lines.length && fNeed(lv).every(function (r) { return fHas(r[0], r[1]); })) App.setTool('line');
      }
    } else if (S.lmode === 'start') {
      // rote Linie verschwindet beim nächsten Versuch
      if (F.lines.some(fLinieFalsch)) F.lines = F.lines.filter(function (l) { return !fLinieFalsch(l); });
      S.ls = V(b);
    } else if (S.ls && Math.hypot(b[0] - S.ls.x, b[1] - S.ls.y) > 12 * S.k) {
      F.gid += 1;
      if (FLEVELS[F.level].verbinden) F.lines = [];
      F.lines.push({ a: vp(S.ls), b: b, gid: F.gid });
      S.ls = null;
    }
    S.drawing = false; S.lmode = null; S.target = null;
  }
  S.loupe = null; render();
  return true;
}
function fLineOk(l, q) {
  var dx = l.b[0] - l.a[0], dy = l.b[1] - l.a[1], n = Math.hypot(dx, dy);
  if (n < 4) return false;
  return [-2, 3].every(function (x) {
    var px = x * U, py = -(q.m * x + q.b) * U;
    return Math.abs((px - l.a[0]) * dy - (py - l.a[1]) * dx) / n <= 0.15 * U;
  });
}
// Punkt, der in einem Level mit vorgegebenen Punkten (A, B, ...) keiner von ihnen ist
function fPunktFalsch(p) {
  var lv = FLEVELS[F.level];
  return !!(lv && lv.pts && !p.fest) && !lv.pts.some(function (q) { return q.x === p.x && q.y === p.y; });
}
function fLinieFalsch(l) {
  var lv = FLEVELS[F.level], q = lv && lv.verbinden ? fRegel() : null;
  return !!q && !fLineOk(l, q);
}
var RICHTUNG = {
  de: [' nach rechts', ' nach links', ' nach oben', ' nach unten'], en: [' to the right', ' to the left', ' up', ' down'],
  fi: [' oikealle', ' vasemmalle', ' ylös', ' alas'], tr: [' sağa', ' sola', ' yukarı', ' aşağı'],
  fr: [' vers la droite', ' vers la gauche', ' vers le haut', ' vers le bas'], es: [' a la derecha', ' a la izquierda', ' hacia arriba', ' hacia abajo'],
  ja: ['右へ', '左へ', '上へ', '下へ'], ar: [' إلى اليمين', ' إلى اليسار', ' إلى الأعلى', ' إلى الأسفل']
};
// Hinweis zu einem falschen Punkt: welcher Punkt gemeint war und wie man ihn findet
function punktHinweis(p) {
  var lv = FLEVELS[F.level];
  var ziel = lv.pts.filter(function (q) { return !fHas(q.x, q.y); })[0];
  function paar(x, y) { return '<bdi dir="ltr">(' + fmt(x) + '|' + fmt(y) + ')</bdi>'; }
  if (!ziel) {
    // alle richtigen Punkte liegen schon: nur sagen, dass der falsche beim nächsten Tippen verschwindet
    var R = paar(p.x, p.y);
    return { de: 'Der Punkt ' + R + ' gehört nicht dazu. Tippe irgendwo hin, dann verschwindet er.',
             en: 'The point ' + R + ' does not belong here. Tap anywhere to remove it.',
             fi: 'Piste ' + R + ' ei kuulu tähän. Napauta mihin tahansa, niin se häviää.',
             tr: R + ' noktası buraya ait değil. Herhangi bir yere dokun, kaybolur.',
             fr: 'Le point ' + R + ' n’a rien à faire ici. Touche n’importe où pour l’enlever.',
             es: 'El punto ' + R + ' no va aquí. Toca en cualquier sitio para quitarlo.',
             ja: '点 ' + R + ' はいりません。どこかをタップすると消えます。',
             ar: 'النقطة ' + R + ' لا تنتمي إلى هنا. انقر في أي مكان لتختفي.' };
  }
  var P = paar(p.x, p.y), Z = ziel.n + ' ' , Q = paar(ziel.x, ziel.y);
  function weg(l) {
    var r = RICHTUNG[l], t = [];
    function teil(n, i) { return l === 'ja' ? r[i] + n : n + r[i]; }
    if (ziel.x) t.push(teil(Math.abs(ziel.x), ziel.x > 0 ? 0 : 1));
    if (ziel.y) t.push(teil(Math.abs(ziel.y), ziel.y > 0 ? 2 : 3));
    return t;
  }
  var h = {}, W = {
    de: function (t) { return 'Das ist ' + P + '. ' + Z + 'ist ' + Q + ': erst ' + t.join(', dann ') + '.'; },
    en: function (t) { return 'This is ' + P + '. ' + Z + 'is ' + Q + ': first ' + t.join(', then ') + '.'; },
    fi: function (t) { return 'Tämä on ' + P + '. ' + Z + 'on ' + Q + ': ensin ' + t.join(', sitten ') + '.'; },
    tr: function (t) { return 'Bu ' + P + '. ' + Z + 'noktası ' + Q + ': önce ' + t.join(', sonra ') + '.'; },
    fr: function (t) { return 'Ici, c’est ' + P + '. ' + Z + 'est ' + Q + ' : d’abord ' + t.join(', puis ') + '.'; },
    es: function (t) { return 'Esto es ' + P + '. ' + Z + 'es ' + Q + ': primero ' + t.join(', luego ') + '.'; },
    ja: function (t) { return 'これは ' + P + ' です。' + Z + 'は ' + Q + '：まず' + t.join('、次に') + '。'; },
    ar: function (t) { return 'هذه ' + P + '. النقطة ' + Z + 'هي ' + Q + ': أولًا ' + t.join('، ثم ') + '.'; }
  };
  Object.keys(W).forEach(function (l) { h[l] = W[l](weg(l)); });
  return h;
}
var LINIE_FALSCH = { de: 'Die Linie muss durch beide Punkte gehen.', en: 'The line must go through both points.',
  fi: 'Suoran täytyy kulkea molempien pisteiden kautta.', tr: 'Doğru iki noktadan da geçmeli.',
  fr: 'La droite doit passer par les deux points.', es: 'La recta tiene que pasar por los dos puntos.',
  ja: '直線は2つの点を両方通らないといけません。', ar: 'يجب أن يمر المستقيم بالنقطتين.' };
function fCheck() {
  var lv = FLEVELS[F.level];
  if (isMach(lv)) return;
  var ok;
  if (lv.verbinden) {
    var q = fRegel(), linie = !!q && F.lines.some(function (l) { return fLineOk(l, q); });
    ok = linie;
    fSchreib(false, F.lines.length && !linie ? LINIE_FALSCH : null);
  } else if (lv.schnitt || lv.steigung) {
    ok = F.fn;
    fSchreib(!F.fn);
  } else {
    ok = fNeed(lv).every(function (r) { return fHas(r[0], r[1]); });
    if (lv.pts) {
      // Gelöst erst, wenn kein falscher Punkt mehr liegt; zum neuesten falschen Punkt ein Hinweis
      var falsch = F.pts.filter(fPunktFalsch);
      if (falsch.length) ok = false;
      var neu = falsch.reduce(function (t, p) { return !t || p.gid > t.gid ? p : t; }, null);
      fSchreib(false, neu ? punktHinweis(neu) : null);
    }
    if (ok && lv.eq) ok = F.lines.some(function (l) { return fLineOk(l, lv.eq); });
  }
  if (ok !== S.done) {
    S.done = ok;
    if (ok) {
      F.solved.add(F.level);
      F.solutions[F.level] = fnow();
      delete F.work[F.level];
      fSave();
    }
    if (S.onLevel) S.onLevel(F.level, ok);
  }
}
function fLoadLevel(n, restore) {
  F.level = n; F.pts = []; F.lines = []; F.gid = 0; F.fn = false; F.ein = ['', '', '', '']; F.slot = 0; F.fb = ''; F.fbOk = false; F.runde = 0;
  fSchreib(false);
  App.setTool('point');
  S.done = false;
  if (isMach(FLEVELS[n])) {
    S.vs = 1; S.vth = 0; S.ox = S.w / 2; S.oy = S.h * 0.48;
    machShow(n);
    App.applyView();
    if (S.onLevel) S.onLevel(n, false);
    return;
  }
  machShow(null);
  S.vs = 1; S.vth = 0; S.ox = S.w / 2; S.oy = S.h * 0.48;
  if (restore !== false) {
    var sn = F.solutions[n] || F.work[n];
    if (sn) {
      var c = fcopy(sn);
      F.pts = c.pts; F.lines = c.lines; F.fn = c.fn; F.runde = c.runde;
      F.gid = Math.max.apply(null, [0].concat(F.pts.map(function (p) { return p.gid; }), F.lines.map(function (l) { return l.gid; })));
    }
  }
  var lv = FLEVELS[n];
  if (lv.verbinden) {
    if (!F.pts.some(function (p) { return p.fest; })) F.pts = fFestPunkte();
  }
  if (lv.schnitt) {
    if (!F.lines.some(function (l) { return l.fest; })) F.lines = [fFestLinie()];
    // y = 0 knapp über der Eingabekarte, damit die Schnittpunkte frei bleiben
    S.oy = S.h - (S.unten || 70) - 300;
  }
  if (lv.steigung) {
    if (!F.lines.some(function (l) { return l.fest; })) { F.lines = fFestSteigung(); F.runde = 0; }
    F.ein = [''];
  }
  // Nur die Knöpfe unten, die das Level braucht
  var wz = lv.werkzeuge || ['point', 'line', 'undo', 'clear', 'view'];
  [['b-point', 'point'], ['b-line', 'line'], ['b-undo', 'undo'], ['b-clear', 'clear'], ['b-view', 'view']].forEach(function (b) {
    document.getElementById(b[0]).hidden = wz.indexOf(b[1]) < 0;
  });
  App.setTool(lv.werkzeug || 'point');   // das Werkzeug ist aktiv, auch wenn sein Knopf fehlt
  App.applyView();
  if (S.onLevel) S.onLevel(n, false);
  fCheck();
  if (lv.steigung) steigAnsicht();
}
function fStore() { if (!isMach(FLEVELS[F.level]) && !F.solved.has(F.level)) F.work[F.level] = fnow(); }
function fUndo() {
  if (S.ls) { S.ls = null; render(); return; }
  var g = F.pts.map(function (p) { return p.gid; }).concat(F.lines.map(function (l) { return l.gid; }));
  if (!g.length) return;
  var last = Math.max.apply(null, g);
  if (!last) return;   // vorgegebene Punkte bleiben
  F.pts = F.pts.filter(function (p) { return p.gid !== last; });
  F.lines = F.lines.filter(function (l) { return l.gid !== last; });
  render(); fCheck();
}
// Papierkorb: Level von vorn, wieder ungelöst (auch bei den Maschinen-Leveln)
function fClear() {
  delete F.solutions[F.level]; delete F.work[F.level]; F.solved.delete(F.level);
  fLoadLevel(F.level, false); fSave();
}
// d = 1 nächstes, d = -1 vorheriges Level
function fNext(d) { var n = FLEVELS.length; fStore(); fLoadLevel((F.level + (d || 1) + n) % n); fSave(); }
function fSave() { App.speichern(FKEY, FLEVELS, F, F.level); }
function fLoad() {
  var n = App.laden(FKEY, OLD_FKEY, FLEVELS, F);
  if (n !== null) F.level = n;
}

// Karte unten: Hinweise im Gitter, und im Level mit schnitt die Eingabe der zwei Schnittpunkte
var PRUEFEN = { de: 'Prüfen', en: 'Check', fi: 'Tarkista', tr: 'Kontrol et', fr: 'Vérifier', es: 'Comprobar', ja: 'たしかめる', ar: 'تحقق' };
var ALLE = { de: 'Fülle alle Kästchen aus.', en: 'Fill in all the boxes.', fi: 'Täytä kaikki laatikot.', tr: 'Bütün kutuları doldur.',
             fr: 'Remplis toutes les cases.', es: 'Rellena todas las casillas.', ja: 'ぜんぶの□をうめよう。', ar: 'املأ كل المربعات.' };
var ACHSE = {
  de: ['x-Achse', 'y-Achse'], en: ['x-axis', 'y-axis'], fi: ['x-akseli', 'y-akseli'], tr: ['x ekseni', 'y ekseni'],
  fr: ['axe des x', 'axe des y'], es: ['eje x', 'eje y'], ja: ['x 軸', 'y 軸'], ar: ['محور x', 'محور y']
};
var SCHAU = [
  { de: 'Nicht ganz. Schau genau, wo die Gerade die x-Achse kreuzt.', en: 'Not quite. Look closely where the line crosses the x-axis.',
    fi: 'Ei aivan. Katso tarkasti, missä suora leikkaa x-akselin.', tr: 'Tam değil. Doğrunun x eksenini nerede kestiğine dikkatle bak.',
    fr: 'Pas tout à fait. Regarde bien où la droite coupe l’axe des x.', es: 'Casi. Mira bien dónde corta la recta el eje x.',
    ja: 'おしい。直線が x 軸と交わるところをよく見よう。', ar: 'ليس تمامًا. انظر جيدًا أين يقطع المستقيم محور x.' },
  { de: 'Nicht ganz. Schau genau, wo die Gerade die y-Achse kreuzt.', en: 'Not quite. Look closely where the line crosses the y-axis.',
    fi: 'Ei aivan. Katso tarkasti, missä suora leikkaa y-akselin.', tr: 'Tam değil. Doğrunun y eksenini nerede kestiğine dikkatle bak.',
    fr: 'Pas tout à fait. Regarde bien où la droite coupe l’axe des y.', es: 'Casi. Mira bien dónde corta la recta el eje y.',
    ja: 'おしい。直線が y 軸と交わるところをよく見よう。', ar: 'ليس تمامًا. انظر جيدًا أين يقطع المستقيم محور y.' }
];
var NULL_AUF = [
  { de: 'Auf der x-Achse ist y immer 0.', en: 'On the x-axis, y is always 0.', fi: 'x-akselilla y on aina 0.', tr: 'x ekseninde y her zaman 0’dır.',
    fr: 'Sur l’axe des x, y vaut toujours 0.', es: 'En el eje x, y siempre vale 0.', ja: 'x 軸の上では、y はいつも 0 です。', ar: 'على محور x تكون y دائمًا 0.' },
  { de: 'Auf der y-Achse ist x immer 0.', en: 'On the y-axis, x is always 0.', fi: 'y-akselilla x on aina 0.', tr: 'y ekseninde x her zaman 0’dır.',
    fr: 'Sur l’axe des y, x vaut toujours 0.', es: 'En el eje y, x siempre vale 0.', ja: 'y 軸の上では、x はいつも 0 です。', ar: 'على محور y تكون x دائمًا 0.' }
];
var schreib = null;
function fSchreib(zeigen, hinweis) {
  if (!schreib) return;
  schreib.hidden = !zeigen && !hinweis;
  schreib.classList.toggle('hinweis', !zeigen && !!hinweis);
  if (!zeigen) { schreib.innerHTML = hinweis ? '<p class="fb">' + App.wahl(hinweis) + '</p>' : ''; return; }
  if (FLEVELS[F.level].steigung) return steigKarte();
  // vier Kästchen: beide Schnittpunkte ganz eintippen, auch die 0; Tasten von −4 bis 4, Minuszahlen direkt
  function slot(k) { return '<button class="slot' + (F.slot === k ? ' sel' : '') + '" data-act="slot" data-i="' + k + '">' + F.ein[k] + '</button>'; }
  var keys = '', t = App.wahl(ACHSE);
  for (var d = -4; d <= 4; d++) keys += '<button class="key" data-act="ziffer" data-n="' + d + '">' + fmt(d) + '</button>';
  schreib.innerHTML =
    '<div class="schnitt"><p><span>' + t[0] + '</span><bdi dir="ltr">(' + slot(0) + '|' + slot(1) + ')</bdi></p>' +
    '<p><span>' + t[1] + '</span><bdi dir="ltr">(' + slot(2) + '|' + slot(3) + ')</bdi></p></div>' +
    '<div class="keys reihe neun">' + keys + '</div>' +
    '<button class="opt pruefen" data-act="pruefen">' + App.wahl(PRUEFEN) + '</button>' +
    (F.fb ? '<p class="fb">' + App.wahl(F.fb) + '</p>' : '');
}
function slotHTML(k) { return '<button class="slot' + (F.slot === k ? ' sel' : '') + '" data-act="slot" data-i="' + k + '">' + F.ein[k] + '</button>'; }
var STEIG = { de: 'Steigung', en: 'Slope', fi: 'Kulmakerroin', tr: 'Eğim', fr: 'Pente', es: 'Pendiente', ja: '傾き', ar: 'الميل' };
// ein Kästchen für die Steigung der aktuellen Geraden, Tasten von −3 bis 3, oben der Stand 1 / 5
function steigKarte() {
  var keys = '';
  for (var d = -3; d <= 3; d++) keys += '<button class="key" data-act="ziffer" data-n="' + d + '">' + fmt(d) + '</button>';
  schreib.innerHTML = '<div class="steig"><span>' + App.wahl(STEIG) + '</span>' + slotHTML(0) +
    '<span class="stand">' + (F.runde + 1) + ' / ' + F.lines.length + '</span></div>' +
    '<div class="keys reihe sieben">' + keys + '</div>' +
    '<button class="opt pruefen" data-act="pruefen">' + App.wahl(PRUEFEN) + '</button>' +
    (F.fb ? '<p class="fb' + (F.fbOk ? ' ok' : '') + '">' + App.wahl(F.fb) + '</p>' : '');
}
var STEIG_FB = {
  weiter: { de: 'Richtig! Jetzt die nächste Gerade.', en: 'Right! Now the next line.', fi: 'Oikein! Nyt seuraava suora.', tr: 'Doğru! Şimdi sıradaki doğru.',
            fr: 'Bravo ! Maintenant la droite suivante.', es: '¡Correcto! Ahora la siguiente recta.', ja: '正解！次の直線へ。', ar: 'صحيح! الآن المستقيم التالي.' },
  neg: { de: 'Nicht ganz. Die Gerade geht nach rechts unten, also ist die Steigung negativ.', en: 'Not quite. The line goes down to the right, so the slope is negative.',
         fi: 'Ei aivan. Suora laskee oikealle, joten kulmakerroin on negatiivinen.', tr: 'Tam değil. Doğru sağa doğru iniyor, yani eğim negatif.',
         fr: 'Pas tout à fait. La droite descend vers la droite, donc la pente est négative.', es: 'Casi. La recta baja hacia la derecha, así que la pendiente es negativa.',
         ja: 'おしい。直線は右下がりなので、傾きはマイナスです。', ar: 'ليس تمامًا. المستقيم ينزل نحو اليمين، إذن الميل سالب.' },
  pos: { de: 'Nicht ganz. Die Gerade geht nach rechts oben, also ist die Steigung positiv.', en: 'Not quite. The line goes up to the right, so the slope is positive.',
         fi: 'Ei aivan. Suora nousee oikealle, joten kulmakerroin on positiivinen.', tr: 'Tam değil. Doğru sağa doğru çıkıyor, yani eğim pozitif.',
         fr: 'Pas tout à fait. La droite monte vers la droite, donc la pente est positive.', es: 'Casi. La recta sube hacia la derecha, así que la pendiente es positiva.',
         ja: 'おしい。直線は右上がりなので、傾きはプラスです。', ar: 'ليس تمامًا. المستقيم يصعد نحو اليمين، إذن الميل موجب.' },
  eins: { de: 'Nicht ganz. Zähle: 1 Kästchen nach rechts, wie viele Kästchen nach oben oder unten?', en: 'Not quite. Count: 1 square to the right, how many squares up or down?',
          fi: 'Ei aivan. Laske: 1 ruutu oikealle, montako ruutua ylös tai alas?', tr: 'Tam değil. Say: sağa 1 kare, yukarı ya da aşağı kaç kare?',
          fr: 'Pas tout à fait. Compte : 1 carreau vers la droite, combien vers le haut ou le bas ?', es: 'Casi. Cuenta: 1 cuadrito a la derecha, ¿cuántos hacia arriba o abajo?',
          ja: 'おしい。数えよう：右へ1ます、上か下へ何ます？', ar: 'ليس تمامًا. عُدّ: مربع واحد إلى اليمين، كم مربعًا إلى الأعلى أو الأسفل؟' }
};
function teilenFB(d) {
  return { de: 'Nicht ganz. Das Dreieck geht ' + d + ' Kästchen nach rechts. Zähle die Kästchen nach oben oder unten und teile durch ' + d + '.',
           en: 'Not quite. The triangle goes ' + d + ' squares to the right. Count the squares up or down and divide by ' + d + '.',
           fi: 'Ei aivan. Kolmio menee ' + d + ' ruutua oikealle. Laske ruudut ylös tai alas ja jaa luvulla ' + d + '.',
           tr: 'Tam değil. Üçgen sağa ' + d + ' kare gidiyor. Yukarı ya da aşağı kareleri say ve ' + d + ' ile böl.',
           fr: 'Pas tout à fait. Le triangle va de ' + d + ' carreaux vers la droite. Compte les carreaux vers le haut ou le bas et divise par ' + d + '.',
           es: 'Casi. El triángulo va ' + d + ' cuadritos a la derecha. Cuenta los cuadritos hacia arriba o abajo y divide entre ' + d + '.',
           ja: 'おしい。三角形は右へ ' + d + ' ます。上か下へのます数を数えて、' + d + ' でわろう。',
           ar: 'ليس تمامًا. المثلث يذهب ' + d + ' مربعات إلى اليمين. عُدّ المربعات إلى الأعلى أو الأسفل واقسم على ' + d + '.' };
}
function steigPruefen() {
  var l = F.lines[F.runde], m = fSteig(l), w = Number(F.ein[0].replace('−', '-'));
  F.fbOk = false;
  if (F.ein[0] === '') { F.fb = ALLE; return; }
  if (w === m) {
    if (F.runde < F.lines.length - 1) { F.runde++; F.ein = ['']; F.fb = STEIG_FB.weiter; F.fbOk = true; F.neueAnsicht = true; }
    else { F.fn = true; F.fb = ''; }
    return;
  }
  F.fb = m < 0 && w >= 0 ? STEIG_FB.neg : m > 0 && w <= 0 ? STEIG_FB.pos : fLauf(l) > 1 ? teilenFB(fLauf(l)) : STEIG_FB.eins;
}
function schreibClick(e) {
  var b = e.target.closest ? e.target.closest('button') : null;
  if (!b) return;
  var act = b.getAttribute('data-act');
  if (act === 'slot') F.slot = Number(b.getAttribute('data-i'));
  else if (act === 'ziffer') { F.ein[F.slot] = fmt(Number(b.getAttribute('data-n'))); F.slot = Math.min(F.ein.length - 1, F.slot + 1); F.fb = ''; F.fbOk = false; }
  else if (act === 'pruefen' && FLEVELS[F.level].steigung) steigPruefen();
  else if (act === 'pruefen') {
    var z = fSchnitt(), w = F.ein.map(function (s) { return Number(s.replace('−', '-')); });
    if (F.ein.some(function (s) { return s === ''; })) F.fb = ALLE;
    else if (w[1] !== 0) F.fb = NULL_AUF[0];
    else if (w[0] !== z.x) F.fb = SCHAU[0];
    else if (w[2] !== 0) F.fb = NULL_AUF[1];
    else if (w[3] !== z.y) F.fb = SCHAU[1];
    else { F.fn = true; F.fb = ''; }
  } else return;
  fCheck();
  if (F.neueAnsicht) { F.neueAnsicht = false; steigAnsicht(); }
  render();
}

/* ===================== Maschinen-Level (Funktionsbegriff entdecken) ===================== */
var ARROW = '<svg class="arr" viewBox="0 0 28 12" aria-hidden="true"><path d="M1 6H26M21 1.5L26 6L21 10.5"/></svg>';
function rnd(n) { return Math.floor(Math.random() * n); }
function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
// Richtige Antwort und drei falsche (bevorzugt aus cands), gemischt
function options(correct, cands) {
  var set = [correct];
  shuffle(cands.slice()).forEach(function (c) { if (c >= 0 && set.indexOf(c) < 0 && set.length < 4) set.push(c); });
  for (var j = 1; set.length < 4; j++) {
    [correct + j, correct - j].forEach(function (c) { if (c >= 0 && set.indexOf(c) < 0 && set.length < 4) set.push(c); });
  }
  return shuffle(set);
}
function keypad(act, sel) {
  var s = '';
  for (var d = 0; d < 10; d++) {
    s += '<button class="key' + (sel === d ? ' sel' : '') + '" data-act="' + act + '" data-n="' + d + '"' + (M.done ? ' disabled' : '') + '>' + d + '</button>';
  }
  return '<div class="keys">' + s + '</div>';
}
function optButtons(vals, suffix, three) {
  return '<div class="opts' + (three ? ' three' : '') + '">' + vals.map(function (v) {
    return '<button class="opt" data-act="ans" data-v="' + v + '"' + (M.done ? ' disabled' : '') + '>' + v + (suffix || '') + '</button>';
  }).join('') + '</div>';
}
// Rückmeldung: M.fb ist ein Text oder { de, en }, damit sie beim Sprachwechsel mitwechselt
function fbHTML() { return '<p class="fb' + (M.done ? ' ok' : '') + '" aria-live="polite">' + (App.wahl(M.fb) || '') + '</p>'; }
function f(r, x) { return r.m * x + r.b; }

function machStart(n) {
  M = { done: false, fb: '', wrong: 0, run: false };
  FLEVELS[n].start(M);
  machRender();
}
function finish() {
  M.done = true;
  F.solved.add(F.level); fSave();
  S.done = true;
  S.onLevel(F.level, true);
}
function machRender() { mach.innerHTML = FLEVELS[F.level].html(M) + fbHTML(); }
function machShow(n) {
  var isM = n !== null;
  mach.hidden = !isM;
  ['b-point', 'b-line', 'b-undo', 'b-view'].forEach(function (id) { document.getElementById(id).hidden = isM; });
  if (isM) document.getElementById('b-clear').hidden = false;
  if (isM) { machStart(n); mach.scrollTop = 0; }
}
function machClick(e) {
  var b = e.target.closest ? e.target.closest('button') : null;
  if (!b || !M || M.done || !isMach(FLEVELS[F.level])) return;
  FLEVELS[F.level].click(M, b.getAttribute('data-act'), {
    n: Number(b.getAttribute('data-n')), v: Number(b.getAttribute('data-v')), i: Number(b.getAttribute('data-i'))
  });
  machRender();
}

App.funk = {
  ARROW: ARROW, rnd: rnd, shuffle: shuffle, options: options, keypad: keypad, optButtons: optButtons,
  f: f, finish: finish, M: function () { return M; }
};

/* ---------- Einstiegs-Level: eine Maschine mit sichtbarer oder geheimer Regel ----------
   App.funk.einstieg(c) baut start/html/click aus Bausteinen. c: id, text, regel() -> {m, b},
   namen (null = noch keine, 'zufall' = zufälliges Paar, auch y rein und x raus, oder [rein, raus]),
   vorgabe (so viele zufällige Paare stehen schon da, keine Tasten), geheim (Regel versteckt), einsetzen (in der Box steht nach dem Füttern die Zahl statt des Namens), fn (Funktion als Zeile), liste, tabelle, achsen, koord,
   frage ('wert' | 'punkt' | 'funktion'). Farben: Orange = rein, Lila = raus. */
var PAARE = [['a', 'b'], ['x', 'y'], ['n', 'm'], ['t', 's']];

// Variablen-Name in seiner Farbe; ohne Namen ein Kästchen als Platzhalter, auf Wunsch mit der Zahl darin
function vn(name, art, wert) {
  return name ? '<bdi class="vn ' + art + '">' + name + '</bdi>'
    : '<span class="feld ' + art + '">' + (wert === undefined || wert === null ? '' : wert) + '</span>';
}
function gleich(name, art, wert) { return '<bdi>' + (name ? vn(name, art) + ' = ' : '') + wert + '</bdi>'; }
// Regel mit dem Namen der Eingabe, z. B. 2·a + 1 (bei m = 1 nur a + 1, bei b = 0 nur 2·a)
function regelMit(r, teil) { return '<bdi>' + (r.m === 1 ? '' : r.m + '·') + teil + (r.b ? ' + ' + r.b : '') + '</bdi>'; }
function regelHTML(r, name, wert) { return regelMit(r, vn(name, 'rein', wert));
}
function funktionHTML(r, names) { return '<bdi>' + vn(names[1], 'raus') + ' = ' + regelHTML(r, names[0]) + '</bdi>'; }
function hatX(M, x) { return M.fed.some(function (p) { return p.x === x; }); }

// Tabelle quer: oben die Eingaben, unten die Ausgaben, nach Eingabe sortiert
// voll: alle Eingaben 0 bis 9 stehen schon da (blass), die Ausgaben füllen sich beim Füttern; die gefragte bekommt ein ?
function tabelleHTML(M, voll) {
  if (voll) {
    var o1 = '<tr><th>' + vn(M.names[0], 'rein') + '</th>', u1 = '<tr><th>' + vn(M.names[1], 'raus') + '</th>';
    for (var x = 0; x < 10; x++) {
      var p = M.fed.filter(function (q) { return q.x === x; })[0], cls = [];
      if (!p) cls.push('leer');
      if (M.last && M.last.x === x) cls.push('neu');
      if (M.q === x) cls.push('frage');
      var k = cls.length ? ' class="' + cls.join(' ') + '"' : '';
      o1 += '<td' + k + '>' + x + '</td>';
      u1 += '<td' + k + '>' + (p ? p.y : M.q === x ? '?' : '') + '</td>';
    }
    return '<table class="vtab voll">' + o1 + '</tr>' + u1 + '</tr></table>';
  }
  var reihe = M.fed.slice().sort(function (a, b) { return a.x - b.x; });
  var oben = '<tr><th>' + vn(M.names[0], 'rein') + '</th>', unten = '<tr><th>' + vn(M.names[1], 'raus') + '</th>';
  reihe.forEach(function (p) {
    var neu = M.last && p.x === M.last.x ? ' class="neu"' : '';
    oben += '<td' + neu + '>' + p.x + '</td>';
    unten += '<td' + neu + '>' + p.y + '</td>';
  });
  return '<table class="vtab">' + oben + '</tr>' + unten + '</tr></table>';
}

// Zwei parallele Zahlenachsen: oben die Eingabe, unten die Ausgabe, jede Fütterung als Verbindung
function achsenHTML(M) {
  var W = 340, L = 34, R = 12, y1 = 20, y2 = 72, max = M.max, i;
  function px(v) { return L + v * (W - L - R) / max; }
  var s = '<svg class="achsen" viewBox="0 0 ' + W + ' 98" aria-hidden="true">';
  s += '<text class="an rein" x="8" y="' + (y1 + 6) + '">' + M.names[0] + '</text>';
  s += '<text class="an raus" x="8" y="' + (y2 + 6) + '">' + M.names[1] + '</text>';
  s += '<line class="ax" x1="' + L + '" y1="' + y1 + '" x2="' + (W - R) + '" y2="' + y1 + '"/>';
  s += '<line class="ax" x1="' + L + '" y1="' + y2 + '" x2="' + (W - R) + '" y2="' + y2 + '"/>';
  for (i = 0; i <= max; i++) {
    var lang = i % 5 === 0, h = lang ? 5 : 3;
    s += '<line class="tk" x1="' + px(i) + '" y1="' + (y1 - h) + '" x2="' + px(i) + '" y2="' + (y1 + h) + '"/>';
    s += '<line class="tk" x1="' + px(i) + '" y1="' + (y2 - h) + '" x2="' + px(i) + '" y2="' + (y2 + h) + '"/>';
    if (lang) {
      s += '<text class="zl" x="' + px(i) + '" y="' + (y1 - 10) + '">' + i + '</text>';
      s += '<text class="zl" x="' + px(i) + '" y="' + (y2 + 19) + '">' + i + '</text>';
    }
  }
  M.fed.forEach(function (p) {
    var neu = !M.last || p.x === M.last.x;   // ohne Fütterung (vorgegebene Paare) alle gleich deutlich
    s += '<line class="vb' + (neu ? ' neu' : '') + '" x1="' + px(p.x) + '" y1="' + y1 + '" x2="' + px(p.y) + '" y2="' + y2 + '"/>';
    s += '<circle class="pr" cx="' + px(p.x) + '" cy="' + y1 + '" r="4.5"/>';
    s += '<circle class="pa" cx="' + px(p.y) + '" cy="' + y2 + '" r="4.5"/>';
  });
  return s + '</svg>';
}

// Koordinatensystem: Eingabe nach rechts, Ausgabe nach oben. Jede Fütterung wird ein Punkt,
// beim neuesten zeigen gestrichelte Linien den Weg: erst nach rechts, dann nach oben.
function koordHTML(M) {
  var W = 340, H = 181, L = 30, R = 24, T = 28, B = 24, xmax = 10, ymax = M.max, i;
  function px(v) { return L + v * (W - L - R) / xmax; }
  function py(v) { return H - B - v * (H - B - T) / ymax; }
  var s = '<svg class="koord" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">';
  for (i = 1; i <= xmax; i++) s += '<line class="gl" x1="' + px(i) + '" y1="' + py(0) + '" x2="' + px(i) + '" y2="' + py(ymax) + '"/>';
  for (i = 5; i <= ymax; i += 5) s += '<line class="gl" x1="' + px(0) + '" y1="' + py(i) + '" x2="' + px(xmax) + '" y2="' + py(i) + '"/>';
  s += '<line class="ax" x1="' + px(0) + '" y1="' + py(0) + '" x2="' + px(xmax) + '" y2="' + py(0) + '"/>';
  s += '<line class="ax" x1="' + px(0) + '" y1="' + py(0) + '" x2="' + px(0) + '" y2="' + py(ymax) + '"/>';
  for (i = 0; i < xmax; i++) s += '<text class="zl" x="' + px(i) + '" y="' + (py(0) + 16) + '">' + i + '</text>';
  for (i = 5; i <= ymax; i += 5) s += '<text class="zl ry" x="' + (px(0) - 6) + '" y="' + (py(i) + 4) + '">' + i + '</text>';
  s += '<text class="an rein" x="' + (px(xmax) + 6) + '" y="' + (py(0) + 6) + '">' + M.names[0] + '</text>';
  s += '<text class="an raus mitte" x="' + px(0) + '" y="' + (py(ymax) - 9) + '">' + M.names[1] + '</text>';
  M.fed.forEach(function (p) {
    if (M.last && p.x === M.last.x) {
      s += '<line class="weg rein" x1="' + px(p.x) + '" y1="' + py(0) + '" x2="' + px(p.x) + '" y2="' + py(p.y) + '"/>';
      s += '<line class="weg raus" x1="' + px(0) + '" y1="' + py(p.y) + '" x2="' + px(p.x) + '" y2="' + py(p.y) + '"/>';
      s += '<circle class="pr" cx="' + px(p.x) + '" cy="' + py(0) + '" r="4"/><circle class="pa" cx="' + px(0) + '" cy="' + py(p.y) + '" r="4"/>';
    }
  });
  M.fed.forEach(function (p) {
    s += '<circle class="pt' + (!M.last || p.x === M.last.x ? ' neu' : '') + '" cx="' + px(p.x) + '" cy="' + py(p.y) + '" r="4.5"/>';
    // Vorgegebene Punkte: das Zahlenpaar steht über dem Punkt, x in Orange, y in Lila
    if (!M.last) s += '<text class="pl" x="' + px(p.x) + '" y="' + (py(p.y) - 9) + '">(<tspan class="rein">' + p.x + '</tspan>|<tspan class="raus">' + p.y + '</tspan>)</text>';
  });
  return s + '</svg>';
}

function frageStellen(M, c) {
  var frei = [], x;
  for (x = 0; x < 10; x++) if (!hatX(M, x)) frei.push(x);
  M.q = frei[rnd(frei.length)];
  M.ans = f(M.r, M.q);
  var q = M.q, a = M.ans, r = M.r;
  if (c.frage === 'punkt') {
    var pk = [[a, q], [q, a + 1], [q + 1, a], [q, a - 1], [q - 1, a]].filter(function (p, k, all) {
      return p[0] >= 0 && p[1] >= 0 && !(p[0] === q && p[1] === a) &&
        all.findIndex(function (o) { return o[0] === p[0] && o[1] === p[1]; }) === k;
    });
    M.popts = shuffle([[q, a]].concat(shuffle(pk).slice(0, 3)));
  } else if (c.frage === 'funktion') {
    var fk = [{ m: r.m, b: r.b + 1 }, { m: r.m, b: r.b - 1 }, { m: r.m + 1, b: r.b }, { m: r.m - 1, b: r.b + r.m }, { m: r.b, b: r.m }]
      .filter(function (o, k, all) {
        return o.m >= 1 && o.b >= 0 && !(o.m === r.m && o.b === r.b) &&
          all.findIndex(function (p) { return p.m === o.m && p.b === o.b; }) === k;
      });
    M.fopts = shuffle([r].concat(shuffle(fk).slice(0, 3)));
    M.q = null;   // gefragt ist die Funktion, keine einzelne Zahl
  } else if (c.frage === 'schreiben') {
    // Funktion selbst aufschreiben: zwei leere Kästchen für m und b
    M.ein = ['', '']; M.slot = 0;
    M.q = null;
  } else {
    M.opts = options(a, [a + r.m, a - r.m, a + 1, a - 1, q + r.b, r.m * q]);
  }
}

function feedHint(n) {
  return App.wahl({
    de: 'Füttere die Maschine noch ' + n + ' Mal.',
    en: 'Feed the machine ' + n + ' more ' + (n === 1 ? 'time.' : 'times.'),
    fi: 'Syötä koneeseen vielä ' + (n === 1 ? 'kerran.' : n + ' kertaa.'),
    tr: 'Makineyi ' + n + ' kez daha besle.',
    fr: 'Nourris la machine encore ' + n + ' fois.',
    es: 'Alimenta la máquina ' + n + (n === 1 ? ' vez más.' : ' veces más.'),
    ja: 'あと' + n + '回マシンに入れましょう。',
    ar: n === 1 ? 'أدخل عددًا في الآلة مرة أخرى.' : 'أدخل عددًا في الآلة ' + n + ' مرات أخرى.'
  });
}

function frageHTML(M, c) {
  var i = M.names[0], o = M.names[1], I = gleich(i, 'rein', M.q), O = vn(o, 'raus'), t;
  if (c.frage === 'punkt') {
    t = { de: 'Welcher Punkt gehört zu ' + I + '?', en: 'Which point belongs to ' + I + '?',
          fi: 'Mikä piste kuuluu arvoon ' + I + '?', tr: I + ' için hangi nokta?',
          fr: 'Quel point correspond à ' + I + ' ?', es: '¿Qué punto corresponde a ' + I + '?',
          ja: I + ' のときの点はどれ？', ar: 'أي نقطة تنتمي إلى ' + I + '؟' };
    return '<p class="q">' + App.wahl(t) + '</p><div class="opts vier">' + M.popts.map(function (p, k) {
      return '<button class="opt" data-act="pkt" data-i="' + k + '"><bdi>(<span class="rein">' + p[0] + '</span>|<span class="raus">' + p[1] + '</span>)</bdi></button>';
    }).join('') + '</div>';
  }
  if (c.frage === 'schreiben') {
    t = { de: 'Wie lautet die Funktion?', en: 'What is the function?', fi: 'Mikä funktio on?',
          tr: 'Fonksiyon nedir?', fr: 'Quelle est la fonction ?', es: '¿Cuál es la función?',
          ja: '関数は何かな？', ar: 'ما هي الدالة؟' };
    var pr = { de: 'Prüfen', en: 'Check', fi: 'Tarkista', tr: 'Kontrol et', fr: 'Vérifier', es: 'Comprobar', ja: 'たしかめる', ar: 'تحقق' };
    function slot(k) { return '<button class="slot' + (M.slot === k ? ' sel' : '') + '" data-act="slot" data-i="' + k + '">' + M.ein[k] + '</button>'; }
    return '<p class="q">' + App.wahl(t) + '</p><p class="schreib"><bdi dir="ltr">' + vn(o, 'raus') + ' = ' + slot(0) + '·' + vn(i, 'rein') + ' + ' + slot(1) + '</bdi></p>' +
      keypad('ziffer', -1).replace('class="keys"', 'class="keys reihe"') +
      '<button class="opt pruefen" data-act="pruefen">' + App.wahl(pr) + '</button>';
  }
  if (c.frage === 'funktion') {
    t = { de: 'Welche Funktion steckt in der Maschine?', en: 'Which function is inside the machine?',
          fi: 'Mikä funktio koneen sisällä on?', tr: 'Makinenin içinde hangi fonksiyon var?',
          fr: 'Quelle fonction se cache dans la machine ?', es: '¿Qué función hay dentro de la máquina?',
          ja: 'マシンの中の関数はどれ？', ar: 'ما الدالة الموجودة داخل الآلة؟' };
    return '<p class="q">' + App.wahl(t) + '</p><div class="opts">' + M.fopts.map(function (r, k) {
      return '<button class="opt" data-act="fun" data-i="' + k + '">' + funktionHTML(r, M.names) + '</button>';
    }).join('') + '</div>';
  }
  var q = M.q;
  t = i ? { de: 'Was ist ' + O + ', wenn ' + I + ' ist?', en: 'What is ' + O + ' when ' + I + '?',
            fi: 'Mikä on ' + O + ', kun ' + I + '?', tr: I + ' ise ' + O + ' kaçtır?',
            fr: 'Que vaut ' + O + ' quand ' + I + ' ?', es: '¿Cuánto vale ' + O + ' cuando ' + I + '?',
            ja: I + ' のとき、' + O + ' はいくつ？', ar: 'كم تساوي ' + O + ' عندما ' + I + '؟' }
        : { de: 'Was kommt bei ' + q + ' heraus?', en: 'What comes out for ' + q + '?',
            fi: 'Mitä tulee ulos luvulla ' + q + '?', tr: q + ' için ne çıkar?', fr: 'Que sort-il pour ' + q + ' ?',
            es: '¿Qué sale con ' + q + '?', ja: q + 'を入れると何が出る？', ar: 'ماذا يخرج عند ' + q + '؟' };
  var knopf = optButtons(M.opts, '');
  return '<p class="q">' + App.wahl(t) + '</p>' + (c.eng ? knopf.replace('class="opts"', 'class="opts vier"') : knopf);
}

function falschFB(M, c) {
  if (c.frage === 'punkt') {
    var X = vn(M.names[0], 'rein'), Y = vn(M.names[1], 'raus');
    return { de: 'Nicht ganz. Im Punkt steht zuerst ' + X + ', dann ' + Y + '.',
             en: 'Not quite. A point lists ' + X + ' first, then ' + Y + '.',
             fi: 'Ei aivan. Pisteessä on ensin ' + X + ', sitten ' + Y + '.',
             tr: 'Tam değil. Noktada önce ' + X + ', sonra ' + Y + ' yazılır.',
             fr: 'Pas tout à fait. Dans un point, on écrit d’abord ' + X + ', puis ' + Y + '.',
             es: 'Casi. En un punto va primero ' + X + ' y después ' + Y + '.',
             ja: 'おしい。点では先に ' + X + '、次に ' + Y + ' を書きます。',
             ar: 'ليس تمامًا. في النقطة نكتب ' + X + ' أولًا ثم ' + Y + '.' };
  }
  if (c.frage === 'schreiben') {
    var m = Number(M.ein[0]), b = Number(M.ein[1]);
    var p = M.fed.filter(function (q) { return m * q.x + b !== q.y; })[0] || M.fed[0];
    var I = gleich(M.names[0], 'rein', p.x), w = m * p.x + b, y = p.y;
    return { de: 'Nicht ganz. Mit deiner Funktion gibt ' + I + ' den Wert ' + w + ', in der Tabelle steht ' + y + '.',
             en: 'Not quite. With your function, ' + I + ' gives ' + w + ', but the table says ' + y + '.',
             fi: 'Ei aivan. Funktiollasi ' + I + ' antaa ' + w + ', mutta taulukossa on ' + y + '.',
             tr: 'Tam değil. Senin fonksiyonunla ' + I + ' için ' + w + ' çıkıyor, tabloda ise ' + y + ' yazıyor.',
             fr: 'Pas tout à fait. Avec ta fonction, ' + I + ' donne ' + w + ', mais le tableau indique ' + y + '.',
             es: 'Casi. Con tu función, ' + I + ' da ' + w + ', pero en la tabla pone ' + y + '.',
             ja: 'おしい。きみの関数だと ' + I + ' のとき ' + w + ' ですが、表では ' + y + ' です。',
             ar: 'ليس تمامًا. بدالتك يعطي ' + I + ' القيمة ' + w + '، لكن الجدول يقول ' + y + '.' };
  }
  if (c.frage === 'funktion' && c.koord) {
    var PX = vn(M.names[0], 'rein'), PY = vn(M.names[1], 'raus');
    return { de: 'Nicht ganz. Nimm einen Punkt: Setze ' + PX + ' in die Funktion ein und vergleiche mit ' + PY + '.',
             en: 'Not quite. Take one point: put ' + PX + ' into the function and compare with ' + PY + '.',
             fi: 'Ei aivan. Valitse yksi piste: sijoita ' + PX + ' funktioon ja vertaa arvoon ' + PY + '.',
             tr: 'Tam değil. Bir nokta seç: ' + PX + ' değerini fonksiyona koy ve ' + PY + ' ile karşılaştır.',
             fr: 'Pas tout à fait. Prends un point : mets ' + PX + ' dans la fonction et compare avec ' + PY + '.',
             es: 'Casi. Toma un punto: pon ' + PX + ' en la función y compáralo con ' + PY + '.',
             ja: 'おしい。点を1つ選んで、' + PX + ' を関数に入れ、' + PY + ' とくらべよう。',
             ar: 'ليس تمامًا. خذ نقطة واحدة: ضع ' + PX + ' في الدالة وقارن الناتج بـ ' + PY + '.' };
  }
  if (c.frage === 'funktion' && c.achsen) {
    return { de: 'Nicht ganz. Nimm eine Linie: Setze die obere Zahl in die Funktion ein und vergleiche mit der unteren.',
             en: 'Not quite. Take one line: put the top number into the function and compare with the bottom one.',
             fi: 'Ei aivan. Valitse yksi viiva: sijoita ylempi luku funktioon ja vertaa alempaan.',
             tr: 'Tam değil. Bir çizgi seç: üstteki sayıyı fonksiyona koy ve alttakiyle karşılaştır.',
             fr: 'Pas tout à fait. Prends un trait : mets le nombre du haut dans la fonction et compare avec celui du bas.',
             es: 'Casi. Toma una línea: pon el número de arriba en la función y compáralo con el de abajo.',
             ja: 'おしい。線を1本選んで、上の数を関数に入れ、下の数とくらべよう。',
             ar: 'ليس تمامًا. خذ خطًا واحدًا: ضع العدد العلوي في الدالة وقارنه بالعدد السفلي.' };
  }
  if (c.frage === 'funktion') {
    return { de: 'Nicht ganz. Setze eine Zahl aus der Tabelle in die Funktion ein und vergleiche.',
             en: 'Not quite. Put a number from the table into the function and compare.',
             fi: 'Ei aivan. Sijoita funktioon luku taulukosta ja vertaa.',
             tr: 'Tam değil. Tablodan bir sayıyı fonksiyona koy ve karşılaştır.',
             fr: 'Pas tout à fait. Mets un nombre du tableau dans la fonction et compare.',
             es: 'Casi. Pon un número de la tabla en la función y compara.',
             ja: 'おしい。表の数を関数に入れてくらべてみよう。',
             ar: 'ليس تمامًا. ضع عددًا من الجدول في الدالة وقارن.' };
  }
  var R = regelHTML(M.r, M.names[0]), E = vn(M.names[0], 'rein'), q = M.q;
  return { de: 'Nicht ganz. Setze für ' + E + ' die Zahl ' + q + ' in ' + R + ' ein.',
           en: 'Not quite. Put ' + q + ' in place of ' + E + ' in ' + R + '.',
           fi: 'Ei aivan. Sijoita ' + E + ':n paikalle ' + q + ' lausekkeeseen ' + R + '.',
           tr: 'Tam değil. ' + R + ' içinde ' + E + ' yerine ' + q + ' koy.',
           fr: 'Pas tout à fait. Remplace ' + E + ' par ' + q + ' dans ' + R + '.',
           es: 'Casi. Pon ' + q + ' en lugar de ' + E + ' en ' + R + '.',
           ja: 'おしい。' + R + ' の ' + E + ' に ' + q + ' を入れて計算しよう。',
           ar: 'ليس تمامًا. ضع ' + q + ' مكان ' + E + ' في ' + R + '.' };
}

App.funk.einstieg = function (c) {
  // Viel auf dem Schirm: Tasten in einer Reihe, Antworten nebeneinander
  c.eng = !!(c.tabelle || c.achsen || c.koord);
  return {
    id: c.id, text: c.text,
    start: function (M) {
      M.r = c.regel();
      M.max = Math.max(5, Math.ceil(f(M.r, 9) / 5) * 5);
      var pool = c.namen === 'zufall' ? PAARE.concat([['y', 'x']]) : PAARE;
      M.names = !c.namen ? [null, null] : Array.isArray(c.namen) ? c.namen.slice() : pool[rnd(pool.length)].slice();
      M.fed = []; M.last = null; M.q = null; M.fopts = null; M.ein = null;
      if (c.vorgabe) {
        // Paare schon vorgegeben, keine Tasten: gleich die Frage nach der Funktion
        shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, c.vorgabe).forEach(function (x) { M.fed.push({ x: x, y: f(M.r, x) }); });
        frageStellen(M, c);
      }
    },
    html: function (M) {
      var l = M.last, run = M.run, i = M.names[0], o = M.names[1], html = '', zeigen = !c.geheim || M.done;
      M.run = false;
      function chip(art, wert) {
        // Vorgegebene Paare: der Name steht im Kästchen selbst, es wird ja nichts gefüttert
        if (c.vorgabe) return '<div class="chip namechip on' + (art === 'raus' ? ' out' : '') + '">' + vn(art === 'rein' ? i : o, art) + '</div>';
        var el = '<div class="chip' + (art === 'raus' ? ' out' : '') + (l ? ' on' : '') + '">' + (l ? wert : '') + '</div>';
        return i ? '<div class="vk">' + vn(art === 'rein' ? i : o, art) + el + '</div>' : el;
      }
      html += '<div class="flow' + (i && !c.vorgabe ? ' vflow' : '') + '">' + chip('rein', l && l.x) + ARROW +
        '<div class="mbox' + (zeigen ? ' regel' : '') + (run ? ' run' : '') + '">' + (!zeigen ? '?' : c.einsetzen && i && l ? regelMit(M.r, '<span class="rein">' + l.x + '</span>') : regelHTML(M.r, i, l && l.x)) + '</div>' + ARROW +
        chip('raus', l && l.y) + '</div>';
      if (c.fn && i) html += '<p class="fn">' + funktionHTML(M.r, M.names) + '</p>';
      var tasten = keypad('feed', -1);
      if (!c.vorgabe) html += c.eng ? tasten.replace('class="keys"', 'class="keys reihe"') : tasten;
      if (c.liste) html += '<div class="hist">' + M.fed.map(function (p) {
        return '<span><span class="rein">' + p.x + '</span> → <span class="raus">' + p.y + '</span></span>';
      }).join('') + '</div>';
      if (c.tabelle) html += tabelleHTML(M, c.tabelle === 'voll');
      if (c.achsen) html += achsenHTML(M);
      if (c.koord) html += koordHTML(M);
      if (M.done) return html;
      return html + (M.q === null && !M.fopts && !M.ein ? '<p class="hint">' + feedHint(3 - M.fed.length) + '</p>' : frageHTML(M, c));
    },
    click: function (M, act, d) {
      if (act === 'feed') {
        var p = { x: d.n, y: f(M.r, d.n) };
        if (!hatX(M, p.x)) M.fed.push(p);
        M.last = p; M.run = true;
        M.fb = '';
        if ((M.q === null && !M.fopts && M.fed.length >= 3) || (M.q === d.n && c.frage !== 'funktion')) frageStellen(M, c);
        return;
      }
      if (act === 'slot') { M.slot = d.i; return; }
      if (act === 'ziffer') { M.ein[M.slot] = String(d.n); M.slot = 1; M.fb = ''; return; }
      if (act === 'pruefen' && (M.ein[0] === '' || M.ein[1] === '')) {
        M.fb = { de: 'Fülle beide Kästchen aus.', en: 'Fill in both boxes.', fi: 'Täytä molemmat laatikot.', tr: 'İki kutuyu da doldur.',
                 fr: 'Remplis les deux cases.', es: 'Rellena las dos casillas.', ja: '2つの□をうめよう。', ar: 'املأ المربعين.' };
        return;
      }
      var richtig = act === 'pruefen' ? Number(M.ein[0]) === M.r.m && Number(M.ein[1]) === M.r.b
        : act === 'ans' ? d.v === M.ans
        : act === 'pkt' ? M.popts[d.i][0] === M.q && M.popts[d.i][1] === M.ans
        : act === 'fun' ? M.fopts[d.i].m === M.r.m && M.fopts[d.i].b === M.r.b : null;
      if (richtig === null) return;
      if (!richtig) { M.wrong++; M.fb = falschFB(M, c); return; }
      var nurFunktion = c.frage === 'funktion' || c.frage === 'schreiben';
      if (!nurFunktion) { M.fed.push({ x: M.q, y: M.ans }); M.last = M.fed[M.fed.length - 1]; }
      // Immer von links nach rechts lesen, auch in Arabisch: rein → raus
      M.fb = nurFunktion ? funktionHTML(M.r, M.names)
        : '<bdi dir="ltr">' + (M.names[0] ? gleich(M.names[0], 'rein', M.q) + ' → ' + gleich(M.names[1], 'raus', M.ans)
        : '<span class="rein">' + M.q + '</span> → <span class="raus">' + M.ans + '</span>') + '</bdi>';
      M.q = null;
      finish();
    }
  };
};

App.bereich({
  id: 'funktionen',
  name: { de: 'Funktionen', en: 'Functions', fi: 'Funktiot', tr: 'Fonksiyonlar', fr: 'Fonctions', es: 'Funciones', ja: '関数', ar: 'الدوال' },
  icon: '<svg viewBox="0 0 40 44"><path d="M6 6V38H38M10 33C18 32 25 22 34 9"/></svg>',
  werkzeuge: ['point', 'line'],
  drehen: false,   // Koordinatensystem bleibt gerade
  mitte: true,     // Ursprung in der Bildmitte
  init: function () {
    FLEVELS = App.levelListe('funktionen');
    fLoad();
    mach = document.getElementById('mach');
    mach.addEventListener('click', machClick);
    schreib = document.createElement('div');
    schreib.id = 'fschreib'; schreib.hidden = true;
    var hud = document.getElementById('hud');
    hud.parentNode.insertBefore(schreib, hud.nextSibling);
    schreib.addEventListener('click', schreibClick);
  },
  levels: function () { return FLEVELS; },
  solved: function () { return F.solved; },
  open: function () { fLoadLevel(F.level); },
  draw: function (ctx, ws) { if (!isMach(FLEVELS[F.level])) buildFunk(ctx, ws); },
  overlay: drawTable,
  down: fDown, move: fMove, up: fUp, check: fCheck,
  undo: fUndo, clear: fClear, next: fNext,
  persist: function () { fStore(); fSave(); },
  sprache: function () { if (M && !mach.hidden) machRender(); if (schreib && !schreib.hidden) { fCheck(); render(); } }
});
})();
