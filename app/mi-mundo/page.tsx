import { ilustracion } from '@/lib/assets';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { usuariaActual } from '@/lib/auth';
import { albumDe, resumenDia, hoyLocal } from '@/lib/dia';
import { NavInferior } from '@/components/NavInferior';
import { ProgresoMundo } from '@/components/ProgresoMundo';
import { AlbumMomentos } from '@/components/AlbumMomentos';
import { Nube } from '@/components/Nube';

export default async function MiMundo() {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  const [album, dia] = await Promise.all([
    albumDe(usuaria.id),
    resumenDia(usuaria.id, hoyLocal()),
  ]);
  const abiertos = album.filter((m) => m.veces > 0).length;
  const nuevosHoy = new Set(dia.momentos.filter((m) => m.nuevo).map((m) => m.titulo));
  const albumConNuevo = album.map((m) => ({ ...m, nuevo: nuevosHoy.has(m.titulo) }));

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

        <section className="rounded-[var(--radius-card)] bg-lav-50 p-2">
          {album.length === 0 ? (
            <div className="rounded-[var(--radius-card)] bg-superficie p-7 text-center shadow-n1">
              <Image
                src={ilustracion('habito-peluche.webp')}
                alt=""
                width={320}
                height={320}
                className="mx-auto mb-4 h-28 w-28 rounded-[var(--radius-card)] object-cover"
              />
              <p className="t-cuerpo-fuerte text-tinta">Todavía no tengo momentos</p>
              <p className="t-cuerpo mx-auto mt-2 max-w-[250px] text-tinta-2">
                Cuando cumpla mis misiones en Mi día, van a ir apareciendo acá.
              </p>
            </div>
          ) : (
            <AlbumMomentos album={albumConNuevo} />
          )}
        </section>
      </main>

      <NavInferior />
    </div>
  );
}
