export type ViewMode = 'day' | 'week' | 'month'

export interface DateRange {
  start: Date
  end: Date
}

/**
 * Get the date range for a single day
 */
export function getDayRange(date: Date): DateRange {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Get the date range for a week (Sunday to Saturday)
 */
export function getWeekRange(date: Date): DateRange {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day

  const start = new Date(d)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(d)
  end.setDate(diff + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Get the date range for a month
 */
export function getMonthRange(date: Date): DateRange {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

  return { start, end }
}

/**
 * Get date range based on view mode
 */
export function getDateRange(viewMode: ViewMode, date: Date): DateRange {
  switch (viewMode) {
    case 'day':
      return getDayRange(date)
    case 'week':
      return getWeekRange(date)
    case 'month':
      return getMonthRange(date)
    default:
      const _exhaustiveCheck: never = viewMode
      return _exhaustiveCheck
  }
}

/**
 * Navigate to previous or next period
 */
export function navigateDate(date: Date, viewMode: ViewMode, direction: -1 | 1): Date {
  const newDate = new Date(date)

  switch (viewMode) {
    case 'day':
      newDate.setDate(newDate.getDate() + direction)
      break
    case 'week':
      newDate.setDate(newDate.getDate() + direction * 7)
      break
    case 'month':
      newDate.setMonth(newDate.getMonth() + direction)
      break
    default:
      const _exhaustiveCheck: never = viewMode
      return _exhaustiveCheck
  }

  return newDate
}

/**
 * Format date for display based on view mode
 */
export function formatPeriodLabel(viewMode: ViewMode, date: Date): string {
  switch (viewMode) {
    case 'day': {
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
      return date.toLocaleDateString('pt-BR', options)
    }

    case 'week': {
      const { start, end } = getWeekRange(date)
      const startDay = start.getDate()
      const endDay = end.getDate()
      const month = start.toLocaleDateString('pt-BR', { month: 'short' })
      return `${startDay}-${endDay} ${month}`
    }

    case 'month':
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    default:
      const _exhaustiveCheck: never = viewMode
      return _exhaustiveCheck
  }
}

/**
 * Format date to ISO string (YYYY-MM-DD) for API
 */
export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
