/**
 * Update user role in auth metadata
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function fixUserRole(email: string) {
  console.log(`Looking for user: ${email}`)

  // List all users
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    console.error('Error listing users:', error)
    process.exit(1)
  }

  const user = users.find(u => u.email === email)

  if (!user) {
    console.error(`User not found: ${email}`)
    console.log('Available users:')
    users.forEach(u => console.log(`  - ${u.email} (id: ${u.id})`))
    process.exit(1)
  }

  console.log(`Found user: ${user.email}`)
  console.log(`Current metadata:`, user.user_metadata)

  // Update user metadata with admin role
  const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      role: 'admin'
    }
  })

  if (updateError) {
    console.error('Error updating user:', updateError)
    process.exit(1)
  }

  console.log('✓ User role updated to admin')
  console.log(`New metadata:`, updateData.user?.user_metadata)
  console.log(`\nUser ${email} is now an admin. Please log out and log back in.`)
}

const email = process.argv[2]
if (!email) {
  console.log('Usage: SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npx tsx scripts/fix-user-role.ts <email>')
  process.exit(1)
}

fixUserRole(email)
