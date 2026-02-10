import React from 'react';

interface MobileViewProps {
    children: React.ReactNode;
    className?: string;
    breakpoint?: 'md' | 'lg' | 'xl';
}

/**
 * Muestra su contenido solo en dispositivos móviles.
 * Oculto en pantallas de escritorio.
 */
export const MobileView: React.FC<MobileViewProps> = ({ 
    children, 
    className = '', 
    breakpoint = 'lg' 
}) => {
    // Mapa de breakpoints de Tailwind (inverso a DesktopView)
    const displayClass = breakpoint === 'md' ? 'md:hidden' : 
                        breakpoint === 'xl' ? 'xl:hidden' : 
                        'lg:hidden';

    return (
        <div className={`${displayClass} ${className}`}>
            {children}
        </div>
    );
};
