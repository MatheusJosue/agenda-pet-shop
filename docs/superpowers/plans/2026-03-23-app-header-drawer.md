# App Header com Menu Lateral (Drawer) - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um header fixo com menu lateral deslizante (drawer/hamburger) que mostra o nome da empresa logada, navegação, informações do usuário e botão de logout.

**Architecture:** Componente `AppHeader` client-side que gerencia o estado do drawer. Dados (empresa + usuário) buscados via server action `getAppStats()`. Drawer com animação slide-in e backdrop blur.

**Tech Stack:** Next.js 15 (App Router), React hooks (useState), TailwindCSS, Lucide icons, Supabase

---

## File Structure

```
src/
├── components/
│   └── layout/
│       ├── app-header.tsx          [CREATE] Header principal com hamburger
│       └── app-drawer.tsx          [CREATE] Menu lateral deslizante
├── lib/
│   └── actions/
│       └── app.ts                  [MODIFY]  Adicionar fetch de company name
└── app/
    └── (app)/
        └── app/
            └── page.tsx            [MODIFY]  Usar novo AppHeader
```

---

## Task 1: Atualizar `getAppStats()` para buscar nome da empresa

**Files:**
- Modify: `src/lib/actions/app.ts`

- [ ] **Step 1: Adicionar fetch da empresa**

```typescript
// Em getAppStats(), após obter o user, adicionar:

// Fetch company name
const { data: company } = await supabase
  .from('companies')
  .select('name')
  .eq('id', user?.user_metadata?.company_id)
  .single()

const companyName = company?.name || 'Agenda Pet Shop'
```

- [ ] **Step 2: Atualizar interface AppStats**

```typescript
export interface AppStats {
  todayCount: number
  clientsCount: number
  servicesCount: number
  monthlyRevenue: number
  todayAppointments: any[]
  user: any
  companyName: string  // ADD THIS
}
```

- [ ] **Step 3: Retornar companyName no response**

```typescript
return {
  data: {
    todayCount: todayCount || 0,
    clientsCount: clients || 0,
    servicesCount: services || 0,
    monthlyRevenue,
    todayAppointments: todayAppointments || [],
    user,
    companyName,  // ADD THIS
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/app.ts
git commit -m "feat: add company name to app stats"
```

---

## Task 2: Criar componente `AppDrawer`

**Files:**
- Create: `src/components/layout/app-drawer.tsx`

- [ ] **Step 1: Criar arquivo do componente**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { Home, Calendar, Users, PawPrint, Scissors, Package, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppDrawerProps {
  isOpen: boolean
  onClose: () => void
  companyName: string
  user: {
    name?: string
    email?: string
  }
}

const menuItems = [
  { label: 'Início', href: '/app', icon: Home },
  { label: 'Agendamentos', href: '/app/agendamentos', icon: Calendar },
  { label: 'Clientes', href: '/app/clientes', icon: Users },
  { label: 'Pets', href: '/app/pets', icon: PawPrint },
  { label: 'Serviços', href: '/app/servicos', icon: Scissors },
  { label: 'Pacotes', href: '/app/pacotes', icon: Package },
]

export function AppDrawer({ isOpen, onClose, companyName, user }: AppDrawerProps) {
  const router = useRouter()

  async function handleLogout() {
    await logout()
  }

  function navigate(href: string) {
    router.push(href)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white dark:bg-gray-900 z-50
          shadow-2xl transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {companyName}
            </h2>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => navigate(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                             text-gray-700 dark:text-gray-300
                             hover:bg-purple-50 dark:hover:bg-purple-950/30
                             hover:text-purple-600 dark:hover:text-purple-400
                             transition-colors"
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info & Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="px-4 py-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700
                       hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/app-drawer.tsx
git commit -m "feat: add AppDrawer component with navigation and logout"
```

---

## Task 3: Criar componente `AppHeader`

**Files:**
- Create: `src/components/layout/app-header.tsx`

- [ ] **Step 1: Criar arquivo do componente**

```tsx
'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppDrawer } from './app-drawer'

interface AppHeaderProps {
  companyName: string
  user: {
    name?: string
    email?: string
  }
}

export function AppHeader({ companyName, user }: AppHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-purple-200/50
                         backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 max-w-lg mx-auto">
          {/* Left side - Menu button + Logo */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-950/30"
            >
              <Menu size={24} />
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                             flex items-center justify-center shadow-lg shadow-purple-500/25">
                🐾
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                  {companyName}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        companyName={companyName}
        user={user}
      />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/app-header.tsx
git commit -m "feat: add AppHeader component with hamburger menu"
```

---

## Task 4: Atualizar página /app para usar novo `AppHeader`

**Files:**
- Modify: `src/app/(app)/app/page.tsx`

- [ ] **Step 1: Importar AppHeader**

```tsx
import { AppHeader } from '@/components/layout/app-header'
```

- [ ] **Step 2: Remover header inline (linhas ~68-87)**

Substituir todo o bloco `<header>...</header>` por:

```tsx
<AppHeader companyName={companyName} user={user} />
```

- [ ] **Step 3: Adicionar companyName ao state**

```tsx
const [companyName, setCompanyName] = useState('Agenda Pet Shop')

// Dentro de loadData():
setCompanyName(result.data.companyName || 'Agenda Pet Shop')
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/app/page.tsx
git commit -m "feat: use new AppHeader on home page"
```

---

## Task 5: Testar manualmente

- [ ] **Step 1: Iniciar dev server**

```bash
npm run dev
```

- [ ] **Step 2: Acessar http://localhost:3000/app**

Verificar:
- [ ] Header mostra nome da empresa
- [ ] Botão hamburger abre drawer
- [ ] Drawer tem itens de navegação
- [ ] Clicar fora fecha drawer
- [ ] Logout funciona (redireciona para /login)

- [ ] **Step 3: Testar navegação pelo drawer**

Clicar em cada item e verificar redirecionamento.

---

## Task 6: Commit final e cleanup

- [ ] **Step 1: Verificar mudanças**

```bash
git status
git diff
```

- [ ] **Step 2: Se tudo ok, commit final**

```bash
git add .
git commit -m "feat: implement app header with drawer navigation

- Add AppHeader component with hamburger menu
- Add AppDrawer with navigation and logout
- Update getAppStats to fetch company name
- Replace inline header on /app page"
```

---

## Referências

- Spec: `docs/superpowers/specs/2026-03-23-app-header-drawer-design.md`
- Existing header pattern: `src/components/layout/compact-header.tsx`
- Auth actions: `src/lib/actions/auth.ts`
