# Sistema de Preços Multi-Dimensional para Serviços

**Data:** 2026-03-25
**Status:** Design aprovado, aguardando implementação

## Resumo

Redesenhar o sistema de preços de serviços para suportar múltiplas dimensões: tipo de serviço, tipo de cobrança (avulso/pacote), tipo de pelo (PC/PL) e porte do pet. O sistema atual suporta apenas 3 portes com preços fixos; o novo sistema suportará 5 faixas de peso com preços variáveis por combinação de critérios.

## Problema Atual

- Tabela `services` tem apenas `price_small`, `price_medium`, `price_large`
- Não é possível diferenciar preços por tipo de pelo (curto/longo)
- Não é possível ter preços diferentes para avulso vs pacote do mesmo serviço
- Apenas 3 portes (small, medium, large) limita a granularidade de preços

## Solução Proposta

### Nova Estrutura de Dados

#### Tabela `service_prices` (substitui `services`)

```sql
CREATE TABLE service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  service_name TEXT NOT NULL,
  billing_type TEXT NOT NULL CHECK (billing_type IN ('avulso', 'pacote')),
  hair_type TEXT CHECK (hair_type IN ('PC', 'PL')),
  size_category TEXT NOT NULL CHECK (size_category IN ('tiny', 'small', 'medium', 'large', 'giant')),
  price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, service_name, billing_type, hair_type, size_category)
);
```

**Campos:**
- `service_name`: Nome do serviço (ex: "Banho/Tosa", "Subpelo", "Tesoura", "Máquina")
- `billing_type`: "avulso" (pagamento único) ou "pacote" (usa créditos)
- `hair_type`: "PC" (Pelo Curto), "PL" (Pelo Longo), ou NULL (serviços sem distinção)
- `size_category`: Porte do pet baseado em faixas de peso
- `price`: Preço para esta combinação específica

#### Atualização da tabela `pets`

Expandir CHECK constraint para 5 portes:

```sql
size TEXT NOT NULL CHECK (size IN ('tiny', 'small', 'medium', 'large', 'giant'))
```

**Mapeamento de faixas de peso:**

| Porte | Faixa de Peso |
|-------|---------------|
| tiny | 0-10kg |
| small | 10-20kg |
| medium | 20-30kg |
| large | 30-50kg |
| giant | 50-70kg |

#### Atualização da tabela `appointments`

Substituir `service_id` por `service_price_id`:

```sql
-- Remover: service_id UUID NOT NULL REFERENCES services(id)
-- Adicionar: service_price_id UUID NOT NULL REFERENCES service_prices(id)
```

## API

### Buscar preço

```typescript
interface GetPriceParams {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  petSize: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
  hairType?: 'PC' | 'PL'
}

async function getServicePrice(params: GetPriceParams): Promise<number>
```

### Listar serviços disponíveis

```typescript
async function getAvailableServices(billingType: 'avulso' | 'pacote'): Promise<ServicePrice[]>
```

### Atualizar preços em lote

```typescript
async function updateServicePrices(
  updates: Array<{
    serviceName: string
    billingType: 'avulso' | 'pacote'
    hairType: 'PC' | 'PL' | null
    sizeCategory: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
    price: number
  }>
): Promise<{ error?: string }>
```

## UI

### Fluxo de Agendamento

1. Selecionar Cliente → carrega pets
2. Selecionar Pet → exibe porte
3. **Novo:** Selecionar Tipo de Cobrança (Avulso/Pacote)
4. **Novo:** Selecionar Serviço → mostra preços filtrados por porte
5. **Novo:** Selecionar Hair Type (PC/PL) → se aplicável
6. Data e Horário
7. Confirmar → preço calculado automaticamente

### Admin UI - Gerenciamento de Preços

Nova página em `/app/app/precos/page.tsx`:

- Visualização em tabela matrix (serviço × porte)
- Filtro por tipo de cobrança (Todos/Avulso/Pacote)
- Modal de edição em lote
- Ativar/desativar preços

## Migração

### Passos

1. Criar tabela `service_prices`
2. Migrar dados de `services` para `service_prices` (assumindo avulso, sem hair_type)
3. Adicionar colunas temporárias em `appointments` para preservar dados
4. Atualizar `pets` para 5 portes (mapear small→tiny, medium→small)
5. Mapear `appointments.service_id` → `service_price_id`
6. Remover tabela `services` antiga

### Rollback

Script SQL para reverter mudanças se necessário.

## Arquivos a Criar/Modificar

### Novos

- `supabase/migrations/011_service_pricing_system.sql`
- `supabase/migrations/012_seed_service_prices.sql`
- `src/lib/types/service-prices.ts`
- `src/lib/validation/service-prices.ts`
- `src/lib/actions/service-prices.ts`
- `src/components/admin/price-table.tsx`
- `src/components/admin/edit-price-modal.tsx`
- `src/app/(app)/app/precos/page.tsx`
- `src/components/appointments/service-selector.tsx`
- `src/components/appointments/service-card.tsx`

### Modificar

- `src/app/(app)/app/agendamentos/novo/page.tsx`
- `src/lib/types/services.ts` (remover ou atualizar)
- `src/lib/actions/services.ts` (remover ou atualizar)
- `src/lib/actions/appointments.ts` (atualizar para usar service_price_id)

## Dependências

Nenhuma nova dependência externa necessária.

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Perda de dados durante migração | Backup antes de migrar; migração em fases |
| Appointments sem service_price_id correspondente | Manter colunas de backup; validação antes de remover |
| Pets com porte inválido após mudança | Migration atualiza todos os registros |
| Performance de consultas | Índices em company_id e active |

## Critérios de Sucesso

- [ ] Preços calculados corretamente para todas as combinações
- [ ] UI de agendamento funciona com novo fluxo
- [ ] Admin UI permite editar preços facilmente
- [ ] Migração de dados existente sem perdas
- [ ] Testes unitários e integração passando
- [ ] Documentação atualizada

## Próximos Passos

1. Escrever implementação plan detalhado
2. Implementar migrations
3. Implementar actions e types
4. Atualizar UI de agendamento
5. Criar Admin UI
6. Testes end-to-end
7. Deploy em staging
8. Migração de produção
