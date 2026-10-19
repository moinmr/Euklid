/* Bereich Euklid: Konstruieren mit Linie und Zirkel auf einer vorgegebenen Strecke AB.
   Die Level stehen in level/, ihre Reihenfolge in reihenfolge.js. Jedes Level bringt eine
   Prüfung pruefen(A, B, s, tol) mit und kann dafür die Hilfen in App.euklid benutzen. */
(function () {
'use strict';
var App = window.App, S = App.S, C = App.C;
var V = App.V, vp = App.vp, unit = App.unit, render = App.render;
var dotAt = App.dotAt, mark = App.mark, arcLine = App.arcLine, text = App.text;
var TAU = C.TAU, GRAB = C.GRAB;
var COMPASS_SNAP = true;
var STORE_KEY = 'euklid-fortschritt';
var OLD_STORE_KEY = 'euklid-fortschritt-v1';   // alter Stand nach Position, wird einmal übernommen
var LEVELS = [];

function distCm(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]) / C.CM; }

/* ===================== Hilfsfunktionen ===================== */
function vertices() {
  var seen = new Set(), out = [];
  S.edges.forEach(function (e) {
    [e.a, e.b].forEach(function (v) { if (!seen.has(v)) { seen.add(v); out.push(v); } });
  });
  return out;
}
function snap(pos, exclude, minDeg) {
  minDeg = minDeg || 1;
  var deg = new Map();
  if (minDeg > 1) {
    S.edges.forEach(function (e) {
      deg.set(e.a, (deg.get(e.a) || 0) + 1);
      deg.set(e.b, (deg.get(e.b) || 0) + 1);
    });
  }
  var best = null, bd = GRAB * S.k;
  vertices().forEach(function (v) {
    if (v === exclude) return;
    if ((deg.get(v) || 1) < minDeg) return;
    var d = Math.hypot(v.x - pos[0], v.y - pos[1]);
    if (d < bd) { best = v; bd = d; }
  });
  return best;
}
function csnap(pos, exclude) { return COMPASS_SNAP ? snap(pos, exclude) : null; }
function radiusAt(pos) {
  var tg = csnap(pos, S.cc);
  var q = tg ? vp(tg) : pos;
  var dx = q[0] - S.cc.x, dy = q[1] - S.cc.y;
  S.pa = Math.atan2(dy, dx);
  return Math.hypot(dx, dy);
}

/* ===================== Zeichnen ===================== */
function buildScene(ctx, ws) {
  var k = S.k;
  var adj = new Map(), vcol = new Map();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  S.edges.forEach(function (e) {
    if (!adj.has(e.a)) adj.set(e.a, []);
    if (!adj.has(e.b)) adj.set(e.b, []);
    adj.get(e.a).push(e.b); adj.get(e.b).push(e.a);
    if (!vcol.has(e.a)) vcol.set(e.a, e.col);
    if (!vcol.has(e.b)) vcol.set(e.b, e.col);
  });
  S.edges.forEach(function (e) {
    ctx.strokeStyle = e.col; ctx.lineWidth = 2.5 * ws * k;
    ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
  });
  S.circles.forEach(function (c) {
    ctx.strokeStyle = C.PENCIL_A;
    arcLine(ctx, vp(c.c), c.r, c.a0, c.sw, 1.1 * ws * k);
  });
  adj.forEach(function (nb, v) {
    ctx.fillStyle = vcol.get(v);
    dotAt(ctx, vp(v), v === S.active);
    if (nb.length === 2 && nb[0] !== nb[1]) {
      var u = unit(vp(v), vp(nb[0])), w = unit(vp(v), vp(nb[1]));
      var d = Math.max(-1, Math.min(1, u[0] * w[0] + u[1] * w[1]));
      var ang = Math.acos(d) * 180 / Math.PI;
      var bx = u[0] + w[0], by = u[1] + w[1], bn = Math.hypot(bx, by);
      if (bn < 1e-6) { bx = -u[1]; by = u[0]; bn = 1; }
      text(ctx, Math.round(ang) + '°', v.x + bx / bn * 32 * k, v.y + by / bn * 32 * k, vcol.get(v));
    }
  });
  if (S.target) mark(ctx, S.target);
  if (S.base) S.base.forEach(function (v, i) {
    // A und B: Name unter dem Punkt, weitere feste Punkte: Name in Verlängerung von A aus
    var o = i < 2 ? [0, 1] : unit(vp(S.base[0]), vp(v));
    if (v.name) text(ctx, v.name, v.x + o[0] * 17 * k, v.y + o[1] * 17 * k, C.INK, 14);
  });
}

function buildTemp(ctx, ws) {
  var k = S.k;
  ctx.lineCap = 'butt';
  if (S.tool === 'line') {
    ctx.strokeStyle = C.BLUE; ctx.fillStyle = C.BLUE;
    if (S.ls) dotAt(ctx, vp(S.ls), true);
    if (S.drawing && S.end) {
      if (S.lmode === 'end' && S.ls) {
        ctx.lineWidth = 2 * ws * k;
        ctx.beginPath(); ctx.moveTo(S.ls.x, S.ls.y); ctx.lineTo(S.end[0], S.end[1]); ctx.stroke();
      }
      dotAt(ctx, S.end, true);
      if (S.target) mark(ctx, S.target);
    }
  }
  if (S.tool === 'compass') {
    var m = S.cmode, c = null;
    ctx.fillStyle = C.PENCIL; ctx.strokeStyle = C.PENCIL;
    if (m === 'needle') c = S.target ? vp(S.target) : S.end;
    else if (m === 'center') { if (S.end) dotAt(ctx, S.end, true); }
    else if (S.cc) c = vp(S.cc);
    if (c) {
      ctx.fillStyle = C.PENCIL;
      dotAt(ctx, c, true);
      if (S.rad > 0) {
        var r = S.rad, pa = m === 'rotate' ? S.pa0 + S.sweep : S.pa;
        ctx.strokeStyle = '#ffffff';
        arcLine(ctx, c, r, 0, TAU, 1.6 * ws * k);
        if (m === 'rotate' && S.hi - S.lo > 0.01) {
          ctx.strokeStyle = C.PENCIL;
          arcLine(ctx, c, r, S.pa0 + S.lo, S.hi - S.lo, 1.1 * ws * k);
        }
        var pen = [c[0] + r * Math.cos(pa), c[1] + r * Math.sin(pa)];
        if (m === 'radius') {
          ctx.strokeStyle = C.PENCIL; ctx.lineWidth = 1.5 * ws * k;
          ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(pen[0], pen[1]); ctx.stroke();
          ctx.fillStyle = C.PENCIL; dotAt(ctx, pen, true);
        } else if (m === 'rotate') {
          ctx.fillStyle = C.GREEN; dotAt(ctx, pen, true);
        }
      }
    }
    if (S.target && (m === 'center' || m === 'needle' || m === 'radius')) mark(ctx, S.target);
  }
}

/* ===================== Bearbeiten ===================== */
function addEdge(a, b) { S.edges.push({ a: a, b: b, col: C.BLUE, gid: S.gid }); }

function merge(v, tgt) {
  S.edges.forEach(function (e) {
    if (e.a === v) e.a = tgt;
    if (e.b === v) e.b = tgt;
  });
  var out = [], seen = [];
  S.edges.forEach(function (e) {
    if (e.a === e.b) return;
    for (var i = 0; i < seen.length; i++) {
      if ((seen[i][0] === e.a && seen[i][1] === e.b) || (seen[i][0] === e.b && seen[i][1] === e.a)) return;
    }
    seen.push([e.a, e.b]);
    out.push(e);
  });
  S.edges = out;
}

function split(v) {
  var inc = S.edges.filter(function (e) { return e.a === v || e.b === v; });
  // feste Strecken bleiben an ihrem Punkt, getrennt werden nur die eigenen
  var own = inc.filter(function (e) { return !e.locked; });
  (own.length < inc.length ? own : inc.slice(1)).forEach(function (o) {
    var other = o.a === v ? o.b : o.a;
    var u = unit(vp(v), vp(other));
    var d = Math.min(24 * S.k, 0.4 * Math.hypot(other.x - v.x, other.y - v.y));
    var nv = V([v.x + u[0] * d, v.y + u[1] * d]);
    if (o.a === v) o.a = nv; else o.b = nv;
  });
}

/* ===================== Berührung ===================== */
function _down(pos) {
  if (S.tool === 'cut') {
    S.cutting = true;
    S.target = snap(pos, null, 2);
  } else if (S.tool === 'move') {
    var v = snap(pos);
    if (v && !v.locked) { S.active = v; S.active_orig = vp(v); }
  } else if (S.tool === 'compass') {
    S.end = [pos[0], pos[1]];
    S.target = csnap(pos, S.cc);
    if (!S.cc) {
      S.cmode = 'center';
    } else if (S.rad <= 0) {
      S.cmode = 'radius'; S.rad_old = 0;
      S.rad = radiusAt(pos);
    } else {
      var d_cc = Math.hypot(pos[0] - S.cc.x, pos[1] - S.cc.y);
      var d_ring = Math.abs(d_cc - S.rad);
      if (d_ring < GRAB * S.k && d_ring <= d_cc) {
        S.cmode = 'rotate';
        S.last = Math.atan2(pos[1] - S.cc.y, pos[0] - S.cc.x);
        S.pa0 = S.last; S.sweep = 0; S.lo = 0; S.hi = 0;
      } else if (d_cc < GRAB * S.k) {
        S.cmode = 'needle';
        S.target = csnap(pos);
      } else {
        S.cmode = null; S.target = null;
      }
    }
  } else {
    S.drawing = true;
    S.lmode = S.ls ? 'end' : 'start';
    S.end = [pos[0], pos[1]];
    S.target = snap(pos, S.ls);
  }
  S.loupe = S.sp;
  render();
}

function _move(pos) {
  if (S.active) {
    var v = S.active;
    v.x = pos[0]; v.y = pos[1];
    S.target = snap(vp(v), v);
  } else if (S.drawing) {
    S.end = [pos[0], pos[1]];
    S.target = snap(pos, S.ls);
  } else if (S.cutting) {
    S.target = snap(pos, null, 2);
  } else if (S.cmode) {
    S.end = [pos[0], pos[1]];
    if (S.cmode === 'rotate') {
      var a = Math.atan2(pos[1] - S.cc.y, pos[0] - S.cc.x);
      S.sweep += ((((a - S.last + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
      S.last = a;
      S.lo = Math.min(S.lo, S.sweep);
      S.hi = Math.max(S.hi, S.sweep);
    } else if (S.cmode === 'radius') {
      S.target = csnap(pos, S.cc);
      S.rad = radiusAt(pos);
    } else {
      S.target = csnap(pos, S.cmode === 'center' ? S.cc : null);
    }
  } else if (S.tool === 'move') {
    var q = snap(pos);
    if (q && !q.locked) { S.active = q; S.active_orig = vp(q); }
  }
  S.loupe = S.sp;
  render();
}

function _up(pos) {
  if (S.active) {
    if (S.target) merge(S.active, S.target);
    S.active = null; S.target = null;
  } else if (S.drawing) {
    var b = S.target ? S.target : V(S.end);
    if (S.lmode === 'start') {
      S.ls = b;
    } else if (b !== S.ls && distCm(vp(S.ls), vp(b)) > 0.2) {
      S.gid += 1;
      addEdge(S.ls, b);
      S.ls = null;
    }
    S.drawing = false; S.lmode = null; S.target = null;
  } else if (S.cutting) {
    var v = S.target;
    S.target = null; S.cutting = false;
    if (v) split(v);
  } else if (S.cmode) {
    var m = S.cmode;
    if (m === 'center' || m === 'needle') {
      S.cc = S.target ? S.target : V(S.end);
      S.cc_gid = S.gid;
    } else if (m === 'radius') {
      if (S.rad < 6 * S.k) S.rad = S.rad_old;
    } else if (m === 'rotate' && S.hi - S.lo > 0.05) {
      var span = S.hi - S.lo;
      var full = span >= TAU * 0.97;
      var sw = full ? TAU : span;
      S.gid += 1;
      S.circles.push({ c: V(vp(S.cc)), r: S.rad, a0: S.pa0 + S.lo, sw: sw, col: C.PENCIL, gid: S.gid });
      S.cc = null; S.rad = 0;
    }
    S.cmode = null; S.target = null; S.sweep = 0; S.lo = 0; S.hi = 0;
  }
  S.loupe = null;
  render();
}

/* ===================== Knöpfe ===================== */
function undo() {
  if (S.ls) { S.ls = null; render(); return; }
  var gids = S.edges.filter(function (e) { return !e.locked; }).map(function (e) { return e.gid; })
    .concat(S.circles.map(function (c) { return c.gid; }));
  var mx = gids.length ? Math.max.apply(null, gids) : 0;
  if (S.cc && (!gids.length || mx <= S.cc_gid)) { S.cc = null; S.rad = 0; render(); return; }
  if (gids.length) {
    S.edges = S.edges.filter(function (e) { return e.locked || e.gid !== mx; });
    S.circles = S.circles.filter(function (c) { return c.gid !== mx; });
    render();
    checkLevel();
  }
}
function clearAll() {
  delete S.solutions[S.level];
  delete S.work[S.level];
  S.solved.delete(S.level);
  loadLevel(S.level, false);
  saveProgress();
}

/* ===================== Level ===================== */
function loadLevel(n, restore) {
  if (restore === undefined) restore = true;
  S.level = n;
  S.edges = []; S.circles = []; S.gid = 0; S.cc = null; S.ls = null; S.base = null; S.done = false;
  App.resetTemp(); S.loupe = null;
  S.vs = 1; S.ox = 0; S.oy = 0; S.vth = 0;
  if (n !== null) {
    var L = 0.38 * Math.min(S.w, S.h * 0.62);
    var y = S.h * (1 - (LEVELS[n].y || 0.40));
    var a = V([S.w / 2 - L / 2, y]), b = V([S.w / 2 + L / 2, y]);
    a.locked = b.locked = true; a.name = 'A'; b.name = 'B';
    S.base = [a, b];
    S.edges.push({ a: a, b: b, col: C.BASEC, gid: 0, locked: true });
    // weitere feste Punkte des Levels (relativ zu A, in Längen von AB) und feste Strecken
    var Lv = LEVELS[n], fest = { A: a, B: b };
    Object.keys(Lv.punkte || {}).forEach(function (nm) {
      var q = Lv.punkte[nm], v = V([a.x + q[0] * L, a.y + q[1] * L]);
      v.locked = true; v.name = nm; fest[nm] = v;
      S.base.push(v);
    });
    (Lv.kanten || []).forEach(function (k) {
      S.edges.push({ a: fest[k[0]], b: fest[k[1]], col: C.BASEC, gid: 0, locked: true });
    });
    if (restore) {
      var sn = S.solutions[n] || S.work[n];
      if (sn) restoreSnap(sn);
    }
  }
  App.applyView();
  if (S.onLevel) S.onLevel(S.level, false);
  checkLevel();
}
// d = 1 nächstes, d = -1 vorheriges Level (am Ende geht es wieder von vorn los)
function nextLevel(d) {
  var n = LEVELS.length;
  storeCurrent();
  loadLevel(S.level === null ? 0 : (S.level + (d || 1) + n) % n);
  saveProgress();
}

function snapshot() {
  if (!S.base) return null;
  var A = S.base[0], B = S.base[1];
  var s = Math.hypot(B.x - A.x, B.y - A.y) || 1;
  var idx = new Map();
  S.base.forEach(function (v) { idx.set(v, v.name); });
  var verts = [];
  function ref(v) {
    if (!idx.has(v)) { idx.set(v, verts.length); verts.push([(v.x - A.x) / s, (v.y - A.y) / s]); }
    return idx.get(v);
  }
  var edges = S.edges.filter(function (e) { return !e.locked; })
    .map(function (e) { return [ref(e.a), ref(e.b), e.col, e.gid]; });
  var circles = S.circles.map(function (c) {
    return [(c.c.x - A.x) / s, (c.c.y - A.y) / s, c.r / s, c.a0, c.sw, c.col, c.gid];
  });
  return { verts: verts, edges: edges, circles: circles };
}
function restoreSnap(sn) {
  var A = S.base[0], B = S.base[1];
  var s = Math.hypot(B.x - A.x, B.y - A.y) || 1;
  var vs = sn.verts.map(function (q) { return V([A.x + q[0] * s, A.y + q[1] * s]); });
  var fest = {};
  S.base.forEach(function (v) { fest[v.name] = v; });
  function get(r) { return typeof r === 'string' ? fest[r] : vs[r]; }
  sn.edges.forEach(function (e) { S.edges.push({ a: get(e[0]), b: get(e[1]), col: e[2], gid: e[3] }); });
  sn.circles.forEach(function (c) {
    S.circles.push({ c: V([A.x + c[0] * s, A.y + c[1] * s]), r: c[2] * s, a0: c[3], sw: c[4], col: c[5], gid: c[6] });
  });
  var g = [0];
  S.edges.forEach(function (e) { g.push(e.gid); });
  S.circles.forEach(function (c) { g.push(c.gid); });
  S.gid = Math.max.apply(null, g);
}
function storeCurrent() {
  if (S.level !== null && S.base && !S.solved.has(S.level)) S.work[S.level] = snapshot();
}
function saveProgress() { App.speichern(STORE_KEY, LEVELS, S, S.level || 0); }
function loadProgress() {
  var n = App.laden(STORE_KEY, OLD_STORE_KEY, LEVELS, S);
  if (n !== null) S.start_level = n;
}

/* ===================== Prüfen ===================== */
// Hilfen für die Prüfungen in den Level-Dateien
function adjacency() {
  var adj = new Map();
  S.edges.forEach(function (e) {
    if (!adj.has(e.a)) adj.set(e.a, new Set());
    if (!adj.has(e.b)) adj.set(e.b, new Set());
    adj.get(e.a).add(e.b); adj.get(e.b).add(e.a);
  });
  return adj;
}
function arcsThrough(P, s, tol, near) {
  return S.circles.filter(function (c) {
    var cx = c.c.x, cy = c.c.y;
    if (Math.abs(c.r - s) > tol || Math.abs(Math.hypot(P.x - cx, P.y - cy) - c.r) > tol) return false;
    if (near && Math.hypot(cx - near.x, cy - near.y) > tol) return false;
    if (c.sw < TAU - 1e-6) {
      var rel = ((Math.atan2(P.y - cy, P.x - cx) - c.a0) % TAU + TAU) % TAU;
      var ta = tol / Math.max(c.r, 1);
      if (rel > c.sw + ta && rel < TAU - ta) return false;
    }
    return true;
  });
}
function arcHas(c, P, tol) {
  var cx = c.c.x, cy = c.c.y;
  if (Math.abs(Math.hypot(P[0] - cx, P[1] - cy) - c.r) > tol) return false;
  if (c.sw >= TAU - 1e-6) return true;
  var rel = ((Math.atan2(P[1] - cy, P[0] - cx) - c.a0) % TAU + TAU) % TAU;
  var ta = tol / Math.max(c.r, 1);
  return rel <= c.sw + ta || rel >= TAU - ta;
}
App.euklid = { adjacency: adjacency, arcsThrough: arcsThrough, arcHas: arcHas };

function checkLevel() {
  if (S.level === null || !S.base) return;
  var A = S.base[0], B = S.base[1];
  var s = Math.hypot(B.x - A.x, B.y - A.y);
  var tol = Math.max(10, 0.045 * s);
  var ok = LEVELS[S.level].pruefen(A, B, s, tol);
  if (ok !== S.done) {
    S.done = ok;
    if (ok) {
      S.solved.add(S.level);
      S.solutions[S.level] = snapshot();
      delete S.work[S.level];
      saveProgress();
    }
    if (S.onLevel) S.onLevel(S.level, ok);
  }
}

App.bereich({
  id: 'euklid',
  name: { de: 'Euklid', en: 'Euclid', fi: 'Eukleides', tr: 'Öklid', fr: 'Euclide', es: 'Euclides', ja: 'ユークリッド', ar: 'إقليدس' },
  icon: '<svg viewBox="0 0 40 44"><path d="M6 36H34L20 11.8Z"/><path d="M8.44 8.11A28 28 0 0 1 28.94 19.94M31.56 8.11A28 28 0 0 0 11.06 19.94"/></svg>',
  werkzeuge: ['line', 'compass', 'move', 'cut'],
  init: function () { LEVELS = App.levelListe('euklid'); loadProgress(); },
  levels: function () { return LEVELS; },
  solved: function () { return S.solved; },
  open: function () {
    App.setTool('line');
    loadLevel(S.level === null ? S.start_level : S.level);
  },
  draw: function (ctx, ws) { buildScene(ctx, ws); buildTemp(ctx, ws); },
  down: _down, move: _move, up: _up, check: checkLevel,
  undo: undo, clear: clearAll, next: nextLevel,
  persist: function () { storeCurrent(); saveProgress(); }
});
})();
