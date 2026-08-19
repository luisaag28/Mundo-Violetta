'use client';

import { motion } from 'motion/react';

/** Barra que se dibuja de 0 al valor al entrar (baseline 3 de las 7 animaciones). */
export function BarraProgreso({
  porcentaje,
  etiqueta,
}: {
  porcentaje: number;
  etiqueta: string;
}) {
  return (
    <div
      className="relative mt-3.5 h-3 overflow-hidden rounded-[var(--radius-chip)] bg-white/30"
      role="progressbar"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={etiqueta}
    >
      <motion.span
        className="block h-full rounded-[var(--radius-chip)] bg-white"
        initial={{ width: '0%' }}
        animate={{ width: `${porcentaje}%` }}
        transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
