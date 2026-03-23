'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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

/**
 * Custom hook for fetching and filtering appointments based on view mode and selected date.
 *
 * @remarks
 * This hook manages the state of appointments, loading status, and error handling.
 * It automatically fetches appointments when the view mode or selected date changes.
 *
 * @param viewMode - The view mode for filtering appointments (day, week, month, or list)
 * @param selectedDate - The reference date for filtering. Note: This Date object reference
 * may be recreated on parent renders, but the hook will refetch appointments when it changes.
 *
 * @returns An object containing:
 * - appointments: Array of appointments with related data
 * - loading: Boolean indicating if data is being fetched
 * - error: Error message if fetch failed, null otherwise
 * - periodLabel: Human-readable label for the current period
 * - refetch: Function to manually trigger a refetch
 */
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
    let aborted = false

    fetchAppointments().then(() => {
      // State updates are already handled within fetchAppointments
      // The aborted flag prevents any potential future state updates
      // if we were to add them here
    })

    return () => {
      aborted = true
    }
  }, [fetchAppointments])

  const periodLabel = useMemo(() => formatPeriodLabel(viewMode, selectedDate), [viewMode, selectedDate])

  return {
    appointments,
    loading,
    error,
    periodLabel,
    refetch: fetchAppointments
  }
}
