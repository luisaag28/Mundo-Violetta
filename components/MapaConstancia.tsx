'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

type Celda = { fecha: string; nivel: 0 | 1 | 2 | 3; futuro: boolean };

/** El mapa de 12 semanas se dibuja celda por celda al entrar — nunca estático.
 *  Cada día pasado lleva a "Mi día" de esa fecha para repasar qué se cumplió. */
export function MapaConstancia({ mapa }: { mapa: Celda[][] }) {
  return (
    <div className="mt-3 flex gap-[2px]">
      {mapa.map((columna, i) => (
        <div key={i} className="flex flex-1 flex-col gap-[2px]">
          {columna.map((celda, j) => {
            const clase = `block aspect-square rounded-[4px] transition-transform active:scale-90 ${
              celda.futuro
                ? 'border border-lav-200/50 bg-transparent'
                : celda.nivel === 0
                  ? 'border border-lav-200/40 bg-superficie'
                  : celda.nivel === 1
                    ? 'bg-lav-200'
                    : celda.nivel === 2
                      ? 'bg-lav-300'
                      : 'bg-lav-500'
            }`;

            const bloque = (
              <motion.span
                title={celda.fecha}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.22,
                  delay: 0.2 + i * 0.018 + j * 0.008,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={clase}
              />
            );

            return celda.futuro ? (
              <div key={celda.fecha} aria-hidden>
                {bloque}
              </div>
            ) : (
              <Link
                key={celda.fecha}
                href={`/mi-dia?fecha=${celda.fecha}`}
                aria-label={`Ver el ${celda.fecha}`}
                className="block"
              >
                {bloque}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
