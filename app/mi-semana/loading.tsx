export default function Cargando() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="min-h-0 flex-1 overflow-hidden px-4 pb-6" aria-busy>
        <span className="sr-only">Cargando mi semana…</span>

        <div className="py-3">
          <div className="h-7 w-40 animate-pulse rounded bg-lav-100" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-lav-100" />
        </div>

        <div className="mb-3 h-14 animate-pulse rounded-[var(--radius-card)] bg-lav-100" />
        <div className="mb-3 h-56 animate-pulse rounded-[var(--radius-card)] bg-superficie" />
        <div className="mb-3 h-64 animate-pulse rounded-[var(--radius-card)] bg-lav-50" />
        <div className="h-24 animate-pulse rounded-[var(--radius-card)] bg-superficie" />
      </main>
    </div>
  );
}
