import { Ticket } from 'lucide-react'
import { InvitesTable } from '@/components/admin/InvitesTable'
import { CreateInviteForm } from '@/components/admin/CreateInviteForm'
import { getInvites } from '@/lib/actions/invites'
import { getAllCompanies } from '@/lib/actions/admin'
import { GlassCard } from '@/components/ui/glass-card'

export default async function AdminConvitesPage() {
  const [invitesResult, companiesResult] = await Promise.all([
    getInvites(),
    getAllCompanies()
  ])

  if (invitesResult.error || !invitesResult.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">{invitesResult.error || 'Erro ao carregar convites'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Ticket size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Convites</h1>
          <p className="text-purple-200/60">Gerencie códigos de convite</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <CreateInviteForm companies={companiesResult.data || []} />
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <GlassCard variant="default" className="p-6">
            <InvitesTable invites={invitesResult.data} />
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
