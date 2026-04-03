'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface AppStats {
  todayCount: number
  clientsCount: number
  servicesCount: number
  monthlyRevenue: number
  todayAppointments: any[]
  user: {
    id: string
    email?: string
    user_metadata?: { name?: string; [key: string]: any }
  } | null
  companyName: string
}

export async function getAppStats(): Promise<{ data?: AppStats; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
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
      { data: userData }
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('service_prices').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'scheduled'),
      supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          price,
          total_price,
          status,
          client:clients(id, name),
          pet:pets(id, name, size)
        `)
        .eq('date', today)
        .in('status', ['scheduled', 'completed'])
        .order('time', { ascending: true }),
      supabase
        .from('appointments')
        .select('price, total_price')
        .gte('date', firstDay)
        .lte('date', lastDay)
        .in('status', ['completed', 'scheduled']),
      supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()
    ])

    // Fetch company name separately
    let companyName = 'Agenda Pet Shop'
    if (userData?.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('name')
        .eq('id', userData.company_id)
        .single()
      companyName = companyData?.name || 'Agenda Pet Shop'
    }

    // Calculate monthly revenue (use total_price if available, otherwise price)
    const monthlyRevenue = monthlyAppointments?.reduce((sum, apt) => sum + (apt.total_price || apt.price || 0), 0) || 0

    return {
      data: {
        todayCount: todayCount || 0,
        clientsCount: clients || 0,
        servicesCount: services || 0,
        monthlyRevenue,
        todayAppointments: todayAppointments || [],
        user: user ? {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata
        } : null,
        companyName,
      }
    }
  } catch (error) {
    return { error: 'Failed to load stats' }
  }
}
