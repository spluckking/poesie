/*
 * session.js — Le déroulé d'une séance (5 à 7 minutes), sous forme d'une file d'étapes.
 *
 * Étapes (item.kind) :
 *   'ecoute'  : écouter une strophe nouvelle (2 fois), texte surligné
 *   'vers'    : dire un vers, au niveau d'indice item.level
 *   'groupe'  : dire un groupe de sens (item.g) d'une strophe nouvelle
 *   'strophe' : dire une strophe entière, au niveau item.level
 *   'titre'   : dire le titre et l'auteur
 * Rôle (item.purpose) :
 *   'rappel'     : rappel à froid d'une strophe déjà apprise — compte pour son niveau
 *   'entier'     : la poésie entière (fin du planning) — compte pour le niveau
 *   'apprendre'  : échelle 0 → 3 d'une strophe nouvelle
 *   'pont'       : dernier vers de la strophe d'avant + premier vers de la nouvelle
 *   'travail'    : la strophe la plus fragile, les jours sans strophe nouvelle
 *   'correction' : ajoutée après un « pas pareil » ; ne compte pas
 *
 * Un « pas pareil » ajoute tout de suite : le même vers un niveau plus bas, puis au même
 * niveau (pour une strophe : ses vers un niveau plus bas, puis la strophe à nouveau).
 * Au-delà de 7 minutes, la séance s'arrête à la fin de l'étape en cours.
 */
(function (root, factory) {
  const api = factory(
    root.Levels || (typeof require === 'function' ? require('./levels.js') : null)
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Session = api;
})(typeof self !== 'undefined' ? self : this, function (Levels) {
  'use strict';

  const LIMIT_MS = 7 * 60 * 1000;
  const SCORED = { rappel: true, entier: true };

  function versItems(poem, s, level, purpose, unit) {
    return poem.strophes[s].vers.map((_, v) => ({ kind: 'vers', s, v, level, purpose, unit }));
  }

  /**
   * Prépare la séance du jour.
   * info : résultat de Planner.day ; states : état des strophes (levels.js).
   */
  function create(poem, states, info, now) {
    const q = [];
    const apprises = states.map((st, i) => (st.intro ? i : -1)).filter((i) => i >= 0);
    const phase = info.phase;

    if (phase === 'apprentissage') {
      apprises.forEach((s) => q.push({ kind: 'strophe', s, level: states[s].level, purpose: 'rappel', unit: 'r' + s }));
      info.nouvelles.forEach((n) => {
        const unit = 'n' + n;
        const st = poem.strophes[n];
        q.push({ kind: 'ecoute', s: n, purpose: 'apprendre', unit });
        // Un groupe de sens à la fois (2 à 4 vers : la mémoire de travail d'un enfant de 8 ans),
        // puis la strophe entière.
        st.groupes.forEach((g, gi) => {
          for (let v = g.debut; v < g.fin; v++) {
            [0, 1, 2, 3].forEach((level) => q.push({ kind: 'vers', s: n, v, level, purpose: 'apprendre', unit }));
          }
          if (st.groupes.length > 1) q.push({ kind: 'groupe', s: n, g: gi, level: 2, purpose: 'apprendre', unit });
        });
        q.push({ kind: 'strophe', s: n, level: 2, purpose: 'apprendre', unit });
        if (n > 0 && (states[n - 1].intro || info.nouvelles.includes(n - 1))) {
          const prev = poem.strophes[n - 1].vers;
          const prevLevel = states[n - 1].intro ? Math.min(states[n - 1].level, 4) : 2;
          q.push({ kind: 'vers', s: n - 1, v: prev.length - 1, level: prevLevel, purpose: 'pont', unit: 'p' + n });
          q.push({ kind: 'vers', s: n, v: 0, level: 2, purpose: 'pont', unit: 'p' + n });
        }
      });
      if (!info.nouvelles.length && apprises.length) {
        const w = Levels.weakest(states);
        if (w >= 0) q.push(...versItems(poem, w, Math.min(states[w].level, 4), 'travail', 't' + w));
      }
    } else if (phase === 'consolidation' || phase === 'sans-indice' || phase === 'repetition' || phase === 'jour') {
      const nu = phase !== 'consolidation';
      q.push({ kind: 'titre', level: nu ? 5 : 3, purpose: 'entier', unit: 'titre' });
      poem.strophes.forEach((_, s) => q.push({
        kind: 'strophe', s, level: nu ? 5 : states[s].level, purpose: 'entier', unit: 'e' + s
      }));
      if (phase === 'consolidation') {
        const w = Levels.weakest(states);
        if (w >= 0 && states[w].fragile) q.push(...versItems(poem, w, Math.min(states[w].level, 4), 'travail', 't' + w));
      }
    }

    q.forEach((it, i) => { it.id = i; });
    return {
      date: info.date || null,
      phase,
      startedAt: now !== undefined ? now : Date.now(),
      queue: q,
      history: [],
      first: {},       // strophe → réussite au premier essai (rappel / entier)
      titreOk: null,
      nouvelles: info.nouvelles.slice(),
      nextId: q.length,
      stopped: false,
      _poemVers: poem.strophes.map((st) => st.vers),
      _groupes: poem.strophes.map((st) => st.groupes.map((g) => [g.debut, g.fin]))
    };
  }

  function current(session) {
    return session.queue[0] || null;
  }

  /** Avancement pour la barre : { done, total }. */
  function progress(session) {
    return { done: session.history.length, total: session.history.length + session.queue.length };
  }

  /** Les vers (indices dans la strophe) d'une étape strophe ou groupe. */
  function itemVers(session, item) {
    if (item.kind === 'groupe') {
      const [a, b] = session._groupes[item.s][item.g];
      return Array.from({ length: b - a }, (_, i) => a + i);
    }
    return session._poemVers[item.s].map((_, v) => v);
  }

  /**
   * Réponse à l'étape en cours : { ok, souffle, missed }.
   * missed : pour une strophe ou un groupe raté, les vers que l'enfant a désignés comme oubliés
   * (indices dans la strophe) ; vide ou absent = tous.
   * 'ecoute' et les niveaux 0-1 (lecture) se valident avec ok = true.
   */
  function answer(session, result, now) {
    const item = session.queue.shift();
    if (!item) return session;
    const ok = !!result.ok;
    const clean = ok && !result.souffle;
    session.history.push({ item, ok, souffle: !!result.souffle });

    if (SCORED[item.purpose] && !item.retry) {
      if (item.kind === 'strophe') session.first[item.s] = clean;
      if (item.kind === 'titre') session.titreOk = clean;
    }

    if (!ok && !item.retry) {
      const extra = [];
      const lower = Math.max(0, item.level - 1);
      const mark = (it) => Object.assign(it, { retry: true, purpose: 'correction', unit: item.unit, id: session.nextId++ });
      if (item.kind === 'vers') {
        if (item.level > 0) extra.push(mark({ kind: 'vers', s: item.s, v: item.v, level: lower }));
        extra.push(mark({ kind: 'vers', s: item.s, v: item.v, level: item.level }));
      } else if (item.kind === 'strophe' || item.kind === 'groupe') {
        const all = itemVers(session, item);
        const missed = (result.missed || []).filter((v) => all.includes(v));
        (missed.length ? missed : all).forEach((v) => extra.push(mark({ kind: 'vers', s: item.s, v, level: lower })));
        extra.push(mark({ kind: item.kind, s: item.s, g: item.g, level: item.level }));
      } else if (item.kind === 'titre') {
        extra.push(mark({ kind: 'titre', level: 1 }));
      }
      session.queue.unshift(...extra);
    }

    const t = now !== undefined ? now : Date.now();
    const next = session.queue[0];
    if (next && t - session.startedAt > LIMIT_MS && next.unit !== item.unit) {
      session.queue = [];
      session.stopped = true;
    }
    return session;
  }

  function isOver(session) {
    return session.queue.length === 0;
  }

  /** Applique la séance aux strophes ; renvoie { states, bilan }. */
  function finish(session, states, date) {
    let out = states.slice();
    session.nouvelles.forEach((n) => { out[n] = Levels.introduce(out[n], date); });
    Object.keys(session.first).forEach((k) => {
      const s = Number(k);
      out[s] = Levels.afterSession(out[s], session.first[s], date);
    });
    const versOk = session.history.filter((h) => h.ok && !h.souffle && h.item.kind !== 'ecoute' && h.item.kind !== 'titre').length;
    const reussies = Object.keys(session.first).filter((k) => session.first[k]).map(Number);
    return { states: out, bilan: { versOk, reussies, nouvelles: session.nouvelles.slice(), stopped: session.stopped } };
  }

  return { LIMIT_MS, create, current, progress, answer, isOver, finish, itemVers };
});
