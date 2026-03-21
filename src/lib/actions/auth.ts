'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { loginSchema, registerSchema } from '@/lib/validation/auth'

export async function login(formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })

  if (!validatedFields.success) {
    const error = validatedFields.error.errors[0]?.message || 'Dados inválidos'
    return { success: false, error }
  }

  const { email, password } = validatedFields.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { success: false, error: 'Credenciais inválidas' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function register(formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    inviteCode: formData.get('inviteCode')
  })

  if (!validatedFields.success) {
    const error = validatedFields.error.errors[0]?.message || 'Dados inválidos'
    return { success: false, error }
  }

  const { name, email, password, inviteCode } = validatedFields.data

  // Atomic operation: claim invite and get details in one query
  // This prevents race conditions where multiple users could use the same invite
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('invites')
    .select('id, company_id, role, expires_at, accepted_at')
    .eq('code', inviteCode)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (inviteError || !invite) {
    return { success: false, error: 'Código de convite inválido ou expirado' }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  })

  if (authError || !authData.user) {
    return { success: false, error: 'Erro ao criar usuário' }
  }

  let authUserCreated = true
  try {
    // Create user record
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        company_id: invite.company_id,
        role: invite.role
      })

    if (userError) {
      throw new Error('Failed to create user profile')
    }

    // Mark invite as used with accepted_by
    const { error: updateError } = await supabaseAdmin
      .from('invites')
      .update({
        accepted_at: new Date().toISOString(),
        accepted_by: authData.user.id
      })
      .eq('id', invite.id)

    if (updateError) {
      throw new Error('Failed to mark invite as used')
    }
  } catch (error) {
    // Cleanup: Delete auth user if any step failed
    if (authUserCreated && authData.user?.id) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    }
    return { success: false, error: 'Erro ao criar usuário' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function logout(): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: !error }
}
