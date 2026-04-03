'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { petSchema } from '@/lib/validation/pets'
import type { Pet, PetInput, PetWithClient, PetsListResponse } from '@/lib/types/pets'

export interface PetResponse {
  data?: Pet
  error?: string
}

export interface PetWithClientResponse {
  data?: PetWithClient
  error?: string
}

// Helper: Get company_id from authenticated user session
async function getCurrentCompanyId(): Promise<string | null> {
  const supabase = await createSupabaseClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
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
 * Get all pets for the current user's company
 * Optionally filter by client
 */
export async function getPets(clientId?: string): Promise<PetsListResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('pets')
    .select(`
      *,
      client:clients!inner(id, name, phone)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: 'Erro ao buscar pets' }
  }

  return { data: data || [] }
}

/**
 * Get a single pet by ID
 */
export async function getPetById(id: string): Promise<PetWithClientResponse> {
  const supabase = await createSupabaseClient()

  const { data: petData, error: petError } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single()

  if (petError || !petData) {
    return { error: petError?.message || 'Pet não encontrado' }
  }

  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  if (petData.company_id !== companyId) {
    return { error: 'Pet não encontrado' }
  }

  const { data, error } = await supabase
    .from('pets')
    .select(`
      *,
      client:clients!inner(id, name, phone)
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error || !data) {
    return { error: error?.message || 'Pet não encontrado' }
  }

  return { data }
}

/**
 * Create a new pet
 */
export async function createPet(input: PetInput): Promise<PetResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Validate input
  const validatedFields = petSchema.safeParse({
    clientId: input.clientId,
    name: input.name,
    breed: input.breed,
    size: input.size,
    hairType: input.hairType,
    notes: input.notes
  })

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  // Verify client belongs to company
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', input.clientId)
    .eq('company_id', companyId)
    .single()

  if (!client) {
    return { error: 'Cliente não encontrado' }
  }

  const { data, error } = await supabase
    .from('pets')
    .insert({
      company_id: companyId,
      client_id: validatedFields.data.clientId,
      name: validatedFields.data.name,
      breed: validatedFields.data.breed || null,
      size: validatedFields.data.size,
      hair_type: validatedFields.data.hairType,
      notes: validatedFields.data.notes || null
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar pet' }
  }

  revalidatePath('/app/pets')
  revalidatePath(`/app/clientes/${input.clientId}`)
  return { data }
}

/**
 * Update an existing pet
 */
export async function updatePet(id: string, input: Partial<PetInput>): Promise<PetWithClientResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Get current pet to verify ownership and get clientId
  const { data: currentPet } = await supabase
    .from('pets')
    .select('client_id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!currentPet) {
    return { error: 'Pet não encontrado' }
  }

  // Validate input
  const validatedFields = petSchema.safeParse({
    clientId: currentPet.client_id,
    name: input.name || '',
    breed: input.breed,
    size: input.size || 'medium',
    hairType: input.hairType || 'PC',
    notes: input.notes
  })

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const updateData: any = {
    name: validatedFields.data.name,
    breed: validatedFields.data.breed,
    size: validatedFields.data.size,
    hair_type: validatedFields.data.hairType,
    notes: validatedFields.data.notes
  }

  const { data, error } = await supabase
    .from('pets')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', companyId)
    .select(`
      *,
      client:clients!inner(id, name, phone)
    `)
    .single()

  if (error) {
    return { error: 'Erro ao atualizar pet' }
  }

  if (!data) {
    return { error: 'Pet não encontrado' }
  }

  revalidatePath('/app/pets')
  revalidatePath(`/app/pets/${id}`)
  revalidatePath(`/app/clientes/${currentPet.client_id}`)
  return { data: data as any }
}

/**
 * Check for future appointments for a pet
 */
export async function checkPetAppointments(petId: string): Promise<number> {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact' })
    .eq('pet_id', petId)
    .gte('date', new Date().toISOString())

  if (error) {
    return 0
  }

  return data?.length || 0
}

/**
 * Delete a pet
 * Prevents deletion if pet has future appointments
 */
export async function deletePet(id: string): Promise<PetResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  // Check for future appointments
  const appointmentCount = await checkPetAppointments(id)

  if (appointmentCount > 0) {
    return {
      error: `Não é possível excluir pet com ${appointmentCount} agendamento(s) futuro(s)`
    }
  }

  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: 'Erro ao excluir pet' }
  }

  revalidatePath('/app/pets')
  return { data: undefined }
}
