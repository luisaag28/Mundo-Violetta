import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Flame, Check, BookOpen } from 'lucide-react';
import { usuariaActual } from '@/lib/auth';
import { resumenSemana, rachaDe, hoyLocal, lunesDe, mapaConstancia, correrDias } from '@/lib/dia';
import { ilustracion } from '@/lib/assets';
import { NavInferior } from '@/components/NavInferior';
import { NumeroQueCuenta } from '@/components/NumeroQueCuenta';
import { Entrada } from '@/components/Entrada';
import { MapaConstancia } from '@/components/MapaConstancia';
import { Nube } from '@/components/Nube';

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

  const celdasPasadas = mapa.flat().filter((c) => !c.futuro);
  const celdasConDatos = celdasPasadas.filter((c) => c.nivel > 0);
  const empezandoElMapa = celdasPasadas.length > 0 && celdasConDatos.length / celdasPasadas.length < 0.2;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="sin-barra min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <header className="py-3">
          <h1
            className="t-pagina lettering text-tinta"
          >
            Mi semana
          </h1>
          <p className="t-cuerpo mt-2 text-tinta-2">
            Lo que fui construyendo, día a día.
          </p>
        </header>

        {/* Navegación entre semanas */}
        <Entrada className="mb-3 flex items-center justify-between gap-2 rounded-[var(--radius-card)]
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
        </Entrada>

        {/* Resumen de la semana: los 7 días + los 2 números, como un solo bloque */}
        <Entrada delay={0.05} className="mb-3 rounded-[var(--radius-card)] bg-superficie p-4 shadow-n1">
          <ul className="flex justify-between">
            {s.dias.map((d) => {
              const completo = d.total > 0 && d.hechas === d.total;
              const algo = d.hechas > 0;
              const tieneDatos = d.total > 0 && !d.esFuturo;

              const celda = (
                <>
                  <span className="t-label-alto text-tinta-2">{d.inicial}</span>

                  <span
                    className={`t-label-alto flex h-10 w-10 items-center justify-center rounded-[var(--radius-chip)]
                                transition-colors
                      ${
                        completo
                          ? 'bg-menta text-white'
                          : algo
                            ? 'bg-menta-100 text-menta-700'
                            : d.esFuturo
                              ? 'border border-lav-200 bg-transparent text-tinta-3'
                              : 'bg-lav-50 text-tinta-3'
                      }
                      ${d.esHoy ? 'ring-[3px] ring-lav-500 ring-offset-2 ring-offset-superficie' : ''}`}
                  >
                    {completo ? <Check size={17} strokeWidth={3.4} /> : d.numero}
                  </span>

                  <span className="t-label tabular text-tinta-3">
                    {tieneDatos ? `${d.hechas}/${d.total}` : '—'}
                  </span>
                </>
              );

              return (
                <li key={d.fecha} className="flex flex-col items-center gap-2">
                  {tieneDatos ? (
                    <Link
                      href={`/mi-dia?fecha=${d.fecha}`}
                      aria-label={`Ver ${d.fecha}`}
                      className="flex flex-col items-center gap-2 transition-transform active:scale-95"
                    >
                      {celda}
                    </Link>
                  ) : (
                    <span className="flex flex-col items-center gap-2">{celda}</span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="my-4 border-t border-lav-100" />

          <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-durazno-100 p-4 shadow-n1">
            <div className="absolute -right-3 -top-3 h-14 w-14">
              <Nube className="absolute inset-0 h-full w-full" />
              <Image
                src={ilustracion('avatar-violetta.webp')}
                alt=""
                width={160}
                height={160}
                className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2
                           rounded-full border-2 border-white object-cover"
              />
            </div>
            <p className="t-label-alto relative flex items-center gap-2 text-durazno-700">
              <Flame size={14} fill="currentColor" className="text-durazno-700" />
              MI RACHA
            </p>
            <p
              className="t-heroe tabular relative mt-2 text-durazno-700"
            >
              <NumeroQueCuenta valor={racha} />
            </p>
            <p className="t-label relative mt-2 text-durazno-700/85">
              {racha === 1 ? 'día seguido' : 'días seguidos'}
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] bg-menta-100 p-4 shadow-n1">
            <p className="t-label-alto text-menta-700">
              ESTA SEMANA
            </p>
            <p
              className="t-heroe tabular mt-2 text-menta-700"
            >
              <NumeroQueCuenta valor={s.totalHechas} />
            </p>
            <p className="t-label mt-2 text-menta-700/85">misiones cumplidas</p>
          </div>
          </div>
        </Entrada>

        {/* Mapa de constancia — 12 semanas de un vistazo. Va primero: es la pieza nueva
            más importante y necesita caber con su leyenda cerca del viewport inicial. */}
        <Entrada delay={0.15} className="mb-3 rounded-[var(--radius-card)] bg-hundido p-4">
          <h2
            className="t-seccion text-tinta"
          >
            Mis últimas 12 semanas
          </h2>
          <p className="t-label mt-1.5 font-semibold text-tinta-2">
            Mientras más lleno el cuadrito, más misiones cumplí ese día.
          </p>
          {empezandoElMapa && (
            <p className="t-label mt-1 text-lav-700">
              Recién estoy empezando a llenar este mapa.
            </p>
          )}

          <span className="sr-only">
            {celdasConDatos.length} de {celdasPasadas.length} días con misiones cumplidas en las
            últimas 12 semanas.
          </span>
          <MapaConstancia mapa={mapa} />

          <div className="mt-2.5 flex items-center justify-end gap-2">
            <span className="t-label text-tinta-3">Menos</span>
            <span className="h-3 w-3 rounded-[3px] border border-lav-200/40 bg-lav-50" />
            <span className="h-3 w-3 rounded-[3px] bg-lav-200" />
            <span className="h-3 w-3 rounded-[3px] bg-lav-300" />
            <span className="h-3 w-3 rounded-[3px] bg-lav-500" />
            <span className="t-label text-tinta-3">Más</span>
          </div>
        </Entrada>

        {/* La narrativa, no el porcentaje */}
        <Entrada delay={0.2} className="overflow-hidden rounded-[var(--radius-card)] bg-superficie p-4 shadow-n1">
          <p className="t-label-alto flex items-center gap-2 text-tinta">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-lav-100 text-lav-700">
              <BookOpen size={16} strokeWidth={2.4} />
            </span>
            Mi historia de la semana
          </p>

          {s.narrativa.length > 0 ? (
            <p className="t-cuerpo mt-2.5 text-tinta-2">
              Esta semana {s.narrativa.join(', ')}. Cada semana estoy construyendo hábitos más fuertes.
            </p>
          ) : (
            <p className="t-cuerpo mt-2.5 text-tinta-2">
              Esta semana apenas empieza. Cuando cumpla mis primeras misiones,
              aquí voy a ver lo que fui construyendo.
            </p>
          )}
        </Entrada>
      </main>

      <NavInferior />
    </div>
  );
}
