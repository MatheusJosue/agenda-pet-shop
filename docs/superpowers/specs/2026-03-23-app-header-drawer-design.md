# App Header com Menu Lateral (Drawer)

## Data: 2026-03-23

## Resumo

Criar um header fixo com menu lateral deslizante (drawer/hamburger) para substituir o header atual da aplicação. O novo header deve mostrar o nome da empresa logada e fornecer acesso à navegação, informações do usuário e logout.

## Motivação

- O header atual mostra "Agenda Pet Shop" hardcoded
- Falta botão de logout na página /app
- Necessidade de uma navegação mais acessível em mobile
- Usuário deve ver o nome da sua empresa, não o nome genérico do sistema

## Arquitetura

### Fluxo de Dados

```
Session (user.company_id)
    ↓
getAppStats() - fetch company.name
    ↓
AppHeader - recebe company + user
    ↓
Drawer - mostra navegação + user info
```

### Componentes

#### 1. `AppHeader` (novo)

**Localização:** `src/components/layout/app-header.tsx`

**Props:**
```typescript
interface AppHeaderProps {
  companyName: string
  user: {
    name?: string
    email?: string
  }
  currentPage?: string // para highlight do menu ativo
}
```

**Responsabilidades:**
- Renderizar header fixo com nome da empresa + botão hamburger
- Gerenciar estado de aberto/fechado do drawer
- Renderizar `AppDrawer` quando aberto

#### 2. `AppDrawer` (novo)

**Localização:** `src/components/layout/app-drawer.tsx`

**Props:**
```typescript
interface AppDrawerProps {
  isOpen: boolean
  onClose: () => void
  companyName: string
  user: {
    name?: string
    email?: string
  }
  currentPage?: string
}
```

**Responsabilidades:**
- Renderizar menu lateral deslizante
- Mostrar itens de navegação com ícones
- Mostrar informações do usuário
- Ação de logout

#### 3. Modificação: `getAppStats()`

**Localização:** `src/lib/actions/app.ts`

**Mudanças:**
- Adicionar fetch de `companies` usando `user.company_id` ou `user.user_metadata.company_id`
- Retornar `companyName` no `AppStats`

### UI Design

```
┌─────────────────────────────────┐
│ ☰  PetShop XYZ                 │ ← AppHeader
└─────────────────────────────────┘
     ↓ (ao clicar em ☰)
┌─────────────────────────────────┐
│ ┤                              │ ← AppDrawer (overlay)
│ ├─ 🏠 Início                    │
│ ├─ 📅 Agendamentos              │
│ ├─ 👥 Clientes                  │
│ ├─ 🐾 Pets                      │
│ ├─ ✂️ Serviços                  │
│ ├─ 📦 Pacotes                   │
│ ─────────────────────────      │ ← Divider
│ ├─ 👤 João Silva                │ ← User info
│ │    joao@email.com             │
│ ─────────────────────────      │
│ └─ 🚪 Sair                     │ ← Logout
│                                │
└─────────────────────────────────┘
```

### Comportamento

**Mobile (default):**
- Drawer cobre 80% da largura da tela
- Backdrop escurecido com blur
- Swipe para fechar (opcional)

**Desktop (>md):**
- Drawer com largura fixa de 320px
- Backdrop escurecido com blur

**Animações:**
- Slide-in da direita (transform: translateX)
- Fade-in do backdrop
- Duração: 300ms, easing: ease-out

### Items do Menu

| Label        | Link              | Icon      |
|--------------|-------------------|-----------|
| Início       | /app              | Home      |
| Agendamentos | /app/agendamentos | Calendar  |
| Clientes     | /app/clientes     | Users     |
| Pets         | /app/pets         | PawPrint  |
| Serviços     | /app/servicos     | Scissors  |
| Pacotes      | /app/pacotes      | Package   |

## Plano de Testes

1. Header mostra nome da empresa corretamente
2. Drawer abre ao clicar no hamburger
3. Drawer fecha ao clicar no backdrop
4. Logout funciona corretamente
5. Items de navegação direcionam corretamente
6. Usuário deslogado é redirecionado para /login

## Considerações

- Requer `user.company_id` disponível na sessão
- Se company_id não existir, usar fallback: "Agenda Pet Shop"
- Usuário admin vê "Admin" como company name (ou nome da empresa associada)
