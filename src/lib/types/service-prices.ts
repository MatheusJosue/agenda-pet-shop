// src/lib/types/service-prices.ts

import { PawPrint } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type SizeCategory = 'small' | 'medium' | 'large' | 'giant'

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
  small: '0-10kg',
  medium: '10-20kg',
  large: '20-30kg',
  giant: '30-60kg'
} as const

// Size emojis for UI
export const SIZE_EMOJIS: Record<SizeCategory, string> = {
  small: 'P',
  medium: 'M',
  large: 'G',
  giant: 'GG'
} as const

// Size icons for UI (Lucide React components)
export const SIZE_ICONS: Record<SizeCategory, LucideIcon> = {
  small: PawPrint,
  medium: PawPrint,
  large: PawPrint,
  giant: PawPrint
}

// Hair type labels
export const HAIR_TYPE_LABELS: Record<HairType, string> = {
  PC: 'Pelo Curto',
  PL: 'Pelo Longo'
} as const

// Size colors for UI badges
export const SIZE_COLORS: Record<SizeCategory, string> = {
  small: 'bg-lime-500/20 text-black-200',
  medium: 'bg-yellow-500/20 text-black-200',
  large: 'bg-orange-500/20 text-black-200',
  giant: 'bg-red-500/20 text-black-200'
} as const

// Size categories array for selects
export const SIZE_CATEGORIES: Array<{ value: SizeCategory; label: string }> = [
  { value: 'small', label: '0-10kg (Pequeno)' },
  { value: 'medium', label: '10-20kg (Médio)' },
  { value: 'large', label: '20-30kg (Grande)' },
  { value: 'giant', label: '30-60kg (Gigante)' }
]
