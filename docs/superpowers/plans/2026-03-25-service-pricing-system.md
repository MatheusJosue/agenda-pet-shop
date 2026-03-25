# Sistema de Preços Multi-Dimensional - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar o sistema de preços de serviços para suportar múltiplas dimensões: tipo de serviço, tipo de cobrança (avulso/pacote), tipo de pelo (PC/PL) e 5 portes de pets.

**Architecture:** Nova tabela `service_prices` substitui `services`, com preços determinados por combinação de service_name + billing_type + hair_type + size_category. Tabela `pets` expandida para 5 portes (tiny/small/medium/large/giant). Tabela `appointments` referencia `service_price_id` em vez de `service_id`.

**Tech Stack:** Next.js 15, TypeScript, Supabase (PostgreSQL), Zod, Tailwind CSS

---

## File Structure

```
supabase/migrations/
  011_service_pricing_system.sql       # Nova tabela service_prices
  012_seed_service_prices.sql          # Dados iniciais de preços

src/lib/
  types/
    service-prices.ts                  # Types para service_prices
  validation/
    service-prices.ts                  # Zod schemas
  actions/
    service-prices.ts                  # Server actions para preços
    appointments.ts                    # Atualizado para usar service_price_id

src/components/
  admin/
    price-table.tsx                    # Tabela matrix de preços
    edit-price-modal.tsx               # Modal de edição em lote
  appointments/
    service-selector.tsx               # Novo seletor de serviços
    service-card.tsx                   # Card de serviço com preço

src/app/(app)/app/
  precos/page.tsx                      # Página admin de preços
  agendamentos/novo/page.tsx           # Atualizado com novo fluxo
```

---

## Task 1: Migration - Nova tabela service_prices

**Files:**
- Create: `supabase/migrations/011_service_pricing_system.sql`

- [ ] **Step 1: Create migration file**

```bash
# Create new migration file
touch supabase/migrations/011_service_pricing_system.sql
```

- [ ] **Step 2: Write migration SQL**

```sql
-- migration: 011_service_pricing_system.sql

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create service_prices table
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

-- Create indexes
CREATE INDEX idx_service_prices_company ON service_prices(company_id);
CREATE INDEX idx_service_prices_active ON service_prices(active);
CREATE INDEX idx_service_prices_service_name ON service_prices(service_name);

-- Add comment
COMMENT ON TABLE service_prices IS 'Preços de serviços por múltiplas dimensões: tipo de cobrança, tipo de pelo e porte';
COMMENT ON COLUMN service_prices.billing_type IS 'avulso = pagamento único, pacote = usa créditos';
COMMENT ON COLUMN service_prices.hair_type IS 'PC = Pelo Curto, PL = Pelo Longo, NULL = sem distinção';
COMMENT ON COLUMN service_prices.size_category IS 'tiny=0-10kg, small=10-20kg, medium=20-30kg, large=30-50kg, giant=50-70kg';
```

- [ ] **Step 3: Run migration locally**

```bash
# Apply migration to local Supabase
npx supabase db push
```

Expected: Migration applied successfully, table created.

- [ ] **Step 4: Verify table exists**

```bash
# Connect to Supabase and verify
npx supabase db reset --debug
```

Expected: Table `service_prices` exists with correct schema.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/011_service_pricing_system.sql
git commit -m "feat(migration): add service_prices table

Add new table for multi-dimensional service pricing system.
Supports billing_type (avulso/pacote), hair_type (PC/PL),
and 5 size categories (tiny/small/medium/large/giant).
"
```

---

## Task 2: Migration - Expandir pets para 5 portes

**Files:**
- Modify: `supabase/migrations/011_service_pricing_system.sql` (add to same file)

- [ ] **Step 1: Add pets size expansion to migration**

Add to end of `supabase/migrations/011_service_pricing_system.sql`:

```sql
-- Expand pets table to support 5 size categories
-- First, add new size values to existing data
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_size_check;

-- Update existing pets to map to new size categories
-- Old small (which meant general small) -> tiny
-- Old medium -> small
-- Old large stays as large for now (should be reviewed case by case)
UPDATE pets SET size = 'tiny' WHERE size = 'small';
UPDATE pets SET size = 'small' WHERE size = 'medium';

-- Now add the new constraint
ALTER TABLE pets ADD CONSTRAINT pets_size_check
  CHECK (size IN ('tiny', 'small', 'medium', 'large', 'giant'));

-- Add comment
COMMENT ON COLUMN pets.size IS 'tiny=0-10kg, small=10-20kg, medium=20-30kg, large=30-50kg, giant=50-70kg';
```

- [ ] **Step 2: Run migration**

```bash
npx supabase db push
```

Expected: Pets table updated, existing data migrated.

- [ ] **Step 3: Verify pets data**

```sql
-- Check that all pets have valid sizes
SELECT size, COUNT(*) FROM pets GROUP BY size;
```

Expected: All pets have sizes in (tiny, small, medium, large, giant).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/011_service_pricing_system.sql
git commit -m "feat(migration): expand pets to 5 size categories

Map old sizes: small->tiny, medium->small.
Add new constraint supporting tiny/small/medium/large/giant.
"
```

---

## Task 3: Migration - Atualizar appointments para service_price_id

**Files:**
- Modify: `supabase/migrations/011_service_pricing_system.sql` (add to same file)

- [ ] **Step 1: Add appointments changes to migration**

Add to end of `supabase/migrations/011_service_pricing_system.sql`:

```sql
-- Add new column to appointments for referencing service_prices
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_price_id UUID REFERENCES service_prices(id);

-- Add backup columns for data migration
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_name_backup TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS billing_type_backup TEXT;

-- Backup service information from existing appointments
UPDATE appointments a
SET
  service_name_backup = s.name,
  billing_type_backup = 'avulso'
FROM services s
WHERE a.service_id IS NOT NULL AND a.service_id = s.id;

-- Note: Actual migration of service_id -> service_price_id will happen
-- after services data is migrated to service_prices table
-- For now, keep both columns to avoid breaking existing functionality

-- Add comment
COMMENT ON COLUMN appointments.service_price_id IS 'References service_prices instead of services (deprecated)';
```

- [ ] **Step 2: Run migration**

```bash
npx supabase db push
```

Expected: Appointments table updated with new columns.

- [ ] **Step 3: Verify**

```sql
-- Check new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
AND column_name IN ('service_price_id', 'service_name_backup', 'billing_type_backup');
```

Expected: All 3 columns exist.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/011_service_pricing_system.sql
git commit -m "feat(migration): add service_price_id to appointments

Add new column referencing service_prices.
Add backup columns for data migration safety.
"
```

---

## Task 4: Types - ServicePrices

**Files:**
- Create: `src/lib/types/service-prices.ts`

- [ ] **Step 1: Create types file**

```bash
mkdir -p src/lib/types
touch src/lib/types/service-prices.ts
```

- [ ] **Step 2: Write TypeScript types**

```typescript
// src/lib/types/service-prices.ts

export type SizeCategory = 'tiny' | 'small' | 'medium' | 'large' | 'giant'

export type BillingType = 'avulso' | 'pacote'

export type HairType = 'PC' | 'PL'

export interface ServicePrice {
  id: string
  company_id: string
  service_name: string
  billing_type: BillingType
  hair_type: HairType | null
  size_category: SizeCategory
  price: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface ServicePriceInput {
  serviceName: string
  billingType: BillingType
  hairType?: HairType
  sizeCategory: SizeCategory
  price: number
}

export interface GetPriceParams {
  serviceName: string
  billingType: BillingType
  petSize: SizeCategory
  hairType?: HairType
}

export type ServicePricesResponse = {
  data: ServicePrice[]
  error?: string
}

export type ServicePriceResponse = {
  data?: ServicePrice
  error?: string
}

export type PriceResponse = {
  data?: number
  error?: string
}

// Size labels for UI
export const SIZE_LABELS: Record<SizeCategory, string> = {
  tiny: '0-10kg',
  small: '10-20kg',
  medium: '20-30kg',
  large: '30-50kg',
  giant: '50-70kg'
} as const

// Size emojis for UI
export const SIZE_EMOJIS: Record<SizeCategory, string> = {
  tiny: '🐭',
  small: '🐱',
  medium: '🐕',
  large: '🦮',
  giant: '🐕‍🦺'
} as const

// Hair type labels
export const HAIR_TYPE_LABELS: Record<HairType, string> = {
  PC: 'Pelo Curto',
  PL: 'Pelo Longo'
} as const
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types/service-prices.ts
git commit -m "feat(types): add ServicePrices types

Add types for new service pricing system including
SizeCategory, BillingType, HairType, and UI labels.
"
```

---

## Task 5: Validation - Zod schemas

**Files:**
- Create: `src/lib/validation/service-prices.ts`

- [ ] **Step 1: Create validation file**

```bash
mkdir -p src/lib/validation
touch src/lib/validation/service-prices.ts
```

- [ ] **Step 2: Write Zod schemas**

```typescript
// src/lib/validation/service-prices.ts

import { z } from 'zod'

export const sizeCategorySchema = z.enum(['tiny', 'small', 'medium', 'large', 'giant'], {
  errorMap: () => ({ message: 'Porte deve ser tiny, small, medium, large ou giant' })
})

export const billingTypeSchema = z.enum(['avulso', 'pacote'], {
  errorMap: () => ({ message: 'Tipo de cobrança deve ser avulso ou pacote' })
})

export const hairTypeSchema = z.enum(['PC', 'PL'], {
  errorMap: () => ({ message: 'Tipo de pelo deve ser PC ou PL' })
})

export const servicePriceSchema = z.object({
  serviceName: z.string().min(1, 'Nome do serviço é obrigatório'),
  billingType: billingTypeSchema,
  hairType: hairTypeSchema.nullable().optional(),
  sizeCategory: sizeCategorySchema,
  price: z.number().positive('Preço deve ser positivo')
})

export type ServicePriceInput = z.infer<typeof servicePriceSchema>

export const bulkUpdateSchema = z.object({
  updates: z.array(servicePriceSchema).min(1, 'Pelo menos um preço é obrigatório')
})

export const getPriceParamsSchema = z.object({
  serviceName: z.string().min(1),
  billingType: billingTypeSchema,
  petSize: sizeCategorySchema,
  hairType: hairTypeSchema.optional()
})

export type GetPriceParams = z.infer<typeof getPriceParamsSchema>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/validation/service-prices.ts
git commit -m "feat(validation): add service-prices Zod schemas

Add validation for service pricing inputs including
sizeCategory, billingType, hairType, and price.
"
```

---

## Task 6: Server Actions - service-prices (get functions)

**Files:**
- Create: `src/lib/actions/service-prices.ts`

- [ ] **Step 1: Create actions file**

```bash
mkdir -p src/lib/actions
touch src/lib/actions/service-prices.ts
```

- [ ] **Step 2: Write get functions**

```typescript
// src/lib/actions/service-prices.ts (part 1)
'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { getPriceParamsSchema } from '@/lib/validation/service-prices'
import type {
  ServicePrice,
  GetPriceParams,
  ServicePricesResponse,
  PriceResponse
} from '@/lib/types/service-prices'

// Helper: Get company_id from authenticated user session
async function getCurrentCompanyId(): Promise<string | null> {
  const supabase = await createSupabaseClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('getCurrentCompanyId - auth error:', error)
    return null
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  return userData?.company_id || null
}

/**
 * Get price for specific service combination
 */
export async function getServicePrice(params: GetPriceParams): Promise<PriceResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  // Validate input
  const validatedFields = getPriceParamsSchema.safeParse(params)

  if (!validatedFields.success) {
    return { error: 'Parâmetros inválidos' }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('service_prices')
    .select('price')
    .eq('company_id', companyId)
    .eq('service_name', validatedFields.data.serviceName)
    .eq('billing_type', validatedFields.data.billingType)
    .eq('size_category', validatedFields.data.petSize)
    .eq('active', true)

  // Filter by hair_type if provided
  if (validatedFields.data.hairType) {
    query = query.eq('hair_type', validatedFields.data.hairType)
  } else {
    query = query.is('hair_type', null)
  }

  const { data, error } = await query.single()

  if (error || !data) {
    return { error: 'Preço não encontrado para esta combinação' }
  }

  return { data: data.price }
}

/**
 * Get all service prices for a billing type
 */
export async function getServicePrices(billingType: 'avulso' | 'pacote' | 'all' = 'all'): Promise<ServicePricesResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('service_prices')
    .select('*')
    .eq('company_id', companyId)
    .eq('active', true)

  if (billingType !== 'all') {
    query = query.eq('billing_type', billingType)
  }

  const { data, error } = await query.order('service_name', { ascending: true })

  if (error) {
    return { data: [], error: 'Erro ao buscar preços' }
  }

  return { data: data || [] }
}

/**
 * Get unique service names
 */
export async function getServiceNames(): Promise<{ data: string[], error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('service_prices')
    .select('service_name')
    .eq('company_id', companyId)
    .eq('active', true)

  if (error) {
    return { data: [], error: 'Erro ao buscar serviços' }
  }

  // Get unique service names
  const uniqueNames = [...new Set(data?.map(d => d.service_name) || [])]

  return { data: uniqueNames }
}

/**
 * Get hair types for a specific service
 */
export async function getHairTypesForService(serviceName: string): Promise<{ data: (string | null)[], error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('service_prices')
    .select('hair_type')
    .eq('company_id', companyId)
    .eq('service_name', serviceName)
    .eq('active', true)

  if (error) {
    return { data: [], error: 'Erro ao buscar tipos de pelo' }
  }

  // Get unique hair types
  const uniqueHairTypes = [...new Set(data?.map(d => d.hair_type) || [])]

  return { data: uniqueHairTypes }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/service-prices.ts
git commit -m "feat(actions): add service-prices get functions

Add getServicePrice, getServicePrices, getServiceNames,
and getHairTypesForService server actions.
"
```

---

## Task 7: Server Actions - service-prices (update/delete)

**Files:**
- Modify: `src/lib/actions/service-prices.ts`

- [ ] **Step 1: Add update/delete functions**

Add to `src/lib/actions/service-prices.ts`:

```typescript
/**
 * Create or update service price
 */
export async function upsertServicePrice(input: {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  hairType?: 'PC' | 'PL'
  sizeCategory: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
  price: number
}): Promise<PriceResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('service_prices')
    .upsert({
      company_id: companyId,
      service_name: input.serviceName,
      billing_type: input.billingType,
      hair_type: input.hairType || null,
      size_category: input.sizeCategory,
      price: input.price,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'company_id,service_name,billing_type,hair_type,size_category'
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao salvar preço' }
  }

  return { data: data.price }
}

/**
 * Bulk update service prices
 */
export async function updateServicePrices(updates: Array<{
  serviceName: string
  billingType: 'avulso' | 'pacote'
  hairType?: 'PC' | 'PL'
  sizeCategory: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
  price: number
}>): Promise<{ error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  for (const update of updates) {
    const { error } = await supabase
      .from('service_prices')
      .upsert({
        company_id: companyId,
        service_name: update.serviceName,
        billing_type: update.billingType,
        hair_type: update.hairType || null,
        size_category: update.sizeCategory,
        price: update.price,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id,service_name,billing_type,hair_type,size_category'
      })

    if (error) {
      return { error: 'Erro ao atualizar preços' }
    }
  }

  return {}
}

/**
 * Deactivate service price (soft delete)
 */
export async function deactivateServicePrice(
  serviceName: string,
  billingType: 'avulso' | 'pacote',
  hairType: 'PC' | 'PL' | null,
  sizeCategory: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
): Promise<{ error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  let query = supabase
    .from('service_prices')
    .update({ active: false })
    .eq('company_id', companyId)
    .eq('service_name', serviceName)
    .eq('billing_type', billingType)
    .eq('size_category', sizeCategory)

  if (hairType) {
    query = query.eq('hair_type', hairType)
  } else {
    query = query.is('hair_type', null)
  }

  const { error } = await query

  if (error) {
    return { error: 'Erro ao desativar preço' }
  }

  return {}
}

/**
 * Deactivate all prices for a service
 */
export async function deactivateService(serviceName: string): Promise<{ error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('service_prices')
    .update({ active: false })
    .eq('company_id', companyId)
    .eq('service_name', serviceName)

  if (error) {
    return { error: 'Erro ao desativar serviço' }
  }

  return {}
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/service-prices.ts
git commit -m "feat(actions): add service-prices update/delete functions

Add upsertServicePrice, updateServicePrices,
deactivateServicePrice, and deactivateService.
"
```

---

## Task 8: Component - ServiceCard

**Files:**
- Create: `src/components/appointments/service-card.tsx`

- [ ] **Step 1: Create component file**

```bash
mkdir -p src/components/appointments
touch src/components/appointments/service-card.tsx
```

- [ ] **Step 2: Write component**

```typescript
// src/components/appointments/service-card.tsx
'use client'

import { useState } from 'react'
import { SIZE_LABELS, HAIR_TYPE_LABELS } from '@/lib/types/service-prices'

interface ServiceCardProps {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  price: number
  hasHairType: boolean
  sizeCategory: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
  selected?: boolean
  onSelect?: (hairType: 'PC' | 'PL' | null) => void
}

export function ServiceCard({
  serviceName,
  billingType,
  price,
  hasHairType,
  sizeCategory,
  selected = false,
  onSelect
}: ServiceCardProps) {
  const [hairType, setHairType] = useState<'PC' | 'PL'>('PC')

  const handleSelect = () => {
    if (onSelect) {
      onSelect(hasHairType ? hairType : null)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      disabled={!onSelect}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200 text-left
        ${selected
          ? 'bg-purple-500/30 border-purple-400 text-white'
          : 'bg-white/5 border-white/10 text-purple-100/70 hover:bg-white/10 hover:border-white/20'
        }
        ${!onSelect ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-sm">{serviceName}</h3>
          <p className="text-xs opacity-70">{billingType === 'avulso' ? 'Avulso' : 'Pacote'}</p>
        </div>
        <span className="text-lg font-bold text-purple-400">
          R$ {price.toFixed(2)}
        </span>
      </div>

      <div className="text-xs opacity-70 mb-2">
        {SIZE_LABELS[sizeCategory]}
      </div>

      {hasHairType && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setHairType('PC')
            }}
            className={`
              px-3 py-1 rounded-lg text-xs transition-all
              ${hairType === 'PC'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 hover:bg-white/20'
              }
            `}
          >
            {HAIR_TYPE_LABELS.PC}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setHairType('PL')
            }}
            className={`
              px-3 py-1 rounded-lg text-xs transition-all
              ${hairType === 'PL'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 hover:bg-white/20'
              }
            `}
          >
            {HAIR_TYPE_LABELS.PL}
          </button>
        </div>
      )}

      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-xs">
          ✓
        </div>
      )}
    </button>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/appointments/service-card.tsx
git commit -m "feat(component): add ServiceCard component

Display service with price, size category, and optional
hair type selector (PC/PL). Shows selected state.
"
```

---

## Task 9: Component - ServiceSelector

**Files:**
- Create: `src/components/appointments/service-selector.tsx`

- [ ] **Step 1: Create component file**

```bash
touch src/components/appointments/service-selector.tsx
```

- [ ] **Step 2: Write component**

```typescript
// src/components/appointments/service-selector.tsx
'use client'

import { useEffect, useState } from 'react'
import { ServiceCard } from './service-card'
import { getServicePrices } from '@/lib/actions/service-prices'
import type { ServicePrice, SizeCategory } from '@/lib/types/service-prices'

interface ServiceSelectorProps {
  petSize: SizeCategory
  billingType: 'avulso' | 'pacote'
  selectedServicePriceId?: string
  onServiceSelect: (servicePriceId: string, price: number, hairType: 'PC' | 'PL' | null) => void
}

interface GroupedService {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  hasHairType: boolean
  pricesBySize: Record<SizeCategory, ServicePrice | null>
}

export function ServiceSelector({
  petSize,
  billingType,
  selectedServicePriceId,
  onServiceSelect
}: ServiceSelectorProps) {
  const [services, setServices] = useState<ServicePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [billingType])

  const loadServices = async () => {
    setLoading(true)
    setError(null)

    const result = await getServicePrices(billingType)

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setServices(result.data)
    }

    setLoading(false)
  }

  // Group services by name and billing type
  const groupedServices: Record<string, GroupedService> = services.reduce((acc, price) => {
    const key = `${price.service_name}-${price.billing_type}`

    if (!acc[key]) {
      // Check if this service has hair types
      const hasHairType = services.some(
        s => s.service_name === price.service_name &&
             s.billing_type === price.billing_type &&
             s.hair_type !== null
      )

      acc[key] = {
        serviceName: price.service_name,
        billingType: price.billing_type,
        hasHairType,
        pricesBySize: {
          tiny: null,
          small: null,
          medium: null,
          large: null,
          giant: null
        }
      }
    }

    // Store price by size category
    const hairTypeKey = price.hair_type || 'default'
    acc[key].pricesBySize[price.size_category] = price

    return acc
  }, {} as Record<string, GroupedService>)

  if (loading) {
    return (
      <div className="text-center py-8 text-purple-200/70">
        Carregando serviços...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        {error}
      </div>
    )
  }

  if (Object.keys(groupedServices).length === 0) {
    return (
      <div className="text-center py-8 text-purple-200/70">
        Nenhum serviço encontrado para {billingType === 'avulso' ? 'avulso' : 'pacote'}.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <label className="block text-purple-100/90 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
          ✨
        </span>
        Serviços ({billingType === 'avulso' ? 'Avulso' : 'Pacote'}) *
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.values(groupedServices).map((group) => {
          const priceForPetSize = group.pricesBySize[petSize]

          if (!priceForPetSize) {
            return null
          }

          const isSelected = selectedServicePriceId === priceForPetSize.id

          return (
            <ServiceCard
              key={`${group.serviceName}-${group.billingType}`}
              serviceName={group.serviceName}
              billingType={group.billingType}
              price={priceForPetSize.price}
              hasHairType={group.hasHairType}
              sizeCategory={petSize}
              selected={isSelected}
              onSelect={(hairType) => {
                // Find the exact price record
                const exactPrice = services.find(s =>
                  s.service_name === group.serviceName &&
                  s.billing_type === group.billingType &&
                  s.size_category === petSize &&
                  (s.hair_type || null) === hairType
                )

                if (exactPrice) {
                  onServiceSelect(exactPrice.id, exactPrice.price, hairType)
                }
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/appointments/service-selector.tsx
git commit -m "feat(component): add ServiceSelector component

Load and display services filtered by billing type and pet size.
Group services and show appropriate price for each pet.
"
```

---

## Task 10: Update novo agendamento page

**Files:**
- Modify: `src/app/(app)/app/agendamentos/novo/page.tsx`

- [ ] **Step 1: Update imports**

Replace existing imports with:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAppointment } from "@/lib/actions/appointments";
import { getClients } from "@/lib/actions/clients";
import { getPets } from "@/lib/actions/pets";
import { getServicePrices } from "@/lib/actions/service-prices"; // Changed
import { AppLayout } from "@/components/layout/app-layout";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ServiceSelector } from "@/components/appointments/service-selector"; // New
import { ArrowLeft } from "lucide-react";
import type { Client } from "@/lib/types/clients";
import type { SizeCategory } from "@/lib/types/service-prices"; // Changed
```

- [ ] **Step 2: Update PetWithClient interface**

Replace PetWithClient interface with:

```typescript
interface PetWithClient {
  id: string;
  name: string;
  size: SizeCategory; // Changed
}
```

- [ ] **Step 3: Update SelectedService interface**

Replace SelectedService interface with:

```typescript
interface SelectedService {
  servicePriceId: string; // Changed
  price: number;
  hairType: 'PC' | 'PL' | null; // Added
}
```

- [ ] **Step 4: Update labels**

Replace sizeLabels and sizeEmojis with:

```typescript
import { SIZE_LABELS, SIZE_EMOJIS } from "@/lib/types/service-prices";
```

Remove the old sizeLabels and sizeEmojis definitions.

- [ ] **Step 5: Update formData state**

Add billingType to formData:

```typescript
const [formData, setFormData] = useState({
  clientId: "",
  petId: "",
  billingType: "avulso" as "avulso" | "pacote", // Added
  servicePriceId: "", // Changed from serviceId
  date: "",
  time: "",
  price: "",
  notes: "",
});
```

- [ ] **Step 6: Update selectedServices state**

```typescript
const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
```

- [ ] **Step 7: Remove calculateTotalPrice effect**

Replace the calculateTotalPrice effect with simpler logic in the service select handler.

Remove this useEffect:
```typescript
// Remove this entire useEffect
useEffect(() => {
  if (formData.petId && selectedServices.length > 0) {
    calculateTotalPrice();
  } else {
    setFormData((prev) => ({ ...prev, price: "" }));
  }
}, [formData.petId, selectedServices]);
```

- [ ] **Step 8: Remove toggleService function**

Remove the toggleService function - ServiceSelector handles this now.

- [ ] **Step 9: Update handleSubmit**

Update to use servicePriceId:

```typescript
const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  if (
    !formData.clientId ||
    !formData.petId ||
    !formData.servicePriceId // Changed
  ) {
    setError("Preencha todos os campos obrigatórios");
    setLoading(false);
    return;
  }

  try {
    const selectedService = selectedServices[0]; // Use first selected
    const totalPrice = parseFloat(formData.price);

    const result = await createAppointment({
      clientId: formData.clientId,
      petId: formData.petId,
      servicePriceId: formData.servicePriceId, // Changed
      date: formData.date,
      time: formData.time,
      price: totalPrice,
      notes: formData.notes || undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/app/agendamentos");
    }
  } catch (err) {
    setError("Erro ao criar agendamento");
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 10: Update the services section in JSX**

Replace the services multi-select section with:

```tsx
{/* Billing Type Select */}
<div
  className="animate-in fade-in slide-in-from-left-2 duration-300"
  style={{ animationDelay: "250ms" }}
>
  <Select
    id="billingType"
    label={
      <span className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
          💳
        </span>
        Tipo de Cobrança
      </span>
    }
    value={formData.billingType}
    onChange={(value) => handleChange("billingType", value)}
    options={[
      { value: "avulso", label: "Avulso" },
      { value: "pacote", label: "Pacote" }
    ]}
    required
  />
</div>

{/* Services - New Selector */}
{formData.petId && (
  <div
    className="animate-in fade-in slide-in-from-left-2 duration-300"
    style={{ animationDelay: "275ms" }}
  >
    <ServiceSelector
      petSize={filteredPets.find(p => p.id === formData.petId)?.size || 'medium'}
      billingType={formData.billingType}
      selectedServicePriceId={formData.servicePriceId}
      onServiceSelect={(servicePriceId, price, hairType) => {
        setFormData(prev => ({
          ...prev,
          servicePriceId,
          price: price.toFixed(2)
        }))
        setSelectedServices([{ servicePriceId, price, hairType }])
      }}
    />
  </div>
)}
```

- [ ] **Step 11: Remove old services grid section**

Remove the old grid-based services selector.

- [ ] **Step 12: Verify page compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 13: Commit**

```bash
git add src/app/(app)/app/agendamentos/novo/page.tsx
git commit -m "feat(app): update appointment creation with new pricing

Add billing type selector (avulso/pacote).
Replace old services grid with ServiceSelector component.
Update to use servicePriceId instead of serviceId.
"
```

---

## Task 11: Component - PriceTable (Admin)

**Files:**
- Create: `src/components/admin/price-table.tsx`

- [ ] **Step 1: Create component file**

```bash
mkdir -p src/components/admin
touch src/components/admin/price-table.tsx
```

- [ ] **Step 2: Write component**

```typescript
// src/components/admin/price-table.tsx
'use client'

import { SIZE_LABELS, HAIR_TYPE_LABELS } from '@/lib/types/service-prices'
import type { ServicePrice } from '@/lib/types/service-prices'
import { Button } from '@/components/ui/button'

interface PriceTableProps {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  prices: ServicePrice[]
  onEdit: () => void
}

const SIZES: Array<'tiny' | 'small' | 'medium' | 'large' | 'giant'> =
  ['tiny', 'small', 'medium', 'large', 'giant']

export function PriceTable({ serviceName, billingType, prices, onEdit }: PriceTableProps) {
  // Determine if service has hair types
  const hasHairType = prices.some(p => p.hair_type !== null)

  // Create a map for quick lookup
  const priceMap = prices.reduce((acc, price) => {
    const key = `${price.hair_type || 'default'}-${price.size_category}`
    acc[key] = price.price
    return acc
  }, {} as Record<string, number>)

  // Get unique hair types
  const hairTypes = hasHairType
    ? (['PC', 'PL'] as const)
    : [null] as const

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{serviceName}</h3>
          <p className="text-sm text-purple-300/70">
            {billingType === 'avulso' ? 'Avulso' : 'Pacote'}
          </p>
        </div>
        <Button
          onClick={onEdit}
          variant="secondary"
          size="sm"
        >
          Editar Preços
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2 text-purple-200/70 font-medium">
                Tipo de Pelo
              </th>
              {SIZES.map(size => (
                <th key={size} className="p-2 text-center text-purple-200/70 font-medium">
                  {SIZE_LABELS[size]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hairTypes.map(hairType => (
              <tr key={hairType || 'default'} className="border-b border-white/5">
                <td className="p-2 font-medium">
                  {hairType ? HAIR_TYPE_LABELS[hairType] : 'Padrão'}
                </td>
                {SIZES.map(size => {
                  const key = `${hairType || 'default'}-${size}`
                  const price = priceMap[key]

                  return (
                    <td key={size} className="p-2 text-center">
                      {price !== undefined ? (
                        <span className="text-purple-300">
                          R$ {price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-purple-200/30">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/price-table.tsx
git commit -m "feat(component): add PriceTable admin component

Display service prices in a matrix table format.
Shows all size categories and optional hair types.
"
```

---

## Task 12: Component - EditPriceModal (Admin)

**Files:**
- Create: `src/components/admin/edit-price-modal.tsx`

- [ ] **Step 1: Create component file**

```bash
touch src/components/admin/edit-price-modal.tsx
```

- [ ] **Step 2: Write component**

```typescript
// src/components/admin/edit-price-modal.tsx
'use client'

import { useState } from 'react'
import { SIZE_LABELS, HAIR_TYPE_LABELS } from '@/lib/types/service-prices'
import type { ServicePrice, SizeCategory } from '@/lib/types/service-prices'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EditPriceModalProps {
  serviceName: string
  billingType: 'avulso' | 'pacote'
  currentPrices: ServicePrice[]
  open: boolean
  onClose: () => void
  onSave: (updates: Array<{
    serviceName: string
    billingType: 'avulso' | 'pacote'
    hairType?: 'PC' | 'PL'
    sizeCategory: SizeCategory
    price: number
  }>) => Promise<void>
}

const SIZES: Array<SizeCategory> = ['tiny', 'small', 'medium', 'large', 'giant']

export function EditPriceModal({
  serviceName,
  billingType,
  currentPrices,
  open,
  onClose,
  onSave
}: EditPriceModalProps) {
  const [saving, setSaving] = useState(false)
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    // Initialize with current prices
    const initial: Record<string, string> = {}
    currentPrices.forEach(price => {
      const key = `${price.hair_type || 'default'}-${price.size_category}`
      initial[key] = price.price.toString()
    })
    return initial
  })

  // Determine if service has hair types
  const hasHairType = currentPrices.some(p => p.hair_type !== null)
  const hairTypes = hasHairType ? (['PC', 'PL'] as const) : [null] as const

  const handleSave = async () => {
    setSaving(true)

    const updates = []

    for (const hairType of hairTypes) {
      for (const size of SIZES) {
        const key = `${hairType || 'default'}-${size}`
        const value = prices[key]

        if (value !== undefined && value !== '') {
          updates.push({
            serviceName,
            billingType,
            hairType: hairType || undefined,
            sizeCategory: size,
            price: parseFloat(value)
          })
        }
      }
    }

    await onSave(updates)
    setSaving(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                Editar: {serviceName}
              </h2>
              <p className="text-sm text-purple-300/70">
                {billingType === 'avulso' ? 'Avulso' : 'Pacote'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {hairTypes.map(hairType => (
              <div key={hairType || 'default'}>
                <h4 className="font-medium text-white mb-3">
                  {hairType ? HAIR_TYPE_LABELS[hairType] : 'Padrão'}
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {SIZES.map(size => {
                    const key = `${hairType || 'default'}-${size}`

                    return (
                      <div key={size}>
                        <label className="block text-xs text-purple-200/70 mb-1">
                          {SIZE_LABELS[size]}
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={prices[key] || ''}
                          onChange={(e) => setPrices(prev => ({
                            ...prev,
                            [key]: e.target.value
                          }))}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="secondary"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/edit-price-modal.tsx
git commit -m "feat(component): add EditPriceModal admin component

Modal for editing service prices in batch.
Supports hair types and all size categories.
"
```

---

## Task 13: Page - Admin Preços

**Files:**
- Create: `src/app/(app)/app/precos/page.tsx`

- [ ] **Step 1: Create page file**

```bash
mkdir -p src/app/(app)/app/precos
touch src/app/(app)/app/precos/page.tsx
```

- [ ] **Step 2: Write page component**

```typescript
// src/app/(app)/app/precos/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getServicePrices, updateServicePrices } from '@/lib/actions/service-prices'
import type { ServicePrice } from '@/lib/types/service-prices'
import { AppLayout } from '@/components/layout/app-layout'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { PriceTable } from '@/components/admin/price-table'
import { EditPriceModal } from '@/components/admin/edit-price-modal'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Plus } from 'lucide-react'

export default function PrecosPage() {
  const [prices, setPrices] = useState<ServicePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'avulso' | 'pacote'>('all')
  const [editingService, setEditingService] = useState<{
    serviceName: string
    billingType: 'avulso' | 'pacote'
  } | null>(null)

  useEffect(() => {
    loadPrices()
  }, [filter])

  const loadPrices = async () => {
    setLoading(true)
    const result = await getServicePrices(filter)

    if (result.data) {
      setPrices(result.data)
    }

    setLoading(false)
  }

  // Group prices by service name and billing type
  const groupedPrices = prices.reduce((acc, price) => {
    const key = `${price.service_name}-${price.billing_type}`

    if (!acc[key]) {
      acc[key] = {
        serviceName: price.service_name,
        billingType: price.billing_type,
        prices: []
      }
    }

    acc[key].prices.push(price)
    return acc
  }, {} as Record<string, { serviceName: string; billingType: 'avulso' | 'pacote'; prices: ServicePrice[] }>)

  const handleSavePrices = async (updates: Array<{
    serviceName: string
    billingType: 'avulso' | 'pacote'
    hairType?: 'PC' | 'PL'
    sizeCategory: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
    price: number
  }>) => {
    const result = await updateServicePrices(updates)

    if (result.error) {
      alert('Erro ao salvar preços: ' + result.error)
    } else {
      await loadPrices()
    }
  }

  return (
    <AppLayout companyName="Agenda Pet Shop" user={{}}>
      <AppHeader companyName="Agenda Pet Shop" user={{}} />

      <div className="h-[calc(100dvh-60px-64px)] xl:h-auto bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative flex flex-col xl:block overflow-hidden xl:overflow-visible">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">💰</span>
                Gerenciar Preços
              </h1>
            </div>

            {/* Filter */}
            <div className="mb-6">
              <Select
                id="filter"
                label="Filtrar por"
                value={filter}
                onChange={(value) => setFilter(value as 'all' | 'avulso' | 'pacote')}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'avulso', label: 'Avulso' },
                  { value: 'pacote', label: 'Pacote' }
                ]}
              />
            </div>

            {/* Price Tables */}
            {loading ? (
              <div className="text-center py-12 text-purple-200/70">
                Carregando preços...
              </div>
            ) : Object.keys(groupedPrices).length === 0 ? (
              <div className="text-center py-12 text-purple-200/70">
                Nenhum preço encontrado.
              </div>
            ) : (
              <div>
                {Object.values(groupedPrices).map((group) => (
                  <PriceTable
                    key={`${group.serviceName}-${group.billingType}`}
                    serviceName={group.serviceName}
                    billingType={group.billingType}
                    prices={group.prices}
                    onEdit={() => setEditingService({
                      serviceName: group.serviceName,
                      billingType: group.billingType
                    })}
                  />
                ))}
              </div>
            )}

            {/* Add new service button */}
            <div className="mt-8">
              <Button variant="secondary" className="w-full">
                <Plus size={20} className="mr-2" />
                Adicionar Novo Serviço
              </Button>
            </div>
          </main>
        </div>

        <div className="xl:hidden">
          <BottomNavigation />
        </div>
      </div>

      {/* Edit Modal */}
      {editingService && (
        <EditPriceModal
          serviceName={editingService.serviceName}
          billingType={editingService.billingType}
          currentPrices={groupedPrices[`${editingService.serviceName}-${editingService.billingType}`]?.prices || []}
          open={!!editingService}
          onClose={() => setEditingService(null)}
          onSave={handleSavePrices}
        />
      )}
    </AppLayout>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/app/precos/page.tsx
git commit -m "feat(page): add admin prices page

Add page for managing service prices.
Filter by billing type, view in tables, edit via modal.
"
```

---

## Task 14: Update createAppointment action

**Files:**
- Modify: `src/lib/actions/appointments.ts`

- [ ] **Step 1: Read current file**

```bash
cat src/lib/actions/appointments.ts
```

- [ ] **Step 2: Update createAppointment to accept servicePriceId**

Find the createAppointment function and update:

```typescript
// Update the interface/type to accept servicePriceId
export async function createAppointment(input: {
  clientId: string
  petId: string
  servicePriceId: string  // Changed from serviceId
  date: string
  time: string
  price: number
  notes?: string
}): Promise<AppointmentResponse> {
  // ... existing code ...

  // Update the insert to use service_price_id instead of service_id
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      company_id: companyId,
      client_id: input.clientId,
      pet_id: input.petId,
      service_price_id: input.servicePriceId,  // Changed from service_id
      date: input.date,
      time: input.time,
      price: input.price,
      status: 'scheduled',
      notes: input.notes
    })
    .select()
    .single()

  // ... rest of function ...
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/appointments.ts
git commit -m "feat(actions): update createAppointment for servicePriceId

Change from service_id to service_price_id to match
new service pricing system.
"
```

---

## Task 15: Seed initial service prices

**Files:**
- Create: `supabase/migrations/012_seed_service_prices.sql`

- [ ] **Step 1: Create seed migration**

```bash
touch supabase/migrations/012_seed_service_prices.sql
```

- [ ] **Step 2: Write seed data**

```sql
-- migration: 012_seed_service_prices.sql

-- Note: Replace <YOUR_COMPANY_ID> with actual company_id or use a variable
-- This is example data based on the spreadsheet provided

-- Banho/Tosa - Avulso - PC
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price) VALUES
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PC', 'tiny', 55),
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PC', 'small', 65),
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PC', 'medium', 90),
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PC', 'large', 120),
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PC', 'giant', 160);

-- Banho/Tosa - Avulso - PL
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price) VALUES
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PL', 'tiny', 60),
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PL', 'small', 78),
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PL', 'medium', 120),
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PL', 'large', 150),
  ('<company_id>', 'Banho/Tosa', 'avulso', 'PL', 'giant', 240);

-- Banho/Tosa - Pacote - PC
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price) VALUES
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PC', 'tiny', 180),
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PC', 'small', 220),
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PC', 'medium', 300),
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PC', 'large', 380),
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PC', 'giant', 480);

-- Banho/Tosa - Pacote - PL
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price) VALUES
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PL', 'tiny', 200),
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PL', 'small', 240),
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PL', 'medium', 320),
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PL', 'large', 390),
  ('<company_id>', 'Banho/Tosa', 'pacote', 'PL', 'giant', 768);

-- Subpelo - Avulso (no hair type)
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price) VALUES
  ('<company_id>', 'Subpelo', 'avulso', NULL, 'tiny', 65),
  ('<company_id>', 'Subpelo', 'avulso', NULL, 'small', 90),
  ('<company_id>', 'Subpelo', 'avulso', NULL, 'medium', 160),
  ('<company_id>', 'Subpelo', 'avulso', NULL, 'large', 240),
  ('<company_id>', 'Subpelo', 'avulso', NULL, 'giant', 320);

-- Subpelo - Pacote
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price) VALUES
  ('<company_id>', 'Subpelo', 'pacote', NULL, 'tiny', 210),
  ('<company_id>', 'Subpelo', 'pacote', NULL, 'small', 290),
  ('<company_id>', 'Subpelo', 'pacote', NULL, 'medium', 510),
  ('<company_id>', 'Subpelo', 'pacote', NULL, 'large', 770),
  ('<company_id>', 'Subpelo', 'pacote', NULL, 'giant', 1000);

-- Tesoura - Avulso (no hair type)
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price) VALUES
  ('<company_id>', 'Tesoura', 'avulso', NULL, 'tiny', 120),
  ('<company_id>', 'Tesoura', 'avulso', NULL, 'small', 145),
  ('<company_id>', 'Tesoura', 'avulso', NULL, 'medium', 180),
  ('<company_id>', 'Tesoura', 'avulso', NULL, 'large', 230),
  ('<company_id>', 'Tesoura', 'avulso', NULL, 'giant', 320);

-- Tesoura - Pacote
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price) VALUES
  ('<company_id>', 'Tesoura', 'pacote', NULL, 'tiny', 70),
  ('<company_id>', 'Tesoura', 'pacote', NULL, 'small', 85),
  ('<company_id>', 'Tesoura', 'pacote', NULL, 'medium', 100),
  ('<company_id>', 'Tesoura', 'pacote', NULL, 'large', 132.5),
  ('<company_id>', 'Tesoura', 'pacote', NULL, 'giant', 200);
```

- [ ] **Step 3: Run seed migration**

```bash
# First, get your company_id
npx supabase db reset

# Then update the migration with actual company_id before running
npx supabase db push
```

Expected: Seed data inserted.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/012_seed_service_prices.sql
git commit -m "feat(migration): add seed data for service prices

Add initial prices for Banho/Tosa, Subpelo, and Tesoura
based on provided spreadsheet data.
"
```

---

## Task 16: Update pets component to show new sizes

**Files:**
- Find and modify any component displaying pet sizes

- [ ] **Step 1: Find files that reference pet size**

```bash
grep -r "sizeLabels\|sizeEmojis" src/ --include="*.tsx" --include="*.ts"
```

Expected: List of files using old size labels.

- [ ] **Step 2: Update each file to import SIZE_LABELS and SIZE_EMOJIS**

For each file found, update imports and references:

```typescript
// Replace old definitions
import { SIZE_LABELS, SIZE_EMOJIS } from '@/lib/types/service-prices'

// Update usage
sizeLabels[pet.size] -> SIZE_LABELS[pet.size]
sizeEmojis[pet.size] -> SIZE_EMOJIS[pet.size]
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: update pet size labels to 5 categories

Update all components to use new SIZE_LABELS and SIZE_EMOJIS
from service-prices types.
"
```

---

## Task 17: Final testing and cleanup

**Files:**
- Multiple

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Run dev server**

```bash
npm run dev
```

Expected: Server starts without errors.

- [ ] **Step 3: Test appointment creation flow**

1. Navigate to `/app/agendamentos/novo`
2. Select a client
3. Select a pet
4. Select billing type (Avulso/Pacote)
5. Select a service (verify price displays)
6. Select hair type if applicable
7. Enter date/time
8. Submit

Expected: Appointment created successfully with correct price.

- [ ] **Step 4: Test admin prices page**

1. Navigate to `/app/precos`
2. View price tables
3. Click "Editar Preços"
4. Modify prices
5. Save
6. Verify changes persist

Expected: Prices display correctly and updates work.

- [ ] **Step 5: Test with different pet sizes**

Create pets with different sizes and verify correct prices are shown.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete service pricing system implementation

- Add service_prices table with multi-dimensional pricing
- Expand pets to 5 size categories (tiny/small/medium/large/giant)
- Add ServiceSelector and ServiceCard components
- Add admin prices page with PriceTable and EditPriceModal
- Update appointment creation flow for new pricing
- Add seed data for initial service prices

All tasks complete. Ready for testing.
"
```

---

## Summary

This plan implements a complete service pricing system with:
- Multi-dimensional pricing (service × billing_type × hair_type × size_category)
- 5 pet size categories
- Admin UI for managing prices
- Updated appointment creation flow
- Type-safe TypeScript implementation
- Zod validation for inputs

Total tasks: 17
Estimated time: 4-6 hours
