import { z } from 'zod'

export const appointmentSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  petId: z.string().uuid('ID do pet inválido'),
  servicePriceIds: z
    .array(z.string().uuid('ID do serviço inválido'))
    .min(1, 'Selecione pelo menos um serviço'),
  servicePrices: z
    .array(z.object({
      servicePriceId: z.string().uuid('ID do serviço inválido'),
      price: z.coerce.number().min(0, 'Preço inválido'),
    }))
    .optional(),
  totalPrice: z.coerce.number().min(0, 'Preço total inválido').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  useCredit: z.boolean().default(false),
  clientPlanId: z.string().uuid().optional(),
  petPackageId: z.string().uuid().optional(),
  createPackageRecurrence: z.boolean().default(false),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').nullable().optional(),
})

export const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>
