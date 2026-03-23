# Desktop Sidebar e Layout Unificado - Design Document

**Data:** 2026-03-23
**Status:** Revisão 2 - Endereçando feedback do reviewer (Round 2)

## 1. Visão Geral

### 1.1 Objetivo
Criar uma experiência desktop distinta e profissional para o aplicativo Agenda Pet Shop, mantendo a experiência mobile inalterada. Unificar os padrões de layout em todas as páginas de listagem dentro do `/app`.

### 1.2 Escopo
- **Incluso:** Sidebar desktop collapsible, header responsivo, unificação de layouts de listagem
- **Exclusdo:** Alterações na experiência mobile (header + bottom tabs + drawer permanecem iguais)

---

## 2. Arquitetura

### 2.1 Breakpoint Desktop/Mobile
- **Desktop:** `xl` (1280px ou maior)
- **Mobile:** Abaixo de 1280px
- **Comportamento:** Alternância completa de padrões de navegação no breakpoint

### 2.2 Estrutura de Layout

**Mobile (< 1280px):**
```
┌─────────────────────┐
│ AppHeader (compacto) │ ← Logo + Hamburger + Avatar
├─────────────────────┤
│                     │
│   Page Content      │
│                     │
├─────────────────────┤
│ BottomNavigation    │ ← 5 tabs fixas
└─────────────────────┘
```

**Desktop (≥ 1280px):**
```
┌─────────────────────────────────────┐
│ Sidebar        │  DesktopHeader     │
│ (collapsible)  │  (simplificado)    │
├────────────────┼────────────────────┤
│                │                    │
│ Navigation     │  Page Content      │
│ Icons/Labels   │  (max-w-7xl)       │
│                │                    │
└────────────────┴────────────────────┘
```

### 2.3 Estratégia de Implementação de Layout

**Criação de Layout Wrapper:**
Como as páginas atualmente incluem `AppHeader` e `BottomNavigation` diretamente, a implementação usará um componente `AppLayout` wrapper que:

1. Detecta breakpoint via CSS/Tailwind (não JavaScript)
2. Renderiza condicionalmente via classes `hidden xl:flex` / `flex xl:hidden`
3. Preserva o comportamento mobile existente

**Arquitetura:**
```
src/components/layout/
├── app-layout.tsx           # NOVO: Wrapper que gerencia desktop/mobile
├── sidebar.tsx              # NOVO: Sidebar desktop collapsible
├── desktop-header.tsx       # NOVO: Header simplificado desktop
├── app-header.tsx           # EXISTENTE: hide no desktop
├── bottom-navigation.tsx    # EXISTENTE: hide no desktop
└── app-drawer.tsx           # EXISTENTE: sem alterações
```

---

## 3. Componente: Sidebar

### 3.1 Responsabilidades
- Navegação principal no desktop
- Estado de colapso/expansão persistente
- Indicador visual de página ativa
- Links para todas as seções do app (combina navegação principal + items de conta)

### 3.2 Estados

**Estado Expandido (padrão):**
- Largura: `w-64` (256px)
- Mostra: Ícone + Label do item
- Labels visíveis e alinhados à esquerda

**Estado Colapsado:**
- Largura: `w-20` (80px)
- Mostra: Apenas ícone centralizado
- Tooltip ao hover com nome da seção

**Estado Inicial:**
- Padrão: **Expandido**
- Verifica `localStorage` na montagem
- Key: `agenda-pet-shop:sidebar-collapsed`

### 3.3 Comportamento de Colapso

**Botão de Toggle:**
- Localizado na base da sidebar
- Ícone: `ChevronsLeft` (expandido) / `ChevronsRight` (colapsado)
- Estado persistente em `localStorage` (chave: `agenda-pet-shop:sidebar-collapsed`)
- ARIA: `aria-label="Colapsar sidebar"` / `aria-label="Expandir sidebar"`

**Animação:**
- Transição suave de largura: `transition-all duration-300 ease-in-out`
- Labels desaparecem com fade: `transition-opacity duration-200 ease-in-out`

### 3.4 Itens de Navegação

**Itens Principais (topo → base):**
1. **Início** - Icon: `Home` - Link: `/app`
2. **Agenda** - Icon: `Calendar` - Link: `/app/agendamentos`
3. **Clientes** - Icon: `Users` - Link: `/app/clientes`
4. **Pacotes** - Icon: `Package` - Link: `/app/pacotes`
5. **Serviços** - Icon: `Scissors` - Link: `/app/servicos`
6. **Pets** - Icon: `Dog` - Link: `/app/pets`

**Itens da Base (separados por divisor):**
7. **Perfil** - Icon: `UserCircle` - Link: `/app/perfil`
8. **Ajuda** - Icon: `HelpCircle` - Link: `/app/ajuda`
9. **Toggle Button** (último item)

**Nota:** Sidebar inclui Pets, Perfil e Ajuda pois desktop não tem drawer. Mobile continua com apenas 5 tabs no bottom nav + drawer para items extras.

### 3.5 Detecção de Item Ativo

**Lógica de Matching:**
```tsx
// Para item com href="/app/agendamentos":
// - Ativo quando pathname === "/app/agendamentos"
// - NÃO ativo em páginas aninhadas como "/app/agendamentos/novo" ou "/app/agendamentos/[id]"

// Para item com href="/app":
// - Ativo quando pathname === "/app"
```

**Implementação:**
- Usa `usePathname()` do Next.js
- Matching exato (não prefixo)
- Páginas de detail/novo ficam sem highlight de sidebar (comportamento aceitável)

**Estilo Ativo:**
- Background gradiente: `bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20`
- Border esquerda: `border-l-4 border-purple-500`
- Texto: `text-purple-400`

**Estilo Inativo:**
- Texto: `text-zinc-400`
- Hover: `text-zinc-200 hover:bg-zinc-800/50`

### 3.6 Tooltip (Estado Colapsado)

**Implementação Customizada:**
```tsx
// Group para hover
<div className="group relative flex items-center">
  <Link href={item.href} className={navItemClasses}>
    <Icon size={22} />
  </Link>

  {/* Tooltip - visível apenas no estado colapsado */}
  {collapsed && (
    <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-800 text-zinc-200 text-sm
                    rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100
                    group-hover:visible transition-all duration-200 z-[60]
                    shadow-lg border border-zinc-700 pointer-events-none">
      {item.label}
      {/* Small arrow */}
      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent
                      border-r-zinc-800" />
    </div>
  )}
</div>
```

**Detalhes:**
- Posicionamento: À direita do ícone (`left-full ml-3`)
- Delay: CSS transition de 200ms
- Z-index: `z-[60]` para ficar acima de tudo
- Arrow decorativo usando border hack
- `pointer-events-none` para não interferir com hover

---

## 4. Componente: DesktopHeader

### 4.1 Responsabilidades
- Header simplificado exclusivo para desktop
- Logo à esquerda (link para `/app`)
- Avatar do usuário à direita com dropdown
- Sem hamburger menu (navegação está na sidebar)

### 4.2 Estrutura

```
┌──────────────────────────────────────────────┐
│ [Logo]                [Avatar ▼]              │
└──────────────────────────────────────────────┘
```

### 4.3 Especificação do Dropdown

**Implementação Customizada** (seguindo padrão existente no AppDrawer):

**Estrutura:**
```tsx
// Estado gerenciado no DesktopHeader
const [dropdownOpen, setDropdownOpen] = useState(false)

// Dropdown com backdrop + menu (similar ao AppDrawer)
{dropdownOpen && (
  <>
    <div className="fixed inset-0 z-50" onClick={() => setDropdownOpen(false)} />
    <div className="absolute right-0 top-full mt-2 z-[60] w-48 bg-zinc-900 rounded-xl
                    border border-zinc-700 shadow-xl overflow-hidden">
      <Link href="/app/perfil" className="flex items-center gap-3 px-4 py-3
                                                 text-zinc-300 hover:bg-zinc-800
                                                 hover:text-white transition-colors">
        <User size={18} />
        <span>Perfil</span>
      </Link>
      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3
                                                       text-red-400 hover:bg-red-500/10
                                                       hover:text-red-300 transition-colors">
        <LogOut size={18} />
        <span>Sair</span>
      </button>
    </div>
  </>
)}
```

**Items:**
1. **Perfil** - Link: `/app/perfil` - Icon: User
2. **Sair** - Action: `logout()` - Icon: LogOut (text-red-400)

**Z-Index:**
- Backdrop: `z-50`
- Dropdown menu: `z-[60]` (acima de tudo)

**Implementação de Logout:**
- Usa action `logout()` de `@/lib/actions/auth`
- Botão direto no dropdown (não é form submit)

### 4.4 Visibilidade
- Visível apenas em desktop: `hidden xl:flex`
- Altura fixa: `h-16`
- Z-index: `z-40` (abaixo da sidebar z-50)

---

## 5. Componente: AppLayout

### 5.1 Responsabilidades
- Wrapper que gerencia renderização desktop vs mobile
- Fornece estrutura consistente para todas as páginas do app
- Gerencia estado do drawer (mobile)

### 5.2 Implementação

```tsx
// src/components/layout/app-layout.tsx
'use client'

interface AppLayoutProps {
  children: React.ReactNode
  companyName: string
  user: { name?: string; email?: string }
}

export function AppLayout({ children, companyName, user }: AppLayoutProps) {
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden xl:flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <DesktopHeader user={user} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout - AppHeader gerencia seu próprio drawer state */}
      <div className="flex xl:hidden min-h-screen">
        <AppHeader companyName={companyName} user={user} />
        <main className="flex-1 pb-20">{children}</main>
        <BottomNavigation />
      </div>
    </>
  )
}
```

**Nota:** AppHeader continua gerenciando seu próprio estado do drawer internamente. O AppLayout apenas controla a visibilidade desktop/mobile via CSS.

### 5.3 Modificação de Páginas Existentes

**Before:**
```tsx
<AppHeader ... />
<main>...</main>
<BottomNavigation />
```

**After:**
```tsx
<AppLayout companyName={...} user={...}>
  <main>...</main>
</AppLayout>
```

---

## 6. Modificações em Componentes Existentes

### 6.1 AppHeader
**Modificação necessária:**
- Adicionar `hidden xl:flex` (ao invés de apenas `<header>`) para hide no desktop
- Internamente continua gerenciando seu próprio drawer state (sem mudanças em props)

**Implementação:**
```tsx
// Adicionar className ao header existente
<header className="hidden xl:flex sticky top-0 z-30 ...">
  {/* restante do código unchanged */}
</header>
```

### 6.2 BottomNavigation
**Modificação necessária:**
- Adicionar `className="hidden xl:flex"` → mudar para `xl:hidden` para hide no desktop

### 6.3 AppDrawer
**Sem alterações**
- Continua funcionando apenas em mobile
- Estado controlado pelo `AppLayout`

---

## 7. Layout Unificado para Páginas de Listagem

### 7.1 Páginas Afetadas
- `/app/agendamentos`
- `/app/clientes`
- `/app/pets`
- `/app/pacotes`
- `/app/servicos`

### 7.2 Padrão de Container

```tsx
// Wrapper padrão para todas as listagens
<main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
  {/* Page Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
        Título da Página
      </h1>
      <p className="text-zinc-400 mt-1">Subtítulo descritivo</p>
    </div>
    <Button variant="primary">Adicionar</Button>
  </div>

  {/* Filters / Search (if applicable) */}
  {hasFilters && (
    <div className="flex gap-3">
      {/* Search input, filters, etc */}
    </div>
  )}

  {/* Content Area */}
  <div className="grid gap-4">
    {/* Cards or list items */}
  </div>
</main>
```

### 7.3 Padrões de Cards

**Card padrão (GlassCard):**
- Componente existe em `src/components/ui/glass-card.tsx`
- Usar: `<GlassCard className="p-6 hover:scale-[1.02] transition-transform">`

**Grid responsivo:**
- Mobile: 1 coluna
- MD: 2 colunas
- XL: 3 colunas (desktop tem mais espaço)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
```

### 7.4 Estados Padronizados

**Empty State:**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <IconComponent className="w-16 h-16 text-zinc-600 mb-4" />
  <p className="text-zinc-400 text-lg">Mensagem vazia</p>
  <Button variant="primary" className="mt-4">Ação principal</Button>
</div>
```

**Loading State:**
```tsx
<div className="flex items-center justify-center py-12">
  <Loader className="animate-spin text-purple-500" />
</div>
```

**Error State:**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
  <p className="text-zinc-300 text-lg">{error}</p>
  <Button variant="secondary" className="mt-4" onClick={retry}>
    Tentar novamente
  </Button>
</div>
```

---

## 8. Cores e Estilos

### 8.1 Sidebar

**Background:**
```tsx
className="bg-zinc-900/95 border-r border-zinc-800"
```

**Item não ativo:**
```tsx
className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
```

**Item ativo:**
```tsx
className="bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20
           border-l-4 border-purple-500 text-purple-400"
```

### 8.2 DesktopHeader

**Background:**
```tsx
className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800"
```

**Logo gradiente:**
```tsx
className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400
           bg-clip-text text-transparent"
```

### 8.3 Animações

**Easing function padrão:** `ease-in-out`

**Transições da sidebar:**
- Largura: `transition-all duration-300 ease-in-out`
- Labels: `transition-opacity duration-200 ease-in-out`

**Hover effects:**
- Cards: `hover:scale-[1.02] transition-transform duration-200 ease-out`
- Buttons: `active:scale-95 transition-transform duration-100 ease-out`

---

## 9. Acessibilidade

### 9.1 Sidebar

**ARIA Labels:**
- Toggle button: `aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}`
- Nav: `<nav aria-label="Navegação principal">`
- Links ativos: `aria-current="page"`

**Keyboard Navigation:**
- Tab order through nav items
- Enter/Space para ativar links
- Toggle button focável

**Focus Management:**
- Ao colapsar, foco permanece no toggle
- Ao expandir, foco permanece no toggle

### 9.2 Anúncios de Screen Reader

**Mudança de estado da sidebar:**
- Adicionar `aria-live="polite"` em um elemento que anuncia "Sidebar colapsada" ou "Sidebar expandida"

---

## 10. Arquitetura de Arquivos

### 10.1 Novos Componentes

```
src/components/layout/
├── app-layout.tsx           # NOVO: Wrapper desktop/mobile
├── sidebar.tsx              # NOVO: Sidebar desktop collapsible
├── desktop-header.tsx       # NOVO: Header simplificado desktop
├── app-header.tsx           # MODIFICAR: hide no desktop, prop onMenuClick
├── bottom-navigation.tsx    # MODIFICAR: hide no desktop
└── app-drawer.tsx           # SEM ALTERAÇÕES
```

### 10.2 Páginas a Modificar

Todas as páginas em `src/app/(app)/app/` que usam `<AppHeader>` e `<BottomNavigation>`:
- `page.tsx` (home)
- `agendamentos/page.tsx`
- `clientes/page.tsx`
- `pets/page.tsx`
- `pacotes/page.tsx`
- `servicos/page.tsx`
- `perfil/page.tsx`
- `ajuda/page.tsx`

---

## 11. Plano de Implementação

### Fase 1: Criar AppLayout Wrapper
- Criar `app-layout.tsx` com lógica desktop/mobile
- Testar em uma página primeiro

### Fase 2: Sidebar Component
- Criar `sidebar.tsx` com estados expandido/colapsado
- Implementar itens de navegação
- Adicionar persistência de estado em localStorage
- Adicionar tooltips

### Fase 3: DesktopHeader Component
- Criar `desktop-header.tsx` com logo + avatar dropdown
- Implementar menu do usuário

### Fase 4: Modificar Componentes Existentes
- Atualizar `app-header.tsx` para receber `onMenuClick` e hide no desktop
- Atualizar `bottom-navigation.tsx` para hide no desktop

### Fase 5: Migração das Páginas
- Substituir `AppHeader + BottomNavigation` por `AppLayout` em todas as páginas
- Testar navegação

### Fase 6: Unificação de Layouts
- Aplicar padrão unificado em páginas de listagem
- Verificar responsividade

---

## 12. Critérios de Sucesso

- [ ] Sidebar visível e funcional em desktop (≥ 1280px)
- [ ] Sidebar colapsável com persistência de estado
- [ ] Mobile completamente inalterado (visual e funcionalidade)
- [ ] Todas as páginas de listagem com layout consistente
- [ ] Transições suaves entre estados de sidebar
- [ ] Navegação funcional em ambos os contextos
- [ ] Sem regressões em funcionalidades existentes
- [ ] Acessibilidade: keyboard navigation funcional
- [ ] Z-index correto (sidebar acima de header)
- [ ] Dropdown do header funciona corretamente

---

**Assinatura:** Design revisado (v2) - Pendente aprovação final.
