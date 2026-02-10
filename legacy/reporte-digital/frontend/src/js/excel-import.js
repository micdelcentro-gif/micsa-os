/**
 * Procesa un archivo Excel de Packing List.
 * Detecta automáticamente la fila de encabezados y mapea las columnas.
 * @param {File} file - El archivo Excel subido.
 * @returns {Promise<Array>} - Promesa que resuelve con un array de objetos de items normalizados.
 */
function parseExcelPackingList(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // 1. Convertir a Array de Arrays para buscar encabezados
                const aoa = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // 2. Buscar índice de la fila de encabezados
                let headerRowIndex = 0;
                // Lista extendida de posibles nombres para identificar la fila de encabezados
                const targetHeaders = ["ITEM", "LINEA", "CODIGO", "CANTIDAD", "DESCRIPCIÓN", "TAG"];

                for (let i = 0; i < Math.min(aoa.length, 20); i++) {
                    const row = aoa[i] || [];
                    const rowText = row.map(cell => String(cell || '').toUpperCase().trim());
                    const foundHeader = rowText.find(cell => targetHeaders.includes(cell));
                    if (foundHeader) {
                        console.log(`Fila de encabezados detectada en índice ${i} gracias a: ${foundHeader}`);
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === 0) {
                    console.warn('No se detectó una fila de encabezados clara. Usando fila 0 por defecto.');
                }

                // 3. Re-leer usando el índice encontrado
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { range: headerRowIndex });
                const parsedItems = [];

                for (const row of jsonData) {
                    // Filtrar filas inválidas o de sección de resumen
                    const values = Object.values(row).map(v => String(v).toUpperCase());
                    if (values.some(v => v.includes('RESUMEN') || v.includes('TOTALES'))) {
                        break;
                    }

                    // Flexibilidad: No requerimos 'ITEM' forzosamente, solo que haya descripción o código
                    const tagVal = row['Código'] || row['CODIGO'] || row['CÓDIGO'] || row['CÓDIGO TAG'] || row['TAG'];
                    const descVal = row['Descripción'] || row['Nombre (C)'] || row['DESCRIPCIÓN DEL EQUIPO / MATERIAL'] || row['DESCRIPCIÓN'];

                    if (!tagVal && !descVal) continue; // Saltar filas realmente vacías

                    // Normalización de Categoría
                    let rawCategory = row['Tipo'] || row['TIPO'] || row['CATEGORÍA'] || row['Categoría'] || '';
                    let cleanCategory = '';

                    // Mapeo manual para corregir errores comunes de escritura
                    if (rawCategory) {
                        const upperCat = rawCategory.toUpperCase();
                        if (upperCat.includes('TUBERIA') || upperCat.includes('TUBERÍA')) cleanCategory = 'Tuberia';
                        else if (upperCat.includes('VALVULA') || upperCat.includes('VÁLVULA')) cleanCategory = 'Válvula';
                        else if (upperCat.includes('CONEXION') || upperCat.includes('CONEXIÓN')) cleanCategory = 'Conexión';
                        else if (upperCat.includes('PRINCIPAL')) cleanCategory = 'Equipo Principal';
                        else if (upperCat.includes('CABLEADO')) cleanCategory = 'Cableado';
                        else if (upperCat.includes('SOPORTE')) cleanCategory = 'Soporte';
                        else if (upperCat.includes('ACCESORIO')) cleanCategory = 'Accesorio';
                        else cleanCategory = rawCategory; // Fallback
                    }

                    // Normalizar datos
                    parsedItems.push({
                        tag: row['Código'] || row['CODIGO'] || row['CÓDIGO'] || row['CÓDIGO TAG'] || row['TAG'] || '',
                        desc: row['Descripción'] || row['Nombre (C)'] || row['DESCRIPCIÓN DEL EQUIPO / MATERIAL'] || row['DESCRIPCIÓN'] || '',
                        qty: row['CANTIDAD'] || row['CANT.'] || 1,
                        serialNumber: row['Número de Serial (C)'] || row['NO. SERIE'] || row['SERIE'] || row['NÚMERO DE SERIE'] || '',
                        weight: row['PESOS APROX'] || row['PESO (KG)'] || row['PESO'] || '',
                        dims: row['DIMENSIONES (L x A x H)'] || row['DIMENSIONES'] || '',
                        condition: row['CONDICIÓN'] || row['CONDICION'] || 'Bueno',
                        obs: row['OBSERVACIONES'] || row['OBS'] || ''
                    });
                }

                resolve(parsedItems);

            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}
