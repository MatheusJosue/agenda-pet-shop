import type { SizeCategory } from './service-prices'

export interface Appointment {
  id: string
  company_id: string
  client_id: string
  pet_id: string
  service_price_id: string | null // Kept for backward compatibility
  date: string
  time: string
  price: number // Individual service price (legacy)
  total_price: number | null // Total from all services
  status: 'scheduled' | 'completed' | 'cancelled'
  used_credit: boolean
  client_plan_id?: string | null
  pet_package_id?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface AppointmentService {
  id: string
  appointment_id: string
  service_price_id: string
  price: number
  created_at: string
}

export interface ServicePrice {
  id: string
  service_name: string
  billing_type: 'avulso' | 'pacote'
  hair_type: 'PC' | 'PL' | null
  size_category: SizeCategory
  price: number
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
  // Legacy single service (kept for backward compatibility)
  service_price?: {
    id: string
    service_name: string
    billing_type: 'avulso' | 'pacote'
    hair_type: 'PC' | 'PL' | null
    size_category: SizeCategory
    price: number
  }
  // Multiple services (new)
  appointment_services?: (AppointmentService & {
    service_price: ServicePrice
  })[]
}

export type AppointmentInput = {
  clientId: string
  petId: string
  servicePriceIds: string[] // Changed to array
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
