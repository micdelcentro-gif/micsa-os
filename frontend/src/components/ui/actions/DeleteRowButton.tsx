import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteRowButtonProps {
    onClick: (e: React.MouseEvent) => void;
    title?: string;
}

export const DeleteRowButton: React.FC<DeleteRowButtonProps> = ({ onClick, title = "Eliminar esta fila" }) => {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation(); // Critical fix for click events
                e.preventDefault();
                onClick(e);
            }}
            className="relative z-50 cursor-pointer w-full min-h-[42px] bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white transition-all rounded-lg flex items-center justify-center gap-2 mx-auto shadow-sm border border-transparent hover:border-red-400 group-hover:scale-[1.02] active:scale-95 px-3 font-semibold text-xs tracking-wider uppercase"
            title={title}
        >
            <Trash2 className="w-4 h-4" />
            ELIMINAR
        </button>
    );
};
