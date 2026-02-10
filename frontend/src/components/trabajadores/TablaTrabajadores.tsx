import { Employee } from '@/types/employee';
import Button from '@/components/ui/Button';

interface TablaTrabajadoresProps {
    employees: Employee[];
    onEdit?: (id: string) => void;
    onView?: (id: string) => void;
    // Acciones de Baja / Reactivación
    onAction?: (employee: Employee) => void; 
    actionLabel?: string;
    actionIcon?: string;
    actionColor?: 'red' | 'green' | 'blue';
    
    // Para selección múltiple
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleAll: () => void;
    
    showInactivityInfo?: boolean;
}

export const TablaTrabajadores = ({
    employees,
    onEdit,
    onView,
    onAction,
    actionLabel,
    actionIcon,
    actionColor = 'blue',
    selectedIds,
    onToggleSelect,
    onToggleAll,
    showInactivityInfo = false
}: TablaTrabajadoresProps) => {
    
    const allSelected = employees.length > 0 && selectedIds.length === employees.length;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase">
                        <th className="p-4 w-10">
                            <input 
                                type="checkbox"
                                checked={allSelected}
                                onChange={onToggleAll}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-800"
                            />
                        </th>
                        <th className="p-4">ID Nómina</th>
                        <th className="p-4">Nombre Completo</th>
                        <th className="p-4">Puesto</th>
                        <th className="p-4">Edad</th>
                        <th className="p-4">CURP</th>
                        {showInactivityInfo && (
                            <>
                                <th className="p-4">Regreso</th>
                                <th className="p-4">Motivo</th>
                            </>
                        )}
                        <th className="p-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length > 0 ? employees.map(e => (
                        <tr key={e.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                                <input 
                                    type="checkbox"
                                    checked={selectedIds.includes(e.id)}
                                    onChange={() => onToggleSelect(e.id)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800"
                                />
                            </td>
                            <td className="p-4 font-mono text-cyan-400">{e.employeeId}</td>
                            <td className="p-4 text-white font-medium">
                                {e.name} {e.paternalSurname} {e.maternalSurname}
                            </td>
                            <td className="p-4 text-slate-300">{e.position}</td>
                            <td className="p-4 text-slate-400">{e.age} años</td>
                            <td className="p-4 font-mono text-xs text-slate-500">{e.curp}</td>
                            
                            {showInactivityInfo && (
                                <>
                                    <td className="p-4 text-slate-300">
                                        {e.isIndefinite ? 
                                            <span className="text-orange-400 font-bold">Indefinido</span> : 
                                            (e.returnDate ? new Date(e.returnDate).toLocaleDateString() : 'N/A')
                                        }
                                    </td>
                                    <td className="p-4 text-slate-400 italic text-sm truncate max-w-[150px]" title={e.inactivityReason}>
                                        {e.inactivityReason}
                                    </td>
                                </>
                            )}

                            <td className="p-4 text-right flex justify-end gap-2">
                                {onView && (
                                    <Button size="sm" variant="secondary" onClick={() => onView(e.id)} title="Ver Perfil">
                                        👤
                                    </Button>
                                )}
                                {onEdit && (
                                    <Button size="sm" variant="secondary" onClick={() => onEdit(e.id)} title="Editar">
                                        ✏️
                                    </Button>
                                )}
                                {onAction && (
                                    <Button 
                                        size="sm" 
                                        className={`${
                                            actionColor === 'red' ? 'bg-red-600 hover:bg-red-500' : 
                                            actionColor === 'green' ? 'bg-green-600 hover:bg-green-500' : 
                                            'bg-blue-600 hover:bg-blue-500'
                                        }`}
                                        onClick={() => onAction(e)}
                                        title={actionLabel}
                                    >
                                        {actionIcon}
                                    </Button>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={showInactivityInfo ? 9 : 7} className="p-8 text-center text-slate-500 italic">
                                No hay trabajadores en esta lista.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
