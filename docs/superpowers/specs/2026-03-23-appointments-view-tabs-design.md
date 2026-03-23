# Agendamentos - Tabs de Visualização (Dia/Semana/Mês)

**Data:** 2026-03-23
**Status:** Design Aprovado
**Autor:** Claude

## Resumo

Adicionar tabs de visualização (Dia/Semana/Mês) na página de agendamentos, permitindo filtrar e navegar entre períodos específicos. Cada visualização carrega apenas os agendamentos do período selecionado via API.

## Requisitos

### Funcionalidades

1. **Tabs de Visualização**
   - Três modos: Dia, Semana, Mês
   - Visualização padrão: Dia (data atual)

2. **Navegação entre Datas**
   - Botões anterior/próximo
   - Indicador do período atual (ex: "23 de Março, 2026")
   - Navegação respeita o modo selecionado (+1 dia, +1 semana, +1 mês)

3. **Filtragem por API**
   - Carregar apenas agendamentos do período selecionado
   - Reutilizar `getAppointments()` com filtros `startDate`/`endDate`

4. **Estados da UI**
   - Loading: spinner durante carregamento
   - Empty: mensagem informativa sem botões de ação
   - Error: tratamento de erros com mensagem adequada

## Arquitetura

### Novos Componentes

```
src/components/agendamentos/
├── ViewModeSelector.tsx       # Tabs + controles de navegação
└── ViewModeSelector.module.css # Estilos do componente
```

### Novo Hook

```
src/hooks/
└── useAppointmentsFilter.ts   # Lógica de filtragem e carregamento
```

### Componentes Modificados

```
src/app/(app)/app/agendamentos/
└── page.tsx                   # Integração do ViewModeSelector + hook
```

## Componentes

### ViewModeSelector

**Responsabilidade:** Gerenciar seleção de modo e data, renderizar controles de navegação.

```tsx
interface ViewModeSelectorProps {
  viewMode: 'day' | 'week' | 'month'
  selectedDate: Date
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void
  onDateChange: (date: Date) => void
}

export function ViewModeSelector({
  viewMode,
  selectedDate,
  onViewModeChange,
  onDateChange
}: ViewModeSelectorProps) {
  // Render tabs, nav buttons, and period label
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Dia] [Semana] [Mês]                               │
│  ←  23 de Março, 2026  →                             │
└─────────────────────────────────────────────────────┘
```

### useAppointmentsFilter Hook

**Responsabilidade:** Calcular intervalo de datas e carregar agendamentos.

```tsx
interface UseAppointmentsFilterResult {
  appointments: AppointmentWithRelations[]
  loading: boolean
  error: string | null
  periodLabel: string
}

function useAppointmentsFilter(
  viewMode: 'day' | 'week' | 'month',
  selectedDate: Date
): UseAppointmentsFilterResult
```

**Lógica de Cálculo:**

| Modo  | StartDate              | EndDate                | Label Exemplo            |
|-------|------------------------|------------------------|--------------------------|
| Dia   | selectedDate           | selectedDate           | "23 de Março, 2026"      |
| Semana| Domingo da semana      | Sábado da semana       | "Semana de 22-28 Mar"    |
| Mês   | Dia 1 do mês           | Último dia do mês      | "Março 2026"             |

## Detalhes de Implementação

### Cálculo de Semana

A semana começa no **domingo** e termina no **sábado**.

```typescript
function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day

  const start = new Date(d.setDate(diff))
  start.setHours(0, 0, 0, 0)

  const end = new Date(d.setDate(diff + 6))
  end.setHours(23, 59, 59, 999)

  return { start, end }
}
```

### Cálculo de Mês

```typescript
function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}
```

### Navegação por Período

```typescript
function navigateDate(date: Date, viewMode: ViewMode, direction: 1 | -1): Date {
  const newDate = new Date(date)

  switch (viewMode) {
    case 'day':
      newDate.setDate(newDate.getDate() + direction)
      break
    case 'week':
      newDate.setDate(newDate.getDate() + (direction * 7))
      break
    case 'month':
      newDate.setMonth(newDate.getMonth() + direction)
      break
  }

  return newDate
}
```

## Estados da UI

### 1. Loading
```tsx
<div className="flex items-center justify-center py-12">
  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
</div>
```

### 2. Empty State (sem agendamentos)
```tsx
<GlassCard className="p-12 text-center">
  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
    <CalendarX size={32} className="text-purple-300" />
  </div>
  <p className="text-purple-200/60">Nenhum agendamento para este período</p>
</GlassCard>
```

### 3. Error State
```tsx
<GlassCard className="p-4 bg-red-500/20 border-red-500/50">
  <p className="text-red-200">⚠️ {error}</p>
</GlassCard>
```

## Estilo

### Tabs

- **Inativo:** `bg-white/5 border-white/10 text-white/60`
- **Hover:** `bg-white/10 border-white/20`
- **Ativo:** `bg-purple-500/20 border-purple-500/30 text-white`
- **Transição:** `transition-all duration-200`

### Navegação

- Botões com ícones `←` e `→`
- Label centralizado com tipografia consistente
- Hover effects nos botões de navegação

## API

A action `getAppointments()` já suporta os filtros necessários:

```typescript
export async function getAppointments(filters?: {
  startDate?: string  // ISO format: "2026-03-23"
  endDate?: string    // ISO format: "2026-03-23"
  status?: 'scheduled' | 'completed' | 'cancelled'
}): Promise<AppointmentsListResponse>
```

**Uso:**
```typescript
const { start, end } = getDateRange(viewMode, selectedDate)
const { data } = await getAppointments({
  startDate: start.toISOString().split('T')[0],
  endDate: end.toISOString().split('T')[0]
})
```

## Integração na Página

```tsx
export default function AgendamentosPage() {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { appointments, loading, error, periodLabel } =
    useAppointmentsFilter(viewMode, selectedDate)

  return (
    <div className="min-h-screen ...">
      <header>...</header>

      <main>
        <ViewModeSelector
          viewMode={viewMode}
          selectedDate={selectedDate}
          onViewModeChange={setViewMode}
          onDateChange={setSelectedDate}
        />

        {/* Lista de agendamentos filtrados */}
        {loading ? <Loading /> :
         error ? <Error /> :
         appointments.length === 0 ? <Empty /> :
         <AppointmentList appointments={appointments} />}
      </main>

      <BottomNavigation />
    </div>
  )
}
```

## Cronograma de Implementação

1. Criar hook `useAppointmentsFilter`
2. Criar componente `ViewModeSelector`
3. Modificar `agendamentos/page.tsx` para usar o novo sistema
4. Testar navegação e filtros
5. Testar estados de erro e empty

## Considerações Futuras

- [ ] Persistir última visualização no localStorage
- [ ] Adicionar shortcut de teclado (hoje = "h", navegação = setas)
- [ ] Indicadores visuais de dias com agendamentos no mini-calendário
- [ ] Drag & drop para reagendar na visualização de semana
