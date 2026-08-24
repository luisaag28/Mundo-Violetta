import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { usuariaActual } from '@/lib/auth';
import { libroDe } from '@/lib/libros';
import { NavInferior } from '@/components/NavInferior';
import { ActualizarLectura } from '@/components/ActualizarLectura';

export default async function DetalleLibro({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  const { id } = await params;
  const libroId = Number(id);
  if (!Number.isInteger(libroId)) notFound();

  const libro = await libroDe(usuaria.id, libroId);
  if (!libro) notFound();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="sin-barra min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex items-center gap-3 py-5">
          <Link
            href="/mis-libros"
            aria-label="Volver a mis libros"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-inner)]
                       bg-superficie text-tinta shadow-n1 transition-transform active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="t-seccion line-clamp-2 text-tinta">{libro.titulo}</h1>
        </div>

        <section
          className="relative mb-4 overflow-hidden rounded-[var(--radius-card)] p-5 shadow-n2"
          style={{ background: 'linear-gradient(150deg,#A98BE0 0%,#C99AD4 52%,#E890B7 100%)' }}
        >
          <p className="t-heroe tabular relative text-white">{libro.porcentaje}%</p>
          <p className="t-cuerpo-fuerte relative mt-1 text-white/90">
            {libro.terminado
              ? `Leí las ${libro.paginasTotales} páginas`
              : `Página ${libro.paginaActual} de ${libro.paginasTotales}`}
          </p>
          <div className="relative mt-4">
            <BarraLibroClaro porcentaje={libro.porcentaje} />
          </div>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-card)] bg-menta-100 p-4 shadow-n1">
            <p className="t-label-alto text-menta-700">LEÍDAS</p>
            <p className="t-heroe tabular mt-2 text-menta-700">{libro.paginasLeidas}</p>
            <p className="t-label mt-2 text-menta-700/85">páginas</p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-durazno-100 p-4 shadow-n1">
            <p className="t-label-alto text-durazno-700">FALTAN</p>
            <p className="t-heroe tabular mt-2 text-durazno-700">{libro.paginasFaltan}</p>
            <p className="t-label mt-2 text-durazno-700/85">páginas</p>
          </div>
        </section>

        <ActualizarLectura libro={libro} />
      </main>

      <NavInferior />
    </div>
  );
}

/** Versión clara de la barra (fondo/relleno blanco) para usarla sobre la tarjeta héroe. */
function BarraLibroClaro({ porcentaje }: { porcentaje: number }) {
  return (
    <div
      className="h-3 overflow-hidden rounded-[var(--radius-chip)] bg-white/30"
      role="progressbar"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${porcentaje}% leído`}
    >
      <div
        className="h-full rounded-[var(--radius-chip)] bg-white transition-[width] duration-700 ease-[var(--ease-suave)]"
        style={{ width: `${Math.max(4, porcentaje)}%` }}
      />
    </div>
  );
}

