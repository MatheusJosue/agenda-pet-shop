# Sistema de Pacotes por Pet - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pet-specific package system with credit management and WhatsApp notifications for exhausted packages.

**Architecture:** Minimalist approach - two new tables (package_types, pet_packages), simple server actions, card-based UI following existing patterns. Each pet has one active package at a time, credits are consumed per appointment.

**Tech Stack:** Next.js 15, Supabase (PostgreSQL + RLS), TypeScript, Tailwind CSS, Framer Motion

---

## File Structure Overview

**New Files:**
- `src/lib/types/packages.ts` - Package-related TypeScript interfaces
- `src/lib/actions/packages.ts` - Server actions for package CRUD
- `src/lib/utils/whatsapp.ts` - WhatsApp link generator utility
- `src/components/pacotes/package-card.tsx` - Package display card
- `src/components/pacotes/add-package-modal.tsx` - Package creation modal
- `src/components/ui/progress-bar.tsx` - Credits progress indicator
- `src/components/ui/whatsapp-button.tsx` - WhatsApp action button
- `src/app/(app)/app/pacotes/page.tsx` - Exhausted packages dashboard

**Modified Files:**
- `supabase/migrations/008_pet_packages.sql` - Database migration (new)
- `src/app/(app)/app/pets/[id]/page.tsx` - Add package card and button
- `src/lib/actions/appointments.ts` - Support pet_package_id

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/008_pet_packages.sql`

- [ ] **Step 1: Create migration file with package_types table**

```sql
-- supabase/migrations/008_pet_packages.sql

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Package types table (products offered by company)
CREATE TABLE package_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  interval_days INTEGER NOT NULL CHECK (interval_days IN (7, 15, 30)),
  credits INTEGER NOT NULL CHECK (credits > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_package_types_company ON package_types(company_id);

-- Pet packages table (active packages for each pet)
CREATE TABLE pet_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  package_type_id UUID NOT NULL REFERENCES package_types(id),
  credits_remaining INTEGER NOT NULL CHECK (credits_remaining >= 0),
  starts_at DATE NOT NULL,
  expires_at DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pet_packages_pet ON pet_packages(pet_id);
CREATE INDEX idx_pet_packages_expires ON pet_packages(expires_at);
CREATE INDEX idx_pet_packages_credits ON pet_packages(credits_remaining);

-- One active package per pet
CREATE UNIQUE INDEX idx_active_package_per_pet
ON pet_packages(pet_id)
WHERE active = true;

-- Add pet_package_id to appointments
ALTER TABLE appointments
ADD COLUMN pet_package_id UUID REFERENCES pet_packages(id);

-- Secure function to decrement package credits
CREATE OR REPLACE FUNCTION decrement_package_credits(
  p_package_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Get the company_id from the package
  SELECT company_id INTO v_company_id
  FROM pet_packages
  WHERE id = p_package_id;

  -- Verify permission through RLS
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND company_id = v_company_id
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

-- RLS Policies for package_types
ALTER TABLE package_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can view package_types"
ON package_types FOR SELECT
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage package_types"
ON package_types FOR ALL
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'company_admin')
  )
);

-- RLS Policies for pet_packages
ALTER TABLE pet_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can view pet_packages"
ON pet_packages FOR SELECT
USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Company users can manage pet_packages"
ON pet_packages FOR ALL
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'company_admin', 'company_user')
  )
);

-- Seed default package types for existing companies
INSERT INTO package_types (company_id, name, interval_days, credits, price)
SELECT id, 'Pacote Semanal', 7, 4, 120.00
FROM companies
ON CONFLICT DO NOTHING;

INSERT INTO package_types (company_id, name, interval_days, credits, price)
SELECT id, 'Pacote Quinzenal', 15, 8, 220.00
FROM companies
ON CONFLICT DO NOTHING;

INSERT INTO package_types (company_id, name, interval_days, credits, price)
SELECT id, 'Pacote Mensal', 30, 16, 400.00
FROM companies
ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: Commit migration**

```bash
git add supabase/migrations/008_pet_packages.sql
git commit -m "feat: add pet packages database schema

- Create package_types table for package products
- Create pet_packages table for active pet packages
- Add pet_package_id to appointments
- Add RLS policies and security functions
- Seed default package types (weekly, fortnightly, monthly)"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/lib/types/packages.ts`

- [ ] **Step 1: Create package types file**

```typescript
// src/lib/types/packages.ts

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

export interface PackageTypesResponse {
  data?: PackageType[]
  error?: string
}

export interface PetPackagesResponse {
  data?: PetPackageWithRelations[]
  error?: string
}

export interface PetPackageResponse {
  data?: PetPackage
  error?: string
}
```

- [ ] **Step 2: Commit types**

```bash
git add src/lib/types/packages.ts
git commit -m "feat: add package types"
```

---

## Task 3: WhatsApp Utility

**Files:**
- Create: `src/lib/utils/whatsapp.ts`

- [ ] **Step 1: Create WhatsApp link generator**

```typescript
// src/lib/utils/whatsapp.ts

/**
 * Generate a WhatsApp link with a pre-filled message
 * @param phone - Phone number (digits only, e.g., "11987654321")
 * @param message - Message to send
 * @returns WhatsApp URL (opens in new tab)
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '') // Remove non-digits
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`
}

/**
 * Generate WhatsApp message for exhausted package notification
 */
export function generateExhaustedPackageMessage(
  clientName: string,
  petName: string,
  packageName: string
): string {
  return `Olá ${clientName}! O pacote ${packageName} do(a) ${petName} acabou. Que tal renovar para continuar aproveitando?`
}
```

- [ ] **Step 2: Commit WhatsApp utility**

```bash
git add src/lib/utils/whatsapp.ts
git commit -m "feat: add WhatsApp link generator utility"
```

---

## Task 4: Server Actions - Get Package Types

**Files:**
- Create: `src/lib/actions/packages.ts`

- [ ] **Step 1: Create packages action file with getPackageTypes**

```typescript
// src/lib/actions/packages.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type {
  PackageType,
  PetPackage,
  PetPackageWithRelations,
  PackageInput,
  PackageTypesResponse,
  PetPackagesResponse,
  PetPackageResponse
} from '@/lib/types/packages'

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
 * Get all active package types for the current company
 */
export async function getPackageTypes(): Promise<PackageTypesResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('package_types')
    .select('*')
    .eq('company_id', companyId)
    .eq('active', true)
    .order('interval_days', { ascending: true })

  if (error) {
    return { data: [], error: 'Erro ao buscar tipos de pacote' }
  }

  return { data: data || [] }
}
```

- [ ] **Step 2: Commit initial server actions**

```bash
git add src/lib/actions/packages.ts
git commit -m "feat: add getPackageTypes server action"
```

---

## Task 5: Server Actions - Get Exhausted Packages

**Files:**
- Modify: `src/lib/actions/packages.ts`

- [ ] **Step 1: Add getExhaustedPackages function**

```typescript
// Add to src/lib/actions/packages.ts after getPackageTypes

/**
 * Get all packages with zero credits remaining
 */
export async function getExhaustedPackages(): Promise<PetPackagesResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('pet_packages')
    .select(`
      *,
      pet:pets!inner(id, name, size),
      client:clients!inner(id, name, phone),
      package_type:package_types!inner(*)
    `)
    .eq('company_id', companyId)
    .eq('credits_remaining', 0)
    .eq('active', true)
    .order('expires_at', { ascending: false })

  if (error) {
    return { data: [], error: 'Erro ao buscar pacotes esgotados' }
  }

  return { data: (data || []) as PetPackageWithRelations[] }
}
```

- [ ] **Step 2: Commit getExhaustedPackages**

```bash
git add src/lib/actions/packages.ts
git commit -m "feat: add getExhaustedPackages server action"
```

---

## Task 6: Server Actions - Get Pet Packages

**Files:**
- Modify: `src/lib/actions/packages.ts`

- [ ] **Step 1: Add getPetPackages function**

```typescript
// Add to src/lib/actions/packages.ts after getExhaustedPackages

/**
 * Get all packages for a specific pet
 */
export async function getPetPackages(petId: string): Promise<PetPackagesResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('pet_packages')
    .select(`
      *,
      package_type:package_types!inner(*)
    `)
    .eq('company_id', companyId)
    .eq('pet_id', petId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: 'Erro ao buscar pacotes do pet' }
  }

  return { data: (data || []) as PetPackageWithRelations[] }
}

/**
 * Get active package for a specific pet
 */
export async function getActivePetPackage(petId: string): Promise<PetPackageResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('pet_packages')
    .select(`
      *,
      package_type:package_types!inner(*)
    `)
    .eq('company_id', companyId)
    .eq('pet_id', petId)
    .eq('active', true)
    .single()

  if (error || !data) {
    return { data: undefined }
  }

  return { data: data as PetPackageWithRelations }
}
```

- [ ] **Step 2: Commit getPetPackages**

```bash
git add src/lib/actions/packages.ts
git commit -m "feat: add getPetPackages and getActivePetPackage actions"
```

---

## Task 7: Server Actions - Create Package

**Files:**
- Modify: `src/lib/actions/packages.ts`

- [ ] **Step 1: Add createPetPackage function**

```typescript
// Add to src/lib/actions/packages.ts after getActivePetPackage

/**
 * Create a new package for a pet
 */
export async function createPetPackage(input: PackageInput): Promise<PetPackageResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Verify pet belongs to company
  const { data: pet } = await supabase
    .from('pets')
    .select('id')
    .eq('id', input.petId)
    .eq('company_id', companyId)
    .single()

  if (!pet) {
    return { error: 'Pet não encontrado' }
  }

  // Get package type
  const { data: packageType } = await supabase
    .from('package_types')
    .select('*')
    .eq('id', input.packageTypeId)
    .eq('company_id', companyId)
    .eq('active', true)
    .single()

  if (!packageType) {
    return { error: 'Tipo de pacote não encontrado' }
  }

  // Calculate dates
  const startDate = new Date(input.startsAt)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + packageType.interval_days)

  // Deactivate existing packages for this pet
  await supabase
    .from('pet_packages')
    .update({ active: false })
    .eq('pet_id', input.petId)
    .eq('active', true)

  // Create new package
  const { data, error } = await supabase
    .from('pet_packages')
    .insert({
      company_id: companyId,
      pet_id: input.petId,
      package_type_id: input.packageTypeId,
      credits_remaining: packageType.credits,
      starts_at: startDate.toISOString().split('T')[0],
      expires_at: endDate.toISOString().split('T')[0],
      active: true
    })
    .select(`
      *,
      package_type:package_types!inner(*)
    `)
    .single()

  if (error) {
    return { error: 'Erro ao criar pacote' }
  }

  revalidatePath(`/app/pets/${input.petId}`)
  revalidatePath('/app/pacotes')

  return { data: data as PetPackageWithRelations }
}
```

- [ ] **Step 2: Commit createPetPackage**

```bash
git add src/lib/actions/packages.ts
git commit -m "feat: add createPetPackage server action"
```

---

## Task 8: Server Actions - Use Package Credit

**Files:**
- Modify: `src/lib/actions/packages.ts`

- [ ] **Step 1: Add usePackageCredit function**

```typescript
// Add to src/lib/actions/packages.ts after createPetPackage

/**
 * Decrement credits from a package when used in an appointment
 */
export async function usePackageCredit(packageId: string): Promise<{ error?: string }> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createSupabaseClient()

  // Verify package belongs to company
  const { data: packageData } = await supabase
    .from('pet_packages')
    .select('id, credits_remaining')
    .eq('id', packageId)
    .eq('company_id', companyId)
    .eq('active', true)
    .single()

  if (!packageData) {
    return { error: 'Pacote não encontrado' }
  }

  if (packageData.credits_remaining < 1) {
    return { error: 'Créditos insuficientes' }
  }

  // Decrement using secure function
  const { error } = await supabase.rpc('decrement_package_credits', {
    p_package_id: packageId
  })

  if (error) {
    return { error: 'Erro ao usar crédito' }
  }

  return {}
}
```

- [ ] **Step 2: Commit usePackageCredit**

```bash
git add src/lib/actions/packages.ts
git commit -m "feat: add usePackageCredit server action"
```

---

## Task 9: UI Component - Progress Bar

**Files:**
- Create: `src/components/ui/progress-bar.tsx`
- Create: `src/components/ui/progress-bar.module.css`

- [ ] **Step 1: Create progress bar component**

```tsx
// src/components/ui/progress-bar.tsx
import styles from './progress-bar.module.css'

interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function ProgressBar({ current, total, showLabel = true, size = 'md' }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / total) * 100))
  const isLow = percentage <= 25

  return (
    <div className={styles.container}>
      {showLabel && (
        <span className={styles.label}>
          {current} de {total}
        </span>
      )}
      <div className={`${styles.track} ${styles[size]}`}>
        <div
          className={`${styles.fill} ${isLow ? styles.low : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create progress bar styles**

```css
/* src/components/ui/progress-bar.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.label {
  font-size: 0.75rem;
  color: rgb(168 162 158); /* text-purple-200/60 */
  text-align: right;
}

.track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
}

.track.sm {
  height: 0.375rem;
}

.track.md {
  height: 0.5rem;
}

.fill {
  height: 100%;
  background: linear-gradient(to right, rgb(168 85 247), rgb(217 70 239));
  transition: width 0.3s ease;
  border-radius: 9999px;
}

.fill.low {
  background: linear-gradient(to right, rgb(239 68 68), rgb(220 38 38));
}
```

- [ ] **Step 3: Commit progress bar**

```bash
git add src/components/ui/progress-bar.tsx src/components/ui/progress-bar.module.css
git commit -m "feat: add progress bar component"
```

---

## Task 10: UI Component - WhatsApp Button

**Files:**
- Create: `src/components/ui/whatsapp-button.tsx`

- [ ] **Step 1: Create WhatsApp button component**

```tsx
// src/components/ui/whatsapp-button.tsx
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WhatsAppButtonProps {
  phone: string
  message: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

export function WhatsAppButton({
  phone,
  message,
  size = 'sm',
  variant = 'secondary'
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const cleanPhone = phone.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`
    window.open(url, '_blank')
  }

  return (
    <Button
      onClick={handleClick}
      size={size}
      variant={variant}
      className="gap-2"
    >
      <MessageCircle size={16} />
      WhatsApp
    </Button>
  )
}
```

- [ ] **Step 2: Commit WhatsApp button**

```bash
git add src/components/ui/whatsapp-button.tsx
git commit -m "feat: add WhatsApp button component"
```

---

## Task 11: UI Component - Package Card

**Files:**
- Create: `src/components/pacotes/package-card.tsx`

- [ ] **Step 1: Create package card component**

```tsx
// src/components/pacotes/package-card.tsx
import { ProgressBar } from '@/components/ui/progress-bar'
import type { PetPackageWithRelations } from '@/lib/types/packages'

interface PackageCardProps {
  packageData: PetPackageWithRelations
}

export function PackageCard({ packageData }: PackageCardProps) {
  const totalCredits = packageData.package_type.credits
  const remainingCredits = packageData.credits_remaining

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="text-lg font-semibold text-white">
            {packageData.package_type.name}
          </p>
          <p className="text-sm text-purple-200/60 mt-1">
            {remainingCredits} de {totalCredits} créditos
          </p>
          <p className="text-xs text-purple-200/40 mt-1">
            Vence em {formatDate(packageData.expires_at)}
          </p>
        </div>
        <div className="w-32">
          <ProgressBar current={remainingCredits} total={totalCredits} showLabel={false} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit package card**

```bash
git add src/components/pacotes/package-card.tsx
git commit -m "feat: add package card component"
```

---

## Task 12: UI Component - Add Package Modal

**Files:**
- Create: `src/components/pacotes/add-package-modal.tsx`

- [ ] **Step 1: Create add package modal component**

```tsx
// src/components/pacotes/add-package-modal.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { createPetPackage, getPackageTypes } from '@/lib/actions/packages'
import type { PackageType } from '@/lib/types/packages'

interface AddPackageModalProps {
  petId: string
  petName: string
  onClose: () => void
}

export function AddPackageModal({ petId, petName, onClose }: AddPackageModalProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<PackageType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  // Load package types on mount
  useState(() => {
    getPackageTypes().then(result => {
      if (result.data) {
        setPackageTypes(result.data)
      }
      setLoadingTypes(false)
    })
  })

  const handleSubmit = async () => {
    if (!selectedType) return

    setLoading(true)
    setError(null)

    const result = await createPetPackage({
      petId,
      packageTypeId: selectedType.id,
      startsAt: new Date()
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onClose()
    router.refresh()
  }

  const calculateExpiryDate = (intervalDays: number) => {
    const date = new Date()
    date.setDate(date.getDate() + intervalDays)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassCard className="w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Adicionar Pacote - {petName}
        </h2>

        {loadingTypes ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-purple-200/60 mb-2">Selecione o tipo de pacote:</p>
              {packageTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedType?.id === type.id
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <p className="font-semibold text-white">{type.name}</p>
                  <div className="flex justify-between mt-2 text-sm text-purple-200/60">
                    <span>{type.credits} créditos</span>
                    <span>R$ {type.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-purple-200/40 mt-1">
                    Vence em {calculateExpiryDate(type.interval_days)}
                  </p>
                </button>
              ))}
            </div>

            {selectedType && (
              <div className="mb-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-purple-200">
                  <strong>Resumo:</strong>
                </p>
                <ul className="text-sm text-purple-200/80 mt-2 space-y-1">
                  <li>• {selectedType.name}</li>
                  <li>• {selectedType.credits} créditos incluídos</li>
                  <li>• Vence em {calculateExpiryDate(selectedType.interval_days)}</li>
                  <li>• Valor: R$ {selectedType.price.toFixed(2)}</li>
                </ul>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!selectedType || loading}
                className="flex-1"
              >
                {loading ? 'Criando...' : 'Confirmar'}
              </Button>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  )
}
```

- [ ] **Step 2: Commit add package modal**

```bash
git add src/components/pacotes/add-package-modal.tsx
git commit -m "feat: add package modal component"
```

---

## Task 13: Modify Pet Detail Page

**Files:**
- Modify: `src/app/(app)/app/pets/[id]/page.tsx`

- [ ] **Step 1: Read current pet page to understand structure**

```bash
# Read the file to understand its current structure
# This is a preparation step, no code change
cat src/app/(app)/app/pets/[id]/page.tsx
```

- [ ] **Step 2: Add package section to pet page**

```tsx
// Add these imports to src/app/(app)/app/pets/[id]/page.tsx
import { PackageCard } from '@/components/pacotes/package-card'
import { AddPackageModal } from '@/components/pacotes/add-package-modal'
import { getActivePetPackage } from '@/lib/actions/packages'
import { useState, useEffect } from 'react'

// Add state for modal inside the component
const [showPackageModal, setShowPackageModal] = useState(false)
const [activePackage, setActivePackage] = useState<any>(null)
const [loadingPackage, setLoadingPackage] = useState(true)

// Add useEffect to load active package
useEffect(() => {
  getActivePetPackage(params.id).then(result => {
    setActivePackage(result.data)
    setLoadingPackage(false)
  })
}, [params.id])

// Add "Adicionar Pacote" button in the actions section (find where the edit button is)
<Button
  variant="secondary"
  size="sm"
  onClick={() => setShowPackageModal(true)}
>
  📦 Pacote
</Button>

// Add package section before the appointments section
{loadingPackage ? (
  <div className="flex justify-center py-8">
    <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
  </div>
) : activePackage ? (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-white">Pacote Ativo</h3>
    <PackageCard packageData={activePackage} />
  </div>
) : (
  <GlassCard className="p-6 text-center">
    <p className="text-purple-200/60 mb-4">Este pet ainda não tem um pacote ativo.</p>
    <Button
      variant="primary"
      onClick={() => setShowPackageModal(true)}
    >
      Adicionar Pacote
    </Button>
  </GlassCard>
)}

// Add modal at the end of the component (before closing div)
{showPackageModal && (
  <AddPackageModal
    petId={params.id}
    petName={pet?.name || ''}
    onClose={() => setShowPackageModal(false)}
  />
)}
```

- [ ] **Step 3: Commit pet page modification**

```bash
git add src/app/(app)/app/pets/[id]/page.tsx
git commit -m "feat: add package section to pet detail page"
```

---

## Task 14: Create Packages Dashboard Page

**Files:**
- Create: `src/app/(app)/app/pacotes/page.tsx`

- [ ] **Step 1: Create packages dashboard page**

```tsx
// src/app/(app)/app/pacotes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { WhatsAppButton } from '@/components/ui/whatsapp-button'
import { getExhaustedPackages, generateExhaustedPackageMessage } from '@/lib/actions/packages'
import type { PetPackageWithRelations } from '@/lib/types/packages'
import { PawPrint, Calendar } from 'lucide-react'

export default function PacotesPage() {
  const [packages, setPackages] = useState<PetPackageWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getExhaustedPackages().then(result => {
      if (result.error) {
        setError(result.error)
      } else {
        setPackages(result.data || [])
      }
      setLoading(false)
    })
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden pb-20">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/30">
              📦
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Pacotes
              </h1>
              <p className="text-purple-200/60 text-sm">
                Pacotes com créditos esgotados
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <GlassCard variant="default" className="p-4 bg-red-500/20 border-red-500/50">
            <p className="text-red-200">⚠️ {error}</p>
          </GlassCard>
        ) : packages.length === 0 ? (
          <GlassCard variant="default" className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <PawPrint size={32} className="text-purple-300" />
            </div>
            <p className="text-purple-200/60">Nenhum pacote esgotado no momento</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <GlassCard
                key={pkg.id}
                variant="default"
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <PawPrint size={20} className="text-purple-400 flex-shrink-0" />
                      <span className="font-semibold text-white">{pkg.pet.name}</span>
                    </div>
                    <p className="text-sm text-purple-200/60 mb-1">{pkg.client.name}</p>
                    <div className="flex items-center gap-1 text-sm text-purple-200/40">
                      <Calendar size={14} />
                      <span>Venceu em {formatDate(pkg.expires_at)}</span>
                    </div>
                    <p className="text-xs text-purple-200/40 mt-1">{pkg.package_type.name}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <WhatsAppButton
                      phone={pkg.client.phone}
                      message={generateExhaustedPackageMessage(
                        pkg.client.name,
                        pkg.pet.name,
                        pkg.package_type.name
                      )}
                      size="sm"
                    />
                    <Link href={`/app/pets/${pkg.pet.id}`}>
                      <Button variant="secondary" size="sm">
                        Ver Pet
                      </Button>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
```

- [ ] **Step 2: Fix import in packages page**

```typescript
// The generateExhaustedPackageMessage should come from utils, not actions
// Change the import:
import { getExhaustedPackages } from '@/lib/actions/packages'
import { generateExhaustedPackageMessage } from '@/lib/utils/whatsapp'
```

- [ ] **Step 3: Commit packages dashboard**

```bash
git add src/app/(app)/app/pacotes/page.tsx
git commit -m "feat: add exhausted packages dashboard page"
```

---

## Task 15: Update Appointments to Use Pet Packages

**Files:**
- Modify: `src/lib/actions/appointments.ts`

- [ ] **Step 1: Modify createAppointment to support pet_package_id**

```typescript
// Find the section in createAppointment that checks for credit usage
// Replace the existing client_plan check with support for pet_package_id

// Add pet_package_id to the input type check
const validatedFields = appointmentSchema.safeParse({
  clientId: input.clientId,
  petId: input.petId,
  serviceId: input.serviceId,
  date: input.date,
  time: input.time,
  useCredit: input.useCredit || false,
  clientPlanId: input.clientPlanId,
  petPackageId: input.petPackageId, // ADD THIS
  notes: input.notes
})

// Replace the existing credit check with support for both client_plan and pet_package
let finalPrice = price
let creditUsed = false

// Check if using pet package credit
if (input.useCredit && input.petPackageId) {
  const { data: petPackage } = await supabase
    .from('pet_packages')
    .select('credits_remaining, expires_at, active')
    .eq('id', input.petPackageId)
    .eq('pet_id', input.petId)
    .eq('company_id', companyId)
    .single()

  if (!petPackage) {
    return { error: 'Pacote do pet não encontrado' }
  }

  if (!petPackage.active) {
    return { error: 'Pacote do pet não está ativo' }
  }

  if (petPackage.credits_remaining < 1) {
    return { error: 'Créditos insuficientes no pacote do pet' }
  }

  if (new Date(petPackage.expires_at) < new Date()) {
    return { error: 'Pacote do pet expirou' }
  }

  finalPrice = 0
  creditUsed = true
}
// Keep existing client_plan check as fallback
else if (input.useCredit && input.clientPlanId) {
  // ... existing client plan code ...
  finalPrice = 0
  creditUsed = true
}

// Update the insert to include pet_package_id
const { data, error } = await supabase
  .from('appointments')
  .insert({
    company_id: companyId,
    client_id: validatedFields.data.clientId,
    pet_id: validatedFields.data.petId,
    service_id: validatedFields.data.serviceId,
    date: validatedFields.data.date.toISOString().split('T')[0],
    time: validatedFields.data.time,
    price: finalPrice,
    status: 'scheduled',
    used_credit: creditUsed,
    client_plan_id: validatedFields.data.clientPlanId,
    pet_package_id: input.petPackageId, // ADD THIS
    notes: validatedFields.data.notes || null
  })
  .select()
  .single()

// Update credit deduction section
// Deduct pet package credit if used
if (input.useCredit && input.petPackageId) {
  const { error: decrementError } = await supabase.rpc('decrement_package_credits', {
    p_package_id: input.petPackageId
  })

  if (decrementError) {
    console.error('Failed to decrement pet package credit:', decrementError)
  }
}
// Keep existing client plan deduction
else if (input.useCredit && input.clientPlanId) {
  // ... existing client plan deduction ...
}
```

- [ ] **Step 2: Update revalidate paths to include packages**

```typescript
// Add revalidatePath for packages after successful creation
revalidatePath('/app/agendamentos')
revalidatePath(`/app/clientes/${input.clientId}`)
revalidatePath(`/app/pets/${input.petId}`)
revalidatePath('/app/pacotes') // ADD THIS
return { data }
```

- [ ] **Step 3: Commit appointments update**

```bash
git add src/lib/actions/appointments.ts
git commit -m "feat: support pet_package_id in appointments

- Add pet_package_id parameter to createAppointment
- Validate and deduct pet package credits
- Set price to 0 when using package credit
- Revalidate packages path after appointment creation"
```

---

## Task 16: Seed Default Package Types

**Files:**
- Modify: `supabase/migrations/008_pet_packages.sql`

- [ ] **Step 1: Verify seed data exists in migration**

The migration file created in Task 1 should already include seed data. If not, add:

```sql
-- At the end of the migration file, add:
-- Seed default package types for all existing companies
INSERT INTO package_types (company_id, name, interval_days, credits, price)
SELECT id, 'Pacote Semanal', 7, 4, 120.00
FROM companies
ON CONFLICT DO NOTHING;

INSERT INTO package_types (company_id, name, interval_days, credits, price)
SELECT id, 'Pacote Quinzenal', 15, 8, 220.00
FROM companies
ON CONFLICT DO NOTHING;

INSERT INTO package_types (company_id, name, interval_days, credits, price)
SELECT id, 'Pacote Mensal', 30, 16, 400.00
FROM companies
ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: No commit needed if already in migration**

---

## Task 17: Add Packages Link to Navigation

**Files:**
- Modify: `src/components/layout/bottom-navigation.tsx` OR similar nav component

- [ ] **Step 1: Find navigation component**

```bash
# Find the navigation component
grep -r "agendamentos\|clientes\|pets" src/components/layout/
```

- [ ] **Step 2: Add packages link to navigation**

```tsx
// Add to the navigation items
<Link href="/app/pacotes" className="nav-item">
  <span>📦</span>
  <span>Pacotes</span>
</Link>
```

- [ ] **Step 3: Commit navigation update**

```bash
git add src/components/layout/
git commit -m "feat: add packages link to navigation"
```

---

## Task 18: Manual Testing & Verification

**Files:** None (manual testing)

- [ ] **Step 1: Run migration locally**

```bash
# Apply the migration to your local Supabase
supabase db push
```

- [ ] **Step 2: Test package types are seeded**

```bash
# Check in Supabase dashboard that package_types exist
# Should see: Pacote Semanal, Pacote Quinzenal, Pacote Mensal
```

- [ ] **Step 3: Test full flow manually**

1. Go to a pet detail page (`/app/pets/[id]`)
2. Click "Adicionar Pacote"
3. Select "Pacote Semanal"
4. Verify package card appears with correct credits
5. Create an appointment using the package credit
6. Verify credits decreased by 1
7. Use remaining credits until 0
8. Go to `/app/pacotes` - verify pet appears in exhausted list
9. Click WhatsApp button - verify it opens with correct message

- [ ] **Step 4: Commit any bug fixes found during testing**

```bash
git commit -m "fix: address issues found during manual testing"
```

---

## Completion Checklist

- [ ] All database migrations applied successfully
- [ ] Package types seeded for all companies
- [ ] Pet packages can be created via modal
- [ ] Package cards display correctly on pet pages
- [ ] Credits decrement when appointments use packages
- [ ] Exhausted packages appear on dashboard
- [ ] WhatsApp button opens with correct message
- [ ] Navigation includes packages link
- [ ] No console errors in browser
- [ ] All tests pass (if tests exist)

---

## Notes for Implementation

1. **RLS Testing**: After migration, verify RLS policies work correctly by testing with different company users

2. **Credit Decrement**: The `decrement_package_credits` function uses `SECURITY DEFINER` to bypass RLS for the update while still checking permissions

3. **Date Handling**: All dates are stored as DATE (not TIMESTAMP) in the database. Convert using `.toISOString().split('T')[0]` for consistency

4. **Revalidation**: Paths are revalidated after package creation/modification to ensure UI updates

5. **Error Messages**: All error messages are in Portuguese for consistency with the existing codebase

6. **Progress Bar**: Shows red when credits <= 25% for visual urgency indicator

7. **WhatsApp Link**: Uses Brazilian format (55 country code) - verify this matches your user's phone format

---

## Rollback Plan (If Issues Arise)

If critical issues are found after deployment:

```bash
# Rollback migration
supabase db reset --version 007  # Revert to migration 007

# Or specific rollback
supabase migration rollback --file 008_pet_packages.sql
```

Then revert code changes:
```bash
git revert HEAD~18  # Revert all commits from this plan
```
