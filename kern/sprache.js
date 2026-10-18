/* Sprachen: welche es gibt, welche zwei gewählt sind (zwischen denen der Knopf umschaltet),
   welche gerade gilt, und die Texte des Kerns.
   Bereiche und Level bringen ihre Texte selbst mit, als { de: ..., en: ..., fi: ... }. */
(function () {
'use strict';
var App = window.App;

// Alle Sprachen der App. Die erste ist die Grundsprache und springt ein, wenn ein Text fehlt.
// name = Name in der Sprache selbst (für die Auswahl), rtl = von rechts nach links.
App.sprachen = [
  { code: 'de', kurz: 'DE', name: 'Deutsch' },
  { code: 'en', kurz: 'EN', name: 'English' },
  { code: 'fi', kurz: 'FI', name: 'Suomi' },
  { code: 'tr', kurz: 'TR', name: 'Türkçe' },
  { code: 'fr', kurz: 'FR', name: 'Français' },
  { code: 'es', kurz: 'ES', name: 'Español' },
  { code: 'ja', kurz: 'JA', name: '日本語' },
  { code: 'ar', kurz: 'AR', name: 'العربية', rtl: true }
];

var KEY = 'mathe-sprache', PKEY = 'mathe-sprachpaar';
function gibt(code) { return App.sprachen.some(function (s) { return s.code === code; }); }
function laden(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function merken(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignorieren */ } }

// Die zwei gewählten Sprachen
var paar = ['de', 'en'];
try {
  var p = JSON.parse(laden(PKEY));
  if (p && p.length === 2 && gibt(p[0]) && gibt(p[1]) && p[0] !== p[1]) paar = p;
} catch (e) { /* ignorieren */ }
var lang = laden(KEY);
if (paar.indexOf(lang) < 0) lang = paar[0];

App.info = function (code) { return App.sprachen.filter(function (s) { return s.code === code; })[0]; };
App.sprache = function () { return lang; };
App.rtl = function () { return !!App.info(lang).rtl; };
App.paar = function () { return paar.slice(); };
App.setzeSprache = function (code) {
  lang = code;
  merken(KEY, code);
  if (App.nachSprache) App.nachSprache();
};
// Sprache 1 oder 2 (i = 0 oder 1) ändern. Ist sie schon die andere, tauschen beide.
App.setzePaar = function (i, code) {
  if (paar[1 - i] === code) paar[1 - i] = paar[i];
  paar[i] = code;
  merken(PKEY, JSON.stringify(paar));
  App.setzeSprache(paar.indexOf(lang) >= 0 ? lang : paar[i]);
};
App.wechsleSprache = function () { App.setzeSprache(lang === paar[0] ? paar[1] : paar[0]); };

// { de: x, en: y, ... } -> Wert in der aktuellen Sprache, sonst in der Grundsprache. Ein einfacher Text bleibt, wie er ist.
App.wahl = function (o) {
  if (!o) return '';
  if (typeof o !== 'object') return o;
  return o[lang] !== undefined ? o[lang] : o[App.sprachen[0].code];
};
// Text eines Levels: lv.text = { de: { title, task, done }, en: { ... } }. Ein Text darf eine Funktion sein.
App.txt = function (lv, feld) {
  var t = lv.text || {}, cur = t[lang] || {}, v = cur[feld];
  if (v === undefined) v = (t[App.sprachen[0].code] || {})[feld];
  if (typeof v === 'function') v = v();
  return v || '';
};

var TEXTE = {
  mathe: { de: 'Mathe', en: 'Maths', fi: 'Matikka', tr: 'Matematik', fr: 'Maths', es: 'Mates', ja: '数学', ar: 'الرياضيات' },
  waehle: { de: 'Wähle einen Bereich', en: 'Choose a topic', fi: 'Valitse aihe', tr: 'Bir konu seç', fr: 'Choisis un thème',
            es: 'Elige un tema', ja: 'テーマを選ぼう', ar: 'اختر موضوعًا' },
  nichts: { de: 'Noch nichts gelöst', en: 'Nothing solved yet', fi: 'Ei vielä ratkaistuja', tr: 'Henüz hiçbiri çözülmedi',
            fr: 'Rien de résolu pour l’instant', es: 'Todavía nada resuelto', ja: 'まだ解いていません', ar: 'لم يُحلّ شيء بعد' },
  bald: { de: 'Level kommen bald', en: 'Levels coming soon', fi: 'Tasot tulossa pian', tr: 'Seviyeler yakında',
          fr: 'Niveaux bientôt disponibles', es: 'Niveles muy pronto', ja: 'レベルは近日公開', ar: 'المستويات قريبًا' },
  stand: { de: function (n, t) { return n + ' von ' + t + ' Leveln gelöst'; },
           en: function (n, t) { return n + ' of ' + t + ' levels solved'; },
           fi: function (n, t) { return n + '/' + t + ' tasoa ratkaistu'; },
           tr: function (n, t) { return t + ' seviyeden ' + n + ' çözüldü'; },
           fr: function (n, t) { return n + ' niveaux sur ' + t + ' résolus'; },
           es: function (n, t) { return n + ' de ' + t + ' niveles resueltos'; },
           ja: function (n, t) { return t + 'レベル中 ' + n + ' クリア'; },
           ar: function (n, t) { return 'تم حل ' + n + ' من ' + t + ' مستويات'; } },
  alle: { de: 'Alle Level geschafft, sehr gut!', en: 'All levels done, well done!', fi: 'Kaikki tasot tehty, hienoa!',
          tr: 'Tüm seviyeler tamam, harika!', fr: 'Tous les niveaux sont réussis, bravo !', es: '¡Todos los niveles superados, muy bien!',
          ja: '全レベルクリア、すごい！', ar: 'أنهيت كل المستويات، أحسنت!' },
  geschafft: { de: function (n) { return 'Level ' + n + ' geschafft!'; },
               en: function (n) { return 'Level ' + n + ' done!'; },
               fi: function (n) { return 'Taso ' + n + ' tehty!'; },
               tr: function (n) { return 'Seviye ' + n + ' tamam!'; },
               fr: function (n) { return 'Niveau ' + n + ' réussi !'; },
               es: function (n) { return '¡Nivel ' + n + ' superado!'; },
               ja: function (n) { return 'レベル' + n + 'クリア！'; },
               ar: function (n) { return 'أنهيت المستوى ' + n + '!'; } },
  level: { de: 'Level', en: 'Level', fi: 'Taso', tr: 'Seviye', fr: 'Niveau', es: 'Nivel', ja: 'レベル', ar: 'المستوى' },
  schon: { de: ' (schon gelöst)', en: ' (already solved)', fi: ' (jo ratkaistu)', tr: ' (zaten çözüldü)', fr: ' (déjà résolu)',
           es: ' (ya resuelto)', ja: '（解決済み）', ar: ' (محلول مسبقًا)' },
  werkzeuge: { de: 'Werkzeuge', en: 'Tools', fi: 'Työkalut', tr: 'Araçlar', fr: 'Outils', es: 'Herramientas', ja: 'ツール', ar: 'الأدوات' },
  navigation: { de: 'Navigation', en: 'Navigation', fi: 'Navigointi', tr: 'Gezinme', fr: 'Navigation', es: 'Navegación',
                ja: 'ナビゲーション', ar: 'التنقل' },
  aufgabe: { de: 'Aufgabe zeigen oder ausblenden', en: 'Show or hide the task', fi: 'Näytä tai piilota tehtävä',
             tr: 'Görevi göster veya gizle', fr: 'Afficher ou masquer la consigne', es: 'Mostrar u ocultar la tarea',
             ja: '課題を表示／非表示', ar: 'إظهار المهمة أو إخفاؤها' },
  startseite: { de: 'Startseite', en: 'Home', fi: 'Etusivu', tr: 'Ana sayfa', fr: 'Accueil', es: 'Inicio', ja: 'ホーム', ar: 'الصفحة الرئيسية' },
  punkt: { de: 'Punkt', en: 'Point', fi: 'Piste', tr: 'Nokta', fr: 'Point', es: 'Punto', ja: '点', ar: 'نقطة' },
  linie: { de: 'Linie', en: 'Line', fi: 'Viiva', tr: 'Çizgi', fr: 'Ligne', es: 'Línea', ja: '線', ar: 'خط' },
  zirkel: { de: 'Zirkel', en: 'Compass', fi: 'Harppi', tr: 'Pergel', fr: 'Compas', es: 'Compás', ja: 'コンパス', ar: 'الفرجار' },
  schieben: { de: 'Ecke schieben', en: 'Move corner', fi: 'Siirrä kulmaa', tr: 'Köşeyi taşı', fr: 'Déplacer un coin',
              es: 'Mover esquina', ja: '角を動かす', ar: 'تحريك الزاوية' },
  trennen: { de: 'Trennen', en: 'Split', fi: 'Erota', tr: 'Ayır', fr: 'Séparer', es: 'Separar', ja: '切り離す', ar: 'فصل' },
  zurueck: { de: 'Zurück', en: 'Undo', fi: 'Kumoa', tr: 'Geri al', fr: 'Annuler', es: 'Deshacer', ja: '元に戻す', ar: 'تراجع' },
  loeschen: { de: 'Alles löschen', en: 'Clear all', fi: 'Tyhjennä kaikki', tr: 'Hepsini sil', fr: 'Tout effacer', es: 'Borrar todo',
              ja: 'すべて消す', ar: 'مسح الكل' },
  ansicht: { de: 'Ansicht zurücksetzen', en: 'Reset view', fi: 'Palauta näkymä', tr: 'Görünümü sıfırla', fr: 'Réinitialiser la vue',
             es: 'Restablecer vista', ja: '表示をリセット', ar: 'إعادة ضبط العرض' },
  naechstes: { de: 'Nächstes Level', en: 'Next level', fi: 'Seuraava taso', tr: 'Sonraki seviye', fr: 'Niveau suivant',
               es: 'Siguiente nivel', ja: '次のレベル', ar: 'المستوى التالي' },
  vorheriges: { de: 'Vorheriges Level', en: 'Previous level', fi: 'Edellinen taso', tr: 'Önceki seviye', fr: 'Niveau précédent',
                es: 'Nivel anterior', ja: '前のレベル', ar: 'المستوى السابق' },
  sprache: { de: 'Sprache wechseln', en: 'Change language', fi: 'Vaihda kieli', tr: 'Dili değiştir', fr: 'Changer de langue',
             es: 'Cambiar idioma', ja: '言語を切り替え', ar: 'تغيير اللغة' },
  sprachen: { de: 'Sprachen', en: 'Languages', fi: 'Kielet', tr: 'Diller', fr: 'Langues', es: 'Idiomas', ja: '言語', ar: 'اللغات' },
  sprache1: { de: 'Sprache 1', en: 'Language 1', fi: 'Kieli 1', tr: 'Dil 1', fr: 'Langue 1', es: 'Idioma 1', ja: '言語 1', ar: 'اللغة 1' },
  sprache2: { de: 'Sprache 2', en: 'Language 2', fi: 'Kieli 2', tr: 'Dil 2', fr: 'Langue 2', es: 'Idioma 2', ja: '言語 2', ar: 'اللغة 2' },
  paarHinweis: { de: 'Der Knopf oben wechselt zwischen diesen zwei Sprachen.',
                 en: 'The button at the top switches between these two languages.',
                 fi: 'Yläreunan painike vaihtaa näiden kahden kielen välillä.',
                 tr: 'Üstteki düğme bu iki dil arasında geçiş yapar.',
                 fr: 'Le bouton en haut passe d’une de ces deux langues à l’autre.',
                 es: 'El botón de arriba cambia entre estos dos idiomas.',
                 ja: '上のボタンでこの2つの言語を切り替えます。',
                 ar: 'الزر في الأعلى يبدّل بين هاتين اللغتين.' },
  fertig: { de: 'Fertig', en: 'Done', fi: 'Valmis', tr: 'Tamam', fr: 'Terminé', es: 'Listo', ja: '完了', ar: 'تم' }
};
App.t = function (key) {
  var v = App.wahl(TEXTE[key]);
  return typeof v === 'function' ? v.apply(null, Array.prototype.slice.call(arguments, 1)) : v;
};
})();
