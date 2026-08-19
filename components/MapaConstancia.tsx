'use client';

import { motion } from 'motion/react';

type Celda = { fecha: string; nivel: 0 | 1 | 2 | 3; futuro: boolean };

/** El mapa de 12 semanas se dibuja celda por celda al entrar — nunca estático. */
export function MapaConstancia({ mapa }: { mapa: Celda[][] }) {
  return (
    <div className="mt-4 flex gap-[3px]" aria-hidden>
      {mapa.map((columna, i) => (
        <div key={i} className="flex flex-1 flex-col gap-[3px]">
          {columna.map((celda, j) => (
            <motion.span
              key={celda.fecha}
              title={celda.fecha}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.22,
                delay: 0.2 + i * 0.018 + j * 0.008,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`aspect-square rounded-[4px] ${
                celda.futuro
                  ? 'border border-lav-200/50 bg-transparent'
                  : celda.nivel === 0
                    ? 'border border-lav-200/40 bg-superficie'
                    : celda.nivel === 1
                      ? 'bg-lav-200'
                      : celda.nivel === 2
                        ? 'bg-lav-300'
                        : 'bg-lav-500'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
