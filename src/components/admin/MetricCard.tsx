import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  description?: string
  trend?: { value: number; isPositive: boolean }
  color?: 'pink' | 'teal' | 'green' | 'blue' | 'orange'
}

const colorStyles = {
  pink: 'bg-[#ffe0ec] text-[#bf185d]',
  teal: 'bg-[#dff7f4] text-[#006c73]',
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-sky-50 text-sky-700',
  orange: 'bg-amber-50 text-amber-700',
}

export function MetricCard({ icon: Icon, label, value, description, trend, color = 'pink' }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/78 p-5 shadow-[0_10px_26px_rgba(33,54,58,0.07)] backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", colorStyles[color])}>
          <Icon size={21} />
        </span>
        {trend && (
          <span className={cn(
            'rounded-full px-2 py-1 text-xs font-extrabold',
            trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="mb-1 text-2xl font-extrabold text-[#21363a]">{value}</div>
      <div className="text-sm font-bold text-[#006c73]">{label}</div>
      {description && (
        <div className="mt-2 text-xs font-semibold text-[#68797d]">{description}</div>
      )}
    </div>
  )
}
