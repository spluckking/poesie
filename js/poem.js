/*
 * poem.js — Lecture du fichier poesie.txt.
 *
 * Format (une poésie par fichier) :
 *   # Titre
 *   @ Auteur
 *   = AAAA-MM-JJ                      (date de récitation)
 *   ! mot difficile | explication      (autant que voulu)
 *   > 🐌 | geste : les mains en coquille   (repère de la strophe qui suit)
 *   Premier vers,
 *   Deuxième vers.
 *   (ligne vide = nouvelle strophe)
 *
 * Les lignes commençant par « // » sont des commentaires.
 * La ponctuation et les majuscules des vers sont gardées telles quelles.
 *
 * Fonctionne dans le navigateur (self.Poem) et sous Node (require).
 */
(function (root, factory) {
  const api = factory(root.AudioKey || (typeof require === 'function' ? require('./audiokey.js') : null));
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Poem = api;
})(typeof self !== 'undefined' ? self : this, function (AudioKey) {
  'use strict';

  function clean(s) {
    return String(s || '').normalize('NFC').replace(/[’‘]/g, "'").replace(/[ \t]+/g, ' ').trim();
  }

  function parseRepere(text) {
    const [emoji, ...rest] = text.split('|');
    const geste = rest.join('|').replace(/^\s*geste\s*:\s*/i, '').trim();
    return { emoji: clean(emoji), geste: clean(geste) };
  }

  /** Texte → { id, title, author, date, words, strophes: [{ repere, vers: [] }] } */
  function parse(text) {
    const out = { id: '', title: '', author: '', date: '', words: [], strophes: [] };
    let current = null;
    let pendingRepere = null;
    const close = () => { current = null; };

    String(text || '').split(/\r?\n/).forEach((raw) => {
      const line = clean(raw);
      if (!line) return close();
      if (line.startsWith('//')) return;
      const head = line[0];
      const body = clean(line.slice(1));
      if (head === '#') { out.title = body; return; }
      if (head === '@') { out.author = body; return; }
      if (head === '=') { if (/^\d{4}-\d{2}-\d{2}$/.test(body)) out.date = body; return; }
      if (head === '!') {
        const [w, ...rest] = body.split('|');
        if (clean(w)) out.words.push({ w: clean(w), explication: clean(rest.join('|')) });
        return;
      }
      if (head === '>') { close(); pendingRepere = parseRepere(body); return; }
      if (!current) {
        current = { repere: pendingRepere || { emoji: '', geste: '' }, vers: [] };
        pendingRepere = null;
        out.strophes.push(current);
      }
      current.vers.push(line);
    });

    out.id = AudioKey ? AudioKey.hash('poesie:' + out.title + '|' + out.author) : out.title;
    return out;
  }

  /** Ce qui est lu à voix haute pour le titre. */
  function titleLine(poem) {
    return poem.author ? poem.title + ', de ' + poem.author : poem.title;
  }

  /** Problèmes à signaler au parent (fichier incomplet). */
  function check(poem) {
    const pb = [];
    if (!poem.title) pb.push('Il manque le titre (ligne « # Titre »).');
    if (!poem.author) pb.push('Il manque l\'auteur (ligne « @ Auteur »).');
    if (!poem.date) pb.push('Il manque la date de récitation (ligne « = AAAA-MM-JJ »).');
    if (!poem.strophes.length) pb.push('Aucune strophe trouvée.');
    return pb;
  }

  return { parse, titleLine, check, clean };
});
