import { useState } from 'react'

export const useLogicaPdf = () => {
    const [printMessage, setPrintMessage] = useState<{type: 'success'|'error', text: string} | null>(null)

    const handlePrint = () => {
        setPrintMessage({ type: 'success', text: 'Preparando PDF para imprimir...' })
        
        // Simular pequeño delay para asegurar renderizado de estilos
        setTimeout(() => {
            window.print()
            setPrintMessage(null)
        }, 500)
    }

    return {
        handlePrint,
        printMessage,
        setPrintMessage
    }
}
