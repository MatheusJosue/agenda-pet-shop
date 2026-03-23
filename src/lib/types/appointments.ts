export interface Appointment {
  id: string
  company_id: string
  client_id: string
  pet_id: string
  service_id: string
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
    size: 'small' | 'medium' | 'large'
  }
  service: {
    id: string
    name: string
    duration_minutes: number
  }
}

export type AppointmentInput = {
  clientId: string
  petId: string
  serviceId: string
  date: Date | string
  time: string
  price: number
  useCredit?: boolean
  clientPlanId?: string
  petPackageId?: string
  notes?: string
}

export type AppointmentsListResponse = {
  data?: AppointmentWithRelations[]
  error?: string
}
