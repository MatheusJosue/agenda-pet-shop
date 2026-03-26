import type { SizeCategory } from './service-prices'

export interface Appointment {
  id: string
  company_id: string
  client_id: string
  pet_id: string
  service_price_id: string
  date: string
  time: string
  price: number
  status: 'scheduled' | 'completed' | 'cancelled'
  used_credit: boolean
  client_plan_id?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface AppointmentWithRelations extends Appointment {
  client: {
    id: string
    name: string
    phone: string
  }
  pet: {
    id: string
    name: string
    size: SizeCategory
  }
  service_price: {
    id: string
    service_name: string
    billing_type: 'avulso' | 'pacote'
    hair_type: 'PC' | 'PL' | null
    size_category: SizeCategory
    price: number
  }
}

export type AppointmentInput = {
  clientId: string
  petId: string
  servicePriceId: string
  date: string
  time: string
  useCredit?: boolean
  clientPlanId?: string
  petPackageId?: string
  notes?: string
}

export type AppointmentsListResponse = {
  data?: AppointmentWithRelations[]
  error?: string
}
