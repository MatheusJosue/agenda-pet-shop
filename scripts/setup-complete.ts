/**
 * Complete setup - create company, users, and invites
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://xozfhigdjskmbvszujtr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvemZoaWdkanNrbWJ2c3p1anRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxNDM1NSwiZXhwIjoyMDg5MTkwMzU1fQ.ghc1G6iqkByc3KxBnzkigxwdQ9YxlX7pCuyW3yL4D10'
)

async function setup() {
  console.log('🏗️  Setting up test data...\n')

  // 1. Create company
  const companyResult = await supabaseAdmin
    .from('companies')
    .insert({
      name: 'Pet Shop Exemplo',
      email: 'contato@petshopexemplo.com',
      active: true
    })
    .select()

  if (companyResult.error) {
    console.error('Error creating company:', companyResult.error)
    return
  }

  const company = companyResult.data[0]
  console.log(`✓ Created company: ${company.name} (${company.id})`)

  // 2. Create system admin auth user
  const { data: systemAdminAuth, error: authError1 } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@system.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      name: 'System Admin',
      role: 'admin'
    }
  })

  if (authError1) {
    console.error('Error creating system admin:', authError1)
    return
  }
  console.log(`✓ Created auth user: admin@system.com (System Admin)`)

  // Add system admin to users table
  const { error: userError1 } = await supabaseAdmin.from('users').insert({
    id: systemAdminAuth.user!.id,
    email: 'admin@system.com',
    role: 'admin',
    company_id: company.id
  })
  if (userError1) console.error('Error adding to users table:', userError1)
  else console.log(`✓ Added system admin to users table`)

  // 3. Create company admin auth user
  const { data: companyAdminAuth, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@company.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      name: 'Company Admin',
      role: 'company_admin'
    }
  })

  if (authError2) {
    console.error('Error creating company admin:', authError2)
    return
  }
  console.log(`✓ Created auth user: admin@company.com (Company Admin)`)

  // Add company admin to users table
  const { error: userError2 } = await supabaseAdmin.from('users').insert({
    id: companyAdminAuth.user!.id,
    email: 'admin@company.com',
    role: 'company_admin',
    company_id: company.id
  })
  if (userError2) console.error('Error adding to users table:', userError2)
  else console.log(`✓ Added company admin to users table`)

  // 4. Create system admin invite
  const { error: inviteError1 } = await supabaseAdmin.from('invites').insert({
    code: 'SYSTEM-ADMIN-2024',
    company_id: company.id,
    role: 'admin',
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  })
  if (inviteError1) console.error('Error creating invite:', inviteError1)
  else console.log(`✓ Created invite: SYSTEM-ADMIN-2024 (admin)`)

  // 5. Create company admin invite
  const { error: inviteError2 } = await supabaseAdmin.from('invites').insert({
    code: 'COMPANY-ADMIN-2024',
    company_id: company.id,
    role: 'company_admin',
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  })
  if (inviteError2) console.error('Error creating invite:', inviteError2)
  else console.log(`✓ Created invite: COMPANY-ADMIN-2024 (company_admin)`)

  console.log('\n✅ Setup complete!\n')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('📋 Direct Login (use these for quick testing):')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')
  console.log('🔧 SYSTEM ADMIN → /admin/dashboard')
  console.log('   Email:    admin@system.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('🏢 COMPANY ADMIN → /app')
  console.log('   Email:    admin@company.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🎫 Invite Codes (for testing registration flow):')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')
  console.log('   SYSTEM-ADMIN-2024   → Creates system admin (access /admin)')
  console.log('   COMPANY-ADMIN-2024  → Creates company admin (access /app)')
  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
}

setup().catch(console.error)
