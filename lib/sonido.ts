'use client';

let contexto: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!contexto) contexto = new Ctor();
  if (contexto.state === 'suspended') contexto.resume().catch(() => {});
  return contexto;
}

/** Campanita de dos notas ascendentes al completar una misión — sintetizada,
 *  sin archivo de audio. Si el navegador la bloquea, la celebración visual sigue sola. */
export function reproducirLogro() {
  try {
    const ctx = obtenerContexto();
    if (!ctx) return;

    const notas = [880, 1174.66]; // A5 → D6
    const ahora = ctx.currentTime;

    notas.forEach((frecuencia, i) => {
      const osc = ctx.createOscillator();
      const ganancia = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frecuencia;

      const inicio = ahora + i * 0.1;
      ganancia.gain.setValueAtTime(0, inicio);
      ganancia.gain.linearRampToValueAtTime(0.12, inicio + 0.02);
      ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + 0.32);

      osc.connect(ganancia);
      ganancia.connect(ctx.destination);
      osc.start(inicio);
      osc.stop(inicio + 0.34);
    });
  } catch {
    // El sonido es un extra, nunca un requisito para completar la misión.
  }
}
