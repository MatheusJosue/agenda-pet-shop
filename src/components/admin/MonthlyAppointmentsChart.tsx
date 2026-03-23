import type { MonthlyAppointment } from '@/lib/types/admin'

interface MonthlyAppointmentsChartProps {
  data: MonthlyAppointment[]
}

export function MonthlyAppointmentsChart({ data }: MonthlyAppointmentsChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-2 h-48 w-full">
      {data.map((item) => {
        const height = item.count === 0 ? 4 : (item.count / maxCount) * 100
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center group">
            <div
              className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-t-lg transition-all group-hover:opacity-80 min-h-[4px]"
              style={{ height: `${height}%` }}
            />
            <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 capitalize">{item.month}</span>
          </div>
        )
      })}
    </div>
  )
}
