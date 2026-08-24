'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { BookOpen, Hash, Calendar, Bookmark, ArrowLeft } from 'lucide-react';
import { accionCrearLibro } from '../../acciones';
import type { EstadoFormLibro } from '../../acciones';
import { CampoTexto } from '@/components/CampoTexto';
import { BotonEnviar } from '@/components/BotonEnviar';

function hoyParaInput(): string {
  return new Date().toLocaleDateString('en-CA');
}

export default function NuevoLibro() {
  const [estado, accion] = useActionState<EstadoFormLibro, FormData>(accionCrearLibro, {});

  return (
    <main className="flex min-h-dvh flex-col items-center px-5 pb-10 pt-6">
      <div className="w-full max-w-[400px]">
        <Link
          href="/mis-libros"
          aria-label="Volver a mis libros"
          className="mb-3 flex h-11 w-11 items-center justify-center rounded-[var(--radius-inner)]
                     bg-superficie text-tinta shadow-n1 transition-transform active:scale-95"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="t-pagina lettering text-tinta">Agregar un libro</h1>
        <p className="t-cuerpo mt-3 text-tinta-2">
          Anotá el libro que estás leyendo para seguir tu avance.
        </p>

        <form action={accion} className="mt-7 space-y-4">
          <CampoTexto
            nombre="titulo"
            etiqueta="NOMBRE DEL LIBRO"
            placeholder="Ej: Matilda"
            maxLength={80}
            icono={<BookOpen size={20} />}
          />
          <CampoTexto
            nombre="paginasTotales"
            etiqueta="CUÁNTAS PÁGINAS TIENE"
            tipo="number"
            placeholder="200"
            min={1}
            max={5000}
            icono={<Hash size={20} />}
          />
          <CampoTexto
            nombre="fechaInicio"
            etiqueta="CUÁNDO EMPECÉ A LEERLO"
            tipo="date"
            defaultValue={hoyParaInput()}
            max={hoyParaInput()}
            icono={<Calendar size={20} />}
          />
          <CampoTexto
            nombre="paginaInicial"
            etiqueta="EN QUÉ PÁGINA VOY (dejalo así si empezás desde la 1)"
            tipo="number"
            placeholder="1"
            min={0}
            icono={<Bookmark size={20} />}
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
            <BotonEnviar cargando="Agregando…">Agregar libro</BotonEnviar>
          </div>
        </form>
      </div>
    </main>
  );
}
