'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  registrar, entrar, salir, usuariaActual,
  validarUsuario, validarContrasena,
} from '@/lib/auth';
import { alternarMision, hoyLocal } from '@/lib/dia';
import { crearLibro, actualizarAvance, marcarTerminado, borrarLibro } from '@/lib/libros';

export type EstadoForm = { error?: string; campo?: 'usuario' | 'contrasena' | 'nombre' };
export type EstadoFormLibro = {
  error?: string;
  campo?: 'titulo' | 'paginasTotales' | 'fechaInicio' | 'paginaInicial';
};

export async function accionRegistro(
  _previo: EstadoForm,
  datos: FormData
): Promise<EstadoForm> {
  const nombre = String(datos.get('nombre') ?? '').trim();
  const usuario = String(datos.get('usuario') ?? '');
  const contrasena = String(datos.get('contrasena') ?? '');

  if (nombre.length < 2) return { error: 'Escribe tu nombre para saludarte.', campo: 'nombre' };
  if (nombre.length > 24) return { error: 'Tu nombre es muy largo (máximo 24 letras).', campo: 'nombre' };

  const eUsuario = validarUsuario(usuario);
  if (eUsuario) return { error: eUsuario, campo: 'usuario' };

  const eClave = validarContrasena(contrasena);
  if (eClave) return { error: eClave, campo: 'contrasena' };

  const r = await registrar(usuario, nombre, contrasena);
  if (!r.ok) return { error: r.error, campo: 'usuario' };

  redirect('/mi-dia');
}

export async function accionEntrar(
  _previo: EstadoForm,
  datos: FormData
): Promise<EstadoForm> {
  const usuario = String(datos.get('usuario') ?? '');
  const contrasena = String(datos.get('contrasena') ?? '');

  if (!usuario.trim() || !contrasena) {
    return { error: 'Escribe tu usuario y tu contraseña.' };
  }

  const r = await entrar(usuario, contrasena);
  if (!r.ok) return { error: r.error };

  redirect('/mi-dia');
}

export async function accionSalir() {
  await salir();
  redirect('/entrar');
}

export async function accionAlternarMision(habitoId: number, fecha?: string, objetivo?: number) {
  const usuaria = await usuariaActual();
  if (!usuaria) {
    return { ok: false as const, error: 'Se cerró mi sesión.', accion: 'entrar' as const };
  }

  const hoy = hoyLocal();
  const dia = fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha <= hoy ? fecha : hoy;

  const r = await alternarMision(usuaria.id, habitoId, dia, objetivo);
  if (!r) {
    return { ok: false as const, error: 'No pude guardar esa misión.', accion: 'recargar' as const };
  }

  revalidatePath('/mi-dia');
  return { ok: true as const, ...r };
}

export async function accionCrearLibro(
  _previo: EstadoFormLibro,
  datos: FormData
): Promise<EstadoFormLibro> {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  const titulo = String(datos.get('titulo') ?? '').trim();
  const paginasTotales = Number(datos.get('paginasTotales'));
  const fechaInicio = String(datos.get('fechaInicio') ?? '');
  const paginaInicialTexto = String(datos.get('paginaInicial') ?? '').trim();
  const paginaInicial = paginaInicialTexto === '' ? 1 : Number(paginaInicialTexto);

  if (titulo.length < 1) return { error: 'Escribe el nombre del libro.', campo: 'titulo' };
  if (titulo.length > 80) return { error: 'Ese nombre es muy largo (máximo 80 letras).', campo: 'titulo' };

  if (!Number.isInteger(paginasTotales) || paginasTotales <= 0 || paginasTotales > 5000) {
    return { error: 'Escribe cuántas páginas tiene el libro.', campo: 'paginasTotales' };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) {
    return { error: 'Elige la fecha en que empezaste a leerlo.', campo: 'fechaInicio' };
  }
  if (fechaInicio > hoyLocal()) {
    return { error: 'La fecha de inicio no puede ser en el futuro.', campo: 'fechaInicio' };
  }

  if (!Number.isInteger(paginaInicial) || paginaInicial < 0 || paginaInicial > paginasTotales) {
    return { error: 'La página inicial tiene que estar entre 0 y el total de páginas.', campo: 'paginaInicial' };
  }

  const id = await crearLibro(usuaria.id, { titulo, paginasTotales, fechaInicio, paginaInicial });
  if (!id) return { error: 'No pude guardar el libro. Probá de nuevo.' };

  revalidatePath('/mis-libros');
  redirect('/mis-libros');
}

export async function accionActualizarAvance(libroId: number, paginaActual: number) {
  const usuaria = await usuariaActual();
  if (!usuaria) {
    return { ok: false as const, error: 'Se cerró mi sesión.', accion: 'entrar' as const };
  }
  if (!Number.isInteger(paginaActual) || paginaActual < 0) {
    return { ok: false as const, error: 'Esa página no es válida.', accion: 'recargar' as const };
  }

  const ok = await actualizarAvance(usuaria.id, libroId, paginaActual);
  if (!ok) return { ok: false as const, error: 'No pude guardar el avance.', accion: 'recargar' as const };

  revalidatePath('/mis-libros');
  revalidatePath(`/mis-libros/${libroId}`);
  return { ok: true as const };
}

export async function accionTerminarLibro(libroId: number) {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  await marcarTerminado(usuaria.id, libroId);
  revalidatePath('/mis-libros');
  revalidatePath(`/mis-libros/${libroId}`);
}

export async function accionBorrarLibro(libroId: number) {
  const usuaria = await usuariaActual();
  if (!usuaria) redirect('/entrar');

  await borrarLibro(usuaria.id, libroId);
  revalidatePath('/mis-libros');
  redirect('/mis-libros');
}
