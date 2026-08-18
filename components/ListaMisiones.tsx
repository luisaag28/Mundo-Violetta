'use client';

import { useState, useTransition, useOptimistic } from 'react';
import Image from 'next/image';
import { ilustracion } from '@/lib/assets';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Undo2, AlertCircle, Minus } from 'lucide-react';
import type { Mision } from '@/lib/dia';
import { accionAlternarMision } from '@/app/acciones';

function Vasos({
  avance,
  meta,
  claro,
}: {
  avance: number;
  meta: number;
  claro: boolean;
}) {
  return (
    <span className="mt-1 flex items-center gap-2">
      <span className="flex gap-1.5">
        {Array.from({ length: meta }).map((_, i) => (
          <span
            key={i}
            className={`h-5 w-3.5 rounded-[3px_3px_5px_5px] border-2 transition-colors duration-300 ${
              i < avance
                ? claro
                  ? 'border-white bg-white'
                  : 'border-cielo bg-cielo'
                : claro
                  ? 'border-white/60 bg-white/20'
                  : 'border-cielo/40 bg-white/70'
            }`}
          />
        ))}
      </span>
      <span
        className={`t-label ${claro ? 'text-white/90' : 'text-tinta-2'}`}
      >
        {avance} de {meta} vasos
      </span>
    </span>
  );
}

export function ListaMisiones({
  misiones,
  fecha,
  soloLectura = false,
}: {
  misiones: Mision[];
  fecha: string;
  soloLectura?: boolean;
}) {
  const router = useRouter();
  const [, empezar] = useTransition();
  const [enVuelo, setEnVuelo] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<{ texto: string; accion?: 'entrar' | 'recargar' } | null>(null);

  const [optimistas, aplicar] = useOptimistic(
    misiones,
    (estado, accion: { id: number; delta: number }) =>
      estado.map((m) => {
        if (m.id !== accion.id) return m;
        if (m.tipo === 'vasos') {
          const avance = Math.max(0, Math.min(m.meta, m.avance + accion.delta));
          return { ...m, avance, completado: avance >= m.meta };
        }
        return { ...m, completado: !m.completado };
      })
  );

  function alternar(m: Mision, delta = 1) {
    if (soloLectura || enVuelo === m.id) return;
    if (m.tipo === 'vasos') {
      if (delta > 0 && m.avance >= m.meta) return;
      if (delta < 0 && m.avance <= 0) return;
    }
    const estabaHecha = m.completado;
    const objetivoVasos =
      m.tipo === 'vasos' ? Math.max(0, Math.min(m.meta, m.avance + delta)) : undefined;
    setError(null);
    setEnVuelo(m.id);

    empezar(async () => {
      aplicar({ id: m.id, delta });
      const r = await accionAlternarMision(m.id, fecha, objetivoVasos);
      setEnVuelo(null);

      if (!r.ok) {
        setError({ texto: r.error, accion: r.accion });
        return;
      }
      if (m.tipo !== 'vasos' && estabaHecha) {
        setAviso('Lo quité. No pasa nada, puedo marcarlo cuando quiera.');
        setTimeout(() => setAviso(null), 3200);
      }
    });
  }

  const pendientes = optimistas.filter((m) => !m.completado);
  const hechas = optimistas.filter((m) => m.completado);
  const ordenadas = [...pendientes, ...hechas];

  return (
    <>
      <ul className="space-y-2.5" aria-live="polite">
        {ordenadas.map((m, i) => {
          const esSiguiente = !m.completado && i === 0;

          return (
            <motion.li
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                layout: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                duration: 0.34,
                delay: Math.min(i, 7) * 0.055,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <motion.div
                role="button"
                tabIndex={soloLectura ? -1 : 0}
                onClick={() => alternar(m, 1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternar(m, 1);
                  }
                }}
                whileTap={{ scale: soloLectura ? 1 : 0.975 }}
                aria-pressed={m.completado}
                aria-busy={enVuelo === m.id}
                aria-disabled={soloLectura || enVuelo === m.id}
                className={`flex w-full items-center gap-3 rounded-[var(--radius-card)] p-2.5 pr-4
                            text-left transition-colors duration-300 min-h-[70px]
                            ${enVuelo === m.id ? 'opacity-70' : ''}
                            ${soloLectura ? 'cursor-default' : 'cursor-pointer'}
                  ${
                    m.completado
                      ? 'bg-menta-100'
                      : esSiguiente
                        ? 'bg-gradient-to-r from-lav-600 to-[#AE7CDE] shadow-n2'
                        : 'bg-superficie shadow-n1'
                  }`}
              >
                <Image
                  src={ilustracion(m.ilustracion)}
                  alt=""
                  width={320}
                  height={320}
                  className={`h-12 w-12 flex-none rounded-[var(--radius-inner)] object-cover
                              transition-all duration-500
                              ${m.completado ? '' : 'grayscale-[0.55] opacity-80'}`}
                />

                <span className="min-w-0 flex-1">
                  <span
                    className={`t-cuerpo-fuerte block
                      ${
                        m.completado
                          ? 'text-menta-700'
                          : esSiguiente
                            ? 'text-white'
                            : 'text-tinta'
                      }`}
                  >
                    {m.titulo}
                  </span>

                  {m.tipo === 'vasos' ? (
                    <Vasos avance={m.avance} meta={m.meta} claro={esSiguiente} />
                  ) : (
                    <span
                      className={`t-label mt-1 block truncate
                        ${
                          m.completado
                            ? 'text-[#3E8168]'
                            : esSiguiente
                              ? 'text-white/90'
                              : 'text-tinta-2'
                        }`}
                    >
                      {m.completado && m.hechoALas
                        ? `Lo hice a las ${m.hechoALas}`
                        : esSiguiente
                          ? 'Mi siguiente misión'
                          : m.detalle}
                    </span>
                  )}
                </span>

                {m.tipo === 'vasos' && m.avance > 0 ? (
                  <button
                    type="button"
                    disabled={soloLectura || enVuelo === m.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      alternar(m, -1);
                    }}
                    aria-label="Quitar un vaso"
                    className={`flex h-11 w-11 flex-none items-center justify-center rounded-full
                                border-[2.5px] transition-colors active:scale-90
                      ${
                        esSiguiente
                          ? 'border-white/70 bg-white/15 text-white'
                          : 'border-lav-200 bg-white text-lav-700'
                      }`}
                  >
                    <Minus size={17} strokeWidth={3} />
                  </button>
                ) : (
                  <span className="flex h-11 w-11 flex-none items-center justify-center">
                    <motion.span
                      animate={{ scale: m.completado ? [1, 1.18, 1] : 1 }}
                      transition={{ duration: 0.34, ease: [0.34, 1.56, 0.64, 1] }}
                      className={`flex h-7 w-7 items-center justify-center rounded-[9px] border-[2.5px]
                        ${
                          m.completado
                            ? 'border-menta bg-menta'
                            : esSiguiente
                              ? 'border-white/80 bg-white/15'
                              : 'border-lav-200 bg-white'
                        }`}
                    >
                      {m.completado && <Check size={15} strokeWidth={3.6} className="text-white" />}
                    </motion.span>
                  </span>
                )}
              </motion.div>
            </motion.li>
          );
        })}
      </ul>

      {/* Aviso de que se desmarcó */}
      <AnimatePresence>
        {aviso && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            role="status"
            className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-[343px] items-center gap-2.5
                       rounded-[var(--radius-inner)] bg-tinta px-4 py-3 t-cuerpo-fuerte
                       text-white shadow-n3"
          >
            <Undo2 size={18} className="flex-none" />
            <span className="flex-1">{aviso}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error: aspecto distinto, con acción real para reintentar */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            role="alert"
            className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-[343px] items-center gap-2.5
                       rounded-[var(--radius-inner)] bg-aviso-100 px-4 py-3 t-cuerpo-fuerte
                       text-[#A33F63] shadow-n3"
          >
            <AlertCircle size={18} className="flex-none" />
            <span className="flex-1">{error.texto}</span>

            {error.accion === 'entrar' ? (
              <Link
                href="/entrar"
                className="t-label-alto flex-none rounded-[var(--radius-chip)] bg-white/80 px-3 py-1.5
                           text-[#A33F63]"
              >
                Entrar
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => router.refresh()}
                className="t-label-alto flex-none rounded-[var(--radius-chip)] bg-white/80 px-3 py-1.5
                           text-[#A33F63]"
              >
                Reintentar
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {enVuelo !== null && <span className="sr-only">Guardando…</span>}
    </>
  );
}
