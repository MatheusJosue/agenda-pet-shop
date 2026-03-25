// src/lib/actions/packages.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { packageTypeSchema } from '@/lib/validation/packages'
import type {
  PackageType,
  PetPackage,
  PetPackageWithRelations,
  PackageInput,
  PackageTypesResponse,
  PetPackagesResponse,
  PetPackageResponse,
  PetPackageWithRelationsResponse,
  PackageTypeInput,
  PackageTypeResponse
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
export async function getPackageTypes(search?: string): Promise<PackageTypesResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('package_types')
    .select('*')
    .eq('company_id', companyId)
    .eq('active', true)

  // Add search filter if provided
  if (search && search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  const { data, error } = await query.order('interval_days', { ascending: true })

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
    return { data: undefined, error: 'Não autenticado' }
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
    return { data: undefined, error: 'Não autenticado' }
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

/**
 * Get a single package type by ID
 */
export async function getPackageTypeById(id: string): Promise<PackageTypeResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('package_types')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error || !data) {
    return { error: 'Tipo de pacote não encontrado' }
  }

  return { data }
}

/**
 * Create a new package type
 */
export async function createPackageType(input: PackageTypeInput): Promise<PackageTypeResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Validate input
  const validatedFields = packageTypeSchema.safeParse({
    name: input.name,
    intervalDays: input.interval_days,
    credits: input.credits,
    price: input.price
  })

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const { data, error } = await supabase
    .from('package_types')
    .insert({
      company_id: companyId,
      name: validatedFields.data.name,
      interval_days: validatedFields.data.intervalDays,
      credits: validatedFields.data.credits,
      price: validatedFields.data.price,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar tipo de pacote' }
  }

  revalidatePath('/app/pacotes')
  return { data }
}

/**
 * Type for partial updates to package types
 */
type PackageTypeUpdateData = {
  name?: string
  interval_days?: 7 | 15 | 30
  credits?: number
  price?: number
}

/**
 * Update an existing package type
 */
export async function updatePackageType(id: string, input: Partial<PackageTypeInput>): Promise<PackageTypeResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Get current package type to verify ownership
  const { data: currentPackageType } = await supabase
    .from('package_types')
    .select('id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!currentPackageType) {
    return { error: 'Tipo de pacote não encontrado' }
  }

  // Build update data object with only provided fields
  const updateData: PackageTypeUpdateData = {}

  // Validate each field individually if provided
  if (input.name !== undefined) {
    const nameValidation = packageTypeSchema.pick({ name: true }).safeParse({ name: input.name })
    if (!nameValidation.success) {
      return { error: 'Nome inválido' }
    }
    updateData.name = nameValidation.data.name
  }

  if (input.interval_days !== undefined) {
    const intervalValidation = packageTypeSchema.pick({ intervalDays: true }).safeParse({ intervalDays: input.interval_days })
    if (!intervalValidation.success) {
      return { error: 'Intervalo inválido' }
    }
    updateData.interval_days = intervalValidation.data.intervalDays
  }

  if (input.credits !== undefined) {
    const creditsValidation = packageTypeSchema.pick({ credits: true }).safeParse({ credits: input.credits })
    if (!creditsValidation.success) {
      return { error: 'Créditos inválidos' }
    }
    updateData.credits = creditsValidation.data.credits
  }

  if (input.price !== undefined) {
    const priceValidation = packageTypeSchema.pick({ price: true }).safeParse({ price: input.price })
    if (!priceValidation.success) {
      return { error: 'Preço inválido' }
    }
    updateData.price = priceValidation.data.price
  }

  // Ensure at least one field is being updated
  if (Object.keys(updateData).length === 0) {
    return { error: 'Nenhum campo fornecido para atualização' }
  }

  const { data, error } = await supabase
    .from('package_types')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao atualizar tipo de pacote' }
  }

  if (!data) {
    return { error: 'Tipo de pacote não encontrado' }
  }

  revalidatePath('/app/pacotes')
  revalidatePath(`/app/pacotes/${id}`)
  return { data }
}

/**
 * Check for active pet packages using a package type
 */
export async function checkPackageTypeUsage(packageTypeId: string): Promise<number> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return 0
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('pet_packages')
    .select('id', { count: 'exact' })
    .eq('package_type_id', packageTypeId)
    .eq('company_id', companyId)
    .eq('active', true)

  if (error) {
    return 0
  }

  return data?.length || 0
}

/**
 * Soft delete a package type (set active = false)
 * Prevents deletion if package type is in use by active pet packages
 */
export async function deletePackageType(id: string): Promise<PackageTypeResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Check for active pet packages
  const packageCount = await checkPackageTypeUsage(id)

  if (packageCount > 0) {
    return {
      error: `Não é possível excluir tipo de pacote com ${packageCount} pacote(s) ativo(s)`
    }
  }

  const { error } = await supabase
    .from('package_types')
    .update({ active: false })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: 'Erro ao excluir tipo de pacote' }
  }

  revalidatePath('/app/pacotes')
  return { data: undefined }
}
