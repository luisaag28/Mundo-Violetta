import { redirect } from 'next/navigation';
import { usuariaActual } from '@/lib/auth';

export default async function Inicio() {
  const usuaria = await usuariaActual();
  redirect(usuaria ? '/mi-dia' : '/entrar');
}
