import Link from "next/link"
import {
  ArrowLeft,
  Building,
  Calendar,
  DollarSign,
  Mail,
  PawPrint,
  Users,
} from "lucide-react"
import { getCompanyById, getCompanyMetrics } from "@/lib/actions/admin"
import { MetricCard } from "@/components/admin/MetricCard"
import { ImpersonateButton } from "@/components/admin/ImpersonateButton"
import { CompanyActionButtons } from "./CompanyActionButtons"
import { formatCurrency, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [companyResult, metricsResult] = await Promise.all([
    getCompanyById(id),
    getCompanyMetrics(id),
  ])

  if (companyResult.error || !companyResult.data) {
    return (
      <div className="flex h-64 items-center justify-center px-4">
        <p className="rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/78 px-4 py-3 text-sm font-bold text-[#21363a]">
          {companyResult.error || "Empresa nao encontrada"}
        </p>
      </div>
    )
  }

  const company = companyResult.data
  const metrics = metricsResult.data

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:gap-6 lg:py-6">
      <section className="rounded-3xl border border-[rgba(232,50,123,0.18)] bg-white/72 p-5 shadow-[0_10px_28px_rgba(33,54,58,0.07)] backdrop-blur-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Link
              href="/admin/empresas"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffe0ec] text-[#bf185d] transition-colors hover:bg-[#ffd0e2]"
              aria-label="Voltar para empresas"
            >
              <ArrowLeft size={20} />
            </Link>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dff7f4] text-[#006c73]">
              <Building size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase text-[#bf185d]">
                Detalhes da empresa
              </p>
              <h2 className="truncate text-2xl font-extrabold text-[#21363a] sm:text-3xl">
                {company.name}
              </h2>
              <p className="mt-1 flex items-center gap-2 truncate text-sm font-semibold text-[#68797d]">
                <Mail size={15} />
                {company.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CompanyStatus active={company.active} />
            {company.active && (
              <ImpersonateButton companyId={company.id} companyName={company.name} />
            )}
            <CompanyActionButtons company={company} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Clientes"
          value={metrics?.clientsCount || 0}
          description="Clientes cadastrados"
          color="blue"
        />
        <MetricCard
          icon={PawPrint}
          label="Pets"
          value={metrics?.petsCount || 0}
          description="Pets vinculados"
          color="pink"
        />
        <MetricCard
          icon={Calendar}
          label="Agendamentos no mes"
          value={metrics?.appointmentsThisMonth || 0}
          description={`${metrics?.appointmentsToday || 0} hoje`}
          color="orange"
        />
        <MetricCard
          icon={DollarSign}
          label="Faturamento"
          value={formatCurrency(metrics?.revenue || 0)}
          description="Servicos concluidos"
          color="green"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Informacoes da empresa" description="Dados principais da conta selecionada.">
          <InfoGrid>
            <InfoItem label="Nome" value={company.name} />
            <InfoItem label="Email" value={company.email} />
            <InfoItem label="Status" value={company.active ? "Ativa" : "Inativa"} />
            <InfoItem
              label="Criada em"
              value={formatDate(company.created_at.split("T")[0])}
            />
          </InfoGrid>
        </Panel>

        <Panel title="Operacao" description="Resumo operacional desta empresa.">
          <div className="space-y-3">
            <OperationRow
              label="Agendamentos hoje"
              value={metrics?.appointmentsToday || 0}
              tone="teal"
            />
            <OperationRow
              label="Agendamentos no mes"
              value={metrics?.appointmentsThisMonth || 0}
              tone="orange"
            />
            <OperationRow
              label="Receita concluida"
              value={formatCurrency(metrics?.revenue || 0)}
              tone="green"
            />
          </div>
        </Panel>
      </section>

      <Panel title="Identificador tecnico" description="Use este ID para suporte ou verificacoes no banco.">
        <code className="block overflow-x-auto rounded-2xl bg-[#fff1f6] px-4 py-3 font-mono text-xs font-extrabold text-[#bf185d] sm:text-sm">
          {company.id}
        </code>
      </Panel>
    </div>
  )
}

function CompanyStatus({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-full justify-center rounded-2xl px-4 py-2 text-sm font-extrabold sm:w-auto",
        active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
      )}
    >
      {active ? "Empresa ativa" : "Empresa inativa"}
    </span>
  )
}

function Panel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-[rgba(232,50,123,0.18)] bg-white/72 p-5 shadow-[0_10px_28px_rgba(33,54,58,0.07)] backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-[#21363a]">{title}</h3>
        <p className="text-sm font-semibold text-[#68797d]">{description}</p>
      </div>
      {children}
    </section>
  )
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/62 p-4">
      <p className="text-xs font-extrabold uppercase text-[#68797d]">{label}</p>
      <p className="mt-1 break-words text-sm font-extrabold text-[#21363a]">{value}</p>
    </div>
  )
}

function OperationRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone: "teal" | "orange" | "green"
}) {
  const toneClass = {
    teal: "bg-[#dff7f4] text-[#006c73]",
    orange: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
  }[tone]

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/62 p-4">
      <p className="text-sm font-extrabold text-[#21363a]">{label}</p>
      <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${toneClass}`}>
        {value}
      </span>
    </div>
  )
}
