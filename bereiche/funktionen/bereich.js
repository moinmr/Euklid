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
  if (!b || !M || M.done) return;
  FLEVELS[F.level].click(M, b.getAttribute('data-act'), {
    n: Number(b.getAttribute('data-n')), v: Number(b.getAttribute('data-v')), i: Number(b.getAttribute('data-i'))
  });
  machRender();
}

App.funk = {
  ARROW: ARROW, rnd: rnd, shuffle: shuffle, options: options, keypad: keypad, optButtons: optButtons,
  f: f, finish: finish, M: function () { return M; }
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
