'use client';

import { useEffect, useRef, useState } from 'react';

/** Cuenta de 0 al valor. Si la usuaria pidió menos movimiento, muestra el número directo. */
export function NumeroQueCuenta({
  valor,
  duracion = 700,
  className,
}: {
  valor: number;
  duracion?: number;
  className?: string;
}) {
  const [n, setN] = useState(valor);
  const previo = useRef<number | null>(null);

  useEffect(() => {
    const reducido =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducido) {
      setN(valor);
      previo.current = valor;
      return;
    }

    const desde = previo.current ?? 0;
    previo.current = valor;
    if (desde === valor) return;

    const inicio = performance.now();
    let raf = 0;

    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / duracion);
      const suave = 1 - Math.pow(1 - p, 3);
      setN(Math.round(desde + (valor - desde) * suave));
      if (p < 1) raf = requestAnimationFrame(paso);
    };

    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor, duracion]);

  return <span className={className}>{n}</span>;
}
