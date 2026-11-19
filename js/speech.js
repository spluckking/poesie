/*
 * speech.js — La voix de l'appli.
 *
 * Voix principale : Denise (Azure), enregistrée à l'avance dans audio/voix/ par
 * tools/make-voices.js : un fichier par vers, par mot difficile, par consigne, et le titre.
 * Une strophe se lit vers par vers (ce qui permet de surligner le vers lu).
 * Secours : si un fichier manque, la synthèse vocale du navigateur prend le relais.
 */
(function (root) {
  'use strict';

  const synth = root.speechSynthesis;
  let voice = null;
  let enabled = true;

  function pickVoice() {
    if (!synth) return null;
    const fr = synth.getVoices().filter((v) => /^fr/i.test(v.lang));
    const score = (v) => (/fr[-_]FR/i.test(v.lang) ? 10 : 0) + (/denise/i.test(v.name) ? 6 : 0) +
      (/natural|neural|online/i.test(v.name) ? 3 : 0) + (/google/i.test(v.name) ? 2 : 0);
    fr.sort((a, b) => score(b) - score(a));
    voice = fr[0] || null;
    return voice;
  }
  if (synth) {
    pickVoice();
    if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', pickVoice);
  }

  const files = {};
  function load(path) {
    if (!files[path]) {
      files[path] = fetch(path)
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => (b && b.size ? URL.createObjectURL(b) : null))
        .catch(() => null)
        .then((url) => { if (!url) delete files[path]; return url; });
    }
    return files[path];
  }

  let token = 0;
  let audio = null;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function playUrl(url, my) {
    return new Promise((resolve) => {
      if (my !== token) return resolve(true);
      const a = audio = new Audio(url);
      a.onended = () => resolve(true);
      a.onerror = () => resolve(false);
      const p = a.play();
      if (p && p.catch) p.catch(() => resolve(false));
    });
  }

  function speakSynth(text, rate, my) {
    return new Promise((resolve) => {
      if (!synth || !text || my !== token) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR';
      if (voice || pickVoice()) u.voice = voice;
      u.rate = rate || 0.9;
      u.onend = resolve; u.onerror = resolve;
      synth.speak(u);
      setTimeout(resolve, 1500 + text.length * 110); // certains navigateurs n'envoient jamais « end »
    });
  }

  /**
   * Lit une suite de morceaux { kind, text, rate, pause, onstart }.
   * Se résout à la fin (ou quand une autre lecture l'interrompt : renvoie false).
   */
  async function seq(parts) {
    stop();
    const my = token;
    if (!enabled) return true;
    for (const p of parts) {
      if (p.pause) await wait(p.pause);
      if (my !== token) return false;
      if (p.onstart) p.onstart();
      const url = await load(AudioKey.file(p.kind, p.text));
      if (my !== token) return false;
      const ok = url ? await playUrl(url, my) : false;
      if (my !== token) return false;
      if (!ok) await speakSynth(p.text, p.rate, my);
    }
    return my === token;
  }

  function stop() {
    token++;
    if (audio) { audio.pause(); audio = null; }
    if (synth) synth.cancel();
  }

  /** Un vers. */
  function vers(text) { return seq([{ kind: 'vers', text, rate: 0.85 }]); }

  /** Une strophe, vers par vers ; onVers(i) est appelé au début de chaque vers. */
  function strophe(versList, onVers) {
    return seq(versList.map((text, i) => ({ kind: 'vers', text, rate: 0.85, pause: i ? 350 : 0, onstart: () => onVers && onVers(i) })));
  }

  /** La poésie entière : titre puis strophes ; onVers(s, v). */
  function poesie(poem, titleText, onVers) {
    const parts = [{ kind: 'titre', text: titleText, rate: 0.9, onstart: () => onVers && onVers(-1, -1) }];
    poem.strophes.forEach((st, s) => st.vers.forEach((text, v) => parts.push({
      kind: 'vers', text, rate: 0.85, pause: v ? 350 : 800, onstart: () => onVers && onVers(s, v)
    })));
    return seq(parts);
  }

  function titre(text) { return seq([{ kind: 'titre', text, rate: 0.9 }]); }
  function mot(text) { return seq([{ kind: 'mot', text, rate: 0.9 }]); }
  function consigne(text) { return seq([{ kind: 'consigne', text, rate: 1 }]); }

  /** Un seul mot (souffle) : synthèse du navigateur, pas de fichier. */
  function souffle(word) {
    stop();
    return speakSynth(word, 0.8, token);
  }

  /** Charge à l'avance (et met en cache pour le hors-ligne) toutes les voix de la poésie. */
  function preload(poem, titleText, consignes) {
    const list = [AudioKey.file('titre', titleText)];
    poem.strophes.forEach((st) => st.vers.forEach((v) => list.push(AudioKey.file('vers', v))));
    poem.words.forEach((w) => list.push(AudioKey.file('mot', w.w + ' : ' + w.explication)));
    Object.values(consignes).forEach((c) => list.push(AudioKey.file('consigne', c)));
    list.forEach((p, i) => setTimeout(() => load(p), i * 60));
  }

  root.Speech = {
    seq, stop, vers, strophe, poesie, titre, mot, consigne, souffle, preload,
    setEnabled(v) { enabled = !!v; if (!enabled) stop(); },
    get enabled() { return enabled; }
  };
})(self);
