import type { MonthlyAppointment } from '@/lib/types/admin'

interface MonthlyAppointmentsChartProps {
  data: MonthlyAppointment[]
}

export function MonthlyAppointmentsChart({ data }: MonthlyAppointmentsChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex h-56 w-full items-end gap-3 rounded-2xl bg-white/55 p-4">
      {data.map((item) => {
        const height = item.count === 0 ? 3 : Math.max((item.count / maxCount) * 100, 12)
        return (
          <div key={item.month} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-extrabold text-[#21363a] opacity-0 transition-opacity group-hover:opacity-100">
              {item.count}
            </span>
            <div className="flex h-[78%] w-full items-end">
              <div
                className="min-h-[4px] w-full rounded-t-xl bg-gradient-to-t from-[#e8327b] to-[#006c73] transition-all group-hover:opacity-85"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-xs font-bold capitalize text-[#68797d]">{item.month}</span>
          </div>
        )
      })}
    </div>
  )
}
