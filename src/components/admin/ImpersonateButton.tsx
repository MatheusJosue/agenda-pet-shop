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
      type="button"
      onClick={startImpersonation}
      disabled={loading}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-[#ffe0ec] px-4 text-sm font-extrabold text-[#bf185d] transition-all hover:bg-[#ffd0e2] disabled:opacity-50 sm:w-auto"
    >
      <Eye size={18} />
      <>
        {loading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#e8327b] border-t-transparent" />
        )}
        {!loading && 'Ver como esta empresa'}
      </>
    </button>
  )
}
