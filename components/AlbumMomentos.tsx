'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ilustracion } from '@/lib/assets';
import { Lock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export type ItemAlbum = {
  titulo: string;
  ilustracion: string;
  detalle: string | null;
  veces: number;
  nuevo: boolean;
};

type Filtro = 'todos' | 'abiertos' | 'pendientes';

const FILTROS: Array<{ valor: Filtro; etiqueta: string }> = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'abiertos', etiqueta: 'Abiertos' },
  { valor: 'pendientes', etiqueta: 'Por abrir' },
];

export function AlbumMomentos({ album }: { album: ItemAlbum[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const visibles = album.filter((m) =>
    filtro === 'todos' ? true : filtro === 'abiertos' ? m.veces > 0 : m.veces === 0
  );

  return (
    <>
      <div className="mb-4 flex gap-2" role="group" aria-label="Filtrar mis momentos">
        {FILTROS.map(({ valor, etiqueta }) => (
          <button
            key={valor}
            type="button"
            onClick={() => setFiltro(valor)}
            aria-pressed={filtro === valor}
            className={`t-label-alto rounded-[var(--radius-chip)] px-3 py-2 transition-colors duration-200 ${
              filtro === valor
                ? 'bg-lav-500 text-white'
                : 'bg-lav-50 text-lav-700'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="t-cuerpo mt-8 text-center text-tinta-2">
          No tengo momentos en este filtro todavía.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {visibles.map((m, i) => (
            <motion.li
              key={m.titulo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                delay: Math.min(i, 9) * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden rounded-[var(--radius-card)] bg-superficie shadow-n1"
            >
              <div className="relative aspect-square">
                <Image
                  src={ilustracion(m.ilustracion)}
                  alt={m.titulo}
                  width={320}
                  height={320}
                  className={`h-full w-full object-cover ${
                    m.veces > 0 ? '' : 'opacity-55 grayscale brightness-[1.28] contrast-[0.6]'
                  }`}
                />
                {m.veces === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tinta/45">
                      <Lock size={22} className="text-white" strokeWidth={2.4} />
                    </span>
                  </span>
                )}
                {m.veces > 0 && (
                  <span className="t-label-alto tabular absolute bottom-2 right-2 rounded-[var(--radius-chip)]
                                   bg-white/92 px-2 py-1 text-lav-700 shadow-n1">
                    ×{m.veces}
                  </span>
                )}
                {m.nuevo && (
                  <span
                    className="absolute -left-1 -top-1 flex h-7 w-7 -rotate-12 items-center
                               justify-center rounded-full border-2 border-white bg-menta shadow-n1"
                    title="Lo abrí hoy"
                  >
                    <Sparkles size={14} className="text-white" fill="#fff" />
                  </span>
                )}
              </div>

              <div className="p-3">
                <p className="t-cuerpo-fuerte text-tinta">{m.titulo}</p>
                <p className="t-label mt-1 text-tinta-2">
                  {m.veces === 0
                    ? 'Todavía por abrir'
                    : m.veces === 1
                      ? 'Lo hice 1 vez'
                      : `Lo hice ${m.veces} veces`}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </>
  );
}
