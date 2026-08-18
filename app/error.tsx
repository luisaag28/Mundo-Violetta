'use client';

import { ilustracion } from '@/lib/assets';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';

/** Red de seguridad: si algo falla, nunca una pantalla en blanco. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <Image
        src={ilustracion('habito-peluche.webp')}
        alt=""
        width={320}
        height={320}
        className="h-32 w-32 rounded-[var(--radius-card)] object-cover shadow-n2"
      />

      <h1 className="t-pagina mt-5 text-tinta">
        Algo se enredó
      </h1>

      <p className="t-cuerpo mt-2 max-w-[280px] text-tinta-2">
        No pude cargar esta parte. Tu progreso está guardado, no se perdió nada.
      </p>

      <button
        type="button"
        onClick={reset}
        className="t-seccion mt-7 flex h-14 w-full max-w-[300px] items-center justify-center gap-2
                   rounded-[var(--radius-pill)] bg-gradient-to-r from-rosa to-lav-500
                   text-white shadow-n2
                   transition-transform duration-150 active:scale-[0.975]"
      >
        <RefreshCw size={20} />
        Intentar de nuevo
      </button>
    </main>
  );
}
