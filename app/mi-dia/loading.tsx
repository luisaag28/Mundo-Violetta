/** Esqueleto con la forma real del contenido: nada de ruedita girando. */
export default function Cargando() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="min-h-0 flex-1 overflow-hidden px-4 pb-6" aria-busy>
        <span className="sr-only">Cargando mi día…</span>

        <div className="flex items-center gap-3 py-4">
          <span className="h-12 w-12 flex-none animate-pulse rounded-full bg-lav-100" />
          <span className="flex-1">
            <span className="block h-3 w-32 animate-pulse rounded bg-lav-100" />
            <span className="mt-2 block h-5 w-40 animate-pulse rounded bg-lav-100" />
          </span>
          <span className="h-9 w-20 flex-none animate-pulse rounded-[var(--radius-chip)] bg-lav-100" />
        </div>

        <div className="mb-4 h-[152px] animate-pulse rounded-[var(--radius-card)] bg-lav-100" />
        <div className="mb-5 h-[136px] animate-pulse rounded-[var(--radius-card)] bg-lav-100/70" />

        <div className="mb-3 h-6 w-48 animate-pulse rounded bg-lav-100" />
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[70px] animate-pulse rounded-[var(--radius-card)] bg-superficie"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
