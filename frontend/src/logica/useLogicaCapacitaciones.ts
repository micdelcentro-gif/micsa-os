import { useState, useEffect } from 'react';
import { TrainingType, TrainingFormData } from '@/types/training';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'MICSA_TRAININGS';

export const useLogicaCapacitaciones = () => {
    const [trainings, setTrainings] = useState<TrainingType[]>([]);
    
    // Cargar al inicio
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setTrainings(JSON.parse(saved));
        }
    }, []);

    // Guardar cambios
    const saveToStorage = (newTrainings: TrainingType[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrainings));
        setTrainings(newTrainings);
        // Disparar evento para que otros módulos (Trabajadores) sepan que hubo update
        window.dispatchEvent(new Event('training-update'));
    };

    const addTraining = (data: TrainingFormData) => {
        const newTraining: TrainingType = {
            id: uuidv4(),
            ...data,
            createdAt: new Date().toISOString()
        };
        saveToStorage([...trainings, newTraining]);
    };

    const deleteTraining = (id: string) => {
        if (confirm('¿Eliminar esta capacitación? Esto afectará la visualización en los perfiles de trabajadores.')) {
            saveToStorage(trainings.filter(t => t.id !== id));
        }
    };

    const updateTraining = (id: string, data: Partial<TrainingFormData>) => {
        const updated = trainings.map(t => t.id === id ? { ...t, ...data } : t);
        saveToStorage(updated);
    };

    return {
        trainings,
        addTraining,
        deleteTraining,
        updateTraining
    };
};
