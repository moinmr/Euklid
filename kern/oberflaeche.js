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
  var taskOpen = true, shownFor = null, platzFuer = null, platz = 0;
  // Platz unter der Karte für die Maschinen-Seiten: wächst mit dem längsten Text dieses Levels
  // und bleibt, wenn die Karte ausgeblendet wird. So verschiebt sich der Inhalt nicht.
  function merkePlatz(level) {
    var key = S.mode + ':' + level + ':' + App.sprache() + ':' + window.innerWidth;
    if (key !== platzFuer) { platzFuer = key; platz = 0; }
    if (hud.firstChild) platz = Math.max(platz, Math.ceil(hud.getBoundingClientRect().bottom) + 14);
    if (platz) document.getElementById('mach').style.setProperty('--karte', platz + 'px');
  }
  // Geschafft-Karte unten, mit › direkt daneben: weiter mit dem Daumen. Der Aufgabentext oben bleibt stehen.
  var fertig = document.createElement('div');
  fertig.id = 'fertig'; fertig.hidden = true; fertig.setAttribute('aria-live', 'polite');
  hud.parentNode.insertBefore(fertig, hud.nextSibling);
  fertig.addEventListener('click', function () { var a = App.aktiv(); if (a) a.next(1); });
  function showFertig(level, done) {
    var a = App.aktiv();
    fertig.hidden = !(done && a && level !== null);
    document.body.classList.toggle('geschafft', !fertig.hidden);
    fertig.textContent = '';
    if (fertig.hidden) return;
    fertig.style.bottom = ((S.unten || 70) + 8) + 'px';
    var L = a.levels(), sv = a.solved(), t = document.createElement('span'), w = document.createElement('button');
    t.textContent = sv.size === L.length && L.length > 1 ? T('alle') : App.txt(L[level], 'done') || T('geschafft', level + 1);
    w.className = 'weiter'; w.setAttribute('aria-label', T('naechstes'));
    w.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5L16 12L9.5 18.5"/></svg>';
    fertig.appendChild(t); fertig.appendChild(w);
  }
  function showHud(level, done) {
    var a = App.aktiv();
    showFertig(level, done);
    hud.textContent = '';
    document.getElementById('b-task').classList.toggle('on', taskOpen);
    if (level === null || !a || !taskOpen) return;
    var L = a.levels(), sv = a.solved(), lv = L[level];
    var b = document.createElement('b');
    b.textContent = T('level') + ' ' + (level + 1) + ': ' + App.txt(lv, 'title') + (sv.has(level) && !done ? T('schon') : '');
    hud.appendChild(b);
    hud.appendChild(document.createTextNode(App.txt(lv, 'task')));
    merkePlatz(level);
  }
  S.onLevel = function (level, done) {
    var key = S.mode + ':' + level;
    if (key !== shownFor) { shownFor = key; taskOpen = true; }
    last = [level, done];
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

  hud.addEventListener('click', function () { if (taskOpen && last) { taskOpen = false; showHud(last[0], last[1]); } });

  // Höhe der unteren Leiste, damit z. B. die Wertetabelle darüber steht
  var bottom = document.getElementById('bottom');
  new ResizeObserver(function () {
    S.unten = bottom.offsetHeight;
    document.documentElement.style.setProperty('--unten', S.unten + 'px');
    App.render();
  }).observe(bottom);
  bind('h-lang', App.wechsleSprache);

  // ----- Startseite -----
  var home = document.getElementById('home'), inArea = false;
  var RAHMEN = ['board', 'mach', 'top', 'hud', 'bottom', 'home', 'langpick', 'resetpick', 'fertig'];   // fester Rahmen aus index.html und dem Kern
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
      var leer = !a.levels().length;   // Bereich ohne Level: Karte gedämpft, noch nicht zu öffnen
      a.karte.setAttribute('aria-disabled', leer ? 'true' : 'false');
      a.karte.querySelector('.s').textContent = leer ? T('bald') : standText(a.solved().size, a.levels().length);
    });
  }
  var geloescht = false;   // nach dem Zurücksetzen nichts mehr speichern, bis die Seite neu geladen ist
  function persist() { if (geloescht) return; var a = App.aktiv(); if (a) a.persist(); }
  function showHome() {
    persist();
    S.fingers.clear(); S.gesture = false; S.main = null; S.hist = [];
    App.cancelAction();
    S.mode = 'home';
    inArea = false;
    // Karten, die ein Bereich selbst angelegt hat (z. B. Eingabe- oder rote Karte), gehören nicht in den nächsten Bereich.
    // Der Bereich blendet sie beim Öffnen seines Levels selbst wieder ein.
    Array.prototype.forEach.call(document.getElementById('app').children, function (el) {
      if (RAHMEN.indexOf(el.id) < 0) el.hidden = true;
    });
    document.body.classList.remove('falschkarte');
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
    if (!a.levels().length) return;
    S.mode = a.id;
    toolButtons(a);
    a.open();
    enter();
  }
  window.addEventListener('popstate', function () { if (inArea) showHome(); });

  // Alle Level zurücksetzen: Fortschritt aller Bereiche löschen (die Sprachwahl bleibt), dann neu laden
  var resetpick = document.getElementById('resetpick');
  bind('h-reset', function () { resetpick.hidden = false; });
  resetpick.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null;
    if (e.target === resetpick || (b && b.classList.contains('nein'))) { resetpick.hidden = true; return; }
    if (!b || !b.classList.contains('ja')) return;
    geloescht = true;
    try {
      var behalten = ['mathe-sprache', 'mathe-sprachpaar'], weg = [];
      for (var i = 0; i < localStorage.length; i++) { var key = localStorage.key(i); if (behalten.indexOf(key) < 0) weg.push(key); }
      weg.forEach(function (key) { localStorage.removeItem(key); });
    } catch (err) { /* ohne Speicher gibt es nichts zu löschen */ }
    location.reload();
  });
  bind('b-home', function () {
    if (history.state && history.state.e) history.back(); else showHome();
  });

  document.addEventListener('visibilitychange', function () { if (document.hidden) persist(); });
  window.addEventListener('pagehide', persist);

  // ----- Sprache -----
  function sprachKnopf() {
    var cur = App.sprache();
    // Die zwei gewählten Sprachen, die aktuelle in Blau
    var html = App.paar().map(function (c) {
      return '<span' + (c === cur ? ' class="on"' : '') + '>' + App.info(c).kurz + '</span>';
    }).join(' ');
    document.getElementById('b-lang').innerHTML = html;
    document.getElementById('h-lang').innerHTML = html;
  }
  // Auswahl: Sprache 1 und Sprache 2 aus allen Sprachen
  var pick = document.getElementById('langpick'), sheet = pick.querySelector('.sheet');
  function auswahl() {
    var paar = App.paar(), html = '<h2>' + T('sprachen') + '</h2>';
    [0, 1].forEach(function (i) {
      html += '<h3>' + T(i ? 'sprache2' : 'sprache1') + '</h3><div class="chips">' + App.sprachen.map(function (s) {
        return '<button class="chip-l' + (paar[i] === s.code ? ' on' : '') + '" data-i="' + i + '" data-c="' + s.code + '" lang="' + s.code + '"' +
          '><span' + (s.rtl ? ' dir="rtl"' : '') + '>' + s.name + '</span><span class="kz">' + s.kurz + '</span></button>';
      }).join('') + '</div>';
    });
    html += '<p>' + T('paarHinweis') + '</p><button class="done">' + T('fertig') + '</button>';
    sheet.innerHTML = html;
  }
  bind('h-set', function () { auswahl(); pick.hidden = false; });
  pick.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null;
    if (e.target === pick || (b && b.classList.contains('done'))) { pick.hidden = true; return; }
    if (b && b.getAttribute('data-c')) { App.setzePaar(Number(b.getAttribute('data-i')), b.getAttribute('data-c')); auswahl(); }
  });

  function texte() {
    document.documentElement.lang = App.sprache();
    document.documentElement.classList.toggle('rtl', App.rtl());
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
