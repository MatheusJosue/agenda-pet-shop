'use client'

import { X, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ImpersonationBanner({ companyName }: { companyName: string }) {
  const router = useRouter()
  const [visible, setVisible] = useState(true)

  const endImpersonation = () => {
    // Remove the impersonation cookie
    document.cookie = 'impersonate_company_id=; path=/; max-age=0'
    router.push('/admin/empresas')
    router.refresh()
  }

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Eye size={16} />
          <span className="font-medium">Modo de personificação:</span>
          <span className="bg-white/20 px-2 py-0.5 rounded">Você está vendo como <strong>{companyName}</strong></span>
        </div>
        <button
          onClick={endImpersonation}
          className="flex items-center gap-2 text-sm font-medium hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          <X size={16} />
          Sair da personificação
        </button>
      </div>
    </div>
  )
}
