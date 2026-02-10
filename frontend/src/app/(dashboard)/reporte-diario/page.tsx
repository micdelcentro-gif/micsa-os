import PaginaReporteDiario from "@/paginas/PaginaReporteDiario";
import { Suspense } from 'react';

export default function DailyReportPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando...</div>}>
            <PaginaReporteDiario />
        </Suspense>
    );
}
