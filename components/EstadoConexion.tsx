'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff } from 'lucide-react';

/** Aviso discreto cuando el teléfono pierde conexión. No bloquea nada: solo informa. */
export function EstadoConexion() {
  const [sinConexion, setSinConexion] = useState(false);

  useEffect(() => {
    setSinConexion(!navigator.onLine);
    const conectado = () => setSinConexion(false);
    const desconectado = () => setSinConexion(true);
    window.addEventListener('online', conectado);
    window.addEventListener('offline', desconectado);
    return () => {
      window.removeEventListener('online', conectado);
      window.removeEventListener('offline', desconectado);
    };
  }, []);

  return (
    <AnimatePresence>
      {sinConexion && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+12px)] z-[70] mx-auto flex
                     max-w-[343px] items-center gap-2.5 rounded-[var(--radius-inner)]
                     bg-tinta px-4 py-3 t-cuerpo-fuerte text-white shadow-n3"
        >
          <WifiOff size={18} className="flex-none" />
          <span className="flex-1">Sin conexión. Cuando vuelva internet, guardo todo.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
