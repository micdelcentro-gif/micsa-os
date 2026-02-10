'use client';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useLogicaTrabajadores } from '@/logica/useLogicaTrabajadores';
import { TablaTrabajadores } from '@/components/trabajadores/TablaTrabajadores';

export default function PaginaTrabajadoresInactivos() {
    const { employees, reactivateEmployee, setFilterText } = useLogicaTrabajadores();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // Filtrar inactivos
    const inactiveEmployees = employees.filter(e => e.status === 'INACTIVE');

    // Selección (si fuera necesaria)
    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleToggleAll = () => {
        if (selectedIds.length === inactiveEmployees.length) setSelectedIds([]);
        else setSelectedIds(inactiveEmployees.map(e => e.id));
    };

    const handleReactivate = (employeeId: string) => {
        if (confirm('¿Estás seguro de reactivar a este trabajador? Volverá a la lista de activos.')) {
            reactivateEmployee(employeeId);
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-300">Respaldo / Bajas</h2>
                    <p className="text-slate-500">Histórico de personal inactivo o despedido.</p>
                </div>
            </div>

             {/* Filtros */}
             <Card variant="glass" className="p-4 flex gap-4 bg-slate-900/30 border-slate-800">
                <Input 
                    placeholder="Buscar histórico..." 
                    className="max-w-md bg-slate-900/50"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setFilterText(e.target.value);
                    }}
                />
            </Card>

            <Card variant="glass" className="opacity-80">
                <div className="p-1">
                    <TablaTrabajadores
                        employees={inactiveEmployees}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                        onToggleAll={handleToggleAll}
                        onAction={(e) => handleReactivate(e.id)}
                        actionLabel="Reactivar"
                        actionIcon="🔄" // Icono de vuelta
                        actionColor="green"
                        onView={(id) => console.log('View Historic', id)}
                        showInactivityInfo={true} // Mostrar columnas extra
                    />
                </div>
            </Card>
        </div>
    );
}
