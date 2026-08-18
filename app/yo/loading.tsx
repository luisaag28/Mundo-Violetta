export default function Cargando() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="min-h-0 flex-1 overflow-hidden px-4 pb-6" aria-busy>
        <span className="sr-only">Cargando mi perfil…</span>

        <div className="flex flex-col items-center pb-2 pt-7">
          <div className="h-28 w-28 animate-pulse rounded-full bg-lav-100" />
          <div className="mt-3 h-6 w-32 animate-pulse rounded bg-lav-100" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-lav-100" />
        </div>

        <div className="mb-3 mt-4 h-32 animate-pulse rounded-[var(--radius-card)] bg-superficie" />
        <div className="mb-3 h-40 animate-pulse rounded-[var(--radius-card)] bg-superficie" />

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="h-24 animate-pulse rounded-[var(--radius-card)] bg-lav-100" />
          <div className="h-24 animate-pulse rounded-[var(--radius-card)] bg-lav-100/70" />
        </div>
      </main>
    </div>
  );
}
