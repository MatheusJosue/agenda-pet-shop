'use client'

import { useState } from 'react'
import { Check, Copy, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { InviteWithDetails, InviteStatus } from '@/lib/types/admin'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'

interface InvitesTableProps {
  invites: (InviteWithDetails & { status: InviteStatus })[]
}

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700',
  used: 'bg-emerald-50 text-emerald-700',
  expired: 'bg-red-50 text-red-700',
}

const statusLabels = {
  pending: 'Pendente',
  used: 'Usado',
  expired: 'Expirado',
}

const roleLabels = {
  admin: 'Admin sistema',
  company_admin: 'Admin empresa',
  company_user: 'Usuario',
}

export function InvitesTable({ invites }: InvitesTableProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    toast.success('Codigo copiado')
    setTimeout(() => setCopied(null), 2000)
  }

  const isExpiringSoon = (invite: InviteWithDetails & { status: InviteStatus }) => {
    if (invite.status !== 'pending') return false
    const daysUntilExpiry = Math.floor((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry < 7 && daysUntilExpiry >= 0
  }

  if (invites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffe0ec] text-[#bf185d]">
          <MoreHorizontal size={22} />
        </div>
        <p className="text-sm font-extrabold text-[#21363a]">Nenhum convite encontrado</p>
        <p className="mt-1 text-xs font-semibold text-[#68797d]">
          Gere um novo convite ou ajuste a busca.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {invites.map((invite) => (
          <InviteCard
            key={invite.id}
            invite={invite}
            copied={copied === invite.code}
            isExpiringSoon={isExpiringSoon(invite)}
            onCopy={() => handleCopy(invite.code)}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-[rgba(232,50,123,0.16)]">
              <th className="p-4 text-left text-xs font-extrabold uppercase text-[#006c73]">Codigo</th>
              <th className="p-4 text-left text-xs font-extrabold uppercase text-[#006c73]">Tipo</th>
              <th className="p-4 text-left text-xs font-extrabold uppercase text-[#006c73]">Empresa</th>
              <th className="p-4 text-left text-xs font-extrabold uppercase text-[#006c73]">Status</th>
              <th className="p-4 text-left text-xs font-extrabold uppercase text-[#006c73]">Expira em</th>
              <th className="p-4 text-right text-xs font-extrabold uppercase text-[#006c73]">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((invite) => (
              <tr
                key={invite.id}
                className={cn(
                  'border-b border-[rgba(232,50,123,0.10)] transition-colors hover:bg-white/58',
                  isExpiringSoon(invite) && 'bg-amber-50/70',
                )}
              >
                <td className="p-4">
                  <code className="rounded-xl bg-[#fff1f6] px-3 py-1.5 font-mono text-sm font-extrabold text-[#bf185d]">
                    {invite.code}
                  </code>
                </td>
                <td className="p-4 text-sm font-semibold text-[#68797d]">
                  {roleLabels[invite.role as keyof typeof roleLabels] || invite.role}
                </td>
                <td className="p-4 text-sm font-extrabold text-[#21363a]">
                  {invite.company_name || '-'}
                </td>
                <td className="p-4">
                  <InviteStatusBadge status={invite.status} />
                </td>
                <td className="p-4 text-sm font-semibold text-[#68797d]">
                  {format(new Date(invite.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopy(invite.code)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-[#bf185d] transition-colors hover:bg-[#ffe0ec]"
                      title="Copiar codigo"
                    >
                      {copied === invite.code ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function InviteCard({
  invite,
  copied,
  isExpiringSoon,
  onCopy,
}: {
  invite: InviteWithDetails & { status: InviteStatus }
  copied: boolean
  isExpiringSoon: boolean
  onCopy: () => void
}) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-[rgba(232,50,123,0.16)] bg-white/68 p-4',
        isExpiringSoon && 'border-amber-200 bg-amber-50/70',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <code className="block truncate rounded-xl bg-[#fff1f6] px-3 py-1.5 font-mono text-sm font-extrabold text-[#bf185d]">
            {invite.code}
          </code>
          <p className="mt-2 truncate text-sm font-extrabold text-[#21363a]">
            {invite.company_name || 'Sem empresa'}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#68797d]">
            {roleLabels[invite.role as keyof typeof roleLabels] || invite.role}
          </p>
        </div>
        <InviteStatusBadge status={invite.status} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-[#68797d]">
          Expira em {format(new Date(invite.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe0ec] text-[#bf185d]"
          aria-label="Copiar codigo"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
    </article>
  )
}

function InviteStatusBadge({ status }: { status: InviteStatus }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-extrabold',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
