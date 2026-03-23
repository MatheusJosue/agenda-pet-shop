'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAppointments } from '@/lib/actions/appointments'
import { getDateRange, toISODate, formatPeriodLabel } from '@/lib/utils/date'
import type { AppointmentWithRelations } from '@/lib/types/appointments'
import type { ViewMode } from '@/lib/utils/date'

export interface UseAppointmentsFilterResult {
  appointments: AppointmentWithRelations[]
  loading: boolean
  error: string | null
  periodLabel: string
  refetch: () => Promise<void>
}

export function useAppointmentsFilter(
  viewMode: ViewMode,
  selectedDate: Date
): UseAppointmentsFilterResult {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const dateRange = getDateRange(viewMode, selectedDate)
      const startDate = toISODate(dateRange.start)
      const endDate = toISODate(dateRange.end)

      const result = await getAppointments({
        startDate,
        endDate
      })

      if (result.error) {
        setError(result.error)
        setAppointments([])
      } else {
        setAppointments(result.data || [])
      }
    } catch (err) {
      setError('Erro ao carregar agendamentos')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [viewMode, selectedDate])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const periodLabel = formatPeriodLabel(viewMode, selectedDate)

  return {
    appointments,
    loading,
    error,
    periodLabel,
    refetch: fetchAppointments
  }
}
