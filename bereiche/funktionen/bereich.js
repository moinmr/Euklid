/* Bereich Funktionen. Zwei Arten von Leveln (in level/, Reihenfolge in reihenfolge.js):
   - Maschinen-Level (DOM-Fläche #mach): bringen start(M), html(M) und click(M, act, d) mit.
     Hilfen dafür in App.funk (Zahlentasten, Antwortknöpfe, finish ...).
   - Gitter-Level (Canvas mit Koordinatensystem): nur Daten, pts (Punkte setzen) oder eq und xs (Gerade). */
(function () {
'use strict';
var App = window.App, S = App.S, C = App.C;
var V = App.V, vp = App.vp, render = App.render, dotAt = App.dotAt, mark = App.mark, text = App.text;
var GRAB = C.GRAB, INK = C.INK, BLUE = C.BLUE;
var REIN = '#cf5a17', RAUS = '#7b3fa6';   // Orange = rein, Lila = raus (wie in stil.css)
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
// Level mit herleitung: drei Geraden durch (0|b) und (xs|0), beide ganzzahlig, mit ganzzahliger Steigung m = −b/xs.
// a ist der Punkt auf der y-Achse, b der auf der x-Achse. Mindestens eine steigende und eine fallende.
function fFestHerleitung() {
  var paare = [];
  [-3, -2, -1, 1, 2, 3].forEach(function (m) {
    [-4, -3, -2, -1, 1, 2, 3, 4].forEach(function (b) { var xs = -b / m; if (xs === Math.round(xs) && Math.abs(xs) <= 4) paare.push([m, b]); });
  });
  for (;;) {
    var w = shuffle(paare.slice()).slice(0, 3);
    if (w.some(function (p) { return p[0] > 0; }) && w.some(function (p) { return p[0] < 0; })) {
      return w.map(function (p) { return { a: [0, -p[1] * U], b: [-p[1] / p[0] * U, 0], gid: 0, fest: true }; });
    }
  }
}
// Level mit nullfrage: eine Gerade y = mx + b mit b von 1 bis 3; a = (0|b), b = (1|b+m)
function fFestNull() {
  var m = [-2, -1, 1, 2][rnd(4)], b = 1 + rnd(3);
  return { a: [0, -b * U], b: [U, -(b + m) * U], gid: 0, fest: true };
}
function fNull() { var l = F.lines[0]; return { m: fSteig(l), b: -Math.round(l.a[1] / U) }; }
function fHerl() { var l = F.lines[F.runde]; return { m: fSteig(l), b: -Math.round(l.a[1] / U), xs: fLauf(l) }; }
function fLauf(l) { return Math.round((l.b[0] - l.a[0]) / U); }
function fSteig(l) { return Math.round((l.a[1] - l.b[1]) / U) / fLauf(l); }
// Ansicht so legen, dass das Dreieck der aktuellen Geraden zwischen Aufgabe und Eingabekarte liegt
function steigAnsicht() {
  var l = F.lines[F.runde], hud = document.getElementById('hud');
  if (!l || !schreib) return;
  var oben = hud && hud.firstChild ? hud.getBoundingClientRect().bottom : 60;
  var unten = schreib.hidden ? S.h - (S.unten || 70) : schreib.getBoundingClientRect().top;
  var ym = (-l.a[1] - l.b[1]) / 2 / U, xm = (l.a[0] + l.b[0]) / 2 / U;
  if (FLEVELS[F.level].nullfrage) {
    // Schnittpunkt mit der y-Achse und ein falsch eingegebener Punkt beide sichtbar
    var nh = fNull(), w = F.nullFalsch === null || F.nullFalsch === undefined ? 0 : F.nullFalsch;
    xm = w / 2; ym = nh.b + nh.m * w / 2;
  }
  if (FLEVELS[F.level].herleitung && (F.phase === 3 || F.phase === 4)) { var h = fHerl(), g = herlGmax(); xm = g / 2; ym = h.b + h.m * g / 2; }
  S.oy = (oben + unten) / 2 + ym * U;
  S.ox = S.w / 2 - xm * U;
  App.applyView();
}
// Koordinate (x|y) im Gitter: x orange (rein), y lila (raus), Klammern in Tinte
function koordText(ctx, x, y, cx, cy, size) {
  var teile = [['(', INK], [x, REIN], ['|', INK], [y, RAUS], [')', INK]];
  ctx.save();
  ctx.font = '400 ' + (size * S.k) + 'px ' + C.FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.translate(cx, cy);
  if (Math.abs(S.vth) > 1e-6) ctx.rotate(-S.vth);
  var breit = teile.reduce(function (s, t) { return s + ctx.measureText(t[0]).width; }, 0), px = -breit / 2;
  // heller Rand, damit die Koordinate auch auf Achsen und Gitterlinien lesbar bleibt
  ctx.strokeStyle = C.PARCH; ctx.lineWidth = 4 * S.k; ctx.lineJoin = 'round';
  ctx.strokeText(teile.map(function (t) { return t[0]; }).join(''), px, 0);
  teile.forEach(function (t) { ctx.fillStyle = t[1]; ctx.fillText(t[0], px, 0); px += ctx.measureText(t[0]).width; });
  ctx.restore();
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
  if (FLEVELS[F.level] && FLEVELS[F.level].handschrift) return;   // Taxi: eigene Grafik in drawTable
  var k = S.k, i;
  var cs = [[0, 0], [S.w, 0], [0, S.h], [S.w, S.h]].map(App.toWorld);
  var xs = cs.map(function (c) { return c[0]; }), ys = cs.map(function (c) { return c[1]; });
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  var steps = [1, 2, 5, 10, 20, 50, 100], st = 100;
  for (i = 0; i < steps.length; i++) { if (steps[i] * U * S.vs >= 26) { st = steps[i]; break; } }
  var sp = st * U, gx, gy;
  var ohneGitter = FLEVELS[F.level] && FLEVELS[F.level].zweipunkt === 'ohnegitter';   // nichts zum Kästchenzählen
  if (!ohneGitter) {
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
  }

  ctx.lineCap = 'round';
  var lvz = FLEVELS[F.level], nurFeste = !!(lvz && (lvz.verbinden || lvz.schnitt || lvz.steigung || lvz.herleitung || lvz.nullfrage || lvz.zweipunkt || lvz.handschrift));   // nur die vorgegebenen Punkte zeigen
  F.lines.forEach(function (l, i) {
    if (lvz && (lvz.steigung || lvz.herleitung || lvz.zweipunkt) && i !== F.runde) return;   // immer nur die aktuelle Gerade
    var col = l.fest ? INK : fLinieFalsch(l) ? C.RED : BLUE;   // vorgegebene Gerade dunkel, falsche Linie rot
    ctx.strokeStyle = col;
    extLine(ctx, l.a, l.b, 2.5 * ws * k);
    if (!nurFeste) { ctx.fillStyle = col; dotAt(ctx, l.a, false); dotAt(ctx, l.b, false); }
  });
  if (lvz && lvz.steigung && F.lines[F.runde]) {
    // Steigungsdreieck gestrichelt: d nach rechts (beschriftet), dann nach oben oder unten (zum Zählen)
    var sl = F.lines[F.runde], ecke = [sl.b[0], sl.a[1]], hoch = sl.b[1] < sl.a[1];
    ctx.save(); ctx.strokeStyle = INK; ctx.globalAlpha = 0.75; ctx.lineWidth = 2 * ws * k; ctx.setLineDash([6 * k, 5 * k]);
    ctx.beginPath(); ctx.moveTo(sl.a[0], sl.a[1]); ctx.lineTo(ecke[0], ecke[1]); ctx.lineTo(sl.b[0], sl.b[1]); ctx.stroke(); ctx.restore();
    text(ctx, String(fLauf(sl)), (sl.a[0] + ecke[0]) / 2, ecke[1] + (hoch ? 13 : -13) * k, INK, 14);
  }
  if (lvz && lvz.zweipunkt) zpZeichnen(ctx, ws);
  if (lvz && lvz.nullfrage && F.lines[0]) {
    // Schnittpunkt mit der y-Achse, x noch offen; ein falsch eingegebener Wert als roter Punkt
    var nf = fNull();
    ctx.fillStyle = INK; dotAt(ctx, [0, -nf.b * U], false, 6);
    koordText(ctx, F.fn ? '0' : '?', fmt(nf.b), (nf.m > 0 ? -36 : 36) * k, -nf.b * U - 14 * k, 14);
    if (F.nullFalsch !== null && F.nullFalsch !== undefined && !F.fn) {
      var wy = nf.m * F.nullFalsch + nf.b;
      ctx.fillStyle = C.RED; dotAt(ctx, [F.nullFalsch * U, -wy * U], false, 6);
      koordText(ctx, fmt(F.nullFalsch), fmt(wy), F.nullFalsch * U + (nf.m > 0 ? -36 : 36) * k, -wy * U - 14 * k, 14);
    }
  }
  if (lvz && lvz.herleitung && F.lines[F.runde]) {
    // beide Achsenschnittpunkte mit Koordinaten; ab Schritt 2 der Erklärung das Steigungsdreieck dazwischen.
    // Die Ecke liegt bei (xs|b), so liegen die Katheten nie auf den Achsen. Beschriftungen in den freien Ecken.
    var hm = fHerl(), steigt = hm.m > 0, sx = hm.xs > 0 ? 1 : -1, sb = hm.b > 0 ? 1 : -1, P = [0, -hm.b * U], Q = [hm.xs * U, 0], ecke = [Q[0], P[1]];
    if (F.phase === 3 || F.phase === 4) {
      // allgemeiner Punkt (x|y) auf der Geraden, Dreieck von (0|b) bis dorthin: x nach rechts, y − b nach oben oder unten
      var G = [F.gx * U, -(hm.b + hm.m * F.gx) * U], E = [G[0], P[1]];
      ctx.save(); ctx.strokeStyle = INK; ctx.globalAlpha = 0.75; ctx.lineWidth = 2 * ws * k; ctx.setLineDash([6 * k, 5 * k]);
      ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(G[0], G[1]); ctx.stroke(); ctx.restore();
      text(ctx, 'x', G[0] / 2, P[1] + (steigt ? 14 : -14) * k, INK, 15);
      text(ctx, 'y − b', G[0] + 26 * k, (P[1] + G[1]) / 2, INK, 15);
      ctx.fillStyle = INK; dotAt(ctx, G, false, 7);
      text(ctx, '(x|y)', G[0] + (steigt ? -32 : 32) * k, G[1] - 15 * k, INK, 14);
    }
    if (F.phase === 2 || F.phase === 6) {
      ctx.save(); ctx.strokeStyle = INK; ctx.globalAlpha = 0.75; ctx.lineWidth = 2 * ws * k; ctx.setLineDash([6 * k, 5 * k]);
      ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(ecke[0], ecke[1]); ctx.lineTo(Q[0], Q[1]); ctx.stroke(); ctx.restore();
      text(ctx, String(Math.abs(hm.xs)), Q[0] / 2, P[1] - sb * 14 * k, INK, 14);
      if (F.phase === 2) text(ctx, String(Math.abs(hm.b)), Q[0] + sx * 14 * k, P[1] / 2, INK, 14);
    }
    ctx.fillStyle = INK; dotAt(ctx, P, false, 5); if (F.phase !== 3 && F.phase !== 4) dotAt(ctx, Q, false, 5);
    if (F.phase === 3 || F.phase === 4) text(ctx, '(0|' + fmt(hm.b) + ')', -40 * k, P[1] + (steigt ? -16 : 16) * k, INK, 13);   // links, das Dreieck ist rechts
    else text(ctx, '(0|' + fmt(hm.b) + ')', -sx * 40 * k, P[1] + sb * 16 * k, INK, 13);
    if (F.phase !== 3 && F.phase !== 4) text(ctx, '(' + fmt(hm.xs) + '|0)', Q[0] - sx * 30 * k, sb > 0 ? 30 * k : -16 * k, INK, 13);
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
  if (lv && lv.handschrift) return taxiGrafik(ctx);
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
// Level mit herleitung, Schritt 3: den Punkt (x|y) auf der Geraden ziehen
function herlZiehen(pos) {
  if (!FLEVELS[F.level].herleitung || F.phase !== 3) return;
  var g = herlGx(Math.round(pos[0] / U));
  if (g !== F.gx) { F.gx = g; fSchreib(true); render(); }
}
function fDown(pos) {
  herlZiehen(pos); zpZiehen(pos);
  if (FLEVELS[F.level].handschrift || FLEVELS[F.level].zweipunkt || FLEVELS[F.level].schnitt || FLEVELS[F.level].steigung || FLEVELS[F.level].herleitung || FLEVELS[F.level].nullfrage) return true;
  S.drawing = true; S.lmode = S.ls ? 'end' : 'start';
  S.end = [pos[0], pos[1]]; S.target = fTarget(pos);
  S.loupe = S.sp; render();
  return true;
}
function fMove(pos) {
  herlZiehen(pos); zpZiehen(pos);
  if (FLEVELS[F.level].handschrift || FLEVELS[F.level].zweipunkt || FLEVELS[F.level].schnitt || FLEVELS[F.level].steigung || FLEVELS[F.level].herleitung || FLEVELS[F.level].nullfrage) return true;
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
  } else if (lv.schnitt || lv.steigung || lv.herleitung || lv.nullfrage || lv.zweipunkt || lv.handschrift) {
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
  F.level = n; F.pts = []; F.lines = []; F.gid = 0; F.fn = false; F.ein = ['', '', '', '']; F.slot = 0; F.fb = ''; F.fbOk = false; F.runde = 0; F.phase = 0; F.nullFalsch = null; F.fbRot = false; F.zpZeig = false; F.hs = [];
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
  if (lv.nullfrage) {
    if (!F.lines.some(function (l) { return l.fest; })) F.lines = [fFestNull()];
    F.ein = [''];
  }
  if (lv.handschrift) {
    if (!F.lines.some(function (l) { return l.fest; })) { var g = 2 + rnd(3), p = 1 + rnd(3); F.lines = [{ a: [0, -g * U], b: [U, -(g + p) * U], gid: 0, fest: true }]; F.runde = 0; }
    F.taxiOpts = null;
  }
  if (lv.zweipunkt) {
    if (!F.lines.some(function (l) { return l.fest; })) { F.lines = zpFest(lv.zweipunkt); F.runde = 0; }
    F.ein = lv.zweipunkt === 'mb' ? ['', ''] : [''];
    if (lv.zweipunkt === 'wandern') { F.gx = zpGx(zpP(F.lines[0]).x1 + 2); F.gesehen = {}; F.gesehen[F.gx] = true; }
  }
  if (lv.herleitung) {
    // auch neu, wenn noch Geraden aus der alten Fassung gespeichert sind (zweiter Punkt nicht auf der x-Achse)
    if (!F.lines.some(function (l) { return l.fest; }) || F.lines.some(function (l) { return l.b[1] !== 0; })) { F.lines = fFestHerleitung(); F.runde = 0; }
    F.phase = F.runde ? 6 : 0; F.ein = ['', '']; F.gx = herlGx(3);
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
  if (lv.steigung || lv.herleitung || lv.nullfrage) steigAnsicht();
  if (lv.zweipunkt) zpAnsicht();
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
  if (FLEVELS[F.level].herleitung) return herlKarte();
  if (FLEVELS[F.level].nullfrage) return nullKarte();
  if (FLEVELS[F.level].zweipunkt) return zpKarte();
  if (FLEVELS[F.level].handschrift) return hsKarte();
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
// Level mit herleitung: an der ersten Geraden wird in vier Schritten erklärt (Weiter), wie man zur Gleichung kommt.
// Bei der zweiten und dritten tippt man y = □x + □ selbst ein (Phase 4).
function kurzGl(m, b) { return (m === 1 ? '' : m === -1 ? '−' : fmt(m)) + 'x' + (b < 0 ? ' − ' + (-b) : ' + ' + b); }
function herlText(k) {
  var h = fHerl(), B = fmt(h.b), X = fmt(h.xs), R = Math.abs(h.xs), H = Math.abs(h.b), hoch = (h.xs > 0 ? -h.b : h.b) > 0;
  var M = fmt(h.m), rise = fmt(hoch ? H : -H), G = '<bdi dir="ltr">y = ' + kurzGl(h.m, h.b) + '</bdi>';
  function p(s) { return '<bdi dir="ltr">' + s + '</bdi>'; }
  // Herleitung in drei Zeilen: Steigung im Dreieck, mal x, plus b (rechts daneben, was man rechnet)
  var Z = '<span class="zeilen"><bdi dir="ltr">(y − b) : x = m<i>| · x</i></bdi><bdi dir="ltr">y − b = m·x<i>| + b</i></bdi><bdi dir="ltr">y = mx + b<i></i></bdi></span>';
  var t = [
    { de: 'Diese Gerade schneidet die y-Achse bei ' + p('(0|' + B + ')') + ' und die x-Achse bei ' + p('(' + X + '|0)') + '. Aus diesen zwei Punkten bekommen wir ihre Gleichung.',
      en: 'This line crosses the y-axis at ' + p('(0|' + B + ')') + ' and the x-axis at ' + p('(' + X + '|0)') + '. From these two points we get its equation.',
      fi: 'Tämä suora leikkaa y-akselin pisteessä ' + p('(0|' + B + ')') + ' ja x-akselin pisteessä ' + p('(' + X + '|0)') + '. Näistä kahdesta pisteestä saadaan sen yhtälö.',
      tr: 'Bu doğru y eksenini ' + p('(0|' + B + ')') + ' noktasında, x eksenini ' + p('(' + X + '|0)') + ' noktasında keser. Bu iki noktadan denklemini buluruz.',
      fr: 'Cette droite coupe l’axe des y en ' + p('(0|' + B + ')') + ' et l’axe des x en ' + p('(' + X + '|0)') + '. Avec ces deux points, on trouve son équation.',
      es: 'Esta recta corta el eje y en ' + p('(0|' + B + ')') + ' y el eje x en ' + p('(' + X + '|0)') + '. Con estos dos puntos hallamos su ecuación.',
      ja: 'この直線は y 軸と ' + p('(0|' + B + ')') + '、x 軸と ' + p('(' + X + '|0)') + ' で交わります。この2つの点から式がわかります。',
      ar: 'هذا المستقيم يقطع محور y عند ' + p('(0|' + B + ')') + ' ومحور x عند ' + p('(' + X + '|0)') + '. من هاتين النقطتين نحصل على معادلته.' },
    { de: 'Schritt 1: Auf der y-Achse ist x = 0. Dort ist y = ' + B + '. Diese Zahl heißt b, hier b = ' + B + '.',
      en: 'Step 1: On the y-axis, x = 0. There y = ' + B + '. This number is called b, here b = ' + B + '.',
      fi: 'Vaihe 1: y-akselilla x = 0. Siellä y = ' + B + '. Tätä lukua sanotaan b:ksi, tässä b = ' + B + '.',
      tr: 'Adım 1: y ekseninde x = 0’dır. Orada y = ' + B + '. Bu sayıya b denir, burada b = ' + B + '.',
      fr: 'Étape 1 : sur l’axe des y, x = 0. Là, y = ' + B + '. Ce nombre s’appelle b, ici b = ' + B + '.',
      es: 'Paso 1: en el eje y, x = 0. Ahí y = ' + B + '. Este número se llama b, aquí b = ' + B + '.',
      ja: 'ステップ1：y 軸の上では x = 0。そこでは y = ' + B + '。この数を b といいます。ここでは b = ' + B + '。',
      ar: 'الخطوة 1: على محور y يكون x = 0. هناك y = ' + B + '. هذا العدد يسمى b، وهنا b = ' + B + '.' },
    { de: 'Schritt 2: Von Punkt zu Punkt geht es ' + R + ' nach rechts und ' + H + (hoch ? ' nach oben' : ' nach unten') + '. Steigung m = ' + p(rise + ' : ' + R + ' = ' + M) + '.',
      en: 'Step 2: From point to point it goes ' + R + ' to the right and ' + H + (hoch ? ' up' : ' down') + '. Slope m = ' + p(rise + ' : ' + R + ' = ' + M) + '.',
      fi: 'Vaihe 2: Pisteestä pisteeseen mennään ' + R + ' oikealle ja ' + H + (hoch ? ' ylös' : ' alas') + '. Kulmakerroin m = ' + p(rise + ' : ' + R + ' = ' + M) + '.',
      tr: 'Adım 2: Noktadan noktaya sağa ' + R + ', ' + (hoch ? 'yukarı ' : 'aşağı ') + H + ' gidilir. Eğim m = ' + p(rise + ' : ' + R + ' = ' + M) + '.',
      fr: 'Étape 2 : d’un point à l’autre, on va de ' + R + ' vers la droite et de ' + H + (hoch ? ' vers le haut' : ' vers le bas') + '. Pente m = ' + p(rise + ' : ' + R + ' = ' + M) + '.',
      es: 'Paso 2: de un punto al otro se va ' + R + ' a la derecha y ' + H + (hoch ? ' hacia arriba' : ' hacia abajo') + '. Pendiente m = ' + p(rise + ' : ' + R + ' = ' + M) + '.',
      ja: 'ステップ2：点から点へ、右へ ' + R + '、' + (hoch ? '上へ ' : '下へ ') + H + '。傾き m = ' + p(rise + ' : ' + R + ' = ' + M) + '。',
      ar: 'الخطوة 2: من نقطة إلى أخرى نتحرك ' + R + ' إلى اليمين و' + H + (hoch ? ' إلى الأعلى' : ' إلى الأسفل') + '. الميل m = ' + p(rise + ' : ' + R + ' = ' + M) + '.' },
    { de: 'Schritt 3: Nimm irgendeinen Punkt (x|y) auf der Geraden und zieh ihn hin und her. Das Dreieck von (0|b) bis (x|y) geht x nach rechts und y − b nach oben oder unten. Die Steigung bleibt immer gleich:',
      en: 'Step 3: Take any point (x|y) on the line and drag it back and forth. The triangle from (0|b) to (x|y) goes x to the right and y − b up or down. The slope always stays the same:',
      fi: 'Vaihe 3: Ota mikä tahansa piste (x|y) suoralta ja vedä sitä edestakaisin. Kolmio pisteestä (0|b) pisteeseen (x|y) menee x oikealle ja y − b ylös tai alas. Kulmakerroin pysyy aina samana:',
      tr: 'Adım 3: Doğru üzerinde herhangi bir (x|y) noktası al ve onu ileri geri sürükle. (0|b)’den (x|y)’ye üçgen sağa x, yukarı ya da aşağı y − b gider. Eğim hep aynı kalır:',
      fr: 'Étape 3 : prends n’importe quel point (x|y) sur la droite et fais-le glisser. Le triangle de (0|b) à (x|y) va de x vers la droite et de y − b vers le haut ou le bas. La pente reste toujours la même :',
      es: 'Paso 3: toma cualquier punto (x|y) de la recta y arrástralo. El triángulo de (0|b) a (x|y) va x a la derecha e y − b hacia arriba o abajo. La pendiente siempre es la misma:',
      ja: 'ステップ3：直線の上の好きな点 (x|y) をとって、左右に動かそう。(0|b) から (x|y) までの三角形は、右へ x、上か下へ y − b。傾きはいつも同じです：',
      ar: 'الخطوة 3: خذ أي نقطة (x|y) على المستقيم وحرّكها ذهابًا وإيابًا. المثلث من (0|b) إلى (x|y) يذهب x إلى اليمين و y − b إلى الأعلى أو الأسفل. الميل يبقى دائمًا نفسه:' },
    { de: 'Schritt 4: Das gilt für jeden Punkt der Geraden:' + Z,
      en: 'Step 4: This holds for every point of the line:' + Z,
      fi: 'Vaihe 4: Tämä pätee suoran jokaiseen pisteeseen:' + Z,
      tr: 'Adım 4: Bu, doğrunun her noktası için geçerlidir:' + Z,
      fr: 'Étape 4 : c’est vrai pour chaque point de la droite :' + Z,
      es: 'Paso 4: esto vale para cada punto de la recta:' + Z,
      ja: 'ステップ4：これは直線のどの点でも成り立ちます：' + Z,
      ar: 'الخطوة 4: هذا صحيح لكل نقطة على المستقيم:' + Z },
    { de: 'Bei dieser Geraden ist m = ' + M + ' und b = ' + B + '. Also heißt ihre Gleichung ' + G + '.',
      en: 'For this line m = ' + M + ' and b = ' + B + '. So its equation is ' + G + '.',
      fi: 'Tällä suoralla m = ' + M + ' ja b = ' + B + '. Sen yhtälö on siis ' + G + '.',
      tr: 'Bu doğruda m = ' + M + ' ve b = ' + B + '. Yani denklemi ' + G + '.',
      fr: 'Pour cette droite, m = ' + M + ' et b = ' + B + '. Son équation est donc ' + G + '.',
      es: 'En esta recta m = ' + M + ' y b = ' + B + '. Así que su ecuación es ' + G + '.',
      ja: 'この直線では m = ' + M + '、b = ' + B + '。だから式は ' + G + ' です。',
      ar: 'في هذا المستقيم m = ' + M + ' و b = ' + B + '. إذن معادلته ' + G + '.' }
  ];
  return t[k];
}
var HERL = {
  weiter: { de: 'Weiter', en: 'Next', fi: 'Seuraava', tr: 'Devam', fr: 'Suivant', es: 'Siguiente', ja: 'つぎへ', ar: 'التالي' },
  du: { de: 'Jetzt du', en: 'Your turn', fi: 'Nyt sinä', tr: 'Şimdi sen', fr: 'À toi', es: 'Ahora tú', ja: 'やってみよう', ar: 'الآن دورك' },
  frage: { de: 'Jetzt du: Wie heißt die Gleichung dieser Geraden?', en: 'Your turn: what is the equation of this line?',
           fi: 'Nyt sinä: mikä on tämän suoran yhtälö?', tr: 'Şimdi sen: bu doğrunun denklemi nedir?',
           fr: 'À toi : quelle est l’équation de cette droite ?', es: 'Ahora tú: ¿cuál es la ecuación de esta recta?',
           ja: 'やってみよう：この直線の式は？', ar: 'الآن دورك: ما معادلة هذا المستقيم؟' },
  m: { de: 'Nicht ganz. Vor das x kommt die Steigung: Kästchen nach oben (nach unten negativ) geteilt durch Kästchen nach rechts.',
       en: 'Not quite. The slope goes in front of the x: squares up (down is negative) divided by squares to the right.',
       fi: 'Ei aivan. x:n eteen tulee kulmakerroin: ruudut ylös (alas negatiivinen) jaettuna ruuduilla oikealle.',
       tr: 'Tam değil. x’in önüne eğim gelir: yukarı kareler (aşağı negatif) bölü sağa kareler.',
       fr: 'Pas tout à fait. Devant le x, on met la pente : carreaux vers le haut (vers le bas, c’est négatif) divisés par carreaux vers la droite.',
       es: 'Casi. Delante de la x va la pendiente: cuadritos hacia arriba (hacia abajo es negativo) entre cuadritos a la derecha.',
       ja: 'おしい。x の前には傾きが入ります：上へのます数（下ならマイナス）÷右へのます数。',
       ar: 'ليس تمامًا. أمام x يأتي الميل: عدد المربعات إلى الأعلى (إلى الأسفل سالب) مقسومًا على المربعات إلى اليمين.' },
  b: { de: 'Nicht ganz. Hinten kommt b: der y-Wert, wo die Gerade die y-Achse schneidet.',
       en: 'Not quite. At the end comes b: the y value where the line crosses the y-axis.',
       fi: 'Ei aivan. Loppuun tulee b: y:n arvo, jossa suora leikkaa y-akselin.',
       tr: 'Tam değil. Sona b gelir: doğrunun y eksenini kestiği yerdeki y değeri.',
       fr: 'Pas tout à fait. À la fin, on met b : la valeur de y là où la droite coupe l’axe des y.',
       es: 'Casi. Al final va b: el valor de y donde la recta corta el eje y.',
       ja: 'おしい。最後には b：直線が y 軸と交わるところの y の値が入ります。',
       ar: 'ليس تمامًا. في النهاية يأتي b: قيمة y حيث يقطع المستقيم محور y.' }
};
function zahl(n) { return n < 0 ? '(' + fmt(n) + ')' : String(n); }
// x des Punkts (x|y) in Schritt 3: 1 bis 4, und das Dreieck höchstens 6 Kästchen hoch
function herlGmax() { var h = fHerl(), g = 4; while (g > 1 && Math.abs(h.m * g) > 6) g--; return g; }
function herlGx(x) {
  var h = fHerl();
  return Math.max(1, Math.min(herlGmax(), x));
}
// Zeile unter Schritt 3 mit den Zahlen des gezogenen Punkts
function herlLive() {
  var h = fHerl(), y = h.b + h.m * F.gx;
  return '<bdi dir="ltr">x = ' + F.gx + ', y = ' + fmt(y) + ':&nbsp; (' + fmt(y) + ' − ' + zahl(h.b) + ') : ' + F.gx + ' = ' + fmt(h.m) + '</bdi>';
}
function herlKarte() {
  var stand = '<span class="stand">' + (F.runde + 1) + ' / ' + F.lines.length + '</span>', keys = '';
  if (F.phase < 6) {
    schreib.innerHTML = '<div class="steig">' + stand + '</div><p class="erkl">' + App.wahl(herlText(F.phase)) + '</p>' +
      (F.phase === 3 ? '<div class="zeilen"><p>' + herlLive() + '</p></div>' : '') +
      '<button class="opt pruefen" data-act="schritt">' + App.wahl(F.phase === 5 ? HERL.du : HERL.weiter) + ' →</button>';
    return;
  }
  for (var d = -4; d <= 4; d++) keys += '<button class="key" data-act="ziffer" data-n="' + d + '">' + fmt(d) + '</button>';
  schreib.innerHTML = '<p class="fb">' + App.wahl(HERL.frage) + '</p>' +
    '<div class="steig"><bdi dir="ltr">y = ' + slotHTML(0) + 'x + ' + slotHTML(1) + '</bdi>' + stand + '</div>' +
    '<div class="keys reihe neun">' + keys + '</div><button class="opt pruefen" data-act="pruefen">' + App.wahl(PRUEFEN) + '</button>' +
    (F.fb ? '<p class="fb' + (F.fbOk ? ' ok' : '') + '">' + App.wahl(F.fb) + '</p>' : '');
}
// Weiter in der Erklärung; nach Schritt 3 kommt die zweite Gerade zum Selbermachen
/* ---------- Level mit zweipunkt: von zwei Punkten zur Geradengleichung, in kleinen Schritten ----------
   'ohnegitter': kein Gitter, nur die zwei Koordinaten; die Steigung eintippen (drei Geraden)
   'wandern':    ein Punkt (x|y) wird auf der Geraden gezogen; was kommt bei (y − y₁) : (x − x₁) immer heraus?
   'mb':         drei Gleichungen y = mx + b, jeweils m und b ablesen (die Gerade ist dazu gezeichnet; a = (0|b), b = (1|b + m))
   'hand':       fünf Geraden im Gitter (wie mb gespeichert), die Gleichung jeweils mit dem Finger schreiben
   Jede Gerade: a ist der linke Punkt, b der rechte, beide ganzzahlig. Nach dem Richtigen steht die Rechnung am Dreieck. */
function zpArt() { return FLEVELS[F.level].zweipunkt; }
function zpP(l) { return { x1: Math.round(l.a[0] / U), y1: -Math.round(l.a[1] / U), x2: Math.round(l.b[0] / U), y2: -Math.round(l.b[1] / U) }; }
function zpLinie(x1, y1, x2, y2) { return { a: [x1 * U, -y1 * U], b: [x2 * U, -y2 * U], gid: 0, fest: true }; }
function zpFest(art) {
  var m, x1, y1;
  if (art === 'ohnegitter') {
    // ganzzahlige Steigung von −3 bis 3, das Dreieck höchstens 6 hoch; Koordinaten größer, damit man rechnet
    var paare = [];
    [-3, -2, -1, 1, 2, 3].forEach(function (m) { [2, 3].forEach(function (d) { if (Math.abs(m * d) <= 6) paare.push([m, d]); }); });
    for (;;) {
      var w = shuffle(paare.slice()).slice(0, 3);
      if (w.some(function (p) { return p[0] > 0; }) && w.some(function (p) { return p[0] < 0; })) {
        return w.map(function (p) {
          x1 = 2 + rnd(5); y1 = (p[0] < 0 ? -p[0] * p[1] : 0) + 2 + rnd(5);
          return zpLinie(x1, y1, x1 + p[1], y1 + p[0] * p[1]);
        });
      }
    }
  }
  if (art === 'wandern') {
    m = [1, 2, -1, -2][rnd(4)]; x1 = 1 + rnd(2); y1 = m > 0 ? 1 : 1 - m * (m === -2 ? 3 : 4);
    return [zpLinie(x1, y1, x1 + 1, y1 + m)];
  }
  // mb: erst steigend mit b > 0, dann m = ±1 (nur x oder −x) mit b < 0, dann fallend mit b = 0 oder positiv
  var g1 = [2 + rnd(2), 1 + rnd(3)], g2 = [rnd(2) ? 1 : -1, -1 - rnd(3)], g3 = [-2 - rnd(2), [0, 2, 3][rnd(3)]];
  if (art === 'hand') {
    // m und b nur von −5 bis 5 (die Handschrift kennt die Ziffern 0 bis 5): steigend, ±1, fallend, b = 0, beides negativ
    var h = [[2 + rnd(2), 1 + rnd(3)], [rnd(2) ? 1 : -1, -1 - rnd(3)], [-2 - rnd(2), 1 + rnd(3)], [1 + rnd(3), 0], [-1 - rnd(2), -1 - rnd(2)]];
    return h.map(function (g) { return zpLinie(0, g[1], 1, g[1] + g[0]); });
  }
  return [g1, g2, g3].map(function (g) { return zpLinie(0, g[1], 1, g[1] + g[0]); });
}
// wandern: der gezogene Punkt liegt in Zehnteln 0,5 bis 4 rechts vom festen Punkt (bei Steigung ±2 bis 3), das Dreieck höchstens 6 hoch
function zpGmax() { var p = zpP(F.lines[0]); return p.x1 + (Math.abs(p.y2 - p.y1) > 1 ? 3 : 4); }
function zpGx(x) { var p = zpP(F.lines[0]); return Math.max(p.x1 + 0.5, Math.min(zpGmax(), x)); }
// Zahl mit höchstens einer Kommastelle, Komma oder Punkt je nach Sprache
function fmtD(n) {
  var r = Math.round(n * 10) / 10, t = Math.abs(r).toFixed(r % 1 ? 1 : 0);
  if (['en', 'ja', 'ar'].indexOf(App.sprache()) < 0) t = t.replace('.', ',');
  return (r < 0 ? '−' : '') + t;
}
function zpZiehen(pos) {
  if (zpArt() !== 'wandern' || F.fn) return;
  var g = zpGx(Math.round(pos[0] / U * 10) / 10);
  if (g !== F.gx) { F.gx = g; F.gesehen[g] = true; F.fb = ''; F.fbRot = false; fSchreib(true); render(); }
}
// der zweite Punkt des Dreiecks: in wandern der gezogene, sonst der rechte
function zpZiel() {
  var l = F.lines[F.runde], p = zpP(l);
  if (zpArt() !== 'wandern') return p;
  var m = (p.y2 - p.y1) / (p.x2 - p.x1);
  return { x1: p.x1, y1: p.y1, x2: F.gx, y2: Math.round((p.y1 + m * (F.gx - p.x1)) * 10) / 10 };
}
function zpAnsicht() {
  var l = F.lines[F.runde], hud = document.getElementById('hud');
  if (!l || !schreib) return;
  var p = zpP(l);
  if (zpArt() === 'wandern') { var m = (p.y2 - p.y1) / (p.x2 - p.x1), g = zpGmax(); p.y2 = p.y1 + (g - p.x1) * m; p.x2 = g; }
  var oben = hud && hud.firstChild ? hud.getBoundingClientRect().bottom : 60;
  var unten = schreib.hidden ? S.h - (S.unten || 70) : schreib.getBoundingClientRect().top;
  var ym = (p.y1 + p.y2) / 2;
  if (zpArt() === 'hand') ym = (Math.min(0, p.y1, p.y2) + Math.max(0, p.y1, p.y2)) / 2;   // auch die x-Achse im Bild
  S.oy = (oben + unten) / 2 + ym * U;
  S.ox = S.w / 2 - (p.x1 + p.x2) / 2 * U;
  App.applyView();
}
// Zeichnen: die Gerade, beide Punkte mit Koordinaten, das gestrichelte Dreieck; die Rechnung daran,
// sobald sie dran ist (nach dem Richtigen, in wandern immer)
function zpZeichnen(ctx, ws) {
  var k = S.k, l = F.lines[F.runde];
  if (!l) return;
  if (zpArt() === 'mb' || zpArt() === 'hand') return;   // nur die Gerade, kein Dreieck
  var q = zpZiel(), A = [q.x1 * U, -q.y1 * U], B = [q.x2 * U, -q.y2 * U], E = [B[0], A[1]], hoch = q.y2 > q.y1;
  if (q.x2 !== q.x1) {
    ctx.save(); ctx.strokeStyle = INK; ctx.globalAlpha = 0.75; ctx.lineWidth = 2 * ws * k; ctx.setLineDash([6 * k, 5 * k]);
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.restore();
  }
  if (zpArt() === 'wandern' || F.zpZeig || F.fn) {
    text(ctx, fmtD(q.x2) + ' − ' + zahl(q.x1) + ' = ' + fmtD(q.x2 - q.x1), (A[0] + E[0]) / 2, E[1] + (hoch ? 15 : -15) * k, REIN, 14);
    zpLinks(ctx, fmtD(q.y2) + ' − ' + zahl(q.y1) + ' = ' + fmtD(q.y2 - q.y1), E[0] + 10 * k, (E[1] + B[1]) / 2, RAUS, 14);
  }
  ctx.fillStyle = INK; dotAt(ctx, A, false, 6); dotAt(ctx, B, false, zpArt() === 'wandern' ? 8 : 6);
  koordText(ctx, fmt(q.x1), fmt(q.y1), A[0] - 42 * k, A[1] + (hoch ? -14 : 16) * k, 14);
  koordText(ctx, fmtD(q.x2), fmtD(q.y2), B[0] - 40 * k, B[1] + (hoch ? -16 : 18) * k, 14);   // links neben der Geraden, weg vom Dreieck
}
// Text links ausgerichtet (die senkrechte Rechnung steht rechts neben dem Dreieck)
function zpLinks(ctx, txt, x, y, col, size) {
  ctx.save();
  ctx.font = '400 ' + (size * S.k) + 'px ' + C.FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.translate(x, y);
  if (Math.abs(S.vth) > 1e-6) ctx.rotate(-S.vth);
  ctx.fillText(txt, 0, 0);
  ctx.restore();
}
var RICHTIG = { de: 'Richtig!', en: 'Right!', fi: 'Oikein!', tr: 'Doğru!', fr: 'Bravo !', es: '¡Correcto!', ja: '正解！', ar: 'صحيح!' };
var ZP = {
  steig: { de: 'Nicht ganz. Steigung = nach oben : nach rechts. Rechne beides aus den Koordinaten.',
           en: 'Not quite. Slope = up : right. Work out both from the coordinates.',
           fi: 'Ei aivan. Kulmakerroin = ylös : oikealle. Laske molemmat koordinaateista.',
           tr: 'Tam değil. Eğim = yukarı : sağa. İkisini de koordinatlardan hesapla.',
           fr: 'Pas tout à fait. Pente = vers le haut : vers la droite. Calcule les deux avec les coordonnées.',
           es: 'Casi. Pendiente = hacia arriba : hacia la derecha. Calcula las dos con las coordenadas.',
           ja: 'おしい。傾き＝上へ÷右へ。どちらも座標から計算しよう。',
           ar: 'ليس تمامًا. الميل = إلى الأعلى : إلى اليمين. احسب الاثنين من الإحداثيات.' },
  teil: { de: 'Nicht ganz. Teile die lila Zahl durch die orange Zahl.', en: 'Not quite. Divide the purple number by the orange number.',
          fi: 'Ei aivan. Jaa violetti luku oranssilla luvulla.', tr: 'Tam değil. Mor sayıyı turuncu sayıya böl.',
          fr: 'Pas tout à fait. Divise le nombre violet par le nombre orange.', es: 'Casi. Divide el número morado entre el naranja.',
          ja: 'おしい。むらさきの数をオレンジの数でわろう。', ar: 'ليس تمامًا. اقسم العدد البنفسجي على العدد البرتقالي.' },
  m: { de: 'm stimmt nicht. m ist die Zahl vor dem x. Steht nur x da, ist m = 1, bei −x ist m = −1.',
       en: 'm is not right. m is the number in front of x. If there is just x, m = 1; with −x, m = −1.',
       fi: 'm ei täsmää. m on luku x:n edessä. Jos on pelkkä x, m = 1, ja −x:llä m = −1.',
       tr: 'm yanlış. m, x’in önündeki sayıdır. Sadece x varsa m = 1, −x varsa m = −1.',
       fr: 'm n’est pas juste. m est le nombre devant le x. S’il n’y a que x, m = 1 ; avec −x, m = −1.',
       es: 'm no está bien. m es el número delante de la x. Si solo hay x, m = 1; con −x, m = −1.',
       ja: 'm が合っていません。m は x の前の数です。x だけなら m＝1、−x なら m＝−1。',
       ar: 'm غير صحيح. m هو العدد أمام x. إذا كان x وحده فإن m = 1، ومع −x يكون m = −1.' },
  b: { de: 'b stimmt nicht. b ist die Zahl ohne x. Fehlt sie, ist b = 0. Bei „− 3“ ist b = −3.',
       en: 'b is not right. b is the number without x. If it is missing, b = 0. With “− 3”, b = −3.',
       fi: 'b ei täsmää. b on luku ilman x:ää. Jos sitä ei ole, b = 0. Kun on ”− 3”, b = −3.',
       tr: 'b yanlış. b, x’siz sayıdır. Yoksa b = 0’dır. “− 3” varsa b = −3’tür.',
       fr: 'b n’est pas juste. b est le nombre sans x. S’il manque, b = 0. Avec « − 3 », b = −3.',
       es: 'b no está bien. b es el número sin x. Si no está, b = 0. Con “− 3”, b = −3.',
       ja: 'b が合っていません。b は x のつかない数です。ないときは b＝0。「− 3」なら b＝−3。',
       ar: 'b غير صحيح. b هو العدد بدون x. إذا لم يوجد فإن b = 0. ومع «− 3» يكون b = −3.' },
  zieh: { de: 'Zieh den Punkt erst an eine andere Stelle und schau, was dann herauskommt.',
          en: 'First drag the point to another place and see what comes out then.',
          fi: 'Vedä ensin piste toiseen kohtaan ja katso, mitä silloin tulee.',
          tr: 'Önce noktayı başka bir yere sürükle ve ne çıktığına bak.',
          fr: 'Fais d’abord glisser le point ailleurs et regarde ce qu’on obtient.',
          es: 'Primero arrastra el punto a otro sitio y mira qué sale.',
          ja: 'まず点を別の場所へ動かして、何が出るか見てみよう。',
          ar: 'اسحب النقطة أولًا إلى مكان آخر وانظر ماذا يخرج.' }
};
function zpKarte() {
  var art = zpArt(), keys = '', stand = F.lines.length > 1 ? '<span class="stand">' + (F.runde + 1) + ' / ' + F.lines.length + '</span>' : '';
  var fb = F.fb ? '<p class="fb' + (F.fbOk ? ' ok' : '') + '"' + (F.fbRot ? ' style="color: var(--red)"' : '') + '>' + App.wahl(F.fb) + '</p>' : '';
  if (F.zpZeig) {
    // richtig, die Rechnung steht am Dreieck; weiter zur nächsten Geraden
    schreib.innerHTML = '<div class="steig">' + stand + '</div>' + fb +
      '<button class="opt pruefen" data-act="schritt">' + App.wahl(HERL.weiter) + ' →</button>';
    return;
  }
  if (art === 'hand') return hsPad(stand);
  for (var d = -4; d <= 4; d++) keys += '<button class="key" data-act="ziffer" data-n="' + d + '">' + fmt(d) + '</button>';
  var zeile;
  if (art === 'ohnegitter') zeile = '<span>' + App.wahl(STEIG) + '</span>' + slotHTML(0);
  else if (art === 'mb') {
    // die Gleichung groß, darunter m = □ und b = □
    var g = zpP(F.lines[F.runde]), gl = eqStr({ m: g.y2 - g.y1, b: g.y1 }).replace(/^y/, '<span class="raus">y</span>').replace('x', '<span class="rein">x</span>');
    schreib.innerHTML = '<div class="steig zp"><bdi dir="ltr" class="mbgl">' + gl + '</bdi>' + stand + '</div>' +
      '<div class="steig zp"><bdi dir="ltr">m = ' + slotHTML(0) + '</bdi><bdi dir="ltr">b = ' + slotHTML(1) + '</bdi></div>' +
      '<div class="keys reihe neun">' + keys + '</div><button class="opt pruefen" data-act="pruefen">' + App.wahl(PRUEFEN) + '</button>' + fb;
    return;
  } else {
    var q = zpZiel();
    zeile = '<bdi dir="ltr"><span class="raus">' + fmtD(q.y2 - q.y1) + '</span> : <span class="rein">' + fmtD(q.x2 - q.x1) + '</span> = </bdi>' + slotHTML(0);
  }
  schreib.innerHTML = '<div class="steig zp">' + zeile + stand + '</div>' +
    '<div class="keys reihe neun">' + keys + '</div><button class="opt pruefen" data-act="pruefen">' + App.wahl(PRUEFEN) + '</button>' + fb;
}
function zpPruefen() {
  var art = zpArt(), p = zpP(F.lines[F.runde]), m = (p.y2 - p.y1) / (p.x2 - p.x1);
  var w = F.ein.map(function (s) { return Number(s.replace('−', '-')); });
  if (F.ein.some(function (s) { return s === ''; })) return;   // noch nicht alles gewählt
  var falsch = null;
  if (art === 'ohnegitter') falsch = w[0] !== m ? ZP.steig : null;
  else if (art === 'mb') falsch = w[0] !== m ? ZP.m : w[1] !== p.y1 ? ZP.b : null;
  else falsch = w[0] !== m ? ZP.teil : Object.keys(F.gesehen).length < 2 ? ZP.zieh : null;
  if (falsch) { F.fb = falsch; F.fbOk = false; F.fbRot = art !== 'wandern' || w[0] !== m; return; }
  F.fbRot = false;
  if (F.runde < F.lines.length - 1) { F.zpZeig = true; F.fb = RICHTIG; F.fbOk = true; }
  else { F.fn = true; F.fb = ''; }
}
function zpWeiter() {
  F.zpZeig = false; F.runde++; F.ein = F.ein.map(function () { return ''; }); F.slot = 0; F.fb = ''; F.fbOk = false; F.neueAnsicht = true;
}
// Handschrift: Zeichen aus Fingerstrichen erkennen ($P-Punktwolken-Erkenner, Vatavu u. a. 2012).
// Striche werden nach ihrer Breite zu Zeichen gruppiert (was sich waagerecht überlappt, gehört zusammen),
// jedes Zeichen wird mit Vorlagen verglichen. Vorlagen: y = m x + b, die Ziffern 0 bis 5 und ein paar Ablenker (c, a, n, −).
var HS = (function () {
  var N = 32;
  function pfad(st) { // Striche → Punkte mit Strichnummer
    var p = [];
    st.forEach(function (s, i) { s.forEach(function (q) { p.push({ x: q[0], y: q[1], id: i }); }); });
    return p;
  }
  function laenge(p) { var d = 0; for (var i = 1; i < p.length; i++) if (p[i].id === p[i - 1].id) d += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); return d; }
  function neu(p) {
    var I = laenge(p) / (N - 1), D = 0, r = [p[0]], q = p.slice();
    for (var i = 1; i < q.length; i++) {
      if (q[i].id !== q[i - 1].id) continue;
      var d = Math.hypot(q[i].x - q[i - 1].x, q[i].y - q[i - 1].y);
      if (D + d >= I && d > 0) {
        var t = (I - D) / d, n = { x: q[i - 1].x + t * (q[i].x - q[i - 1].x), y: q[i - 1].y + t * (q[i].y - q[i - 1].y), id: q[i].id };
        r.push(n); q.splice(i, 0, n); D = 0;
      } else D += d;
    }
    while (r.length < N) r.push({ x: q[q.length - 1].x, y: q[q.length - 1].y, id: q[q.length - 1].id });
    return r.slice(0, N);
  }
  function normal(p) {
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, cx = 0, cy = 0;
    p.forEach(function (q) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); });
    var s = Math.max(x1 - x0, y1 - y0) || 1;
    p = p.map(function (q) { return { x: (q.x - x0) / s, y: (q.y - y0) / s, id: q.id }; });
    p.forEach(function (q) { cx += q.x / p.length; cy += q.y / p.length; });
    return p.map(function (q) { return { x: q.x - cx, y: q.y - cy, id: q.id }; });
  }
  function wolke(st) { return normal(neu(pfad(st))); }
  function abstand(a, b, start) {
    var frei = [], sum = 0, i = start;
    do {
      var best = Infinity, k = -1;
      for (var j = 0; j < b.length; j++) if (!frei[j]) { var d = Math.hypot(a[i].x - b[j].x, a[i].y - b[j].y); if (d < best) { best = d; k = j; } }
      frei[k] = true; sum += (1 - ((i - start + N) % N) / N) * best; i = (i + 1) % N;
    } while (i !== start);
    return sum;
  }
  function vergleich(a, b) {
    var m = Infinity, step = Math.floor(Math.pow(N, 0.5));
    for (var i = 0; i < N; i += step) m = Math.min(m, abstand(a, b, i), abstand(b, a, i));
    return m;
  }
  // Grundformen im Kasten: x nach rechts, y nach unten; Kleinbuchstaben zwischen 40 und 100, Oberlänge ab 0, Unterlänge bis 140
  var FORMEN = {
    y: [[[[0, 40], [4, 75], [20, 98], [38, 95], [52, 75], [56, 40], [55, 90], [50, 120], [36, 138], [16, 140], [4, 130]]],
        [[[0, 40], [28, 92]], [[56, 40], [28, 92], [8, 140]]],
        [[[0, 40], [28, 92]], [[56, 40], [8, 140]]]],
    '=': [[[[0, 55], [60, 55]], [[0, 85], [60, 85]]]],
    m: [[[[0, 40], [0, 100], [0, 62], [8, 46], [18, 40], [26, 46], [28, 62], [28, 100], [28, 62], [36, 46], [46, 40], [54, 46], [56, 62], [56, 100]]],
        [[[0, 100], [0, 42], [0, 60], [9, 44], [18, 40], [26, 46], [28, 60], [28, 100], [29, 60], [37, 44], [46, 40], [54, 46], [56, 60], [56, 100]]]],
    x: [[[[0, 40], [52, 100]], [[52, 40], [0, 100]]]],
    '+': [[[[28, 40], [28, 100]], [[-2, 70], [58, 70]]]],
    b: [[[[0, 0], [0, 100], [0, 72], [10, 56], [26, 50], [42, 58], [50, 76], [44, 94], [26, 100], [10, 98], [0, 92]]],
        [[[0, 0], [0, 100]], [[0, 64], [16, 52], [34, 52], [48, 66], [48, 86], [34, 100], [14, 100], [0, 92]]]],
    c: [[[[50, 50], [32, 40], [12, 46], [0, 68], [8, 92], [28, 100], [50, 92]]]],
    a: [[[[48, 52], [30, 40], [10, 48], [0, 72], [10, 96], [30, 100], [46, 86], [48, 40], [48, 94], [56, 100]]]],
    n: [[[[0, 40], [0, 100], [0, 62], [10, 46], [24, 40], [36, 46], [40, 62], [40, 100]]]],
    '0': [[[[25, 0], [6, 12], [0, 50], [6, 88], [25, 100], [44, 88], [50, 50], [44, 12], [25, 0]]]],
    '1': [[[[8, 22], [30, 0], [30, 100]]]],
    '2': [[[[0, 22], [14, 3], [34, 0], [48, 14], [44, 40], [0, 100], [52, 100]]]],
    '3': [[[[0, 12], [16, 0], [36, 2], [46, 16], [40, 36], [20, 48], [42, 58], [50, 78], [40, 95], [20, 100], [0, 92]]]],
    '4': [[[[32, 0], [0, 66], [54, 66]], [[38, 28], [38, 100]]]],
    '5': [[[[46, 0], [8, 0], [4, 42], [25, 36], [45, 48], [50, 72], [38, 95], [15, 100], [0, 90]]],
          [[[8, 0], [4, 42], [25, 36], [45, 48], [50, 72], [38, 95], [15, 100], [0, 90]], [[8, 0], [48, 0]]]],
    '−': [[[[0, 70], [60, 70]]]]
  };
  var VORLAGEN = [];
  Object.keys(FORMEN).forEach(function (z) {
    FORMEN[z].forEach(function (f) {
      [-0.25, 0, 0.25].forEach(function (sch) {
        [0.8, 1, 1.2].forEach(function (hy) {
          var st = f.map(function (s) { return s.map(function (q) { return [q[0] - sch * q[1], q[1] * hy]; }); });
          VORLAGEN.push({ z: z, n: f.length, w: wolke(st) });
        });
      });
    });
  });
  // Striche zu Zeichen gruppieren: überlappen sie sich waagerecht deutlich, gehören sie zusammen
  function gruppen(striche) {
    var s = striche.filter(function (st) {   // Tupfer ohne Länge zählen nicht
      var l = 0; for (var i = 1; i < st.length; i++) l += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]);
      return l > 5;
    }).map(function (st) {
      var xs = st.map(function (q) { return q[0]; });
      return { st: st, a: Math.min.apply(null, xs), b: Math.max.apply(null, xs) };
    }).sort(function (u, v) { return u.a - v.a; });
    var g = [];
    s.forEach(function (t) {
      var h = g[g.length - 1];
      if (h) {
        var ueber = Math.min(h.b, t.b) - Math.max(h.a, t.a), schmal = Math.max(6, Math.min(h.b - h.a, t.b - t.a));
        if (ueber > -3 && ueber >= 0.3 * schmal - 3) { h.st.push(t.st); h.a = Math.min(h.a, t.a); h.b = Math.max(h.b, t.b); return; }
      }
      g.push({ st: [t.st], a: t.a, b: t.b });
    });
    return g;
  }
  function zeichen(st) {
    var w = wolke(st), best = Infinity, z = '?', gleich = VORLAGEN.filter(function (v) { return v.n === st.length; });
    (gleich.length ? gleich : VORLAGEN).forEach(function (v) { var d = vergleich(w, v.w); if (d < best) { best = d; z = v.z; } });
    return { z: best < 3 ? z : '?', d: best };   // zu weit von allen Vorlagen: unleserlich
  }
  return {
    lesen: function (striche) { return gruppen(striche).map(function (g) { return zeichen(g.st); }); },
    gruppen: gruppen
  };
})();
// Level mit handschrift (Taxi): oben Grundgebühr g und Preis pro km p. Erst die Geradengleichung y = px + g mit dem
// Finger ins Feld schreiben (die App liest mit), dann drei Fahrten ausrechnen. g und p stecken in F.lines[0]:
// a = (0|g), b = (1|g + p); F.runde 0 ist die Gleichung, 1 bis 3 die Fahrten.
var TAXI_KM = [2, 5, 10];
// Taxi-Grafik: nur die positiven Achsen, x Strecke (0 bis 10), y Preis, so skaliert, dass alle Fahrten ins Bild passen.
// Die Gerade erst, wenn die Gleichung stimmt; beantwortete Fahrten als lila Punkte mit Preis.
function taxiGrafik(ctx) {
  var hud = document.getElementById('hud'), w = taxiW(), t = taxiGP();
  var oben = (hud && hud.firstChild ? hud.getBoundingClientRect().bottom : 60) + 34;
  var unten = (schreib && !schreib.hidden ? schreib.getBoundingClientRect().top : S.h - (S.unten || 70) - 130) - 34;
  var links = 50, rechts = S.w - 30;
  if (unten - oben < 80) return;
  var XM = 10, ymax = (t.g + t.p * XM) * w.f, st = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000].filter(function (s) { return ymax / s <= 7; })[0];
  var YM = Math.ceil(ymax / st) * st;
  function px(x) { return links + x / XM * (rechts - links); }
  function py(y) { return unten - y / YM * (unten - oben); }
  ctx.save(); ctx.font = '400 11px ' + C.FONT; ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(56,41,26,0.13)'; ctx.lineWidth = 1; ctx.beginPath();
  for (var x = 1; x <= XM; x++) { ctx.moveTo(px(x), py(0)); ctx.lineTo(px(x), py(YM)); }
  for (var y = st; y <= YM; y += st) { ctx.moveTo(px(0), py(y)); ctx.lineTo(px(XM), py(y)); }
  ctx.stroke();
  // Achsen mit Pfeilspitze
  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath();
  ctx.moveTo(px(0), py(0)); ctx.lineTo(rechts + 14, py(0)); ctx.moveTo(px(0), py(0)); ctx.lineTo(px(0), oben - 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rechts + 18, py(0)); ctx.lineTo(rechts + 10, py(0) - 4); ctx.lineTo(rechts + 10, py(0) + 4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(px(0), oben - 18); ctx.lineTo(px(0) - 4, oben - 10); ctx.lineTo(px(0) + 4, oben - 10); ctx.fill();
  ctx.fillStyle = 'rgba(56,41,26,0.65)'; ctx.textAlign = 'center';
  for (x = 0; x <= XM; x += 2) ctx.fillText(String(x), px(x), py(0) + 12);
  ctx.textAlign = 'right';
  for (y = st; y <= YM; y += st) ctx.fillText(String(y), px(0) - 6, py(y));
  // Achsentitel: Strecke orange (rein), Preis lila (raus)
  ctx.font = '400 14px ' + C.FONT; ctx.fillStyle = REIN; ctx.textAlign = 'right'; ctx.fillText('x (' + w.e + ')', rechts + 14, py(0) - 12);
  ctx.fillStyle = RAUS; ctx.textAlign = 'left'; ctx.fillText('y (' + w.z + ')', px(0) + 8, oben - 12);
  if (F.runde || F.fn) {
    var x2 = Math.min(XM, (YM - t.g * w.f) / (t.p * w.f));
    ctx.save(); ctx.beginPath(); ctx.rect(px(0), oben - 20, rechts - px(0) + 20, unten - oben + 20); ctx.clip();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(px(0), py(t.g * w.f)); ctx.lineTo(px(x2), py((t.g + t.p * x2) * w.f)); ctx.stroke(); ctx.restore();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(px(0), py(t.g * w.f), 5, 0, 7); ctx.fill();
    var fertig = F.fn ? TAXI_KM.length : F.runde - 1;
    for (var i = 0; i < fertig; i++) {
      var km = TAXI_KM[i], P = [px(km), py((t.g + t.p * km) * w.f)];
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(56,41,26,0.5)'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(P[0], py(0)); ctx.lineTo(P[0], P[1]); ctx.lineTo(px(0), P[1]); ctx.stroke(); ctx.restore();
      ctx.fillStyle = RAUS; ctx.beginPath(); ctx.arc(P[0], P[1], 5, 0, 7); ctx.fill();
      ctx.font = '400 13px ' + C.FONT; ctx.textAlign = 'right';   // links oberhalb: dort liegt die steigende Gerade nicht
      ctx.fillText(geld(t.g + t.p * km), P[0] - 9, P[1] - 9);
    }
  }
  ctx.restore();
}
function taxiGP() { var l = F.lines[0]; return l ? { g: -Math.round(l.a[1] / U), p: -Math.round(l.b[1] / U) + Math.round(l.a[1] / U) } : { g: 3, p: 2 }; }
// Währung und Strecke je nach Sprache: Englisch Dollar und Meilen, Japanisch Yen (Beträge mal 100), sonst km
var TAXI_GELD = { en: { z: '$', vor: true, e: 'mi' }, tr: { z: '₺' }, ja: { z: '円', f: 100, eng: true }, ar: { z: 'ريال' } };
function taxiW() { var w = TAXI_GELD[App.sprache()] || {}; return { z: w.z || '€', vor: !!w.vor, e: w.e || 'km', f: w.f || 1, eng: !!w.eng }; }
function geld(v) { var w = taxiW(), n = v * w.f; return w.vor ? w.z + n : n + (w.eng ? '' : ' ') + w.z; }
function taxiGl() { var t = taxiGP(), f = taxiW().f; return eqStr({ m: t.p * f, b: t.g * f }); }
var TAXI_TEXT = {
  frage: function (km) {
    var K = '<span class="rein">' + km + ' ' + taxiW().e + '</span>';
    return { de: 'Was kostet eine Fahrt über ' + K + '?', en: 'What does a ride of ' + K + ' cost?', fi: 'Paljonko maksaa ' + K + ':n matka?',
             tr: K + '’lik yolculuk ne kadar?', fr: 'Combien coûte un trajet de ' + K + ' ?', es: '¿Cuánto cuesta un viaje de ' + K + '?',
             ja: K + ' の料金はいくら？', ar: 'كم تكلف رحلة طولها <bdi dir="ltr">' + K + '</bdi>؟' };
  },
  einsetzen: function (km) {
    var X = '<bdi dir="ltr"><span class="rein">x</span> = <span class="rein">' + km + '</span></bdi>';
    return { de: 'Nicht ganz. Setze ' + X + ' in die Gleichung ein.', en: 'Not quite. Put ' + X + ' into the equation.',
             fi: 'Ei aivan. Sijoita ' + X + ' yhtälöön.', tr: 'Tam değil. Denklemde ' + X + ' koy.',
             fr: 'Pas tout à fait. Remplace ' + X + ' dans l’équation.', es: 'Casi. Pon ' + X + ' en la ecuación.',
             ja: 'おしい。式に ' + X + ' を入れよう。', ar: 'ليس تمامًا. ضع ' + X + ' في المعادلة.' };
  }
};
function taxiKarte() {
  var t = taxiGP(), km = TAXI_KM[F.runde - 1], a = t.g + t.p * km;
  if (!F.taxiOpts) F.taxiOpts = options(a, [a + t.p, a - t.p, t.p * km, t.g + km, t.g * km, (t.g + t.p) * km]);
  var gl = taxiGl().replace(/^y/, '<span class="raus">y</span>').replace('x', '<span class="rein">x</span>');
  schreib.innerHTML = '<div class="steig zp"><bdi dir="ltr" class="mbgl">' + gl + '</bdi><span class="stand">' + F.runde + ' / ' + TAXI_KM.length + '</span></div>' +
    '<p class="fb">' + App.wahl(TAXI_TEXT.frage(km)) + '</p>' +
    '<div class="opts">' + F.taxiOpts.map(function (v) { return '<button class="opt" data-act="taxi" data-v="' + v + '"><bdi dir="ltr">' + geld(v) + '</bdi></button>'; }).join('') + '</div>' +
    (F.fb ? '<p class="fb' + (F.fbOk ? ' ok' : '') + '"' + (F.fbRot ? ' style="color: var(--red)"' : '') + '>' + App.wahl(F.fb) + '</p>' : '');
}
function taxiAntwort(v) {
  var t = taxiGP(), km = TAXI_KM[F.runde - 1];
  if (v !== t.g + t.p * km) { F.fb = TAXI_TEXT.einsetzen(km); F.fbOk = false; F.fbRot = true; return; }
  F.fbRot = false; F.taxiOpts = null;
  if (F.runde < TAXI_KM.length) { F.runde++; F.fb = RICHTIG; F.fbOk = true; }
  else { F.fn = true; F.fb = ''; }
}
var HS_TEXT = {
  falsch: { de: 'Nicht ganz. m ist der Preis pro Kilometer, b die Grundgebühr.',
            en: 'Not quite. m is the price per mile, b the base fare.',
            fi: 'Ei aivan. m on kilometrihinta, b perusmaksu.',
            tr: 'Tam değil. m kilometre başına ücret, b açılış ücreti.',
            fr: 'Pas tout à fait. m est le prix par kilomètre, b la prise en charge.',
            es: 'Casi. m es el precio por kilómetro, b la bajada de bandera.',
            ja: 'おしい。m は1キロごとの料金、b は基本料金です。',
            ar: 'ليس تمامًا. m هو سعر الكيلومتر، وb هو الأجرة الأساسية.' },
  unklar: { de: 'Ich kann nicht alles lesen. Schreib die Zeichen etwas größer und mit Abstand.',
            en: 'I can’t read everything. Write the symbols a bit bigger and with gaps.',
            fi: 'En saa kaikesta selvää. Kirjoita merkit vähän isommin ja välejä jättäen.',
            tr: 'Hepsini okuyamıyorum. Karakterleri biraz daha büyük ve aralıklı yaz.',
            fr: 'Je n’arrive pas à tout lire. Écris les signes un peu plus grands et espacés.',
            es: 'No puedo leerlo todo. Escribe los signos un poco más grandes y separados.',
            ja: 'ぜんぶは読めません。文字を少し大きく、間をあけて書こう。',
            ar: 'لا أستطيع قراءة كل شيء. اكتب الرموز أكبر قليلًا وبمسافات بينها.' }
};
function hsGelesen() {
  return HS.lesen(F.hs).map(function (c) {
    if (c.z === 'y') return '<span class="raus">y</span>';
    if (c.z === 'x') return '<span class="rein">x</span>';
    return c.z === '=' || c.z === '+' || c.z === '−' ? ' ' + c.z + ' ' : c.z;
  }).join('');
}
function hsZeichnen(pad) {
  var ctx = pad.getContext('2d'), r = window.devicePixelRatio || 1, w = pad.clientWidth, h = pad.clientHeight;
  if (pad.width !== Math.round(w * r)) { pad.width = Math.round(w * r); pad.height = Math.round(h * r); }
  ctx.setTransform(r, 0, 0, r, 0, 0); ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(56,41,26,0.18)'; ctx.lineWidth = 1;   // Schreiblinie
  ctx.beginPath(); ctx.moveTo(10, h * 0.68); ctx.lineTo(w - 10, h * 0.68); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  F.hs.forEach(function (st) {
    ctx.beginPath(); ctx.moveTo(st[0][0], st[0][1]);
    st.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
    if (st.length === 1) ctx.lineTo(st[0][0] + 0.1, st[0][1]);
    ctx.stroke();
  });
}
function hsFb() {
  var p = schreib.querySelector('.hsfb');
  if (p) p.outerHTML = F.fb ? '<p class="fb hsfb" style="color: var(--red)">' + App.wahl(F.fb) + '</p>' : '<p class="hsfb" hidden></p>';
}
function hsKarte() { return F.runde > 0 ? taxiKarte() : hsPad(''); }
// Schreibfeld mit ↶ und Prüfen (Taxi und zweipunkt 'hand'); oben rechts optional der Stand
function hsPad(stand) {
  var pad = schreib.querySelector('canvas.pad');
  if (pad) {   // das Feld bleibt stehen, nur Gelesenes und Hinweis neu
    schreib.querySelector('.gelesen').innerHTML = '<bdi dir="ltr">' + hsGelesen() + '</bdi>';
    schreib.querySelector('.pruefen').textContent = App.wahl(PRUEFEN);   // falls die Sprache gewechselt wurde
    hsFb(); hsZeichnen(pad); return;
  }
  schreib.innerHTML = '<div class="padrahmen"><canvas class="pad"></canvas>' + (stand || '') + '</div><p class="gelesen"></p>' +   // Stand oben rechts im Feld
    '<div class="hsknoepfe"><button class="opt hsweg" data-act="hsweg" aria-label="↶">↶</button>' +
    '<button class="opt pruefen" data-act="pruefen">' + App.wahl(PRUEFEN) + '</button></div><p class="hsfb" hidden></p>';
  pad = schreib.querySelector('canvas.pad');
  var st = null;
  function pos(e) { var b = pad.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; }
  pad.addEventListener('pointerdown', function (e) {
    e.preventDefault(); pad.setPointerCapture(e.pointerId);
    st = [pos(e)]; F.hs.push(st);
    if (F.fb) { F.fb = ''; hsFb(); }   // ein falscher Versuch verschwindet beim Weiterschreiben
    hsZeichnen(pad);
  });
  pad.addEventListener('pointermove', function (e) { if (!st) return; e.preventDefault(); st.push(pos(e)); hsZeichnen(pad); });
  function ende() { if (!st) return; st = null; hsPad(stand); }
  pad.addEventListener('pointerup', ende); pad.addEventListener('pointercancel', ende);
  hsPad(stand);
}
// Gelesene Zeichen als Gleichung y = mx + b in beliebiger Reihenfolge (y = b + mx); null, wenn es keine ist
function hsGleichung(z) {
  var r = z.replace(/−/g, '-'), m = 0, b = 0, hatX = false, hatB = false;
  if (r.slice(0, 2) !== 'y=' || r.length < 3) return null;
  r = r.slice(2);
  var t = r.match(/[+-]?[^+-]+/g) || [];
  if (t.join('') !== r) return null;
  for (var i = 0; i < t.length; i++) {
    var q = t[i].match(/^([+-]?)(\d*)(x?)$/);
    if (!q || (!q[2] && !q[3])) return null;
    var v = (q[1] === '-' ? -1 : 1) * (q[2] ? Number(q[2]) : 1);
    if (q[3]) { if (hatX) return null; hatX = true; m = v; }
    else { if (hatB) return null; hatB = true; b = v; }
  }
  return { m: m, b: b };
}
function hsZeichenkette() { return HS.lesen(F.hs).map(function (c) { return c.z; }).join(''); }
// zweipunkt 'hand': die geschriebene Gleichung mit der gezeichneten Geraden vergleichen
var ZPH = {
  form: { de: 'Schreib die Gleichung so: y = mx + b.', en: 'Write the equation like this: y = mx + b.',
          fi: 'Kirjoita yhtälö näin: y = mx + b.', tr: 'Denklemi şöyle yaz: y = mx + b.',
          fr: 'Écris l’équation ainsi : y = mx + b.', es: 'Escribe la ecuación así: y = mx + b.',
          ja: '式はこう書こう：y = mx + b。', ar: 'اكتب المعادلة هكذا: ⁦y = mx + b⁩.' },
  m: { de: 'm stimmt nicht. Geh 1 nach rechts: Um wie viel geht die Gerade hoch oder runter?',
       en: 'm is not right. Go 1 to the right: how much does the line go up or down?',
       fi: 'm ei täsmää. Mene 1 oikealle: kuinka paljon suora nousee tai laskee?',
       tr: 'm yanlış. 1 sağa git: doğru ne kadar yukarı ya da aşağı gidiyor?',
       fr: 'm n’est pas juste. Avance de 1 vers la droite : de combien la droite monte-t-elle ou descend-elle ?',
       es: 'm no está bien. Avanza 1 a la derecha: ¿cuánto sube o baja la recta?',
       ja: 'm が合っていません。右へ1進むと、直線はいくつ上がる？下がる？',
       ar: 'm غير صحيح. تحرك 1 إلى اليمين: كم يصعد المستقيم أو ينزل؟' },
  b: { de: 'b stimmt nicht. Wo kreuzt die Gerade die y-Achse?', en: 'b is not right. Where does the line cross the y-axis?',
       fi: 'b ei täsmää. Missä suora leikkaa y-akselin?', tr: 'b yanlış. Doğru y eksenini nerede kesiyor?',
       fr: 'b n’est pas juste. Où la droite coupe-t-elle l’axe des y ?', es: 'b no está bien. ¿Dónde corta la recta el eje y?',
       ja: 'b が合っていません。直線は y 軸のどこを通る？', ar: 'b غير صحيح. أين يقطع المستقيم محور y؟' }
};
function zpHandPruefen() {
  var z = hsZeichenkette(), p = zpP(F.lines[F.runde]), g = hsGleichung(z);
  if (!z) return;
  if (z.indexOf('?') >= 0) F.fb = HS_TEXT.unklar;
  else if (!g) F.fb = ZPH.form;
  else if (g.m !== p.y2 - p.y1) F.fb = ZPH.m;
  else if (g.b !== p.y1) F.fb = ZPH.b;
  else {
    F.hs = []; F.fbRot = false;
    if (F.runde < F.lines.length - 1) { F.zpZeig = true; F.fb = RICHTIG; F.fbOk = true; }
    else { F.fn = true; F.fb = ''; }
    return;
  }
  F.fbOk = false;
}
function hsPruefen() {
  var f = taxiW().f, z = hsZeichenkette(), t = taxiGP(), g = hsGleichung(z);
  if (!z) return;
  if (z.indexOf('?') >= 0) F.fb = HS_TEXT.unklar;
  else if (g && g.m === t.p * f && g.b === t.g * f) { F.runde = 1; F.hs = []; F.fb = RICHTIG; F.fbOk = true; F.fbRot = false; }   // weiter zu den Fahrten
  else F.fb = HS_TEXT.falsch;
}
// Level mit nullfrage: welche Zahl muss in die Maschine der Geraden, damit der Punkt auf der y-Achse herauskommt?
function nullFalschFB(w, y) {
  var P = '<bdi dir="ltr">(<span class="rein">' + fmt(w) + '</span>|<span class="raus">' + fmt(y) + '</span>)</bdi>';
  return { de: 'Nicht ganz. Mit ' + fmt(w) + ' kommt ' + fmt(y) + ' heraus, das ist der Punkt ' + P + '. Er liegt nicht auf der y-Achse. Auf der y-Achse ist x immer 0.',
           en: 'Not quite. With ' + fmt(w) + ', out comes ' + fmt(y) + ': the point ' + P + '. It is not on the y-axis. On the y-axis, x is always 0.',
           fi: 'Ei aivan. Luvulla ' + fmt(w) + ' ulos tulee ' + fmt(y) + ', eli piste ' + P + '. Se ei ole y-akselilla. y-akselilla x on aina 0.',
           tr: 'Tam değil. ' + fmt(w) + ' ile ' + fmt(y) + ' çıkar, bu ' + P + ' noktası. y ekseninde değil. y ekseninde x her zaman 0’dır.',
           fr: 'Pas tout à fait. Avec ' + fmt(w) + ', on obtient ' + fmt(y) + ' : le point ' + P + '. Il n’est pas sur l’axe des y. Sur l’axe des y, x vaut toujours 0.',
           es: 'Casi. Con ' + fmt(w) + ' sale ' + fmt(y) + ': el punto ' + P + '. No está en el eje y. En el eje y, x siempre vale 0.',
           ja: 'おしい。' + fmt(w) + ' を入れると ' + fmt(y) + ' が出て、点 ' + P + ' になります。y 軸の上にはありません。y 軸の上では x はいつも 0 です。',
           ar: 'ليس تمامًا. مع ' + fmt(w) + ' يخرج ' + fmt(y) + '، وهي النقطة ' + P + '. إنها ليست على محور y. على محور y يكون x دائمًا 0.' };
}
function nullKarte() {
  // nur die Zahlentasten (die gewählte in Orange) und Prüfen; nach einer falschen Zahl der Hinweis in Rot
  var keys = '';
  for (var d = -4; d <= 4; d++) keys += '<button class="key' + (F.ein[0] === fmt(d) ? ' sel' : '') + '" data-act="ziffer" data-n="' + d + '">' + fmt(d) + '</button>';
  var falsch = F.nullFalsch !== null && F.nullFalsch !== undefined;
  schreib.innerHTML = '<div class="keys reihe neun">' + keys + '</div><button class="opt pruefen" data-act="pruefen">' + App.wahl(PRUEFEN) + '</button>' +
    (F.fb ? '<p class="fb"' + (falsch ? ' style="color: var(--red)"' : '') + '>' + App.wahl(F.fb) + '</p>' : '');
}
function nullPruefen() {
  var h = fNull(), w = Number(F.ein[0].replace('−', '-'));
  if (F.ein[0] === '') return;   // noch keine Zahl gewählt
  if (w === 0) { F.fn = true; F.fb = ''; F.nullFalsch = null; return; }
  F.nullFalsch = w; F.fb = nullFalschFB(w, h.m * w + h.b); F.neueAnsicht = true;
}
function herlSchritt() {
  if (F.phase < 5) F.phase++;
  else { F.runde++; F.phase = 6; F.ein = ['', '']; F.slot = 0; F.fb = ''; }
  F.neueAnsicht = true;
}
function herlPruefen() {
  var h = fHerl(), w = F.ein.map(function (s) { return Number(s.replace('−', '-')); });
  F.fbOk = false;
  if (F.ein.some(function (s) { return s === ''; })) { F.fb = ALLE; return; }
  if (w[0] !== h.m) { F.fb = HERL.m; return; }
  if (w[1] !== h.b) { F.fb = HERL.b; return; }
  if (F.runde < F.lines.length - 1) { F.runde++; F.ein = ['', '']; F.slot = 0; F.fb = STEIG_FB.weiter; F.fbOk = true; F.neueAnsicht = true; }
  else { F.fn = true; F.fb = ''; }
}
function schreibClick(e) {
  var b = e.target.closest ? e.target.closest('button') : null;
  if (!b) return;
  var act = b.getAttribute('data-act');
  if (act === 'slot') F.slot = Number(b.getAttribute('data-i'));
  else if (act === 'ziffer') { F.ein[F.slot] = fmt(Number(b.getAttribute('data-n'))); F.slot = Math.min(F.ein.length - 1, F.slot + 1); F.fb = ''; F.fbOk = false; F.fbRot = false; F.nullFalsch = null; }
  else if (act === 'pruefen' && FLEVELS[F.level].steigung) steigPruefen();
  else if (act === 'pruefen' && FLEVELS[F.level].herleitung) herlPruefen();
  else if (act === 'pruefen' && FLEVELS[F.level].nullfrage) nullPruefen();
  else if (act === 'pruefen' && zpArt() === 'hand') zpHandPruefen();
  else if (act === 'pruefen' && FLEVELS[F.level].zweipunkt) zpPruefen();
  else if (act === 'pruefen' && FLEVELS[F.level].handschrift) hsPruefen();
  else if (act === 'hsweg') { F.hs.pop(); F.fb = ''; }
  else if (act === 'taxi') taxiAntwort(Number(b.getAttribute('data-v')));
  else if (act === 'schritt' && FLEVELS[F.level].zweipunkt) zpWeiter();
  else if (act === 'schritt') herlSchritt();
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
  if (F.neueAnsicht) { F.neueAnsicht = false; if (FLEVELS[F.level].zweipunkt) zpAnsicht(); else steigAnsicht(); }
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

// Falsch: rote Karte unten wie die grüne, mit ↻. Nach ein paar Sekunden (oder beim Antippen) beginnt das Level neu.
var falschKarte = null, falschUhr = null;
function falschWeg() {
  clearTimeout(falschUhr); falschUhr = null;
  if (falschKarte) falschKarte.hidden = true;
  document.body.classList.remove('falschkarte');
}
function falsch(text) {
  M.falsch = true; M.fb = '';
  if (!falschKarte) {
    falschKarte = document.createElement('div');
    falschKarte.id = 'falsch'; falschKarte.setAttribute('aria-live', 'polite');
    var hud = document.getElementById('hud');
    hud.parentNode.insertBefore(falschKarte, hud.nextSibling);
    falschKarte.addEventListener('click', function () { if (M && M.falsch) machStart(F.level); });
  }
  falschKarte.innerHTML = '<span></span><button class="weiter" aria-label="↻"><svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M18.5 12a6.5 6.5 0 1 1-2-4.7"/><path d="M17 3.5v4h-4"/></svg></button>';
  falschKarte.firstChild.textContent = App.wahl(text);
  falschKarte.style.bottom = ((S.unten || 70) + 8) + 'px';
  falschKarte.hidden = false;
  document.body.classList.add('falschkarte');
  clearTimeout(falschUhr);
  falschUhr = setTimeout(function () { if (M && M.falsch) machStart(F.level); }, 3500);
}
function machStart(n) {
  falschWeg();
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
  if (!isM) falschWeg();
  ['b-point', 'b-line', 'b-undo', 'b-view'].forEach(function (id) { document.getElementById(id).hidden = isM; });
  if (isM) document.getElementById('b-clear').hidden = false;
  if (isM) { machStart(n); mach.scrollTop = 0; }
}
function machClick(e) {
  var b = e.target.closest ? e.target.closest('button') : null;
  if (!b || !M || M.done || M.falsch || !isMach(FLEVELS[F.level])) return;
  FLEVELS[F.level].click(M, b.getAttribute('data-act'), {
    n: Number(b.getAttribute('data-n')), v: Number(b.getAttribute('data-v')), i: Number(b.getAttribute('data-i'))
  });
  machRender();
}

App.funk = {
  taxi: function () { var t = taxiGP(); return { g: geld(t.g), p: geld(t.p) }; }, taxiGl: function () { return taxiGl(); },
  ARROW: ARROW, rnd: rnd, shuffle: shuffle, options: options, keypad: keypad, optButtons: optButtons,
  f: f, finish: finish, falsch: falsch, M: function () { return M; }
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
