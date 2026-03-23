// Admin dashboard and management types

export interface AdminDashboardStats {
  companiesCount: number
  revenue: number
  activeCompanies: number
  clientsCount: number
  monthlyAppointments: MonthlyAppointment[]
}

export interface MonthlyAppointment {
  month: string
  count: number
}

export interface CompanyWithMetrics {
  id: string
  name: string
  email: string
  active: boolean
  created_at: string
  updated_at: string
  metrics?: CompanyMetrics
}

export interface CompanyMetrics {
  clientsCount: number
  petsCount: number
  appointmentsToday: number
  appointmentsThisMonth: number
  revenue: number
}

export interface InviteWithDetails {
  id: string
  code: string
  role: 'company_admin' | 'company_user'
  company_id: string
  company_name?: string
  expires_at: string
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
}

export type InviteStatus = 'pending' | 'used' | 'expired'

export interface AdminActionResponse<T = unknown> {
  data?: T
  error?: string
}
