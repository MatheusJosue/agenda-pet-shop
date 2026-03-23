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
  pending: 'bg-blue-500/20 text-blue-300',
  used: 'bg-green-500/20 text-green-300',
  expired: 'bg-gray-500/20 text-gray-300',
}

const statusLabels = {
  pending: 'Pendente',
  used: 'Usado',
  expired: 'Expirado',
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
            <th className="text-left p-4 text-purple-200 font-medium">Código</th>
            <th className="text-left p-4 text-purple-200 font-medium">Role</th>
            <th className="text-left p-4 text-purple-200 font-medium">Empresa</th>
            <th className="text-left p-4 text-purple-200 font-medium">Status</th>
            <th className="text-left p-4 text-purple-200 font-medium">Expira em</th>
            <th className="text-left p-4 text-purple-200 font-medium">Aceito por</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <tr
              key={invite.id}
              className={cn(
                'border-b border-white/5',
                isExpiringSoon(invite) && 'bg-yellow-500/10'
              )}
            >
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <code className="text-purple-300 font-mono text-sm">{invite.code}</code>
                  <button
                    onClick={() => handleCopy(invite.code)}
                    className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                    title="Copiar código"
                  >
                    {copied === invite.code ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </td>
              <td className="p-4 text-gray-300 capitalize">{invite.role.replace('_', ' ')}</td>
              <td className="p-4 text-white">{invite.company_name || '-'}</td>
              <td className="p-4">
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusStyles[invite.status])}>
                  {statusLabels[invite.status]}
                </span>
              </td>
              <td className="p-4 text-gray-300">
                {format(new Date(invite.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
              </td>
              <td className="p-4 text-gray-300">{invite.accepted_by ? 'Sim' : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {invites.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Nenhum convite encontrado
        </div>
      )}
    </div>
  )
}
