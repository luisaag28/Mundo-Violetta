'use client';

import { useEffect, useRef, useState } from 'react';
import { MiniConfeti } from './MiniConfeti';

/** Mismo patrón que ProgresoDia: el número y la frase animan juntos, nunca desincronizados. */
export function ProgresoMundo({ abiertos, total }: { abiertos: number; total: number }) {
  const [n, setN] = useState(0);
  const [celebrar, setCelebrar] = useState(false);
  const previo = useRef<number | null>(null);

  useEffect(() => {
    const reducido =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducido) {
      setN(abiertos);
      previo.current = abiertos;
      return;
    }

    const desde = previo.current ?? 0;
    previo.current = abiertos;
    if (desde === abiertos) return;

    const inicio = performance.now();
    const duracion = 700;
    let raf = 0;

    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / duracion);
      const suave = 1 - Math.pow(1 - p, 3);
      setN(Math.round(desde + (abiertos - desde) * suave));
      if (p < 1) raf = requestAnimationFrame(paso);
    };

    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [abiertos]);

  // El hito de completar el álbum entero se celebra una sola vez.
  useEffect(() => {
    if (total > 0 && abiertos === total && !localStorage.getItem('mundo-completo')) {
      localStorage.setItem('mundo-completo', '1');
      setCelebrar(true);
      const listo = setTimeout(() => setCelebrar(false), 900);
      return () => clearTimeout(listo);
    }
  }, [abiertos, total]);

  return (
    <>
      <span className="relative">
        <MiniConfeti activo={celebrar} />
      </span>
      <p className="t-heroe tabular relative mt-1 text-white">
        {n}
        <span className="t-pagina opacity-90"> de </span>
        {total}
      </p>
      <p className="t-cuerpo-fuerte relative mt-2 text-white">
        {n === total
          ? '¡Abrí mi mundo entero!'
          : 'Los que faltan se abren cuando yo las cumpla por primera vez.'}
      </p>
    </>
  );
}
