'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLogicaTrabajadores } from '@/logica/useLogicaTrabajadores';
import { useLogicaCapacitaciones } from '@/logica/useLogicaCapacitaciones';
import { EmployeeCertification } from '@/types/employee';

export default function PaginaPerfilTrabajador() {
    const params = useParams();
    const router = useRouter();
    const { employees, updateEmployee, calculateAge } = useLogicaTrabajadores();
    const { trainings } = useLogicaCapacitaciones();
    
    const employeeId = params.id as string;
    const employee = employees.find(e => e.id === employeeId);

    // Estado local para edición de certificaciones
    const [editingCertId, setEditingCertId] = useState<string | null>(null);
    const [tempCertData, setTempCertData] = useState<{date: string, hasCert: boolean}>({date: '', hasCert: false});

    if (!employee) {
        return <div className="p-8 text-center text-red-400">Trabajador no encontrado.</div>;
    }

    const age = calculateAge(employee.birthDate);

    // Helpers de Semáforo
    const getCertStatusColor = (cert?: EmployeeCertification) => {
        if (!cert || cert.status === 'MISSING') return 'text-slate-500'; // Gris
        if (cert.status === 'EXPIRED') return 'text-red-500';
        if (cert.status === 'EXPIRING') return 'text-yellow-500';
        return 'text-green-500';
    };

    const getDaysUntilExpiration = (dateStr?: string | null) => {
        if (!dateStr) return null;
        const today = new Date();
        const exp = new Date(dateStr);
        const diffTime = exp.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Manejo de cambio en certificación
    const handleCertChange = (trainingId: string, hasCert: boolean, expirationDate: string | null) => {
        // Calcular estado
        let status: EmployeeCertification['status'] = 'MISSING';
        if (hasCert) {
            if (!expirationDate) status = 'VALID'; // Asumir válido si no hay fecha (o forzar fecha)
            else {
                const days = getDaysUntilExpiration(expirationDate);
                if (days !== null && days < 0) status = 'EXPIRED';
                else if (days !== null && days <= 30) status = 'EXPIRING';
                else status = 'VALID';
            }
        }

        const newCert: EmployeeCertification = {
            trainingTypeId: trainingId,
            status,
            expirationDate,
            fileUrl: undefined // Pendiente implementar subida
        };

        const updatedCerts = { ...employee.certifications, [trainingId]: newCert };
        updateEmployee(employee.id, { certifications: updatedCerts });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="secondary" onClick={() => router.back()}>← Volver</Button>
                <div>
                    <h2 className="text-3xl font-bold text-white">{employee.name} {employee.paternalSurname}</h2>
                    <p className="text-cyan-400 font-mono">{employee.employeeId} • {employee.position}</p>
                </div>
                <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border ${employee.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                    {employee.status === 'ACTIVE' ? 'ACTIVO' : 'BAJA / INACTIVO'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Datos Personales */}
                <Card variant="glass" className="h-fit">
                    <CardHeader><CardTitle>Información Personal</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <span className="block text-slate-500 text-xs uppercase">Edad</span>
                            <span className="text-white text-lg">{age} años</span>
                            <span className="text-slate-400 text-xs ml-2">({new Date(employee.birthDate).toLocaleDateString()})</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase">CURP</span>
                            <span className="text-white font-mono">{employee.curp}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase">RFC</span>
                            <span className="text-white font-mono">{employee.rfc || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase">NSS</span>
                            <span className="text-white font-mono">{employee.nss || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase">Teléfono</span>
                            <span className="text-white">{employee.phone || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Columna Derecha: Matriz de Capacitación */}
                <Card variant="glass" className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Matriz de Capacitación y DC-3</CardTitle>
                        <p className="text-xs text-slate-400">
                            🟢 Vigente (30 días) • 🟡 Por Vencer (≤30 días) • 🔴 Vencido • ⚪ Sin DC-3
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {trainings.map(training => {
                                const cert = employee.certifications[training.id];
                                const expirationDate = cert?.expirationDate ? cert.expirationDate.split('T')[0] : '';
                                const hasCert = !!cert && cert.status !== 'MISSING';
                                const colorClass = getCertStatusColor(cert);

                                return (
                                    <div key={training.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {/* Icono de Estado */}
                                            <div className={`text-2xl ${colorClass}`}>
                                                {cert?.status === 'VALID' ? '🟢' : 
                                                 cert?.status === 'EXPIRING' ? '🟡' : 
                                                 cert?.status === 'EXPIRED' ? '🔴' : '⚪'}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium">{training.name}</h4>
                                                <span className="text-xs font-mono text-cyan-500 bg-cyan-900/20 px-1 rounded">
                                                    {training.code}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-400 uppercase">Vencimiento</span>
                                                <input 
                                                    type="date" 
                                                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                                    value={expirationDate}
                                                    onChange={(e) => handleCertChange(training.id, true, e.target.value)}
                                                />
                                            </div>
                                            
                                            {/* Checkbox Simple para activar/desactivar rápido */}
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-slate-400 mb-1">Tiene</span>
                                                <input 
                                                    type="checkbox"
                                                    checked={hasCert}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        // Si desmarca, borrar fecha. Si marca, mantener fecha si existe o pedirla.
                                                        handleCertChange(training.id, checked, checked ? expirationDate : null);
                                                    }}
                                                    className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {trainings.length === 0 && (
                                <p className="text-center text-slate-500 italic py-8">
                                    No hay capacitaciones configuradas en el sistema.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
