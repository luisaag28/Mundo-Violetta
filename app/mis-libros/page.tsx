import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Check, ChevronRight } from 'lucide-react';
import { ilustracion } from '@/lib/assets';
import { usuariaActual } from '@/lib/auth';
import { librosDe } from '@/lib/libros';
import { NavInferior } from '@/components/NavInferior';
import { BarraLibro } from '@/components/BarraLibro';
import { Entrada } from '@/components/Entrada';

export default async function MisLibros() {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  const libros = await librosDe(usuaria.id);
  const leyendo = libros.filter((l) => !l.terminado);
  const terminados = libros.filter((l) => l.terminado);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="sin-barra min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <header className="flex items-center justify-between gap-3 py-5">
          <div className="min-w-0">
            <h1 className="t-pagina lettering text-tinta">Mis libros</h1>
            <p className="t-cuerpo mt-1 text-tinta-2">Lo que estoy leyendo y lo que ya terminé.</p>
          </div>
          <Link
            href="/mis-libros/nuevo"
            aria-label="Agregar un libro"
            className="flex h-12 w-12 flex-none items-center justify-center rounded-full
                       bg-gradient-to-r from-rosa to-lav-500 text-white shadow-n2
                       transition-transform duration-150 active:scale-90"
          >
            <Plus size={22} strokeWidth={2.8} />
          </Link>
        </header>

        {libros.length === 0 ? (
          <div className="rounded-[var(--radius-card)] bg-superficie p-7 text-center shadow-n1">
            <Image
              src={ilustracion('habito-leer.webp')}
              alt=""
              width={320}
              height={320}
              className="mx-auto mb-4 h-28 w-28 rounded-[var(--radius-card)] object-cover"
            />
            <p className="t-cuerpo-fuerte text-tinta">Todavía no tengo libros acá</p>
            <p className="t-cuerpo mx-auto mt-2 max-w-[250px] text-tinta-2">
              Agrega el libro que estás leyendo y anota cómo vas, página por página.
            </p>
            <Link
              href="/mis-libros/nuevo"
              className="t-cuerpo-fuerte mt-5 inline-flex h-11 items-center justify-center rounded-[var(--radius-pill)]
                         bg-gradient-to-r from-rosa to-lav-500 px-6 text-white shadow-n2
                         transition-transform duration-150 active:scale-[0.975]"
            >
              Agregar mi primer libro
            </Link>
          </div>
        ) : (
          <>
            {leyendo.length > 0 && (
              <Entrada className="mb-4">
                <p className="t-label-alto mb-3 uppercase text-tinta-2">Estoy leyendo</p>
                <ul className="space-y-2.5">
                  {leyendo.map((libro) => (
                    <li key={libro.id}>
                      <Link
                        href={`/mis-libros/${libro.id}`}
                        className="block rounded-[var(--radius-card)] bg-superficie p-4 shadow-n1
                                   transition-transform duration-150 active:scale-[0.985]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="t-cuerpo-fuerte truncate text-tinta">{libro.titulo}</p>
                            <p className="t-label mt-0.5 text-tinta-2">
                              Voy en la página {libro.paginaActual} de {libro.paginasTotales}
                            </p>
                          </div>
                          <span className="t-label-alto flex-none rounded-[var(--radius-chip)] bg-lav-100 px-2.5 py-1 text-lav-700">
                            {libro.porcentaje}%
                          </span>
                        </div>
                        <div className="mt-3">
                          <BarraLibro porcentaje={libro.porcentaje} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Entrada>
            )}

            {terminados.length > 0 && (
              <Entrada delay={0.06} className="rounded-[var(--radius-card)] bg-hundido p-3">
                <p className="t-label-alto mb-2 px-1 uppercase text-tinta-2">Terminé</p>
                <ul className="space-y-2">
                  {terminados.map((libro) => (
                    <li key={libro.id}>
                      <Link
                        href={`/mis-libros/${libro.id}`}
                        className="flex items-center gap-3 rounded-[var(--radius-card)] bg-superficie p-3
                                   shadow-n1 transition-transform duration-150 active:scale-[0.985]"
                      >
                        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-menta-100 text-menta-700">
                          <Check size={18} strokeWidth={3} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="t-cuerpo-fuerte block truncate text-tinta">{libro.titulo}</span>
                          <span className="t-label text-tinta-2">{libro.paginasTotales} páginas</span>
                        </span>
                        <ChevronRight size={18} className="flex-none text-tinta-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Entrada>
            )}
          </>
        )}
      </main>

      <NavInferior />
    </div>
  );
}
