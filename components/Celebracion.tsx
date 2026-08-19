'use client';

import { ilustracion } from '@/lib/assets';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Nube } from './Nube';

const CONFETI = [
  '#9B6FD4', '#F58BB0', '#4FBF95', '#FBC98A', '#8FCDEE',
  '#C4A9E8', '#F58BB0', '#4FBF95', '#FBC98A', '#8FCDEE',
  '#9B6FD4', '#C4A9E8', '#F58BB0', '#4FBF95',
];

/** Hitos de racha que sí se celebran. Ni todos los días, ni nunca. */
const HITOS_RACHA = [3, 7, 14, 21, 30, 50, 75, 100];

export type DatosCelebracion = {
  fecha: string;
  diaCompleto: boolean;
  totalMisiones: number;
  racha: number;
  nivel: number;
  tituloNivel: string;
};

type Fiesta = {
  clave: string;
  titulo: string;
  mensaje: string;
  imagen: string;
};

function elegirFiesta(d: DatosCelebracion): Fiesta | null {
  // Prioridad: subir de nivel > hito de racha > día completo. Solo UNA a la vez.
  const nivelVisto = Number(localStorage.getItem('nivel-visto') ?? '0');
  if (d.nivel > nivelVisto) {
    localStorage.setItem('nivel-visto', String(d.nivel));
    // En el primer arranque no hay nada que celebrar: solo se registra el nivel.
    if (nivelVisto > 0) {
      return {
        clave: `nivel-${d.nivel}`,
        titulo: '¡Subí de nivel!',
        mensaje: `Ahora soy ${d.tituloNivel}. Mis hábitos me llevaron hasta aquí.`,
        imagen: 'violetta-completa.webp',
      };
    }
  }

  const rachaVista = Number(localStorage.getItem('racha-vista') ?? '0');
  if (HITOS_RACHA.includes(d.racha) && d.racha > rachaVista) {
    localStorage.setItem('racha-vista', String(d.racha));
    return {
      clave: `racha-${d.racha}`,
      titulo: `¡${d.racha} días seguidos!`,
      mensaje:
        d.racha >= 30
          ? 'Un mes entero cuidando mis hábitos. Esto ya es parte de mí.'
          : 'Volver cada día es lo que hace fuerte a un hábito.',
      imagen: 'habito-baile.webp',
    };
  }
  if (d.racha < rachaVista) localStorage.setItem('racha-vista', String(d.racha));

  if (d.diaCompleto && !localStorage.getItem(`dia-${d.fecha}`)) {
    localStorage.setItem(`dia-${d.fecha}`, '1');
    return {
      clave: `dia-${d.fecha}`,
      titulo: '¡Terminé mi día!',
      mensaje: `Cumplí mis ${d.totalMisiones} misiones de hoy. Todo lo pequeño que hago está construyendo algo grande.`,
      imagen: 'avatar-violetta.webp',
    };
  }

  return null;
}

export function Celebracion(props: DatosCelebracion) {
  const [fiesta, setFiesta] = useState<Fiesta | null>(null);

  // No se cierra sola: si mira para otro lado, su momento sigue ahí esperándola.
  useEffect(() => {
    const f = elegirFiesta(props);
    if (f) setFiesta(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.fecha, props.diaCompleto, props.racha, props.nivel]);

  return (
    <AnimatePresence>
      {fiesta && (
        <motion.div
          key={fiesta.clave}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={() => setFiesta(null)}
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-tinta/35 px-6"
        >
          {CONFETI.map((color, i) => (
            <motion.span
              key={i}
              initial={{ y: -40, opacity: 0, rotate: 0 }}
              animate={{
                y: [-40, 300 + (i % 4) * 70],
                x: [(i - 7) * 6, (i - 7) * 32],
                opacity: [0, 1, 1, 0],
                rotate: [0, 240 + i * 16],
              }}
              transition={{ duration: 2.3, delay: i * 0.05, ease: 'easeOut' }}
              className="absolute h-2.5 w-2.5 rounded-[2px]"
              style={{ background: color, left: `${6 + i * 6.4}%`, top: '16%' }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.9, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            transition={{ duration: 0.52, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative w-full max-w-[304px] rounded-[var(--radius-card)]
                       bg-superficie px-6 pb-6 pt-2 text-center shadow-n3"
          >
            {/* La nube como contenedor — detalle firma del póster */}
            <div className="relative mx-auto mb-1 h-[124px] w-[176px]">
              <Nube className="absolute inset-0 h-full w-full" />
              <Image
                src={ilustracion(fiesta.imagen)}
                alt=""
                width={320}
                height={320}
                className="absolute left-1/2 top-1/2 h-[92px] w-[92px] -translate-x-1/2
                           -translate-y-1/2 rounded-full border-4 border-white object-cover
                           object-top shadow-n2"
              />
            </div>

            <p className="lettering t-pagina text-lav-700">{fiesta.titulo}</p>

            <p className="t-cuerpo mt-2.5 text-tinta-2">{fiesta.mensaje}</p>

            <button
              type="button"
              onClick={() => setFiesta(null)}
              className="t-cuerpo-fuerte mt-5 flex h-13 w-full items-center justify-center rounded-[var(--radius-pill)]
                         bg-gradient-to-r from-rosa to-lav-500 py-3.5
                         text-white shadow-n2 transition-transform duration-150 active:scale-[0.975]"
            >
              ¡Genial!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
