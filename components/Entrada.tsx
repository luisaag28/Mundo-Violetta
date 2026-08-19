'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/** Envoltorio liviano para el stagger de entrada de una sección server-rendered. */
export function Entrada({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
