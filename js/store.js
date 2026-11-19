/*
 * store.js — Les données de l'appli, dans le localStorage de la tablette (aucun serveur).
 *
 * poesie.v1 :
 * {
 *   version: 1,
 *   poemId, poemTitle,            // poésie en cours (identifiant = titre + auteur)
 *   start: 'AAAA-MM-JJ',          // J0, jour de la découverte
 *   recit: null | 'AAAA-MM-JJ',   // date de récitation choisie par le parent (sinon celle du fichier)
 *   decouverteFaite: false,
 *   strophes: [état levels.js],
 *   seances: { 'AAAA-MM-JJ': { done, reussies: [], nouvelles: [], versOk } },
 *   soirs: { 'AAAA-MM-JJ': { s0: 'sue' | 'hesite' | 'pas', … } },
 *   soirAvant: { date, strophes },  // état juste avant la note du soir (pour la corriger)
 *   gommettes: [{ date, n }],       // une par séance finie, une par jour au plus
 *   archive: [{ id, title, author, recit, gommettes }],
 *   settings: { sound: true }
 * }
 * poesie.photos.v1 : { 'poemId:s': dataURL }  (photos des dessins, séparées car plus lourdes)
 */
(function (root) {
  'use strict';

  const KEY = 'poesie.v1';
  const PHOTOS = 'poesie.photos.v1';

  function defaults() {
    return {
      version: 1, poemId: null, poemTitle: '', start: null, recit: null, decouverteFaite: false,
      strophes: [], seances: {}, soirs: {}, soirAvant: null, gommettes: [], archive: [],
      settings: { sound: true }
    };
  }

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  function load() {
    return Object.assign(defaults(), read(KEY) || {});
  }
  function save(state) { return write(KEY, state); }

  /**
   * Accorde l'état à la poésie publiée.
   * - autre poésie (titre ou auteur différent) → l'ancienne part dans l'archive, tout repart de zéro ;
   * - même poésie corrigée → la progression est gardée (strophes ajoutées ou retirées à la fin).
   */
  function sync(state, poem, today) {
    if (state.poemId !== poem.id) {
      if (state.poemId) {
        state.archive.push({ id: state.poemId, title: state.poemTitle, recit: state.recit, gommettes: state.gommettes.length });
      }
      Object.assign(state, {
        poemId: poem.id, poemTitle: poem.title, start: today, recit: null, decouverteFaite: false,
        strophes: [], seances: {}, soirs: {}, soirAvant: null, gommettes: []
      });
    }
    while (state.strophes.length < poem.strophes.length) state.strophes.push(Levels.fresh());
    state.strophes.length = poem.strophes.length;
    return state;
  }

  function photos() { return read(PHOTOS) || {}; }
  function setPhoto(poemId, s, dataUrl) {
    const all = photos();
    if (dataUrl) all[poemId + ':' + s] = dataUrl; else delete all[poemId + ':' + s];
    return write(PHOTOS, all);
  }
  function photo(poemId, s) { return photos()[poemId + ':' + s] || null; }

  function exportAll() { return JSON.stringify({ state: load(), photos: photos() }, null, 1); }
  function importAll(text) {
    const data = JSON.parse(text);
    if (!data || !data.state || data.state.version !== 1) throw new Error('Fichier non reconnu.');
    write(KEY, data.state);
    write(PHOTOS, data.photos || {});
  }

  root.Store = { load, save, sync, defaults, photo, setPhoto, exportAll, importAll };
})(self);
