# Design: Edição Completa do Agendamento

**Data:** 2026-04-03
**Status:** Aprovado
**Tipo:** Melhoria de funcionalidade existente

## Resumo

Adicionar capacidade de editar todos os dados do agendamento na página de detalhes: data, hora, serviço, preço e observações. Atualmente apenas data, hora e observações são editáveis.

## Contexto

Página atual: `src/app/(app)/app/agendamentos/[id]/page.tsx`

**Campos editáveis hoje:**
- Data
- Hora
- Observações

**Campos a adicionar:**
- Serviço (com select com busca)
- Preço (auto-preenchido do serviço, mas com override manual)

## Arquitetura e Componentes

### Estrutura Principal

Reutilizar estados e padrões existentes:
- Estado `editing` já existe
- Estado `formData` será expandido
- Handlers `handleChange` e `handleSave` serão atualizados

### Componentes

#### 1. ServiceSelector (Novo)

**Localização:** `src/components/appointments/service-selector.tsx`

**Responsabilidades:**
- Select com busca filtrável
- Listar serviços disponíveis da empresa
- Mostrar informações do serviço: nome, tipo (avulso/pacote), tamanho, preço
- Filtrar por tipo de pelo do pet (PC/PL) se aplicável
- Callback quando serviço é selecionado

**Props:**
```typescript
interface ServiceSelectorProps {
  value: string;
  onChange: (serviceId: string, price: number) => void;
  petHairType?: 'PC' | 'PL' | null;
  petSize: SizeCategory;
  companyId: string;
  disabled?: boolean;
}
```

**UX:**
- Busca em tempo real por nome do serviço
- Badge mostrando tipo de cobrança (💳 Avulso / 📦 Pacote)
- Badge com tamanho (PP, P, M, G, GG)
- Indicador de tipo de quando aplicável

#### 2. Campos de Preço

**Em modo edição:**
- Input numérico com formatação de moeda (R$)
- Placeholder "0,00"
- Min: 0
- Step: 0.01

**Em modo visual:**
- Exibição atual já existe (mantém)

#### 3. Integração com Estados Existentes

**Estado expandido:**
```typescript
const [formData, setFormData] = useState({
  date: "",
  time: "",
  servicePriceId: "",      // NOVO
  price: "",                // NOVO
  notes: "",
});
```

**Inicialização:**
```typescript
setFormData({
  date: result.data.date,
  time: result.data.time,
  servicePriceId: result.data.service_price?.id || "",
  price: result.data.price?.toString() || "",
  notes: result.data.notes || "",
});
```

## Fluxo de Dados

### Seleção de Serviço

1. Usuário abre select de serviços
2. Digita para buscar ou seleciona da lista
3. Ao selecionar um serviço:
   - `handleChange("servicePriceId", newServiceId)` é chamado
   - Handler busca o preço do serviço selecionado
   - Atualiza `formData.servicePriceId`
   - Atualiza `formData.price` com o preço do serviço
4. Campo de preço é preenchido mas pode ser editado manualmente

### Salvamento

1. Usuário clica "Salvar"
2. `handleSave` valida campos
3. Chama `updateAppointment(appointmentId, formData)`
4. Server action atualiza no banco
5. `loadAppointment()` recarrega dados
6. Modo de edição fecha (`setEditing(false)`)

### Cancelamento

Comportamento atual já funciona:
- Botão "Cancelar" restaura valores originais
- Fecha modo de edição
- Limpa erros

## Validações

### Frontend

- **Data:** deve ser hoje ou no futuro (`min={getMinDate()}`)
- **Hora:** formato válido HH:MM
- **Serviço:** deve ser selecionado
- **Preço:** número positivo >= 0
- **Observações:** opcional

### Backend (Server Action)

Atualizar `updateAppointment` em `src/lib/actions/appointments.ts`:

```typescript
export async function updateAppointment(
  id: string,
  input: Partial<AppointmentInput>
): Promise<AppointmentResponse> {
  // ... validações existentes ...

  const updateData: {
    date?: string
    time?: string
    notes?: string | null
    price?: number
    service_price_id?: string  // NOVO
  } = {
    date: input.date ? new Date(input.date).toISOString().split('T')[0] : undefined,
    time: input.time,
    notes: input.notes,
    service_price_id: input.servicePriceIds?.[0],  // NOVO - usa primeiro do array
    price: input.price ? Number(input.price) : undefined,  // NOVO
  }

  // ... resto da lógica ...
}
```

## Regras de Negócio

### 1. Serviços com Tipo de Pelo

- Se serviço tiver `hair_type` (PC ou PL)
- Verificar compatibilidade com o pet
- Mostrar aviso se incompatível mas permitir edição
- Usuário pode ter conhecimento que o sistema não tem

### 2. Preço Manual

- Permitir override manual após seleção do serviço
- Casos de uso: descontos, acréscimos, promoções
- Sem validação de valor máximo

### 3. Status do Agendamento

- Manter comportamento atual
- Só permite editar se `status === "scheduled"`
- Botões de edição somem para concluídos/cancelados

### 4. Créditos e Pacotes

- Atualmente não suportado na edição
- TODO: No futuro, considerar lógica de ajuste de créditos

## Layout e UX

### Modo Visual (Atual)

```
┌─────────────────────────────────────┐
│  📅 12/04/2026                      │
│  14:30                              │
│  [Agendado]                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🐕 [Nome do Pet]  [PP]             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ✂️ [Nome do Serviço]               │
│     💳 Avulso                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💰 R$ 50,00                        │
└─────────────────────────────────────┘
```

### Modo Edição (Proposto)

```
┌─────────────────────────────────────┐
│  [12/04/2026 ▼]  Data              │
│  [14:30     ]  Hora                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🐕 [Nome do Pet]  [PP]             │
│     (não editável)                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ✂️ [Buscar serviço...]      ▼     │
│     Tosa Higienização - 💳 - PP     │
│     Tosa Completa - 📦 - M          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💰 R$ [  50,00  ]                 │
└─────────────────────────────────────┘
```

## Implementação

### Arquivos a Modificar

1. `src/app/(app)/app/agendamentos/[id]/page.tsx`
   - Expandir `formData`
   - Adicionar seleção de serviço
   - Adicionar campo de preço editável
   - Atualizar `handleSave`

2. `src/lib/actions/appointments.ts`
   - Atualizar `updateAppointment` para aceitar `servicePriceId` e `price`
   - Adicionar validações

### Arquivos a Criar

1. `src/components/appointments/service-selector.tsx`
   - Componente de seleção com busca

## Testes

### Casos de Teste

1. **Edição bem-sucedida**
   - Alterar serviço → preço atualiza automaticamente
   - Alterar preço manualmente após selecionar serviço
   - Salvar e verificar que dados foram atualizados

2. **Validações**
   - Data no passado → bloqueado
   - Preço negativo → erro
   - Sem serviço selecionado → erro

3. **Cancelamento**
   - Fazer alterações e cancelar
   - Valores originais são restaurados

4. **Estados de agendamento**
   - Editar agendamento scheduled → funciona
   - Tentar editar concluído/cancelado → botões não aparecem

## Riscos e Considerações

### Risco: Atualização de Serviços Múltiplos

Atualmente o sistema suporta múltiplos serviços via `appointment_services`, mas:
- A tela de detalhes mostra apenas `service_price` (legado)
- A edição será de único serviço para manter simplicidade

**Decisão:** Implementar edição de serviço único. Múltiplos serviços pode ser uma evolução futura.

### Risco: Créditos e Pacotes

Alterar serviço pode impactar:
- Créditos de plano do cliente
- Créditos de pacote do pet

**Decisão:** Não suportar ajuste de créditos na edição. Se o usuário mudar para um serviço mais caro/barato, o preço é ajustado mas os créditos não são reembolsados/cobrados. É responsabilidade do usuário.

## Cronograma de Implementação

1. Criar componente `ServiceSelector`
2. Atualizar `updateAppointment` server action
3. Integrar na página de detalhes
4. Testes manuais
5. Commit e merge

## Definição de Pronto

- [ ] Componente `ServiceSelector` criado
- [ ] Server action `updateAppointment` atualizada
- [ ] Página de detalhes integrada
- [ ] Validações funcionando
- [ ] Testes manuais passando
- [ ] Sem erros de TypeScript
- [ ] Sem console.logs no código
