export default function Cargando() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="min-h-0 flex-1 overflow-hidden px-4 pb-6" aria-busy>
        <span className="sr-only">Cargando mis libros…</span>

        <div className="flex items-center justify-between py-5">
          <div>
            <div className="h-7 w-32 animate-pulse rounded bg-lav-100" />
            <div className="mt-2 h-4 w-52 animate-pulse rounded bg-lav-100" />
          </div>
          <div className="h-12 w-12 animate-pulse rounded-full bg-lav-100" />
        </div>

        <div className="mb-3 h-4 w-28 animate-pulse rounded bg-lav-100" />
        <div className="space-y-2.5">
          <div className="h-[92px] animate-pulse rounded-[var(--radius-card)] bg-superficie" />
          <div className="h-[92px] animate-pulse rounded-[var(--radius-card)] bg-superficie" />
        </div>
      </main>
    </div>
  );
}
