import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import type { PetPackageWithRelations } from '@/lib/types/packages'

interface PackageCardProps {
  packageData: PetPackageWithRelations
  onChange?: () => void
}

export function PackageCard({ packageData, onChange }: PackageCardProps) {
  const totalCredits = packageData.package_type.credits
  const remainingCredits = packageData.credits_remaining

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="text-lg font-semibold text-white">
            {packageData.package_type.name}
          </p>
          <p className="text-sm text-purple-200/60 mt-1">
            {remainingCredits} de {totalCredits} créditos
          </p>
          <p className="text-xs text-purple-200/40 mt-1">
            Vence em {formatDate(packageData.expires_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24">
            <ProgressBar current={remainingCredits} total={totalCredits} showLabel={false} />
          </div>
          {onChange && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onChange}
              className="w-9 h-9 px-0 flex items-center justify-center shrink-0"
              title="Alterar pacote"
            >
              <Pencil size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
