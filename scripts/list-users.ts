import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://xozfhigdjskmbvszujtr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvemZoaWdkanNrbWJ2c3p1anRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxNDM1NSwiZXhwIjoyMDg5MTkwMzU1fQ.ghc1G6iqkByc3KxBnzkigxwdQ9YxlX7pCuyW3yL4D10'
)

async function listUsers() {
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
  console.log('Users:')
  users.forEach(u => {
    console.log(`  - ${u.email}`)
    console.log(`    Role: ${u.user_metadata?.role || 'NOT SET'}`)
    console.log(`    ID: ${u.id}`)
    console.log('')
  })
}
listUsers()
