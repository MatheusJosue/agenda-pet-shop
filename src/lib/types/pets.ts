export interface Pet {
  id: string
  company_id: string
  client_id: string
  name: string
  breed?: string | null
  size: 'small' | 'medium' | 'large'
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
  size: 'small' | 'medium' | 'large'
  notes?: string
}

export type PetsListResponse = {
  data: PetWithClient[]
  error?: string
}
