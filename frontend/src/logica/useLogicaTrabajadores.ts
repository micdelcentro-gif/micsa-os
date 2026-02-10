import { useState, useEffect } from 'react';
import { Employee, EmployeeFormData, EmployeeStatus } from '@/types/employee';
import { TrainingType } from '@/types/training';
import { v4 as uuidv4 } from 'uuid';
import { useLogicaCapacitaciones } from './useLogicaCapacitaciones';

const STORAGE_KEY = 'MICSA_EMPLOYEES';

export const useLogicaTrabajadores = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filterText, setFilterText] = useState('');
    const [filterStatus, setFilterStatus] = useState<EmployeeStatus | 'ALL'>('ACTIVE');
    
    // Cargar al inicio
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setEmployees(JSON.parse(saved));
        }
    }, []);

    const saveToStorage = (newEmployees: Employee[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newEmployees));
        setEmployees(newEmployees);
    };

    // Crear Trabajador
    const addEmployee = (data: EmployeeFormData) => {
        // Validar CURP única
        if (employees.some(e => e.curp === data.curp)) {
            throw new Error('La CURP ya existe en el sistema.');
        }

        const newEmployee: Employee = {
            id: uuidv4(),
            ...data,
            // Calcular edad inicial
            age: calculateAge(data.birthDate), 
            status: 'ACTIVE',
            certifications: {} // Se inicia vacío, se llenará dinámicamente
        };
        saveToStorage([...employees, newEmployee]);
    };

    // Editar
    const updateEmployee = (id: string, data: Partial<Employee>) => {
        const updated = employees.map(e => {
            if (e.id === id) {
                const newData = { ...e, ...data };
                // Recalcular edad si cambió fecha nacimiento
                if (data.birthDate) newData.age = calculateAge(data.birthDate);
                return newData;
            }
            return e;
        });
        saveToStorage(updated);
    };

    // Baja Lógica (Soft Delete)
    const deactivateEmployee = (id: string, reason: string, returnDate: string | null, isIndefinite: boolean) => {
        const updated = employees.map(e => e.id === id ? {
            ...e,
            status: 'INACTIVE' as EmployeeStatus,
            inactivityDate: new Date().toISOString(),
            inactivityReason: reason,
            returnDate: isIndefinite ? null : returnDate,
            isIndefinite
        } : e);
        saveToStorage(updated);
    };

    // Reactivar
    const reactivateEmployee = (id: string) => {
        const updated = employees.map(e => e.id === id ? {
            ...e,
            status: 'ACTIVE' as EmployeeStatus,
            inactivityDate: undefined,
            inactivityReason: undefined,
            returnDate: undefined,
            isIndefinite: undefined
        } : e);
        saveToStorage(updated);
    };

    // Baja Masiva (Wizard)
    const bulkDeactivate = (ids: string[], details: {id: string, reason: string, returnDate: string | null, isIndefinite: boolean}[]) => {
        const updated = employees.map(e => {
            const detail = details.find(d => d.id === e.id);
            if (detail) {
                 return {
                    ...e,
                    status: 'INACTIVE' as EmployeeStatus,
                    inactivityDate: new Date().toISOString(),
                    inactivityReason: detail.reason,
                    returnDate: detail.isIndefinite ? null : detail.returnDate,
                    isIndefinite: detail.isIndefinite
                };
            }
            return e;
        });
        saveToStorage(updated);
    }

    // Helpers
    const calculateAge = (birthDate: string): number => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Estado para filtros avanzados
    const [advancedFilters, setAdvancedFilters] = useState({
        position: '',
        ageMin: 0,
        ageMax: 100,
        requiredCertifications: [] as string[] // IDs de training types requeridos (AND logic)
    });

    // Filtros
    const filteredEmployees = employees.filter(e => {
        // 1. Status
        if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
        
        // 2. Text Search
        const search = filterText.toLowerCase();
        const matchesText = (
            e.name.toLowerCase().includes(search) ||
            e.paternalSurname.toLowerCase().includes(search) ||
            e.employeeId.toLowerCase().includes(search) ||
            e.position.toLowerCase().includes(search)
        );
        if (!matchesText) return false;

        // 3. Puesto
        if (advancedFilters.position && e.position !== advancedFilters.position) return false;

        // 4. Edad
        if ((typeof e.age === 'number') && (e.age < advancedFilters.ageMin || e.age > advancedFilters.ageMax)) return false;

        // 5. Certificaciones (AND Logic: Debe tener todas las seleccionadas VIGENTES)
        if (advancedFilters.requiredCertifications.length > 0) {
            const hasAllCerts = advancedFilters.requiredCertifications.every(certId => {
                const empCert = e.certifications[certId];
                // Se considera tenerla si existe Y está válida (o por vencer, pero no vencida/faltante)
                // Ajustar lógica según rigor deseado. Aquí pedimos que NO sea MISSING.
                // Si se requiere vigencia estricta: return empCert?.status === 'VALID' || empCert?.status === 'EXPIRING';
                
                // Opción A: Solo que la tenga marcada ("Tiene")
                // return !!empCert && empCert.status !== 'MISSING';

                // Opción B (Más estricta): Que la tenga Y no esté vencida
                return !!empCert && (empCert.status === 'VALID' || empCert.status === 'EXPIRING');
            });
            if (!hasAllCerts) return false;
        }

        return true;
    });

    return {
        employees: filteredEmployees,
        allEmployees: employees, // Para conteos globales
        addEmployee,
        updateEmployee,
        deactivateEmployee,
        reactivateEmployee,
        bulkDeactivate,
        setFilterText,
        setFilterStatus,
        calculateAge,
        // Exponer setters de filtros
        advancedFilters,
        setAdvancedFilters
    };
};
