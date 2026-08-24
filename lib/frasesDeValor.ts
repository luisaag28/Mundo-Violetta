export type FraseValor = { valor: string; texto: string };

/** Banco de frases cortas, una por día. Nunca acusan ni generan culpa — enseñan y motivan. */
export const FRASES_DE_VALOR: FraseValor[] = [
  // Disciplina
  { valor: 'Disciplina', texto: 'La disciplina es hacer lo que toca, aunque no tengas ganas.' },
  { valor: 'Disciplina', texto: 'Un hábito pequeño hecho todos los días vale más que uno grande hecho una sola vez.' },
  { valor: 'Disciplina', texto: 'No hace falta sentir ganas para empezar. Las ganas a veces llegan después.' },
  { valor: 'Disciplina', texto: 'Ser disciplinada no es ser perfecta, es volver a intentarlo.' },
  { valor: 'Disciplina', texto: 'Cada vez que cumples algo pequeño, te entrenas para cumplir cosas grandes.' },

  // Respeto
  { valor: 'Respeto', texto: 'Respetar es cuidar a los demás como te gustaría que te cuiden a ti.' },
  { valor: 'Respeto', texto: 'Escuchar a alguien hasta el final también es una forma de respeto.' },
  { valor: 'Respeto', texto: 'El respeto empieza por las cosas pequeñas: pedir por favor, decir gracias.' },
  { valor: 'Respeto', texto: 'Cuidar tus cosas y las de los demás es una forma de respeto.' },

  // Responsabilidad
  { valor: 'Responsabilidad', texto: 'Ser responsable es cumplir lo que dijiste, aunque nadie te esté mirando.' },
  { valor: 'Responsabilidad', texto: 'Cada tarea que haces bien te hace un poquito más grande por dentro.' },
  { valor: 'Responsabilidad', texto: 'No se trata de hacer todo perfecto, se trata de hacerte cargo.' },
  { valor: 'Responsabilidad', texto: 'Cuando ordenas tus cosas, le estás diciendo a tu día: yo puedo con esto.' },
  { valor: 'Responsabilidad', texto: 'Terminar lo que empiezas es un regalo que te haces a ti misma.' },

  // Amor
  { valor: 'Amor', texto: 'Cuidarte a ti misma también es una forma de amor.' },
  { valor: 'Amor', texto: 'Un abrazo a tiempo puede arreglar un día difícil.' },
  { valor: 'Amor', texto: 'Amar es también tener paciencia, incluso contigo misma.' },
  { valor: 'Amor', texto: 'Las personas que más quieres notan cuando las cuidas con detalles chiquitos.' },

  // Constancia
  { valor: 'Constancia', texto: 'La constancia no es hacerlo perfecto, es no rendirse.' },
  { valor: 'Constancia', texto: 'Un río no hace un cañón por ser fuerte, sino por seguir fluyendo todos los días.' },
  { valor: 'Constancia', texto: 'Los hábitos se construyen de a poquito, como los castillos de arena.' },
  { valor: 'Constancia', texto: 'Hoy es solo un día más de todos los que vas a sumar.' },
  { valor: 'Constancia', texto: 'No importa si ayer no pudiste. Hoy es un día nuevo para volver a intentar.' },

  // Gratitud
  { valor: 'Gratitud', texto: 'Agradecer lo pequeño hace que lo pequeño se sienta grande.' },
  { valor: 'Gratitud', texto: 'Hay algo bueno en casi todos los días, aunque haya que buscarlo un poco.' },
  { valor: 'Gratitud', texto: 'Decir gracias de verdad, mirando a los ojos, cambia el día de alguien.' },
  { valor: 'Gratitud', texto: 'Fíjate hoy en tres cosas buenas, por chiquitas que sean.' },

  // Orden
  { valor: 'Orden', texto: 'Un espacio ordenado ayuda a que la mente también se sienta más tranquila.' },
  { valor: 'Orden', texto: 'Ordenar no es que todo quede perfecto, es que sepas dónde está cada cosa.' },
  { valor: 'Orden', texto: 'Cinco minutos de orden hoy son cinco minutos de paz mañana.' },
  { valor: 'Orden', texto: 'Guardar tus cosas en su lugar es cuidar tu tiempo futuro.' },

  // Confianza
  { valor: 'Confianza', texto: 'Confiar en ti misma empieza por cumplir las promesas que te haces a ti.' },
  { valor: 'Confianza', texto: 'Equivocarte no te hace menos capaz, te hace estar aprendiendo.' },
  { valor: 'Confianza', texto: 'Cada vez que terminas algo que empezaste, tu confianza crece un poco más.' },
  { valor: 'Confianza', texto: 'Está bien pedir ayuda. Eso también es de gente valiente.' },

  // Crecimiento personal
  { valor: 'Crecimiento personal', texto: 'Crecer no es solo hacerte más alta, es aprender cosas nuevas de ti misma.' },
  { valor: 'Crecimiento personal', texto: 'Cada error es una pista de algo que todavía puedes aprender.' },
  { valor: 'Crecimiento personal', texto: 'Lo que hoy te cuesta, mañana te va a costar un poquito menos.' },
  { valor: 'Crecimiento personal', texto: 'Ser mejor no significa ser distinta, significa conocerte más.' },
];

function hash(texto: string): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Misma frase todo el día para una fecha dada — no cambia si recarga la página. */
export function fraseDelDia(fecha: string): FraseValor {
  const indice = hash(fecha) % FRASES_DE_VALOR.length;
  return FRASES_DE_VALOR[indice];
}
