'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = {
  nombre: string;
  etiqueta: string;
  tipo?: 'text' | 'password' | 'number' | 'date';
  placeholder?: string;
  autoComplete?: string;
  icono: React.ReactNode;
  defaultValue?: string;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
};

export function CampoTexto({
  nombre, etiqueta, tipo = 'text', placeholder, autoComplete, icono, defaultValue, maxLength, min, max,
}: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const esClave = tipo === 'password';
  const tipoReal = esClave && visible ? 'text' : tipo;

  return (
    <div>
      <label
        htmlFor={id}
        className="t-label-alto mb-2 block text-tinta-2"
      >
        {etiqueta}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lav-500">
          {icono}
        </span>

        <input
          id={id}
          name={nombre}
          type={tipoReal}
          placeholder={placeholder}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          maxLength={maxLength}
          min={min}
          max={max}
          inputMode={tipo === 'number' ? 'numeric' : undefined}
          className="h-14 w-full rounded-[var(--radius-pill)] border-2 border-lav-100 bg-hundido
                     pl-12 pr-12 text-[16px] font-bold text-tinta
                     placeholder:font-semibold placeholder:text-tinta-3
                     transition-colors duration-200 focus:border-lav-300 focus:bg-superficie
                     focus:outline-none"
        />

        {esClave && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center
                       justify-center rounded-full text-tinta-3 transition-colors
                       hover:text-lav-500 active:scale-95"
          >
            {visible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}
