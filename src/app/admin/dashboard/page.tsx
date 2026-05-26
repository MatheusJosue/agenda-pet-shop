import Link from "next/link"
import {
  Activity,
  Building,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  PawPrint,
  Ticket,
  type LucideIcon,
  Users,
  XCircle,
} from "lucide-react"
import { MetricCard } from "@/components/admin/MetricCard"
import { MonthlyAppointmentsChart } from "@/components/admin/MonthlyAppointmentsChart"
import { getAdminDashboardStats } from "@/lib/actions/admin"
import { formatCurrency, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardStats()

  if (result.error || !result.data) {
    return (
      <div className="flex h-64 items-center justify-center px-4">
        <p className="rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/78 px-4 py-3 text-sm font-bold text-[#21363a]">
          {result.error || "Erro ao carregar dashboard"}
        </p>
      </div>
    )
  }

  const stats = result.data
  const completionRate = stats.appointmentsThisMonth
    ? Math.round((stats.completedAppointmentsThisMonth / stats.appointmentsThisMonth) * 100)
    : 0

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:gap-6 lg:py-6">
      <section className="rounded-3xl border border-[rgba(232,50,123,0.18)] bg-white/72 p-5 shadow-[0_10px_28px_rgba(33,54,58,0.07)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#bf185d]">
              Admin master
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#21363a] sm:text-3xl">
              Saude operacional do sistema
            </h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold text-[#68797d]">
              Acompanhe empresas, uso da agenda, convites e faturamento das lojas conectadas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <StatusPill label="Empresas ativas" value={stats.activeCompanies} tone="green" />
            <StatusPill label="Convites pendentes" value={stats.pendingInvites} tone="pink" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Building}
          label="Empresas"
          value={stats.companiesCount}
          description={`${stats.inactiveCompanies} inativa${stats.inactiveCompanies === 1 ? "" : "s"}`}
          color="pink"
        />
        <MetricCard
          icon={DollarSign}
          label="Faturamento do mes"
          value={formatCurrency(stats.revenue)}
          description="Agendamentos concluidos"
          color="green"
        />
        <MetricCard
          icon={CalendarDays}
          label="Agendamentos hoje"
          value={stats.appointmentsToday}
          description={`${stats.appointmentsThisMonth} no mes atual`}
          color="teal"
        />
        <MetricCard
          icon={Users}
          label="Clientes"
          value={stats.clientsCount}
          description={`${stats.petsCount} pets cadastrados`}
          color="blue"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-[#21363a]">
                Agendamentos por mes
              </h3>
              <p className="text-sm font-semibold text-[#68797d]">
                Volume dos ultimos 6 meses em todas as empresas.
              </p>
            </div>
            <Activity size={22} className="text-[#006c73]" />
          </div>
          <MonthlyAppointmentsChart data={stats.monthlyAppointments} />
        </Panel>

        <Panel>
          <div className="mb-4">
            <h3 className="text-lg font-extrabold text-[#21363a]">
              Agenda do mes
            </h3>
            <p className="text-sm font-semibold text-[#68797d]">
              Conversao e cancelamentos no periodo.
            </p>
          </div>

          <div className="space-y-3">
            <OperationalRow
              icon={CheckCircle2}
              label="Concluidos"
              value={stats.completedAppointmentsThisMonth}
              detail={`${completionRate}% do total`}
              tone="green"
            />
            <OperationalRow
              icon={Clock}
              label="Em aberto"
              value={Math.max(stats.appointmentsThisMonth - stats.completedAppointmentsThisMonth - stats.cancelledAppointmentsThisMonth, 0)}
              detail="Agendados no mes"
              tone="teal"
            />
            <OperationalRow
              icon={XCircle}
              label="Cancelados"
              value={stats.cancelledAppointmentsThisMonth}
              detail="Acompanhar impacto"
              tone="red"
            />
            <OperationalRow
              icon={Ticket}
              label="Convites expirados"
              value={stats.expiredInvites}
              detail="Precisam de novo envio"
              tone="orange"
            />
          </div>
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#21363a]">
                Empresas recentes
              </h3>
              <p className="text-sm font-semibold text-[#68797d]">
                Ultimas contas criadas no sistema.
              </p>
            </div>
            <Link
              href="/admin/empresas"
              className="rounded-xl bg-[#ffe0ec] px-3 py-2 text-xs font-extrabold text-[#bf185d] transition-colors hover:bg-[#ffd0e2]"
            >
              Ver todas
            </Link>
          </div>

          <div className="space-y-2">
            {stats.recentCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/admin/empresas/${company.id}`}
                className="flex items-center gap-3 rounded-2xl border border-transparent bg-white/58 p-3 transition-colors hover:border-[rgba(232,50,123,0.18)] hover:bg-white"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#dff7f4] text-[#006c73]">
                  <Building size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-[#21363a]">
                    {company.name}
                  </span>
                  <span className="block truncate text-xs font-semibold text-[#68797d]">
                    {company.email}
                  </span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[0.68rem] font-extrabold",
                    company.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700",
                  )}
                >
                  {company.active ? "Ativa" : "Inativa"}
                </span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="mb-4">
            <h3 className="text-lg font-extrabold text-[#21363a]">
              Base cadastrada
            </h3>
            <p className="text-sm font-semibold text-[#68797d]">
              Tamanho atual da operacao multiempresa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SmallStat icon={Users} label="Usuarios" value={stats.usersCount} />
            <SmallStat icon={PawPrint} label="Pets" value={stats.petsCount} />
            <SmallStat icon={Ticket} label="Pendentes" value={stats.pendingInvites} />
            <SmallStat icon={Building} label="Inativas" value={stats.inactiveCompanies} />
          </div>

          <p className="mt-4 rounded-2xl bg-[#dff7f4] px-4 py-3 text-xs font-bold text-[#006c73]">
            Atualizado com os dados agregados de todas as empresas em {formatDate(new Date().toISOString().split("T")[0])}.
          </p>
        </Panel>
      </section>
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[rgba(232,50,123,0.18)] bg-white/72 p-4 shadow-[0_10px_28px_rgba(33,54,58,0.07)] backdrop-blur-sm sm:p-5">
      {children}
    </div>
  )
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "green" | "pink"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-center",
        tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-[#ffe0ec] text-[#bf185d]",
      )}
    >
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[0.68rem] font-extrabold uppercase">{label}</p>
    </div>
  )
}

function OperationalRow({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: number
  detail: string
  tone: "green" | "teal" | "red" | "orange"
}) {
  const toneClass = {
    green: "bg-emerald-50 text-emerald-700",
    teal: "bg-[#dff7f4] text-[#006c73]",
    red: "bg-red-50 text-red-700",
    orange: "bg-amber-50 text-amber-700",
  }[tone]

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/58 p-3">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", toneClass)}>
        <Icon size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-[#21363a]">{label}</p>
        <p className="truncate text-xs font-semibold text-[#68797d]">{detail}</p>
      </div>
      <p className="text-xl font-extrabold text-[#21363a]">{value}</p>
    </div>
  )
}

function SmallStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl bg-white/58 p-4">
      <Icon size={20} className="mb-3 text-[#006c73]" />
      <p className="text-2xl font-extrabold text-[#21363a]">{value}</p>
      <p className="text-xs font-extrabold uppercase text-[#68797d]">{label}</p>
    </div>
  )
}
