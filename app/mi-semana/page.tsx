import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Flame, Check } from 'lucide-react';
import { usuariaActual } from '@/lib/auth';
import { resumenSemana, rachaDe, hoyLocal, lunesDe, mapaConstancia, correrDias } from '@/lib/dia';
import { NavInferior } from '@/components/NavInferior';
import { NumeroQueCuenta } from '@/components/NumeroQueCuenta';

export default async function MiSemana({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  const { semana } = await searchParams;
  const referencia = semana && /^\d{4}-\d{2}-\d{2}$/.test(semana) ? semana : hoyLocal();

  const s = await resumenSemana(usuaria.id, referencia);
  const racha = await rachaDe(usuaria.id, hoyLocal());
  const mapa = await mapaConstancia(usuaria.id, 12);

  const semanaActual = lunesDe(hoyLocal());
  const anterior = correrDias(s.lunes, -7);
  const siguiente = correrDias(s.lunes, 7);
  const haySiguiente = siguiente <= semanaActual;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="sin-barra min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <header className="py-5">
          <h1
            className="t-pagina lettering text-tinta"
          >
            Mi semana
          </h1>
          <p className="t-cuerpo mt-1.5 text-tinta-2">
            Lo que fui construyendo, día a día.
          </p>
        </header>

        {/* Navegación entre semanas */}
        <div className="mb-4 flex items-center justify-between gap-2 rounded-[var(--radius-card)]
                        bg-superficie p-2 shadow-n1">
          <Link
            href={`/mi-semana?semana=${anterior}`}
            aria-label="Semana anterior"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-inner)]
                       text-lav-700 transition-transform active:scale-95"
          >
            <ChevronLeft size={22} strokeWidth={2.6} />
          </Link>

          <p className="t-cuerpo-fuerte text-center text-tinta">{s.etiqueta}</p>

          {haySiguiente ? (
            <Link
              href={`/mi-semana?semana=${siguiente}`}
              aria-label="Semana siguiente"
              className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-inner)]
                         text-lav-700 transition-transform active:scale-95"
            >
              <ChevronRight size={22} strokeWidth={2.6} />
            </Link>
          ) : (
            <span className="h-11 w-11 flex-none" aria-hidden />
          )}
        </div>

        {/* Los 7 días */}
        <section className="mb-4 rounded-[var(--radius-card)] bg-superficie p-4 shadow-n1">
          <ul className="flex justify-between">
            {s.dias.map((d) => {
              const completo = d.total > 0 && d.hechas === d.total;
              const algo = d.hechas > 0;

              return (
                <li key={d.fecha} className="flex flex-col items-center gap-1.5">
                  <span className="t-label-alto text-tinta-2">{d.inicial}</span>

                  <span
                    className={`t-label-alto flex h-10 w-10 items-center justify-center rounded-[13px]
                                transition-colors
                      ${
                        completo
                          ? 'bg-menta text-white'
                          : algo
                            ? 'bg-menta-100 text-menta-700'
                            : d.esFuturo
                              ? 'bg-hundido text-tinta-3'
                              : 'bg-lav-50 text-tinta-3'
                      }
                      ${d.esHoy ? 'ring-[3px] ring-lav-500 ring-offset-2 ring-offset-superficie' : ''}`}
                  >
                    {completo ? <Check size={17} strokeWidth={3.4} /> : d.numero}
                  </span>

                  <span className="t-label tabular text-tinta-3">
                    {d.total > 0 && !d.esFuturo ? `${d.hechas}/${d.total}` : '—'}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Números */}
        <section className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-card)] bg-durazno-100 p-4 shadow-n1">
            <p className="t-label-alto flex items-center gap-1.5 text-durazno-700">
              <Flame size={14} fill="#D18E2E" className="text-durazno-700" />
              MI RACHA
            </p>
            <p
              className="t-heroe tabular mt-2 text-durazno-700"
            >
              <NumeroQueCuenta valor={racha} />
            </p>
            <p className="t-label mt-1.5 text-durazno-700/85">
              {racha === 1 ? 'día seguido' : 'días seguidos'}
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] bg-cielo-100 p-4 shadow-n1">
            <p className="t-label-alto text-cielo-700">
              ESTA SEMANA
            </p>
            <p
              className="t-heroe tabular mt-2 text-cielo-700"
            >
              <NumeroQueCuenta valor={s.totalHechas} />
            </p>
            <p className="t-label mt-1.5 text-cielo-700/85">misiones cumplidas</p>
          </div>
        </section>

        {/* La narrativa, no el porcentaje */}
        <section
          className="overflow-hidden rounded-[var(--radius-card)] p-5 shadow-n2"
          style={{ background: 'linear-gradient(168deg,#DCEEFB 0%,#EBE1FA 48%,#FCE7DB 100%)' }}
        >
          <p
            className="t-seccion text-tinta"
          >
            Mi historia de la semana
          </p>

          {s.narrativa.length > 0 ? (
            <p className="t-cuerpo mt-2.5 text-tinta">
              Esta semana {s.narrativa.join(', ')}. Cada semana estoy construyendo hábitos más fuertes.
            </p>
          ) : (
            <p className="t-cuerpo mt-2.5 text-tinta">
              Esta semana apenas empieza. Cuando cumpla mis primeras misiones,
              aquí voy a ver lo que fui construyendo.
            </p>
          )}
        </section>

        {/* Mapa de constancia — 12 semanas de un vistazo */}
        <section className="mt-4 rounded-[var(--radius-card)] bg-superficie p-5 shadow-n1">
          <h2
            className="t-seccion text-tinta"
          >
            Mis últimas 12 semanas
          </h2>
          <p className="t-label mt-1.5 font-semibold text-tinta-2">
            Mientras más lleno el cuadrito, más misiones cumplí ese día.
          </p>

          <div className="mt-4 flex gap-[5px]" aria-hidden>
            {mapa.map((columna, i) => (
              <div key={i} className="flex flex-1 flex-col gap-[5px]">
                {columna.map((celda) => (
                  <span
                    key={celda.fecha}
                    title={celda.fecha}
                    className={`aspect-square rounded-[4px] ${
                      celda.futuro
                        ? 'bg-hundido/50'
                        : celda.nivel === 0
                          ? 'bg-lav-50'
                          : celda.nivel === 1
                            ? 'bg-lav-200'
                            : celda.nivel === 2
                              ? 'bg-lav-300'
                              : 'bg-lav-500'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-end gap-1.5">
            <span className="t-label text-tinta-3">Menos</span>
            <span className="h-3 w-3 rounded-[3px] bg-lav-50" />
            <span className="h-3 w-3 rounded-[3px] bg-lav-200" />
            <span className="h-3 w-3 rounded-[3px] bg-lav-300" />
            <span className="h-3 w-3 rounded-[3px] bg-lav-500" />
            <span className="t-label text-tinta-3">Más</span>
          </div>
        </section>
      </main>

      <NavInferior />
    </div>
  );
}
