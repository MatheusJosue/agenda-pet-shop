import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://xozfhigdjskmbvszujtr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvemZoaWdkanNrbWJ2c3p1anRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxNDM1NSwiZXhwIjoyMDg5MTkwMzU1fQ.ghc1G6iqkByc3KxBnzkigxwdQ9YxlX7pCuyW3yL4D10'
)

async function addUserToUsersTable() {
  const userId = 'e0fac7ae-a03e-441e-9988-8e75b063793c'
  const email = 'matheusjxcerqueira@gmail.com'

  console.log(`Adding user ${email} to users table...`)

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      email: email,
      role: 'admin',
      company_id: '00000000-0000-0000-0000-000000000001'
    })
    .select()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('✓ User added to users table')
  console.log(JSON.stringify(data, null, 2))
}
addUserToUsersTable()
