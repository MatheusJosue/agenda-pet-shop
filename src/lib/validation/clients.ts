import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional(),
  notes: z.string().max(500).optional()
})

export type ClientInput = z.infer<typeof clientSchema>
