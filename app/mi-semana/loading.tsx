export default function Cargando() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="min-h-0 flex-1 overflow-hidden px-4 pb-6" aria-busy>
        <span className="sr-only">Cargando mi semana…</span>

        <div className="py-5">
          <div className="h-7 w-40 animate-pulse rounded bg-lav-100" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-lav-100" />
        </div>

        <div className="mb-4 h-14 animate-pulse rounded-[var(--radius-card)] bg-lav-100" />
        <div className="mb-4 h-[104px] animate-pulse rounded-[var(--radius-card)] bg-superficie" />

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="h-[104px] animate-pulse rounded-[var(--radius-card)] bg-lav-100" />
          <div className="h-[104px] animate-pulse rounded-[var(--radius-card)] bg-lav-100/70" />
        </div>

        <div className="h-32 animate-pulse rounded-[var(--radius-card)] bg-superficie" />
      </main>
    </div>
  );
}
