'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { appointmentSchema } from '@/lib/validation/appointments'
import { usePackageCredit } from './packages'
import type { Appointment, AppointmentInput, AppointmentWithRelations, AppointmentsListResponse } from '@/lib/types/appointments'

export interface AppointmentResponse {
  data?: Appointment
  error?: string
}

export interface AppointmentWithRelationsResponse {
  data?: AppointmentWithRelations
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
 * Get all appointments for the current user's company
 * Optionally filter by date range or status
 */
export async function getAppointments(filters?: {
  startDate?: string
  endDate?: string
  status?: 'scheduled' | 'completed' | 'cancelled'
}): Promise<AppointmentsListResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('appointments')
    .select(`
      *,
      client:clients!inner(id, name, phone),
      pet:pets!inner(id, name, size),
      service:services!inner(id, name, duration_minutes)
    `)
    .eq('company_id', companyId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('date', filters.endDate)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: 'Erro ao buscar agendamentos' }
  }

  return { data: data || [] }
}

/**
 * Get upcoming appointments (from today onwards)
 */
export async function getUpcomingAppointments(limit: number = 10): Promise<AppointmentsListResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients!inner(id, name, phone),
      pet:pets!inner(id, name, size),
      service:services!inner(id, name, duration_minutes)
    `)
    .eq('company_id', companyId)
    .gte('date', today)
    .eq('status', 'scheduled')
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(limit)

  if (error) {
    return { data: [], error: 'Erro ao buscar agendamentos' }
  }

  return { data: data || [] }
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(id: string): Promise<AppointmentWithRelationsResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients!inner(id, name, phone),
      pet:pets!inner(id, name, size),
      service:services!inner(id, name, duration_minutes)
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error || !data) {
    return { error: 'Agendamento não encontrado' }
  }

  return { data }
}

/**
 * Create a new appointment
 */
export async function createAppointment(input: AppointmentInput): Promise<AppointmentResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Validate input
  const validatedFields = appointmentSchema.safeParse({
    clientId: input.clientId,
    petId: input.petId,
    serviceId: input.serviceId,
    date: input.date,
    time: input.time,
    useCredit: input.useCredit || false,
    clientPlanId: input.clientPlanId,
    petPackageId: input.petPackageId,
    notes: input.notes
  })

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  // Verify pet belongs to client
  const { data: pet } = await supabase
    .from('pets')
    .select('client_id, size')
    .eq('id', input.petId)
    .eq('company_id', companyId)
    .single()

  if (!pet) {
    return { error: 'Pet não encontrado' }
  }

  if (pet.client_id !== input.clientId) {
    return { error: 'Pet não pertence ao cliente informado' }
  }

  // Get service and calculate price
  const { data: service } = await supabase
    .from('services')
    .select('price_small, price_medium, price_large')
    .eq('id', input.serviceId)
    .eq('company_id', companyId)
    .eq('active', true)
    .single()

  if (!service) {
    return { error: 'Serviço não encontrado' }
  }

  // Calculate price based on pet size
  const priceMap: Record<'small' | 'medium' | 'large', number> = {
    small: service.price_small,
    medium: service.price_medium,
    large: service.price_large
  }
  const price = priceMap[pet.size as keyof typeof priceMap]

  // Check if using pet package credit
  let finalPrice = price
  if (input.petPackageId) {
    const { data: petPackage } = await supabase
      .from('pet_packages')
      .select('id, credits_remaining, expires_at')
      .eq('id', input.petPackageId)
      .eq('company_id', companyId)
      .eq('active', true)
      .single()

    if (!petPackage) {
      return { error: 'Pacote não encontrado' }
    }

    if (petPackage.credits_remaining < 1) {
      return { error: 'Créditos insuficientes no pacote' }
    }

    if (petPackage.expires_at && new Date(petPackage.expires_at) < new Date()) {
      return { error: 'Pacote expirado' }
    }

    finalPrice = 0
  }

  // Check if using credit
  if (input.useCredit && input.clientPlanId) {
    const { data: plan } = await supabase
      .from('client_plans')
      .select('credits_remaining, expires_at')
      .eq('id', input.clientPlanId)
      .eq('company_id', companyId)
      .eq('active', true)
      .single()

    if (!plan) {
      return { error: 'Plano não encontrado' }
    }

    if (plan.credits_remaining < 1) {
      return { error: 'Créditos insuficientes no plano' }
    }

    if (plan.expires_at && new Date(plan.expires_at) < new Date()) {
      return { error: 'Plano expirado' }
    }
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      company_id: companyId,
      client_id: validatedFields.data.clientId,
      pet_id: validatedFields.data.petId,
      service_id: validatedFields.data.serviceId,
      date: validatedFields.data.date.toISOString().split('T')[0],
      time: validatedFields.data.time,
      price: finalPrice,
      status: 'scheduled',
      used_credit: validatedFields.data.useCredit,
      client_plan_id: validatedFields.data.clientPlanId,
      pet_package_id: validatedFields.data.petPackageId,
      notes: validatedFields.data.notes || null
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar agendamento' }
  }

  // Deduct pet package credit if used
  if (input.petPackageId) {
    const creditResult = await usePackageCredit(input.petPackageId)
    if (creditResult.error) {
      return { error: creditResult.error }
    }
  }

  // Deduct credit if used
  if (input.useCredit && input.clientPlanId) {
    await supabase
      .from('client_plans')
      .update({ credits_remaining: supabase.rpc(' decrement', { amount: 1 }) })
      .eq('id', input.clientPlanId)
  }

  revalidatePath('/app/agendamentos')
  revalidatePath(`/app/clientes/${input.clientId}`)
  revalidatePath(`/app/pets/${input.petId}`)
  revalidatePath('/app/pacotes')
  return { data }
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(id: string, input: Partial<AppointmentInput>): Promise<AppointmentResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Get current appointment
  const { data: currentAppointment } = await supabase
    .from('appointments')
    .select('client_id, pet_id, service_id, used_credit, client_plan_id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!currentAppointment) {
    return { error: 'Agendamento não encontrado' }
  }

  const updateData: {
    date?: string
    time?: string
    notes?: string | null
    price?: number
    pet_id?: string
    service_id?: string
  } = {
    date: input.date ? new Date(input.date).toISOString().split('T')[0] : undefined,
    time: input.time,
    notes: input.notes
  }

  // If changing pet or service, recalculate price
  if (input.petId || input.serviceId) {
    const petId = input.petId || currentAppointment.pet_id
    const serviceId = input.serviceId || currentAppointment.service_id

    const { data: pet } = await supabase
      .from('pets')
      .select('size')
      .eq('id', petId)
      .single()

    const { data: service } = await supabase
      .from('services')
      .select('price_small, price_medium, price_large')
      .eq('id', serviceId)
      .single()

    if (pet && service) {
      const priceMap: Record<'small' | 'medium' | 'large', number> = {
        small: service.price_small,
        medium: service.price_medium,
        large: service.price_large
      }
      updateData.price = priceMap[pet.size as keyof typeof priceMap]
      updateData.pet_id = petId
      updateData.service_id = serviceId
    }
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao atualizar agendamento' }
  }

  if (!data) {
    return { error: 'Agendamento não encontrado' }
  }

  revalidatePath('/app/agendamentos')
  revalidatePath(`/app/agendamentos/${id}`)
  revalidatePath(`/app/clientes/${currentAppointment.client_id}`)
  return { data }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  id: string,
  status: 'scheduled' | 'completed' | 'cancelled'
): Promise<AppointmentResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao atualizar status' }
  }

  if (!data) {
    return { error: 'Agendamento não encontrado' }
  }

  revalidatePath('/app/agendamentos')
  revalidatePath(`/app/agendamentos/${id}`)
  return { data }
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id: string): Promise<AppointmentResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Get appointment to potentially refund credit
  const { data: appointment } = await supabase
    .from('appointments')
    .select('client_plan_id, used_credit, status')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!appointment) {
    return { error: 'Agendamento não encontrado' }
  }

  // Refund credit if used and appointment is not completed
  if (appointment.used_credit && appointment.client_plan_id && appointment.status !== 'completed') {
    await supabase
      .from('client_plans')
      .update({ credits_remaining: supabase.rpc('increment', { amount: 1 }) })
      .eq('id', appointment.client_plan_id)
  }

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: 'Erro ao excluir agendamento' }
  }

  revalidatePath('/app/agendamentos')
  return { data: undefined }
}
