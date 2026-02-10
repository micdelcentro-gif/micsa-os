import { useState } from 'react';
import { Employee } from '@/types/employee';

interface BulkDeactivateStep {
    currentEmployeeIndex: number;
    data: {id: string, reason: string, returnDate: string, isIndefinite: boolean}[];
}

export const useLogicaVistaActivos = (
    employees: Employee[], 
    bulkDeactivate: (ids: string[], details: {id: string, reason: string, returnDate: string | null, isIndefinite: boolean}[]) => void
) => {
    // Estado Selección Multiple
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Estado del Wizard
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardData, setWizardData] = useState<BulkDeactivateStep>({ currentEmployeeIndex: 0, data: [] });
    
    // Estado temporal del paso actual del wizard
    const [currentReason, setCurrentReason] = useState('');
    const [currentReturnDate, setCurrentReturnDate] = useState('');
    const [currentIsIndefinite, setCurrentIsIndefinite] = useState(false);

    // Estado Modal Creación
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- Helpers de Selección ---
    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleToggleAll = () => {
        if (selectedIds.length === employees.length) setSelectedIds([]);
        else setSelectedIds(employees.map(e => e.id));
    };

    // --- Lógica del Wizard ---

    const startBulkDeactivation = () => {
        if (selectedIds.length === 0) return;
        setIsWizardOpen(true);
        setWizardData({ currentEmployeeIndex: 0, data: [] });
        // Limpiar campos
        resetWizardStep();
    };

    const startSingleDeactivation = (id: string) => {
        setSelectedIds([id]);
        setIsWizardOpen(true);
        setWizardData({ currentEmployeeIndex: 0, data: [] });
        resetWizardStep();
    }

    const resetWizardStep = () => {
        setCurrentReason('');
        setCurrentReturnDate('');
        setCurrentIsIndefinite(false);
    }

    const nextWizardStep = () => {
        const currentId = selectedIds[wizardData.currentEmployeeIndex];
        
        // Guardar dato del actual
        const newData = [...wizardData.data, {
            id: currentId,
            reason: currentReason,
            returnDate: currentReturnDate,
            isIndefinite: currentIsIndefinite
        }];

        // Avanzar o Terminar
        if (wizardData.currentEmployeeIndex + 1 < selectedIds.length) {
            setWizardData({
                currentEmployeeIndex: wizardData.currentEmployeeIndex + 1,
                data: newData
            });
            resetWizardStep();
        } else {
            // FIN: Ejecutar acción real
            bulkDeactivate(selectedIds, newData);
            setIsWizardOpen(false);
            setSelectedIds([]);
        }
    };

    return {
        // Estado UI
        searchTerm,
        setSearchTerm,
        selectedIds,
        handleToggleSelect,
        handleToggleAll,
        
        // Wizard
        isWizardOpen,
        wizardData,
        currentReason, setCurrentReason,
        currentReturnDate, setCurrentReturnDate,
        currentIsIndefinite, setCurrentIsIndefinite,
        
        // Acciones Wizard
        startBulkDeactivation,
        startSingleDeactivation,
        nextWizardStep,

        // Modal Creación
        isCreateModalOpen, 
        setIsCreateModalOpen
    };
};
