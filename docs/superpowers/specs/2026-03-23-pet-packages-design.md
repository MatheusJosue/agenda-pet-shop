# Sistema de Pacotes por Pet - Design Document

**Date:** 2026-03-23
**Status:** Draft
**Author:** Claude (with user input)

## Overview

Implementação de sistema de pacotes de serviços vinculado a cada pet, permitindo controle de créditos (semanal, quinzenal, mensal) e notificação de clientes quando pacotes são esgotados.

## Requirements Summary

- Pacotes vinculados ao **pet** (não ao cliente)
- Tipos: semanal, quinzenal, mensal
- Consumo: 1 crédito por agendamento
- Status: apenas "Esgotado" (créditos = 0)
- WhatsApp: mensagem fixa padrão para notificar cliente

## Database Schema

### New Tables

#### `package_types`

Tipos de pacote oferecidos pela empresa (produtos).

```sql
CREATE TABLE package_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,              -- ex: "Pacote Semanal", "Pacote Quinzenal"
  interval_days INTEGER NOT NULL,   -- 7, 15 ou 30
  credits INTEGER NOT NULL,         -- número de serviços incluídos
  price DECIMAL(10,2) NOT NULL,     -- preço do pacote
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_package_types_company ON package_types(company_id);
```

#### `pet_packages`

Pacotes ativos adquiridos para cada pet.

```sql
CREATE TABLE pet_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  package_type_id UUID NOT NULL REFERENCES package_types(id),
  credits_remaining INTEGER NOT NULL,
  starts_at DATE NOT NULL,
  expires_at DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_credits_non_negative CHECK (credits_remaining >= 0)
);
```

**Indexes:**
```sql
CREATE INDEX idx_pet_packages_pet ON pet_packages(pet_id);
CREATE INDEX idx_pet_packages_expires ON pet_packages(expires_at);
CREATE INDEX idx_pet_packages_credits ON pet_packages(credits_remaining);

-- Only one active package per pet
CREATE UNIQUE INDEX idx_active_package_per_pet
ON pet_packages(pet_id)
WHERE active = true;
```

#### Modificação em `appointments`

A tabela `appointments` já possui coluna `used_credit`. Adicionar apenas a coluna para vincular ao pacote do pet:

```sql
ALTER TABLE appointments
ADD COLUMN pet_package_id UUID REFERENCES pet_packages(id);

-- Note: Créditos são validados via aplicação e função decrement_package_credits
-- para garantir consistência no momento do uso
```

### Security Functions

#### `decrement_package_credits`

Função segura para decrementar créditos com validação de permissão.

```sql
CREATE OR REPLACE FUNCTION decrement_package_credits(
  p_package_id UUID,
  p_appointment_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Verify permission
  IF NOT EXISTS (
    SELECT 1 FROM pet_packages pp
    JOIN users u ON u.company_id = pp.company_id
    WHERE pp.id = p_package_id
    AND u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permissão negada';
  END IF;

  -- Decrement with lock
  UPDATE pet_packages
  SET credits_remaining = credits_remaining - 1
  WHERE id = p_package_id
  AND credits_remaining > 0
  AND active = true;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Row Level Security

#### `package_types` Policies

```sql
-- All company users can view
CREATE POLICY "Company users can view package types"
ON package_types FOR SELECT
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Only admins can create/edit
CREATE POLICY "Admins can manage package types"
ON package_types FOR ALL
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'company_admin')
  )
);
```

#### `pet_packages` Policies

```sql
-- View packages from own pets
CREATE POLICY "Users can view packages from their pets"
ON pet_packages FOR SELECT
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Manage packages
CREATE POLICY "Company users can manage packages"
ON pet_packages FOR ALL
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'company_admin', 'company_user')
  )
);
```

## User Interface

### 1. Pet Detail Screen Modification

**Location:** `/app/pets/[id]/page.tsx`

Add button "Adicionar Pacote" next to existing actions.

#### Add Package Modal

```
┌─────────────────────────────────────┐
│  Adicionar Pacote                   │
├─────────────────────────────────────┤
│  Tipo de Pacote                     │
│  [Semanal] [Quinzenal] [Mensal]    │
│                                     │
│  Data de Início                     │
│  [23/03/2026]                       │
│                                     │
│  Resumo:                            │
│  • Pacote Semanal                   │
│  • 4 créditos                       │
│  • Vence em 30/03/2026              │
│  • R$ 120,00                        │
│                                     │
│  [Cancelar] [Confirmar]            │
└─────────────────────────────────────┘
```

#### Package Card on Pet Screen

```tsx
{petPackage && (
  <GlassCard>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-lg font-semibold">{petPackage.type.name}</p>
        <p className="text-sm text-purple-200/60">
          {petPackage.credits_remaining} de {petPackage.total_credits} créditos
        </p>
        <p className="text-xs text-purple-200/40">
          Vence em {formatDate(petPackage.expires_at)}
        </p>
      </div>
      <div className="text-right">
        <ProgressBar current={petPackage.credits_remaining} total={petPackage.total_credits} />
      </div>
    </div>
  </GlassCard>
)}
```

### 2. Dashboard - New "Pacotes" Tab

**Location:** `/app/page.tsx` or `/app/pacotes/page.tsx`

```
┌─────────────────────────────────────┐
│  📦 Pacotes Esgotados               │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 🐕 Rex                        │  │
│  │ Silva Família                 │  │
│  │ Pacote Semanal • Vence 25/03  │  │
│  │                                │  │
│  │ [💬 WhatsApp] [Ver Pet]       │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🐱 Mia                        │  │
│  │ Costa                         │  │
│  │ Pacote Quinzenal • Vence 01/04│  │
│  │                                │  │
│  │ [💬 WhatsApp] [Ver Pet]       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 3. WhatsApp Integration

**Button Behavior:**

```typescript
function generateWhatsAppLink(
  clientPhone: string,
  clientName: string,
  petName: string,
  packageName: string
): string {
  const phone = clientPhone.replace(/\D/g, '') // digits only
  const message = `Olá ${clientName}! O pacote ${packageName} do(a) ${petName} acabou. Que tal renovar para continuar aproveitando?`

  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
}
```

Opens in new tab.

## Data Types

### New Types File: `src/lib/types/packages.ts`

```typescript
export interface PackageType {
  id: string
  company_id: string
  name: string
  interval_days: number
  credits: number
  price: number
  active: boolean
  created_at: string
}

export interface PetPackage {
  id: string
  company_id: string
  pet_id: string
  package_type_id: string
  credits_remaining: number
  starts_at: string
  expires_at: string
  active: boolean
  created_at: string
}

export interface PetPackageWithRelations extends PetPackage {
  pet: {
    id: string
    name: string
    size: 'small' | 'medium' | 'large'
  }
  client: {
    id: string
    name: string
    phone: string
  }
  package_type: PackageType
}

export interface PackageInput {
  petId: string
  packageTypeId: string
  startsAt: Date | string
}
```

## Server Actions

### New File: `src/lib/actions/packages.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import type { PetPackage, PetPackageWithRelations, PackageType } from '@/lib/types/packages'

export async function createPetPackage(input: {
  petId: string
  packageTypeId: string
  startsAt: Date
}): Promise<{ data?: PetPackage; error?: string }> {
  // Implementation
}

export async function getExhaustedPackages(): Promise<{
  data?: PetPackageWithRelations[]
  error?: string
}> {
  // Returns packages with credits_remaining = 0
}

export async function getPetPackages(petId: string): Promise<{
  data?: PetPackage[]
  error?: string
}> {
  // Returns all packages for a pet
}

export async function usePackageCredit(
  packageId: string,
  appointmentId: string
): Promise<{ error?: string }> {
  // Calls decrement_package_credits function
}

export async function getPackageTypes(): Promise<{
  data?: PackageType[]
  error?: string
}> {
  // Returns active package types for company
}
```

## File Structure

```
src/
├── lib/
│   ├── actions/
│   │   └── packages.ts              # NEW: CRUD de pacotes
│   ├── types/
│   │   └── packages.ts              # NEW: Types TypeScript
│   └── utils/
│       └── whatsapp.ts              # NEW: WhatsApp link generator
├── app/(app)/app/
│   ├── page.tsx                     # MODIFIED: Dashboard
│   ├── pets/
│   │   └── [id]/
│   │       └── page.tsx             # MODIFIED: Add package card
│   └── pacotes/                     # NEW: Package management
│       └── page.tsx                 # Exhausted packages list
├── components/
│   ├── pacotes/                     # NEW: Package components
│   │   ├── package-card.tsx
│   │   ├── add-package-modal.tsx
│   │   └── empty-packages.tsx
│   └── ui/
│       ├── progress-bar.tsx         # NEW: Credits progress
│       └── whatsapp-button.tsx      # NEW: WhatsApp button
```

## Business Rules

### Validation Rules

1. **Cadastro:**
   - Pet deve pertencer à mesma empresa do usuário logado
   - Tipo de pacote deve estar ativo
   - Data de início não pode ser no passado
   - Só 1 pacote ativo por pet (novos desativam o anterior)

2. **Uso de Créditos:**
   - Pacote deve estar ativo
   - Créditos restantes > 0
   - Data atual <= expires_at
   - Agendamento não pode usar crédito sem pacote vinculado

3. **Exclusão:**
   - Pacotes não podem ser excluídos, apenas desativados (soft delete via `active = false`)
   - Package_types também usam soft delete (coluna `active`)
   - Pacotes com créditos usados não podem ser modificados
   - Apenas admin pode desativar pacotes

### Database Constraints

```sql
-- Credits non-negative
ALTER TABLE pet_packages
ADD CONSTRAINT check_credits_non_negative
CHECK (credits_remaining >= 0);

-- One active package per pet
CREATE UNIQUE INDEX idx_active_package_per_pet
ON pet_packages(pet_id)
WHERE active = true;
```

## User Flows

### 1. Create Package Flow

```
User clicks "Adicionar Pacote" on pet screen
    ↓
Modal opens with package type selection
    ↓
User selects type → system auto-fills:
  - Credits (based on type)
  - Price (based on type)
  - Start date (today)
  - Expiry date (today + interval_days)
    ↓
User confirms → creates pet_packages record
    ↓
Redirect to pet screen with new package card
```

### 2. Use Credit on Appointment Flow

```
User creates appointment
    ↓
System checks if pet has active package with credits
    ↓
If YES: show checkbox "Usar crédito do pacote"
    ↓
If checked:
  - Mark pet_package_id on appointment
  - Set used_credit = true
  - Decrement credits_remaining
  - Set appointment price = R$ 0,00
```

### 3. Dashboard - Exhausted Packages Flow

```
Query packages with credits_remaining = 0
    ↓
Render list with:
  - Pet name
  - Client name
  - Package type
  - WhatsApp button
  - Link to pet screen
```

## Migration Plan

1. **Phase 1: Database** (Migration file)
   - Create `package_types` table
   - Create `pet_packages` table
   - Add `pet_package_id` to `appointments`
   - Create indexes and constraints
   - Create RLS policies
   - Create `decrement_package_credits` function

2. **Phase 2: Types & Actions**
   - Create `src/lib/types/packages.ts`
   - Create `src/lib/actions/packages.ts`
   - Create `src/lib/utils/whatsapp.ts`

3. **Phase 3: Components**
   - Create package components
   - Create UI components (progress bar, WhatsApp button)

4. **Phase 4: Pages**
   - Modify pet detail page
   - Create packages page
   - Modify dashboard

5. **Phase 5: Integration**
   - Connect appointment creation with package usage
   - Test complete flow

## Success Criteria

- ✅ Pets can have packages assigned
- ✅ Appointments can use package credits
- ✅ Dashboard shows exhausted packages
- ✅ WhatsApp button opens with correct message
- ✅ Credits are properly decremented
- ✅ RLS prevents cross-company access
- ✅ Only one active package per pet

## Future Enhancements (Out of Scope)

- Package history/audit log
- Scheduled notifications (not just manual)
- Package analytics/reporting
- Shared packages between pets
- Custom package types (user-defined)
- Package renewal automation
- Package pause/suspend functionality
