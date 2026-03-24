'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AdminActionResponse, AdminDashboardStats, CompanyWithMetrics, CompanyMetrics, MonthlyAppointment } from '@/lib/types/admin'
import { updateCompanySchema } from '@/lib/validation/admin'

/**
 * Get dashboard statistics for admin overview
 * Returns company count, total revenue, active companies, client count, and monthly appointment chart data
 */
export async function getAdminDashboardStats(): Promise<AdminActionResponse<AdminDashboardStats>> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [companiesResult, activeCompaniesResult, clientsResult] = await Promise.all([
      supabaseAdmin.from('companies').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('companies').select('id', { count: 'exact', head: true }).eq('active', true),
      supabaseAdmin.from('clients').select('id', { count: 'exact', head: true })
    ])

    const companiesCount = companiesResult.count || 0
    const activeCompanies = activeCompaniesResult.count || 0
    // Revenue = active companies × R$ 50 per month
    const revenue = activeCompanies * 50
    const clientsCount = clientsResult.count || 0

    return {
      data: {
        companiesCount,
        revenue,
        activeCompanies,
        clientsCount,
        monthlyAppointments: await getMonthlyAppointments()
      }
    }
  } catch (error) {
    console.error('Error loading admin stats:', error)
    return { error: 'Erro ao carregar métricas do dashboard' }
  }
}

/**
 * Get monthly appointment counts for the last 6 months
 * Used for dashboard chart visualization
 */
async function getMonthlyAppointments(): Promise<MonthlyAppointment[]> {
  const months: MonthlyAppointment[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const { count } = await supabaseAdmin
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .gte('date', monthStart)
      .lte('date', monthEnd)

    months.push({
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      count: count || 0
    })
  }

  return months
}

/**
 * Get all companies with optional search filter
 * Searches by name or email
 */
export async function getAllCompanies(filters?: { search?: string }): Promise<AdminActionResponse<CompanyWithMetrics[]>> {
  try {
    let query = supabaseAdmin
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return { data: data as CompanyWithMetrics[] }
  } catch (error) {
    console.error('Error loading companies:', error)
    return { error: 'Erro ao carregar empresas' }
  }
}

/**
 * Get a single company by ID
 * Returns full company details
 */
export async function getCompanyById(id: string): Promise<AdminActionResponse<CompanyWithMetrics>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: data as CompanyWithMetrics }
  } catch (error) {
    console.error('Error loading company:', error)
    return { error: 'Erro ao carregar empresa' }
  }
}

/**
 * Update company name and email
 * Validates input before updating
 */
export async function updateCompany(id: string, formData: FormData): Promise<AdminActionResponse<CompanyWithMetrics>> {
  try {
    const validatedFields = updateCompanySchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email')
    })

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0]?.message || 'Dados inválidos' }
    }

    const { data, error } = await supabaseAdmin
      .from('companies')
      .update(validatedFields.data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/empresas')
    revalidatePath('/admin/empresas/[id]')

    return { data: data as CompanyWithMetrics }
  } catch (error) {
    console.error('Error updating company:', error)
    return { error: 'Erro ao atualizar empresa' }
  }
}

/**
 * Toggle company active status
 * Used to activate or deactivate companies
 */
export async function toggleCompanyStatus(id: string, active: boolean): Promise<AdminActionResponse<CompanyWithMetrics>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .update({ active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/empresas')
    revalidatePath('/admin/empresas/[id]')
    revalidatePath('/admin/dashboard')

    return { data: data as CompanyWithMetrics }
  } catch (error) {
    console.error('Error toggling company status:', error)
    return { error: 'Erro ao alterar status da empresa' }
  }
}

/**
 * Get metrics for a specific company
 * Returns client count, pet count, appointments today/month, and revenue
 */
export async function getCompanyMetrics(companyId: string): Promise<AdminActionResponse<CompanyMetrics>> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    const [clientsResult, petsResult, appointmentsResult] = await Promise.all([
      supabaseAdmin.from('clients').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
      supabaseAdmin.from('pets').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
      supabaseAdmin.from('appointments')
        .select('date, price, status')
        .eq('company_id', companyId)
    ])

    const appointmentsToday = appointmentsResult.data?.filter(a => a.date === today).length || 0
    const appointmentsThisMonth = appointmentsResult.data?.filter(a => a.date >= monthStart).length || 0
    const revenue = appointmentsResult.data
      ?.filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + Number(a.price), 0) || 0

    return {
      data: {
        clientsCount: clientsResult.count || 0,
        petsCount: petsResult.count || 0,
        appointmentsToday,
        appointmentsThisMonth,
        revenue
      }
    }
  } catch (error) {
    console.error('Error loading company metrics:', error)
    return { error: 'Erro ao carregar métricas da empresa' }
  }
}

/**
 * Start impersonating a company
 * Sets a cookie to indicate admin is viewing as this company
 */
export async function startImpersonation(companyId: string): Promise<AdminActionResponse<{ companyId: string; companyName: string }>> {
  try {
    const { data: company, error } = await supabaseAdmin
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single()

    if (error || !company) {
      return { error: 'Empresa não encontrada' }
    }

    // This will be handled by cookies in the client component
    return {
      data: {
        companyId: company.id,
        companyName: company.name
      }
    }
  } catch (error) {
    console.error('Error starting impersonation:', error)
    return { error: 'Erro ao iniciar personificação' }
  }
}

/**
 * Get company info for impersonation
 */
export async function getCompanyForImpersonation(companyId: string): Promise<AdminActionResponse<{ id: string; name: string }>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single()

    if (error) throw error

    return { data: data as { id: string; name: string } }
  } catch (error) {
    console.error('Error loading company for impersonation:', error)
    return { error: 'Erro ao carregar empresa' }
  }
}
