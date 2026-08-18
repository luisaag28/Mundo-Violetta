/**
 * Genera las ilustraciones de hábitos que el póster de referencia no cubre,
 * manteniendo el MISMO personaje y el MISMO estilo.
 *
 * Uso:  node scripts/generar-ilustraciones.mjs
 *
 * La clave se lee de .env.local (solo servidor). NUNCA se imprime en consola.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, '..');
const ASSETS = path.resolve(RAIZ, '..', 'assets-personaje');

// --- cargar .env.local sin dependencias ---
function cargarEnv() {
  const p = path.join(RAIZ, '.env.local');
  if (!fs.existsSync(p)) throw new Error('Falta .env.local');
  for (const linea of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = linea.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    process.env[t.slice(0, i).trim()] ??= t.slice(i + 1).trim();
  }
}
cargarEnv();

const API_KEY = process.env.OPENAI_API_KEY;
const MODELO = process.env.AI_IMAGE_MODEL || 'gpt-image-1';
if (!API_KEY) throw new Error('Falta OPENAI_API_KEY en .env.local');

// Estilo extraído del póster de referencia (FICHA-ARTE.md)
const ESTILO = [
  'Children\'s storybook cartoon illustration, same art style as the reference images.',
  'A cheerful 10-year-old Latina girl with very long wavy dark brown hair, large expressive brown eyes,',
  'rosy blushed cheeks, warm light-tan skin, wearing a lavender tie-dye t-shirt and light denim shorts',
  'with lavender sneakers. Thick clean dark outlines, flat cel shading, soft pastel palette',
  '(lavender, sky blue, blush pink, mint, peach). Dreamy pastel cloud background with small sparkles',
  'and tiny flowers. Bright, warm, friendly, wholesome. Square composition, character centred,',
  'full scene, no text, no words, no letters, no watermark.',
].join(' ');

const PENDIENTES = [
  {
    nombre: 'habito-agua',
    escena:
      'The girl happily drinking water from a clear glass she holds with both hands, ' +
      'a small pitcher of water with lemon slices on a little table beside her. ' +
      'A few cute water droplet sparkles float around her. She looks refreshed and cheerful.',
  },
];

// Referencias de estilo: viñetas reales del póster
const REFERENCIAS = ['habito-leer.png', 'habito-cama.png', 'habito-juguetes.png'];

async function generar({ nombre, escena }) {
  const form = new FormData();
  form.append('model', MODELO);
  form.append('prompt', `${ESTILO} SCENE: ${escena}`);
  form.append('size', '1024x1024');
  form.append('quality', 'medium');
  form.append('n', '1');

  for (const ref of REFERENCIAS) {
    const ruta = path.join(ASSETS, ref);
    if (!fs.existsSync(ruta)) continue;
    form.append('image[]', new Blob([fs.readFileSync(ruta)], { type: 'image/png' }), ref);
  }

  const r = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: form,
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`${nombre}: HTTP ${r.status} — ${txt.slice(0, 400)}`);
  }

  const json = await r.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${nombre}: respuesta sin imagen`);

  const destino = path.join(ASSETS, `${nombre}.png`);
  fs.writeFileSync(destino, Buffer.from(b64, 'base64'));
  console.log(`  ✓ ${nombre}.png  (${(fs.statSync(destino).size / 1024).toFixed(0)} KB)`);
}

for (const p of PENDIENTES) {
  try {
    await generar(p);
  } catch (e) {
    console.error(`  ✗ ${e.message}`);
  }
}
console.log('\nListo. Revisa las imágenes en assets-personaje/');
