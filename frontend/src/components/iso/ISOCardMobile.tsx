import React from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import { ISODocument } from '@/types/iso';

interface ISOCardMobileProps {
    documents: ISODocument[];
    getBadgeColor: (tipo: string) => string;
}

export const ISOCardMobile: React.FC<ISOCardMobileProps> = ({ documents, getBadgeColor }) => {
    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {documents.map((doc) => (
                <Card key={doc.codigo} variant="glass" className="border-white/5">
                    <CardContent className="space-y-3 pt-6">
                        <div className="flex justify-between items-start gap-4">
                            <h3 className="font-bold text-white text-base leading-tight">{doc.documento}</h3>
                            <span className={`text-[10px] uppercase font-bold border-0 ${getBadgeColor(doc.tipo)}`}>
                                {doc.tipo}
                            </span>
                        </div>
                        <div className="text-sm text-slate-400">
                            <span className="text-cyan-400 font-mono font-bold mr-2">{doc.clausula}</span>
                            {doc.requisito}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 border-t border-white/5 pt-3 mt-2">
                            <div>
                                <span className="block uppercase tracking-wider text-[10px] mb-0.5">Código</span>
                                <span className="font-mono text-slate-300">{doc.codigo}</span>
                            </div>
                            <div className="text-right">
                                <span className="block uppercase tracking-wider text-[10px] mb-0.5">Área</span>
                                <span className="text-slate-300">{doc.area}</span>
                            </div>
                            <div>
                                <span className="block uppercase tracking-wider text-[10px] mb-0.5">Responsable</span>
                                <span className="text-slate-300">{doc.responsable}</span>
                            </div>
                            <div className="text-right">
                                <span className="block uppercase tracking-wider text-[10px] mb-0.5">Versión</span>
                                <span className="font-mono text-slate-300">{doc.version}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
             {documents.length === 0 && (
                <div className="text-center text-slate-500 py-10 col-span-full">
                    No hay resultados.
                </div>
            )}
        </div>
    );
};
