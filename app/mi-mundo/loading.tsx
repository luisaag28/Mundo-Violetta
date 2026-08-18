export default function Cargando() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="min-h-0 flex-1 overflow-hidden px-4 pb-6" aria-busy>
        <span className="sr-only">Cargando mi mundo…</span>

        <div className="py-5">
          <div className="h-7 w-40 animate-pulse rounded bg-lav-100" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-lav-100" />
        </div>

        <div className="mb-5 h-[112px] animate-pulse rounded-[var(--radius-card)] bg-lav-100" />

        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-[var(--radius-card)] bg-superficie" />
          ))}
        </div>
      </main>
    </div>
  );
}
