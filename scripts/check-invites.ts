/**
 * Check and fix the admin invite in the database
 * Usage: SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npx tsx scripts/check-invites.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  console.log('Usage: SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npx tsx scripts/check-invites.ts')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function checkInvites() {
  console.log('Checking invites...')

  const { data: invites, error } = await supabaseAdmin
    .from('invites')
    .select('*')
    .eq('code', 'ADMIN-SEED-2024')

  if (error) {
    console.error('Error checking invites:', error)
    return
  }

  console.log('Found invites:', invites?.length || 0)
  console.log(JSON.stringify(invites, null, 2))

  // Check if companies exist
  const { data: companies } = await supabaseAdmin
    .from('companies')
    .select('*')

  console.log('\nCompanies:', companies?.length || 0)
  console.log(JSON.stringify(companies, null, 2))
}

checkInvites()
