'use client';

import { motion } from 'motion/react';

type Celda = { fecha: string; nivel: 0 | 1 | 2 | 3; futuro: boolean };

/** El mapa de 12 semanas se dibuja columna por columna al entrar — nunca estático. */
export function MapaConstancia({ mapa }: { mapa: Celda[][] }) {
  return (
    <div className="mt-4 flex gap-[3px]" aria-hidden>
      {mapa.map((columna, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28, delay: 0.2 + i * 0.02, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-1 flex-col gap-[3px]"
        >
          {columna.map((celda) => (
            <span
              key={celda.fecha}
              title={celda.fecha}
              className={`aspect-square rounded-[4px] ${
                celda.futuro
                  ? 'border border-superficie/70 bg-transparent'
                  : celda.nivel === 0
                    ? 'bg-superficie'
                    : celda.nivel === 1
                      ? 'bg-lav-200'
                      : celda.nivel === 2
                        ? 'bg-lav-300'
                        : 'bg-lav-500'
              }`}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}
