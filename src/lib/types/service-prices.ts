// src/lib/types/service-prices.ts

import { Cat, Dog, Dog as DogLarge } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type SizeCategory = 'tiny' | 'small' | 'medium' | 'large' | 'giant'

export type BillingType = 'avulso' | 'pacote'

export type HairType = 'PC' | 'PL'

// Billing type labels
export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  avulso: 'Avulso',
  pacote: 'Pacote'
} as const

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

// Size icons for UI (Lucide React components)
export const SIZE_ICONS: Record<SizeCategory, LucideIcon> = {
  tiny: Cat,
  small: Cat,
  medium: Dog,
  large: DogLarge,
  giant: DogLarge
}

// Hair type labels
export const HAIR_TYPE_LABELS: Record<HairType, string> = {
  PC: 'Pelo Curto',
  PL: 'Pelo Longo'
} as const

// Size colors for UI badges
export const SIZE_COLORS: Record<SizeCategory, string> = {
  tiny: 'bg-green-500/20 text-green-200',
  small: 'bg-lime-500/20 text-lime-200',
  medium: 'bg-yellow-500/20 text-yellow-200',
  large: 'bg-orange-500/20 text-orange-200',
  giant: 'bg-red-500/20 text-red-200'
} as const

// Size categories array for selects
export const SIZE_CATEGORIES: Array<{ value: SizeCategory; label: string }> = [
  { value: 'tiny', label: '0-10kg (Tiny)' },
  { value: 'small', label: '10-20kg (Pequeno)' },
  { value: 'medium', label: '20-30kg (Médio)' },
  { value: 'large', label: '30-50kg (Grande)' },
  { value: 'giant', label: '50-70kg (Gigante)' }
]
