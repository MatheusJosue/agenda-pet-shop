/**
 * Clean database and setup test users
 * Creates:
 * 1. System Admin (admin@system.com) - Accesses /admin - System-wide view
 * 2. Company Admin (admin@company.com) - Accesses /app - Company-specific view
 */

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://xozfhigdjskmbvszujtr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvemZoaWdkanNrbWJ2c3p1anRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxNDM1NSwiZXhwIjoyMDg5MTkwMzU1fQ.ghc1G6iqkByc3KxBnzkigxwdQ9YxlX7pCuyW3yL4D10'
)

async function cleanAndSetup() {
  console.log('🧹 Cleaning database...\n')

  // 1. Delete all users from auth
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
  for (const user of users) {
    await supabaseAdmin.auth.admin.deleteUser(user.id)
    console.log(`  Deleted auth user: ${user.email}`)
  }

  // 2. Delete all from users table
  await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000001')
  console.log('  Deleted users table records')

  // 3. Delete all invites
  await supabaseAdmin.from('invites').delete().neq('code', 'none')
  console.log('  Deleted invites')

  // 4. Delete all companies (except maybe keep one)
  const { data: companies } = await supabaseAdmin.from('companies').select('*')
  if (companies && companies.length > 0) {
    await supabaseAdmin.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000001')
    console.log('  Deleted companies')
  }

  console.log('\n✅ Database cleaned!\n')
  console.log('🏗️  Setting up test data...\n')

  // Create company for company admin
  const { data: company } = await supabaseAdmin
    .from('companies')
    .insert({
      name: 'Pet Shop Exemplo',
      email: 'contato@petshopexemplo.com',
      active: true
    })
    .select()
    .single()

  console.log(`✓ Created company: ${company.name} (${company.id})`)

  // Create system admin auth user
  const { data: systemAdminAuth } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@system.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      name: 'System Admin',
      role: 'admin'
    }
  })
  console.log(`✓ Created auth user: admin@system.com (System Admin)`)

  // Add system admin to users table
  await supabaseAdmin.from('users').insert({
    id: systemAdminAuth.user!.id,
    email: 'admin@system.com',
    role: 'admin',
    company_id: company.id // System admin also needs a company_id
  })
  console.log(`✓ Added system admin to users table`)

  // Create company admin auth user
  const { data: companyAdminAuth } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@company.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      name: 'Company Admin',
      role: 'company_admin'
    }
  })
  console.log(`✓ Created auth user: admin@company.com (Company Admin)`)

  // Add company admin to users table
  await supabaseAdmin.from('users').insert({
    id: companyAdminAuth.user!.id,
    email: 'admin@company.com',
    role: 'company_admin',
    company_id: company.id
  })
  console.log(`✓ Added company admin to users table`)

  console.log('\n✅ Setup complete!\n')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('📋 Test Users:')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')
  console.log('🔧 SYSTEM ADMIN (access: /admin)')
  console.log('   Email:    admin@system.com')
  console.log('   Password: admin123')
  console.log('   Role:     admin')
  console.log('   Access:   http://localhost:3000/admin/dashboard')
  console.log('')
  console.log('🏢 COMPANY ADMIN (access: /app)')
  console.log('   Email:    admin@company.com')
  console.log('   Password: admin123')
  console.log('   Role:     company_admin')
  console.log('   Access:   http://localhost:3000/app')
  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
}

cleanAndSetup().catch(console.error)
