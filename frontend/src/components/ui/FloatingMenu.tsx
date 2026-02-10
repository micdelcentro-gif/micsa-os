'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface FabAction {
    label: string;
    icon: string;
    onClick?: () => void;
    href?: string;
    color?: string; // Tailwind color class e.g. 'bg-blue-500'
}

interface FloatingMenuProps {
    actions?: FabAction[];
    mainIcon?: string; // Default: '+'
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ 
    actions = [], 
    mainIcon = '+' 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleMainClick = () => {
        setIsOpen(!isOpen);
    };

    const handleActionClick = (action: FabAction) => {
        if (action.href) {
            router.push(action.href);
        } else if (action.onClick) {
            action.onClick();
        }
        setIsOpen(false);
    };

    // Acciones por defecto si no se pasan (Menú de Navegación Rápida)
    const defaultActions: FabAction[] = [
        { label: 'Dashboard', icon: '🏠', href: '/' },
        { label: 'Reporte Diario', icon: '📋', href: '/reporte-diario' },
        { label: 'Packing List', icon: '📦', href: '/packing-list' },
        { label: 'Códigos', icon: '🏷️', href: '/etiquetado' }
    ];

    const menuActions = actions.length > 0 ? actions : defaultActions;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Opciones del Menú */}
            <div className={`transition-all duration-300 flex flex-col gap-3 items-end ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                {menuActions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => handleActionClick(action)}
                        className="flex items-center gap-3 bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-full shadow-lg hover:bg-slate-700 transition-transform hover:scale-105 active:scale-95"
                    >
                        <span className="text-sm font-medium">{action.label}</span>
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50 ${action.color || ''}`}>
                            {action.icon}
                        </span>
                    </button>
                ))}
            </div>

            {/* Botón Principal (FAB) */}
            <button
                onClick={handleMainClick}
                className={`w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xl flex items-center justify-center text-3xl transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'} hover:scale-110 active:scale-95`}
                aria-label="Menu Flotante"
            >
                {mainIcon}
            </button>
        </div>
    );
};
