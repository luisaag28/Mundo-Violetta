import 'server-only';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db, sembrarHabitos } from './db';

/**
 * Sesión con usuario y contraseña.
 *
 * Reglas aplicadas (09-SEGURIDAD.md / 26-AUTH-MODERNO.md):
 *  - La contraseña se guarda SOLO como hash bcrypt (nunca en claro).
 *  - El identificador de sesión vive en cookie httpOnly: el JavaScript del
 *    navegador no puede leerla, así que no se roba con un script.
 *  - Cerrar sesión borra la sesión EN EL SERVIDOR, no solo la cookie.
 *  - El error de login es genérico: no revela si el usuario existe.
 *  - Se compara el hash aunque el usuario no exista, para que el tiempo de
 *    respuesta no delate qué usuarios están registrados.
 */

const COOKIE = 'violetta_sesion';
const DIAS_SESION = 60;
const COSTO_BCRYPT = 12;
const HASH_FALSO = '$2a$12$K8HcQ7Zk3vJ9pLmN2xRtOeYw1sBdFgHjKlPqRsTuVwXyZaBcDeFgH';

export type Usuaria = { id: number; usuario: string; nombre: string };

const normalizar = (u: string) => u.trim().toLowerCase();

export function validarUsuario(usuario: string): string | null {
  const u = usuario.trim();
  if (u.length < 3) return 'Tu usuario necesita al menos 3 letras.';
  if (u.length > 20) return 'Tu usuario es muy largo (máximo 20 letras).';
  if (!/^[a-zA-Z0-9_ñÑ]+$/.test(u)) return 'Usa solo letras, números o guion bajo.';
  return null;
}

export function validarContrasena(c: string): string | null {
  if (c.length < 6) return 'Tu contraseña necesita al menos 6 caracteres.';
  if (c.length > 100) return 'Esa contraseña es demasiado larga.';
  return null;
}

export async function registrar(usuario: string, nombre: string, contrasena: string) {
  const norm = normalizar(usuario);

  const { data: existe } = await db()
    .from('usuarias')
    .select('id')
    .eq('usuario_norm', norm)
    .maybeSingle();

  if (existe) return { ok: false as const, error: 'Ese usuario ya está tomado. Prueba con otro.' };

  const hash = await bcrypt.hash(contrasena, COSTO_BCRYPT);

  const { data, error } = await db()
    .from('usuarias')
    .insert({
      usuario: usuario.trim(),
      usuario_norm: norm,
      nombre: nombre.trim(),
      hash_contrasena: hash,
    })
    .select('id')
    .single();

  if (error || !data) {
    // Carrera: dos registros con el mismo usuario a la vez
    if (error?.code === '23505') {
      return { ok: false as const, error: 'Ese usuario ya está tomado. Prueba con otro.' };
    }
    return { ok: false as const, error: 'No pude crear tu mundo. Inténtalo otra vez.' };
  }

  await sembrarHabitos(data.id);
  await crearSesion(data.id);
  return { ok: true as const, usuariaId: data.id as number };
}

export async function entrar(usuario: string, contrasena: string) {
  const { data: fila } = await db()
    .from('usuarias')
    .select('id, hash_contrasena')
    .eq('usuario_norm', normalizar(usuario))
    .maybeSingle();

  const coincide = await bcrypt.compare(contrasena, fila?.hash_contrasena ?? HASH_FALSO);

  if (!fila || !coincide) {
    return {
      ok: false as const,
      error: 'Ese usuario o esa contraseña no coinciden. Inténtalo otra vez.',
    };
  }

  await crearSesion(fila.id);
  return { ok: true as const, usuariaId: fila.id as number };
}

async function crearSesion(usuariaId: number) {
  const token = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + DIAS_SESION * 864e5);

  await db().from('sesiones').insert({
    token,
    usuaria_id: usuariaId,
    expira_en: expira.toISOString(),
  });

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expira,
  });
}

export async function usuariaActual(): Promise<Usuaria | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const { data } = await db()
    .from('sesiones')
    .select('expira_en, usuarias(id, usuario, nombre)')
    .eq('token', token)
    .maybeSingle();

  if (!data?.usuarias) return null;

  if (new Date(data.expira_en) < new Date()) {
    await db().from('sesiones').delete().eq('token', token);
    return null;
  }

  const u = data.usuarias as unknown as Usuaria;
  return { id: u.id, usuario: u.usuario, nombre: u.nombre };
}

export async function salir() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db().from('sesiones').delete().eq('token', token);
  jar.delete(COOKIE);
}
