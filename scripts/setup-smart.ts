/**
 * Smart setup - check existing data and create what's needed
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://xozfhigdjskmbvszujtr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvemZoaWdkanNrbWJ2c3p1anRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxNDM1NSwiZXhwIjoyMDg5MTkwMzU1fQ.ghc1G6iqkByc3KxBnzkigxwdQ9YxlX7pCuyW3yL4D10'
)

async function setup() {
  console.log('🔍 Checking existing data...\n')

  // Check existing company
  const { data: existingCompany } = await supabaseAdmin
    .from('companies')
    .select('*')
    .limit(1)

  let company
  if (existingCompany && existingCompany.length > 0) {
    company = existingCompany[0]
    console.log(`✓ Using existing company: ${company.name} (${company.id})`)
  } else {
    // Create company
    const result = await supabaseAdmin
      .from('companies')
      .insert({
        name: 'Pet Shop Exemplo',
        email: 'contato@petshopexemplo.com',
        active: true
      })
      .select()
    company = result.data![0]
    console.log(`✓ Created company: ${company.name} (${company.id})`)
  }

  console.log('\n👥 Creating users...\n')

  // Create or update system admin
  const { data: systemAdminAuth, error: authError1 } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@system.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      name: 'System Admin',
      role: 'admin'
    }
  })

  if (!authError1) {
    console.log(`✓ Created auth user: admin@system.com (System Admin)`)

    // Upsert to users table
    await supabaseAdmin.from('users').upsert({
      id: systemAdminAuth.user!.id,
      email: 'admin@system.com',
      role: 'admin',
      company_id: company.id
    }, { onConflict: 'id' })
    console.log(`✓ Added system admin to users table`)
  } else if (authError1.message.includes('already exists')) {
    console.log(`  - admin@system.com already exists, skipping...`)
  }

  // Create or update company admin
  const { data: companyAdminAuth, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@company.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      name: 'Company Admin',
      role: 'company_admin'
    }
  })

  if (!authError2) {
    console.log(`✓ Created auth user: admin@company.com (Company Admin)`)

    // Upsert to users table
    await supabaseAdmin.from('users').upsert({
      id: companyAdminAuth.user!.id,
      email: 'admin@company.com',
      role: 'company_admin',
      company_id: company.id
    }, { onConflict: 'id' })
    console.log(`✓ Added company admin to users table`)
  } else if (authError2.message.includes('already exists')) {
    console.log(`  - admin@company.com already exists, skipping...`)
  }

  console.log('\n🎫 Creating invites...\n')

  // Create system admin invite
  await supabaseAdmin.from('invites').upsert({
    code: 'SYSTEM-ADMIN-2024',
    company_id: company.id,
    role: 'admin',
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    accepted_at: null,
    accepted_by: null
  }, { onConflict: 'code' })
  console.log(`✓ Invite: SYSTEM-ADMIN-2024 (admin)`)

  // Create company admin invite
  await supabaseAdmin.from('invites').upsert({
    code: 'COMPANY-ADMIN-2024',
    company_id: company.id,
    role: 'company_admin',
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    accepted_at: null,
    accepted_by: null
  }, { onConflict: 'code' })
  console.log(`✓ Invite: COMPANY-ADMIN-2024 (company_admin)`)

  console.log('\n✅ Setup complete!\n')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('📋 Direct Login:')
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
  console.log('🎫 Invite Codes (registration):')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')
  console.log('   SYSTEM-ADMIN-2024   → Creates system admin')
  console.log('   COMPANY-ADMIN-2024  → Creates company admin')
  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
}

setup().catch(console.error)
