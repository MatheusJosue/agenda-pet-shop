// src/lib/types/clients.ts
export interface Client {
  id: string
  company_id: string
  name: string
  phone: string  // stored as digits only: "11987654321"
  email?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface ClientInput {
  name: string
  phone: string  // user enters formatted, we strip to digits
  email?: string
  notes?: string
}
