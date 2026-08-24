'use client';

import { motion } from 'motion/react';

export function BarraLibro({ porcentaje }: { porcentaje: number }) {
  return (
    <div
      className="h-2.5 overflow-hidden rounded-[var(--radius-chip)] bg-lav-50"
      role="progressbar"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${porcentaje}% leído`}
    >
      <motion.span
        className="block h-full rounded-[var(--radius-chip)] bg-gradient-to-r from-rosa to-lav-500"
        initial={{ width: '0%' }}
        animate={{ width: `${Math.max(3, porcentaje)}%` }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
