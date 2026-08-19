'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ilustracion } from '@/lib/assets';
import { Lock, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const param = searchParams.get('filtro');
  const filtro: Filtro = param === 'abiertos' || param === 'pendientes' ? param : 'todos';

  const [elegido, setElegido] = useState<ItemAlbum | null>(null);
  const cerrarBoton = useRef<HTMLButtonElement>(null);
  const disparador = useRef<HTMLElement | null>(null);

  function cambiarFiltro(nuevo: Filtro) {
    const params = new URLSearchParams(searchParams.toString());
    if (nuevo === 'todos') params.delete('filtro');
    else params.set('filtro', nuevo);
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }

  function abrir(m: ItemAlbum, e: React.MouseEvent<HTMLElement>) {
    disparador.current = e.currentTarget;
    setElegido(m);
  }

  function cerrar() {
    setElegido(null);
    disparador.current?.focus();
  }

  useEffect(() => {
    if (!elegido) return;
    cerrarBoton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
      // El botón de cerrar es el único elemento enfocable del modal: el trampolín de foco
      // más simple y correcto es no dejar que Tab/Shift+Tab lo saquen de ahí.
      if (e.key === 'Tab') {
        e.preventDefault();
        cerrarBoton.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elegido]);

  const visibles = album.filter((m) =>
    filtro === 'todos' ? true : filtro === 'abiertos' ? m.veces > 0 : m.veces === 0
  );

  return (
    <>
      <div className="mb-4 flex gap-2" role="group" aria-label="Filtrar mis momentos">
        {FILTROS.map(({ valor, etiqueta }) => (
          <motion.button
            key={valor}
            type="button"
            whileTap={{ scale: 0.955 }}
            onClick={() => cambiarFiltro(valor)}
            aria-pressed={filtro === valor}
            className={`t-label-alto rounded-[var(--radius-chip)] px-3 py-2 transition-colors duration-200 ${
              filtro === valor
                ? 'bg-lav-500 text-white'
                : 'bg-superficie text-lav-700 shadow-n1'
            }`}
          >
            {etiqueta}
          </motion.button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="t-cuerpo mt-8 text-center text-tinta-2">
          No tengo momentos en este filtro todavía.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          <AnimatePresence initial={false}>
            {visibles.map((m, i) => (
              <motion.li
                key={m.titulo}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  layout: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                  duration: 0.32,
                  delay: Math.min(i, 9) * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.975 }}
                  onClick={(e) => abrir(m, e)}
                  className="block w-full overflow-hidden rounded-[var(--radius-card)] bg-superficie
                             text-left shadow-n1"
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
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <AnimatePresence>
        {elegido && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={cerrar}
            role="dialog"
            aria-modal="true"
            aria-label={elegido.titulo}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-tinta/40 px-6"
          >
            <motion.div
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[300px] overflow-hidden rounded-[var(--radius-card)]
                         bg-superficie shadow-n3"
            >
              <div className="relative aspect-square">
                <Image
                  src={ilustracion(elegido.ilustracion)}
                  alt={elegido.titulo}
                  width={480}
                  height={480}
                  className={`h-full w-full object-cover ${
                    elegido.veces > 0 ? '' : 'opacity-55 grayscale brightness-[1.28] contrast-[0.6]'
                  }`}
                />
                {elegido.veces === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tinta/45">
                      <Lock size={26} className="text-white" strokeWidth={2.4} />
                    </span>
                  </span>
                )}
                <button
                  ref={cerrarBoton}
                  type="button"
                  onClick={cerrar}
                  aria-label="Cerrar"
                  className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center
                             rounded-full bg-tinta/45 text-white"
                >
                  <X size={18} strokeWidth={2.6} />
                </button>
              </div>

              <div className="p-4">
                <p className="t-seccion text-tinta">{elegido.titulo}</p>
                {elegido.detalle && (
                  <p className="t-label mt-1 text-tinta-2">{elegido.detalle}</p>
                )}
                <p className="t-cuerpo mt-3 text-tinta-2">
                  {elegido.veces === 0
                    ? 'Se abre cuando yo la cumpla por primera vez.'
                    : elegido.veces === 1
                      ? 'La cumplí 1 vez.'
                      : `La cumplí ${elegido.veces} veces.`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
