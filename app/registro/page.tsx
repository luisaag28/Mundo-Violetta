'use client';

import { ilustracion } from '@/lib/assets';
import { useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Lock, Smile, ArrowLeft } from 'lucide-react';
import { accionRegistro, type EstadoForm } from '../acciones';
import { CampoTexto } from '@/components/CampoTexto';
import { BotonEnviar } from '@/components/BotonEnviar';

export default function Registro() {
  const [estado, accion] = useActionState<EstadoForm, FormData>(accionRegistro, {});

  return (
    <main className="flex min-h-dvh flex-col items-center px-5 pb-10 pt-6">
      <div className="w-full max-w-[400px]">

        <Link
          href="/entrar"
          aria-label="Volver"
          className="mb-3 flex h-11 w-11 items-center justify-center rounded-[var(--radius-inner)]
                     bg-superficie text-tinta shadow-n1 transition-transform active:scale-95"
        >
          <ArrowLeft size={22} />
        </Link>

        <div className="relative mx-auto mb-5 h-[132px] w-[132px]">
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
        </div>

        <h1
          className="t-pagina lettering text-center text-tinta"
        >
          Crea tu mundo
        </h1>
        <p className="t-cuerpo mt-3 text-center text-tinta-2">
          Elige tu usuario y una contraseña que recuerdes.
        </p>

        <form action={accion} className="mt-7 space-y-4">
          <CampoTexto
            nombre="nombre"
            etiqueta="MI NOMBRE"
            placeholder="Violetta"
            autoComplete="given-name"
            maxLength={24}
            icono={<Smile size={20} />}
          />
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
            placeholder="Al menos 6 caracteres"
            autoComplete="new-password"
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
            <BotonEnviar cargando="Creando tu mundo…">Empezar mi aventura</BotonEnviar>
          </div>
        </form>

        <p className="t-label mt-6 text-center font-semibold text-tinta-3">
          Tu contraseña se guarda cifrada. Nadie más puede verla, ni yo.
        </p>
      </div>
    </main>
  );
}
