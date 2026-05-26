'use client'

import { useEffect, useState } from "react"
import { CheckCircle2, Clock, Plus, Search, Ticket, XCircle } from "lucide-react"
import { InvitesTable } from "@/components/admin/InvitesTable"
import { CreateInviteModal } from "@/components/admin/CreateInviteModal"
import { Button } from "@/components/ui/button"
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
    setLoading(true)
    Promise.all([getInvites(), getAllCompanies()]).then(([invitesResult, companiesResult]) => {
      if (invitesResult.data) setInvites(invitesResult.data)
      if (companiesResult.data) setCompanies(companiesResult.data)
      setLoading(false)
    })
  }, [showModal])

  const pendingCount = invites.filter((invite) => invite.status === 'pending').length
  const usedCount = invites.filter((invite) => invite.status === 'used').length
  const expiredCount = invites.filter((invite) => invite.status === 'expired').length

  const filteredInvites = invites.filter((invite) =>
    invite.code.toLowerCase().includes(search.toLowerCase()) ||
    invite.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e8327b] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:gap-6 lg:py-6">
      <section className="rounded-3xl border border-[rgba(232,50,123,0.18)] bg-white/72 p-5 shadow-[0_10px_28px_rgba(33,54,58,0.07)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ffe0ec] text-[#bf185d]">
              <Ticket size={24} />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase text-[#bf185d]">
                Convites
              </p>
              <h2 className="text-2xl font-extrabold text-[#21363a] sm:text-3xl">
                Acesso de empresas
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#68797d]">
                Gere convites para novas contas e acompanhe expiracao ou uso.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="h-11 rounded-2xl px-4"
          >
            <Plus size={18} className="mr-2" />
            Novo convite
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <SummaryCard icon={Clock} label="Pendentes" value={pendingCount} tone="orange" />
        <SummaryCard icon={CheckCircle2} label="Usados" value={usedCount} tone="green" />
        <SummaryCard icon={XCircle} label="Expirados" value={expiredCount} tone="red" />
      </section>

      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006c73]"
        />
        <input
          type="text"
          placeholder="Buscar por codigo ou empresa..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/78 py-3 pl-12 pr-4 text-sm font-semibold text-[#21363a] shadow-[0_8px_22px_rgba(33,54,58,0.06)] outline-none transition-all placeholder:text-[#9aa9ac] focus:border-[#e8327b]/45 focus:ring-4 focus:ring-[#ffe0ec]"
        />
      </div>

      <section className="rounded-3xl border border-[rgba(232,50,123,0.18)] bg-white/72 p-3 shadow-[0_10px_28px_rgba(33,54,58,0.07)] backdrop-blur-sm sm:p-4">
        <InvitesTable invites={filteredInvites} />
      </section>

      {showModal && (
        <CreateInviteModal
          companies={companies}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock
  label: string
  value: number
  tone: "orange" | "green" | "red"
}) {
  const toneClass = {
    orange: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  }[tone]

  return (
    <div className="rounded-2xl border border-[rgba(232,50,123,0.16)] bg-white/72 p-4 text-center shadow-[0_8px_22px_rgba(33,54,58,0.06)]">
      <span className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon size={18} />
      </span>
      <p className="text-2xl font-extrabold text-[#21363a]">{value}</p>
      <p className="text-[0.68rem] font-extrabold uppercase text-[#68797d]">{label}</p>
    </div>
  )
}
