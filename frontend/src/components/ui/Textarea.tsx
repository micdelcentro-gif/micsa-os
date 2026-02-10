import React, { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, value, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null)

    // Función para manejar ambos tipos de refs (callback y objeto)
    const setRefs = (element: HTMLTextAreaElement | null) => {
      (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
      }
    };

    const adjustHeight = () => {
      const el = internalRef.current
      if (el) {
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }
    }

    React.useEffect(() => {
      adjustHeight()
    }, [value])

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight()
      props.onInput?.(e)
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={setRefs}
            onInput={handleInput}
            value={value}
            className={cn(
              'w-full px-4 py-2 bg-slate-800/50 border border-slate-700',
              'rounded-lg text-white placeholder-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-all duration-200',
              'hover:border-slate-600',
              'min-h-[80px] resize-none overflow-hidden',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </span>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
