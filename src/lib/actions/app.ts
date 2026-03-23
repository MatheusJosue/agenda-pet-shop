'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface AppStats {
  todayCount: number
  clientsCount: number
  servicesCount: number
  monthlyRevenue: number
  todayAppointments: any[]
  user: any
  companyName: string
}

export async function getAppStats(): Promise<{ data?: AppStats; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'Not authenticated' }
    }

    const today = new Date().toISOString().split('T')[0]

    // Get first and last day of current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    // Fetch stats and data in parallel
    const [
      { count: clients },
      { count: services },
      { count: todayCount },
      { data: todayAppointments },
      { data: monthlyAppointments },
      { data: company }
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('services').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'scheduled'),
      supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          price,
          status,
          client:clients(id, name),
          pet:pets(id, name, size),
          service:services(id, name)
        `)
        .eq('date', today)
        .in('status', ['scheduled', 'completed'])
        .order('time', { ascending: true }),
      supabase
        .from('appointments')
        .select('price')
        .gte('date', firstDay)
        .lte('date', lastDay)
        .in('status', ['completed', 'scheduled']),
      supabase
        .from('companies')
        .select('name')
        .eq('id', user?.user_metadata?.company_id)
        .single()
    ])

    // Calculate monthly revenue
    const monthlyRevenue = monthlyAppointments?.reduce((sum, apt) => sum + (apt.price || 0), 0) || 0
    const companyName = company?.name || 'Agenda Pet Shop'

    return {
      data: {
        todayCount: todayCount || 0,
        clientsCount: clients || 0,
        servicesCount: services || 0,
        monthlyRevenue,
        todayAppointments: todayAppointments || [],
        user,
        companyName,
      }
    }
  } catch (error) {
    console.error('Error loading app stats:', error)
    return { error: 'Failed to load stats' }
  }
}
