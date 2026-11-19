'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const Poem = require('../js/poem.js');
const Cues = require('../js/cues.js');
const Levels = require('../js/levels.js');
const Planner = require('../js/planner.js');
const Session = require('../js/session.js');

const SAMPLE = fs.readFileSync(path.join(__dirname, 'fixtures', 'exemple.txt'), 'utf8');

/* ---------------- poem.js ---------------- */

test('lit titre, auteur, date, mots difficiles, repères et strophes', () => {
  const p = Poem.parse(SAMPLE);
  assert.equal(p.title, "L'escargot du jardin");
  assert.equal(p.author, 'Lou Plume');
  assert.equal(p.date, '2026-12-03');
  assert.equal(p.words.length, 2);
  assert.deepEqual(p.words[1], { w: 'sucrée', explication: 'qui a le goût du sucre' });
  assert.equal(p.strophes.length, 3);
  assert.equal(p.strophes[0].vers.length, 4);
  assert.equal(p.strophes[0].vers[3], "Il avance, c'est sûr.");
  assert.equal(p.strophes[1].repere.emoji, '🌧️');
  assert.equal(p.strophes[2].repere.geste, 'les mains sous la joue pour dormir');
  assert.deepEqual(Poem.check(p), []);
});

test('strophes sans repère, apostrophes typographiques, commentaires', () => {
  const p = Poem.parse('# T\n@ A\n// rien\nL’oiseau chante\nbien\n\n\nUn autre');
  assert.equal(p.strophes.length, 2);
  assert.equal(p.strophes[0].vers[0], "L'oiseau chante");
  assert.equal(p.strophes[0].repere.emoji, '');
  assert.ok(Poem.check(p).some((x) => /date/.test(x)));
});

test('même titre et auteur → même identifiant', () => {
  assert.equal(Poem.parse(SAMPLE).id, Poem.parse(SAMPLE.replace('chou', 'choux')).id);
  assert.notEqual(Poem.parse(SAMPLE).id, Poem.parse(SAMPLE.replace('# L', '# Le')).id);
});

/* ---------------- cues.js ---------------- */

test('niveaux 0 et 1 : texte complet', () => {
  assert.equal(Cues.asText('Grimpe le long du mur,', 0), 'Grimpe le long du mur,');
  assert.equal(Cues.asText('Grimpe le long du mur,', 1), 'Grimpe le long du mur,');
});

test('niveau 2 : un mot sur deux masqué, la rime reste, la ponctuation aussi', () => {
  assert.equal(Cues.asText('Grimpe le long du mur,', 2), 'Grimpe ___ long ___ mur,');
  assert.equal(Cues.asText('Le soir, sous la lune,', 2), 'Le ____, sous ___ lune,');
});

test('niveau 3 : initiales, apostrophe gardée', () => {
  assert.equal(Cues.asText("Il avance, c'est sûr.", 3), "I… a…, c'e… s….");
  assert.equal(Cues.initial("l'escargot"), "l'e");
});

test('niveaux 4 et 5 : rien du vers', () => {
  assert.deepEqual(Cues.cue('Un petit escargot', 4), []);
  assert.deepEqual(Cues.cue('Un petit escargot', 5), []);
});

/* ---------------- levels.js ---------------- */

test('apprise → niveau 2, pas de promotion le jour même', () => {
  let s = Levels.introduce(Levels.fresh(), '2026-11-20');
  assert.equal(s.level, 2);
  s = Levels.afterSession(s, true, '2026-11-20');
  assert.equal(s.level, 2);
  s = Levels.afterSession(s, true, '2026-11-21');
  assert.equal(s.level, 3);
  s = Levels.afterSession(s, true, '2026-11-21');
  assert.equal(s.level, 3, 'au plus une promotion par jour');
});

test('ratée → −1 et fragile ; soir « pas sue » → −2 et désaccord compté', () => {
  let s = Object.assign(Levels.fresh(), { intro: '2026-11-18', level: 4 });
  s = Levels.afterSession(s, false, '2026-11-21');
  assert.equal(s.level, 3);
  assert.equal(s.fragile, true);
  s = Levels.afterSession(s, true, '2026-11-22');
  s = Levels.evening(s, 'pas', '2026-11-22');
  assert.equal(s.level, 2);
  assert.equal(s.discord, 1);
});

test('soir « sue » → au moins 4, plus fragile', () => {
  let s = Object.assign(Levels.fresh(), { intro: '2026-11-18', level: 2, fragile: true });
  s = Levels.evening(s, 'sue', '2026-11-20');
  assert.equal(s.level, 4);
  assert.equal(s.sue, true);
  assert.equal(s.fragile, false);
});

test('la strophe la plus fragile', () => {
  const a = Object.assign(Levels.fresh(), { intro: 'x', level: 4 });
  const b = Object.assign(Levels.fresh(), { intro: 'x', level: 3, fragile: true });
  const c = Levels.fresh();
  assert.equal(Levels.weakest([a, b, c]), 1);
  assert.equal(Levels.weakest([c]), -1);
});

/* ---------------- planner.js ---------------- */

test('14 jours, 4 strophes : une tous les 2 jours, J1 J3 J5 J7', () => {
  const p = Planner.make('2026-11-19', '2026-12-03', 4);
  assert.equal(p.D, 14);
  assert.deepEqual(p.introDays, [1, 3, 5, 7]);
});

test('délai court : plusieurs strophes par jour, jamais après la veille', () => {
  const p = Planner.make('2026-11-19', '2026-11-24', 4); // D = 5, W = 1
  assert.ok(p.tight);
  assert.ok(p.introDays.every((d) => d >= 1 && d <= 4));
});

test('délai long : au plus une strophe tous les 3 jours', () => {
  const p = Planner.make('2026-11-01', '2026-12-01', 3);
  assert.deepEqual(p.introDays, [1, 4, 7]);
});

test('phases du planning', () => {
  const p = Planner.make('2026-11-19', '2026-12-03', 2);
  const none = [Levels.fresh(), Levels.fresh()];
  const all = none.map((s) => Object.assign({}, s, { intro: '2026-11-20' }));
  assert.equal(Planner.day(p, '2026-11-19', none).phase, 'decouverte');
  const j1 = Planner.day(p, '2026-11-20', none);
  assert.equal(j1.phase, 'apprentissage');
  assert.deepEqual(j1.nouvelles, [0]);
  assert.equal(Planner.day(p, '2026-11-26', all).phase, 'consolidation');
  assert.equal(Planner.day(p, '2026-11-30', all).phase, 'sans-indice');
  assert.equal(Planner.day(p, '2026-12-02', all).phase, 'repetition');
  assert.equal(Planner.day(p, '2026-12-03', all).phase, 'jour');
  assert.equal(Planner.day(p, '2026-12-04', all).phase, 'apres');
});

test('séance manquée : la strophe en retard est proposée, le retard est signalé', () => {
  const p = Planner.make('2026-11-19', '2026-12-03', 4);
  const states = [Levels.fresh(), Levels.fresh(), Levels.fresh(), Levels.fresh()];
  const info = Planner.day(p, '2026-11-24', states); // d = 5 : 3 strophes attendues
  assert.equal(info.retard, 3);
  assert.deepEqual(info.nouvelles, [0]);
});

test('en retard près de la fin : deux strophes le même jour', () => {
  const p = Planner.make('2026-11-19', '2026-12-03', 4);
  const s = (intro) => Object.assign(Levels.fresh(), intro ? { intro: '2026-11-20', level: 3 } : {});
  const info = Planner.day(p, '2026-11-28', [s(1), s(0), s(0), s(0)]); // d = 9, 3 restantes, 2 jours
  assert.deepEqual(info.nouvelles, [1, 2]);
});

test('dates : jours entre deux dates, changement d\'heure', () => {
  assert.equal(Planner.daysBetween('2026-10-24', '2026-10-26'), 2);
  assert.equal(Planner.addDays('2026-12-31', 1), '2027-01-01');
});

/* ---------------- session.js ---------------- */

const poem = Poem.parse(SAMPLE);

function run(session, answers, t0) {
  let t = t0 || 0;
  while (!Session.isOver(session)) {
    const it = Session.current(session);
    const r = answers(it) || { ok: true };
    Session.answer(session, r, (t += 10000));
  }
  return session;
}

test('premier jour : écoute, échelle 0→3 par vers, strophe, pas de rappel', () => {
  const states = poem.strophes.map(() => Levels.fresh());
  const s = Session.create(poem, states, { phase: 'apprentissage', nouvelles: [0] }, 0);
  const kinds = s.queue.map((x) => x.kind + (x.level !== undefined ? x.level : ''));
  assert.equal(kinds[0], 'ecoute');
  assert.deepEqual(kinds.slice(1, 5), ['vers0', 'vers1', 'vers2', 'vers3']);
  assert.equal(kinds[kinds.length - 1], 'strophe2');
  run(s, () => ({ ok: true }));
  const { states: after } = Session.finish(s, states, '2026-11-20');
  assert.equal(after[0].intro, '2026-11-20');
  assert.equal(after[0].level, 2);
});

test('jour suivant : rappel de la strophe 1, strophe 2, puis pont', () => {
  const states = poem.strophes.map(() => Levels.fresh());
  states[0] = Object.assign(states[0], { intro: '2026-11-20', level: 2 });
  const s = Session.create(poem, states, { phase: 'apprentissage', nouvelles: [1] }, 0);
  assert.equal(s.queue[0].purpose, 'rappel');
  const pont = s.queue.filter((x) => x.purpose === 'pont');
  assert.deepEqual(pont.map((x) => [x.s, x.v]), [[0, 3], [1, 0]]);
  run(s, () => ({ ok: true }));
  const { states: after } = Session.finish(s, states, '2026-11-21');
  assert.equal(after[0].level, 3, 'rappel réussi → +1');
  assert.equal(after[1].level, 2);
});

test('« pas pareil » sur un vers : un niveau plus bas, puis au même niveau', () => {
  const states = poem.strophes.map(() => Levels.fresh());
  const s = Session.create(poem, states, { phase: 'apprentissage', nouvelles: [0] }, 0);
  while (!(Session.current(s).kind === 'vers' && Session.current(s).level === 2)) Session.answer(s, { ok: true }, 1);
  Session.answer(s, { ok: false }, 2);
  assert.deepEqual([Session.current(s).level, s.queue[1].level], [1, 2]);
  assert.ok(s.queue[0].retry && s.queue[1].retry);
});

test('rappel raté : vers de la strophe un niveau plus bas, la strophe redescend', () => {
  const states = poem.strophes.map(() => Levels.fresh());
  states[0] = Object.assign(states[0], { intro: '2026-11-20', level: 3 });
  const s = Session.create(poem, states, { phase: 'apprentissage', nouvelles: [] }, 0);
  Session.answer(s, { ok: false }, 1);
  assert.equal(s.queue.slice(0, 4).every((x) => x.kind === 'vers' && x.level === 2), true);
  assert.equal(s.queue[4].kind, 'strophe');
  run(s, () => ({ ok: true }));
  const { states: after } = Session.finish(s, states, '2026-11-22');
  assert.equal(after[0].level, 2);
});

test('souffle : la strophe ne compte pas comme réussie', () => {
  const states = poem.strophes.map(() => Levels.fresh());
  states[0] = Object.assign(states[0], { intro: '2026-11-20', level: 3 });
  const s = Session.create(poem, states, { phase: 'apprentissage', nouvelles: [] }, 0);
  Session.answer(s, { ok: true, souffle: true }, 1);
  assert.equal(s.first[0], false);
});

test('sans indice : titre et strophes au niveau 5', () => {
  const states = poem.strophes.map(() => Object.assign(Levels.fresh(), { intro: 'x', level: 4 }));
  const s = Session.create(poem, states, { phase: 'sans-indice', nouvelles: [] }, 0);
  assert.equal(s.queue[0].kind, 'titre');
  assert.ok(s.queue.slice(1).every((x) => x.kind === 'strophe' && x.level === 5));
});

test('au-delà de 7 minutes, la séance s\'arrête à la fin de l\'étape', () => {
  const states = poem.strophes.map(() => Levels.fresh());
  const s = Session.create(poem, states, { phase: 'apprentissage', nouvelles: [0] }, 0);
  Session.answer(s, { ok: true }, 8 * 60 * 1000);
  assert.ok(s.queue.length > 0, 'même étape : on continue');
  const s2 = Session.create(poem, states.map((x, i) => i === 0 ? Object.assign({}, x, { intro: 'x', level: 2 }) : x),
    { phase: 'apprentissage', nouvelles: [1] }, 0);
  Session.answer(s2, { ok: true }, 8 * 60 * 1000);
  assert.ok(Session.isOver(s2));
  assert.ok(s2.stopped);
});
