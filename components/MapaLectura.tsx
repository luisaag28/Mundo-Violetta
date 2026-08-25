import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mesAnterior, mesSiguiente, type MesLectura } from '@/lib/libros';

const INICIALES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function nivelDe(paginas: number): 0 | 1 | 2 | 3 {
  if (paginas <= 0) return 0;
  if (paginas <= 5) return 1;
  if (paginas <= 10) return 2;
  return 3;
}

const CLASE_NIVEL: Record<0 | 1 | 2 | 3, string> = {
  0: 'border border-menta/20 bg-superficie text-tinta-3',
  1: 'bg-menta-100 text-menta-700',
  2: 'bg-[#8FDDBC] text-menta-700',
  3: 'bg-menta text-white',
};

export function MapaLectura({ libroId, calendario }: { libroId: number; calendario: MesLectura }) {
  const relleno = calendario.primerDiaSemana - 1;

  return (
    <section className="rounded-[var(--radius-card)] bg-superficie p-4 shadow-n1">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          href={`/mis-libros/${libroId}?mes=${mesAnterior(calendario.mes)}`}
          aria-label="Mes anterior"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full
                     text-menta-700 transition-transform active:scale-90"
        >
          <ChevronLeft size={19} strokeWidth={2.6} />
        </Link>

        <p className="t-cuerpo-fuerte text-tinta">{calendario.etiqueta}</p>

        {calendario.haySiguiente ? (
          <Link
            href={`/mis-libros/${libroId}?mes=${mesSiguiente(calendario.mes)}`}
            aria-label="Mes siguiente"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full
                       text-menta-700 transition-transform active:scale-90"
          >
            <ChevronRight size={19} strokeWidth={2.6} />
          </Link>
        ) : (
          <span aria-hidden className="flex h-9 w-9 flex-none items-center justify-center text-menta-700/25">
            <ChevronRight size={19} strokeWidth={2.6} />
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-[5px]">
        {INICIALES.map((letra, i) => (
          <span key={i} className="t-label text-center text-tinta-3">
            {letra}
          </span>
        ))}

        {Array.from({ length: relleno }).map((_, i) => (
          <div key={`r-${i}`} aria-hidden />
        ))}

        {calendario.dias.map((d) => {
          const nivel = nivelDe(d.paginas);
          return (
            <div
              key={d.fecha}
              title={d.futuro ? undefined : `${d.fecha}: ${d.paginas} páginas`}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-[var(--radius-chip)] ${
                d.futuro ? 'border border-menta/10 bg-transparent text-tinta-3/50' : CLASE_NIVEL[nivel]
              }`}
            >
              <span className="absolute left-1 top-0.5 text-[9px] font-bold opacity-60">{d.dia}</span>
              {!d.futuro && <span className="text-[13px] font-extrabold">{d.paginas}</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <span className="t-label text-tinta-3">Menos</span>
        <span className="h-3 w-3 rounded-[3px] border border-menta/20 bg-superficie" />
        <span className="h-3 w-3 rounded-[3px] bg-menta-100" />
        <span className="h-3 w-3 rounded-[3px] bg-[#8FDDBC]" />
        <span className="h-3 w-3 rounded-[3px] bg-menta" />
        <span className="t-label text-tinta-3">Más</span>
      </div>
    </section>
  );
}
