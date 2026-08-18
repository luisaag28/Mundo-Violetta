import Image from 'next/image';
import { ilustracion } from '@/lib/assets';
import { redirect } from 'next/navigation';
import { Lock } from 'lucide-react';
import { usuariaActual } from '@/lib/auth';
import { albumDe } from '@/lib/dia';
import { NavInferior } from '@/components/NavInferior';
import { ProgresoMundo } from '@/components/ProgresoMundo';
import { Nube } from '@/components/Nube';

export default async function MiMundo() {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  const album = await albumDe(usuaria.id);
  const abiertos = album.filter((m) => m.veces > 0).length;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="sin-barra min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <header className="py-5">
          <h1
            className="t-pagina lettering text-tinta"
          >
            Mi mundo
          </h1>
          <p className="t-cuerpo mt-2 text-tinta-2">
            Cada misión que cumplo abre un momento mío.
          </p>
        </header>

        <section
          className="relative mb-5 overflow-hidden rounded-[var(--radius-card)] p-5 shadow-n2"
          style={{ background: 'linear-gradient(150deg,#A98BE0 0%,#C99AD4 52%,#E890B7 100%)' }}
        >
          <Nube className="absolute -right-5 -top-7 h-16 w-32 opacity-[0.14]" desde="#FFFFFF" hasta="#FFFFFF" />
          <p className="t-label-alto relative text-white/95">
            MOMENTOS ABIERTOS
          </p>
          <ProgresoMundo abiertos={abiertos} total={album.length} />
        </section>

        <ul className="grid grid-cols-2 gap-3">
          {album.map((m) => (
            <li
              key={m.titulo}
              className="overflow-hidden rounded-[var(--radius-card)] bg-superficie shadow-n1"
            >
              <div className="relative aspect-square">
                <Image
                  src={ilustracion(m.ilustracion)}
                  alt={m.titulo}
                  width={320}
                  height={320}
                  className={`h-full w-full object-cover ${
                    m.veces > 0 ? '' : 'opacity-55 grayscale brightness-[1.28] contrast-[0.6]'
                  }`}
                />
                {m.veces === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tinta/45">
                      <Lock size={22} className="text-white" strokeWidth={2.4} />
                    </span>
                  </span>
                )}
                {m.veces > 0 && (
                  <span className="t-label-alto tabular absolute bottom-2 right-2 rounded-[10px] bg-white/92
                                   px-2 py-1 text-lav-700 shadow-n1">
                    ×{m.veces}
                  </span>
                )}
              </div>

              <div className="p-3">
                <p className="t-cuerpo-fuerte text-tinta">{m.titulo}</p>
                <p className="t-label mt-1 text-tinta-2">
                  {m.veces === 0
                    ? 'Todavía por abrir'
                    : m.veces === 1
                      ? 'Lo hice 1 vez'
                      : `Lo hice ${m.veces} veces`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </main>

      <NavInferior />
    </div>
  );
}
