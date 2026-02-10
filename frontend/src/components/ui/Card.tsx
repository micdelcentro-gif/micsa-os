import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient'
  hover?: boolean
}

export default function Card({ 
  variant = 'default',
  hover = false,
  className, 
  children, 
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-300',
        {
          'bg-slate-800/50 border-slate-700': variant === 'default',
          'bg-white/5 backdrop-blur-lg border-white/10': variant === 'glass',
          'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700': variant === 'gradient',
        },
        hover && 'hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/50 hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}
