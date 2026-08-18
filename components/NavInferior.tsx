'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, TrendingUp, User } from 'lucide-react';

const DESTINOS = [
  { href: '/mi-dia', etiqueta: 'Mi día', Icono: Home },
  { href: '/mi-mundo', etiqueta: 'Mi mundo', Icono: Sparkles },
  { href: '/mi-semana', etiqueta: 'Mi semana', Icono: TrendingUp },
  { href: '/yo', etiqueta: 'Yo', Icono: User },
];

export function NavInferior() {
  const ruta = usePathname();

  return (
    <nav
      className="flex-none border-t border-lav-100 bg-superficie pb-[env(safe-area-inset-bottom)]"
      aria-label="Secciones"
    >
      <ul className="flex items-center justify-around px-1.5 pt-2 pb-2">
        {DESTINOS.map(({ href, etiqueta, Icono }) => {
          const activo = ruta === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? 'page' : undefined}
                className="flex min-w-[70px] flex-col items-center gap-1 rounded-[var(--radius-inner)]
                           py-1 transition-transform duration-150 active:scale-95"
              >
                <span
                  className={`flex h-8 w-13 items-center justify-center rounded-2xl px-4
                    ${activo ? 'bg-lav-100' : ''}`}
                >
                  <Icono
                    size={22}
                    strokeWidth={activo ? 2.4 : 2.1}
                    className={activo ? 'text-lav-700' : 'text-tinta-3'}
                    fill={activo ? '#C4A9E8' : 'none'}
                  />
                </span>
                <span
                  className={`t-label ${
                    activo ? 'text-lav-700' : 'text-tinta-3'
                  }`}
                >
                  {etiqueta}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
