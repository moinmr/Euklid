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
    pts: sn.pts.map(function (p) { return { x: p.x, y: p.y, gid: p.gid }; }),
    lines: sn.lines.map(function (l) { return { a: l.a.slice(), b: l.b.slice(), gid: l.gid }; })
  };
}
function fnow() { return fcopy({ pts: F.pts, lines: F.lines }); }
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
  F.lines.forEach(function (l) {
    ctx.strokeStyle = BLUE; extLine(ctx, l.a, l.b, 2.5 * ws * k);
    ctx.fillStyle = BLUE; dotAt(ctx, l.a, false); dotAt(ctx, l.b, false);
  });
  F.pts.forEach(function (p) {
    ctx.fillStyle = BLUE; dotAt(ctx, [p.x * U, -p.y * U], false, 5);
    text(ctx, '(' + fmt(p.x) + '|' + fmt(p.y) + ')', p.x * U + 24 * k, -p.y * U - 13 * k, BLUE, 12);
  });
  // Vorschau
  ctx.fillStyle = BLUE; ctx.strokeStyle = BLUE;
  if (S.ls) dotAt(ctx, vp(S.ls), true);
  if (S.drawing && S.end) {
    var e = S.target ? vp(S.target) : S.end;
    if (S.tool === 'line' && S.lmode === 'end' && S.ls && Math.hypot(e[0] - S.ls.x, e[1] - S.ls.y) > 1) {
      ctx.globalAlpha = 0.55; extLine(ctx, vp(S.ls), e, 2 * ws * k); ctx.globalAlpha = 1;
    }
    ctx.fillStyle = BLUE; dotAt(ctx, e, true);
    if (S.target) mark(ctx, S.target);
  }
}

// Tabelle bzw. Punkteliste unten rechts über den Werkzeugen (Bildschirmkoordinaten)
function drawTable(ctx) {
  var lv = FLEVELS[F.level];
  if (!lv || isMach(lv)) return;
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

function fTarget(pos) { return S.tool === 'point' ? fLattice(pos) : fSnap(pos); }
function fDown(pos) {
  S.drawing = true; S.lmode = S.ls ? 'end' : 'start';
  S.end = [pos[0], pos[1]]; S.target = fTarget(pos);
  S.loupe = S.sp; render();
  return true;
}
function fMove(pos) {
  if (S.drawing) { S.end = [pos[0], pos[1]]; S.target = fTarget(pos); }
  S.loupe = S.sp; render();
  return true;
}
function fUp(pos) {
  if (S.drawing) {
    var b = S.target ? vp(S.target) : S.end;
    if (S.tool === 'point') {
      var px = Math.round(b[0] / U), py = -Math.round(b[1] / U);
      if (!fHas(px, py)) {
        F.gid += 1; F.pts.push({ x: px, y: py, gid: F.gid });
        var lv = FLEVELS[F.level];
        if (lv.eq && !F.lines.length && fNeed(lv).every(function (r) { return fHas(r[0], r[1]); })) App.setTool('line');
      }
    } else if (S.lmode === 'start') {
      S.ls = V(b);
    } else if (S.ls && Math.hypot(b[0] - S.ls.x, b[1] - S.ls.y) > 12 * S.k) {
      F.gid += 1;
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
function fCheck() {
  var lv = FLEVELS[F.level];
  if (isMach(lv)) return;
  var ok = fNeed(lv).every(function (r) { return fHas(r[0], r[1]); });
  if (ok && lv.eq) ok = F.lines.some(function (l) { return fLineOk(l, lv.eq); });
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
  F.level = n; F.pts = []; F.lines = []; F.gid = 0;
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
      F.pts = c.pts; F.lines = c.lines;
      F.gid = Math.max.apply(null, [0].concat(F.pts.map(function (p) { return p.gid; }), F.lines.map(function (l) { return l.gid; })));
    }
  }
  App.applyView();
  if (S.onLevel) S.onLevel(n, false);
  fCheck();
}
function fStore() { if (!isMach(FLEVELS[F.level]) && !F.solved.has(F.level)) F.work[F.level] = fnow(); }
function fUndo() {
  if (S.ls) { S.ls = null; render(); return; }
  var g = F.pts.map(function (p) { return p.gid; }).concat(F.lines.map(function (l) { return l.gid; }));
  if (!g.length) return;
  var last = Math.max.apply(null, g);
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
  var W = 340, H = 180, L = 30, R = 24, T = 24, B = 24, xmax = 10, ymax = M.max, i;
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
  s += '<text class="an raus" x="' + (px(0) + 7) + '" y="' + (py(ymax) - 2) + '">' + M.names[1] + '</text>';
  M.fed.forEach(function (p) {
    if (M.last && p.x === M.last.x) {
      s += '<line class="weg rein" x1="' + px(p.x) + '" y1="' + py(0) + '" x2="' + px(p.x) + '" y2="' + py(p.y) + '"/>';
      s += '<line class="weg raus" x1="' + px(0) + '" y1="' + py(p.y) + '" x2="' + px(p.x) + '" y2="' + py(p.y) + '"/>';
      s += '<circle class="pr" cx="' + px(p.x) + '" cy="' + py(0) + '" r="4"/><circle class="pa" cx="' + px(0) + '" cy="' + py(p.y) + '" r="4"/>';
    }
  });
  M.fed.forEach(function (p) {
    s += '<circle class="pt' + (!M.last || p.x === M.last.x ? ' neu' : '') + '" cx="' + px(p.x) + '" cy="' + py(p.y) + '" r="4.5"/>';
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
  },
  levels: function () { return FLEVELS; },
  solved: function () { return F.solved; },
  open: function () { fLoadLevel(F.level); },
  draw: function (ctx, ws) { if (!isMach(FLEVELS[F.level])) buildFunk(ctx, ws); },
  overlay: drawTable,
  down: fDown, move: fMove, up: fUp, check: fCheck,
  undo: fUndo, clear: fClear, next: fNext,
  persist: function () { fStore(); fSave(); },
  sprache: function () { if (M && !mach.hidden) machRender(); }
});
})();
