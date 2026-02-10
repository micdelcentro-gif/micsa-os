'use client';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLogicaTrabajadores } from '@/logica/useLogicaTrabajadores';
import { useLogicaVistaActivos } from '@/logica/useLogicaVistaActivos';
import { TablaTrabajadores } from '@/components/trabajadores/TablaTrabajadores';
import { useLogicaCapacitaciones } from '@/logica/useLogicaCapacitaciones';
import { Employee } from '@/types/employee';

export default function PaginaTrabajadoresActivos() {
    // 1. Acceso a Datos Globales (Negocio)
    const { employees, addEmployee, bulkDeactivate, setFilterText, advancedFilters, setAdvancedFilters, allEmployees } = useLogicaTrabajadores();
    const { trainings } = useLogicaCapacitaciones();
    
    // 2. Lógica de Vista Específica (UI state, wizard, selections)
    const {
        searchTerm, setSearchTerm,
        selectedIds, handleToggleSelect, handleToggleAll,
        isWizardOpen, wizardData,
        currentReason, setCurrentReason,
        currentReturnDate, setCurrentReturnDate,
        currentIsIndefinite, setCurrentIsIndefinite,
        startBulkDeactivation, startSingleDeactivation, nextWizardStep,
        isCreateModalOpen, setIsCreateModalOpen
    } = useLogicaVistaActivos(employees, bulkDeactivate);

    // Estado local para formulario de creación
    const [createForm, setCreateForm] = useState({
        name: '',
        paternalSurname: '',
        maternalSurname: '',
        birthDate: '',
        phone: '',
        email: '',
        curp: '',
        rfc: '',
        nss: '',
        position: '',
        employeeId: '',
        startDate: ''
    });

    const handleCreateEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación de Edad > 20
        const birth = new Date(createForm.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        if (age < 20) {
            alert('El trabajador debe tener al menos 20 años de edad.');
            return;
        }

        addEmployee(createForm);
        setIsCreateModalOpen(false);
        setCreateForm({
             name: '', paternalSurname: '', maternalSurname: '', birthDate: '', phone: '', email: '', curp: '', rfc: '', nss: '', position: '', employeeId: '', startDate: ''
        });
    };

    // Helper para datos del empleado actual en el wizard
    const currentEmployeeId = selectedIds[wizardData.currentEmployeeIndex];
    const currentEmployee = allEmployees.find(e => e.id === currentEmployeeId);

    // Helper para dropdowns
    const uniquePositions = Array.from(new Set(allEmployees.filter(e => e.status === 'ACTIVE').map(e => e.position))).sort();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">👷 Trabajadores Activos</h2>
                    <p className="text-slate-400">Gestión del personal activo en planta.</p>
                </div>
                <div className="flex gap-3">
                    {selectedIds.length > 0 && (
                        <Button 
                            onClick={startBulkDeactivation} 
                            className="bg-red-600 hover:bg-red-500 animate-pulse font-bold"
                        >
                            Dar de Baja ({selectedIds.length})
                        </Button>
                    )}
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500"
                    >
                        + Nuevo Trabajador
                    </Button>
                </div>
            </div>

            {/* Filtros Avanzados */}
            <Card variant="glass" className="p-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-slate-400 mb-1">Buscar</label>
                        <Input 
                            placeholder="Nombre, ID..." 
                            className="bg-slate-900/50"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setFilterText(e.target.value);
                            }}
                        />
                    </div>
                    
                    <div className="w-48">
                        <label className="block text-xs text-slate-400 mb-1">Puesto</label>
                        <select 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-white text-sm"
                            value={advancedFilters.position}
                            onChange={(e) => setAdvancedFilters(prev => ({...prev, position: e.target.value}))}
                        >
                            <option value="">Todos</option>
                            {uniquePositions.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-32">
                        <label className="block text-xs text-slate-400 mb-1">Edad Mín</label>
                        <Input 
                            type="number"
                            className="bg-slate-900/50"
                            value={advancedFilters.ageMin}
                            onChange={(e) => setAdvancedFilters(prev => ({...prev, ageMin: parseInt(e.target.value) || 0}))}
                        />
                    </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                    <label className="block text-xs text-slate-400 mb-2">Filtrar por Capacitaciones (Debe cumplir TODAS las seleccionadas)</label>
                    <div className="flex flex-wrap gap-2">
                        {trainings.map(t => {
                            const isSelected = advancedFilters.requiredCertifications.includes(t.id);
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setAdvancedFilters(prev => ({
                                            ...prev,
                                            requiredCertifications: isSelected 
                                                ? prev.requiredCertifications.filter(id => id !== t.id)
                                                : [...prev.requiredCertifications, t.id]
                                        }));
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                        isSelected 
                                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' 
                                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                                    }`}
                                >
                                    {isSelected ? '✓ ' : '+ '} {t.name}
                                </button>
                            );
                        })}
                        {trainings.length === 0 && <span className="text-slate-500 text-xs italic">No hay capacitaciones para filtrar.</span>}
                    </div>
                </div>
            </Card>

            <Card variant="glass">
                <div className="p-1">
                    <TablaTrabajadores
                        employees={employees}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                        onToggleAll={handleToggleAll}
                        onAction={(e) => startSingleDeactivation(e.id)}
                        actionLabel="Dar de Baja"
                        actionIcon="📉"
                        actionColor="red"
                        onEdit={(id) => console.log('Edit', id)}
                        onView={(id) => console.log('View', id)}
                    />
                </div>
            </Card>

            {/* MODAL CREACIÓN VERTICAL (Estilo Reporte) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto pt-10">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl mb-10">
                        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4 flex justify-between items-center rounded-t-xl">
                            <div>
                                <h3 className="text-lg font-bold text-white">Nuevo Trabajador</h3>
                                <p className="text-xs text-slate-400">Complete los datos en orden descendente</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white p-2">✕</button>
                        </div>
                        
                        <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
                            {/* 1. Identificación Básica */}
                            <div className="bg-slate-800/30 p-3 rounded border border-slate-700/50 space-y-3">
                                <h4 className="text-xs font-bold text-blue-400 uppercase border-b border-slate-700 pb-1 mb-2">1. Identidad</h4>
                                
                                <div>
                                    <label className="block text-xs text-slate-300 mb-1">ID Nómina / Empleado *</label>
                                    <Input required className="bg-slate-950 font-bold" placeholder="Ej. 1045" value={createForm.employeeId} onChange={e => setCreateForm({...createForm, employeeId: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-300 mb-1">Nombre(s) *</label>
                                    <Input required className="bg-slate-950" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">Apellido Paterno *</label>
                                        <Input required className="bg-slate-950" value={createForm.paternalSurname} onChange={e => setCreateForm({...createForm, paternalSurname: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">Apellido Materno *</label>
                                        <Input required className="bg-slate-950" value={createForm.maternalSurname} onChange={e => setCreateForm({...createForm, maternalSurname: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-300 mb-1">Fecha Nacimiento *</label>
                                    <Input type="date" required className="bg-slate-950" value={createForm.birthDate} onChange={e => setCreateForm({...createForm, birthDate: e.target.value})} />
                                    <p className="text-[10px] text-slate-500 text-right mt-1">Edad mínima requerida: 20 años</p>
                                </div>
                            </div>
                            
                            {/* 2. Datos Fiscales y Contacto */}
                            <div className="bg-slate-800/30 p-3 rounded border border-slate-700/50 space-y-3">
                                <h4 className="text-xs font-bold text-blue-400 uppercase border-b border-slate-700 pb-1 mb-2">2. Fiscal y Contacto</h4>
                                
                                <div>
                                    <label className="block text-xs text-slate-300 mb-1">CURP *</label>
                                    <Input required className="bg-slate-950 font-mono uppercase" maxLength={18} value={createForm.curp} onChange={e => setCreateForm({...createForm, curp: e.target.value.toUpperCase()})} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">RFC</label>
                                        <Input className="bg-slate-950 font-mono uppercase" maxLength={13} value={createForm.rfc} onChange={e => setCreateForm({...createForm, rfc: e.target.value.toUpperCase()})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-300 mb-1">NSS</label>
                                        <Input className="bg-slate-950 font-mono" maxLength={11} value={createForm.nss} onChange={e => setCreateForm({...createForm, nss: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-300 mb-1">Teléfono Móvil *</label>
                                    <Input required type="tel" className="bg-slate-950" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-300 mb-1">Correo Electrónico</label>
                                    <Input type="email" className="bg-slate-950" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} />
                                </div>
                            </div>

                            {/* 3. Información Laboral */}
                            <div className="bg-slate-800/30 p-3 rounded border border-slate-700/50 space-y-3">
                                <h4 className="text-xs font-bold text-blue-400 uppercase border-b border-slate-700 pb-1 mb-2">3. Asignación Laboral</h4>
                                
                                <div>
                                    <label className="block text-xs text-slate-300 mb-1">Puesto / Cargo *</label>
                                    <Input required className="bg-slate-950" placeholder="Ej. Soldador Especialista" value={createForm.position} onChange={e => setCreateForm({...createForm, position: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-300 mb-1">Fecha de Ingreso *</label>
                                    <Input type="date" required className="bg-slate-950" value={createForm.startDate} onChange={e => setCreateForm({...createForm, startDate: e.target.value})} />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 font-bold shadow-lg shadow-blue-500/20">
                                    💾 Registrar Trabajador
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* WIZARD MODAL (BLOQUEANTE) */}
            {isWizardOpen && currentEmployee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-lg shadow-2xl relative">
                        {/* Candado visual */}
                        <div className="absolute -top-4 -right-4 bg-yellow-500 text-black p-2 rounded-full shadow-lg" title="Acción bloqueante requerida">
                            🔒
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 text-center">
                            Proceso de Baja
                        </h3>
                        <p className="text-slate-400 text-center mb-6">
                            Empleado {wizardData.currentEmployeeIndex + 1} de {selectedIds.length}
                        </p>

                        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                            <h4 className="text-xl text-white font-bold">{currentEmployee.name} {currentEmployee.paternalSurname}</h4>
                            <p className="text-cyan-400 font-mono text-sm">{currentEmployee.employeeId} - {currentEmployee.position}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1 font-bold">Motivo de Baja *</label>
                                <textarea 
                                    className="w-full bg-slate-800 border-slate-600 rounded p-2 text-white h-24 resize-none focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    placeholder="Describe detalladamente el motivo..."
                                    value={currentReason}
                                    onChange={e => setCurrentReason(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="bg-slate-800/30 p-3 rounded border border-slate-700">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm text-slate-300 font-bold">Tiempo de Inactividad</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="indefinite"
                                            checked={currentIsIndefinite}
                                            onChange={e => {
                                                setCurrentIsIndefinite(e.target.checked);
                                                if(e.target.checked) setCurrentReturnDate('');
                                            }}
                                            className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-red-500"
                                        />
                                        <label htmlFor="indefinite" className="text-sm text-white select-none">Indefinido</label>
                                    </div>
                                </div>
                                
                                {!currentIsIndefinite && (
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Fecha estimada de regreso *</label>
                                        <Input 
                                            type="date" 
                                            value={currentReturnDate}
                                            onChange={e => setCurrentReturnDate(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button 
                                className="w-full bg-red-600 hover:bg-red-500 py-3 text-lg font-bold shadow-lg shadow-red-900/20"
                                onClick={nextWizardStep}
                                disabled={!currentReason || (!currentIsIndefinite && !currentReturnDate)}
                            >
                                {wizardData.currentEmployeeIndex + 1 === selectedIds.length ? 'Finalizar Bajas' : 'Siguiente Empleado →'}
                            </Button>
                            <p className="text-center text-xs text-slate-500 mt-3">
                                No puedes cancelar ni cerrar esta ventana hasta completar todos los registros.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
