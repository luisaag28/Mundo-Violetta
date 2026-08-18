'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  registrar, entrar, salir, usuariaActual,
  validarUsuario, validarContrasena,
} from '@/lib/auth';
import { alternarMision, hoyLocal } from '@/lib/dia';

export type EstadoForm = { error?: string; campo?: 'usuario' | 'contrasena' | 'nombre' };

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
