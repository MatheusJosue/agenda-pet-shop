'use client'

import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface ImpersonateButtonProps {
  companyId: string
  companyName: string
}

export function ImpersonateButton({ companyId, companyName }: ImpersonateButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const startImpersonation = () => {
    setLoading(true)
    try {
      // Set cookie for impersonation (30 days)
      document.cookie = `impersonate_company_id=${companyId}; path=/; max-age=${30 * 24 * 60 * 60}`
      toast.success(`Personificando ${companyName}`)
      router.push('/app')
    } catch {
      toast.error('Erro ao iniciar personificação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={startImpersonation}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 font-medium flex items-center gap-2 transition-all disabled:opacity-50"
    >
      <Eye size={18} />
      {loading ? 'Carregando...' : 'Ver como esta empresa'}
    </button>
  )
}
