'use client';

import { motion } from 'motion/react';

/**
 * Se remonta en cada navegación (a diferencia de layout.tsx), así que da la
 * transición suave entre "Mi día" / "Mi mundo" / "Mi semana" / "Yo".
 * Respeta prefers-reduced-motion vía el MotionConfig global del layout.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="h-dvh"
    >
      {children}
    </motion.div>
  );
}
