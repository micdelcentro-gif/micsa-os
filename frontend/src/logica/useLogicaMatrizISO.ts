import { useState, useMemo } from 'react';
import { DOCUMENTOS_ISO, ISODocument } from '@/types/iso';

export const useLogicaMatrizISO = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClausula, setFilterClausula] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterArea, setFilterArea] = useState('');

    const filteredDocs = useMemo(() => {
        return DOCUMENTOS_ISO.filter(doc => {
            const matchSearch = !searchTerm || 
                doc.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.requisito.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.clausula.includes(searchTerm);
            
            const matchClausula = !filterClausula || doc.clausula.startsWith(filterClausula);
            const matchTipo = !filterTipo || doc.tipo === filterTipo;
            const matchArea = !filterArea || doc.area === filterArea;

            return matchSearch && matchClausula && matchTipo && matchArea;
        });
    }, [searchTerm, filterClausula, filterTipo, filterArea]);

    const stats = useMemo(() => {
        return {
            total: DOCUMENTOS_ISO.length,
            visible: filteredDocs.length,
            byType: {
                politicas: DOCUMENTOS_ISO.filter(d => d.tipo === 'Política').length,
                manuales: DOCUMENTOS_ISO.filter(d => d.tipo === 'Manual').length,
                procedimientos: DOCUMENTOS_ISO.filter(d => d.tipo === 'Procedimiento').length,
                registros: DOCUMENTOS_ISO.filter(d => d.tipo === 'Registro').length,
                formatos: DOCUMENTOS_ISO.filter(d => d.tipo === 'Formato').length,
                instructivos: DOCUMENTOS_ISO.filter(d => d.tipo === 'Instructivo').length,
                programas: DOCUMENTOS_ISO.filter(d => d.tipo === 'Programa').length,
            }
        };
    }, [filteredDocs]);

    return {
        documents: filteredDocs,
        stats,
        filters: {
            searchTerm,
            setSearchTerm,
            filterClausula,
            setFilterClausula,
            filterTipo,
            setFilterTipo,
            filterArea,
            setFilterArea
        }
    };
};
