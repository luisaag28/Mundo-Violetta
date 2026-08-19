import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const ORIGEN = '../assets-personaje/avatar-violetta.png';

// Mismo degradé de las tarjetas héroe (FICHA-ARTE.md — "tarjeta héroe" aprobada).
function fondoDegradado(tam) {
  return Buffer.from(`
    <svg width="${tam}" height="${tam}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="0%" stop-color="#A98BE0" />
          <stop offset="52%" stop-color="#C99AD4" />
          <stop offset="100%" stop-color="#E890B7" />
        </linearGradient>
      </defs>
      <rect width="${tam}" height="${tam}" fill="url(#g)" />
    </svg>
  `);
}

function circulo(diametro, color = '#FFFFFF') {
  return Buffer.from(
    `<svg width="${diametro}" height="${diametro}"><circle cx="${diametro / 2}" cy="${diametro / 2}" r="${diametro / 2}" fill="${color}"/></svg>`
  );
}

/**
 * conMarco=true  → favicon/manifest: retrato circular con anillo blanco sobre el degradé.
 * conMarco=false → apple-icon: retrato cuadrado a sangre (iOS pone su propia máscara redondeada,
 *                  Apple pide NO transparencia ni recortes propios).
 */
async function generarIcono(tam, destino, { conMarco = true } = {}) {
  if (!conMarco) {
    const rostro = Math.round(tam * 0.88);
    const offset = Math.round((tam - rostro) / 2);
    const rostroBuf = await sharp(ORIGEN)
      .resize(rostro, rostro, { fit: 'cover' })
      .png()
      .toBuffer();

    await sharp(fondoDegradado(tam))
      .composite([{ input: rostroBuf, left: offset, top: offset }])
      .png()
      .toFile(destino);
    console.log('generado', destino, `${tam}x${tam}`);
    return;
  }

  const rostro = Math.round(tam * 0.72);
  const anillo = Math.round(rostro + tam * 0.06);
  const offsetAnillo = Math.round((tam - anillo) / 2);
  const offsetRostro = Math.round((tam - rostro) / 2);

  const rostroCuadrado = await sharp(ORIGEN)
    .resize(rostro, rostro, { fit: 'cover' })
    .png()
    .toBuffer();

  const rostroRedondo = await sharp(rostroCuadrado)
    .composite([{ input: circulo(rostro), blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp(fondoDegradado(tam))
    .composite([
      { input: circulo(anillo), left: offsetAnillo, top: offsetAnillo },
      { input: rostroRedondo, left: offsetRostro, top: offsetRostro },
    ])
    .png()
    .toFile(destino);
  console.log('generado', destino, `${tam}x${tam}`);
}

async function main() {
  await mkdir('public', { recursive: true });

  // Next.js: archivos especiales auto-detectados en app/
  await generarIcono(512, 'app/icon.png');
  await generarIcono(180, 'app/apple-icon.png', { conMarco: false });

  // Manifest / PWA (Android, escritorio)
  await generarIcono(192, 'public/icon-192.png');
  await generarIcono(512, 'public/icon-512.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
