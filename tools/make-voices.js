#!/usr/bin/env node
/*
 * make-voices.js — Enregistre la voix Denise (Azure, fr-FR-DeniseNeural) :
 * chaque vers, le titre avec l'auteur, chaque mot difficile avec son explication, chaque consigne.
 *
 * Usage :  npm run voices            (ne crée que les fichiers manquants)
 *          npm run voices -- --force (refait tout)
 *          npm run voices -- --dry   (montre ce qui serait créé, sans appeler Azure)
 *
 * Seul le texte de la poésie et des consignes part chez Azure : aucune donnée sur l'enfant.
 * Lit AZURE_SPEECH_KEY et AZURE_SPEECH_REGION dans .env (jamais commité).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AudioKey = require('../js/audiokey.js');
const Poem = require('../js/poem.js');
const Consignes = require('../js/consignes.js');

const VOICE = 'fr-FR-DeniseNeural';
const RATE = { vers: '-15%', titre: '-10%', mot: '-10%', consigne: '0%' };

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY = args.includes('--dry');

function readEnv() {
  const env = {};
  const f = path.join(ROOT, '.env');
  if (fs.existsSync(f)) {
    fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  }
  return Object.assign(env, process.env);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function collect() {
  const poem = Poem.parse(fs.readFileSync(path.join(ROOT, 'poesie.txt'), 'utf8'));
  const jobs = {};
  const add = (kind, text) => {
    const file = AudioKey.file(kind, text);
    if (!jobs[file]) jobs[file] = { kind, text: AudioKey.clean(text), file };
  };
  add('titre', Poem.titleLine(poem));
  poem.strophes.forEach((st) => st.vers.forEach((v) => add('vers', v)));
  poem.words.forEach((w) => add('mot', w.w + ' : ' + w.explication));
  Object.values(Consignes).forEach((c) => add('consigne', c));
  return Object.values(jobs);
}

function ssml(job) {
  return '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-FR">' +
    '<voice name="' + VOICE + '"><prosody rate="' + RATE[job.kind] + '">' + esc(job.text) + '</prosody></voice></speak>';
}

async function synth(job, env) {
  const url = 'https://' + env.AZURE_SPEECH_REGION + '.tts.speech.microsoft.com/cognitiveservices/v1';
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'poesie-tools'
      },
      body: ssml(job)
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 1500 * attempt)); continue; }
    throw new Error('Azure a répondu ' + res.status + ' ' + res.statusText + ' pour « ' + job.text + ' »');
  }
  throw new Error('Azure ne répond pas pour « ' + job.text + ' »');
}

async function main() {
  const env = readEnv();
  const jobs = collect();
  const todo = jobs.filter((j) => FORCE || !fs.existsSync(path.join(ROOT, j.file)));
  console.log(jobs.length + ' enregistrements au total, ' + todo.length + ' à créer (≈ ' + todo.reduce((n, j) => n + j.text.length, 0) + ' caractères).');
  if (DRY || !todo.length) { todo.forEach((j) => console.log('  ' + j.kind + ' : ' + j.text)); return; }
  if (!env.AZURE_SPEECH_KEY || !env.AZURE_SPEECH_REGION) {
    console.error('AZURE_SPEECH_KEY et AZURE_SPEECH_REGION manquent dans .env.');
    process.exit(1);
  }
  fs.mkdirSync(path.join(ROOT, AudioKey.DIR), { recursive: true });
  let done = 0, failed = 0;
  const queue = todo.slice();
  async function worker() {
    while (queue.length) {
      const job = queue.shift();
      try { fs.writeFileSync(path.join(ROOT, job.file), await synth(job, env)); done++; }
      catch (e) { failed++; console.error('  ✖ ' + e.message); }
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  console.log(done + ' fichiers créés dans ' + AudioKey.DIR + (failed ? ', ' + failed + ' échecs.' : '.'));
  if (failed) process.exit(1);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
