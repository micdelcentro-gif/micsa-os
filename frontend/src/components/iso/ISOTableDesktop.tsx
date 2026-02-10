import React from 'react';
import { ISODocument } from '@/types/iso';

interface ISOTableDesktopProps {
    documents: ISODocument[];
    getBadgeColor: (tipo: string) => string;
}

export const ISOTableDesktop: React.FC<ISOTableDesktopProps> = ({ documents, getBadgeColor }) => {
    return (
        <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-slate-900/20 backdrop-blur">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="p-4 font-semibold w-24">Cláusula</th>
                        <th className="p-4 font-semibold w-1/4">Requisito</th>
                        <th className="p-4 font-semibold">Documento</th>
                        <th className="p-4 font-semibold w-32 text-center">Tipo</th>
                        <th className="p-4 font-semibold w-36 font-mono">Código</th>
                        <th className="p-4 font-semibold w-32">Área</th>
                        <th className="p-4 font-semibold w-32">Resp.</th>
                        <th className="p-4 font-semibold w-16 text-center">Ver.</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                    {documents.map((doc) => (
                        <tr key={doc.codigo} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 font-mono text-cyan-400 font-bold">{doc.clausula}</td>
                            <td className="p-4 text-slate-300">{doc.requisito}</td>
                            <td className="p-4 font-medium text-white">{doc.documento}</td>
                            <td className="p-4 text-center">
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${getBadgeColor(doc.tipo)}`}>
                                    {doc.tipo}
                                </span>
                            </td>
                            <td className="p-4 font-mono text-slate-400 group-hover:text-white transition-colors">{doc.codigo}</td>
                            <td className="p-4 text-slate-400">{doc.area}</td>
                            <td className="p-4 text-slate-400 text-xs">{doc.responsable}</td>
                            <td className="p-4 text-center text-slate-500 font-mono">{doc.version}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {documents.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    <span className="text-4xl block mb-2">🔍</span>
                    No se encontraron documentos con los filtros actuales.
                </div>
            )}
        </div>
    );
};
