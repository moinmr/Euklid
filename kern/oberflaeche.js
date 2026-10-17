/* ===================== Oberfläche ===================== */
// Startseite mit einer Karte je Bereich, Symbolleiste, Aufgabentext unten, Sprach-Umschalter, Zurück-Taste.
(function () {
'use strict';
var App = window.App, S = App.S, T = App.t;

App.start = function () {
  var canvas = document.getElementById('board'), ctx = canvas.getContext('2d');
  var hud = document.getElementById('hud');
  var tools = { point: 'b-point', line: 'b-line', compass: 'b-compass', move: 'b-move', cut: 'b-cut' };
  var raf = 0, last = null;
  var bereiche = App.bereichListe();

  S.onRender = function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; App.drawAll(ctx); });
  };
  S.onTool = function (t) {
    Object.keys(tools).forEach(function (k) {
      document.getElementById(tools[k]).classList.toggle('on', k === t);
    });
  };
  // Aufgabentext: erscheint bei jedem neuen Level, die Sprechblase blendet ihn aus und ein.
  // "Geschafft" wird immer gezeigt.
  var taskOpen = true, shownFor = null;
  function showHud(level, done) {
    var a = App.aktiv();
    hud.classList.toggle('ok', !!done);
    hud.textContent = '';
    document.getElementById('b-task').classList.toggle('on', taskOpen);
    if (level === null || !a) return;
    if (!done && !taskOpen) return;
    var L = a.levels(), sv = a.solved(), lv = L[level];
    if (done) {
      var fertig = App.txt(lv, 'done');
      hud.textContent = sv.size === L.length ? T('alle')
        : fertig ? fertig + ' ' + T('weiter')
        : T('geschafft', level + 1);
    } else {
      var b = document.createElement('b');
      b.textContent = T('level') + ' ' + (level + 1) + ': ' + App.txt(lv, 'title') + (sv.has(level) ? T('schon') : '');
      hud.appendChild(b);
      hud.appendChild(document.createTextNode(App.txt(lv, 'task')));
    }
  }
  S.onLevel = function (level, done) {
    var key = S.mode + ':' + level;
    if (key !== shownFor) { shownFor = key; taskOpen = true; }
    last = [level, done];
    document.getElementById('lv-num').textContent = level === null ? '' : level + 1;
    showHud(level, done);
  };

  function resize() {
    var r = canvas.getBoundingClientRect();
    S.w = r.width; S.h = r.height;
    S.dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(S.w * S.dpr);
    canvas.height = Math.round(S.h * S.dpr);
    App.render();
  }
  function pos(e) {
    var r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
    App.onDown(e.pointerId, pos(e));
  });
  canvas.addEventListener('pointermove', function (e) {
    e.preventDefault();
    App.onMove(e.pointerId, pos(e));
  });
  canvas.addEventListener('pointerup', function (e) { e.preventDefault(); App.onUp(e.pointerId, pos(e)); });
  canvas.addEventListener('pointercancel', function (e) { App.onCancel(e.pointerId); });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    var p = pos(e), w = App.toWorld(p);
    if ((e.altKey || e.shiftKey) && App.drehbar()) S.vth += e.deltaY * 0.002;
    else S.vs = Math.max(0.25, Math.min(8, S.vs * Math.exp(-e.deltaY * 0.0015)));
    var cs = Math.cos(S.vth), sn = Math.sin(S.vth);
    S.ox = p[0] - (w[0] * S.vs * cs - w[1] * S.vs * sn);
    S.oy = p[1] - (w[0] * S.vs * sn + w[1] * S.vs * cs);
    App.applyView();
  }, { passive: false });
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (n) {
    document.addEventListener(n, function (e) { e.preventDefault(); });
  });

  function bind(id, fn) { document.getElementById(id).addEventListener('click', fn); }
  function beiBereich(name) { return function () { var a = App.aktiv(); if (a) a[name](); }; }
  Object.keys(tools).forEach(function (t) { bind(tools[t], function () { App.setTool(t); }); });
  bind('b-undo', beiBereich('undo'));
  bind('b-clear', beiBereich('clear'));
  bind('b-view', App.resetView);
  bind('b-level', function () { var a = App.aktiv(); if (a) a.next(1); });
  bind('b-prev', function () { var a = App.aktiv(); if (a) a.next(-1); });
  bind('b-lang', App.wechsleSprache);
  bind('b-task', function () { taskOpen = !taskOpen; if (last) showHud(last[0], last[1]); });

  // Wie weit die obere Leiste mit Aufgabentext reicht: für die Wertetabelle und die Maschinen-Fläche
  var top = document.getElementById('top');
  new ResizeObserver(function () {
    S.oben = Math.round(top.getBoundingClientRect().bottom) - 14;
    document.getElementById('app').style.setProperty('--oben', S.oben + 'px');
    App.render();
  }).observe(top);
  bind('h-lang', App.wechsleSprache);

  // ----- Startseite -----
  var home = document.getElementById('home'), inArea = false;
  var areas = document.getElementById('areas');
  bereiche.forEach(function (a) {
    var b = document.createElement('button');
    b.className = 'area'; b.id = 'a-' + a.id;
    b.innerHTML = a.icon + '<span class="t"><span class="n"></span><span class="s"></span></span>';
    b.addEventListener('click', function () { openArea(a); });
    areas.appendChild(b);
    a.karte = b;
  });
  function standText(n, total) { return n === 0 ? T('nichts') : T('stand', n, total); }
  function updateStand() {
    bereiche.forEach(function (a) {
      a.karte.querySelector('.n').textContent = App.wahl(a.name);
      a.karte.querySelector('.s').textContent = standText(a.solved().size, a.levels().length);
    });
  }
  function persist() { var a = App.aktiv(); if (a) a.persist(); }
  function showHome() {
    persist();
    S.fingers.clear(); S.gesture = false; S.main = null; S.hist = [];
    App.cancelAction();
    S.mode = 'home';
    inArea = false;
    shownFor = null;
    updateStand();
    home.hidden = false;
  }
  function enter() {
    home.hidden = true;
    if (!inArea) {
      inArea = true;
      try { history.pushState({ e: 1 }, ''); } catch (e) {}
    }
    App.render();
  }
  function toolButtons(a) {
    Object.keys(tools).forEach(function (t) {
      document.getElementById(tools[t]).hidden = a.werkzeuge.indexOf(t) < 0;
    });
    ['b-undo', 'b-view'].forEach(function (id) { document.getElementById(id).hidden = false; });
    document.getElementById('mach').hidden = true;
  }
  function openArea(a) {
    S.mode = a.id;
    toolButtons(a);
    a.open();
    enter();
  }
  window.addEventListener('popstate', function () { if (inArea) showHome(); });
  bind('b-home', function () {
    if (history.state && history.state.e) history.back(); else showHome();
  });

  document.addEventListener('visibilitychange', function () { if (document.hidden) persist(); });
  window.addEventListener('pagehide', persist);

  // ----- Sprache -----
  function sprachKnopf() {
    var cur = App.sprache();
    document.getElementById('b-lang').textContent =
      App.sprachen.filter(function (s) { return s.code === cur; })[0].kurz;
    document.getElementById('h-lang').innerHTML = App.sprachen.map(function (s) {
      return '<span' + (s.code === cur ? ' class="on"' : '') + '>' + s.kurz + '</span>';
    }).join(' | ');
  }
  function texte() {
    document.documentElement.lang = App.sprache();
    Array.prototype.forEach.call(document.querySelectorAll('[data-aria]'), function (el) {
      el.setAttribute('aria-label', T(el.getAttribute('data-aria')));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (el) {
      el.textContent = T(el.getAttribute('data-t'));
    });
    sprachKnopf();
    updateStand();
  }
  App.nachSprache = function () {
    texte();
    var a = App.aktiv();
    if (a && last) showHud(last[0], last[1]);
    if (a && a.sprache) a.sprache();
    App.render();
  };

  bereiche.forEach(function (a) { a.init(); });
  texte();
  App.setTool('line');
  new ResizeObserver(resize).observe(canvas);
  resize();
  if (document.fonts) {
    document.fonts.load('400 12px Jost').then(App.render, function () {});
    if (document.fonts.ready) document.fonts.ready.then(App.render);
  }
};
})();
