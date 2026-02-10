/**
 * Genera y descarga el archivo Excel de Packing List.
 * Recibe los datos ya estructurados y se encarga del formato y la escritura del archivo.
 * @param {Object} meta - Metadatos del proyecto { proyecto, cliente, fecha, totalPeso }
 * @param {Array} items - Array de objetos con la data de los ítems
 * @param {Array} summary - Array de objetos con la data del resumen
 */
function generateExcelPackingList(meta, items, summary) {
    if (!activeXLSX()) return;

    // --- Estilos ---
    const styles = {
        title: {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1F4E78" } }, // Azul oscuro
            alignment: { horizontal: "center", vertical: "center" }
        },
        subtitle: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } }, // Azul más claro
            alignment: { horizontal: "center", vertical: "center" }
        },
        header: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2F75B5" } }, // Azul medio
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { auto: 1 } },
                bottom: { style: "thin", color: { auto: 1 } },
                left: { style: "thin", color: { auto: 1 } },
                right: { style: "thin", color: { auto: 1 } }
            }
        },
        summaryHeader: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "808080" } }, // Gris
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { auto: 1 } },
                bottom: { style: "thin", color: { auto: 1 } },
                left: { style: "thin", color: { auto: 1 } },
                right: { style: "thin", color: { auto: 1 } }
            }
        },
        cell: {
            border: {
                top: { style: "thin", color: { auto: 1 } },     // Changed to black/auto
                bottom: { style: "thin", color: { auto: 1 } },
                left: { style: "thin", color: { auto: 1 } },
                right: { style: "thin", color: { auto: 1 } }
            },
            alignment: { vertical: "center" }
        },
        centered: {
            alignment: { horizontal: "center", vertical: "center" }
        },
        totalSummary: {
            font: { bold: true },
            fill: { fgColor: { rgb: "FFC000" } }, // Naranja
            border: {
                top: { style: "thin", color: { auto: 1 } },
                bottom: { style: "thin", color: { auto: 1 } },
                left: { style: "thin", color: { auto: 1 } },
                right: { style: "thin", color: { auto: 1 } }
            }
        }
    };

    // 1. Construir Data
    const data = [];

    // Título
    data.push([
        { v: "PACKING LIST / LISTA DE EMBALAJE", s: styles.title }
    ]);

    // Subtítulo (Metadata)
    data.push([
        { v: `CLIENTE: ${meta.cliente} | ORIGEN: ${meta.origen || ''} | DESTINO: ${meta.destino || ''} | PROYECTO: ${meta.proyecto} | O.T: ${meta.ordenTrabajo || ''} | FOLIO: ${meta.folio || ''}`, s: styles.subtitle }
    ]);

    data.push([]); // Espacio

    // Encabezados
    const headers = [
        "CODIGO", "DESCRIPCIÓN DEL EQUIPO / MATERIAL", "CANTIDAD", "NO. SERIE",
        "PESO (KG)", "DIMENSIONES (L x A x H)", "CONDICIÓN", "OBSERVACIONES"
    ];

    const headerRow = headers.map(h => ({ v: h, s: styles.header }));
    data.push(headerRow);

    // Datos Items
    items.forEach(item => {
        const row = [
            { v: item.tag, s: styles.cell },
            { v: item.desc, s: styles.cell },
            { v: item.qty, t: 'n', s: { ...styles.cell, ...styles.centered } },
            { v: item.serialNumber || '', s: styles.cell },
            { v: item.weight, t: 'n', s: styles.cell },
            { v: item.dims, s: styles.cell },
            { v: item.condition, s: styles.cell },
            { v: item.obs, s: styles.cell }
        ];
        data.push(row);
    });

    // Pie de página de Pesos
    data.push([
        { v: "", s: {} },
        { v: "", s: {} },
        { v: "TOTAL PESO (KG)", s: { font: { bold: true }, alignment: { horizontal: "right" } } },
        { v: meta.totalPeso, t: 'n', s: styles.totalSummary },
        { v: "", s: {} },
        { v: "", s: {} },
        { v: "", s: {} },
        { v: "", s: {} }
    ]);

    // 2. Crear Workbook
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Merges
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Título
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }  // Metadata
    ];

    // Anchos de Columna
    worksheet['!cols'] = [
        { wch: 15 }, // Codigo
        { wch: 50 }, // Descripcion
        { wch: 10 }, // Cantidad
        { wch: 20 }, // Serie
        { wch: 12 }, // Peso
        { wch: 25 }, // Dimensiones
        { wch: 12 }, // Condicion
        { wch: 40 }  // Observaciones
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Packing List");

    // 3. Descargar
    const safeProject = (meta.proyecto || 'MICSA').replace(/[^a-zA-Z0-9\-_]/g, '_');
    const fileName = `Packing_List_${safeProject}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

function activeXLSX() {
    if (typeof XLSX === 'undefined') {
        alert('Error: La librería SheetJS (XLSX) no está cargada. Recarga la página.');
        return false;
    }
    return true;
}
