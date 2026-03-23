import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: number; isPositive: boolean }
  color?: 'purple' | 'pink' | 'green' | 'blue' | 'orange'
}

const colorStyles = {
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-purple-500/20',
  pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30 shadow-pink-500/20',
  green: 'bg-green-500/20 text-green-300 border-green-500/30 shadow-green-500/20',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-blue-500/20',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30 shadow-orange-500/20',
}

export function MetricCard({ icon: Icon, label, value, trend, color = 'purple' }: MetricCardProps) {
  return (
    <div className={cn(
      'p-6 rounded-2xl border backdrop-blur-sm transition-all hover:scale-105',
      colorStyles[color]
    )}>
      <div className="flex items-start justify-between mb-4">
        <Icon size={24} />
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend.isPositive ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/70">{label}</div>
    </div>
  )
}
