import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminLayoutClient } from '@/components/layout/admin-layout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check if user is admin
  const userRole = session.user?.user_metadata?.role
  if (userRole !== 'admin') {
    redirect('/app')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
