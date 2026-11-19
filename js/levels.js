/*
 * levels.js — Le niveau d'indice de chaque strophe, d'un jour à l'autre.
 *
 * Règles (voir docs/conception.md, 3.2) :
 * - une strophe nouvelle est apprise de 0 à 3 dans la séance, puis gardée au niveau 2 ;
 * - réussie à son niveau (sans souffle) → +1, au plus une fois par jour, jamais le jour
 *   où elle est apprise (la mémoire immédiate est trompeuse) ;
 * - ratée → −1 ;
 * - la récitation du soir prime : « sue » → au moins 4 ; « hésite » → rien ;
 *   « pas sue » → −2 et la strophe devient prioritaire.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Levels = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MAX = 5;
  const AFTER_LEARNING = 2;

  function fresh() {
    return { level: 0, intro: null, promo: null, sue: false, fragile: false, soir: null, selfOk: null, discord: 0 };
  }

  const clamp = (n) => Math.max(0, Math.min(MAX, n));

  /** La strophe vient d'être apprise aujourd'hui. */
  function introduce(st, today) {
    return Object.assign({}, st, { intro: today, level: Math.max(st.level, AFTER_LEARNING) });
  }

  /** Résultat de la strophe dans la séance du jour (ok = tous les vers « pareil », sans souffle). */
  function afterSession(st, ok, today) {
    const s = Object.assign({}, st, { selfOk: { date: today, ok } });
    if (ok) {
      if (s.intro !== today && s.promo !== today) { s.level = clamp(s.level + 1); s.promo = today; }
    } else {
      s.level = clamp(s.level - 1);
      s.fragile = true;
    }
    return s;
  }

  /** Note de la récitation du soir : 'sue' | 'hesite' | 'pas'. */
  function evening(st, note, today) {
    const s = Object.assign({}, st, { soir: { date: today, note } });
    const selfSaidOk = st.selfOk && st.selfOk.date === today && st.selfOk.ok;
    if (note === 'sue') { s.level = Math.max(s.level, 4); s.sue = true; s.fragile = false; }
    if (note === 'hesite') { s.sue = false; }
    if (note === 'pas') {
      s.level = clamp(s.level - 2); s.sue = false; s.fragile = true;
      if (selfSaidOk) s.discord = (s.discord || 0) + 1;
    }
    return s;
  }

  /** La strophe la plus fragile parmi celles déjà apprises (indice ou -1). */
  function weakest(states) {
    let best = -1;
    states.forEach((s, i) => {
      if (!s.intro) return;
      if (best < 0) { best = i; return; }
      const b = states[best];
      const score = (x) => (x.fragile ? -10 : 0) + (x.sue ? 10 : 0) + x.level;
      if (score(s) < score(b)) best = i;
    });
    return best;
  }

  return { MAX, AFTER_LEARNING, fresh, introduce, afterSession, evening, weakest };
});
