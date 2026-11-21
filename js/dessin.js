/*
 * dessin.js — Une feuille de dessin au stylet (ou au doigt) pour l'image d'un groupe.
 *
 * Dessiner soi-même l'image d'un groupe de vers aide à le retenir (il faut comprendre
 * les vers pour décider quoi dessiner) ; le dessin devient ensuite l'indice de ce groupe.
 *
 * Dessin.mount(canvas, { initial }) → { setColor, setSize, setEraser, undo, clear, toDataURL, isEmpty }
 * - le canvas garde une résolution fixe (SIZE × SIZE), affiché à la taille que lui donne le CSS ;
 * - dès qu'un stylet a touché l'écran, les touches de doigt sont ignorées (la paume posée ne dessine pas) ;
 * - « annuler » retire le dernier trait ; un dessin déjà enregistré sert de fond.
 */
(function (root) {
  'use strict';

  const SIZE = 600;
  const PAPIER = '#ffffff';

  function mount(canvas, opts) {
    const ctx = canvas.getContext('2d');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const strokes = [];
    let background = null;
    let current = null;
    let activeId = null;
    let penSeen = false;
    let color = '#1f3b8c';
    let size = 10;
    let eraser = false;

    function paint() {
      ctx.fillStyle = PAPIER;
      ctx.fillRect(0, 0, SIZE, SIZE);
      if (background) ctx.drawImage(background, 0, 0, SIZE, SIZE);
      strokes.forEach(drawStroke);
    }

    function drawStroke(st) {
      ctx.strokeStyle = st.color;
      ctx.fillStyle = st.color;
      ctx.lineWidth = st.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const p = st.points;
      if (p.length === 1) {
        ctx.beginPath(); ctx.arc(p[0][0], p[0][1], st.size / 2, 0, Math.PI * 2); ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
      ctx.stroke();
    }

    function pos(e) {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * SIZE / r.width, (e.clientY - r.top) * SIZE / r.height];
    }

    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'pen') penSeen = true;
      if (penSeen && e.pointerType === 'touch') return; // paume posée
      if (activeId !== null) return;                    // un seul trait à la fois
      e.preventDefault();
      activeId = e.pointerId;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
      current = { color: eraser ? PAPIER : color, size: eraser ? size * 3 : size, points: [pos(e)] };
      strokes.push(current);
      drawStroke(current);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== activeId || !current) return;
      const co = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      const evs = co.length ? co : [e];
      evs.forEach((ev) => current.points.push(pos(ev)));
      const p = current.points;
      ctx.strokeStyle = current.color;
      ctx.lineWidth = current.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(p[Math.max(0, p.length - evs.length - 1)][0], p[Math.max(0, p.length - evs.length - 1)][1]);
      for (let i = p.length - evs.length; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
      ctx.stroke();
    });
    const end = (e) => { if (e.pointerId === activeId) { activeId = null; current = null; } };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    paint();
    if (opts && opts.initial) {
      const img = new Image();
      img.onload = () => { background = img; paint(); };
      img.src = opts.initial;
    }

    return {
      setColor(c) { color = c; eraser = false; },
      setSize(s) { size = s; },
      setEraser(v) { eraser = !!v; },
      undo() { strokes.pop(); paint(); },
      clear() { strokes.length = 0; background = null; paint(); },
      isEmpty() { return !background && !strokes.length; },
      /** Image enregistrée : 480 px, JPEG (léger pour le localStorage). */
      toDataURL() {
        const out = document.createElement('canvas');
        out.width = out.height = 480;
        out.getContext('2d').drawImage(canvas, 0, 0, 480, 480);
        return out.toDataURL('image/jpeg', 0.82);
      }
    };
  }

  root.Dessin = { mount, SIZE };
})(self);
