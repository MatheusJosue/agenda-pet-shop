// src/lib/actions/packages.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type {
  PackageType,
  PetPackage,
  PetPackageWithRelations,
  PackageInput,
  PackageTypesResponse,
  PetPackagesResponse,
  PetPackageResponse,
  PetPackageWithRelationsResponse
} from '@/lib/types/packages'

// Helper: Get company_id from authenticated user session
async function getCurrentCompanyId(): Promise<string | null> {
  const supabase = await createSupabaseClient()

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
 * Get all active package types for the current company
 */
export async function getPackageTypes(): Promise<PackageTypesResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('package_types')
    .select('*')
    .eq('company_id', companyId)
    .eq('active', true)
    .order('interval_days', { ascending: true })

  if (error) {
    return { data: [], error: 'Erro ao buscar tipos de pacote' }
  }

  return { data: data || [] }
}

/**
 * Get all packages with zero credits remaining
 */
export async function getExhaustedPackages(): Promise<PetPackagesResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('pet_packages')
    .select(`
      *,
      pet:pets!inner(id, name, size),
      client:clients!inner(id, name, phone),
      package_type:package_types!inner(*)
    `)
    .eq('company_id', companyId)
    .eq('credits_remaining', 0)
    .eq('active', true)
    .order('expires_at', { ascending: false })

  if (error) {
    return { data: [], error: 'Erro ao buscar pacotes esgotados' }
  }

  return { data: (data || []) as PetPackageWithRelations[] }
}

/**
 * Get all packages for a specific pet
 */
export async function getPetPackages(petId: string): Promise<PetPackagesResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('pet_packages')
    .select(`
      *,
      package_type:package_types!inner(*)
    `)
    .eq('company_id', companyId)
    .eq('pet_id', petId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: 'Erro ao buscar pacotes do pet' }
  }

  return { data: (data || []) as PetPackageWithRelations[] }
}

/**
 * Get active package for a specific pet
 */
export async function getActivePetPackage(petId: string): Promise<PetPackageWithRelationsResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('pet_packages')
    .select(`
      *,
      package_type:package_types!inner(*)
    `)
    .eq('company_id', companyId)
    .eq('pet_id', petId)
    .eq('active', true)
    .single()

  if (error || !data) {
    return { data: undefined, error: 'Pacote não encontrado' }
  }

  return { data: data as PetPackageWithRelations }
}

/**
 * Create a new package for a pet
 */
export async function createPetPackage(input: PackageInput): Promise<PetPackageResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Verify pet belongs to company
  const { data: pet } = await supabase
    .from('pets')
    .select('id')
    .eq('id', input.petId)
    .eq('company_id', companyId)
    .single()

  if (!pet) {
    return { error: 'Pet não encontrado' }
  }

  // Get package type
  const { data: packageType } = await supabase
    .from('package_types')
    .select('*')
    .eq('id', input.packageTypeId)
    .eq('company_id', companyId)
    .eq('active', true)
    .single()

  if (!packageType) {
    return { error: 'Tipo de pacote não encontrado' }
  }

  // Calculate dates
  const startDate = new Date(input.startsAt)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + packageType.interval_days)

  // Deactivate existing packages for this pet
  const { error: deactivateError } = await supabase
    .from('pet_packages')
    .update({ active: false })
    .eq('pet_id', input.petId)
    .eq('active', true)

  if (deactivateError) {
    console.error('Error deactivating existing packages:', deactivateError)
    // Continue anyway - this is not critical
  }

  // Create new package
  const { data, error } = await supabase
    .from('pet_packages')
    .insert({
      company_id: companyId,
      pet_id: input.petId,
      package_type_id: input.packageTypeId,
      credits_remaining: packageType.credits,
      starts_at: startDate.toISOString().split('T')[0],
      expires_at: endDate.toISOString().split('T')[0],
      active: true
    })
    .select(`
      *,
      package_type:package_types!inner(*)
    `)
    .single()

  if (error) {
    return { error: 'Erro ao criar pacote' }
  }

  revalidatePath(`/app/pets/${input.petId}`)
  revalidatePath('/app/pacotes')

  return { data: data as PetPackageWithRelations }
}

/**
 * Decrement credits from a package when used in an appointment
 */
export async function usePackageCredit(packageId: string): Promise<{ error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Verify package belongs to company
  const { data: packageData } = await supabase
    .from('pet_packages')
    .select('id, credits_remaining')
    .eq('id', packageId)
    .eq('company_id', companyId)
    .eq('active', true)
    .single()

  if (!packageData) {
    return { error: 'Pacote não encontrado' }
  }

  if (packageData.credits_remaining < 1) {
    return { error: 'Créditos insuficientes' }
  }

  // Decrement using secure function
  const { error } = await supabase.rpc('decrement_package_credits', {
    p_package_id: packageId
  })

  if (error) {
    return { error: 'Erro ao usar crédito' }
  }

  revalidatePath('/app/pacotes')
  return {}
}
