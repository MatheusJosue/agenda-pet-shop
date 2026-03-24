/**
 * Update a user's role to admin in Supabase Auth
 * Usage: npx tsx scripts/update-admin-role.ts <email>
 */

import { supabaseAdmin } from '../src/lib/supabase/admin'
import { createClient } from '../src/lib/supabase/client'

const supabaseClient = createClient()

async function updateUserRole(email: string) {
  try {
    // Get user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      process.exit(1)
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      console.error(`User with email "${email}" not found`)
      console.log('Available users:')
      users.forEach(u => console.log(`  - ${u.email} (${u.id})`))
      process.exit(1)
    }

    console.log(`Found user: ${user.email} (${user.id})`)
    console.log(`Current metadata:`, user.user_metadata)

    // Update user metadata to include admin role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: 'admin',
        name: user.user_metadata?.name || user.email?.split('@')[0]
      }
    })

    if (error) {
      console.error('Error updating user:', error)
      process.exit(1)
    }

    console.log(`✓ User role updated to admin`)
    console.log(`New metadata:`, data.user?.user_metadata)
    console.log(`\nPlease log out and log back in for the changes to take effect.`)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

// Get email from command line
const email = process.argv[2]

if (!email) {
  console.log('Usage: npx tsx scripts/update-admin-role.ts <email>')
  console.log('Example: npx tsx scripts/update-admin-role.ts myemail@example.com')
  process.exit(1)
}

updateUserRole(email)
