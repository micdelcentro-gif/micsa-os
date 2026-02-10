import { PaginaGuiaISO } from '@/paginas/PaginaGuiaISO';
import { Suspense } from 'react';

export default function GuiaISOPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando Guía ISO...</div>}>
      <PaginaGuiaISO />
    </Suspense>
  );
}
