# Admin View - Design Document

**Date:** 2026-03-23
**Status:** Draft
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

## 5. Server Actions

### 5.1 `src/lib/actions/admin.ts`

```typescript
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'

// Dashboard metrics
export async function getAdminDashboardStats() {
  const [companiesCount, revenue, activeCompanies, clientsCount] = await Promise.all([
    supabaseAdmin.from('companies').select('id', { count: 'exact' }),
    supabaseAdmin.from('appointments')
      .select('price')
      .eq('status', 'completed'),
    // ...
  ])
  return { companiesCount, revenue, activeCompanies, clientsCount }
}

// Companies
export async function getAllCompanies(filters?: { search?: string }) {
  let query = supabaseAdmin.from('companies').select('*')
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }
  return query.order('created_at', { ascending: false })
}

export async function getCompanyById(id: string) {
  return supabaseAdmin.from('companies').select('*').eq('id', id).single()
}

export async function updateCompany(id: string, data: { name?: string; email?: string }) {
  return supabaseAdmin.from('companies').update(data).eq('id', id)
}

export async function toggleCompanyStatus(id: string, active: boolean) {
  // Use a separate field or soft delete pattern
}

// Company details metrics
export async function getCompanyMetrics(companyId: string) {
  // Fetch scoped metrics for a specific company
}
```

### 5.2 `src/lib/actions/invites.ts`

```typescript
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'

export async function createInvite(data: {
  companyId: string
  role: 'company_admin' | 'company_user'
  expiresInDays: number
}) {
  const code = generateInviteCode()
  return supabaseAdmin.from('invites').insert({
    code,
    company_id: data.companyId,
    role: data.role,
    expires_at: new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
  })
}

export async function getInvites() {
  return supabaseAdmin
    .from('invites')
    .select('*, companies(name)')
    .order('created_at', { ascending: false })
}

function generateInviteCode(): string {
  // Generate unique code: PREFIX-XXXX-YYYY
  return `INVITE-${crypto.randomUUID().split('-')[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
}
```

---

## 6. Components

### 6.1 Admin Components

```
src/components/admin/
├── AdminSidebar.tsx       # Sidebar navigation
├── MetricCard.tsx         # Reusable metric card
├── CompaniesTable.tsx     # Companies list table
├── CompanyDetailHeader.tsx
├── InvitesTable.tsx       # Invites list table
└── CreateInviteForm.tsx
```

### 6.2 Shared UI Components

Reuse existing components from `src/components/ui/`:
- `Button.tsx`
- `Input.tsx`
- `Select.tsx`
- `Modal.tsx`

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

### 8.2 No Schema Changes Required

A visão admin não requer alterações no schema. Usa as tabelas existentes.

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
