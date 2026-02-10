'use client'

import React from 'react'

import { DeleteRowButton } from '@/components/ui/actions/DeleteRowButton';
import { InputHTMLAttributes, useEffect, useRef } from 'react'

const AutoResizeTextareaCell = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const ref = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const el = ref.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
        adjustHeight()
      }}
      rows={1}
      placeholder={placeholder}
      className="w-full bg-slate-800 border border-slate-600 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-slate-200 placeholder-slate-400 resize-none overflow-hidden min-h-[36px]"
    />
  )
}

interface DynamicTableProps<T> {
  title: string
  columns: {
    key: keyof T
    label: string
    type?: 'text' | 'number' | 'select' | 'time'
    width?: string
    placeholder?: string
    options?: string[]
  }[]
  data: T[]
  onChange: (newData: T[]) => void
  emptyMessage?: string
  onRowDelete?: () => void
}

export default function DynamicTable<T extends { id: string }>({
  title,
  columns,
  data,
  onChange,
  emptyMessage = "No hay registros agregados",
  onRowDelete,
  enableSelection = false
}: DynamicTableProps<T> & { enableSelection?: boolean }) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);

  const toggleSelection = (id: string) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
          newSelected.delete(id);
      } else {
          newSelected.add(id);
      }
      setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
      if (window.confirm(`¿Eliminar ${selectedIds.size} filas seleccionadas?`)) {
          onChange(data.filter(row => !selectedIds.has(row.id)));
          setSelectedIds(new Set());
          setIsSelectionMode(false);
          if (onRowDelete) onRowDelete();
      }
  };


  const handleAddRow = () => {
    // Generate simple ID if crypto is not available to avoid lag
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `row-${Date.now()}`
    
    const newRow = columns.reduce((acc, col) => ({
      ...acc,
      [col.key]: col.type === 'number' ? 0 : 
                 col.type === 'select' && col.options ? col.options[0] : ''
    }), { id } as T)

    // Just update data, don't force heavy validation on add
    onChange([...data, newRow])
  }

  const handleRemoveRow = (id: string) => {
    // Add confirmation to match functionality in Etiquetado/Packing List
    if (window.confirm('¿Eliminar esta fila permanentemente?')) {
        onChange(data.filter(row => row.id !== id))
        if (onRowDelete) onRowDelete();
    }
  }

  const handleCellChange = (id: string, key: keyof T, value: string | number) => {
    onChange(data.map(row => 
      row.id === id ? { ...row, [key]: value } : row
    ))
  }

  return (
    <div className="space-y-4">
      <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-300 uppercase text-xs tracking-wider font-semibold">
              <tr>
                {enableSelection && isSelectionMode && (
                   <th className="px-4 py-3 w-10 text-center">
                       <input 
                          type="checkbox" 
                          className="rounded text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                          checked={selectedIds.size === data.length && data.length > 0}
                          onChange={(e) => {
                              if (e.target.checked) {
                                  setSelectedIds(new Set(data.map(d => d.id)));
                              } else {
                                  setSelectedIds(new Set());
                              }
                          }}
                       />
                   </th>
                )}
                <th className="px-4 py-3 w-12 text-center text-slate-500">#</th>
                {columns.map((col) => (
                  <th key={String(col.key)} className="px-4 py-3" style={{ width: col.width }}>
                    {col.label}
                  </th>
                ))}
                {!isSelectionMode && (
                    <th className="px-4 py-3 w-32 text-center text-slate-400 text-[10px] uppercase tracking-wider">
                        {enableSelection ? (
                            <button 
                                type="button" 
                                onClick={() => setIsSelectionMode(true)}
                                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mx-auto"
                            >
                                Seleccionar
                            </button>
                        ) : "ACCIÓN"}
                    </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (enableSelection && isSelectionMode ? 3 : 2)} className="px-4 py-8 text-center text-slate-500 italic">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id} className={`hover:bg-slate-800/30 transition-colors group relative ${selectedIds.has(row.id) ? 'bg-blue-900/20' : ''}`}>
                    {enableSelection && isSelectionMode && (
                        <td className="px-4 py-3 text-center align-top relative z-20">
                            <input 
                                type="checkbox"
                                checked={selectedIds.has(row.id)}
                                onChange={() => toggleSelection(row.id)}
                                className="rounded text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600 w-4 h-4 cursor-pointer"
                            />
                        </td>
                    )}
                    <td className="px-4 py-3 text-slate-500 font-mono text-center align-top">
                      {index + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={`${row.id}-${String(col.key)}`} className="px-4 py-2 relative align-top">
                        {col.type === 'select' ? (
                          <select
                            value={row[col.key] as string}
                            onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1.5 text-slate-200 [&>option]:bg-slate-800 [&>option]:text-slate-200"
                          >
                            {col.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : col.type === 'time' ? (
                            <input 
                                type="time"
                                value={row[col.key] as string}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Force picker to show on click anywhere in the input
                                  if ('showPicker' in e.currentTarget) {
                                    try {
                                      (e.currentTarget as any).showPicker();
                                    } catch (error) {
                                      // Ignore error if picker is already shown or blocked
                                    }
                                  }
                                }} 
                                onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1.5 text-slate-200 text-center cursor-pointer relative z-20"
                            />
                        ) : col.type === 'number' ? (
                            <input 
                                type="number"
                                value={row[col.key] as string}
                                onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                                placeholder={col.placeholder}
                                className="w-full bg-slate-800 border border-slate-600 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1.5 text-slate-200 placeholder-slate-400"
                            />
                        ) : (
                          <AutoResizeTextareaCell 
                              value={row[col.key] as string}
                              onChange={(val) => handleCellChange(row.id, col.key, val)}
                              placeholder={col.placeholder}
                          />
                        )}
                      </td>
                    ))}
                    {!isSelectionMode && (
                        <td className="px-2 py-2 align-top text-center w-32 relative z-[100]">
                            {!enableSelection && <DeleteRowButton onClick={() => handleRemoveRow(row.id)} />}
                        </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Bulk Action Bar - Overlay when selecting */}
        {enableSelection && isSelectionMode && selectedIds.size > 0 && (
             <div className="absolute top-2 right-2 left-2 bg-blue-600 text-white rounded-lg shadow-lg flex items-center justify-between p-2 px-4 z-[100] animate-in slide-in-from-top-2 fade-in">
                 <span className="font-bold flex items-center gap-2">
                     <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{selectedIds.size}</span>
                     seleccionados
                 </span>
                 <button 
                     type="button"
                     onClick={handleBulkDelete}
                     className="bg-red-500 hover:bg-red-400 text-white px-4 py-1.5 rounded-md font-bold shadow-sm transition-colors flex items-center gap-2"
                 >
                     <DeleteRowButtonIcon /> ELIMINAR
                 </button>
             </div>
        )}
        
        {/* Cancel Selection Mode Button (if mode is active but empty or to exit) */}
        {enableSelection && isSelectionMode && (
            <div className="bg-slate-800/50 p-2 flex justify-end border-b border-slate-700">
                <button 
                    type="button" 
                    onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedIds(new Set());
                    }}
                    className="text-xs text-slate-400 hover:text-white uppercase tracking-wider font-bold px-3 py-1"
                >
                    Cancelar Selección
                </button>
            </div>
        )}

        
        {/* Footer with Add Button matching Packing List style */}
        <div className="p-4 bg-slate-900 border-t border-slate-700/50">
           <button 
                type="button" 
                onClick={(e) => {
                    e.preventDefault();
                    handleAddRow();
                }}
                className="w-full border-2 border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-all rounded-lg py-3 flex items-center justify-center gap-2 font-medium active:scale-[0.99] min-h-[44px]"
            >
                <AddRowButtonIcon />
                Agregar Fila
            </button>
        </div>
      </div>
    </div>
  )
}

// Icon helper to avoid import conflict issues if any
const AddRowButtonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
    </svg>
)

const DeleteRowButtonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
)
