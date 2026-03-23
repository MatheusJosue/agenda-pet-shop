import { z } from 'zod'

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo').optional(),
  email: z.string().email('Email inválido').optional()
})

export const createAdminInviteSchema = z.object({
  companyId: z.string().uuid('Empresa inválida'),
  role: z.enum(['company_admin', 'company_user'], {
    errorMap: () => ({ message: 'Role deve ser company_admin ou company_user' })
  }),
  expiresInDays: z.number().min(1, 'Mínimo 1 dia').max(365, 'Máximo 365 dias').default(365),
  createNewCompany: z.boolean().default(false),
  newCompanyName: z.string().min(1, 'Nome é obrigatório').optional(),
  newCompanyEmail: z.string().email('Email inválido').optional()
}).refine(
  (data) => !data.createNewCompany || (data.newCompanyName && data.newCompanyEmail),
  {
    message: "Nome e email da empresa são obrigatórios ao criar nova empresa",
    path: ["newCompanyName"]
  }
)

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
export type CreateAdminInviteInput = z.infer<typeof createAdminInviteSchema>
