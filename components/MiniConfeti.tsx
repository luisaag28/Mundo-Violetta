'use client';

import { motion } from 'motion/react';

const COLORES = ['#9B6FD4', '#F58BB0', '#4FBF95', '#FBC98A', '#8FCDEE', '#C4A9E8'];

/** Ráfaga pequeña de confeti anclada a la misión que se acaba de completar —
 *  la recompensa emocional inmediata, del tamaño de un tap, no de un modal. */
export function MiniConfeti({ activo }: { activo: boolean }) {
  if (!activo) return null;

  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-10">
      {COLORES.map((color, i) => {
        const angulo = (i / COLORES.length) * 2 * Math.PI;
        const distancia = 22 + (i % 3) * 6;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.6, rotate: 0 }}
            animate={{
              opacity: 0,
              x: Math.cos(angulo) * distancia,
              y: Math.sin(angulo) * distancia - 10,
              scale: 1,
              rotate: 140 + i * 30,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-[1.5px]"
            style={{ background: color }}
          />
        );
      })}
    </span>
  );
}
