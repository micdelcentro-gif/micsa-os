import { PaginaPackingList } from '@/paginas/PaginaPackingList';
import { Suspense } from 'react';

export default function PackingListPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando...</div>}>
      <PaginaPackingList />
    </Suspense>
  );
}
