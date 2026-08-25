import 'server-only';
import { db } from './db';
import { hoyLocal, MESES } from './dia';

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

/**
 * Suma páginas al registro del día (una fila por libro y fecha, igual que los hábitos).
 * Si ya leyó algo hoy de este libro, se ACUMULA — no pisa lo que ya había.
 */
async function registrarSesion(usuariaId: number, libroId: number, fecha: string, paginasNuevas: number) {
  if (paginasNuevas <= 0) return;

  const { data: existente } = await db()
    .from('sesiones_lectura')
    .select('paginas_leidas')
    .eq('usuaria_id', usuariaId)
    .eq('libro_id', libroId)
    .eq('fecha', fecha)
    .maybeSingle();

  const total = (existente?.paginas_leidas as number | undefined ?? 0) + paginasNuevas;

  await db()
    .from('sesiones_lectura')
    .upsert(
      { usuaria_id: usuariaId, libro_id: libroId, fecha, paginas_leidas: total },
      { onConflict: 'libro_id,fecha' }
    );
}

/** Promedio real: páginas leídas ÷ días en los que de verdad leyó — no días de calendario. */
export async function promedioDiario(usuariaId: number, libroId: number): Promise<number | null> {
  const { data } = await db()
    .from('sesiones_lectura')
    .select('paginas_leidas')
    .eq('usuaria_id', usuariaId)
    .eq('libro_id', libroId);

  if (!data || data.length === 0) return null;

  const total = data.reduce((s, r) => s + (r.paginas_leidas as number), 0);
  return Math.round(total / data.length);
}

/** Actualiza la página donde va y registra la sesión de hoy. Si llega (o pasa) el total, el libro se marca terminado solo. */
export async function actualizarAvance(usuariaId: number, libroId: number, paginaActual: number) {
  const { data: libro } = await db()
    .from('libros')
    .select('pagina_actual, paginas_totales')
    .eq('usuaria_id', usuariaId)
    .eq('id', libroId)
    .maybeSingle();

  if (!libro) return false;

  const anterior = libro.pagina_actual as number;
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

  if (error) return false;

  if (nuevaPagina > anterior) {
    await registrarSesion(usuariaId, libroId, hoyLocal(), nuevaPagina - anterior);
  }

  return true;
}

export async function marcarTerminado(usuariaId: number, libroId: number) {
  const { data: libro } = await db()
    .from('libros')
    .select('pagina_actual, paginas_totales')
    .eq('usuaria_id', usuariaId)
    .eq('id', libroId)
    .maybeSingle();

  if (!libro) return false;

  const anterior = libro.pagina_actual as number;
  const paginasTotales = libro.paginas_totales as number;

  const { error } = await db()
    .from('libros')
    .update({
      pagina_actual: paginasTotales,
      terminado: true,
      fecha_fin: hoyLocal(),
    })
    .eq('usuaria_id', usuariaId)
    .eq('id', libroId);

  if (error) return false;

  if (paginasTotales > anterior) {
    await registrarSesion(usuariaId, libroId, hoyLocal(), paginasTotales - anterior);
  }

  return true;
}

export type DiaLectura = { fecha: string; dia: number; paginas: number; futuro: boolean };
export type MesLectura = {
  mes: string;
  etiqueta: string;
  dias: DiaLectura[];
  /** 1 = lunes … 7 = domingo — para saber cuántas celdas vacías van antes del día 1. */
  primerDiaSemana: number;
  haySiguiente: boolean;
};

function diaSemanaDe(fecha: string): number {
  const d = new Date(fecha + 'T12:00:00');
  return d.getDay() === 0 ? 7 : d.getDay();
}

/** Mes actual en formato YYYY-MM, según la fecha de Colombia. */
export function mesActual(): string {
  return hoyLocal().slice(0, 7);
}

export function mesAnterior(mes: string): string {
  const [anio, mesNum] = mes.split('-').map(Number);
  const d = new Date(anio, mesNum - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function mesSiguiente(mes: string): string {
  const [anio, mesNum] = mes.split('-').map(Number);
  const d = new Date(anio, mesNum, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Todos los días del mes con las páginas leídas ese día (0 si no leyó nada). */
export async function calendarioLectura(
  usuariaId: number,
  libroId: number,
  mes: string
): Promise<MesLectura> {
  const [anio, mesNum] = mes.split('-').map(Number);
  const diasEnMes = new Date(anio, mesNum, 0).getDate();
  const primerDia = `${mes}-01`;
  const ultimoDia = `${mes}-${String(diasEnMes).padStart(2, '0')}`;

  const { data } = await db()
    .from('sesiones_lectura')
    .select('fecha, paginas_leidas')
    .eq('usuaria_id', usuariaId)
    .eq('libro_id', libroId)
    .gte('fecha', primerDia)
    .lte('fecha', ultimoDia);

  const porFecha = new Map<string, number>();
  for (const r of data ?? []) {
    porFecha.set(r.fecha as string, r.paginas_leidas as number);
  }

  const hoy = hoyLocal();
  const dias: DiaLectura[] = [];
  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = `${mes}-${String(d).padStart(2, '0')}`;
    dias.push({
      fecha,
      dia: d,
      paginas: porFecha.get(fecha) ?? 0,
      futuro: fecha > hoy,
    });
  }

  const nombreMes = MESES[mesNum - 1];

  return {
    mes,
    etiqueta: `${nombreMes.charAt(0).toUpperCase()}${nombreMes.slice(1)} ${anio}`,
    dias,
    primerDiaSemana: diaSemanaDe(primerDia),
    haySiguiente: mes < mesActual(),
  };
}

export async function borrarLibro(usuariaId: number, libroId: number) {
  const { error } = await db().from('libros').delete().eq('usuaria_id', usuariaId).eq('id', libroId);
  return !error;
}
