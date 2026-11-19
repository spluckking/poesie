/*
 * cues.js — Ce que l'enfant voit d'un vers selon le niveau d'indice.
 *
 *   0 : texte complet, la voix lit avec lui
 *   1 : texte complet, sans la voix
 *   2 : un mot sur deux masqué (le dernier mot, celui de la rime, reste visible)
 *   3 : l'initiale de chaque mot (et la longueur du mot, en pointillé)
 *   4 : rien du vers (le repère de la strophe ou le vers précédent servent d'appui)
 *   5 : rien du tout
 *
 * La ponctuation reste visible aux niveaux 2 et 3 : elle donne le rythme.
 * Le choix des mots masqués est fixe (pas de hasard) pour ne pas dérouter.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Cues = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MAX = 5;
  const NAMES = ['Avec la voix', 'Je lis seul', 'Des trous', 'Les initiales', 'Mon dessin', 'Rien du tout'];

  /** Découpe un vers en mots : { lead, word, trail } (ponctuation autour du mot). */
  function words(vers) {
    return String(vers).split(/\s+/).filter(Boolean).map((tok) => {
      const m = tok.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u);
      return { lead: m[1], word: m[2], trail: m[3] };
    });
  }

  /** Initiale d'un mot ; « l'escargot » → « l'e », « aujourd'hui » → « a ». */
  function initial(word) {
    const m = word.match(/^(\p{L}['’])(\p{L})/u);
    return m ? m[1] + m[2] : word.slice(0, 1);
  }

  /**
   * Morceaux à afficher : [{ type: 'mot' | 'trou' | 'initiale', text, len, lead, trail }].
   * Niveau 4 ou 5 → tableau vide.
   */
  function cue(vers, level) {
    const ws = words(vers);
    if (level >= 4) return [];
    let content = 0;
    return ws.map((t, i) => {
      const base = { lead: t.lead, trail: t.trail, len: t.word.length };
      if (!t.word) return Object.assign(base, { type: 'mot', text: '' });
      const isLast = i === ws.length - 1;
      const n = content++;
      if (level <= 1) return Object.assign(base, { type: 'mot', text: t.word });
      if (level === 2) {
        const hide = n % 2 === 1 && !isLast && t.word.length > 1;
        return Object.assign(base, hide ? { type: 'trou', text: '' } : { type: 'mot', text: t.word });
      }
      const ini = initial(t.word);
      return Object.assign(base, { type: 'initiale', text: ini, len: Math.max(0, t.word.length - ini.length) });
    });
  }

  /** Version texte (tests, lecteur d'écran) : trous « ___ », initiales « L… ». */
  function asText(vers, level) {
    return cue(vers, level).map((c) => {
      const core = c.type === 'trou' ? '_'.repeat(Math.max(3, c.len)) : c.type === 'initiale' ? c.text + '…' : c.text;
      return c.lead + core + c.trail;
    }).join(' ');
  }

  return { MAX, NAMES, words, initial, cue, asText };
});
