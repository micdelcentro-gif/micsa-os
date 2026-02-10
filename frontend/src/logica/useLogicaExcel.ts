import { useState } from 'react'

export const useLogicaExcel = () => {
    const [exporting, setExporting] = useState(false)

    const handleExportExcel = async () => {
        setExporting(true)
        console.log("Generando Excel...")
        // Simulación de exportación
        await new Promise(resolve => setTimeout(resolve, 1000))
        setExporting(false)
        alert("Funcionalidad de Excel simulada exitosamente")
    }

    return {
        handleExportExcel,
        exporting
    }
}
