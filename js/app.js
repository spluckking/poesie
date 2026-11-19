/*
 * app.js — Les écrans : accueil, découverte, séance, fin, question adulte, espace parent.
 * Toute la logique d'apprentissage est dans poem / cues / levels / planner / session.
 */
(function () {
  'use strict';

  const C = Consignes;
  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');

  let state = Store.load();
  let poem = null;
  let plan = null;
  let ui = {};

  /* ---------------- Outils ---------------- */

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // ?jour=AAAA-MM-JJ : simuler une autre date (essais sur le PC).
  const fakeDay = (location.search.match(/[?&]jour=(\d{4}-\d{2}-\d{2})/) || [])[1];
  const today = () => fakeDay || Planner.today();
  const recit = () => state.recit || poem.date || Planner.addDays(state.start, 14);
  const titleText = () => Poem.titleLine(poem);
  const color = (s) => 'var(--c' + (s % 6) + ')';
  const save = () => Store.save(state);

  const ICON = {
    son: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    croix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    coche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    oreille: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.6"/><path d="M10 9.5a2 2 0 0 1 4 0"/></svg>',
    encore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg>',
    souffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    jouer: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    retour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
  };

  /** Gommette n°n : forme et couleur tournent. */
  function gommette(n, cls) {
    const shapes = [
      '<circle cx="50" cy="50" r="42"/>',
      '<path d="M50 6l12.6 27.4 29.4 3.2-22 19.8 6.2 29L50 70.6 23.8 85.4l6.2-29-22-19.8 29.4-3.2z"/>',
      '<path d="M50 88S10 62 10 34a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 28-40 54-40 54z"/>',
      '<rect x="12" y="12" width="76" height="76" rx="14"/>',
      '<path d="M50 8l42 76H8z"/>',
      '<g><circle cx="50" cy="26" r="18"/><circle cx="74" cy="50" r="18"/><circle cx="50" cy="74" r="18"/><circle cx="26" cy="50" r="18"/><circle cx="50" cy="50" r="14" fill="#fff8" /></g>'
    ];
    const colors = ['#e63946', '#2a9d8f', '#f2a007', '#7b4fbf', '#3a86ff', '#f06d00'];
    const c = colors[(n * 5 + 1) % colors.length];
    return '<svg class="gommette ' + (cls || '') + '" viewBox="0 0 100 100" aria-hidden="true"><g fill="' + c + '" stroke="#0002" stroke-width="2">' +
      shapes[n % shapes.length] + '</g><ellipse cx="38" cy="30" rx="12" ry="7" fill="#fff6" transform="rotate(-30 38 30)"/></svg>';
  }

  function repereHtml(s) {
    const ph = Store.photo(state.poemId, s);
    if (ph) return '<img src="' + ph + '" alt="Mon dessin de la strophe ' + (s + 1) + '">';
    return esc(poem.strophes[s].repere.emoji || '✏️');
  }

  function toast(text, doux) {
    toastEl.textContent = text;
    toastEl.className = 'toast' + (doux ? ' doux' : '');
    toastEl.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { toastEl.hidden = true; }, 900);
  }

  let actx = null;
  function ding() {
    if (!state.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      [660, 990].forEach((f, i) => {
        const o = actx.createOscillator(); const g = actx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        const t = actx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.4);
      });
    } catch (e) { /* pas de son, tant pis */ }
  }

  function marge(extra) {
    const g = state.gommettes.map((x, i) => gommette(i, extra && i === state.gommettes.length - 1 ? 'nouvelle' : '')).join('');
    return '<aside class="marge">' + g + '<button class="adulte" data-a="adulte" aria-label="Espace adulte">Adulte</button></aside>';
  }

  function dayInfo() {
    plan = Planner.make(state.start, recit(), poem.strophes.length);
    return Planner.day(plan, today(), state.strophes);
  }

  function seanceFaite() {
    const s = state.seances[today()];
    return !!(s && s.done);
  }

  function badge() {
    try {
      const info = dayInfo();
      const need = ['apprentissage', 'consolidation', 'sans-indice', 'repetition', 'jour'].includes(info.phase) && !seanceFaite();
      if (navigator.setAppBadge) need ? navigator.setAppBadge(1) : navigator.clearAppBadge();
    } catch (e) { /* API absente */ }
  }

  /* ---------------- Accueil ---------------- */

  function home(fresh) {
    Speech.stop();
    ui = {};
    const info = dayInfo();
    const n = Planner.joursAvant(plan, today());
    const compte = n > 1 ? 'Plus que <b>' + n + '</b> dodos avant de réciter'
      : n === 1 ? '<b>Demain</b>, tu récites !' : n === 0 ? '<b>Aujourd\'hui</b>, tu récites !' : 'Poésie récitée !';

    const chemin = poem.strophes.map((st, s) => {
      const x = state.strophes[s];
      const cls = x.sue ? 'sue' : x.intro ? 'apprise' : '';
      const etat = x.sue ? 'sue' : x.intro ? 'commencée' : 'à venir';
      return '<div class="etape ' + cls + '" style="--c:' + color(s) + '" aria-label="Strophe ' + (s + 1) + ' : ' + etat + '">' +
        '<span class="rep">' + repereHtml(s) + '</span>Strophe ' + (s + 1) + (x.sue ? '<span class="coche">✓</span>' : '') + '</div>';
    }).join('');

    let action = '';
    let dire = C.accueil;
    const faite = seanceFaite();
    if (info.phase === 'avant') { dire = C.avant; action = '<p class="consigne">' + esc(C.avant) + '</p>'; }
    else if (info.phase === 'decouverte') {
      dire = state.decouverteFaite ? C.demain : C.decouverte;
      action = '<p class="consigne">' + esc(dire) + '</p>' +
        '<div class="actions"><button class="btn grand plein" data-a="decouverte">' + ICON.jouer + 'Découvrir la poésie</button></div>';
    } else if (info.phase === 'apres') {
      dire = C.apres; action = '<p class="consigne">' + esc(C.apres) + '</p>';
    } else if (faite) {
      dire = info.phase === 'repetition' ? C.repetitionSoir : info.phase === 'jour' ? C.bonneRecitation : C.dejaFait;
      action = '<p class="consigne">' + esc(dire) + '</p>';
    } else {
      const label = info.phase === 'jour' ? 'Réciter une dernière fois' : 'Ma séance';
      if (info.phase === 'jour') dire = C.jour;
      action = (info.phase === 'jour' ? '<p class="consigne">' + esc(C.jour) + '</p>' : '') +
        '<div class="actions"><button class="btn grand plein" data-a="seance">' + ICON.jouer + label + '</button></div>';
    }

    app.className = 'page';
    app.innerHTML = marge(fresh) +
      '<div class="barre"><div style="flex:1"></div><button class="icone" data-a="dire" aria-label="Écouter">' + ICON.son + '</button></div>' +
      '<h1 class="titre-poesie">' + esc(poem.title) + '</h1>' +
      '<p class="auteur">' + esc(poem.author) + '</p>' +
      '<p class="compte">' + compte + '</p>' +
      '<div class="chemin">' + chemin + '</div>' + action;
    ui.dire = dire;
    badge();
  }

  /* ---------------- Découverte (avec l'adulte) ---------------- */

  function decouverte() {
    Speech.stop();
    const st = poem.strophes.map((x, s) =>
      '<div class="strophe-lecture" style="--c:' + color(s) + '">' +
      '<div class="barre"><span class="repere-grand" style="font-size:48px;margin:0">' + repereHtml(s) + '</span>' +
      '<button class="btn petit discret" data-a="ecouter-strophe" data-s="' + s + '">' + ICON.son + 'Écouter</button></div>' +
      x.vers.map((v, i) => '<p class="vers" data-sv="' + s + '-' + i + '">' + esc(v) + '</p>').join('') +
      (x.repere.geste ? '<p class="geste">Geste : ' + esc(x.repere.geste) + '</p>' : '') + '</div>').join('');
    const mots = poem.words.length ? '<div class="bloc"><h2>Les mots à expliquer</h2><ul class="mots">' +
      poem.words.map((w, i) => '<li><button class="icone" data-a="mot" data-i="' + i + '" aria-label="Écouter">' + ICON.son + '</button><span><b>' +
        esc(w.w) + '</b> : ' + esc(w.explication) + '</span></li>').join('') + '</ul></div>' : '';
    const info = dayInfo();
    app.className = 'page defile';
    app.innerHTML = marge() +
      '<div class="barre"><button class="icone" data-a="accueil" aria-label="Retour">' + ICON.retour + '</button><div style="flex:1"></div></div>' +
      '<h1 class="titre-poesie" data-sv="-1--1">' + esc(poem.title) + '</h1><p class="auteur">' + esc(poem.author) + '</p>' +
      '<div class="note">Pour l\'adulte (10 à 15 minutes) : écoutez la poésie ensemble, expliquez les mots, demandez « de quoi ça parle ? ». ' +
      'Il dessine une image par strophe sur papier et choisit un geste. Prenez les dessins en photo dans l\'espace adulte. On n\'apprend rien par cœur aujourd\'hui.</div>' +
      '<div class="actions" style="margin-top:0"><button class="btn plein" data-a="ecouter-tout">' + ICON.jouer + 'Écouter toute la poésie</button></div>' +
      mots + '<div class="bloc"><h2>Les strophes</h2>' + st + '</div>' +
      (info.phase === 'decouverte' && !state.decouverteFaite
        ? '<div class="actions"><button class="btn ok" data-a="decouverte-ok">' + ICON.coche + 'Découverte finie</button></div>' : '');
  }

  function surligne(sel) {
    app.querySelectorAll('.lu').forEach((e) => e.classList.remove('lu'));
    const el = sel && app.querySelector('[data-sv="' + sel + '"]');
    if (el) { el.classList.add('lu'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }

  /* ---------------- Séance ---------------- */

  function startSeance() {
    const info = dayInfo();
    const session = Session.create(poem, state.strophes, info, Date.now());
    if (Session.isOver(session)) { state.seances[today()] = { done: true, vide: true }; save(); return home(); }
    ui = { session, revealed: false, souffles: new Set(), lastConsigne: null };
    renderItem();
  }

  function itemConsigne(it) {
    if (it.kind === 'ecoute') return C.ecoute;
    if (it.purpose === 'pont' && it.level >= 2) return C.pont;
    if (it.kind === 'titre') return C.titre;
    if (it.kind === 'strophe') return it.purpose === 'rappel' ? C.rappel : C.disStrophe;
    if (it.level === 0) return C.repete;
    if (it.level === 1) return C.lis;
    return C.dis;
  }

  /** Le prochain mot caché de l'étape (pour le souffle) : { key, word } ou null. */
  function nextHidden(it) {
    const lines = itemLines(it);
    for (let li = 0; li < lines.length; li++) {
      const ws = Cues.words(lines[li]);
      const cue = it.level >= 4 ? null : Cues.cue(lines[li], it.level);
      for (let i = 0; i < ws.length; i++) {
        if (!ws[i].word) continue;
        const key = li + ':' + i;
        if ((cue && cue[i].type === 'mot') || ui.souffles.has(key)) continue;
        return { key, word: ws[i].word };
      }
    }
    return null;
  }

  function itemLines(it) {
    if (it.kind === 'titre') return [poem.title, poem.author ? 'de ' + poem.author : ''].filter(Boolean);
    if (it.kind === 'vers') return [poem.strophes[it.s].vers[it.v]];
    return poem.strophes[it.s].vers;
  }

  /** Un vers rendu au niveau donné ; li : numéro de la ligne dans l'étape (mots soufflés : ui.souffles). */
  function lineHtml(line, level, li, cls, sv) {
    const attr = (sv ? ' data-sv="' + sv + '"' : '');
    const souffles = ui.souffles || new Set();
    const any = [...souffles].some((k) => k.startsWith(li + ':'));
    if (level >= 4 && !any) return '<p class="vers vide ' + (cls || '') + '"' + attr + '></p>';
    const full = Cues.cue(line, 0);
    const cue = level >= 4 ? full.map((f) => ({ type: 'trou', lead: f.lead, trail: f.trail, len: f.len })) : Cues.cue(line, level);
    const parts = full.map((f, i) => {
      if (!f.text) return esc(f.lead + f.trail);
      const c = cue[i];
      if (souffles.has(li + ':' + i) || c.type === 'mot') return esc(f.lead + f.text + f.trail);
      if (c.type === 'trou') return esc(c.lead) + '<span class="trou" style="width:' + (0.55 * c.len + 0.4) + 'em"></span>' + esc(c.trail);
      return esc(c.lead) + '<span class="ini">' + esc(c.text) + '</span><span class="ini-suite" style="width:' + (0.45 * c.len) + 'em"></span>' + esc(c.trail);
    }).filter((x) => x !== '');
    return '<p class="vers ' + (cls || '') + '"' + attr + '>' + parts.join(' ') + '</p>';
  }

  function renderItem() {
    const it = Session.current(ui.session);
    if (!it) return finishSeance();
    const pr = Session.progress(ui.session);
    const lines = itemLines(it);
    const revealed = ui.revealed;
    const level = revealed ? 0 : (it.level || 0);

    let label, body = '';
    if (it.kind === 'titre') label = 'Le titre';
    else label = 'Strophe ' + (it.s + 1) + (it.kind === 'vers' ? ' · vers ' + (it.v + 1) : '');

    // L'image de la strophe : petite pendant l'apprentissage, seule au niveau 4,
    // cachée au niveau 5 (le premier « Souffle-moi » la montre).
    let rep = '';
    if (it.kind !== 'titre') {
      const big = !revealed && (it.level === 4 || (it.level >= 5 && ui.image));
      const small = revealed || it.kind === 'ecoute' || it.level <= 3;
      if (big) rep = '<div class="repere-grand' + (it.kind === 'strophe' ? ' compact' : '') + '">' + repereHtml(it.s) + '</div>';
      else if (small) rep = '<div class="repere-moyen" aria-hidden="true">' + repereHtml(it.s) + '</div>';
    }

    if (it.kind === 'ecoute') {
      body = rep + '<div class="strophe">' + lines.map((l, i) => '<p class="vers" data-sv="' + it.s + '-' + i + '">' + esc(l) + '</p>').join('') + '</div>';
    } else if (it.kind === 'vers') {
      const avant = it.v > 0 ? '<p class="vers-avant">' + esc(poem.strophes[it.s].vers[it.v - 1]) + '</p>' : '';
      body = rep + avant + lineHtml(lines[0], level, 0, revealed ? 'revele' : '', it.s + '-' + it.v);
    } else if (it.kind === 'strophe') {
      body = rep + '<div class="strophe">' + lines.map((l, i) => lineHtml(l, level, i, revealed ? 'revele' : '', it.s + '-' + i)).join('') + '</div>';
    } else if (it.kind === 'titre') {
      body = '<div class="strophe">' + lines.map((l, i) => lineHtml(l, level, i, revealed ? 'revele' : '', 't-' + i)).join('') + '</div>';
    }

    let actions;
    if (it.kind === 'ecoute') {
      actions = btn('encore', ICON.encore + 'Encore', 'discret') + btn('suivant', 'À moi !', 'plein');
    } else if (it.kind === 'vers' && it.level === 0 && !revealed) {
      actions = btn('encore', ICON.encore + 'Encore', 'discret') + btn('suivant', ICON.coche + 'J\'ai répété', 'plein');
    } else if (it.kind !== 'titre' && it.level === 1 && !revealed) {
      actions = btn('suivant', ICON.coche + 'C\'est fait', 'plein');
    } else if (!revealed) {
      actions = btn('souffle', ICON.souffle + 'Souffle-moi', 'discret') + btn('verifier', ICON.oreille + 'Vérifier', 'plein');
    } else {
      actions = btn('pas-pareil', ICON.croix + 'Pas pareil', 'ko') + btn('pareil', ICON.coche + 'Pareil', 'ok');
    }

    app.className = 'page';
    app.innerHTML = marge() +
      '<div class="barre"><button class="icone" data-a="quitter" aria-label="Arrêter la séance">' + ICON.croix + '</button>' +
      '<div class="avance" role="progressbar" aria-valuemin="0" aria-valuemax="' + pr.total + '" aria-valuenow="' + pr.done + '"><i style="width:' + Math.round(100 * pr.done / Math.max(1, pr.total)) + '%"></i></div>' +
      '<button class="icone" data-a="redire" aria-label="Réécouter la consigne">' + ICON.son + '</button></div>' +
      '<span class="puce" style="--c:' + (it.kind === 'titre' ? 'var(--encre)' : color(it.s)) + '">' + esc(label) + '</span>' +
      '<div class="scene">' + body + '</div>' +
      '<p class="consigne">' + esc(revealed ? C.compare : itemConsigne(it)) + '</p>' +
      '<div class="actions">' + actions + '</div>';

    if (!revealed) autoplay(it);
  }

  function btn(a, html, cls) { return '<button class="btn ' + cls + '" data-a="' + a + '">' + html + '</button>'; }

  async function autoplay(it) {
    const c = itemConsigne(it);
    const say = c !== ui.lastConsigne;
    ui.lastConsigne = c;
    if (it.kind === 'ecoute') {
      if (say) await Speech.consigne(c);
      return playLines(it);
    }
    if (it.kind === 'vers' && it.level === 0) {
      if (say && !(await Speech.consigne(c))) return;
      return playLines(it);
    }
    if (say) Speech.consigne(c);
  }

  function playLines(it) {
    if (it.kind === 'titre') return Speech.titre(titleText());
    if (it.kind === 'vers') {
      surligne(it.s + '-' + it.v);
      return Speech.vers(poem.strophes[it.s].vers[it.v]).then(() => surligne(null));
    }
    return Speech.strophe(poem.strophes[it.s].vers, (i) => surligne(it.s + '-' + i)).then((done) => { if (done) surligne(null); });
  }

  function answer(ok) {
    const it = Session.current(ui.session);
    Session.answer(ui.session, { ok, souffle: ui.souffles.size > 0 || ui.image }, Date.now());
    Speech.stop();
    if (it.kind !== 'ecoute' && !(it.level <= 1 && it.kind === 'vers')) {
      if (ok) { ding(); toast([C.bravo1, C.bravo2, C.bravo3][ui.session.history.length % 3]); }
      else toast('Pas grave, on le refait.', true);
    }
    ui.revealed = false;
    ui.souffles = new Set();
    ui.image = false;
    setTimeout(renderItem, ok ? 250 : 500);
  }

  function finishSeance() {
    const date = today();
    const res = Session.finish(ui.session, state.strophes, date);
    state.strophes = res.states;
    state.seances[date] = Object.assign({ done: true }, res.bilan);
    const nouvelle = !state.gommettes.some((g) => g.date === date);
    if (nouvelle) state.gommettes.push({ date, n: state.gommettes.length });
    save();

    const b = res.bilan;
    const lignes = [];
    if (b.nouvelles.length) lignes.push('Tu as appris la strophe ' + b.nouvelles.map((n) => n + 1).join(' et ') + ' !');
    if (b.reussies.length) lignes.push('Tu as dit ' + b.reussies.length + ' strophe' + (b.reussies.length > 1 ? 's' : '') + ' sans te tromper.');
    if (b.stopped) lignes.push('On s\'arrête là pour aujourd\'hui, c\'est très bien.');
    if (!lignes.length) lignes.push('Tu t\'es bien entraîné.');

    app.className = 'page';
    app.innerHTML = marge(nouvelle) +
      '<div class="fin">' + gommette(state.gommettes.length - 1) +
      '<h1>Séance finie !</h1>' + lignes.map((l) => '<p>' + esc(l) + '</p>').join('') +
      '<p class="consigne">' + (ui.session.phase === 'jour' ? 'Bonne récitation en classe !' : 'Ce soir, récite ta poésie à un adulte.') + '</p></div>' +
      '<div class="actions">' + btn('accueil', 'Retour à ma poésie', 'plein') + '</div>';
    if (ui.session.phase !== 'jour') Speech.consigne(C.fin);
    badge();
  }

  /* ---------------- Espace adulte ---------------- */

  function gate() {
    Speech.stop();
    const a = 3 + Math.floor(Math.random() * 7);
    const b = 3 + Math.floor(Math.random() * 7);
    ui = { gate: a * b };
    app.className = 'page';
    app.innerHTML = marge() +
      '<div class="barre"><button class="icone" data-a="accueil" aria-label="Retour">' + ICON.retour + '</button></div>' +
      '<h1 class="titre-poesie">Espace adulte</h1>' +
      '<form class="champ" id="gate"><label for="g">Combien font ' + a + ' × ' + b + ' ?</label>' +
      '<input id="g" type="number" inputmode="numeric" autocomplete="off" required>' +
      '<button class="btn petit plein" type="submit">Entrer</button></form>';
    app.querySelector('#gate').addEventListener('submit', (e) => {
      e.preventDefault();
      if (Number(app.querySelector('#g').value) === ui.gate) parent('soir');
      else { app.querySelector('#g').value = ''; toast('Ce n\'est pas ça.', true); }
    });
    app.querySelector('#g').focus();
  }

  function parent(tab) {
    Speech.stop();
    ui = { tab, soir: {} };
    const tabs = [['soir', 'Ce soir'], ['planning', 'Planning'], ['reperes', 'Repères'], ['reglages', 'Réglages']];
    const content = { soir: tabSoir, planning: tabPlanning, reperes: tabReperes, reglages: tabReglages }[tab]();
    app.className = 'page defile';
    app.innerHTML = marge() +
      '<div class="barre"><button class="icone" data-a="accueil" aria-label="Retour">' + ICON.retour + '</button>' +
      '<div class="onglets" role="tablist">' + tabs.map(([k, l]) => '<button role="tab" data-tab="' + k + '" aria-selected="' + (k === tab) + '">' + l + '</button>').join('') + '</div></div>' +
      '<h1 class="titre-poesie" style="font-size:30px">' + esc(poem.title) + '</h1>' + content;
    if (tab === 'reperes') bindPhotos();
    if (tab === 'reglages') bindReglages();
  }

  function tabSoir() {
    const date = today();
    const apprises = poem.strophes.map((_, s) => s).filter((s) => state.strophes[s].intro);
    if (!apprises.length) return '<p>Aucune strophe apprise pour l\'instant : rien à réciter ce soir.</p>';
    const deja = state.soirs[date];
    const info = dayInfo();
    const rg = info.phase === 'repetition' ? '<div class="note"><b>Ce soir : répétition générale.</b> Debout, devant quelqu\'un, avec le titre et l\'auteur, comme en classe.</div>' : '';
    if (deja) {
      const txt = { sue: 'sue', hesite: 'hésitation', pas: 'pas sue' };
      return rg + '<p class="calme">Récitation de ce soir notée.</p><ul>' +
        apprises.map((s) => '<li>Strophe ' + (s + 1) + ' : ' + (txt[deja['s' + s]] || 'non notée') + '</li>').join('') + '</ul>' +
        '<div class="actions">' + btn('soir-modifier', 'Corriger la note', 'discret') + '</div>';
    }
    return rg + '<div class="note">Juste avant le coucher, 2 minutes, <b>sans rien regarder</b>. Il commence par le titre et l\'auteur. ' +
      'Notez chaque strophe. Le ton se travaille ici : dites-lui un vers en marquant bien le rythme, il imite.</div>' +
      apprises.map((s) => '<div class="ligne-soir"><span class="nom">' + repereHtml(s) + ' Strophe ' + (s + 1) + '</span><div class="choix" data-s="' + s + '">' +
        [['sue', 'Sue'], ['hesite', 'Hésite'], ['pas', 'Pas sue']].map(([n, l]) =>
          '<button data-a="note" data-n="' + n + '" aria-pressed="false">' + l + '</button>').join('') + '</div></div>').join('') +
      '<div class="actions">' + btn('soir-ok', ICON.coche + 'Enregistrer', 'ok') + '</div>';
  }

  function tabPlanning() {
    const info = dayInfo();
    const discord = state.strophes.reduce((n, s) => n + (s.discord || 0), 0);
    const statut = info.retard
      ? '<p class="alerte">En retard de ' + info.retard + ' strophe' + (info.retard > 1 ? 's' : '') + ' : l\'appli rattrape (jusqu\'à 2 strophes par jour).</p>'
      : '<p class="calme">À l\'heure.</p>';
    const alerte = discord >= 2
      ? '<div class="note">Il dit souvent « pareil » alors que le soir la strophe n\'est pas sue (' + discord + ' fois). Regardez une séance avec lui ; si ça continue, la vérification à la voix (V2) devient utile.</div>' : '';
    const rows = [];
    for (let d = 0; d <= plan.D; d++) {
      const date = Planner.addDays(plan.start, d);
      const intro = plan.introDays.map((x, i) => (x === d ? i + 1 : 0)).filter(Boolean);
      let quoi;
      if (d === 0) quoi = 'Découverte avec l\'adulte';
      else if (d === plan.D) quoi = 'Récitation en classe';
      else if (d === plan.D - 1) quoi = 'Répétition générale';
      else if (d >= plan.D - 3) quoi = 'Toute la poésie, sans indice';
      else if (intro.length) quoi = 'Strophe ' + intro.join(' et ') + ' à apprendre';
      else quoi = 'Révision';
      const sc = state.seances[date];
      const so = state.soirs[date];
      const soirTxt = so ? Object.keys(so).map((k) => ({ sue: '✓', hesite: '~', pas: '✗' }[so[k]])).join(' ') : '';
      rows.push('<tr class="' + (date === today() ? 'auj' : '') + '"><td>' + (d === plan.D ? 'J' : 'J' + d) + '</td><td>' + date.slice(8) + '/' + date.slice(5, 7) +
        '</td><td>' + quoi + '</td><td>' + (sc && sc.done ? '✓' : '') + '</td><td>' + soirTxt + '</td></tr>');
    }
    const niveaux = poem.strophes.map((_, s) => {
      const x = state.strophes[s];
      return '<li>Strophe ' + (s + 1) + ' : ' + (x.intro ? 'indice « ' + Cues.NAMES[x.level] + ' »' + (x.sue ? ', sue' : '') + (x.fragile ? ', fragile' : '') : 'pas encore apprise') + '</li>';
    }).join('');
    return statut + alerte + '<ul>' + niveaux + '</ul>' +
      '<table class="planning"><thead><tr><th>Jour</th><th>Date</th><th>Au programme</th><th>Séance</th><th>Soir</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>';
  }

  function tabReperes() {
    return '<p>Prenez en photo le dessin de chaque strophe : il remplace l\'émoji et sert d\'indice.</p>' +
      poem.strophes.map((x, s) => {
        const ph = Store.photo(state.poemId, s);
        return '<div class="ligne-soir"><span class="nom">Strophe ' + (s + 1) + ' ' + esc(x.repere.emoji) + (x.repere.geste ? '<br><small class="geste">' + esc(x.repere.geste) + '</small>' : '') + '</span>' +
          (ph ? '<img class="photo-rep" src="' + ph + '" alt="">' : '') +
          '<label class="btn petit discret">Photo<input type="file" accept="image/*" capture="environment" data-photo="' + s + '" hidden></label>' +
          (ph ? '<button class="btn petit ko" data-a="photo-retirer" data-s="' + s + '">Retirer</button>' : '') + '</div>';
      }).join('');
  }

  function bindPhotos() {
    app.querySelectorAll('input[data-photo]').forEach((input) => input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      if (!f) return;
      const img = new Image();
      img.onload = () => {
        const max = 480;
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        if (!Store.setPhoto(state.poemId, Number(input.dataset.photo), c.toDataURL('image/jpeg', 0.75))) toast('Mémoire pleine', true);
        URL.revokeObjectURL(img.src);
        parent('reperes');
      };
      img.src = URL.createObjectURL(f);
    }));
  }

  function tabReglages() {
    return '<div class="champ"><label for="start">Jour de la découverte (J0)</label><input type="date" id="start" value="' + esc(state.start) + '"></div>' +
      '<div class="champ"><label for="recit">Date de récitation</label><input type="date" id="recit" value="' + esc(recit()) + '">' +
      (state.recit ? '<small>(choisie ici ; celle du fichier : ' + esc(poem.date || 'aucune') + ')</small>' : '') + '</div>' +
      '<div class="champ"><label><input type="checkbox" id="son"' + (state.settings.sound ? ' checked' : '') + '> Voix et sons</label></div>' +
      '<div class="actions" style="margin-top:8px">' + btn('decouverte', 'Ouvrir la découverte', 'discret') + btn('exporter', 'Sauvegarder (fichier)', 'discret') +
      '<label class="btn discret">Restaurer<input type="file" accept="application/json" id="importer" hidden></label>' + btn('reset', 'Recommencer cette poésie', 'ko') + '</div>';
  }

  function bindReglages() {
    app.querySelector('#start').addEventListener('change', (e) => { if (e.target.value) { state.start = e.target.value; save(); toast('Enregistré', true); } });
    app.querySelector('#recit').addEventListener('change', (e) => { if (e.target.value) { state.recit = e.target.value; save(); toast('Enregistré', true); } });
    app.querySelector('#son').addEventListener('change', (e) => { state.settings.sound = e.target.checked; Speech.setEnabled(e.target.checked); save(); });
    app.querySelector('#importer').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      f.text().then((t) => { Store.importAll(t); state = Store.load(); Store.sync(state, poem, today()); save(); toast('Restauré', true); parent('reglages'); })
        .catch((err) => alert('Restauration impossible : ' + err.message));
    });
  }

  /* ---------------- Clics ---------------- */

  app.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) return parent(tabBtn.dataset.tab);
    const el = e.target.closest('[data-a]');
    if (!el) return;
    const a = el.dataset.a;
    const it = ui.session && Session.current(ui.session);
    switch (a) {
      case 'accueil': return home();
      case 'adulte': return gate();
      case 'dire': return Speech.consigne(ui.dire || C.accueil);
      case 'seance': return startSeance();
      case 'decouverte': return decouverte();
      case 'decouverte-ok': state.decouverteFaite = true; save(); return home();
      case 'ecouter-tout': return Speech.poesie(poem, titleText(), (s, v) => surligne(s + '-' + v)).then((d) => { if (d) surligne(null); });
      case 'ecouter-strophe': { const s = Number(el.dataset.s); return Speech.strophe(poem.strophes[s].vers, (i) => surligne(s + '-' + i)).then((d) => { if (d) surligne(null); }); }
      case 'mot': { const w = poem.words[Number(el.dataset.i)]; return Speech.mot(w.w + ' : ' + w.explication); }
      case 'quitter': return home();
      case 'redire': return it && (ui.revealed ? Speech.consigne(C.compare) : Speech.consigne(itemConsigne(it)));
      case 'encore': return it && playLines(it);
      case 'suivant': return answer(true);
      case 'souffle': {
        // Premier souffle au niveau 5 : l'image de la strophe, pas encore les mots.
        if (it.kind !== 'titre' && it.level >= 5 && !ui.image) { ui.image = true; return renderItem(); }
        const w = nextHidden(it);
        if (!w) return;
        ui.souffles.add(w.key);
        renderItem();
        return Speech.souffle(w.word);
      }
      case 'verifier':
        ui.revealed = true;
        renderItem();
        return playLines(it);
      case 'pareil': return answer(true);
      case 'pas-pareil': return answer(false);
      case 'note': {
        const box = el.closest('.choix');
        box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
        ui.soir['s' + box.dataset.s] = el.dataset.n;
        return;
      }
      case 'soir-ok': {
        const date = today();
        const notes = ui.soir;
        if (!Object.keys(notes).length) return toast('Notez au moins une strophe', true);
        state.soirAvant = { date, strophes: JSON.parse(JSON.stringify(state.strophes)) };
        Object.keys(notes).forEach((k) => { const s = Number(k.slice(1)); state.strophes[s] = Levels.evening(state.strophes[s], notes[k], date); });
        state.soirs[date] = notes;
        save();
        toast('Noté', true);
        return parent('soir');
      }
      case 'soir-modifier': {
        const date = today();
        if (state.soirAvant && state.soirAvant.date === date) state.strophes = state.soirAvant.strophes;
        delete state.soirs[date];
        save();
        return parent('soir');
      }
      case 'photo-retirer': Store.setPhoto(state.poemId, Number(el.dataset.s), null); return parent('reperes');
      case 'exporter': {
        const blob = new Blob([Store.exportAll()], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'poesie-sauvegarde-' + today() + '.json';
        link.click();
        return;
      }
      case 'reset':
        if (!confirm('Effacer la progression de cette poésie ? Les gommettes sont gardées.')) return;
        state.strophes = poem.strophes.map(() => Levels.fresh());
        state.seances = {}; state.soirs = {}; state.soirAvant = null; state.decouverteFaite = false; state.start = today();
        save();
        return parent('reglages');
    }
  });

  /* ---------------- Démarrage ---------------- */

  function fatal(msg) {
    app.className = 'page';
    app.innerHTML = '<h1 class="titre-poesie">Ma poésie</h1><p>' + esc(msg) + '</p>';
  }

  async function boot() {
    let text = '';
    try {
      const r = await fetch('poesie.txt', { cache: 'no-store' });
      if (r.ok) text = await r.text();
    } catch (e) { /* hors ligne : le service worker répond depuis le cache */ }
    if (!text) return fatal('Pas de poésie pour l\'instant : demande à un adulte de l\'ajouter.');
    poem = Poem.parse(text);
    if (!poem.strophes.length) return fatal('Le fichier de la poésie est vide ou mal écrit.');
    Store.sync(state, poem, today());
    save();
    Speech.setEnabled(state.settings.sound);
    Speech.preload(poem, titleText(), C);
    home();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !ui.session && !ui.tab) home(); });
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  boot();
})();
