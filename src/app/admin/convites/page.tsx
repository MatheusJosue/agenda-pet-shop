'use client'

import { Ticket, Plus, Search } from "lucide-react"
import { InvitesTable } from "@/components/admin/InvitesTable"
import { CreateInviteModal } from "@/components/admin/CreateInviteModal"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { getInvites } from "@/lib/actions/invites"
import { getAllCompanies } from "@/lib/actions/admin"
import { InviteWithDetails, InviteStatus, CompanyWithMetrics } from "@/lib/types/admin"

export default function AdminConvitesPage() {
  const [invites, setInvites] = useState<(InviteWithDetails & { status: InviteStatus })[]>([])
  const [companies, setCompanies] = useState<CompanyWithMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    Promise.all([getInvites(), getAllCompanies()]).then(([invitesResult, companiesResult]) => {
      if (invitesResult.data) setInvites(invitesResult.data)
      if (companiesResult.data) setCompanies(companiesResult.data)
      setLoading(false)
    })
  }, [showModal])

  const pendingCount = invites.filter(i => i.status === 'pending').length
  const usedCount = invites.filter(i => i.status === 'used').length
  const expiredCount = invites.filter(i => i.status === 'expired').length

  const filteredInvites = invites.filter(invite =>
    invite.code.toLowerCase().includes(search.toLowerCase()) ||
    invite.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Ticket size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Convites</h1>
            <p className="text-purple-200/60 text-sm">
              {invites.length} convite{invites.length !== 1 ? "s" : ""} cadastrado
              {invites.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" />
          Novo Convite
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200/60"
        />
        <input
          type="text"
          placeholder="Buscar por código ou empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-200/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard variant="default" className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
            <p className="text-xs text-purple-200/60 uppercase tracking-wide">Pendentes</p>
          </div>
        </GlassCard>
        <GlassCard variant="default" className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{usedCount}</p>
            <p className="text-xs text-purple-200/60 uppercase tracking-wide">Usados</p>
          </div>
        </GlassCard>
        <GlassCard variant="default" className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{expiredCount}</p>
            <p className="text-xs text-purple-200/60 uppercase tracking-wide">Expirados</p>
          </div>
        </GlassCard>
      </div>

      {/* List */}
      <GlassCard variant="default" className="overflow-hidden p-0">
        <InvitesTable invites={filteredInvites} />
      </GlassCard>

      {/* Modal */}
      {showModal && (
        <CreateInviteModal
          companies={companies}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
