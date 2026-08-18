import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Capa de datos sobre Supabase (Postgres).
 *
 * SEGURIDAD: se usa la service key, que SOLO existe en el servidor.
 * Nunca llega al navegador (no lleva el prefijo NEXT_PUBLIC_).
 * Las tablas tienen RLS activo sin políticas, así que aunque la clave
 * pública se filtrara, desde el navegador no se puede leer ni escribir nada.
 */

let _sb: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (_sb) return _sb;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno del servidor.');
  }

  _sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _sb;
}

export type FilaHabito = {
  id: number;
  clave: string;
  titulo: string;
  detalle: string | null;
  ilustracion: string;
  dias: string;
  tipo: 'simple' | 'vasos';
  meta: number;
  orden: number;
};

/** Hábitos base de Violetta. Se copian a cada usuaria nueva al registrarse. */
export const HABITOS_SEMILLA: Array<{
  clave: string;
  titulo: string;
  detalle: string | null;
  ilustracion: string;
  dias: string;
  tipo: 'simple' | 'vasos';
  meta: number;
}> = [
  { clave: 'cama',      titulo: 'Organicé mi cama',         detalle: 'Apenas me levanto',     ilustracion: 'habito-cama.webp',         dias: '1,2,3,4,5,6,7', tipo: 'simple', meta: 1 },
  { clave: 'facial_am', titulo: 'Hice mi rutina facial',    detalle: 'En la mañana',          ilustracion: 'habito-facial.webp',       dias: '1,2,3,4,5,6,7', tipo: 'simple', meta: 1 },
  { clave: 'colegio',   titulo: 'Fui al colegio',           detalle: null,                    ilustracion: 'habito-colegio.webp',      dias: '1,2,3,4,5',     tipo: 'simple', meta: 1 },
  { clave: 'agua',      titulo: 'Tomé mi agua',             detalle: '4 vasos en el día',     ilustracion: 'habito-agua.webp',         dias: '1,2,3,4,5,6,7', tipo: 'vasos',  meta: 4 },
  { clave: 'tareas',    titulo: 'Revisé mis tareas',        detalle: 'Antes de guardar todo', ilustracion: 'habito-tareas.webp',       dias: '1,2,4,7',       tipo: 'simple', meta: 1 },
  { clave: 'maleta',    titulo: 'Preparé mi maleta',        detalle: 'Para mañana',           ilustracion: 'habito-maleta.webp',       dias: '1,2,3,4,7',     tipo: 'simple', meta: 1 },
  { clave: 'baile',     titulo: 'Practiqué baile',          detalle: '30 a 40 minutos',       ilustracion: 'habito-baile.webp',        dias: '1,2,3,4,5,6',   tipo: 'simple', meta: 1 },
  { clave: 'leer',      titulo: 'Leí un poco hoy',          detalle: '15 a 20 minutos',       ilustracion: 'habito-leer.webp',         dias: '1,2,4,5,6,7',   tipo: 'simple', meta: 1 },
  { clave: 'ropa',      titulo: 'Dejé lista mi ropa',       detalle: 'Para mañana',           ilustracion: 'habito-ropa.webp',         dias: '1,2,3,4,7',     tipo: 'simple', meta: 1 },
  { clave: 'espacio',   titulo: 'Organicé mi espacio',      detalle: '5 a 10 minutos',        ilustracion: 'habito-juguetes.webp',     dias: '1,2,4,6,7',     tipo: 'simple', meta: 1 },
  { clave: 'ingles',    titulo: 'Fui a mi clase de inglés', detalle: null,                    ilustracion: 'habito-peluche.webp',      dias: '6',             tipo: 'simple', meta: 1 },
  { clave: 'facial_pm', titulo: 'Hice mi rutina de noche',  detalle: 'Antes de dormir',       ilustracion: 'habito-facial-noche.webp', dias: '1,2,3,4,5,6,7', tipo: 'simple', meta: 1 },
];

export async function sembrarHabitos(usuariaId: number) {
  const filas = HABITOS_SEMILLA.map((h, i) => ({
    usuaria_id: usuariaId,
    clave: h.clave,
    titulo: h.titulo,
    detalle: h.detalle,
    ilustracion: h.ilustracion,
    dias: h.dias,
    tipo: h.tipo,
    meta: h.meta,
    orden: i,
  }));

  const { error } = await db().from('habitos').insert(filas);
  if (error) throw new Error(`No pude crear los hábitos: ${error.message}`);
}
