'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AdminActionResponse, InviteWithDetails, InviteStatus } from '@/lib/types/admin'
import { createAdminInviteSchema } from '@/lib/validation/admin'

function generateInviteCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INVITE-${random}-${timestamp}`
}

function getInviteStatus(invite: InviteWithDetails): InviteStatus {
  if (invite.accepted_at) return 'used'
  if (new Date(invite.expires_at) < new Date()) return 'expired'
  return 'pending'
}

export async function createInvite(formData: FormData): Promise<AdminActionResponse<InviteWithDetails>> {
  try {
    const validatedFields = createAdminInviteSchema.safeParse({
      companyId: formData.get('companyId'),
      role: formData.get('role'),
      expiresInDays: formData.get('expiresInDays'),
      createNewCompany: formData.get('createNewCompany'),
      newCompanyName: formData.get('newCompanyName'),
      newCompanyEmail: formData.get('newCompanyEmail')
    })

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0]?.message || 'Dados inválidos' }
    }

    let companyId = validatedFields.data.companyId

    // Create new company if requested
    if (validatedFields.data.createNewCompany) {
      const { data: newCompany, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({
          name: validatedFields.data.newCompanyName!,
          email: validatedFields.data.newCompanyEmail!,
          active: true
        })
        .select()
        .single()

      if (companyError) throw companyError
      companyId = newCompany.id
    }

    const expiresAt = new Date(Date.now() + validatedFields.data.expiresInDays * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabaseAdmin
      .from('invites')
      .insert({
        code: generateInviteCode(),
        company_id: companyId,
        role: validatedFields.data.role,
        expires_at: expiresAt
      })
      .select('*, companies(name)')
      .single()

    if (error) throw error

    // Transform nested Supabase join result to flat interface
    const transformed = {
      ...data,
      company_name: (data as any).companies?.name
    } as InviteWithDetails

    revalidatePath('/admin/convites')

    return { data: transformed }
  } catch (error) {
    console.error('Error creating invite:', error)
    return { error: 'Erro ao criar convite' }
  }
}

export async function getInvites(): Promise<AdminActionResponse<(InviteWithDetails & { status: InviteStatus })[]>> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabaseAdmin
      .from('invites')
      .select('*, companies(name)')
      .or(`accepted_at.is.null,expires_at.gte.${thirtyDaysAgo}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform nested Supabase join results and add status
    const invitesWithStatus = (data as any[]).map(invite => ({
      ...invite,
      company_name: invite.companies?.name,
      status: getInviteStatus(invite)
    })) as (InviteWithDetails & { status: InviteStatus })[]

    return { data: invitesWithStatus }
  } catch (error) {
    console.error('Error loading invites:', error)
    return { error: 'Erro ao carregar convites' }
  }
}
