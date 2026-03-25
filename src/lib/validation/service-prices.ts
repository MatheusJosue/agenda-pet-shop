// src/lib/validation/service-prices.ts

import { z } from 'zod'

export const sizeCategorySchema = z.enum(['tiny', 'small', 'medium', 'large', 'giant'], {
  errorMap: () => ({ message: 'Porte deve ser tiny, small, medium, large ou giant' })
})

export const billingTypeSchema = z.enum(['avulso', 'pacote'], {
  errorMap: () => ({ message: 'Tipo de cobrança deve ser avulso ou pacote' })
})

export const hairTypeSchema = z.enum(['PC', 'PL'], {
  errorMap: () => ({ message: 'Tipo de pelo deve ser PC ou PL' })
})

export const servicePriceSchema = z.object({
  serviceName: z.string().min(1, 'Nome do serviço é obrigatório'),
  billingType: billingTypeSchema,
  hairType: hairTypeSchema.nullable().optional(),
  sizeCategory: sizeCategorySchema,
  price: z.number().positive('Preço deve ser positivo')
})

export type ServicePriceInput = z.infer<typeof servicePriceSchema>

export const bulkUpdateSchema = z.object({
  updates: z.array(servicePriceSchema).min(1, 'Pelo menos um preço é obrigatório')
})

export const getPriceParamsSchema = z.object({
  serviceName: z.string().min(1),
  billingType: billingTypeSchema,
  petSize: sizeCategorySchema,
  hairType: hairTypeSchema.optional()
})

export type GetPriceParams = z.infer<typeof getPriceParamsSchema>
