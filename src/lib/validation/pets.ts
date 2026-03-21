import { z } from 'zod'

export const petSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  breed: z.string().max(50).optional(),
  size: z.enum(['small', 'medium', 'large'], {
    errorMap: () => ({ message: 'Porte deve ser pequeno, médio ou grande' })
  }),
  notes: z.string().max(500).optional()
})

export type PetInput = z.infer<typeof petSchema>
