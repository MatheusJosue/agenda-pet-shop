import { z } from 'zod'

export const packageTypeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  intervalDays: z.number().refine((val) => [7, 15, 30].includes(val), {
    message: 'Intervalo deve ser 7, 15 ou 30 dias'
  }),
  credits: z.number().positive('Créditos devem ser maiores que zero'),
  price: z.number().nonnegative('Preço deve ser maior ou igual a zero')
})

export type PackageTypeInput = z.infer<typeof packageTypeSchema>
