import Image from 'next/image';
import { ilustracion } from '@/lib/assets';
import { redirect } from 'next/navigation';
import { Star, LogOut, ShieldCheck } from 'lucide-react';
import { usuariaActual } from '@/lib/auth';
import { nivelDe, NIVELES, rachaDe, hoyLocal } from '@/lib/dia';
import { accionSalir } from '../acciones';
import { NavInferior } from '@/components/NavInferior';

export default async function Yo() {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  const nivel = await nivelDe(usuaria.id);
  const racha = await rachaDe(usuaria.id, hoyLocal());

  const siguiente = NIVELES[nivel.numero];
  const faltan = siguiente ? siguiente.desde - nivel.hechasTotales : 0;
  const base = NIVELES[nivel.numero - 1].desde;
  const avance = siguiente
    ? Math.round(((nivel.hechasTotales - base) / (siguiente.desde - base)) * 100)
    : 100;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="sin-barra min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <header className="flex flex-col items-center pb-2 pt-7">
          <Image
            src={ilustracion('avatar-violetta.webp')}
            alt=""
            width={320}
            height={320}
            priority
            className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-n2"
          />
          <h1
            className="t-pagina lettering mt-3 text-tinta"
          >
            {usuaria.nombre}
          </h1>
          <p className="t-cuerpo-fuerte mt-1 text-tinta-2">@{usuaria.usuario}</p>
        </header>

        <section className="mb-3 mt-4 rounded-[var(--radius-card)] bg-superficie p-5 shadow-n1">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-none items-center justify-center
                             rounded-[var(--radius-inner)] bg-durazno-100">
              <Star size={22} fill="#D18E2E" className="text-durazno-700" />
            </span>
            <div className="min-w-0">
              <p className="t-label-alto text-tinta-2">NIVEL {nivel.numero}</p>
              <p
                className="t-seccion text-tinta"
              >
                {nivel.titulo}
              </p>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-lg bg-lav-50">
            <span
              className="block h-full rounded-lg bg-gradient-to-r from-rosa to-lav-500
                         transition-[width] duration-700 ease-[var(--ease-suave)]"
              style={{ width: `${Math.max(4, avance)}%` }}
            />
          </div>

          <p className="t-label mt-3 text-tinta-2">
            {siguiente
              ? `Me ${faltan === 1 ? 'falta 1 misión' : `faltan ${faltan} misiones`} para ser ${siguiente.titulo}.`
              : '¡Llegué al último nivel! Sigo construyendo mis hábitos.'}
          </p>
        </section>

        {/* Escalera de niveles: dónde está y qué viene */}
        <section className="mb-3 rounded-[var(--radius-card)] bg-superficie p-5 shadow-n1">
          <h2
            className="t-seccion mb-3 text-tinta"
          >
            Mi camino
          </h2>

          <ol className="space-y-3">
            {NIVELES.map((nv, i) => {
              const alcanzado = nivel.hechasTotales >= nv.desde;
              const actual = i + 1 === nivel.numero;

              return (
                <li key={nv.titulo} className="flex items-center gap-3">
                  <span
                    className={`t-label-alto flex h-10 w-10 flex-none items-center justify-center rounded-full
                      ${
                        alcanzado
                          ? 'bg-lav-500 text-white'
                          : 'bg-lav-50 text-tinta-3'
                      }
                      ${actual ? 'ring-[3px] ring-lav-200 ring-offset-2 ring-offset-superficie' : ''}`}
                  >
                    {i + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`t-cuerpo-fuerte block ${
                        alcanzado ? 'text-tinta' : 'text-tinta-3'
                      }`}
                    >
                      {nv.titulo}
                    </span>
                    <span className="t-label text-tinta-3">
                      {nv.desde === 0 ? 'Desde el primer día' : `${nv.desde} misiones cumplidas`}
                    </span>
                  </span>

                  {actual && (
                    <span className="t-label-alto flex-none rounded-[var(--radius-chip)] bg-lav-50 px-3 py-1
                                     text-lav-700">
                      AQUÍ ESTOY
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-card)] bg-menta-100 p-4 shadow-n1">
            <p className="t-label-alto text-menta-700">
              EN TOTAL
            </p>
            <p
              className="t-heroe tabular mt-2 text-menta-700"
            >
              {nivel.hechasTotales}
            </p>
            <p className="t-label mt-2 text-menta-700/85">misiones cumplidas</p>
          </div>

          <div className="rounded-[var(--radius-card)] bg-durazno-100 p-4 shadow-n1">
            <p className="t-label-alto text-durazno-700">
              MI RACHA
            </p>
            <p
              className="t-heroe tabular mt-2 text-durazno-700"
            >
              {racha}
            </p>
            <p className="t-label mt-2 text-durazno-700/85">
              {racha === 1 ? 'día seguido' : 'días seguidos'}
            </p>
          </div>
        </section>

        <section className="mb-4 flex items-start gap-3 rounded-[var(--radius-card)]
                            bg-lav-50 p-4">
          <ShieldCheck size={20} className="mt-0.5 flex-none text-lav-700" />
          <p className="t-label font-semibold text-tinta-2">
            Mi progreso se guarda en la nube y mi contraseña está cifrada. Puedo entrar desde cualquier teléfono.
          </p>
        </section>

        <form action={accionSalir}>
          <button
            type="submit"
            className="t-seccion flex h-14 w-full items-center justify-center gap-2
                       rounded-[var(--radius-pill)] bg-superficie
                       text-tinta-2 shadow-n1 transition-transform duration-150 active:scale-[0.975]"
          >
            <LogOut size={19} />
            Cerrar mi sesión
          </button>
        </form>
      </main>

      <NavInferior />
    </div>
  );
}
