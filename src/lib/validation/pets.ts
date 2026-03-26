import { z } from 'zod'
import { sizeCategorySchema } from './service-prices'

export const hairTypeSchema = z.enum(['PC', 'PL'], {
  errorMap: () => ({ message: 'Tipo de pelo deve ser PC ou PL' })
})

export const petSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  breed: z.string().max(50).optional(),
  size: sizeCategorySchema,
  hairType: hairTypeSchema,
  notes: z.string().max(500).optional()
})

export type PetInput = z.infer<typeof petSchema>
