import { Building } from 'lucide-react'
import { CompaniesTable } from '@/components/admin/CompaniesTable'
import { getAllCompanies } from '@/lib/actions/admin'
import { GlassCard } from '@/components/ui/glass-card'

export default async function AdminEmpresasPage() {
  const result = await getAllCompanies()

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">{result.error || 'Erro ao carregar empresas'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Building size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Empresas</h1>
          <p className="text-purple-200/60">Gerencie as empresas cadastradas</p>
        </div>
      </div>

      {/* Table */}
      <GlassCard variant="default" className="p-6">
        <CompaniesTable companies={result.data} />
      </GlassCard>
    </div>
  )
}
