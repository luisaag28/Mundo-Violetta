'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

export function BotonEnviar({
  children,
  cargando,
}: {
  children: React.ReactNode;
  cargando: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="t-seccion relative flex h-14 w-full items-center justify-center gap-2
                 rounded-[var(--radius-pill)] bg-gradient-to-r from-rosa to-lav-500
                 text-white shadow-n2
                 transition-transform duration-150 ease-[var(--ease-suave)]
                 active:scale-[0.975] disabled:opacity-80"
    >
      {pending ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          {cargando}
        </>
      ) : (
        children
      )}
    </button>
  );
}
