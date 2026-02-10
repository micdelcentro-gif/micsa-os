import React from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AddRowButtonProps {
    onClick: () => void;
    label?: string;
}

export const AddRowButton: React.FC<AddRowButtonProps> = ({ onClick, label = "AGREGAR FILA" }) => {
    return (
        <Button 
            onClick={(e) => {
                e.preventDefault(); // Prevent unintentional submits
                onClick();
            }} 
            size="sm" 
            variant="secondary" 
            type="button"
            className="active:scale-95 transition-transform hover:bg-slate-600 font-semibold"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          {label}
        </Button>
    );
};
