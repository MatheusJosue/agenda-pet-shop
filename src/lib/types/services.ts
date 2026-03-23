export interface Service {
  id: string
  company_id: string
  name: string
  price_small: number
  price_medium: number
  price_large: number
  duration_minutes: number
  active: boolean
  created_at: string
  updated_at: string
}

export type ServiceInput = {
  name: string
  price_small: number
  price_medium: number
  price_large: number
  duration_minutes?: number
}

export type ServicesListResponse = {
  data: Service[]
  error?: string
}
