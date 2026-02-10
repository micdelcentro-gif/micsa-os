'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

export default function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  }

  return (
    <Card
      variant="glass"
      hover
      className={cn(
        'p-6 transform transition-all duration-500',
        'bg-gradient-to-br',
        colorClasses[color],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-white mb-2">
            {value}
          </p>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            )}>
              <svg 
                className={cn('w-4 h-4', trend.isPositive ? '' : 'rotate-180')} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {trend.value}%
            </div>
          )}
        </div>
        <div className="text-4xl opacity-80">
          {icon}
        </div>
      </div>
    </Card>
  )
}
