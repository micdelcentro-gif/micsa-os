import XLSX from 'xlsx-js-style';

/**
 * Normaliza la categoría detectada en el Excel.
 */
const normalizeCategory = (rawCategory: string): string => {
    if (!rawCategory) return '';
    const upperCat = rawCategory.toUpperCase().trim();
    if (upperCat.includes('TUBERIA') || upperCat.includes('TUBERÍA')) return 'Tubería';
    if (upperCat.includes('VALVULA') || upperCat.includes('VÁLVULA')) return 'Válvula';
    if (upperCat.includes('CONEXION') || upperCat.includes('CONEXIÓN')) return 'Conexión';
    if (upperCat.includes('PRINCIPAL')) return 'Equipo Principal';
    if (upperCat.includes('CABLEADO')) return 'Cableado';
    if (upperCat.includes('SOPORTE')) return 'Soporte';
    if (upperCat.includes('ACCESORIO')) return 'Accesorio';
    return rawCategory;
};

/**
 * Limpia un string de unidades (kg, m, etc) y lo convierte a número.
 */
const cleanNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Eliminar todo lo que no sea número o punto, pero conservar el valor numérico
    const cleaned = String(val).replace(/[^-0-9.]/g, '');
    return parseFloat(cleaned) || 0;
};

/**
 * Importa datos desde un archivo Excel de Packing List.
 * Basado fielmente en la lógica legada para asegurar compatibilidad total.
 */
export const importPackingListFromExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // 1. Convertir a Array de Arrays para buscar la cabecera "ITEM"
                const aoa = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
                let headerRowIndex = 0;
                
                for (let i = 0; i < aoa.length; i++) {
                    const firstCell = aoa[i][0];
                    if (firstCell && String(firstCell).toUpperCase().trim() === "ITEM") {
                        headerRowIndex = i;
                        break;
                    }
                }

                // 2. Leer datos desde la cabecera encontrada
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { range: headerRowIndex }) as any[];
                const parsedItems = [];
                
                for (const row of jsonData) {
                    // Stop si es sección de resumen
                    const values = Object.values(row).map(v => String(v).toUpperCase());
                    if (values.some(v => v.includes('RESUMEN') || v.includes('TOTALES'))) {
                        break;
                    }

                    const itemVal = row['ITEM'];
                    if (itemVal === undefined || itemVal === null || itemVal === '') continue;

                    // Normalización de Categoría (Lógica Legada Exacta)
                    let rawCategory = row['CATEGORÍA'] || row['Categoría'] || '';
                    let cleanCategory = '';
                    if (rawCategory) {
                        const upperCat = rawCategory.toUpperCase();
                        if (upperCat.includes('TUBERIA') || upperCat.includes('TUBERÍA')) cleanCategory = 'Tubería';
                        else if (upperCat.includes('VALVULA') || upperCat.includes('VÁLVULA')) cleanCategory = 'Válvula';
                        else if (upperCat.includes('CONEXION') || upperCat.includes('CONEXIÓN')) cleanCategory = 'Conexión';
                        else if (upperCat.includes('PRINCIPAL')) cleanCategory = 'Equipo Principal';
                        else if (upperCat.includes('CABLEADO')) cleanCategory = 'Cableado';
                        else if (upperCat.includes('SOPORTE')) cleanCategory = 'Soporte';
                        else if (upperCat.includes('ACCESORIO')) cleanCategory = 'Accesorio';
                        else cleanCategory = rawCategory;
                    }

                    parsedItems.push({
                        qty: cleanNumber(row['CANTIDAD'] || row['CANT.'] || row['Cant.'] || 1),
                        tag: String(row['CÓDIGO TAG'] || row['TAG'] || row['Código Tag'] || ''),
                        description: String(row['DESCRIPCIÓN EQUIPO'] || row['DESCRIPCIÓN'] || row['Descripción'] || ''),
                        location: String(row['UBICACIÓN ORIGINAL'] || row['UBICACIÓN'] || row['Ubicación'] || ''),
                        category: cleanCategory,
                        weight: cleanNumber(row['PESO UNIT. (kg)'] || row['PESO (kg)'] || row['Peso'] || 0),
                        dimensions: String(row['DIMENSIONES (m)'] || row['DIMENSIONES'] || ''),
                        condition: String(row['CONDICIÓN'] || row['Condición'] || 'Nuevo'),
                        connections: String(row['CONEXIONES'] || row['Conexiones'] || ''),
                        dateTag: String(row['FECHA TAG'] || row['Fecha Tag'] || ''),
                        inspector: String(row['INSPECTOR'] || row['Inspector'] || ''),
                        serialNumber: String(row['NÚMERO DE SERIE'] || row['Número de Serie'] || ''),
                        observations: String(row['OBSERVACIONES'] || row['Observaciones'] || ''),
                        photo: ""
                    });
                }
                
                resolve(parsedItems);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Exporta el Packing List a Excel con el formato exacto del código legado.
 */
export const exportPackingListToExcel = (data: any) => {
  const { projectName, clientName, date, items, summary } = data;

  const styles = {
    title: { font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1F4E78" } }, alignment: { horizontal: "center", vertical: "center" } },
    subtitle: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4472C4" } }, alignment: { horizontal: "center", vertical: "center" } },
    header: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2F75B5" } }, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } },
    summaryHeader: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "808080" } }, alignment: { horizontal: "center", vertical: "center" } },
    cell: { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }, alignment: { vertical: "center" } },
    centered: { alignment: { horizontal: "center", vertical: "center" } },
    totalSummary: { font: { bold: true }, fill: { fgColor: { rgb: "FFC000" } } }
  };

  const excelData: any[] = [];

  // Título
  // Merges covers up to col 15 now (ITEM to FOTO REF is 16 cols total: 0-15)
  // Updated merge range below
  excelData.push([{ v: "PACKING LIST - LISTA DE EMPAQUE", s: styles.title }]);
  
  // Info
  excelData.push([{ v: `Proyecto: ${projectName || '[PROYECTO]'} | Cliente: ${clientName || '[CLIENTE]'} | Fecha: ${date}`, s: styles.subtitle }]);
  
  excelData.push([]);

  // Encabezados
  const headers = [
    "ITEM", "CANT.", "CÓDIGO TAG", "DESCRIPCIÓN EQUIPO", "UBICACIÓN ORIGINAL",
    "CATEGORÍA", "COLOR", "PESO UNIT. (kg)", "DIMENSIONES (m)", "CONEXIONES",
    "CONDICIÓN", "FECHA TAG", "INSPECTOR", "NÚMERO DE SERIE", "OBSERVACIONES", "FOTO REF."
  ];
  excelData.push(headers.map(h => ({ v: h, s: styles.header })));

  // Helper para convertir Hex a RGB (Texto)
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : hex;
  };

  // Items
  items.forEach((item: any, index: number) => {
    // Fix lint: Explicitly type as any to allow adding 'fill' property
    let colorStyle: any = { ...styles.cell, ...styles.centered };
    let colorText = item.colorTag || '';

    if (item.colorTag && item.colorTag.startsWith('#')) {
        const hex = item.colorTag.replace('#', '');
        // Usar formato RGB para el texto visible según solicitud
        colorText = hexToRgb(item.colorTag);
        
        // El background sigue usando Hex para xlsx-js-style
        colorStyle = { 
            ...styles.cell, 
            ...styles.centered,
            fill: { fgColor: { rgb: hex.toUpperCase() } } 
        };
    }

    excelData.push([
      { v: index + 1, s: { ...styles.cell, ...styles.centered } },
      { v: Number(item.qty) || 1, s: { ...styles.cell, ...styles.centered } },
      { v: item.tag || '', s: styles.cell },
      { v: item.description || '', s: styles.cell },
      { v: item.location || '', s: styles.cell },
      { v: item.category || '', s: styles.cell },
      { v: colorText, s: colorStyle }, // Texto RGB + Background Color
      { v: Number(item.weight) || 0, s: styles.cell },
      { v: item.dimensions || '', s: styles.cell },
      { v: item.connections || '', s: styles.cell },
      { v: item.condition || '', s: styles.cell },
      { v: item.dateTag || '', s: styles.cell },
      { v: item.inspector || '', s: styles.cell },
      { v: item.serialNumber || '', s: styles.cell },
      { v: item.observations || '', s: styles.cell },
      { v: item.photo ? 'Imagen Adjunta' : '', s: styles.cell }
    ]);
  });

  excelData.push([]);
  excelData.push([]);
  excelData.push([{ v: "RESUMEN POR CATEGORÍA", s: { font: { bold: true, sz: 12 } } }]);
  
  const summaryHeaders = ["CATEGORÍA", "CANTIDAD", "PESO TOTAL (kg)", "% DEL TOTAL", "OBSERVACIONES"];
  excelData.push(summaryHeaders.map(h => ({ v: h, s: styles.summaryHeader })));

  let sumCount = 0;
  let sumWeight = 0;
  summary.forEach((s: any) => {
    const count = Number(s.count) || 0;
    const weight = Number(s.weight) || 0;
    sumCount += count;
    sumWeight += weight;
    excelData.push([
      { v: s.category, s: styles.cell },
      { v: count, s: { ...styles.cell, ...styles.centered } },
      { v: weight, s: styles.cell },
      { v: s.percentage, s: { ...styles.cell, ...styles.centered } },
      { v: s.observations || '', s: styles.cell }
    ]);
  });

  excelData.push([
    { v: "TOTALES", s: styles.totalSummary },
    { v: sumCount, s: { ...styles.totalSummary, ...styles.centered } },
    { v: sumWeight.toFixed(2), s: styles.totalSummary },
    { v: "100%", s: { ...styles.totalSummary, ...styles.centered } },
    { v: "", s: styles.totalSummary }
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  
  // Merges y Cols exactos del legado
  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 15 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 15 } }];
  worksheet['!cols'] = [
    { wch: 6 }, { wch: 6 }, { wch: 15 }, { wch: 40 }, { wch: 25 }, 
    { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, 
    { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 40 }, { wch: 15 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Packing List");
  XLSX.writeFile(workbook, `Packing_List_${(projectName || 'MICSA').replace(/[^a-zA-Z0-9\-_]/g, '_')}.xlsx`);
};
