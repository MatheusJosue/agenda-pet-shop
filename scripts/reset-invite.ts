/**
 * Reset or create a new admin invite
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function resetInvite() {
  const code = 'ADMIN-SEED-2024'

  console.log(`Resetting invite code: ${code}`)

  // Reset the existing invite
  const { data, error } = await supabaseAdmin
    .from('invites')
    .update({
      accepted_at: null,
      accepted_by: null,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    })
    .eq('code', code)
    .select()

  if (error) {
    console.error('Error resetting invite:', error)
    process.exit(1)
  }

  console.log('✓ Invite reset successfully!')
  console.log('You can now use the code:', code)
  console.log('Details:', JSON.stringify(data, null, 2))
}

resetInvite()
