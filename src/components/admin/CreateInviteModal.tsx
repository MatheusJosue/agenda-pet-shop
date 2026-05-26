'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Plus, Ticket, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { createInvite } from '@/lib/actions/invites'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toast } from 'react-toastify'

interface CreateInviteModalProps {
  companies: CompanyWithMetrics[]
  onClose: () => void
}

export function CreateInviteModal({ companies, onClose }: CreateInviteModalProps) {
  const router = useRouter()
  const [createNewCompany, setCreateNewCompany] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyId: '',
    newCompanyName: '',
    newCompanyEmail: '',
    role: 'company_admin',
    expiresInDays: '365'
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    const data = new FormData()
    if (createNewCompany) {
      data.append('newCompanyName', formData.newCompanyName)
      data.append('newCompanyEmail', formData.newCompanyEmail)
    } else {
      data.append('companyId', formData.companyId)
    }
    data.append('role', formData.role)
    data.append('expiresInDays', formData.expiresInDays)
    data.append('createNewCompany', createNewCompany.toString())

    const result = await createInvite(data)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Convite criado: ${result.data?.code}`)
      onClose()
      router.refresh()
    }
  }

  const roleOptions = [
    { value: 'company_admin', label: 'Admin empresa' },
    { value: 'company_user', label: 'Usuario empresa' }
  ]

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: `${company.name} (${company.email})`
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#21363a]/40 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[rgba(232,50,123,0.22)] bg-[#fff9fb] p-5 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffe0ec] text-[#bf185d]">
              <Ticket size={21} />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-[#21363a]">
                Novo convite
              </h2>
              <p className="text-sm font-semibold text-[#68797d]">
                Libere acesso para uma empresa.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#006c73] transition-colors hover:bg-[#ffe0ec] hover:text-[#bf185d]"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/80 p-4">
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#dff7f4] text-[#006c73]">
                <Building size={19} />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-[#21363a]">
                  Criar nova empresa
                </span>
                <span className="block text-xs font-semibold text-[#68797d]">
                  Use quando a conta ainda nao existe.
                </span>
              </span>
            </span>
            <input
              type="checkbox"
              checked={createNewCompany}
              onChange={(event) => setCreateNewCompany(event.target.checked)}
              className="h-5 w-5 accent-[#e8327b]"
            />
          </label>

          {createNewCompany ? (
            <div className="space-y-4">
              <Field
                label="Nome da empresa"
                value={formData.newCompanyName}
                onChange={(value) => setFormData({ ...formData, newCompanyName: value })}
                placeholder="Ex: Pet Shop Central"
                required
              />
              <Field
                label="Email da empresa"
                value={formData.newCompanyEmail}
                onChange={(value) => setFormData({ ...formData, newCompanyEmail: value })}
                placeholder="contato@empresa.com"
                type="email"
                required
              />
            </div>
          ) : (
            <Select
              label="Empresa"
              options={companyOptions}
              value={formData.companyId}
              onChange={(value) => setFormData({ ...formData, companyId: value })}
              placeholder="Selecione uma empresa"
              required
            />
          )}

          <Select
            label="Perfil"
            options={roleOptions}
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value })}
            required
          />
          <p className="-mt-3 text-xs font-semibold text-[#68797d]">
            {formData.role === 'company_admin'
              ? 'Pode gerenciar a empresa e sua operacao.'
              : 'Acesso limitado as rotinas da empresa.'}
          </p>

          <Field
            label="Expira em dias"
            value={formData.expiresInDays}
            onChange={(value) => setFormData({ ...formData, expiresInDays: value })}
            type="number"
            min="1"
            max="365"
            required
          />

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-11 flex-1 rounded-2xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="h-11 flex-1 rounded-2xl"
            >
              <Plus size={18} className="mr-2" />
              Gerar convite
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  min,
  max,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  min?: string
  max?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-[#006c73]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/82 px-4 py-3 text-sm font-semibold text-[#21363a] outline-none transition-all placeholder:text-[#9aa9ac] focus:border-[#e8327b]/45 focus:ring-4 focus:ring-[#ffe0ec]"
      />
    </label>
  )
}
