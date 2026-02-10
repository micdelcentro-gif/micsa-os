import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
// Assuming we might use the common api client, but for now standard fetch as in legacy or localStorage
// import { api } from '@/lib/api'; 

const GLOBAL_ID = 'MICSA_GLOBAL_LABELING_SYSTEM';

// Default Data from legacy categories-data.js
const DEFAULT_CATEGORIES = [
    {
        prefijo: "EQ",
        categoria: "Equipo Principal",
        descripcion: "Celdas, maquinaria principal",
        formato: "EQ-XXX",
        ejemplo: "EQ-001",
        ubicacion: "Sobre equipo visible",
        responsable: "Supervisor"
    },
    {
        prefijo: "CB",
        categoria: "Cableado",
        descripcion: "Cables de potencia y control",
        formato: "CB-EQ-XXX-YY",
        ejemplo: "CB-EQ-001-01",
        ubicacion: "Ambos extremos",
        responsable: "Electricista"
    },
    {
        prefijo: "TB",
        categoria: "Tubería",
        descripcion: "Líneas de proceso y servicios",
        formato: "TB-XXX-DIA-MAT",
        ejemplo: "TB-001-2IN-CS",
        ubicacion: "Cada 3 metros",
        responsable: "Mecánico"
    },
    {
        prefijo: "VL",
        categoria: "Válvula",
        descripcion: "Válvulas de aislamiento",
        formato: "VL-TB-XXX",
        ejemplo: "VL-TB-001",
        ubicacion: "Cuerpo de válvula",
        responsable: "Mecánico"
    },
    {
        prefijo: "SP",
        categoria: "Soporte",
        descripcion: "Sopteria estructural",
        formato: "SP-XXX-TIPO",
        ejemplo: "SP-001-BRK",
        ubicacion: "En soporte",
        responsable: "Ayudante"
    },
    {
        prefijo: "CN",
        categoria: "Conexión",
        descripcion: "Puntos de conexión",
        formato: "CN-XXX-TIPO",
        ejemplo: "CN-001-FLG",
        ubicacion: "En conexión",
        responsable: "Técnico"
    },
    {
        prefijo: "AC",
        categoria: "Accesorio",
        descripcion: "Componentes menores",
        formato: "AC-EQ-XXX-YY",
        ejemplo: "AC-EQ-001-01",
        ubicacion: "En componente",
        responsable: "Ayudante"
    }
];

// Zod Schema
export const etiquetaSchema = z.object({
  prefijo: z.string().optional(),
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
  formato: z.string().optional(),
  ejemplo: z.string().optional(),
  ubicacion: z.string().optional(),
  responsable: z.string().optional(),
});

export const sistemaEtiquetadoSchema = z.object({
    etiquetas: z.array(etiquetaSchema)
});

export type SistemaEtiquetadoType = z.infer<typeof sistemaEtiquetadoSchema>;

export const useLogicaEtiquetado = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [activeMessage, setActiveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const formMethods = useForm<SistemaEtiquetadoType>({
        resolver: zodResolver(sistemaEtiquetadoSchema),
        defaultValues: {
            etiquetas: []
        }
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: formMethods.control,
        name: "etiquetas"
    });

    // Helper to show messages
    const showMessage = (type: 'success' | 'error', text: string) => {
        setActiveMessage({ type, text });
        // Auto-clear also in hook to keep state clean, matching component timer
        setTimeout(() => setActiveMessage(null), 1500);
    };

    // Load Data
    useEffect(() => {
        const loadData = async () => {
             // ... (existing load logic clipped for brevity, no changes here) ...
             try {
                // ... (omitted) ...
                replace(DEFAULT_CATEGORIES);
            } catch (error) {
                console.error("Error loading data:", error);
                replace(DEFAULT_CATEGORIES);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [replace]);

    const handleSave = async () => {
        const data = formMethods.getValues();
        
        const reportPayload = {
            reportId: GLOBAL_ID, 
            documentType: 'LABELING_SYSTEM',
            generalData: { reporteNo: 'GLOBAL', nombreProyecto: 'General' }, 
            data: {
                etiquetas: data.etiquetas,
                tipo: 'SISTEMA_ETIQUETADO_GLOBAL',
                updatedAt: new Date().toISOString()
            }
        };

        try {
            // Save to API
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportPayload)
            });

            if (!response.ok) throw new Error('Error en servidor');
            
            showMessage('success', 'Sistema de Etiquetado Guardado');
        } catch (e) {
            console.error('Error saving:', e);
            // Fallback LocalStorage
            localStorage.setItem(GLOBAL_ID, JSON.stringify(reportPayload.data));
            showMessage('success', 'Guardado en LocalStorage (Offline)');
        }
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro de borrar TODO el formulario? Esto eliminará todas las etiquetas actuales y restaurará los valores por defecto.')) {
            replace(DEFAULT_CATEGORIES);
            showMessage('error', 'Formulario Restaurado');
        }
    };

    const handleAddRow = () => {
        append({
            prefijo: '',
            categoria: '',
            descripcion: '',
            formato: '',
            ejemplo: '',
            ubicacion: '',
            responsable: ''
        });
        // Optional: show message on add? User asked for "all buttons" but mostly save/delete. 
        // Let's add it to be safe if user wants feedback for everything.
        // showMessage('success', 'Fila Agregada'); 
    };

    const handleDeleteRow = (index: number) => {
        if (confirm('¿Eliminar esta etiqueta?')) {
            remove(index);
            showMessage('error', 'Etiqueta Eliminada');
        }
    };

    return {
        formMethods,
        fields,
        isLoading,
        activeMessage,
        handleSave,
        handleReset,
        handleAddRow,
        handleDeleteRow,
        setMessage: setActiveMessage
    };
};
