/**
 * Create First Admin User
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts <email> <password>
 *
 * This script:
 * 1. Creates the first company
 * 2. Creates an admin user
 * 3. Creates an invite code for future admin registrations
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually for tsx
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && !process.env[key] && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  })
} catch {
  // .env.local might not exist, continue anyway
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Check .env.local')
  process.exit(1)
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.log('Usage: npx tsx scripts/create-admin.ts <email> <password>')
  console.log('Example: npx tsx scripts/create-admin.ts admin@petshop.com mySecurePassword123!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  try {
    console.log('🚀 Creating first admin user...\n')

    // 1. Create company
    console.log('📦 Creating company...')
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Admin Company',
        email: email
      })
      .select()
      .single()

    if (companyError && !companyError.message.includes('duplicate')) {
      throw companyError
    }
    console.log('✅ Company created:', company?.id || 'Already exists')

    const companyId = company?.id || '00000000-0000-0000-0000-000000000001'

    // 2. Create auth user
    console.log('\n👤 Creating admin user...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: 'Admin'
      }
    })

    if (authError) {
      // User might already exist, try to get it
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existingUser = users.find(u => u.email === email)
      if (existingUser) {
        console.log('⚠️  User already exists, using existing account')
      } else {
        throw authError
      }
    } else {
      console.log('✅ Auth user created:', authData.user.id)
    }

    const userId = authData?.user?.id

    // 3. Create user profile
    console.log('\n📝 Creating user profile...')
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        role: 'admin',
        company_id: companyId
      }, {
        onConflict: 'id'
      })

    if (userError) {
      throw userError
    }
    console.log('✅ User profile created')

    // 4. Create admin invite code
    console.log('\n🎫 Creating admin invite code...')
    const inviteCode = `ADMIN-${Date.now().toString(36).toUpperCase()}`
    const { error: inviteError } = await supabase
      .from('invites')
      .insert({
        code: inviteCode,
        company_id: companyId,
        role: 'admin',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError && !inviteError.message.includes('duplicate')) {
      throw inviteError
    }
    console.log('✅ Invite code created:', inviteCode)

    console.log('\n✨ Admin setup complete!\n')
    console.log('📋 Login credentials:')
    console.log('   Email:', email)
    console.log('   Password: [your password]')
    console.log('\n🎫 Additional admin invite code:', inviteCode)
    console.log('\n🔐 You can now login at: http://localhost:3000/login')

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

createAdmin()
