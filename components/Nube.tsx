import { useId } from 'react';

/**
 * Detalle firma de la referencia: la nube pastel como CONTENEDOR.
 * Se usa detrás del personaje y de los momentos, igual que en el póster.
 */
export function Nube({
  className = '',
  desde = '#EFE4FA',
  hasta = '#FDE4EC',
}: {
  className?: string;
  desde?: string;
  hasta?: string;
}) {
  const id = useId();

  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      aria-hidden
      focusable="false"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={desde} />
          <stop offset="100%" stopColor={hasta} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M44 108c-18 0-32-12-32-27 0-13 10-24 24-26-1-3-2-7-2-10 0-17 15-31 34-31 12 0 23 6 29 15 6-9 16-15 28-15 18 0 33 13 33 30 0 3 0 5-1 8 14 3 23 13 23 26 0 16-14 30-33 30z"
      />
    </svg>
  );
}
