import { Users, Dog, Calendar, DollarSign, Building2 } from 'lucide-react'
import { CompanyDetailHeader } from '@/components/admin/CompanyDetailHeader'
import { MetricCard } from '@/components/admin/MetricCard'
import { getCompanyById, getCompanyMetrics } from '@/lib/actions/admin'
import { notFound } from 'next/navigation'

export default async function AdminEmpresaDetailPage({
  params
}: {
  params: { id: string }
}) {
  const companyResult = await getCompanyById(params.id)
  const metricsResult = await getCompanyMetrics(params.id)

  if (companyResult.error || !companyResult.data) {
    notFound()
  }

  const company = companyResult.data
  const metrics = metricsResult.data

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-8">
      <CompanyDetailHeader company={company} />

      {/* Metrics */}
      {metrics && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Users}
            label="Total de Clientes"
            value={metrics.clientsCount}
            color="purple"
          />
          <MetricCard
            icon={Dog}
            label="Total de Pets"
            value={metrics.petsCount}
            color="pink"
          />
          <MetricCard
            icon={Calendar}
            label="Agendamentos Mês"
            value={metrics.appointmentsThisMonth}
            color="blue"
          />
          <MetricCard
            icon={DollarSign}
            label="Receita Estimada"
            value={formatCurrency(metrics.revenue)}
            color="green"
          />
        </section>
      )}

      {/* Info Card */}
      <section className="bg-white/10 border border-white/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building2 size={20} />
          Informações da Empresa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-purple-200/60">ID:</span>
            <span className="ml-2 text-white font-mono">{company.id}</span>
          </div>
          <div>
            <span className="text-purple-200/60">Email:</span>
            <span className="ml-2 text-white">{company.email}</span>
          </div>
          <div>
            <span className="text-purple-200/60">Criada em:</span>
            <span className="ml-2 text-white">
              {new Date(company.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="text-purple-200/60">Status:</span>
            <span className="ml-2 text-white">{company.active ? 'Ativa' : 'Inativa'}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
