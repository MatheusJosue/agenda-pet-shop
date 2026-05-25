import { Building, Search } from "lucide-react"
import { CompaniesTable } from "@/components/admin/CompaniesTable"
import { getAllCompanies } from "@/lib/actions/admin"
import { GlassCard } from "@/components/ui/glass-card"

export default async function AdminEmpresasPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const search = searchParams.search || ""
  const result = await getAllCompanies(search ? { search } : undefined)

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">{result.error || "Erro ao carregar empresas"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e8327b] to-[#006c73] flex items-center justify-center shadow-lg shadow-[#e8327b]/20">
            <Building size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Empresas</h1>
            <p className="text-[#68797d] text-sm">
              {result.data.length} empresa{result.data.length !== 1 ? "s" : ""} cadastrada
              {result.data.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <form action="/admin/empresas" method="GET" className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68797d]"
        />
        <input
          type="text"
          name="search"
          placeholder="Buscar por nome ou email..."
          defaultValue={search}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-200/40 focus:outline-none focus:ring-2 focus:ring-[#e8327b]/50 focus:border-transparent transition-all"
        />
      </form>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard variant="default" className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{result.data.filter(c => c.active).length}</p>
            <p className="text-xs text-[#68797d] uppercase tracking-wide">Ativas</p>
          </div>
        </GlassCard>
        <GlassCard variant="default" className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{result.data.filter(c => !c.active).length}</p>
            <p className="text-xs text-[#68797d] uppercase tracking-wide">Inativas</p>
          </div>
        </GlassCard>
        <GlassCard variant="default" className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#006c73]">{result.data.length}</p>
            <p className="text-xs text-[#68797d] uppercase tracking-wide">Total</p>
          </div>
        </GlassCard>
      </div>

      {/* Table */}
      <GlassCard variant="default" className="overflow-hidden p-0">
        <CompaniesTable companies={result.data} />
      </GlassCard>
    </div>
  )
}
