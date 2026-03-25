// src/lib/types/service-prices.ts

export type SizeCategory = 'tiny' | 'small' | 'medium' | 'large' | 'giant'

export type BillingType = 'avulso' | 'pacote'

export type HairType = 'PC' | 'PL'

export interface ServicePrice {
  id: string
  company_id: string
  service_name: string
  billing_type: BillingType
  hair_type: HairType | null
  size_category: SizeCategory
  price: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface ServicePriceInput {
  serviceName: string
  billingType: BillingType
  hairType?: HairType
  sizeCategory: SizeCategory
  price: number
}

export interface GetPriceParams {
  serviceName: string
  billingType: BillingType
  petSize: SizeCategory
  hairType?: HairType
}

export type ServicePricesResponse = {
  data: ServicePrice[]
  error?: string
}

export type ServicePriceResponse = {
  data?: ServicePrice
  error?: string
}

export type PriceResponse = {
  data?: number
  error?: string
}

// Size labels for UI
export const SIZE_LABELS: Record<SizeCategory, string> = {
  tiny: '0-10kg',
  small: '10-20kg',
  medium: '20-30kg',
  large: '30-50kg',
  giant: '50-70kg'
} as const

// Size emojis for UI
export const SIZE_EMOJIS: Record<SizeCategory, string> = {
  tiny: '🐭',
  small: '🐱',
  medium: '🐕',
  large: '🦮',
  giant: '🐕‍🦺'
} as const

// Hair type labels
export const HAIR_TYPE_LABELS: Record<HairType, string> = {
  PC: 'Pelo Curto',
  PL: 'Pelo Longo'
} as const
