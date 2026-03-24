/**
 * Create invite codes for testing
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://xozfhigdjskmbvszujtr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvemZoaWdkanNrbWJ2c3p1anRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxNDM1NSwiZXhwIjoyMDg5MTkwMzU1fQ.ghc1G6iqkByc3KxBnzkigxwdQ9YxlX7pCuyW3yL4D10'
)

async function createInvites() {
  // Get the company
  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('*')
    .single()

  if (!company) {
    console.error('No company found')
    return
  }

  // Create invite for system admin
  const { data: adminInvite } = await supabaseAdmin
    .from('invites')
    .insert({
      code: 'SYSTEM-ADMIN-2024',
      company_id: company.id,
      role: 'admin',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single()

  console.log(`✓ System Admin Invite: ${adminInvite.code}`)

  // Create invite for company admin
  const { data: companyInvite } = await supabaseAdmin
    .from('invites')
    .insert({
      code: 'COMPANY-ADMIN-2024',
      company_id: company.id,
      role: 'company_admin',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single()

  console.log(`✓ Company Admin Invite: ${companyInvite.code}`)

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('🎫 Invite Codes for Registration:')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')
  console.log('System Admin (access /admin):')
  console.log('  Code: SYSTEM-ADMIN-2024')
  console.log('')
  console.log('Company Admin (access /app):')
  console.log('  Code: COMPANY-ADMIN-2024')
  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
}

createInvites()
