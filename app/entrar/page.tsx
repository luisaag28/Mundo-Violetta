'use client';

import { ilustracion } from '@/lib/assets';
import { useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Lock, Sparkles } from 'lucide-react';
import { accionEntrar, type EstadoForm } from '../acciones';
import { CampoTexto } from '@/components/CampoTexto';
import { BotonEnviar } from '@/components/BotonEnviar';

export default function Entrar() {
  const [estado, accion] = useActionState<EstadoForm, FormData>(accionEntrar, {});

  return (
    <main className="flex min-h-dvh flex-col items-center px-5 pb-10 pt-10">
      <div className="w-full max-w-[400px]">

        {/* Personaje */}
        <div className="relative mx-auto mb-6 h-[168px] w-[168px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, #E9DEF7 0%, #FDE4EC 55%, transparent 72%)',
            }}
          />
          <Image
            src={ilustracion('avatar-violetta.webp')}
            alt=""
            width={320}
            height={320}
            priority
            className="relative h-full w-full rounded-full border-4 border-white object-cover shadow-n2"
          />
          <span className="absolute -right-1 top-3 flex h-11 w-11 items-center justify-center
                           rounded-[var(--radius-inner)] bg-white shadow-n2">
            <Sparkles size={22} className="text-lav-500" fill="#C4A9E8" />
          </span>
        </div>

        <h1
          className="t-pagina lettering text-center text-tinta"
        >
          ¡Qué bueno verte!
        </h1>
        <p className="t-cuerpo mt-3 text-center text-tinta-2">
          Entra para seguir con tus misiones.
        </p>

        <form action={accion} className="mt-8 space-y-4">
          <CampoTexto
            nombre="usuario"
            etiqueta="MI USUARIO"
            placeholder="violetta"
            autoComplete="username"
            icono={<User size={20} />}
          />
          <CampoTexto
            nombre="contrasena"
            etiqueta="MI CONTRASEÑA"
            tipo="password"
            placeholder="••••••"
            autoComplete="current-password"
            icono={<Lock size={20} />}
          />

          {estado.error && (
            <p
              role="alert"
              className="t-cuerpo-fuerte rounded-[var(--radius-inner)] bg-aviso-100 px-4 py-3
                         text-[#A33F63]"
            >
              {estado.error}
            </p>
          )}

          <div className="pt-2">
            <BotonEnviar cargando="Entrando…">Entrar a mi mundo</BotonEnviar>
          </div>
        </form>

        <p className="t-cuerpo mt-7 text-center text-tinta-2">
          ¿Todavía no tienes tu mundo?{' '}
          <Link
            href="/registro"
            className="font-extrabold text-lav-700 underline decoration-lav-200 decoration-2 underline-offset-4"
          >
            Créalo aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
