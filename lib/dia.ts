import 'server-only';
import { db } from './db';

export type Mision = {
  id: number;
  clave: string;
  titulo: string;
  detalle: string | null;
  ilustracion: string;
  tipo: 'simple' | 'vasos';
  meta: number;
  avance: number;
  completado: boolean;
  hechoALas: string | null;
};

export type ResumenDia = {
  fecha: string;
  etiquetaFecha: string;
  misiones: Mision[];
  hechas: number;
  total: number;
  racha: number;
  momentos: { ilustracion: string; titulo: string; abierto: boolean; nuevo: boolean }[];
  momentosAbiertos: number;
  ultimoMomento: string | null;
};

/** La app corre para Colombia: todas las fechas y horas se anclan a esta zona,
 *  sin importar en qué huso esté el servidor (Vercel corre en UTC). */
const ZONA_HORARIA = 'America/Bogota';

/** Fecha en Colombia, en YYYY-MM-DD (no en la zona del servidor: a las 7pm en
 *  Bogotá el servidor en UTC ya cree que es "mañana"). */
export function hoyLocal(d = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: ZONA_HORARIA });
}

/** 1 = lunes … 7 = domingo */
function diaSemana(fecha: string): number {
  const d = new Date(fecha + 'T12:00:00');
  return d.getDay() === 0 ? 7 : d.getDay();
}

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function etiquetaFecha(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00');
  const hoy = hoyLocal();
  if (fecha === hoy) return 'hoy';
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  if (fecha === hoyLocal(ayer)) return 'ayer';
  return `${DIAS[diaSemana(fecha) - 1]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export function fechaLarga(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00');
  return `${DIAS[diaSemana(fecha) - 1]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export function correrDias(fecha: string, dias: number): string {
  const d = new Date(fecha + 'T12:00:00');
  d.setDate(d.getDate() + dias);
  return hoyLocal(d);
}

/** Los hábitos que le tocan a esta usuaria en esta fecha, con su avance. */
export async function misionesDe(usuariaId: number, fecha: string): Promise<Mision[]> {
  const dia = String(diaSemana(fecha));

  const [{ data: habitos }, { data: registros }] = await Promise.all([
    db()
      .from('habitos')
      .select('id, clave, titulo, detalle, ilustracion, dias, tipo, meta, orden')
      .eq('usuaria_id', usuariaId)
      .order('orden'),
    db()
      .from('registros')
      .select('habito_id, avance, completado, hecho_a_las')
      .eq('usuaria_id', usuariaId)
      .eq('fecha', fecha),
  ]);

  if (!habitos) return [];

  const porHabito = new Map(
    (registros ?? []).map((r) => [r.habito_id as number, r])
  );

  // Miércoles, viernes y sábado el baile es clase o práctica externa: no lleva duración fija.
  const SIN_DURACION_BAILE = ['3', '5', '6'];

  return habitos
    .filter((h) => String(h.dias).split(',').includes(dia))
    .map((h) => {
      const r = porHabito.get(h.id as number);
      const detalle =
        h.clave === 'baile' && SIN_DURACION_BAILE.includes(dia)
          ? null
          : (h.detalle as string | null);
      return {
        id: h.id as number,
        clave: h.clave as string,
        titulo: h.titulo as string,
        detalle,
        ilustracion: h.ilustracion as string,
        tipo: h.tipo as 'simple' | 'vasos',
        meta: h.meta as number,
        avance: r?.avance ?? 0,
        completado: !!r?.completado,
        hechoALas: (r?.hecho_a_las as string | null) ?? null,
      };
    });
}

/**
 * Racha FLEXIBLE: días seguidos con AL MENOS una misión cumplida.
 * No exige el día perfecto — la app premia la constancia, no la perfección.
 */
export async function rachaDe(usuariaId: number, fecha: string): Promise<number> {
  const desde = correrDias(fecha, -400);

  const { data } = await db()
    .from('registros')
    .select('fecha')
    .eq('usuaria_id', usuariaId)
    .eq('completado', true)
    .gte('fecha', desde)
    .lte('fecha', fecha);

  if (!data || data.length === 0) return 0;

  const set = new Set(data.map((d) => d.fecha as string));
  let racha = 0;
  let cursor = fecha;

  // Si hoy todavía no hizo nada, la racha de ayer sigue viva.
  if (!set.has(cursor)) cursor = correrDias(cursor, -1);

  while (set.has(cursor)) {
    racha++;
    cursor = correrDias(cursor, -1);
  }
  return racha;
}

function momentosDe(misiones: Mision[]) {
  const hechas = misiones.filter((m) => m.completado);
  const pendientes = misiones.filter((m) => !m.completado);

  const ordenadas = [...hechas].sort((a, b) =>
    (b.hechoALas ?? '').localeCompare(a.hechoALas ?? '')
  );

  return {
    momentos: [
      ...ordenadas.map((m, i) => ({
        ilustracion: m.ilustracion,
        titulo: m.titulo,
        abierto: true,
        nuevo: i === 0,
      })),
      ...pendientes.map((m) => ({
        ilustracion: m.ilustracion,
        titulo: m.titulo,
        abierto: false,
        nuevo: false,
      })),
    ],
    momentosAbiertos: hechas.length,
    ultimoMomento: ordenadas[0]?.titulo ?? null,
  };
}

export async function resumenDia(usuariaId: number, fecha: string): Promise<ResumenDia> {
  const [misiones, racha] = await Promise.all([
    misionesDe(usuariaId, fecha),
    rachaDe(usuariaId, fecha),
  ]);
  const { momentos, momentosAbiertos, ultimoMomento } = momentosDe(misiones);

  return {
    fecha,
    etiquetaFecha: fechaLarga(fecha),
    misiones,
    hechas: misiones.filter((m) => m.completado).length,
    total: misiones.length,
    racha,
    momentos,
    momentosAbiertos,
    ultimoMomento,
  };
}

/** El lunes de la semana que contiene `fecha`. */
export function lunesDe(fecha: string): string {
  return correrDias(fecha, -(diaSemana(fecha) - 1));
}

export type DiaSemana = {
  fecha: string;
  inicial: string;
  numero: number;
  hechas: number;
  total: number;
  esHoy: boolean;
  esFuturo: boolean;
};

export type ResumenSemana = {
  lunes: string;
  etiqueta: string;
  dias: DiaSemana[];
  totalHechas: number;
  narrativa: string[];
};

const INICIALES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export async function resumenSemana(usuariaId: number, fechaRef: string): Promise<ResumenSemana> {
  const lunes = lunesDe(fechaRef);
  const domingo = correrDias(lunes, 6);
  const hoy = hoyLocal();

  const [{ data: habitos }, { data: registros }] = await Promise.all([
    db().from('habitos').select('id, titulo, dias').eq('usuaria_id', usuariaId),
    db()
      .from('registros')
      .select('habito_id, fecha, completado')
      .eq('usuaria_id', usuariaId)
      .eq('completado', true)
      .gte('fecha', lunes)
      .lte('fecha', domingo),
  ]);

  const tituloDe = new Map((habitos ?? []).map((h) => [h.id as number, h.titulo as string]));
  const porFecha = new Map<string, number[]>();
  for (const r of registros ?? []) {
    const f = r.fecha as string;
    if (!porFecha.has(f)) porFecha.set(f, []);
    porFecha.get(f)!.push(r.habito_id as number);
  }

  const dias: DiaSemana[] = [];
  for (let i = 0; i < 7; i++) {
    const fecha = correrDias(lunes, i);
    const dSem = String(diaSemana(fecha));
    const total = (habitos ?? []).filter((h) =>
      String(h.dias).split(',').includes(dSem)
    ).length;

    dias.push({
      fecha,
      inicial: INICIALES[i],
      numero: new Date(fecha + 'T12:00:00').getDate(),
      hechas: porFecha.get(fecha)?.length ?? 0,
      total,
      esHoy: fecha === hoy,
      esFuturo: fecha > hoy,
    });
  }

  // Narrativa en palabras, no porcentajes.
  const conteos = new Map<string, number>();
  for (const [, ids] of porFecha) {
    for (const id of ids) {
      const t = tituloDe.get(id);
      if (t) conteos.set(t, (conteos.get(t) ?? 0) + 1);
    }
  }

  const narrativa = [...conteos.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([titulo, n]) => `${titulo.toLowerCase()} ${n} ${n === 1 ? 'día' : 'días'}`);

  const dL = new Date(lunes + 'T12:00:00');
  const dD = new Date(domingo + 'T12:00:00');

  return {
    lunes,
    etiqueta: `${dL.getDate()} de ${MESES[dL.getMonth()]} – ${dD.getDate()} de ${MESES[dD.getMonth()]}`,
    dias,
    totalHechas: dias.reduce((s, d) => s + d.hechas, 0),
    narrativa,
  };
}

/**
 * Mapa de constancia: 12 semanas de un vistazo. El color de cada día refleja lo que
 * REALMENTE cumplió ESE día (no un conteo acumulado), en 4 niveles bien distintos:
 * no hizo nada = blanco · hizo la mitad o menos = se nota, pero flojo · más de la
 * mitad = intermedio · día completo = el color más fuerte.
 */
export async function mapaConstancia(usuariaId: number, semanas = 12) {
  const hoy = hoyLocal();
  const desde = correrDias(lunesDe(hoy), -(semanas - 1) * 7);

  const [{ data: habitos }, { data: registros }] = await Promise.all([
    db().from('habitos').select('dias').eq('usuaria_id', usuariaId),
    db()
      .from('registros')
      .select('fecha')
      .eq('usuaria_id', usuariaId)
      .eq('completado', true)
      .gte('fecha', desde)
      .lte('fecha', hoy),
  ]);

  const completadasPorFecha = new Map<string, number>();
  for (const r of registros ?? []) {
    const f = r.fecha as string;
    completadasPorFecha.set(f, (completadasPorFecha.get(f) ?? 0) + 1);
  }

  const listaDias = (habitos ?? []).map((h) => String(h.dias).split(','));
  function totalDe(diaSem: string): number {
    return listaDias.filter((dias) => dias.includes(diaSem)).length;
  }

  /** Blanco si no hizo nada — nunca se confunde con "hizo la mitad o menos", que ya se nota. */
  function nivelDe(completadas: number, total: number): 0 | 1 | 2 | 3 {
    if (total === 0 || completadas === 0) return 0;
    if (completadas >= total) return 3;
    return completadas / total <= 0.5 ? 1 : 2;
  }

  const columnas: Array<Array<{ fecha: string; nivel: 0 | 1 | 2 | 3; futuro: boolean }>> = [];
  for (let s = 0; s < semanas; s++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const fecha = correrDias(desde, s * 7 + d);
      const total = totalDe(String(diaSemana(fecha)));
      const completadas = completadasPorFecha.get(fecha) ?? 0;
      col.push({
        fecha,
        nivel: nivelDe(completadas, total),
        futuro: fecha > hoy,
      });
    }
    columnas.push(col);
  }
  return columnas;
}

/** El álbum completo con cuántas veces cumplió cada hábito. */
export async function albumDe(usuariaId: number) {
  const [{ data: habitos }, { data: registros }] = await Promise.all([
    db()
      .from('habitos')
      .select('id, titulo, ilustracion, detalle, orden')
      .eq('usuaria_id', usuariaId)
      .order('orden'),
    db()
      .from('registros')
      .select('habito_id')
      .eq('usuaria_id', usuariaId)
      .eq('completado', true),
  ]);

  const veces = new Map<number, number>();
  for (const r of registros ?? []) {
    const id = r.habito_id as number;
    veces.set(id, (veces.get(id) ?? 0) + 1);
  }

  return (habitos ?? [])
    .map((h) => ({
      titulo: h.titulo as string,
      ilustracion: h.ilustracion as string,
      detalle: h.detalle as string | null,
      veces: veces.get(h.id as number) ?? 0,
    }))
    .sort((a, b) => b.veces - a.veces);
}

export const NIVELES = [
  { desde: 0,   titulo: 'Exploradora' },
  { desde: 25,  titulo: 'Organizadora' },
  { desde: 75,  titulo: 'Aventurera responsable' },
  { desde: 160, titulo: 'Maestra de hábitos' },
];

export async function nivelDe(usuariaId: number) {
  const { count } = await db()
    .from('registros')
    .select('id', { count: 'exact', head: true })
    .eq('usuaria_id', usuariaId)
    .eq('completado', true);

  const n = count ?? 0;
  let numero = 1;
  let titulo = NIVELES[0].titulo;
  NIVELES.forEach((nv, i) => {
    if (n >= nv.desde) {
      numero = i + 1;
      titulo = nv.titulo;
    }
  });
  return { numero, titulo, hechasTotales: n };
}

/** Marca o desmarca. Idempotente por (hábito, fecha). `objetivo` fija el nivel exacto de los hábitos tipo "vasos". */
export async function alternarMision(usuariaId: number, habitoId: number, fecha: string, objetivo?: number) {
  const { data: habito } = await db()
    .from('habitos')
    .select('id, tipo, meta')
    .eq('id', habitoId)
    .eq('usuaria_id', usuariaId)
    .maybeSingle();

  if (!habito) return null;

  const { data: actual } = await db()
    .from('registros')
    .select('avance, completado')
    .eq('habito_id', habitoId)
    .eq('fecha', fecha)
    .maybeSingle();

  let avance: number;
  let completado: boolean;

  if (habito.tipo === 'vasos') {
    const previo = actual?.avance ?? 0;
    const meta = habito.meta as number;
    const base = typeof objetivo === 'number' ? objetivo : previo + 1;
    avance = Math.max(0, Math.min(meta, base));
    completado = avance >= meta;
  } else {
    completado = !actual?.completado;
    avance = completado ? 1 : 0;
  }

  const hora = completado
    ? new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: ZONA_HORARIA,
      })
    : null;

  const { error } = await db()
    .from('registros')
    .upsert(
      {
        usuaria_id: usuariaId,
        habito_id: habitoId,
        fecha,
        avance,
        completado,
        hecho_a_las: hora,
      },
      { onConflict: 'habito_id,fecha' }
    );

  if (error) return null;
  return { avance, completado, hechoALas: hora };
}
