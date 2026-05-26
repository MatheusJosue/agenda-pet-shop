import { Building, Search, Store, ToggleLeft, ToggleRight } from "lucide-react"
import { CompaniesTable } from "@/components/admin/CompaniesTable"
import { getAllCompanies } from "@/lib/actions/admin"

export default async function AdminEmpresasPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const search = searchParams.search || ""
  const result = await getAllCompanies(search ? { search } : undefined)

  if (result.error || !result.data) {
    return (
      <div className="flex h-64 items-center justify-center px-4">
        <p className="rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/78 px-4 py-3 text-sm font-bold text-[#21363a]">
          {result.error || "Erro ao carregar empresas"}
        </p>
      </div>
    )
  }

  const activeCompanies = result.data.filter((company) => company.active).length
  const inactiveCompanies = result.data.length - activeCompanies

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:gap-6 lg:py-6">
      <section className="rounded-3xl border border-[rgba(232,50,123,0.18)] bg-white/72 p-5 shadow-[0_10px_28px_rgba(33,54,58,0.07)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ffe0ec] text-[#bf185d]">
              <Building size={24} />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase text-[#bf185d]">
                Empresas
              </p>
              <h2 className="text-2xl font-extrabold text-[#21363a] sm:text-3xl">
                Gestao das contas
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#68797d]">
                Controle ativacao, dados cadastrais e acesso das empresas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <SummaryPill icon={Store} label="Total" value={result.data.length} tone="teal" />
            <SummaryPill icon={ToggleRight} label="Ativas" value={activeCompanies} tone="green" />
            <SummaryPill icon={ToggleLeft} label="Inativas" value={inactiveCompanies} tone="red" />
          </div>
        </div>
      </section>

      <form action="/admin/empresas" method="GET" className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006c73]"
        />
        <input
          type="text"
          name="search"
          placeholder="Buscar por nome ou email..."
          defaultValue={search}
          className="w-full rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/78 py-3 pl-12 pr-4 text-sm font-semibold text-[#21363a] shadow-[0_8px_22px_rgba(33,54,58,0.06)] outline-none transition-all placeholder:text-[#9aa9ac] focus:border-[#e8327b]/45 focus:ring-4 focus:ring-[#ffe0ec]"
        />
      </form>

      <section className="rounded-3xl border border-[rgba(232,50,123,0.18)] bg-white/72 p-3 shadow-[0_10px_28px_rgba(33,54,58,0.07)] backdrop-blur-sm sm:p-4">
        <CompaniesTable companies={result.data} />
      </section>
    </div>
  )
}

function SummaryPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Store
  label: string
  value: number
  tone: "teal" | "green" | "red"
}) {
  const toneClass = {
    teal: "bg-[#dff7f4] text-[#006c73]",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  }[tone]

  return (
    <div className="rounded-2xl bg-white/70 px-3 py-3 text-center">
      <Icon className="mx-auto mb-1 text-current" size={18} />
      <p className="text-xl font-extrabold text-[#21363a]">{value}</p>
      <p className={`text-[0.65rem] font-extrabold uppercase ${toneClass} rounded-full px-2 py-1`}>
        {label}
      </p>
    </div>
  )
}
