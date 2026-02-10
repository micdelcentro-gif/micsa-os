import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PackingListData, PackingListDataSchema, PackingListItem } from '../types/packing-list';
import api from '@/lib/api';
import * as XLSX from 'xlsx-js-style';
import { exportPackingListToExcel, importPackingListFromExcel } from '@/lib/excel-utils';
import { draftsUtils } from '@/lib/drafts-utils';
import { useSearchParams } from 'next/navigation';

const GLOBAL_LABEL_ID = 'MICSA_GLOBAL_LABELING_SYSTEM';

const DEFAULT_CATEGORIES = [
  { categoria: 'Equipo Principal', prefijo: 'EQ', formato: 'EQ-XXX' },
  { categoria: 'Cableado', prefijo: 'CB', formato: 'CB-EQ-XXX-YY' },
  { categoria: 'Tubería', prefijo: 'TB', formato: 'TB-XXX-DIA-MAT' },
  { categoria: 'Válvula', prefijo: 'VL', formato: 'VL-TB-XXX' },
  { categoria: 'Soporte', prefijo: 'SP', formato: 'SP-XXX-TIPO' },
  { categoria: 'Conexión', prefijo: 'CN', formato: 'CN-XXX-TIPO' },
  { categoria: 'Accesorio', prefijo: 'AC', formato: 'AC-EQ-XXX-YY' }
];

export const useLogicaPackingList = () => {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [globalLabels, setGlobalLabels] = useState<any[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId);

  const formMethods = useForm<PackingListData>({
    resolver: zodResolver(PackingListDataSchema),
    defaultValues: {
      projectName: '',
      clientName: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      summary: []
    }
  });

  const { control, setValue, getValues, reset, watch } = formMethods;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items'
  });

  // 1. Cargar configuración inicial y Borrador
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar etiquetas globales (tolera errores de auth en desarrollo)
        try {
          const response = await api.get('/reports');
          const config = response.data.find((r: any) =>
            r.internal_id === GLOBAL_LABEL_ID || r.reportId === GLOBAL_LABEL_ID
          );
          setGlobalLabels(config?.data?.etiquetas || DEFAULT_CATEGORIES);
        } catch (apiErr) {
          console.warn('⚠️ API de reports no disponible, usando categorías por defecto:', apiErr);
          setGlobalLabels(DEFAULT_CATEGORIES);
        }

        // Cargar borrador si existe en URL
        if (draftId) {
          const savedDraft = draftsUtils.getById(draftId);
          if (savedDraft) {
            reset(savedDraft.data);
            setCurrentDraftId(draftId);
          }
        }
      } catch (error) {
        console.error('Error inicializando:', error);
        setGlobalLabels(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [draftId, reset]);



  // 3. Lógica de Autocompletado (TAG basado en Categoría)
  const handleCategoryChange = useCallback((index: number, category: string) => {
    const labelConfig = globalLabels.find(l => l.categoria === category);
    if (labelConfig?.formato) {
      // Siempre actualizar el formato al cambiar de categoría, según solicitud del usuario
      setValue(`items.${index}.tag`, labelConfig.formato);
    }
  }, [globalLabels, getValues, setValue]);

  // 4. Cálculos de Resumen y Totales
  const itemsWatched = useWatch({ control, name: 'items' }) || [];

  const { summary, totalWeight } = useMemo(() => {
    const stats: Record<string, { count: number; weight: number }> = {};
    let total = 0;

    itemsWatched.forEach(item => {
      const cat = item.category || 'Sin Categoría';
      const qty = Number(item.qty) || 0;
      const unitWeight = Number(item.weight) || 0;
      const totalItemWeight = unitWeight * qty;

      if (!stats[cat]) stats[cat] = { count: 0, weight: 0 };
      stats[cat].count += qty;
      stats[cat].weight += totalItemWeight;
      total += totalItemWeight;
    });

    const summaryData = Object.entries(stats).map(([category, data]) => ({
      category,
      count: data.count,
      weight: data.weight,
      percentage: total > 0 ? ((data.weight / total) * 100).toFixed(2) + '%' : '0%',
      observations: ''
    }));

    return { summary: summaryData, totalWeight: total };
  }, [itemsWatched]);

  useEffect(() => {
    setValue('summary', summary);
  }, [summary, setValue]);

  // 5. Gestión de Imágenes
  const handlePhotoUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue(`items.${index}.photo`, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 6. Guardar Definitivo
  const onSave = async (data: PackingListData) => {
    setSaving(true);
    try {
      await api.post('/reports', {
        reportId: `PL-${Date.now()}`,
        documentType: 'PACKING_LIST',
        generalData: {
          proyecto: data.projectName,
          cliente: data.clientName,
          fecha: data.date
        },
        data: data
      });

      // Limpiar borrador al guardar definitivo
      if (currentDraftId) draftsUtils.delete(currentDraftId);

      setMessage({ type: 'success', text: 'Packing List guardado exitosamente en servidor' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.warn('⚠️ Backend no disponible, guardando como borrador local:', error);
      // Fallback: guardar como borrador local
      draftsUtils.save({
        id: currentDraftId || undefined,
        type: 'PACKING_LIST',
        data: data as any,
        metadata: {
          project: data.projectName,
          client: data.clientName,
          date: data.date,
          reportNo: `PL-${Date.now()}`
        }
      });
      setMessage({ type: 'success', text: 'Packing List guardado localmente (backend offline)' });
      setTimeout(() => setMessage(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  // 7. Importar/Exportar Excel
  const handleImportExcel = async (file: File) => {
    try {
      const items = await importPackingListFromExcel(file);
      replace(items);
      setMessage({ type: 'success', text: `Importados ${items.length} ítems correctamente` });
    } catch (error) {
      console.error('Error al importar Excel:', error);
      setMessage({ type: 'error', text: 'Error al procesar el archivo Excel' });
    }
  };

  const handleSaveDraft = () => {
    const value = getValues();
    draftsUtils.save({
      id: currentDraftId || undefined,
      type: 'PACKING_LIST',
      data: value as any,
      metadata: {
        project: value.projectName,
        client: value.clientName,
        date: value.date,
        reportNo: 'LOG-' + (value.date?.replace(/-/g, '') || '')
      }
    });
    setMessage({ type: 'success', text: 'Borrador guardado manualmente' });
    setTimeout(() => setMessage(null), 1500);
  };

  const handleReset = () => {
    if (window.confirm('¿Limpiar formulario y eliminar borrador?')) {
      if (currentDraftId) draftsUtils.delete(currentDraftId);
      reset({
        projectName: '',
        clientName: '',
        date: new Date().toISOString().split('T')[0],
        items: [],
        summary: []
      });
      setCurrentDraftId(null);
    }
  };

  const handleDeleteRow = (index: number) => {
    if (window.confirm('¿Eliminar este ítem del packing list?')) {
      remove(index);
      setMessage({ type: 'error', text: 'Ítem eliminado' });
      setTimeout(() => setMessage(null), 1500);
    }
  };

  return {
    formMethods,
    fields,
    append,
    remove,
    handleDeleteRow,
    loading,
    saving,
    message,
    setMessage,
    handleCategoryChange,
    handlePhotoUpload,
    onSave,
    handleSaveDraft,
    handleImportExcel,
    handleExportExcel: () => exportPackingListToExcel(getValues()),
    handleReset,
    globalLabels,
    summary,
    totalWeight
  };
};
