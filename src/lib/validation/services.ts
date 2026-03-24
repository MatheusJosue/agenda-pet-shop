import { z } from 'zod'

export const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.number().positive('Preço deve ser positivo'),
  durationMinutes: z.number().positive().default(60)
})

export type ServiceInput = z.infer<typeof serviceSchema>
