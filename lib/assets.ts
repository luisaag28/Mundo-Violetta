/**
 * Las ilustraciones de Violetta viven en el almacenamiento de Supabase
 * (bucket público de solo lectura), no en el paquete de la app.
 * Así la app pesa poco y las imágenes llegan por CDN.
 */
const BASE =
  'https://nidmdccczdzsjpzyhtjc.supabase.co/storage/v1/object/public/personaje';

export function ilustracion(archivo: string): string {
  return `${BASE}/${archivo}`;
}
