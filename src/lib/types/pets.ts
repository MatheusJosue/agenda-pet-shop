import type { SizeCategory } from './service-prices'

export type HairType = 'PC' | 'PL'

export const HAIR_TYPE_LABELS: Record<HairType, string> = {
  PC: 'Pelo Curto',
  PL: 'Pelo Longo'
}

export interface Pet {
  id: string
  company_id: string
  client_id: string
  name: string
  breed?: string | null
  size: SizeCategory
  hair_type: HairType
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface PetWithClient extends Pet {
  client: {
    id: string
    name: string
    phone: string
  }
}

export type PetInput = {
  clientId: string
  name: string
  breed?: string
  size: SizeCategory
  hairType: HairType
  notes?: string
}

export type PetsListResponse = {
  data: PetWithClient[]
  error?: string
}
