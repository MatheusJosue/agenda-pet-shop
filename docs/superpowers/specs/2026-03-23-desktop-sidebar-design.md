# Desktop Sidebar e Layout Unificado - Design Document

**Data:** 2026-03-23
**Status:** Aprovado para implementação

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
│ BottomNavigation    │ ← 4 tabs fixas
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
│ Icons/Labels   │  (max-width)       │
│                │                    │
└────────────────┴────────────────────┘
```

---

## 3. Componente: Sidebar

### 3.1 Responsabilidades
- Navegação principal no desktop
- Estado de colapso/expansão persistente
- Indicador visual de página ativa
- Links para todas as seções principais do app

### 3.2 Estados

**Estado Expandido (padrão):**
- Largura: `w-64` (256px)
- Mostra: Ícone + Label do item
- Labels visíveis e alinhados à esquerda

**Estado Colapsado:**
- Largura: `w-20` (80px)
- Mostra: Apenas ícone centralizado
- Tooltip ao hover com nome da seção

### 3.3 Comportamento de Colapso

**Botão de Toggle:**
- Localizado na base da sidebar
- Ícone: `ChevronsLeft` (quando expandido) / `ChevronsRight` (quando colapsado)
- Estado persistente em `localStorage` (chave: `sidebar-collapsed`)

**Animação:**
- Transição suave de largura: `transition-all duration-300`
- Labels desaparecem com fade: `transition-opacity duration-200`

### 3.4 Itens de Navegação

Ordem dos itens (topo → base):
1. **Início** - Icon: Home - Link: `/app`
2. **Agendamentos** - Icon: Calendar - Link: `/app/agendamentos`
3. **Clientes** - Icon: Users - Link: `/app/clientes`
4. **Pets** - Icon: PawPrint - Link: `/app/pets`
5. **Serviços** - Icon: Scissors - Link: `/app/servicos`
6. **Pacotes** - Icon: Package - Link: `/app/pacotes`

**Itens da Base (separados por divisor):**
7. **Perfil** - Icon: UserCircle - Link: `/app/perfil`
8. **Ajuda** - Icon: HelpCircle - Link: `/app/ajuda`
9. **Toggle Button** (último item)

### 3.5 Item Ativo
- Background gradiente: `bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20`
- Border esquerda: `border-l-4 border-purple-500`
- Texto: `text-purple-400` (não ativo: `text-zinc-400 hover:text-zinc-200`)

---

## 4. Componente: DesktopHeader

### 4.1 Responsabilidades
- Header simplificado exclusivo para desktop
- Logo à esquerda
- Avatar do usuário à direita com dropdown
- Sem hamburger menu (navegação está na sidebar)

### 4.2 Estrutura

```
┌──────────────────────────────────────────────┐
│ [Logo]                [Avatar ▼]              │
└──────────────────────────────────────────────┘
```

**Left:** Logo Pet Shop
- Texto gradiente: "Pet Shop"
- Link para `/app`

**Right:** User Dropdown
- Avatar circular com iniciais
- Dropdown ao click com:
  - Perfil
  - Sair

### 4.3 Visibilidade
- Visível apenas em desktop: `hidden xl:flex`
- Altura fixa: `h-16`
- Background: Glass effect com gradiente sutil

---

## 5. Modificações em Componentes Existentes

### 5.1 AppHeader
**Comportamento atual (mobile):**
- Hamburger menu → abre drawer
- Avatar → abre menu dropdown

**Comportamento desktop:**
- **Hide completely** em desktop (`hidden xl:hidden`)
- DesktopHeader substitui completamente

### 5.2 BottomNavigation
**Comportamento:**
- Hide em desktop: `hidden xl:flex` → `xl:hidden`
- Visível apenas em mobile

### 5.3 AppDrawer
**Sem alterações**
- Continua funcionando apenas em mobile
- Acionado pelo hamburger no AppHeader

---

## 6. Layout Unificado para Páginas de Listagem

### 6.1 Páginas Afetadas
- `/app/agendamentos`
- `/app/clientes`
- `/app/pets`
- `/app/pacotes`
- `/app/servicos`

### 6.2 Padrão de Container

```tsx
// Wrapper padrão para todas as listagens
<div className="space-y-6">
  {/* Page Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
        Título da Página
      </h1>
      <p className="text-zinc-400 mt-1">Subtítulo descritivo</p>
    </div>
    <Button variant="gradient">Adicionar</Button>
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
</div>
```

### 6.3 Padrões de Cards

**Card padrão (GlassCard):**
```tsx
<GlassCard className="p-6 hover:scale-[1.02] transition-transform">
  {/* Content */}
</GlassCard>
```

**Grid responsivo:**
- Mobile: 1 coluna
- MD: 2 colunas
- XL: 3 colunas
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
```

### 6.4 Estados Padronizados

**Empty State:**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <IconComponent className="w-16 h-16 text-zinc-600 mb-4" />
  <p className="text-zinc-400 text-lg">Mensagem vazia</p>
  <Button variant="gradient" className="mt-4">Ação principal</Button>
</div>
```

**Loading State:**
```tsx
<div className="flex items-center justify-center py-12">
  <Loader className="animate-spin text-purple-500" />
</div>
```

---

## 7. Cores e Estilos

### 7.1 Sidebar

**Background (expandida):**
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

### 7.2 DesktopHeader

**Background:**
```tsx
className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800"
```

**Logo gradiente:**
```tsx
className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400
           bg-clip-text text-transparent"
```

### 7.3 Animações

**Transições da sidebar:**
- Largura: `transition-all duration-300 ease-in-out`
- Labels: `transition-opacity duration-200`

**Hover effects:**
- Cards: `hover:scale-[1.02] transition-transform duration-200`
- Buttons: `active:scale-95 transition-transform`

---

## 8. Arquitetura de Arquivos

### 8.1 Novos Componentes

```
src/components/layout/
├── sidebar.tsx              # NOVO: Sidebar desktop collapsible
├── desktop-header.tsx       # NOVO: Header simplificado desktop
├── app-header.tsx           # MODIFICAR: hide no desktop
├── bottom-navigation.tsx    # MODIFICAR: hide no desktop
└── app-drawer.tsx           # SEM ALTERAÇÕES
```

### 8.2 Layout Principal

**`src/app/(app)/app/layout.tsx`:**
```tsx
// Desktop: Sidebar + DesktopHeader + Content
// Mobile: AppHeader + BottomNav + Content (drawer when open)
```

---

## 9. Plano de Implementação

### Fase 1: Sidebar Component
- Criar `sidebar.tsx` com estados expandido/colapsado
- Implementar itens de navegação
- Adicionar persistência de estado em localStorage

### Fase 2: DesktopHeader Component
- Criar `desktop-header.tsx` com logo + avatar dropdown
- Implementar menu do usuário

### Fase 3: Layout Responsivo
- Modificar `app/layout.tsx` para alternar entre desktop/mobile
- Atualizar `app-header.tsx` para hide no desktop
- Atualizar `bottom-navigation.tsx` para hide no desktop

### Fase 4: Unificação de Layouts
- Aplicar padrão unificado em `/app/agendamentos`
- Aplicar padrão unificado em `/app/clientes`
- Aplicar padrão unificado em `/app/pets`
- Aplicar padrão unificado em `/app/pacotes`
- Aplicar padrão unificado em `/app/servicos`

---

## 10. Critérios de Sucesso

- [ ] Sidebar visível e funcional em desktop (≥ 1280px)
- [ ] Sidebar colapsável com persistência de estado
- [ ] Mobile completamente inalterado
- [ ] Todas as páginas de listagem com layout consistente
- [ ] Transições suaves entre estados de sidebar
- [ ] Navegação funcional em ambos os contextos
- [ ] Sem regressões em funcionalidades existentes

---

**Assinatura:** Design aprovado pelo usuário. Pronto para implementação.
