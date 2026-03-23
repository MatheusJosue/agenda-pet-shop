# Admin View Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a visão administrativa do sistema SaaS multi-tenant Agenda Pet Shop, permitindo que administradores globais gerenciem empresas, gerem códigos de convite e visualizem métricas globais.

**Architecture:** Server Components + Server Actions com Supabase Admin Client para bypass RLS. Route group `(admin)` com layout dedicado (sidebar desktop / drawer mobile). Mantém glassmorphism e gradientes rosa/roxo do design system existente.

**Tech Stack:** Next.js 16.2.1, React 19.2.4, Supabase PostgreSQL, Framer Motion, Lucide Icons, Zod validation

---

## File Structure Map

### New Files to Create
```
src/lib/types/admin.ts                    # Admin-specific TypeScript types
src/lib/validation/admin.ts               # Zod schemas for admin actions
src/lib/actions/admin.ts                  # Admin server actions (dashboard, companies)
src/lib/actions/invites.ts                # Invite management actions
src/app/(admin)/layout.tsx                # Admin layout with sidebar/drawer
src/app/(admin)/dashboard/page.tsx        # Dashboard with metrics
src/app/(admin)/empresas/page.tsx         # Companies list
src/app/(admin)/empresas/[id]/page.tsx    # Company details
src/app/(admin)/convites/page.tsx         # Invites management
src/components/admin/AdminSidebar.tsx     # Sidebar (desktop) / drawer (mobile)
src/components/admin/AdminHeader.tsx      # Mobile header with hamburger
src/components/admin/MetricCard.tsx       # Reusable metric card
src/components/admin/CompaniesTable.tsx   # Companies list table
src/components/admin/CompanyDetailHeader.tsx
src/components/admin/InvitesTable.tsx     # Invites list table
src/components/admin/CreateInviteForm.tsx # Invite creation form
src/components/admin/MonthlyAppointmentsChart.tsx
supabase/migrations/008_add_company_active_field.sql
```

### Existing Files to Reference
```
src/lib/supabase/admin.ts                 # Already exists, use as-is
src/lib/supabase/server.ts                # For auth checks in layout
src/middleware.ts                         # Already checks admin role
src/components/ui/button.tsx              # Reuse for buttons
src/components/ui/input.tsx               # Reuse for forms
src/lib/validation/auth.ts                # Reference for Zod pattern
src/app/(app)/app/page.tsx                # Reference for dashboard pattern
```

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/008_add_company_active_field.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Add active field to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Add index for active companies queries
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(active);

-- Update existing companies to be active
UPDATE companies SET active = true WHERE active IS NULL;
```

- [ ] **Step 2: Run migration in Supabase**

Go to Supabase Dashboard → Database → Migrations → Apply migration `008_add_company_active_field.sql`

Expected: "Migration applied successfully"

- [ ] **Step 3: Verify migration**

Run in Supabase SQL Editor:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'companies' AND column_name = 'active';
```

Expected: Row showing `active | boolean | true`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/008_add_company_active_field.sql
git commit -m "feat: add active field to companies table

- Add active BOOLEAN column with default TRUE
- Add index for active companies queries
- Migration for admin view company activation/deactivation"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/lib/types/admin.ts`

- [ ] **Step 1: Create types file**

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

- [ ] **Step 2: Commit**

```bash
git add src/lib/types/admin.ts
git commit -m "feat: add admin TypeScript types

- AdminDashboardStats for dashboard metrics
- CompanyWithMetrics for company data
- InviteWithDetails for invite management
- AdminActionResponse wrapper for server actions"
```

---

## Task 3: Validation Schemas

**Files:**
- Create: `src/lib/validation/admin.ts`

- [ ] **Step 1: Create validation schemas**

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

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
export type CreateInviteInput = z.infer<typeof createInviteSchema>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validation/admin.ts
git commit -m "feat: add admin validation schemas

- updateCompanySchema for company updates
- createInviteSchema with company creation option
- Export inferred types for TypeScript consumers"
```

---

## Task 4: Admin Server Actions

**Files:**
- Create: `src/lib/actions/admin.ts`

- [ ] **Step 1: Create admin actions file**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AdminActionResponse, AdminDashboardStats, CompanyWithMetrics, CompanyMetrics, MonthlyAppointment } from '@/lib/types/admin'
import { updateCompanySchema } from '@/lib/validation/admin'

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

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/admin.ts
git commit -m "feat: add admin server actions

- getAdminDashboardStats: global metrics with monthly chart data
- getAllCompanies: list with search filter
- getCompanyById: single company details
- updateCompany: edit company name/email
- toggleCompanyStatus: activate/deactivate companies
- getCompanyMetrics: scoped metrics for company detail page"
```

---

## Task 5: Invites Server Actions

**Files:**
- Create: `src/lib/actions/invites.ts`

- [ ] **Step 1: Create invites actions file**

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

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/invites.ts
git commit -m "feat: add invites server actions

- createInvite: generate invite codes with optional company creation
- getInvites: list invites with derived status (pending/used/expired)
- generateInviteCode: unique INVITE-XXX-YYYY format
- getInviteStatus: derive status from accepted_at and expires_at"
```

---

## Task 6: Admin Components - Sidebar

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/AdminHeader.tsx`

- [ ] **Step 1: Create AdminSidebar component**

```tsx
'use client'

import { useState, usePathname } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Building, Ticket, LogOut, X, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/empresas', icon: Building, label: 'Empresas' },
  { href: '/admin/convites', icon: Ticket, label: 'Convites' },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const { logout } = await import('@/lib/actions/auth')
    await logout()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-purple-200/50 dark:border-purple-900/50 z-40">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>
        <nav className="px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-purple-200/50 dark:border-purple-900/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
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
              className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex items-center justify-between border-b border-purple-200/50 dark:border-purple-900/50">
                <h2 className="text-lg font-bold">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="absolute bottom-4 left-4 right-4">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx
git commit -m "feat: add AdminSidebar component

- Desktop fixed sidebar (240px) with navigation
- Mobile drawer with slide-in animation
- Nav items: Dashboard, Empresas, Convites
- Logout button
- Active route highlighting with gradient"
```

---

## Task 7: Admin Components - MetricCard and Chart

**Files:**
- Create: `src/components/admin/MetricCard.tsx`
- Create: `src/components/admin/MonthlyAppointmentsChart.tsx`

- [ ] **Step 1: Create MetricCard component**

```tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: number; isPositive: boolean }
  color?: 'purple' | 'pink' | 'green' | 'blue' | 'orange'
}

const colorStyles = {
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-purple-500/20',
  pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30 shadow-pink-500/20',
  green: 'bg-green-500/20 text-green-300 border-green-500/30 shadow-green-500/20',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-blue-500/20',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30 shadow-orange-500/20',
}

export function MetricCard({ icon: Icon, label, value, trend, color = 'purple' }: MetricCardProps) {
  return (
    <div className={cn(
      'p-6 rounded-2xl border backdrop-blur-sm transition-all hover:scale-105',
      colorStyles[color]
    )}>
      <div className="flex items-start justify-between mb-4">
        <Icon size={24} />
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend.isPositive ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/70">{label}</div>
    </div>
  )
}
```

- [ ] **Step 2: Create MonthlyAppointmentsChart component**

```tsx
interface MonthlyAppointment {
  month: string
  count: number
}

interface MonthlyAppointmentsChartProps {
  data: MonthlyAppointment[]
}

export function MonthlyAppointmentsChart({ data }: MonthlyAppointmentsChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-2 h-48 w-full">
      {data.map((item) => {
        const height = item.count === 0 ? 4 : (item.count / maxCount) * 100
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center group">
            <div
              className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-t-lg transition-all group-hover:opacity-80 min-h-[4px]"
              style={{ height: `${height}%` }}
            />
            <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 capitalize">{item.month}</span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/MetricCard.tsx src/components/admin/MonthlyAppointmentsChart.tsx
git commit -m "feat: add MetricCard and MonthlyAppointmentsChart

- MetricCard: reusable stat card with icon, value, label, trend
- MonthlyAppointmentsChart: CSS grid bar chart (no external lib)
- Support for 5 color variants
- Hover animations"
```

---

## Task 8: Admin Layout

**Files:**
- Create: `src/app/(admin)/layout.tsx`

- [ ] **Step 1: Create admin layout**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check if user is admin
  const userRole = session.user?.user_metadata?.role
  if (userRole !== 'admin') {
    redirect('/app')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950">
      <AdminSidebar />
      <main className="md:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(admin\)/layout.tsx
git commit -m "feat: add admin layout

- Route group (admin) with auth check
- Verify user role is 'admin', redirect to /app otherwise
- Render AdminSidebar and main content area
- Desktop: 64px left margin for sidebar"
```

---

## Task 9: Dashboard Page

**Files:**
- Create: `src/app/(admin)/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard page**

```tsx
import { Building, DollarSign, TrendingUp, Users } from 'lucide-react'
import { MetricCard } from '@/components/admin/MetricCard'
import { MonthlyAppointmentsChart } from '@/components/admin/MonthlyAppointmentsChart'
import { getAdminDashboardStats } from '@/lib/actions/admin'
import { GlassCard } from '@/components/ui/glass-card'

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardStats()

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">{result.error || 'Erro ao carregar dashboard'}</p>
      </div>
    )
  }

  const { companiesCount, revenue, activeCompanies, clientsCount, monthlyAppointments } = result.data

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-purple-200/60">Visão geral do sistema</p>
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
          label="Faturamento Estimado"
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
          <h2 className="text-lg font-semibold text-white mb-4">Agendamentos por Mês</h2>
          <MonthlyAppointmentsChart data={monthlyAppointments} />
        </GlassCard>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(admin\)/dashboard/page.tsx
git commit -m "feat: add admin dashboard page

- Display 4 metric cards: companies, revenue, active companies, clients
- Monthly appointments bar chart (last 6 months)
- Server-side data fetching with error handling
- Glass card styling for chart section"
```

---

## Task 10: Companies Components

**Files:**
- Create: `src/components/admin/CompaniesTable.tsx`
- Create: `src/components/admin/CompanyDetailHeader.tsx`

- [ ] **Step 1: Create CompaniesTable component**

```tsx
'use client'

import { useState } from 'react'
import { Search, Eye, Edit, Ban, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toggleCompanyStatus } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'

interface CompaniesTableProps {
  companies: CompanyWithMetrics[]
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleStatus = async (id: string, active: boolean) => {
    setToggling(id)
    try {
      const result = await toggleCompanyStatus(id, !active)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Empresa ${active ? 'desativada' : 'reativada'} com sucesso`)
      }
    } catch (error) {
      toast.error('Erro ao alterar status')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-purple-200 font-medium">Nome</th>
              <th className="text-left p-4 text-purple-200 font-medium">Email</th>
              <th className="text-left p-4 text-purple-200 font-medium">Status</th>
              <th className="text-left p-4 text-purple-200 font-medium">Criado em</th>
              <th className="text-right p-4 text-purple-200 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((company) => (
              <tr key={company.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4">
                  <a href={`/admin/empresas/${company.id}`} className="text-white font-medium hover:text-purple-300">
                    {company.name}
                  </a>
                </td>
                <td className="p-4 text-gray-300">{company.email}</td>
                <td className="p-4">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    company.active
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-gray-500/20 text-gray-300'
                  )}>
                    {company.active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="p-4 text-gray-300">
                  {format(new Date(company.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/admin/empresas/${company.id}`}
                      className="p-2 rounded-lg hover:bg-purple-500/20 text-purple-300"
                      title="Ver detalhes"
                    >
                      <Eye size={18} />
                    </a>
                    <button
                      onClick={() => handleToggleStatus(company.id, company.active)}
                      disabled={toggling === company.id}
                      className={cn(
                        'p-2 rounded-lg hover:bg-opacity-20 disabled:opacity-50',
                        company.active
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      )}
                      title={company.active ? 'Desativar' : 'Reativar'}
                    >
                      {toggling === company.id ? null : company.active ? <Ban size={18} /> : <Check size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Nenhuma empresa encontrada
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create CompanyDetailHeader component**

```tsx
'use client'

import { useState } from 'react'
import { Edit2, X, Ban, Check } from 'lucide-react'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { updateCompany, toggleCompanyStatus } from '@/lib/actions/admin'
import { toast } from 'react-toastify'

interface CompanyDetailHeaderProps {
  company: CompanyWithMetrics
}

export function CompanyDetailHeader({ company }: CompanyDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const result = await updateCompany(company.id, formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Empresa atualizada com sucesso')
      setIsEditing(false)
    }
  }

  async function handleToggleStatus() {
    setToggling(true)
    const result = await toggleCompanyStatus(company.id, !company.active)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Empresa ${company.active ? 'desativada' : 'reativada'} com sucesso`)
    }
    setToggling(false)
  }

  return (
    <div className="mb-8">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="bg-white/10 border border-white/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Nome</label>
              <input
                name="name"
                defaultValue={company.name}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-purple-200 text-sm mb-2">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={company.email}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{company.name}</h1>
            <p className="text-purple-200/60">{company.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              'px-4 py-2 rounded-full text-sm font-medium',
              company.active
                ? 'bg-green-500/20 text-green-300'
                : 'bg-gray-500/20 text-gray-300'
            )}>
              {company.active ? 'Ativa' : 'Inativa'}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
              title="Editar"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={cn(
                'p-2 rounded-lg disabled:opacity-50',
                company.active
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
              )}
              title={company.active ? 'Desativar' : 'Reativar'}
            >
              {toggling ? null : company.active ? <Ban size={20} /> : <Check size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CompaniesTable.tsx src/components/admin/CompanyDetailHeader.tsx
git commit -m "feat: add CompaniesTable and CompanyDetailHeader

- CompaniesTable: list with search, status badge, actions
- CompanyDetailHeader: inline edit form, status toggle
- Toast notifications for actions
- Active/inactive visual indicators"
```

---

## Task 11: Companies Page

**Files:**
- Create: `src/app/(admin)/empresas/page.tsx`

- [ ] **Step 1: Create companies list page**

```tsx
import { Building } from 'lucide-react'
import { CompaniesTable } from '@/components/admin/CompaniesTable'
import { getAllCompanies } from '@/lib/actions/admin'
import { GlassCard } from '@/components/ui/glass-card'

export default async function AdminEmpresasPage() {
  const result = await getAllCompanies()

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">{result.error || 'Erro ao carregar empresas'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Building size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Empresas</h1>
          <p className="text-purple-200/60">Gerencie as empresas cadastradas</p>
        </div>
      </div>

      {/* Table */}
      <GlassCard variant="default" className="p-6">
        <CompaniesTable companies={result.data} />
      </GlassCard>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(admin\)/empresas/page.tsx
git commit -m "feat: add companies list page

- Display all companies in table format
- Search by name or email
- Actions: view details, toggle status
- Server-side data fetching"
```

---

## Task 12: Company Detail Page

**Files:**
- Create: `src/app/(admin)/empresas/[id]/page.tsx`

- [ ] **Step 1: Create company detail page**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(admin\)/empresas/[id]/page.tsx
git commit -m "feat: add company detail page

- Display company info with inline edit
- Show company-specific metrics
- Format currency and dates in pt-BR
- 404 if company not found"
```

---

## Task 13: Invites Components

**Files:**
- Create: `src/components/admin/InvitesTable.tsx`
- Create: `src/components/admin/CreateInviteForm.tsx`

- [ ] **Step 1: Create InvitesTable component**

```tsx
'use client'

import { Copy, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { InviteWithDetails, InviteStatus } from '@/lib/types/admin'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'

interface InvitesTableProps {
  invites: (InviteWithDetails & { status: InviteStatus })[]
}

const statusStyles = {
  pending: 'bg-blue-500/20 text-blue-300',
  used: 'bg-green-500/20 text-green-300',
  expired: 'bg-gray-500/20 text-gray-300',
}

const statusLabels = {
  pending: 'Pendente',
  used: 'Usado',
  expired: 'Expirado',
}

export function InvitesTable({ invites }: InvitesTableProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    toast.success('Código copiado!')
    setTimeout(() => setCopied(null), 2000)
  }

  const isExpiringSoon = (invite: InviteWithDetails & { status: InviteStatus }) => {
    if (invite.status !== 'pending') return false
    const daysUntilExpiry = Math.floor((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry < 7 && daysUntilExpiry >= 0
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-4 text-purple-200 font-medium">Código</th>
            <th className="text-left p-4 text-purple-200 font-medium">Role</th>
            <th className="text-left p-4 text-purple-200 font-medium">Empresa</th>
            <th className="text-left p-4 text-purple-200 font-medium">Status</th>
            <th className="text-left p-4 text-purple-200 font-medium">Expira em</th>
            <th className="text-left p-4 text-purple-200 font-medium">Aceito por</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <tr
              key={invite.id}
              className={cn(
                'border-b border-white/5',
                isExpiringSoon(invite) && 'bg-yellow-500/10'
              )}
            >
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <code className="text-purple-300 font-mono text-sm">{invite.code}</code>
                  <button
                    onClick={() => handleCopy(invite.code)}
                    className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                    title="Copiar código"
                  >
                    {copied === invite.code ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </td>
              <td className="p-4 text-gray-300 capitalize">{invite.role.replace('_', ' ')}</td>
              <td className="p-4 text-white">{invite.company_name || '-'}</td>
              <td className="p-4">
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusStyles[invite.status])}>
                  {statusLabels[invite.status]}
                </span>
              </td>
              <td className="p-4 text-gray-300">
                {format(new Date(invite.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
              </td>
              <td className="p-4 text-gray-300">{invite.accepted_by ? 'Sim' : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {invites.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Nenhum convite encontrado
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create CreateInviteForm component**

```tsx
'use client'

import { useState } from 'react'
import { Ticket, Plus } from 'lucide-react'
import { createInvite } from '@/lib/actions/invites'
import { getAllCompanies } from '@/lib/actions/admin'
import { CompanyWithMetrics } from '@/lib/types/admin'
import { toast } from 'react-toastify'
import { useEffect } from 'react'

interface CreateInviteFormProps {
  companies: CompanyWithMetrics[]
}

export function CreateInviteForm({ companies: initialCompanies }: CreateInviteFormProps) {
  const [createNewCompany, setCreateNewCompany] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('createNewCompany', createNewCompany.toString())

    const result = await createInvite(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Convite criado: ${result.data?.code}`)
      e.currentTarget.reset()
      setCreateNewCompany(false)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Ticket size={20} />
        Criar Novo Convite
      </h3>

      {/* Create new company toggle */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={createNewCompany}
            onChange={(e) => setCreateNewCompany(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-300">Criar nova empresa</span>
        </label>
      </div>

      {createNewCompany ? (
        <>
          <div>
            <label className="block text-purple-200 text-sm mb-2">Nome da Empresa *</label>
            <input
              name="newCompanyName"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Nome da empresa"
            />
          </div>
          <div>
            <label className="block text-purple-200 text-sm mb-2">Email da Empresa *</label>
            <input
              name="newCompanyEmail"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="email@empresa.com"
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-purple-200 text-sm mb-2">Empresa *</label>
          <select
            name="companyId"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Selecione uma empresa</option>
            {initialCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} ({company.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-purple-200 text-sm mb-2">Role *</label>
        <select
          name="role"
          required
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="company_admin">Company Admin</option>
          <option value="company_user">Company User</option>
        </select>
      </div>

      <div>
        <label className="block text-purple-200 text-sm mb-2">Expira em (dias) *</label>
        <input
          name="expiresInDays"
          type="number"
          min="1"
          max="365"
          defaultValue={365}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Plus size={20} />
        {loading ? 'Criando...' : 'Gerar Convite'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/InvitesTable.tsx src/components/admin/CreateInviteForm.tsx
git commit -m "feat: add InvitesTable and CreateInviteForm

- InvitesTable: list invites with copy button, status badges
- Highlight expiring soon invites (<7 days)
- CreateInviteForm: create for existing or new company
- Role selection, expiration days input
- Toast notifications"
```

---

## Task 14: Invites Page

**Files:**
- Create: `src/app/(admin)/convites/page.tsx`

- [ ] **Step 1: Create invites page**

```tsx
import { Ticket } from 'lucide-react'
import { InvitesTable } from '@/components/admin/InvitesTable'
import { CreateInviteForm } from '@/components/admin/CreateInviteForm'
import { getInvites, getAllCompanies } from '@/lib/actions/admin'
import { GlassCard } from '@/components/ui/glass-card'

export default async function AdminConvitesPage() {
  const [invitesResult, companiesResult] = await Promise.all([
    getInvites(),
    getAllCompanies()
  ])

  if (invitesResult.error || !invitesResult.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">{invitesResult.error || 'Erro ao carregar convites'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Ticket size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Convites</h1>
          <p className="text-purple-200/60">Gerencie códigos de convite</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <CreateInviteForm companies={companiesResult.data || []} />
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <GlassCard variant="default" className="p-6">
            <InvitesTable invites={invitesResult.data} />
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(admin\)/convites/page.tsx
git commit -m "feat: add invites page

- Side-by-side layout: create form + list
- Display all non-expired invites
- Status: pending/used/expired
- Copy code to clipboard functionality"
```

---

## Task 15: Final Polish and Testing

- [ ] **Step 1: Verify all routes work**

Test navigation:
- `/admin/dashboard` - should show metrics
- `/admin/empresas` - should show companies list
- `/admin/empresas/[id]` - should show company details
- `/admin/convites` - should show invites

- [ ] **Step 2: Test admin role check**

Try accessing `/admin` routes with a non-admin user - should redirect to `/app`

- [ ] **Step 3: Test all actions**

- Create invite
- Toggle company status
- Update company
- Search companies

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete admin view implementation

All features implemented:
- Dashboard with metrics and chart
- Companies list and detail pages
- Invites management with create/list
- Mobile-responsive sidebar/drawer
- Admin role verification in layout
- Server actions with error handling"
```

---

## Implementation Complete!

**Summary:**
- 15 tasks covering database, types, validation, actions, components, and pages
- ~18 new files created
- Full CRUD for companies, invite management
- Dashboard with metrics and visualizations
- Mobile-responsive design with drawer navigation
- All actions use supabaseAdmin for global access

**Next Steps:**
1. Run migration in Supabase
2. Create admin user using seed code ADMIN-SEED-2024
3. Test all flows manually
4. Deploy and verify production behavior
