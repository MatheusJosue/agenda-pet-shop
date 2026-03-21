import { z } from 'zod'

export const appointmentSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  petId: z.string().uuid('ID do pets inválido'),
  serviceId: z.string().uuid('ID do serviço inválido'),
  date: z.coerce.date().min(new Date(), 'Data deve ser futura'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  useCredit: z.boolean().default(false),
  clientPlanId: z.string().uuid().optional(),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional()
})

export const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'completed', 'cancelled'])
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>
