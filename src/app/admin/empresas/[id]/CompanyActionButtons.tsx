'use client'

import { useState } from 'react'
import { Edit, Ban, Check } from 'lucide-react'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toggleCompanyStatus } from '@/lib/actions/admin'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CompanyActionButtonsProps {
  company: CompanyWithMetrics
}

export function CompanyActionButtons({ company }: CompanyActionButtonsProps) {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleToggleStatus = async () => {
    if (company.active) {
      setShowConfirm(true)
      return
    }

    setToggling(true)
    try {
      const result = await toggleCompanyStatus(company.id, true)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Empresa reativada com sucesso')
        router.refresh()
      }
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setToggling(false)
    }
  }

  const confirmDeactivation = async () => {
    setToggling(true)
    try {
      const result = await toggleCompanyStatus(company.id, false)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Empresa desativada com sucesso')
        router.refresh()
      }
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setToggling(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          className={cn(
            'px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all',
            company.active
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
          )}
          onClick={handleToggleStatus}
          disabled={toggling}
        >
          {toggling ? (
            'Processando...'
          ) : company.active ? (
            <>
              <Ban size={18} />
              Desativar
            </>
          ) : (
            <>
              <Check size={18} />
              Reativar
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900/20 border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <Ban size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Desativar empresa?</h3>
            <p className="text-purple-200/70 mb-6">
              Você tem certeza que deseja desativar <strong className="text-white">{company.name}</strong>?
              A empresa não poderá mais acessar o sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={toggling}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeactivation}
                disabled={toggling}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600 transition-colors"
              >
                {toggling ? 'Desativando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
