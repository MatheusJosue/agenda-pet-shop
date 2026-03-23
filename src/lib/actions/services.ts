'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { serviceSchema } from '@/lib/validation/services'
import type { Service, ServiceInput, ServicesListResponse } from '@/lib/types/services'

export interface ServiceResponse {
  data?: Service
  error?: string
}

// Helper: Get company_id from authenticated user session
async function getCurrentCompanyId(): Promise<string | null> {
  const supabase = await createSupabaseClient()

  // Use getUser() instead of getSession() for server-side code
  // getUser() sends a request to validate the token, more secure than getSession()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('getCurrentCompanyId - auth error:', error)
    return null
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  return userData?.company_id || null
}

/**
 * Get all services for the current user's company
 */
export async function getServices(activeOnly: boolean = true): Promise<ServicesListResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('services')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true })

  if (activeOnly) {
    query = query.eq('active', true)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: 'Erro ao buscar serviços' }
  }

  return { data: data || [] }
}

/**
 * Get a single service by ID
 */
export async function getServiceById(id: string): Promise<ServiceResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error || !data) {
    return { error: 'Serviço não encontrado' }
  }

  return { data }
}

/**
 * Calculate price based on pet size
 */
function calculatePrice(
  priceSmall: number,
  priceMedium: number,
  priceLarge: number,
  size: 'small' | 'medium' | 'large'
): number {
  switch (size) {
    case 'small': return priceSmall
    case 'medium': return priceMedium
    case 'large': return priceLarge
  }
}

/**
 * Get service price for a specific pet size
 */
export async function getServicePrice(serviceId: string, petSize: 'small' | 'medium' | 'large'): Promise<{ data?: number, error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('services')
    .select('price_small, price_medium, price_large')
    .eq('id', serviceId)
    .eq('company_id', companyId)
    .eq('active', true)
    .single()

  if (error || !data) {
    return { error: 'Serviço não encontrado' }
  }

  const price = calculatePrice(
    data.price_small,
    data.price_medium,
    data.price_large,
    petSize
  )

  return { data: price }
}

/**
 * Create a new service
 */
export async function createService(input: ServiceInput): Promise<ServiceResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Validate input
  const validatedFields = serviceSchema.safeParse({
    name: input.name,
    priceSmall: input.price_small,
    priceMedium: input.price_medium,
    priceLarge: input.price_large,
    durationMinutes: input.duration_minutes || 60
  })

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const { data, error } = await supabase
    .from('services')
    .insert({
      company_id: companyId,
      name: validatedFields.data.name,
      price_small: validatedFields.data.priceSmall,
      price_medium: validatedFields.data.priceMedium,
      price_large: validatedFields.data.priceLarge,
      duration_minutes: validatedFields.data.durationMinutes,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar serviço' }
  }

  revalidatePath('/app/servicos')
  return { data }
}

/**
 * Update an existing service
 */
export async function updateService(id: string, input: Partial<ServiceInput>): Promise<ServiceResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Get current service to verify ownership
  const { data: currentService } = await supabase
    .from('services')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!currentService) {
    return { error: 'Serviço não encontrado' }
  }

  // Validate input
  const validatedFields = serviceSchema.safeParse({
    name: input.name || '',
    priceSmall: input.price_small || 0,
    priceMedium: input.price_medium || 0,
    priceLarge: input.price_large || 0,
    durationMinutes: input.duration_minutes || 60
  })

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const updateData: any = {
    name: validatedFields.data.name,
    price_small: validatedFields.data.priceSmall,
    price_medium: validatedFields.data.priceMedium,
    price_large: validatedFields.data.priceLarge,
    duration_minutes: validatedFields.data.durationMinutes,
  }

  const { data, error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao atualizar serviço' }
  }

  if (!data) {
    return { error: 'Serviço não encontrado' }
  }

  revalidatePath('/app/servicos')
  revalidatePath(`/app/servicos/${id}`)
  return { data }
}

/**
 * Check for future appointments using a service
 */
export async function checkServiceAppointments(serviceId: string): Promise<number> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return 0
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact' })
    .eq('service_id', serviceId)
    .eq('company_id', companyId)
    .gte('date', new Date().toISOString().split('T')[0])
    .neq('status', 'cancelled')

  if (error) {
    return 0
  }

  return data?.length || 0
}

/**
 * Soft delete a service (set active = false)
 * Prevents deletion if service has future appointments
 */
export async function deleteService(id: string): Promise<ServiceResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Check for future appointments
  const appointmentCount = await checkServiceAppointments(id)

  if (appointmentCount > 0) {
    return {
      error: `Não é possível excluir serviço com ${appointmentCount} agendamento(s) futuro(s)`
    }
  }

  const { error } = await supabase
    .from('services')
    .update({ active: false })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: 'Erro ao excluir serviço' }
  }

  revalidatePath('/app/servicos')
  return { data: undefined }
}
