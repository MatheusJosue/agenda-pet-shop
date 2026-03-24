'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { InviteWithDetails, InviteStatus } from '@/lib/types/admin'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'

interface InvitesTableProps {
  invites: (InviteWithDetails & { status: InviteStatus })[]
}

const statusStyles = {
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  used: 'bg-green-500/20 text-green-300 border-green-500/30',
  expired: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const statusLabels = {
  pending: 'Pendente',
  used: 'Usado',
  expired: 'Expirado',
}

const roleLabels = {
  admin: 'System Admin',
  company_admin: 'Admin Empresa',
  company_user: 'Usuário',
}

export function InvitesTable({ invites }: InvitesTableProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    toast.success('Código copiado!')
    setTimeout(() => setCopied(null), 2000)
  }

  const isExpiringSoon = (invite: InviteWithDetails & { status: InviteStatus }) => {
    if (invite.status !== 'pending') return false
    const daysUntilExpiry = Math.floor((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry < 7 && daysUntilExpiry >= 0
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Código</th>
            <th className="text-left p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Tipo</th>
            <th className="text-left p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Empresa</th>
            <th className="text-left p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Status</th>
            <th className="text-left p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Expira em</th>
            <th className="text-right p-4 text-purple-200/80 font-medium text-sm uppercase tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <tr
              key={invite.id}
              className={cn(
                'border-b border-white/5 hover:bg-white/5 transition-colors',
                isExpiringSoon(invite) && 'bg-amber-500/10'
              )}
            >
              <td className="p-4">
                <code className="text-purple-300 font-mono text-sm bg-purple-500/10 px-2 py-1 rounded">
                  {invite.code}
                </code>
              </td>
              <td className="p-4 text-gray-300 text-sm">
                {roleLabels[invite.role as keyof typeof roleLabels] || invite.role}
              </td>
              <td className="p-4 text-white text-sm">{invite.company_name || '-'}</td>
              <td className="p-4">
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border',
                  statusStyles[invite.status]
                )}>
                  {statusLabels[invite.status]}
                </span>
              </td>
              <td className="p-4 text-gray-300 text-sm">
                {format(new Date(invite.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
              </td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleCopy(invite.code)}
                    className="p-2 rounded-lg hover:bg-white/10 text-purple-300 hover:text-white transition-colors"
                    title="Copiar código"
                  >
                    {copied === invite.code ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invites.length === 0 && (
        <div className="text-center py-12 text-purple-200/60">
          Nenhum convite encontrado
        </div>
      )}
    </div>
  )
}
