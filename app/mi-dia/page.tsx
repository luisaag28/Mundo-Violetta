import Image from 'next/image';
import { ilustracion } from '@/lib/assets';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Star, Flame, Lock, ChevronRight, Sparkles, ChevronLeft } from 'lucide-react';
import { usuariaActual } from '@/lib/auth';
import { resumenDia, nivelDe, hoyLocal, correrDias, etiquetaFecha } from '@/lib/dia';
import { ListaMisiones } from '@/components/ListaMisiones';
import { NavInferior } from '@/components/NavInferior';
import { NumeroQueCuenta } from '@/components/NumeroQueCuenta';
import { ProgresoDia } from '@/components/ProgresoDia';
import { BarraProgreso } from '@/components/BarraProgreso';
import { Celebracion } from '@/components/Celebracion';
import { Nube } from '@/components/Nube';

export default async function MiDia({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  const hoy = hoyLocal();
  const { fecha: pedida } = await searchParams;
  const fecha =
    pedida && /^\d{4}-\d{2}-\d{2}$/.test(pedida) && pedida <= hoy ? pedida : hoy;
  const esHoy = fecha === hoy;

  const [dia, nivel] = await Promise.all([
    resumenDia(usuaria.id, fecha),
    nivelDe(usuaria.id),
  ]);

  const anterior = correrDias(fecha, -1);
  const siguiente = correrDias(fecha, 1);

  const faltan = dia.total - dia.hechas;
  const porcentaje = dia.total > 0 ? Math.round((dia.hechas / dia.total) * 100) : 0;
  const tira = dia.momentos.slice(0, 3);
  const resto = Math.max(0, dia.momentos.length - tira.length);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Celebracion
        fecha={dia.fecha}
        diaCompleto={esHoy && dia.total > 0 && faltan === 0}
        totalMisiones={dia.total}
        racha={dia.racha}
        nivel={nivel.numero}
        tituloNivel={nivel.titulo}
      />

      <main className="sin-barra min-h-0 flex-1 overflow-y-auto px-4 pb-6">

        {/* ── Encabezado: el avatar va dentro de una nube (detalle firma) ── */}
        <header className="flex items-center gap-3 py-4">
          <Link href="/yo" aria-label="Mi perfil" className="relative h-14 w-14 flex-none">
            <Nube className="absolute -inset-x-1 inset-y-0 h-full w-[calc(100%+8px)]" />
            <Image
              src={ilustracion('avatar-violetta.webp')}
              alt=""
              width={320}
              height={320}
              priority
              className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2
                         rounded-full border-[2.5px] border-white object-cover shadow-n1"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Link
                href={`/mi-dia?fecha=${anterior}`}
                aria-label="Ver el día anterior"
                className="-ml-1.5 flex h-7 w-7 flex-none items-center justify-center rounded-full
                           text-tinta-2 transition-transform active:scale-90"
              >
                <ChevronLeft size={18} strokeWidth={2.8} />
              </Link>

              <p className="t-label-alto truncate uppercase text-tinta-2">
                {etiquetaFecha(fecha)}
              </p>

              {!esHoy && (
                <Link
                  href={`/mi-dia?fecha=${siguiente}`}
                  aria-label="Ver el día siguiente"
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-full
                             text-tinta-2 transition-transform active:scale-90"
                >
                  <ChevronRight size={18} strokeWidth={2.8} />
                </Link>
              )}
            </div>
            <h1 className="t-pagina line-clamp-2 text-tinta">
              {esHoy ? 'Mi día' : dia.etiquetaFecha}
            </h1>
          </div>

          <span className="t-label flex flex-none items-center gap-2 rounded-[var(--radius-chip)]
                           bg-durazno-100 px-3 py-2 font-extrabold text-durazno-700">
            <Star size={15} fill="#D18E2E" className="text-durazno-700" />
            Nivel {nivel.numero}
          </span>
        </header>

        {/* ── Mi progreso de hoy ── */}
        <section
          className="relative mb-4 overflow-hidden rounded-[var(--radius-card)] p-5 shadow-n2"
          style={{
            background: 'linear-gradient(150deg,#A98BE0 0%,#C99AD4 52%,#E890B7 100%)',
          }}
          aria-label="Mi progreso de hoy"
        >
          <Nube className="absolute -right-5 -top-7 h-16 w-32 opacity-[0.14]" desde="#FFFFFF" hasta="#FFFFFF" />
          <Nube className="absolute -bottom-5 left-5 h-12 w-24 opacity-[0.10]" desde="#FFFFFF" hasta="#FFFFFF" />

          <p className="t-label-alto relative text-white/95">
            MI PROGRESO DE HOY
          </p>

          <ProgresoDia hechas={dia.hechas} total={dia.total} />

          <BarraProgreso
            porcentaje={porcentaje}
            etiqueta={`${dia.hechas} de ${dia.total} misiones`}
          />
        </section>

        {/* ── Mi mundo ── */}
        {dia.momentos.length > 0 && (
          <Link
            href="/mi-mundo"
            className="mb-4 block overflow-hidden rounded-[var(--radius-card)] p-4 shadow-n2
                       transition-transform duration-150 active:scale-[0.985]"
            style={{
              background: 'linear-gradient(168deg,#DCEEFB 0%,#EBE1FA 48%,#FCE7DB 100%)',
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="t-label-alto uppercase text-tinta">Mi mundo</p>
                <p className="t-label mt-0.5 truncate text-lav-700">
                  {dia.ultimoMomento ? `Hoy sumé: ${dia.ultimoMomento}` : 'Aún sin abrir hoy'}
                </p>
              </div>
              <span className="t-label flex flex-none items-center gap-1 rounded-[var(--radius-chip)]
                               bg-white/80 px-3 py-2 font-extrabold text-lav-700">
                Ver todo
                <ChevronRight size={15} strokeWidth={2.8} />
              </span>
            </div>

            <div className="flex items-center gap-2">
              {tira.map((m, i) => (
                <div
                  key={`${m.ilustracion}-${i}`}
                  className="relative h-12 w-12 flex-none overflow-hidden rounded-[var(--radius-inner)]
                             bg-white shadow-n1"
                >
                  <Image
                    src={ilustracion(m.ilustracion)}
                    alt={m.titulo}
                    width={320}
                    height={320}
                    className={`h-full w-full object-cover ${
                      m.abierto ? '' : 'opacity-55 grayscale brightness-[1.28] contrast-[0.6]'
                    }`}
                  />
                  {!m.abierto && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-tinta/45">
                        <Lock size={13} className="text-white" strokeWidth={2.4} />
                      </span>
                    </span>
                  )}
                  {m.nuevo && (
                    <span
                      className="absolute -left-1 -top-1 flex h-5 w-5 -rotate-12 items-center
                                 justify-center rounded-full border-2 border-white bg-menta shadow-n1"
                      title="Lo abrí hoy"
                    >
                      <Sparkles size={11} className="text-white" fill="#fff" />
                    </span>
                  )}
                </div>
              ))}

              {resto > 0 && (
                <div
                  className="t-cuerpo-fuerte flex h-12 w-12 flex-none items-center justify-center
                             rounded-[var(--radius-inner)] bg-white/75 text-lav-700"
                >
                  +{resto}
                </div>
              )}
            </div>
          </Link>
        )}

        {/* ── Misiones: panel hundido — el 3er nivel de profundidad de la ficha ── */}
        <section className="rounded-[var(--radius-card)] bg-lav-50 p-3">
          <h2 className="t-label-alto mb-3 px-1 uppercase text-tinta-2">Mis misiones de hoy</h2>

          {dia.total === 0 ? (
            <div className="rounded-[var(--radius-card)] bg-superficie p-7 text-center shadow-n1">
              <Image
                src={ilustracion('habito-peluche.webp')}
                alt=""
                width={320}
                height={320}
                className="mx-auto mb-4 h-28 w-28 rounded-[var(--radius-card)] object-cover"
              />
              <p className="t-cuerpo-fuerte text-tinta">Hoy es un día libre</p>
              <p className="t-cuerpo mx-auto mt-2 max-w-[250px] text-tinta-2">
                Hoy no tengo misiones programadas. A descansar.
              </p>
            </div>
          ) : (
            <ListaMisiones misiones={dia.misiones} fecha={fecha} soloLectura={!esHoy} />
          )}
        </section>

        {/* ── Racha ── */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-card)] bg-durazno-100 p-4 shadow-n1">
            <p className="t-label-alto flex items-center gap-2 text-durazno-700">
              <Flame size={15} fill="#D18E2E" className="text-durazno-700" />
              MI RACHA
            </p>
            <p
              className="t-heroe tabular mt-2 text-durazno-700"
            >
              <NumeroQueCuenta valor={dia.racha} />
            </p>
            <p className="t-label mt-2 text-durazno-700/85">
              {dia.racha === 1 ? 'día seguido' : 'días seguidos'}
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] bg-menta-100 p-4 shadow-n1">
            <p className="t-label-alto text-menta-700">MI NIVEL</p>
            <p
              className="t-cuerpo-fuerte mt-2 text-menta-700"
            >
              {nivel.titulo}
            </p>
            <p className="t-label mt-2 text-menta-700/85">
              {nivel.hechasTotales} misiones cumplidas
            </p>
          </div>
        </section>
      </main>

      <NavInferior />
    </div>
  );
}
