'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * El número héroe y la frase "me faltan X" comparten el mismo valor que anima,
 * para que nunca se vean dos cuentas distintas al mismo tiempo (antes el número
 * animaba solo y la frase ya mostraba el total final, un instante desincronizados).
 */
export function ProgresoDia({ hechas, total }: { hechas: number; total: number }) {
  const [n, setN] = useState(hechas);
  const previo = useRef<number | null>(null);

  useEffect(() => {
    const reducido =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducido) {
      setN(hechas);
      previo.current = hechas;
      return;
    }

    const desde = previo.current ?? 0;
    previo.current = hechas;
    if (desde === hechas) return;

    const inicio = performance.now();
    const duracion = 700;
    let raf = 0;

    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / duracion);
      const suave = 1 - Math.pow(1 - p, 3);
      setN(Math.round(desde + (hechas - desde) * suave));
      if (p < 1) raf = requestAnimationFrame(paso);
    };

    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [hechas]);

  const faltan = total - n;

  return (
    <>
      <p className="t-heroe tabular relative mt-1 text-white">
        {n}
        <span className="t-pagina opacity-90"> de </span>
        {total}
      </p>

      <p className="t-cuerpo-fuerte relative mt-2 text-white">
        {total === 0
          ? 'Hoy no tengo misiones. A descansar.'
          : faltan === 0
            ? '¡Terminé todo mi día! Qué bien me quedó.'
            : `Me ${faltan === 1 ? 'falta 1 misión' : `faltan ${faltan} misiones`} para el día completo`}
      </p>
    </>
  );
}
