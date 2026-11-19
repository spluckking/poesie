/*
 * planner.js — Le planning de la feuille à la classe.
 *
 * J0 = jour de la découverte (avec l'adulte, rien à mémoriser).
 * D  = nombre de jours entre J0 et la date de récitation.
 * Fenêtre d'apprentissage W = D − 4 : une strophe nouvelle tous les k jours,
 * k = W ÷ S arrondi vers le bas, entre 1 et 3 (plusieurs par jour si W < S).
 * J-3 et J-2 : la poésie entière sans indice. J-1 : répétition générale.
 * Jour J : une récitation le matin. Ensuite : entretien.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Planner = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /** Date locale du jour au format AAAA-MM-JJ. */
  function today(now) {
    const d = now ? new Date(now) : new Date();
    return iso(d);
  }

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function parseIso(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 12); // midi : à l'abri des changements d'heure
  }

  function daysBetween(a, b) {
    return Math.round((parseIso(b) - parseIso(a)) / 86400000);
  }

  function addDays(a, n) {
    const d = parseIso(a);
    d.setDate(d.getDate() + n);
    return iso(d);
  }

  /** Jour d'introduction (indice de jour depuis J0) de chaque strophe. */
  function make(start, recit, nStrophes) {
    const D = Math.max(1, daysBetween(start, recit));
    const W = Math.max(1, D - 4);
    const ratio = W / Math.max(1, nStrophes);
    const step = ratio >= 1 ? Math.max(1, Math.min(3, Math.floor(ratio))) : ratio;
    const lastAllowed = Math.max(1, D - 1);
    const introDays = [];
    for (let i = 0; i < nStrophes; i++) introDays.push(Math.min(lastAllowed, 1 + Math.floor(i * step + 1e-9)));
    return { start, recit, D, W, step, introDays, tight: ratio < 1 };
  }

  /**
   * Ce qu'il faut faire le jour `date`.
   * states : état de chaque strophe (levels.js), pour savoir ce qui est déjà appris.
   * → { d, phase, nouvelles: [indices], retard, attendues, apprises }
   * phase : 'avant' | 'decouverte' | 'apprentissage' | 'consolidation' | 'sans-indice'
   *         | 'repetition' | 'jour' | 'apres'
   */
  function day(plan, date, states) {
    const d = daysBetween(plan.start, date);
    const apprises = states.filter((s) => s.intro).length;
    const attendues = plan.introDays.filter((x) => x <= d).length;
    const all = apprises >= states.length;
    let phase;
    if (d < 0) phase = 'avant';
    else if (d === 0) phase = 'decouverte';
    else if (d === plan.D) phase = 'jour';
    else if (d > plan.D) phase = 'apres';
    else if (!all) phase = 'apprentissage';
    else if (d === plan.D - 1) phase = 'repetition';
    else if (d >= plan.D - 3) phase = 'sans-indice';
    else phase = 'consolidation';

    let nouvelles = [];
    if (phase === 'apprentissage') {
      const dues = [];
      states.forEach((s, i) => { if (!s.intro && plan.introDays[i] <= d) dues.push(i); });
      const restants = states.length - apprises;
      const joursRestants = Math.max(1, plan.D - 3 - d);
      const max = restants > joursRestants || plan.tight ? 2 : 1;
      nouvelles = dues.slice(0, max);
    }
    return { d, phase, nouvelles, retard: Math.max(0, attendues - apprises), attendues, apprises };
  }

  /** Jours restants avant la récitation (0 = c'est aujourd'hui). */
  function joursAvant(plan, date) {
    return daysBetween(date, plan.recit);
  }

  return { today, iso, parseIso, daysBetween, addDays, make, day, joursAvant };
});
