import React from 'react';

interface DesktopViewProps {
    children: React.ReactNode;
    className?: string;
    breakpoint?: 'md' | 'lg' | 'xl';
}

/**
 * Muestra su contenido solo en pantallas de escritorio (lg/xl).
 * Oculto en dispositivos móviles.
 */
export const DesktopView: React.FC<DesktopViewProps> = ({ 
    children, 
    className = '', 
    breakpoint = 'lg' 
}) => {
    // Mapa de breakpoints de Tailwind
    const displayClass = breakpoint === 'md' ? 'hidden md:block' : 
                        breakpoint === 'xl' ? 'hidden xl:block' : 
                        'hidden lg:block';

    return (
        <div className={`${displayClass} ${className}`}>
            {children}
        </div>
    );
};
