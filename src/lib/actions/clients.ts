'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validation/clients'
import { stripPhone } from '@/lib/utils/phone'
import type { Client, ClientInput } from '@/lib/types/clients'

export interface ClientResponse {
  data?: Client
  error?: string
}

export interface ClientsListResponse {
  data?: Client[]
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
 * Get all clients for the current user's company
 * Optional search filters by name, phone, or email
 */
export async function getClients(search?: string): Promise<ClientsListResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('clients')
    .select('*')
    .eq('company_id', companyId)

  if (search && search.trim()) {
    const searchTerm = search.trim()
    query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: 'Erro ao buscar clientes' }
  }

  return { data: data || [] }
}

/**
 * Get a single client by ID
 * Verifies the client belongs to the user's company
 */
export async function getClientById(id: string): Promise<ClientResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error || !data) {
    return { error: 'Cliente não encontrado' }
  }

  return { data }
}

/**
 * Create a new client
 * Phone is stripped to digits before storing
 */
export async function createClient(input: ClientInput): Promise<ClientResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Strip phone to digits only BEFORE validation
  const phoneDigits = stripPhone(input.phone)

  // Validate input with stripped phone
  const validatedFields = clientSchema.safeParse({
    ...input,
    phone: phoneDigits
  })

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      company_id: companyId,
      name: validatedFields.data.name,
      phone: validatedFields.data.phone,
      email: validatedFields.data.email || null,
      notes: validatedFields.data.notes || null
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar cliente' }
  }

  revalidatePath('/app/clientes')
  return { data }
}

/**
 * Update an existing client
 * Verifies the client belongs to the user's company
 */
export async function updateClient(id: string, input: ClientInput): Promise<ClientResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Strip phone to digits only BEFORE validation
  const phoneDigits = stripPhone(input.phone)

  // Validate input with stripped phone
  const validatedFields = clientSchema.safeParse({
    ...input,
    phone: phoneDigits
  })

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const { data, error } = await supabase
    .from('clients')
    .update({
      name: validatedFields.data.name,
      phone: validatedFields.data.phone,
      email: validatedFields.data.email || null,
      notes: validatedFields.data.notes || null
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao atualizar cliente' }
  }

  if (!data) {
    return { error: 'Cliente não encontrado' }
  }

  revalidatePath('/app/clientes')
  revalidatePath(`/app/clientes/${id}`)
  return { data }
}

/**
 * Count future appointments for a client
 * Used to validate deletion
 */
export async function checkClientAppointments(clientId: string): Promise<number> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact' })
    .eq('client_id', clientId)
    .gte('date', new Date().toISOString())

  if (error) {
    return 0
  }

  return data?.length || 0
}

/**
 * Delete a client
 * Prevents deletion if client has future appointments
 */
export async function deleteClient(id: string): Promise<ClientResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  // Check for future appointments
  const appointmentCount = await checkClientAppointments(id)

  if (appointmentCount > 0) {
    return {
      error: `Não é possível excluir cliente com ${appointmentCount} agendamento(s) futuro(s)`
    }
  }

  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: 'Erro ao excluir cliente' }
  }

  revalidatePath('/app/clientes')
  return { data: undefined }
}
