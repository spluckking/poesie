#!/usr/bin/env node
/*
 * make-icons.js — Dessine les icônes PNG (page de cahier Seyès, marge rouge, une gommette étoile).
 * Aucune dépendance : PNG écrit à la main avec zlib.  Usage : npm run icons
 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, px) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = px(x, y);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];
const ENCRE = hex('#1f3b8c'), PAPIER = hex('#fffef8'), LIGNE = hex('#c9d5ef'), MARGE = hex('#e05d52'), ETOILE = hex('#f2a007');

function inStar(x, y, cx, cy, R) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 ? R * 0.45 : R;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function draw(size, maskable) {
  const pad = maskable ? 0 : size * 0.06;
  const rad = maskable ? 0 : size * 0.18;
  const u = size / 16;
  return (x, y) => {
    // coins arrondis (hors masque)
    const lx = Math.max(pad + rad - x, 0, x - (size - pad - rad));
    const ly = Math.max(pad + rad - y, 0, y - (size - pad - rad));
    if (x < pad || y < pad || x > size - pad || y > size - pad || lx * lx + ly * ly > rad * rad) return [0, 0, 0, 0];
    const cx = size * 0.6, cy = size * 0.56;
    if (inStar(x, y, cx, cy, size * 0.27)) return ETOILE;
    if (inStar(x, y, cx + size * 0.015, cy + size * 0.02, size * 0.28)) return hex('#c47d00');
    if (Math.abs(x - size * 0.26) < size * 0.012) return MARGE;
    if ((y % (u * 2)) < size * 0.012 && y > pad + u) return LIGNE;
    if (y < pad + size * 0.12) return ENCRE;
    return PAPIER;
  };
}

const out = path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });
[['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true], ['icon-180.png', 180, false]].forEach(([name, s, m]) => {
  fs.writeFileSync(path.join(out, name), png(s, draw(s, m)));
  console.log('icons/' + name);
});
