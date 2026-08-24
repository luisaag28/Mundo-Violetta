'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Check, Trash2 } from 'lucide-react';
import type { Libro } from '@/lib/libros';
import { accionActualizarAvance, accionTerminarLibro, accionBorrarLibro } from '@/app/acciones';
import { MiniConfeti } from './MiniConfeti';
import { reproducirLogro } from '@/lib/sonido';

export function ActualizarLectura({ libro }: { libro: Libro }) {
  const router = useRouter();
  const [, empezar] = useTransition();
  const [pagina, setPagina] = useState(String(libro.paginaActual));
  const [enVuelo, setEnVuelo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrar, setCelebrar] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  function guardarAvance(nuevaPagina: number) {
    if (enVuelo) return;
    const objetivo = Math.max(0, Math.min(nuevaPagina, libro.paginasTotales));
    setPagina(String(objetivo));
    setError(null);
    setEnVuelo(true);

    empezar(async () => {
      const r = await accionActualizarAvance(libro.id, objetivo);
      setEnVuelo(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      if (objetivo >= libro.paginasTotales && objetivo > libro.paginaActual) {
        setCelebrar(true);
        reproducirLogro();
        setTimeout(() => setCelebrar(false), 900);
      }
      router.refresh();
    });
  }

  function terminar() {
    if (enVuelo) return;
    setEnVuelo(true);
    setCelebrar(true);
    reproducirLogro();
    empezar(async () => {
      await accionTerminarLibro(libro.id);
      setEnVuelo(false);
      router.refresh();
    });
  }

  function borrar() {
    if (!confirmarBorrado) {
      setConfirmarBorrado(true);
      setTimeout(() => setConfirmarBorrado(false), 3000);
      return;
    }
    empezar(async () => {
      await accionBorrarLibro(libro.id);
    });
  }

  if (libro.terminado) {
    return (
      <div className="rounded-[var(--radius-card)] bg-menta-100 p-5 text-center shadow-n1">
        <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-menta text-white">
          <Check size={24} strokeWidth={3} />
        </span>
        <p className="t-cuerpo-fuerte text-menta-700">¡Terminé este libro!</p>
        {libro.fechaFin && (
          <p className="t-label mt-1 text-menta-700/85">Lo terminé el {libro.fechaFin}</p>
        )}
        <button
          type="button"
          onClick={borrar}
          className="t-label mt-4 text-menta-700/70 underline underline-offset-2"
        >
          {confirmarBorrado ? '¿Seguro? Toca de nuevo para borrarlo' : 'Borrar este libro'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-superficie p-5 shadow-n1">
        <MiniConfeti activo={celebrar} />
        <p className="t-label-alto text-tinta-2">EN QUÉ PÁGINA VOY</p>

        <div className="mt-2 flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={libro.paginasTotales}
            value={pagina}
            onChange={(e) => setPagina(e.target.value)}
            aria-label="Página actual"
            className="h-14 w-24 rounded-[var(--radius-inner)] border-2 border-lav-100 bg-hundido
                       text-center text-[20px] font-extrabold text-tinta
                       focus:border-lav-300 focus:bg-superficie focus:outline-none"
          />
          <span className="t-cuerpo-fuerte text-tinta-2">de {libro.paginasTotales}</span>

          <button
            type="button"
            disabled={enVuelo}
            onClick={() => guardarAvance(Number(pagina))}
            className="t-cuerpo-fuerte ml-auto flex h-11 flex-none items-center justify-center rounded-[var(--radius-pill)]
                       bg-gradient-to-r from-rosa to-lav-500 px-5 text-white shadow-n2
                       transition-transform active:scale-95 disabled:opacity-70"
          >
            Guardar
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={enVuelo}
            onClick={() => guardarAvance(libro.paginaActual + 1)}
            className="t-label-alto h-11 flex-1 rounded-[var(--radius-pill)] border-2 border-lav-100
                       text-lav-700 transition-transform active:scale-95 disabled:opacity-60"
          >
            +1 página
          </button>
          <button
            type="button"
            disabled={enVuelo}
            onClick={() => guardarAvance(libro.paginaActual + 5)}
            className="t-label-alto h-11 flex-1 rounded-[var(--radius-pill)] border-2 border-lav-100
                       text-lav-700 transition-transform active:scale-95 disabled:opacity-60"
          >
            +5 páginas
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={enVuelo}
        onClick={terminar}
        className="t-cuerpo-fuerte flex h-13 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)]
                   bg-menta-100 text-menta-700 transition-transform active:scale-[0.975] disabled:opacity-70"
      >
        <Check size={19} strokeWidth={3} />
        Terminé este libro
      </button>

      <button
        type="button"
        onClick={borrar}
        className="t-label mx-auto flex items-center gap-1.5 text-tinta-3 underline-offset-2"
      >
        <Trash2 size={14} />
        {confirmarBorrado ? '¿Seguro? Toca de nuevo para borrarlo' : 'Borrar este libro'}
      </button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.26 }}
            role="alert"
            className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-[343px] items-center gap-3
                       rounded-[var(--radius-inner)] bg-aviso-100 px-4 py-3 t-cuerpo-fuerte
                       text-[#A33F63] shadow-n3"
          >
            <AlertCircle size={18} className="flex-none" />
            <span className="flex-1">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
