'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import { createPortal } from 'react-dom';

const checklistItems = [
    { requisito: "Alcance del SGC definido, documentado y disponible", responsable: "Dir. Calidad", evidencia: "SGC-RG-003" },
    { requisito: "Política de Calidad publicada, comunicada y comprendida por el personal", responsable: "Dir. General", evidencia: "SGC-PO-001 + Registros" },
    { requisito: "Objetivos de Calidad establecidos, medibles y con seguimiento en el período (3 meses)", responsable: "Dir. Calidad", evidencia: "SGC-RG-007, SGC-FO-002" },
    { requisito: "Análisis de contexto y partes interesadas actualizados", responsable: "Dir. General", evidencia: "SGC-RG-001, SGC-RG-002 +" },
    { requisito: "Matriz de riesgos y oportunidades con planes de acción implementados", responsable: "Dir. Calidad", evidencia: "SGC-RG-006 + Evidencia de planes" },
    { requisito: "Mapa de procesos con interacciones claras, entradas/salidas y criterios", responsable: "Dir. Calidad", evidencia: "SGC-RG-004, SGC-FO-001" },
    { requisito: "87 documentos del SGC controlados y distribuidos correctamente", responsable: "Coord. Calidad", evidencia: "SGC-RG-012" },
    { requisito: "Registros de producción desde mínimo últimos 2-3 meses (documentados)", responsable: "Dir. Operaciones", evidencia: "SGC-RG-014, SGC-FO-031" },
    { requisito: "Equipos de medición calibrados con certificados válidos vigentes", responsable: "Coord. Calidad", evidencia: "SGC-RG-009, Certificados lab." },
    { requisito: "Matriz de competencias actualizada con evidencias de capacitación", responsable: "Jefe RRHH", evidencia: "SGC-RG-010, Diplomas, constancias" },
    { requisito: "Procedimiento de compras implementado con evaluación de proveedores documentada", responsable: "Jefe Compras", evidencia: "SGC-PR-014, SGC-RG-013, SGC-RG-021" },
    { requisito: "Procedimiento de no conformidades con mínimo 3-5 registradas y cerradas con eficacia", responsable: "Dir. Calidad", evidencia: "SGC-PR-019, SGC-RG-015" },
    { requisito: "Auditoría interna realizada (completa o por muestreo) con hallazgos y plan de acciones", responsable: "Auditor Líder", evidencia: "SGC-PG-002, SGC-FO-019-021" },
    { requisito: "Revisión por la dirección realizada con acta de compromisos firmada", responsable: "Dir. General", evidencia: "SGC-RG-018, Acta firmada" },
    { requisito: "Indicadores de desempeño (KPI) con métricas y análisis", responsable: "Dir. Calidad", evidencia: "SGC-RG-017" },
    { requisito: "Evidencia de capacitaciones en ISO 9001 y toma de conciencia", responsable: "Jefe RRHH", evidencia: "Listas de asistencia, exámenes, fotos" },
    { requisito: "Procedimiento de diseño implementado (si aplica) con registros de proyectos", responsable: "Jefe Ingeniería", evidencia: "SGC-PR-013, SGC-FO-008 a 012" },
    { requisito: "Comunicación con cliente documentada (cotizaciones, OT, quejas, encuestas)", responsable: "Jefe Comercial", evidencia: "SGC-FO-004 a 007, SGC-FO-018, 025" },
];

const docTable = [
    { clausula: "4.3", doc: "Alcance del SGC", razon: "Requerido explícitamente por la norma" },
    { clausula: "5.2", doc: "Política de Calidad", razon: "Debe estar disponible como información documentada" },
    { clausula: "6.2", doc: "Objetivos de Calidad", razon: "Deben estar documentados (qué, recursos, responsable, plazo)" },
    { clausula: "7.1.5.1", doc: "Recursos de Calibración de Equipos", razon: "Evidencia de trazabilidad de mediciones" },
    { clausula: "7.2", doc: "Evidencia de Competencias del Personal", razon: "Registros que demuestren calificaciones y capacitación" },
    { clausula: "8.2.3.2", doc: "Revisión de Requisitos del Cliente", razon: "Evidencia de verificación antes de comprometerse" },
    { clausula: "8.3.3", doc: "Entradas de Diseño y Desarrollo", razon: "Requisito para gestión de información documental" },
    { clausula: "8.4", doc: "Procedimiento de Control de Proveedores", razon: "Para asegurar que proveedores cumplen requisitos" },
    { clausula: "8.5.1", doc: "Información de Control de Producción", razon: "Para reproducibilidad de producción/servicio" },
    { clausula: "8.6", doc: "Registros de Liberación de Producto/Servicio", razon: "Evidencia de conformidad con criterios" },
    { clausula: "9.2", doc: "Programa de Auditoría Interna", razon: "Requerido explícitamente" },
    { clausula: "10.2", doc: "Registro de No Conformidades y Acciones", razon: "CRÍTICO - se auditan extensivamente en ambas etapas" },
];

const phases = [
    {
        number: 1,
        title: "Diagnóstico y Planificación",
        duration: "Mes 1 - 2",
        activities: ["Análisis GAP vs ISO 9001:2015", "Definición del alcance del SGC", "Capacitación en requisitos ISO 9001", "Análisis de contexto y partes interesadas", "Creación de las conformidades y riesgos"],
        deliverables: ["Reporte GAP", "Definición SGC", "KPIS"]
    },
    {
        number: 2,
        title: "Documentación Base",
        duration: "Mes 3 - 4",
        activities: ["Política y objetivos de calidad", "Manual del SGC (recomendado)", "Procedimientos obligatorios", "Fichas de procesos"],
        deliverables: ["Manual de Calidad", "26 Procedimientos", "Mapa de Procesos"]
    },
    {
        number: 3,
        title: "Implementación Operativa",
        duration: "Mes 5 - 6",
        activities: ["Capacitación a todo el personal", "Distribución de políticas", "Implementación en campo", "Enfoque en contexto"],
        deliverables: ["Plan Capacitación", "Asistencias", "Evidencias"]
    },
    {
        number: 4,
        title: "Generación de Registros",
        duration: "Mes 7 - 8",
        activities: ["Operación normal (2-3 meses)", "Generación de registros", "Seguimiento KPIs", "Cierre de no conformidades"],
        deliverables: ["21 Registros", "Medición KPIs", "Tablero"]
    },
    {
        number: 5,
        title: "Auditoría Interna",
        duration: "Mes 9",
        activities: ["Formación auditores internos", "Ejecución de auditoría", "Identificación de NC", "Acciones correctivas"],
        deliverables: ["Informe Auditoría", "Plan de acciones", "Auditores CP"]
    },
    {
        number: 6,
        title: "Revisión por la Dirección",
        duration: "Mes 10",
        activities: ["Entradas para revisión", "Reunión Dirección General", "Decisiones documentadas", "Ajustes finales"],
        deliverables: ["Acta Revisión", "Mejoras SGC", "SGC Aprobado"]
    },
    {
        number: 7,
        title: "Auditoría de Certificación",
        duration: "Mes 11 - 12",
        activities: ["Etapa 1 (Documental)", "Cierre de hallazgos", "Etapa 2 (En sitio)", "Obtención del certificado"],
        deliverables: ["Informe Etapa 1", "Informe Etapa 2", "CERTIFICADO"]
    }
];

export const PaginaGuiaISO = () => {
    const [checklistState, setChecklistState] = useState<boolean[]>(new Array(checklistItems.length).fill(false));
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('MICSA_Checklist_Progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length === checklistItems.length) {
                    setChecklistState(parsed);
                }
            } catch (e) {
                console.error("Error al cargar progreso:", e);
            }
        }
    }, []);

    const handleCheckChange = (index: number) => {
        const newState = [...checklistState];
        newState[index] = !newState[index];
        setChecklistState(newState);
        localStorage.setItem('MICSA_Checklist_Progress', JSON.stringify(newState));
    };

    const checkedCount = checklistState.filter(Boolean).length;
    const progress = Math.round((checkedCount / checklistItems.length) * 100);

    const handleSave = () => {
        localStorage.setItem('MICSA_Checklist_Progress', JSON.stringify(checklistState));
        setMessage({ type: 'success', text: 'Progreso de la Guía ISO guardado exitosamente' });
        setTimeout(() => setMessage(null), 2000);
    };

    return (
        <div className="bg-slate-950 text-slate-200 font-sans pb-40 selection:bg-blue-500/30 -m-6 lg:-m-8 p-6 lg:p-8">
            <Toast message={message} onClose={() => setMessage(null)} />
            
            <div className="container mx-auto max-w-5xl p-4 lg:p-8 space-y-12">
                {/* Header Estándar MICSA OS */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
                    <div className="space-y-3">
                        <a href="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                           <span className="text-xs">←</span> Volver al Dashboard
                        </a>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-900/40">📑</div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight uppercase">MICSA</h1>
                                <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-medium">Sistema de Gestión de Calidad</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="text-left md:text-right">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">GUÍA ISO 9001:2015</h2>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Roadmap Estratégico de Certificación</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="primary" size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase">💾 Guardar</Button>
                        </div>
                    </div>
                </header>

                {/* Objetivo del Proyecto - Tarjeta Unificada */}
                <Card variant="glass" className="border-white/5">
                    <CardContent className="p-8 text-center space-y-4">
                        <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.3em]">Objetivo del Proyecto</h2>
                        <p className="text-base text-slate-400 leading-relaxed max-w-3xl mx-auto">
                            Establecer el itinerario normativo para la implementación efectiva del SGC, 
                            garantizando el cumplimiento de cada cláusula hasta la obtención del certificado oficial.
                        </p>
                    </CardContent>
                </Card>

                {/* Roadmap - Estilo Corporativo MICSA */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <span className="text-xl">📅</span>
                        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-[0.3em]">Plan de Ejecución Anual</h2>
                    </div>
                    
                    <div className="space-y-6">
                        {phases.map((phase) => (
                            <div key={phase.number} className="relative">
                                <Card variant="glass" className="border-white/5 overflow-hidden">
                                    <div className="p-6 md:p-8 space-y-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                                            <h3 className="text-lg font-bold text-white tracking-tight uppercase">
                                                {phase.title}
                                            </h3>
                                            <span className="inline-flex px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest self-start md:self-center">
                                                {phase.duration}
                                            </span>
                                        </div>
                                        
                                        <div className="grid md:grid-cols-[1fr_300px] gap-8">
                                            <ul className="space-y-4">
                                                {phase.activities.map((act, i) => (
                                                    <li key={i} className="flex items-start gap-4 text-slate-400 text-sm font-medium">
                                                        <span className="text-emerald-500 font-bold shrink-0">✓</span>
                                                        <span className="leading-relaxed">{act}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="flex flex-col gap-2 border-l border-white/10 pl-8 justify-center">
                                                <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 px-1">Entregables</h4>
                                                {phase.deliverables.map((del, i) => (
                                                    <div key={i} className="flex items-center gap-4 px-4 py-3 bg-slate-950/60 border border-white/5 rounded-lg text-white font-bold text-[10px] uppercase tracking-widest w-full hover:bg-slate-900 transition-all group/del">
                                                        <div className="w-8 h-8 rounded-md bg-slate-900 border border-white/5 flex items-center justify-center text-lg shadow-inner shadow-black/50">
                                                            📄
                                                        </div>
                                                        <span className="flex-1 opacity-80 group-hover/del:opacity-100 transition-opacity">
                                                            {del}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Matriz Documental - Tabla MICSA Estandarizada */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <span className="text-xl">📊</span>
                        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-[0.3em]">Matriz Documental Obligatoria</h2>
                    </div>
                    <Card variant="glass" className="border-white/5 overflow-hidden shadow-2xl">
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-left text-[11px] border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-slate-500 uppercase tracking-widest font-black border-b border-white/10">
                                        <th className="p-4 w-32 text-center">Cláusula</th>
                                        <th className="p-4 border-l border-white/5">Documentación Requerida</th>
                                        <th className="p-4 border-l border-white/5">Justificación Técnica</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {docTable.map((doc, i) => (
                                        <tr key={i} className="hover:bg-blue-600/[0.03] transition-colors group">
                                            <td className="p-4 font-black text-blue-400 text-center text-xs group-hover:bg-blue-600/5">{doc.clausula}</td>
                                            <td className="p-4 font-bold text-slate-200 border-l border-white/5">{doc.doc}</td>
                                            <td className="p-4 text-slate-500 leading-relaxed border-l border-white/5 italic">
                                                {doc.razon}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </section>

                {/* Preparación - Checklist MICSA */}
                <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">✅</span>
                                <h2 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Índice de Preparación</h2>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-8">Auditoría de Certificación ISO 9001:2015</p>
                        </div>
                        <div className="flex items-center gap-6 bg-white/5 px-6 py-4 rounded-2xl border border-white/5 shadow-xl">
                            <div className="text-right">
                                <div className="text-2xl font-black text-blue-400 tracking-tighter tabular-nums">{progress}%</div>
                                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Nivel de Avance</div>
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-[spin_3s_linear_infinite]"></div>
                        </div>
                    </div>

                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <Card variant="glass" className="border-white/5 overflow-hidden shadow-2xl">
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-left text-[11px] border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-slate-500 uppercase tracking-widest font-black border-b border-white/10">
                                        <th className="p-4 w-20 text-center">Estado</th>
                                        <th className="p-4 border-l border-white/5">Requisito a Verificar</th>
                                        <th className="p-4 border-l border-white/5 w-48">Responsable</th>
                                        <th className="p-4 border-l border-white/5 w-48 text-center">Evidencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {checklistItems.map((item, i) => (
                                        <tr key={i} className={`transition-all duration-200 group ${checklistState[i] ? 'bg-emerald-500/[0.03]' : 'hover:bg-white/[0.03]'}`}>
                                            <td className="p-4 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={checklistState[i]} 
                                                    onChange={() => handleCheckChange(i)}
                                                    className="w-5 h-5 rounded border-white/10 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer transition-all"
                                                />
                                            </td>
                                            <td className={`p-4 font-medium border-l border-white/5 transition-colors ${checklistState[i] ? 'text-slate-500' : 'text-slate-200'}`}>
                                                {item.requisito}
                                            </td>
                                            <td className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-white/5 bg-black/10">{item.responsable}</td>
                                            <td className="p-4 border-l border-white/5 text-center font-mono text-[10px] text-slate-400 tracking-tight">
                                                {item.evidencia}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </section>

                {/* Footer - Estandarizado */}
                <footer className="pt-24 pb-8 flex flex-col items-center gap-6 border-t border-white/5 mt-12">
                    <div className="flex flex-wrap justify-center gap-8 text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">
                        <span>© 2026 MICSA INDUSTRIAL</span>
                        <span className="text-slate-800">|</span>
                        <span>SGC PROTECTED</span>
                        <span className="text-slate-800">|</span>
                        <span>ISO 9001:2015</span>
                    </div>
                    <p className="text-[9px] text-slate-700 uppercase font-medium tracking-[0.2em]">Documento Técnico de Propiedad Exclusiva - Sistema MICSA OS</p>
                </footer>

            </div>

            {/* Renderizado vía Portal para evitar problemas de contexto (transform/blur) */}
            {mounted && typeof document !== 'undefined' && createPortal(
                <div 
                    style={{ 
                        position: 'fixed', 
                        bottom: '1.5rem', 
                        right: '1.5rem', 
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1rem 2rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: '1.25rem'
                    }}
                    className="left-6 md:left-[calc(16rem+1.5rem)] print:hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                    <Button type="button" variant="secondary" onClick={handleSave} className="bg-slate-700 hover:bg-slate-600 text-white font-bold h-10 px-6">
                        💾 Guardar Progreso
                    </Button>
                    <Button type="button" onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-8 shadow-lg shadow-blue-500/20">
                        📄 Generar PDF / Imprimir
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => {
                        if(window.confirm('¿Deseas reiniciar todo el progreso de la guía?')) {
                            setChecklistState(new Array(checklistItems.length).fill(false));
                            localStorage.removeItem('MICSA_Checklist_Progress');
                        }
                    }} className="text-red-500 hover:bg-red-500/10 font-bold h-10">
                        🗑️ Reiniciar
                    </Button>
                </div>,
                document.body
            )}
        </div>
    );
};
