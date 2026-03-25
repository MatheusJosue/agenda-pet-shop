// src/lib/actions/service-prices.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { getPriceParamsSchema } from '@/lib/validation/service-prices'
import type {
  ServicePrice,
  GetPriceParams,
  ServicePricesResponse,
  PriceResponse,
  SizeCategory
} from '@/lib/types/service-prices'

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
 * Get price for specific service combination
 */
export async function getServicePrice(params: GetPriceParams): Promise<PriceResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  // Validate input
  const validatedFields = getPriceParamsSchema.safeParse(params)

  if (!validatedFields.success) {
    return { error: 'Parâmetros inválidos' }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('service_prices')
    .select('price')
    .eq('company_id', companyId)
    .eq('service_name', validatedFields.data.serviceName)
    .eq('billing_type', validatedFields.data.billingType)
    .eq('size_category', validatedFields.data.petSize)
    .eq('active', true)

  // Filter by hair_type if provided
  if (validatedFields.data.hairType) {
    query = query.eq('hair_type', validatedFields.data.hairType)
  } else {
    query = query.is('hair_type', null)
  }

  const { data, error } = await query.single()

  if (error || !data) {
    return { error: 'Preço não encontrado para esta combinação' }
  }

  return { data: data.price }
}

/**
 * Get all service prices for a billing type
 */
export async function getServicePrices(billingType: 'avulso' | 'pacote' | 'all' = 'all'): Promise<ServicePricesResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('service_prices')
    .select('*')
    .eq('company_id', companyId)
    .eq('active', true)

  if (billingType !== 'all') {
    query = query.eq('billing_type', billingType)
  }

  const { data, error } = await query.order('service_name', { ascending: true })

  if (error) {
    return { data: [], error: 'Erro ao buscar preços' }
  }

  return { data: data || [] }
}

/**
 * Get unique service names
 */
export async function getServiceNames(): Promise<{ data: string[], error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('service_prices')
    .select('service_name')
    .eq('company_id', companyId)
    .eq('active', true)

  if (error) {
    return { data: [], error: 'Erro ao buscar serviços' }
  }

  // Get unique service names
  const uniqueNames = [...new Set(data?.map(d => d.service_name) || [])]

  return { data: uniqueNames }
}

/**
 * Get hair types for a specific service
 */
export async function getHairTypesForService(serviceName: string): Promise<{ data: (string | null)[], error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('service_prices')
    .select('hair_type')
    .eq('company_id', companyId)
    .eq('service_name', serviceName)
    .eq('active', true)

  if (error) {
    return { data: [], error: 'Erro ao buscar tipos de pelo' }
  }

  // Get unique hair types
  const uniqueHairTypes = [...new Set(data?.map(d => d.hair_type) || [])]

  return { data: uniqueHairTypes }
}

/**
 * Create or update service price
 */
export async function upsertServicePrice(input: {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  hairType?: 'PC' | 'PL'
  sizeCategory: SizeCategory
  price: number
}): Promise<PriceResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('service_prices')
    .upsert({
      company_id: companyId,
      service_name: input.serviceName,
      billing_type: input.billingType,
      hair_type: input.hairType || null,
      size_category: input.sizeCategory,
      price: input.price,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'company_id,service_name,billing_type,hair_type,size_category'
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao salvar preço' }
  }

  return { data: data.price }
}

/**
 * Bulk update service prices
 */
export async function updateServicePrices(updates: Array<{
  serviceName: string
  billingType: 'avulso' | 'pacote'
  hairType?: 'PC' | 'PL'
  sizeCategory: SizeCategory
  price: number
}>): Promise<{ error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  for (const update of updates) {
    const { error } = await supabase
      .from('service_prices')
      .upsert({
        company_id: companyId,
        service_name: update.serviceName,
        billing_type: update.billingType,
        hair_type: update.hairType || null,
        size_category: update.sizeCategory,
        price: update.price,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id,service_name,billing_type,hair_type,size_category'
      })

    if (error) {
      return { error: 'Erro ao atualizar preços' }
    }
  }

  revalidatePath('/app/precos')

  return {}
}

/**
 * Deactivate service price (soft delete)
 */
export async function deactivateServicePrice(
  serviceName: string,
  billingType: 'avulso' | 'pacote',
  hairType: 'PC' | 'PL' | null,
  sizeCategory: SizeCategory
): Promise<{ error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('service_prices')
    .update({ active: false })
    .eq('company_id', companyId)
    .eq('service_name', serviceName)
    .eq('billing_type', billingType)
    .eq('size_category', sizeCategory)

  if (hairType) {
    query = query.eq('hair_type', hairType)
  } else {
    query = query.is('hair_type', null)
  }

  const { error } = await query

  if (error) {
    return { error: 'Erro ao desativar preço' }
  }

  return {}
}

/**
 * Deactivate all prices for a service
 */
export async function deactivateService(serviceName: string): Promise<{ error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('service_prices')
    .update({ active: false })
    .eq('company_id', companyId)
    .eq('service_name', serviceName)

  if (error) {
    return { error: 'Erro ao desativar serviço' }
  }

  return {}
}
