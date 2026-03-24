import { ArrowLeft, Building, Users, PawPrint, Calendar, DollarSign, Edit, Ban, Check } from "lucide-react"
import { getCompanyById, getCompanyMetrics } from "@/lib/actions/admin"
import { GlassCard } from "@/components/ui/glass-card"
import Link from "next/link"
import { CompanyActionButtons } from "./CompanyActionButtons"
import { CompanyMetrics } from "@/lib/types/admin"
import { ImpersonateButton } from "@/components/admin/ImpersonateButton"

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [companyResult, metricsResult] = await Promise.all([
    getCompanyById(id),
    getCompanyMetrics(id)
  ])

  if (companyResult.error || !companyResult.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">{companyResult.error || "Empresa não encontrada"}</p>
      </div>
    )
  }

  const company = companyResult.data
  const metrics = metricsResult.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/empresas"
          className="p-2 rounded-lg hover:bg-white/10 text-purple-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Building size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{company.name}</h1>
          <p className="text-purple-200/60 text-sm">{company.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {company.active && (
            <ImpersonateButton companyId={company.id} companyName={company.name} />
          )}
          <CompanyActionButtons company={company} />
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
          company.active
            ? 'bg-green-500/20 text-green-300 border-green-500/30'
            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }`}>
          {company.active ? 'Empresa Ativa' : 'Empresa Inativa'}
        </span>
        {company.active && (
          <span className="text-purple-200/60 text-sm">
            Pagando R$ 50/mês
          </span>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users size={20} className="text-blue-400" />
            </div>
            <span className="text-purple-200/60 text-sm">Clientes</span>
          </div>
          <p className="text-3xl font-bold text-white">{metrics?.clientsCount || 0}</p>
        </GlassCard>

        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <PawPrint size={20} className="text-purple-400" />
            </div>
            <span className="text-purple-200/60 text-sm">Pets</span>
          </div>
          <p className="text-3xl font-bold text-white">{metrics?.petsCount || 0}</p>
        </GlassCard>

        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-amber-400" />
            </div>
            <span className="text-purple-200/60 text-sm">Agendamentos (Mês)</span>
          </div>
          <p className="text-3xl font-bold text-white">{metrics?.appointmentsThisMonth || 0}</p>
        </GlassCard>

        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign size={20} className="text-green-400" />
            </div>
            <span className="text-purple-200/60 text-sm">Faturamento</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {metrics?.revenue ? `R$ ${metrics.revenue.toFixed(2)}` : 'R$ 0,00'}
          </p>
        </GlassCard>
      </div>

      {/* Company Info */}
      <GlassCard variant="default" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Informações da Empresa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-purple-200/60 text-sm mb-1">Nome</label>
            <p className="text-white">{company.name}</p>
          </div>
          <div>
            <label className="block text-purple-200/60 text-sm mb-1">Email</label>
            <p className="text-white">{company.email}</p>
          </div>
          <div>
            <label className="block text-purple-200/60 text-sm mb-1">ID</label>
            <p className="text-white font-mono text-sm">{company.id}</p>
          </div>
          <div>
            <label className="block text-purple-200/60 text-sm mb-1">Criada em</label>
            <p className="text-white">
              {new Date(company.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
