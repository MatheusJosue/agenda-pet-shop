import { Building, DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react"
import { MetricCard } from "@/components/admin/MetricCard"
import { MonthlyAppointmentsChart } from "@/components/admin/MonthlyAppointmentsChart"
import { getAdminDashboardStats } from "@/lib/actions/admin"
import { GlassCard } from "@/components/ui/glass-card"
import { formatCurrency } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardStats()

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">{result.error || "Erro ao carregar dashboard"}</p>
      </div>
    )
  }

  const { companiesCount, revenue, activeCompanies, clientsCount, monthlyAppointments } = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-purple-200/60 text-sm">Visão geral do sistema</p>
      </div>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Building}
          label="Total de Empresas"
          value={companiesCount}
          color="purple"
        />
        <MetricCard
          icon={DollarSign}
          label="Faturamento"
          value={formatCurrency(revenue)}
          color="green"
        />
        <MetricCard
          icon={TrendingUp}
          label="Empresas Ativas"
          value={activeCompanies}
          color="blue"
        />
        <MetricCard
          icon={Users}
          label="Total de Clientes"
          value={clientsCount}
          color="pink"
        />
      </section>

      {/* Chart */}
      <section>
        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Agendamentos por Mês</h2>
          </div>
          <MonthlyAppointmentsChart data={monthlyAppointments} />
        </GlassCard>
      </section>
    </div>
  )
}
