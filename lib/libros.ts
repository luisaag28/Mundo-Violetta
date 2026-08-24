import 'server-only';
import { db } from './db';
import { hoyLocal } from './dia';

export type Libro = {
  id: number;
  titulo: string;
  paginasTotales: number;
  fechaInicio: string;
  paginaInicial: number;
  paginaActual: number;
  fechaFin: string | null;
  terminado: boolean;
  porcentaje: number;
  paginasLeidas: number;
  paginasFaltan: number;
};

function conCalculos(fila: {
  id: number;
  titulo: string;
  paginas_totales: number;
  fecha_inicio: string;
  pagina_inicial: number;
  pagina_actual: number;
  fecha_fin: string | null;
  terminado: boolean;
}): Libro {
  const paginaActual = Math.min(fila.pagina_actual, fila.paginas_totales);
  return {
    id: fila.id,
    titulo: fila.titulo,
    paginasTotales: fila.paginas_totales,
    fechaInicio: fila.fecha_inicio,
    paginaInicial: fila.pagina_inicial,
    paginaActual,
    fechaFin: fila.fecha_fin,
    terminado: fila.terminado,
    porcentaje: Math.round((paginaActual / fila.paginas_totales) * 100),
    paginasLeidas: Math.max(0, paginaActual - fila.pagina_inicial),
    paginasFaltan: Math.max(0, fila.paginas_totales - paginaActual),
  };
}

const COLUMNAS =
  'id, titulo, paginas_totales, fecha_inicio, pagina_inicial, pagina_actual, fecha_fin, terminado';

export async function librosDe(usuariaId: number): Promise<Libro[]> {
  const { data } = await db()
    .from('libros')
    .select(COLUMNAS)
    .eq('usuaria_id', usuariaId)
    .order('terminado', { ascending: true })
    .order('creado_en', { ascending: false });

  return (data ?? []).map((f) =>
    conCalculos(
      f as unknown as {
        id: number;
        titulo: string;
        paginas_totales: number;
        fecha_inicio: string;
        pagina_inicial: number;
        pagina_actual: number;
        fecha_fin: string | null;
        terminado: boolean;
      }
    )
  );
}

export async function libroDe(usuariaId: number, libroId: number): Promise<Libro | null> {
  const { data } = await db()
    .from('libros')
    .select(COLUMNAS)
    .eq('usuaria_id', usuariaId)
    .eq('id', libroId)
    .maybeSingle();

  if (!data) return null;
  return conCalculos(
    data as unknown as {
      id: number;
      titulo: string;
      paginas_totales: number;
      fecha_inicio: string;
      pagina_inicial: number;
      pagina_actual: number;
      fecha_fin: string | null;
      terminado: boolean;
    }
  );
}

export async function crearLibro(
  usuariaId: number,
  datos: { titulo: string; paginasTotales: number; fechaInicio: string; paginaInicial: number }
) {
  const paginaInicial = Math.max(0, Math.min(datos.paginaInicial, datos.paginasTotales));
  const { data, error } = await db()
    .from('libros')
    .insert({
      usuaria_id: usuariaId,
      titulo: datos.titulo,
      paginas_totales: datos.paginasTotales,
      fecha_inicio: datos.fechaInicio,
      pagina_inicial: paginaInicial,
      pagina_actual: paginaInicial,
    })
    .select('id')
    .single();

  if (error) return null;
  return data.id as number;
}

/** Actualiza la página donde va. Si llega (o pasa) el total, el libro se marca terminado solo. */
export async function actualizarAvance(usuariaId: number, libroId: number, paginaActual: number) {
  const { data: libro } = await db()
    .from('libros')
    .select('paginas_totales')
    .eq('usuaria_id', usuariaId)
    .eq('id', libroId)
    .maybeSingle();

  if (!libro) return false;

  const paginasTotales = libro.paginas_totales as number;
  const nuevaPagina = Math.max(0, Math.min(paginaActual, paginasTotales));
  const terminado = nuevaPagina >= paginasTotales;

  const { error } = await db()
    .from('libros')
    .update({
      pagina_actual: nuevaPagina,
      terminado,
      fecha_fin: terminado ? hoyLocal() : null,
    })
    .eq('usuaria_id', usuariaId)
    .eq('id', libroId);

  return !error;
}

export async function marcarTerminado(usuariaId: number, libroId: number) {
  const { data: libro } = await db()
    .from('libros')
    .select('paginas_totales')
    .eq('usuaria_id', usuariaId)
    .eq('id', libroId)
    .maybeSingle();

  if (!libro) return false;

  const { error } = await db()
    .from('libros')
    .update({
      pagina_actual: libro.paginas_totales,
      terminado: true,
      fecha_fin: hoyLocal(),
    })
    .eq('usuaria_id', usuariaId)
    .eq('id', libroId);

  return !error;
}

export async function borrarLibro(usuariaId: number, libroId: number) {
  const { error } = await db().from('libros').delete().eq('usuaria_id', usuariaId).eq('id', libroId);
  return !error;
}
