# Admin View - Design Document

**Date:** 2026-03-23
**Status:** Draft v1.1 (Addressing review feedback)
**Author:** AI Design Assistant

---

## 1. Overview

Implementação da visão administrativa do sistema SaaS multi-tenant Agenda Pet Shop. Esta visão permite que administradores globais gerenciem empresas, gerem códigos de convite e visualizem métricas globais do sistema.

---

## 2. Architecture

### 2.1 Route Structure

```
src/app/(admin)/
├── layout.tsx           # Sidebar + responsivo mobile
├── dashboard/
│   └── page.tsx         # Métricas globais
├── empresas/
│   ├── page.tsx         # Listar empresas
│   └── [id]/
│       └── page.tsx     # Detalhes da empresa
└── convites/
    └── page.tsx         # Gerar/listar convites
```

### 2.2 New Server Actions

```
src/lib/actions/
├── admin.ts              # Dashboard metrics, empresas CRUD
└── invites.ts            # Criar/listar convites (move from auth.ts)
```

---

## 3. Layout & Navigation

### 3.1 Desktop Layout (≥768px)

- **Sidebar fixo** à esquerda (240px de largura)
- Links de navegação:
  - Dashboard (ícone Layout)
  - Empresas (ícone Building)
  - Convites (ícone Ticket)
  - Sair (ícone LogOut)
- Área de conteúdo à direita com padding

### 3.2 Mobile Layout (<768px)

- **Header** com título e botão menu hambúrguer
- Sidebar se transforma em **drawer/modal** overlay
- Botão fechar e clique fora para fechar
- Mesmo estilo visual da visão empresa (glassmorphism)

### 3.3 Visual Style

Mantém o design system existente:
- Glassmorphism: `backdrop-blur-md`, `bg-white/70`, `border-white/30`
- Gradientes rosa/roxo para estados ativos
- Animações com Framer Motion

---

## 4. Pages Specification

### 4.1 Admin Dashboard (`/admin/dashboard`)

#### Metric Cards
1. **Total de Empresas**
   - `COUNT(*) FROM companies`
   - Ícone: Building

2. **Faturamento Estimado**
   - `SUM(price) FROM appointments WHERE status = 'completed'`
   - Formato: `R$ X.XXX,XX`
   - Ícone: DollarSign

3. **Empresas Ativas**
   - Empresas com agendamentos nos últimos 30 dias
   - `COUNT(DISTINCT company_id) FROM appointments WHERE date >= NOW() - INTERVAL '30 days'`
   - Ícone: TrendingUp

4. **Total de Clientes**
   - `COUNT(*) FROM clients` (global)
   - Ícone: Users

#### Chart Component
- **Agendamentos por mês** (últimos 6 meses)
- Gráfico de barras simples
- Eixo X: Meses (Jan, Fev, Mar, etc.)
- Eixo Y: Quantidade de agendamentos

### 4.2 Empresas List (`/admin/empresas`)

#### Table Columns
- Nome da empresa
- Email
- Status (badge: Ativa/Inativa)
- Data de criação
- Ações (Ver, Editar, Desativar)

#### Filters
- Busca por nome ou email

#### Actions
- **Ver detalhes**: navega para `/admin/empresas/[id]`
- **Editar**: modal com formulário (nome, email)
- **Desativar**: muda status visual (confirmação opcional)
- **Reativar**: para empresas inativas

### 4.3 Empresa Detail (`/admin/empresas/[id]`)

#### Header
- Nome da empresa
- Email
- Status badge

#### Metric Cards (scoped to company)
- Total de clientes
- Total de pets
- Agendamentos hoje
- Agendamentos mês atual
- Receita estimada

#### Users List
- Todos os usuários da empresa
- Colunas: Nome, Email, Role

### 4.4 Convites (`/admin/convites`)

#### Create Form
- Empresa (select para criar nova ou existente)
- Role (select: company_admin, company_user)
- Expira em (input number, padrão 365 dias)
- Botão: "Gerar Convite"

#### Invites Table
- Código
- Role
- Empresa
- Status (Pendente/Usado/Expirado)
- Expira em
- Aceito por (user se usado)

#### Actions
- **Copiar código**: copia para clipboard com toast feedback

#### Visual Indicators
- Convites pendentes expirando em <7 dias: highlight amarelo
- Convites expirados: ocultos se >30 dias

---

## 5. Type Definitions

### 5.1 `src/lib/types/admin.ts`

```typescript
export interface AdminDashboardStats {
  companiesCount: number
  revenue: number
  activeCompanies: number
  clientsCount: number
  monthlyAppointments: MonthlyAppointment[]
}

export interface MonthlyAppointment {
  month: string
  count: number
}

export interface CompanyWithMetrics {
  id: string
  name: string
  email: string
  active: boolean
  created_at: string
  updated_at: string
  metrics?: CompanyMetrics
}

export interface CompanyMetrics {
  clientsCount: number
  petsCount: number
  appointmentsToday: number
  appointmentsThisMonth: number
  revenue: number
}

export interface InviteWithDetails {
  id: string
  code: string
  role: 'company_admin' | 'company_user'
  company_id: string
  company_name?: string
  expires_at: string
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
}

export type InviteStatus = 'pending' | 'used' | 'expired'

export interface AdminActionResponse<T = unknown> {
  data?: T
  error?: string
}
```

## 6. Validation Schemas

### 6.1 `src/lib/validation/admin.ts`

```typescript
import { z } from 'zod'

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo').optional(),
  email: z.string().email('Email inválido').optional()
})

export const createInviteSchema = z.object({
  companyId: z.string().uuid('Empresa inválida'),
  role: z.enum(['company_admin', 'company_user'], {
    errorMap: () => ({ message: 'Role deve ser company_admin ou company_user' })
  }),
  expiresInDays: z.number().min(1, 'Mínimo 1 dia').max(365, 'Máximo 365 dias').default(365),
  createNewCompany: z.boolean().default(false),
  newCompanyName: z.string().min(1).optional(),
  newCompanyEmail: z.string().email().optional()
}).refine(
  (data) => !data.createNewCompany || (data.newCompanyName && data.newCompanyEmail),
  {
    message: "Nome e email da empresa são obrigatórios ao criar nova empresa",
    path: ["newCompanyName"]
  }
)
```

## 7. Server Actions

### 7.1 `src/lib/actions/admin.ts`

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AdminActionResponse, AdminDashboardStats, CompanyWithMetrics, CompanyMetrics } from '@/lib/types/admin'
import { updateCompanySchema } from '@/lib/validation/admin'

// Dashboard metrics
export async function getAdminDashboardStats(): Promise<AdminActionResponse<AdminDashboardStats>> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [companiesResult, revenueResult, activeCompaniesResult, clientsResult] = await Promise.all([
      supabaseAdmin.from('companies').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('appointments').select('price').eq('status', 'completed'),
      supabaseAdmin.from('appointments')
        .select('company_id', { head: true })
        .gte('date', thirtyDaysAgo),
      supabaseAdmin.from('clients').select('id', { count: 'exact', head: true })
    ])

    const companiesCount = companiesResult.count || 0
    const revenue = revenueResult.data?.reduce((sum, a) => sum + Number(a.price), 0) || 0
    const activeCompanies = activeCompaniesResult.count || 0
    const clientsCount = clientsResult.count || 0

    return {
      data: {
        companiesCount,
        revenue,
        activeCompanies,
        clientsCount,
        monthlyAppointments: await getMonthlyAppointments()
      }
    }
  } catch (error) {
    console.error('Error loading admin stats:', error)
    return { error: 'Erro ao carregar métricas do dashboard' }
  }
}

// Helper: Get monthly appointments for last 6 months
async function getMonthlyAppointments(): Promise<MonthlyAppointment[]> {
  const months: MonthlyAppointment[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const { count } = await supabaseAdmin
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .gte('date', monthStart)
      .lte('date', monthEnd)

    months.push({
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      count: count || 0
    })
  }

  return months
}

// Companies
export async function getAllCompanies(filters?: { search?: string }): Promise<AdminActionResponse<CompanyWithMetrics[]>> {
  try {
    let query = supabaseAdmin
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return { data: data as CompanyWithMetrics[] }
  } catch (error) {
    console.error('Error loading companies:', error)
    return { error: 'Erro ao carregar empresas' }
  }
}

export async function getCompanyById(id: string): Promise<AdminActionResponse<CompanyWithMetrics>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: data as CompanyWithMetrics }
  } catch (error) {
    console.error('Error loading company:', error)
    return { error: 'Erro ao carregar empresa' }
  }
}

export async function updateCompany(id: string, formData: FormData): Promise<AdminActionResponse<CompanyWithMetrics>> {
  try {
    const validatedFields = updateCompanySchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email')
    })

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0]?.message || 'Dados inválidos' }
    }

    const { data, error } = await supabaseAdmin
      .from('companies')
      .update(validatedFields.data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/empresas')
    revalidatePath('/admin/empresas/[id]')

    return { data: data as CompanyWithMetrics }
  } catch (error) {
    console.error('Error updating company:', error)
    return { error: 'Erro ao atualizar empresa' }
  }
}

export async function toggleCompanyStatus(id: string, active: boolean): Promise<AdminActionResponse<CompanyWithMetrics>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .update({ active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/empresas')
    revalidatePath('/admin/empresas/[id]')
    revalidatePath('/admin/dashboard')

    return { data: data as CompanyWithMetrics }
  } catch (error) {
    console.error('Error toggling company status:', error)
    return { error: 'Erro ao alterar status da empresa' }
  }
}

// Company metrics
export async function getCompanyMetrics(companyId: string): Promise<AdminActionResponse<CompanyMetrics>> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    const [clientsResult, petsResult, appointmentsResult] = await Promise.all([
      supabaseAdmin.from('clients').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
      supabaseAdmin.from('pets').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
      supabaseAdmin.from('appointments')
        .select('date, price, status')
        .eq('company_id', companyId)
    ])

    const appointmentsToday = appointmentsResult.data?.filter(a => a.date === today).length || 0
    const appointmentsThisMonth = appointmentsResult.data?.filter(a => a.date >= monthStart).length || 0
    const revenue = appointmentsResult.data
      ?.filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + Number(a.price), 0) || 0

    return {
      data: {
        clientsCount: clientsResult.count || 0,
        petsCount: petsResult.count || 0,
        appointmentsToday,
        appointmentsThisMonth,
        revenue
      }
    }
  } catch (error) {
    console.error('Error loading company metrics:', error)
    return { error: 'Erro ao carregar métricas da empresa' }
  }
}
```

### 7.2 `src/lib/actions/invites.ts`

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AdminActionResponse, InviteWithDetails, InviteStatus } from '@/lib/types/admin'
import { createInviteSchema } from '@/lib/validation/admin'

function generateInviteCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INVITE-${random}-${timestamp}`
}

function getInviteStatus(invite: InviteWithDetails): InviteStatus {
  if (invite.accepted_at) return 'used'
  if (new Date(invite.expires_at) < new Date()) return 'expired'
  return 'pending'
}

export async function createInvite(formData: FormData): Promise<AdminActionResponse<InviteWithDetails>> {
  try {
    const validatedFields = createInviteSchema.safeParse({
      companyId: formData.get('companyId'),
      role: formData.get('role'),
      expiresInDays: formData.get('expiresInDays'),
      createNewCompany: formData.get('createNewCompany'),
      newCompanyName: formData.get('newCompanyName'),
      newCompanyEmail: formData.get('newCompanyEmail')
    })

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0]?.message || 'Dados inválidos' }
    }

    let companyId = validatedFields.data.companyId

    // Create new company if requested
    if (validatedFields.data.createNewCompany) {
      const { data: newCompany, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({
          name: validatedFields.data.newCompanyName!,
          email: validatedFields.data.newCompanyEmail!,
          active: true
        })
        .select()
        .single()

      if (companyError) throw companyError
      companyId = newCompany.id
    }

    const expiresAt = new Date(Date.now() + validatedFields.data.expiresInDays * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabaseAdmin
      .from('invites')
      .insert({
        code: generateInviteCode(),
        company_id: companyId,
        role: validatedFields.data.role,
        expires_at: expiresAt
      })
      .select('*, companies(name)')
      .single()

    if (error) throw error

    revalidatePath('/admin/convites')

    return { data: data as InviteWithDetails }
  } catch (error) {
    console.error('Error creating invite:', error)
    return { error: 'Erro ao criar convite' }
  }
}

export async function getInvites(): Promise<AdminActionResponse<(InviteWithDetails & { status: InviteStatus })[]>> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabaseAdmin
      .from('invites')
      .select('*, companies(name)')
      .or(`accepted_at.is.null,expires_at.gte.${thirtyDaysAgo}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    const invitesWithStatus = (data as InviteWithDetails[]).map(invite => ({
      ...invite,
      status: getInviteStatus(invite)
    }))

    return { data: invitesWithStatus }
  } catch (error) {
    console.error('Error loading invites:', error)
    return { error: 'Erro ao carregar convites' }
  }
}
```

---

## 8. Components

### 8.1 Admin Components

```
src/components/admin/
├── AdminSidebar.tsx              # Sidebar (desktop) / drawer (mobile)
├── AdminHeader.tsx               # Mobile header with hamburger menu
├── MetricCard.tsx                # Reusable metric card
├── CompaniesTable.tsx            # Companies list with filters
├── CompanyDetailHeader.tsx       # Company detail page header
├── InvitesTable.tsx              # Invites list
├── CreateInviteForm.tsx          # Generate new invite form
└── MonthlyAppointmentsChart.tsx  # Bar chart (custom CSS)
```

### 8.2 Chart Component (Custom CSS Grid)

Sem dependências externas - usa CSS Grid:

```tsx
// MonthlyAppointmentsChart.tsx
interface ChartData {
  month: string
  count: number
}

export function MonthlyAppointmentsChart({ data }: { data: ChartData[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((item) => (
        <div key={item.month} className="flex-1 flex flex-col items-center group">
          <div
            className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-t-lg transition-all group-hover:opacity-80"
            style={{ height: `${(item.count / maxCount) * 100}%` }}
          />
          <span className="text-xs mt-2 text-gray-600">{item.month}</span>
        </div>
      ))}
    </div>
  )
}
```

**Data Query (in `getAdminDashboardStats`):**
> **Data Source:** A função `getMonthlyAppointments()` em `admin.ts` retorna um array de `{ month, count }` para os últimos 6 meses.

### 8.3 Mobile Drawer

Custom implementation com Framer Motion:

```tsx
// AdminSidebar.tsx (excerpt)
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:left-0 md:w-64 md:h-screen bg-white/90 backdrop-blur-xl border-r border-purple-200/50">
        {/* Sidebar content */}
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2"
              >
                <X size={24} />
              </button>
              {/* Sidebar content */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

### 8.4 Loading States

Spinner pattern existente:

```tsx
<div className="flex items-center justify-center h-64">
  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
</div>
```

### 8.5 Shared UI Components

Reutilizar componentes existentes de `src/components/ui/`:
- `Button.tsx`
- `Input.tsx`
- `Select.tsx`
- Toast via React Toastify (já configurado)

---

## 7. Authorization

### 7.1 Middleware

O middleware existente ([`middleware.ts`](../../src/middleware.ts)) já verifica:
- Rotas `/admin/*` requerem `role === 'admin'`
- Redireciona para `/login` se não autenticado
- Redireciona para `/app` se role != admin

### 7.2 Server Actions

Todas as actions admin usam `supabaseAdmin` que bypass RLS, garantindo acesso global aos dados.

---

## 8. Database Considerations

### 8.1 Existing Schema

O schema já suporta a visão admin:
- `companies` - tabela de empresas
- `users` - com roles (admin, company_admin, company_user)
- `invites` - códigos de convite

### 8.2 Required Schema Changes

**Migration: `008_add_company_active_field.sql`**

Adicionar campo `active` na tabela `companies` para suportar ativação/desativação:

```sql
-- Add active field to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Add index for active companies queries
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(active);

-- Update existing companies to be active
UPDATE companies SET active = true WHERE active IS NULL;
```

### 8.3 Invite Status (Derived Field)

O status dos convites é **derivado** dos campos existentes (sem adicionar coluna):
- **Pendente**: `accepted_at IS NULL AND expires_at > NOW()`
- **Usado**: `accepted_at IS NOT NULL`
- **Expirado**: `accepted_at IS NULL AND expires_at < NOW()`

> **Nota:** Os campos `accepted_at` e `accepted_by` já existem na migration `004_fix_invites_schema.sql`.

---

## 9. Testing Strategy

### 9.1 E2E Tests

1. Admin login with seed code (ADMIN-SEED-2024)
2. Access dashboard and verify metrics load
3. Create new company invite
4. List companies and search/filter
5. View company details
6. Deactivate/reactivate company
7. Create and list invites

### 9.2 Unit Tests

- Server actions (admin.ts, invites.ts)
- Metric calculations
- Invite code generation uniqueness

---

## 10. Implementation Order

1. **Layout**: Create `(admin)/layout.tsx` with sidebar
2. **Dashboard**: Implement dashboard page with metrics
3. **Companies**: List page with filters and actions
4. **Company Details**: Detail page with scoped metrics
5. **Invites**: Create/list page
6. **Actions**: Complete server actions
7. **Testing**: E2E tests for critical flows

---

## 11. Environment Variables

No new environment variables required. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

**Document Version:** 1.0
**Last Updated:** 2026-03-23



---

**Document Version:** 1.1
**Last Updated:** 2026-03-23

### Changelog
- v1.1: Addressed spec review feedback
  - Added TypeScript type definitions section
  - Added Zod validation schemas
  - Fixed SQL query syntax for Supabase client
  - Added complete error handling to server actions
  - Added revalidatePath calls to mutations
  - Specified custom CSS grid chart (no external library)
  - Added mobile drawer implementation details
  - Added loading states pattern
  - Added migration for company active field
  - Clarified invite status as derived field
  - Added Lucide icon specifications
- v1.0: Initial design document

