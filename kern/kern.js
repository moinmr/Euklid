/* Gemeinsamer Kern: Farben, Zustand, Ansicht und Gesten, Zeichnen, Lupe und Berührung.
   Die Bereiche melden sich mit App.bereich({...}) an, ihre Level mit App.level(bereich, {...}). */
(function () {
'use strict';
var App = window.App;

/* ===================== Konstanten ===================== */
var C = App.C = {
  PARCH: '#f5ebd1', INK: '#382919',
  PENCIL: 'rgb(115,115,122)', PENCIL_A: 'rgba(115,115,122,0.8)',
  BLUE: 'rgb(26,89,204)', BASEC: 'rgb(26,26,26)',
  GREEN: 'rgb(26,179,51)', RED: 'rgb(230,26,26)',
  GRAB: 36,            // Greif-/Einrastradius (px)
  ZOOM: 2.5,           // Lupe
  LOUPE_R: 46, LOUPE_OFFSET: 95,
  LIFT_DELAY: 0.09,    // Sekunden
  CM: 38,              // px pro cm
  FONT: '"Jost", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  TAU: Math.PI * 2
};
var TAU = C.TAU;

/* ===================== Bereiche und Level ===================== */
// Jedes Level hat eine feste Kennung (id). Der Fortschritt wird nach id gespeichert,
// darum darf die Reihenfolge sich ändern. Eine id nie ändern, sonst ist der Stand dieses Levels weg.
// Die Nummer im Titel ("Level 1: ...") ergibt sich aus der Position in reihenfolge.js.
var BEREICHE = {}, LEVEL = {};
App.bereich = function (def) { BEREICHE[def.id] = def; };
App.level = function (bereich, def) { (LEVEL[bereich] = LEVEL[bereich] || {})[def.id] = def; };
App.levelListe = function (bereich) {
  var reg = LEVEL[bereich] || {};
  return (App.ordnung[bereich] || []).map(function (id) { return reg[id]; }).filter(Boolean);
};
App.bereichListe = function () {
  return (App.bereiche || []).map(function (id) { return BEREICHE[id]; }).filter(Boolean);
};
App.aktiv = function () { return BEREICHE[S.mode] || null; };

/* ===================== Zustand ===================== */
// S.mode ist 'home' oder die Kennung des offenen Bereichs.
var S = App.S = {
  tool: 'line', edges: [], circles: [], gid: 0, cc: null, level: null, done: false, base: null,
  solved: new Set(), solutions: {}, work: {}, start_level: 0, ls: null, cc_gid: 0, pa: 0,
  vs: 1, ox: 0, oy: 0, k: 1, vth: 0, dsc: 1,
  hist: [], fingers: new Map(), gesture: false, main: null, sp: [0, 0], loupe: null,
  active_orig: null, w: 0, h: 0, dpr: 1, mode: 'home',
  onLevel: null, onRender: null,
  // Zwischenzustand (reset_temp)
  start: null, end: null, active: null, target: null, drawing: false, lmode: null, cutting: false,
  cmode: null, sweep: 0, lo: 0, hi: 0, pa0: 0, last: 0, rad_old: 0, rad: 0
};

function V(p) { return { x: p[0], y: p[1], locked: false, name: null }; }
function vp(v) { return [v.x, v.y]; }
function unit(a, b) {
  var dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
  return [dx / n, dy / n];
}
function now() { return (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000; }
function render() { if (S.onRender) S.onRender(); }

function resetTemp() {
  S.start = null; S.end = null; S.active = null; S.target = null; S.drawing = false;
  S.lmode = null; S.cutting = false; S.cmode = null; S.sweep = 0; S.lo = 0; S.hi = 0;
  S.pa0 = 0; S.last = 0; S.rad_old = 0; S.rad = 0;
}

/* ===================== Zeichnen ===================== */
function dotAt(ctx, p, big, size) {
  var r = S.k * S.dsc * (size ? size : (big ? 9 : 4));
  ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill();
}
function mark(ctx, v) {
  ctx.fillStyle = S.tool === 'cut' ? C.RED : C.GREEN;
  var r = 11 * S.k * S.dsc;
  ctx.beginPath(); ctx.arc(v.x, v.y, r, 0, TAU); ctx.fill();
}
function arcLine(ctx, c, r, a0, sw, width) {
  ctx.lineWidth = width;
  ctx.beginPath(); ctx.arc(c[0], c[1], r, a0, a0 + sw); ctx.stroke();
}
function text(ctx, txt, x, y, col, size) {
  var k = S.k;
  ctx.fillStyle = col;
  ctx.font = '400 ' + ((size || 12) * k) + 'px ' + C.FONT;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(x, y);
  if (Math.abs(S.vth) > 1e-6) ctx.rotate(-S.vth);   // Ansicht gedreht: Text bleibt aufrecht
  ctx.fillText(txt, 0, 0);
  ctx.restore();
}

function sceneAll(ctx, ws) {
  var a = App.aktiv();
  if (a) a.draw(ctx, ws);
}

function drawLoupe(ctx) {
  var p = S.loupe;
  if (!p) return;
  var x = p[0], y = p[1], r = C.LOUPE_R, cx = x, cy = y - C.LOUPE_OFFSET, Z = C.ZOOM;
  ctx.save();
  ctx.fillStyle = C.PARCH;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  ctx.clip();
  ctx.translate(cx, cy); ctx.scale(Z, Z); ctx.translate(-x, -y);
  ctx.translate(S.ox, S.oy); ctx.rotate(S.vth); ctx.scale(S.vs, S.vs);
  S.dsc = 0.45;
  try { sceneAll(ctx, 0.8 / Z); }
  finally { S.dsc = 1; }
  ctx.restore();
  ctx.strokeStyle = C.INK; ctx.lineWidth = 0.8; ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
  ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6);
  ctx.stroke();
  ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
}

function drawAll(ctx) {
  ctx.save();
  ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
  ctx.fillStyle = C.PARCH;
  ctx.fillRect(0, 0, S.w, S.h);
  ctx.save();
  ctx.translate(S.ox, S.oy); ctx.rotate(S.vth); ctx.scale(S.vs, S.vs);
  sceneAll(ctx, 1);
  ctx.restore();
  var a = App.aktiv();
  if (a && a.overlay) a.overlay(ctx);   // in Bildschirmkoordinaten, z. B. Wertetabelle
  drawLoupe(ctx);
  ctx.restore();
}

/* ===================== Ansicht & Gesten ===================== */
function drehbar() { var a = App.aktiv(); return !a || a.drehen !== false; }
function toWorld(pos) {
  var dx = pos[0] - S.ox, dy = pos[1] - S.oy;
  var c = Math.cos(-S.vth), s = Math.sin(-S.vth);
  return [(dx * c - dy * s) / S.vs, (dx * s + dy * c) / S.vs];
}
function applyView() { S.k = 1 / S.vs; render(); }
function resetView() {
  var a = App.aktiv();
  S.vs = 1; S.vth = 0;
  if (a && a.mitte) { S.ox = S.w / 2; S.oy = S.h * 0.48; } else { S.ox = 0; S.oy = 0; }
  applyView();
}

function cancelAction() {
  if (S.active && S.active_orig) { S.active.x = S.active_orig[0]; S.active.y = S.active_orig[1]; }
  if (S.cmode === 'radius') S.rad = S.rad_old;
  S.active = null; S.drawing = false; S.lmode = null; S.cutting = false; S.cmode = null;
  S.target = null; S.sweep = 0; S.lo = 0; S.hi = 0; S.loupe = null;
  render();
}

var G = {};
function twoFingers() { var a = Array.from(S.fingers.values()); return [a[0], a[1]]; }
function startGesture() {
  cancelAction();
  S.gesture = true;
  var f = twoFingers(), a = f[0], b = f[1];
  G.c0 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  G.d0 = Math.max(Math.hypot(b[0] - a[0], b[1] - a[1]), 10);
  G.s0 = S.vs; G.th0 = S.vth;
  G.ang0 = Math.atan2(b[1] - a[1], b[0] - a[0]);
  G.w0 = toWorld(G.c0);
}
function updateGesture() {
  var f = twoFingers(), a = f[0], b = f[1];
  var c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  var d = Math.max(Math.hypot(b[0] - a[0], b[1] - a[1]), 1);
  S.vs = Math.max(0.25, Math.min(8, G.s0 * d / G.d0));
  var dang = Math.atan2(b[1] - a[1], b[0] - a[0]) - G.ang0;
  S.vth = !drehbar() ? 0 : G.th0 + ((((dang + Math.PI) % TAU) + TAU) % TAU - Math.PI);
  var cs = Math.cos(S.vth), sn = Math.sin(S.vth);
  var wx = G.w0[0] * S.vs, wy = G.w0[1] * S.vs;
  S.ox = c[0] - (wx * cs - wy * sn);
  S.oy = c[1] - (wx * sn + wy * cs);
  applyView();
}

/* ===================== Berührung (Kern) ===================== */
// Ein Finger wird an den offenen Bereich weitergegeben (down, move, up), zwei Finger sind Ansicht.
function onDown(id, p) {
  S.fingers.set(id, p);
  if (S.fingers.size >= 2) { startGesture(); return; }
  S.main = id; S.sp = p;
  var w = toWorld(p);
  S.hist = [[now(), w]];
  var a = App.aktiv();
  if (a) a.down(w);
}
function move(w) { var a = App.aktiv(); if (a) a.move(w); }
function onMove(id, p) {
  if (!S.fingers.has(id)) return;
  S.fingers.set(id, p);
  if (S.gesture) { if (S.fingers.size >= 2) updateGesture(); return; }
  if (id === S.main) {
    S.sp = p;
    var w = toWorld(p), t = now();
    S.hist.push([t, w]);
    while (S.hist.length > 2 && t - S.hist[1][0] > 0.6) S.hist.shift();
    move(w);
  }
}
function onUp(id, p) {
  if (!S.fingers.has(id)) return;
  S.fingers.delete(id);
  if (S.gesture) { if (S.fingers.size === 0) S.gesture = false; return; }
  if (id === S.main) {
    S.main = null; S.sp = p;
    var cutoff = now() - C.LIFT_DELAY, settled = null;
    for (var i = 0; i < S.hist.length; i++) {
      if (S.hist[i][0] > cutoff) break;
      settled = S.hist[i][1];
    }
    if (!settled) settled = S.hist.length ? S.hist[S.hist.length - 1][1] : toWorld(p);
    var lastW = S.hist.length ? S.hist[S.hist.length - 1][1] : null;
    if (lastW && (settled[0] !== lastW[0] || settled[1] !== lastW[1])) move(settled);
    S.hist = [];
    var a = App.aktiv();
    if (a) { a.up(settled); a.check(); }
  }
}
function onCancel(id) {
  if (!S.fingers.has(id)) return;
  S.fingers.delete(id);
  if (S.gesture) { if (S.fingers.size === 0) S.gesture = false; return; }
  if (id === S.main) { S.main = null; S.hist = []; cancelAction(); }
}

function setTool(t) {
  S.tool = t; S.cc = null; S.ls = null; resetTemp(); S.loupe = null;
  render();
  if (S.onTool) S.onTool(t);
}

App.V = V; App.vp = vp; App.unit = unit; App.now = now; App.render = render; App.resetTemp = resetTemp;
App.dotAt = dotAt; App.mark = mark; App.arcLine = arcLine; App.text = text; App.drawAll = drawAll;
App.toWorld = toWorld; App.applyView = applyView; App.resetView = resetView; App.drehbar = drehbar;
App.cancelAction = cancelAction; App.setTool = setTool;
App.onDown = onDown; App.onMove = onMove; App.onUp = onUp; App.onCancel = onCancel;
})();
