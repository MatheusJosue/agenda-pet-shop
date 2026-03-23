# Clients CRUD Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build complete CRUD functionality for managing pet shop clients with multi-tenant isolation, search, and glassmorphism UI.

**Architecture:** Server Actions for data access, React Server Components for pages, client components for interactivity. All queries scoped to user's company via RLS + company_id filtering.

**Tech Stack:** Next.js 15, Supabase (PostgreSQL + RLS), TypeScript, Zod, Vitest, React Hooks

---

## Phase 1: Foundation (Types & Utilities)

### Task 1: Create Client Type Definitions

**Files:**
- Create: `src/lib/types/clients.ts`

- [ ] **Step 1: Create the type definitions file**

```typescript
// src/lib/types/clients.ts
export interface Client {
  id: string
  company_id: string
  name: string
  phone: string  // stored as digits only: "11987654321"
  email?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface ClientInput {
  name: string
  phone: string  // user enters formatted, we strip to digits
  email?: string
  notes?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types/clients.ts
git commit -m "feat: add client type definitions"
```

---

### Task 2: Create Security Utilities (XSS Prevention)

**Files:**
- Create: `src/lib/utils/security.ts`
- Test: `src/test/lib/utils/security.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/lib/utils/security.test.ts
import { describe, it, expect } from 'vitest'
import { escapeHtml } from '@/lib/utils/security'

describe('escapeHtml', () => {
  it('should escape ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should escape less than', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
  })

  it('should escape greater than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b')
  })

  it('should escape double quotes', () => {
    expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;')
  })

  it('should escape single quotes', () => {
    expect(escapeHtml("It's")).toBe('It&#x27;s')
  })

  it('should escape multiple special characters', () => {
    expect(escapeHtml('<div class="test">&nbsp;</div>'))
      .toBe('&lt;div class=&quot;test&quot;&gt;&amp;nbsp;&lt;/div&gt;')
  })

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('should handle string without special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/lib/utils/security.test.ts`
Expected: FAIL with "Cannot find module '@/lib/utils/security'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/utils/security.ts
/**
 * Escape HTML to prevent XSS attacks
 * Use when rendering user-generated content like notes
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/lib/utils/security.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/security.ts src/test/lib/utils/security.test.ts
git commit -m "feat: add XSS prevention utility"
```

---

### Task 3: Create Validation Utilities (UUID)

**Files:**
- Create: `src/lib/utils/validation.ts`
- Test: `src/test/lib/utils/validation.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/lib/utils/validation.test.ts
import { describe, it, expect } from 'vitest'
import { isValidUUID } from '@/lib/utils/validation'

describe('isValidUUID', () => {
  it('should validate valid UUID v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('should validate valid UUID with uppercase', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('should validate valid UUID with mixed case', () => {
    expect(isValidUUID('550e8400-E29b-41d4-A716-446655440000')).toBe(true)
  })

  it('should reject invalid format - missing dashes', () => {
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false)
  })

  it('should reject invalid format - random string', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false)
  })

  it('should reject empty string', () => {
    expect(isValidUUID('')).toBe(false)
  })

  it('should reject partial UUID', () => {
    expect(isValidUUID('550e8400-e29b')).toBe(false)
  })

  it('should reject UUID with invalid characters', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/lib/utils/validation.test.ts`
Expected: FAIL with "Cannot find module '@/lib/utils/validation'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/utils/validation.ts
/**
 * Validate UUID v4 format
 * Use to validate dynamic route parameters before database queries
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/lib/utils/validation.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/validation.ts src/test/lib/utils/validation.test.ts
git commit -m "feat: add UUID validation utility"
```

---

### Task 4: Create Phone Formatting Utilities

**Files:**
- Create: `src/lib/utils/phone.ts`
- Test: `src/test/lib/utils/phone.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/lib/utils/phone.test.ts
import { describe, it, expect } from 'vitest'
import { stripPhone, formatPhone, isValidPhone } from '@/lib/utils/phone'

describe('stripPhone', () => {
  it('should remove non-digit characters from formatted phone', () => {
    expect(stripPhone('(11) 98765-4321')).toBe('11987654321')
  })

  it('should handle phone with various separators', () => {
    expect(stripPhone('11.98765.4321')).toBe('11987654321')
    expect(stripPhone('11-98765-4321')).toBe('11987654321')
  })

  it('should handle phone with letters', () => {
    expect(stripPhone('(11) 9876-ABCD')).toBe('119876')
  })

  it('should return empty string for non-numeric input', () => {
    expect(stripPhone('ABC')).toBe('')
  })
})

describe('formatPhone', () => {
  it('should format 11-digit mobile phone', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('should format 10-digit landline', () => {
    expect(formatPhone('1123456789')).toBe('(11) 2345-6789')
  })

  it('should handle formatted input (idempotent)', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
  })

  it('should return original for invalid length', () => {
    expect(formatPhone('123')).toBe('123')
  })

  it('should return original for empty string', () => {
    expect(formatPhone('')).toBe('')
  })
})

describe('isValidPhone', () => {
  it('should validate 11-digit phone', () => {
    expect(isValidPhone('11987654321')).toBe(true)
    expect(isValidPhone('(11) 98765-4321')).toBe(true)
  })

  it('should validate 10-digit phone', () => {
    expect(isValidPhone('1123456789')).toBe(true)
    expect(isValidPhone('(11) 2345-6789')).toBe(true)
  })

  it('should reject phone with less than 10 digits', () => {
    expect(isValidPhone('123456789')).toBe(false)
  })

  it('should reject phone with more than 11 digits', () => {
    expect(isValidPhone('123456789012')).toBe(false)
  })

  it('should reject empty string', () => {
    expect(isValidPhone('')).toBe(false)
  })

  it('should reject non-numeric strings', () => {
    expect(isValidPhone('abcdefghij')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/lib/utils/phone.test.ts`
Expected: FAIL with "Cannot find module '@/lib/utils/phone'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/utils/phone.ts
/**
 * Strip non-digit characters from phone
 * "(11) 98765-4321" → "11987654321"
 */
export function stripPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Format phone digits to Brazilian mask
 * "11987654321" → "(11) 98765-4321"
 */
export function formatPhone(digits: string): string {
  const cleaned = stripPhone(digits)

  if (cleaned.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  } else if (cleaned.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }

  return digits // Return original if format doesn't match
}

/**
 * Validate phone has 10-11 digits
 */
export function isValidPhone(phone: string): boolean {
  const digits = stripPhone(phone)
  return /^\d{10,11}$/.test(digits)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/lib/utils/phone.test.ts`
Expected: PASS (17 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/phone.ts src/test/lib/utils/phone.test.ts
git commit -m "feat: add phone formatting utilities"
```

---

### Task 5: Create useDebounce Hook

**Files:**
- Create: `src/lib/hooks/use-debounce.ts`
- Test: `src/test/lib/hooks/use-debounce.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/lib/hooks/use-debounce.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from '@/lib/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300))
    expect(result.current).toBe('test')
  })

  it('should update value after delay', async () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value, 300),
      { initialProps: 'initial' }
    )

    rerender('updated')

    // Should still be initial before delay
    expect(result.current).toBe('initial')

    // Fast-forward past delay
    vi.advanceTimersByTime(300)

    // Should update after delay
    expect(result.current).toBe('updated')
  })

  it('should reset timer on value change', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value, 300),
      { initialProps: 'initial' }
    )

    rerender('first')
    vi.advanceTimersByTime(200)
    rerender('second')
    vi.advanceTimersByTime(200)

    // Should not have updated (only 200ms since last change)
    expect(result.current).toBe('initial')

    // Fast-forward the remaining time
    vi.advanceTimersByTime(100)

    // Now it should update
    expect(result.current).toBe('second')
  })

  it('should use default delay of 300ms', async () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value),
      { initialProps: 'initial' }
    )

    rerender('updated')
    vi.advanceTimersByTime(299)
    expect(result.current).toBe('initial')
    vi.advanceTimersByTime(1)
    expect(result.current).toBe('updated')
  })

  it('should cleanup timer on unmount', () => {
    const { rerender, unmount } = renderHook(
      (value: string) => useDebounce(value, 300),
      { initialProps: 'initial' }
    )

    rerender('updated')
    unmount()
    vi.advanceTimersByTime(300)

    // No error should be thrown
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/lib/hooks/use-debounce.test.tsx`
Expected: FAIL with "Cannot find module '@/lib/hooks/use-debounce'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/hooks/use-debounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/lib/hooks/use-debounce.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/hooks/use-debounce.ts src/test/lib/hooks/use-debounce.test.tsx
git commit -m "feat: add useDebounce hook"
```

---

## Phase 2: Server Actions

### Task 6: Create Clients Server Actions

**Files:**
- Create: `src/lib/actions/clients.ts`
- Test: `src/test/lib/actions/clients.test.ts`

- [ ] **Step 1: Write the failing test skeleton**

```typescript
// src/test/lib/actions/clients.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  checkClientAppointments,
  deleteClient
} from '@/lib/actions/clients'

vi.mock('@/lib/supabase/server')

describe('Clients Server Actions', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe('getClients', () => {
    it('should return empty array if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await getClients()

      expect(result).toEqual({ data: [], error: undefined })
    })

    it('should return company-scoped clients', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }
      const mockClients = [
        { id: 'client-1', name: 'João Silva', phone: '11987654321' }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockSupabase.from.mockReturnThis()
      mockSupabase.select.mockReturnThis()
      mockSupabase.eq.mockResolvedValue({ data: mockUserData, error: null })
      mockSupabase.order.mockResolvedValue({ data: mockClients, error: null })

      const result = await getClients()

      expect(result.data).toEqual(mockClients)
    })

    it('should filter by search term', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockSupabase.from.mockReturnThis()
      mockSupabase.select.mockReturnThis()
      mockSupabase.eq.mockResolvedValue({ data: mockUserData, error: null })
      mockSupabase.or.mockReturnThis()
      mockSupabase.order.mockResolvedValue({ data: [], error: null })

      await getClients('João')

      expect(mockSupabase.or).toHaveBeenCalledWith(
        'name.ilike.%João%,phone.ilike.%João%,email.ilike.%João%'
      )
    })
  })

  describe('getClientById', () => {
    it('should return error if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await getClientById('client-123')

      expect(result).toEqual({ data: undefined, error: 'Não autenticado' })
    })

    it('should return client from same company', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }
      const mockClient = {
        id: 'client-1',
        company_id: 'company-123',
        name: 'João Silva',
        phone: '11987654321'
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockSupabase.from.mockReturnThis()
      mockSupabase.select.mockReturnThis()
      mockSupabase.eq.mockResolvedValue({ data: mockUserData, error: null })
      mockSupabase.single.mockResolvedValue({ data: mockClient, error: null })

      const result = await getClientById('client-1')

      expect(result.data).toEqual(mockClient)
    })
  })

  describe('createClient', () => {
    it('should create client with stripped phone', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }
      const mockClient = {
        id: 'client-1',
        name: 'João Silva',
        phone: '11987654321'
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockSupabase.from.mockReturnThis()
      mockSupabase.select.mockResolvedValue({ data: mockUserData, error: null })
      mockSupabase.insert.mockReturnThis()
      mockSupabase.single.mockResolvedValue({ data: mockClient, error: null })

      const result = await createClient({
        name: 'João Silva',
        phone: '(11) 98765-4321',
        email: 'joao@email.com'
      })

      expect(result.data?.phone).toBe('11987654321')
    })
  })

  describe('checkClientAppointments', () => {
    it('should return count of future appointments', async () => {
      mockSupabase.from.mockReturnThis()
      mockSupabase.select.mockReturnThis()
      mockSupabase.eq.mockResolvedValue({
        data: [{ count: 3 }],
        error: null
      })

      const count = await checkClientAppointments('client-123')

      expect(count).toBe(3)
    })
  })

  describe('deleteClient', () => {
    it('should prevent deletion with future appointments', async () => {
      // Mock checkClientAppointments
      const originalCheck = checkClientAppointments
      global.checkClientAppointments = vi.fn().mockResolvedValue(2)

      const result = await deleteClient('client-123')

      expect(result.error).toContain('agendamentos futuros')

      global.checkClientAppointments = originalCheck
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/lib/actions/clients.test.ts`
Expected: FAIL with "Cannot find module '@/lib/actions/clients'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/actions/clients.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validation/clients'
import { stripPhone } from '@/lib/utils/phone'
import type { Client, ClientInput } from '@/lib/types/clients'

export interface ClientResponse {
  data?: Client
  error?: string
}

export interface ClientsListResponse {
  data?: Client[]
  error?: string
}

// Helper: Get company_id from authenticated user session
async function getCurrentCompanyId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  return userData?.company_id || null
}

/**
 * Get all clients for the current user's company
 * Optional search filters by name, phone, or email
 */
export async function getClients(search?: string): Promise<ClientsListResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { data: [] }
  }

  const supabase = await createClient()

  let query = supabase
    .from('clients')
    .select('*')
    .eq('company_id', companyId)

  if (search && search.trim()) {
    const searchTerm = search.trim()
    query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: 'Erro ao buscar clientes' }
  }

  return { data: data || [] }
}

/**
 * Get a single client by ID
 * Verifies the client belongs to the user's company
 */
export async function getClientById(id: string): Promise<ClientResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error || !data) {
    return { error: 'Cliente não encontrado' }
  }

  return { data }
}

/**
 * Create a new client
 * Phone is stripped to digits before storing
 */
export async function createClient(input: ClientInput): Promise<ClientResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  // Validate input
  const validatedFields = clientSchema.safeParse(input)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const supabase = await createClient()

  // Strip phone to digits only
  const phoneDigits = stripPhone(input.phone)

  const { data, error } = await supabase
    .from('clients')
    .insert({
      company_id: companyId,
      name: validatedFields.data.name,
      phone: phoneDigits,
      email: validatedFields.data.email || null,
      notes: validatedFields.data.notes || null
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar cliente' }
  }

  revalidatePath('/app/clientes')
  return { data }
}

/**
 * Update an existing client
 * Verifies the client belongs to the user's company
 */
export async function updateClient(id: string, input: ClientInput): Promise<ClientResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  // Validate input
  const validatedFields = clientSchema.safeParse(input)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const supabase = await createClient()

  // Strip phone to digits only
  const phoneDigits = stripPhone(input.phone)

  const { data, error } = await supabase
    .from('clients')
    .update({
      name: validatedFields.data.name,
      phone: phoneDigits,
      email: validatedFields.data.email || null,
      notes: validatedFields.data.notes || null
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao atualizar cliente' }
  }

  if (!data) {
    return { error: 'Cliente não encontrado' }
  }

  revalidatePath('/app/clientes')
  revalidatePath(`/app/clientes/${id}`)
  return { data }
}

/**
 * Count future appointments for a client
 * Used to validate deletion
 */
export async function checkClientAppointments(clientId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact' })
    .eq('client_id', clientId)
    .gte('date', new Date().toISOString())

  if (error) {
    return 0
  }

  return data?.length || 0
}

/**
 * Delete a client
 * Prevents deletion if client has future appointments
 */
export async function deleteClient(id: string): Promise<ClientResponse> {
  const companyId = await getCurrentCompanyId()

  if (!companyId) {
    return { error: 'Não autenticado' }
  }

  // Check for future appointments
  const appointmentCount = await checkClientAppointments(id)

  if (appointmentCount > 0) {
    return {
      error: `Não é possível excluir cliente com ${appointmentCount} agendamento(s) futuro(s)`
    }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: 'Erro ao excluir cliente' }
  }

  revalidatePath('/app/clientes')
  return { data: undefined }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/lib/actions/clients.test.ts`
Expected: PASS (10+ tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/clients.ts src/test/lib/actions/clients.test.ts
git commit -m "feat: add clients server actions"
```

---

## Phase 3: UI Components

### Task 7: Create Dialog Component

**Files:**
- Create: `src/components/ui/dialog.tsx`
- Test: `src/test/components/ui/dialog.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/components/ui/dialog.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dialog } from '@/components/ui/dialog'

describe('Dialog', () => {
  it('should not render when open is false', () => {
    render(
      <Dialog open={false} onOpenChange={vi.fn()} title="Test">
        <div>Content</div>
      </Dialog>
    )

    expect(screen.queryByText('Test')).not.toBeInTheDocument()
  })

  it('should render when open is true', () => {
    render(
      <Dialog open={true} onOpenChange={vi.fn()} title="Test Dialog">
        <div>Dialog Content</div>
      </Dialog>
    )

    expect(screen.queryByText('Test Dialog')).toBeInTheDocument()
    expect(screen.queryByText('Dialog Content')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(
      <Dialog open={true} onOpenChange={vi.fn()} title="Test" description="Test description">
        <div>Content</div>
      </Dialog>
    )

    expect(screen.queryByText('Test description')).toBeInTheDocument()
  })

  it('should render footer when provided', () => {
    render(
      <Dialog
        open={true}
        onOpenChange={vi.fn()}
        title="Test"
        footer={<button>Footer Button</button>}
      >
        <div>Content</div>
      </Dialog>
    )

    expect(screen.queryByText('Footer Button')).toBeInTheDocument()
  })

  it('should call onOpenChange when clicking backdrop', () => {
    const handleChange = vi.fn()

    render(
      <Dialog open={true} onOpenChange={handleChange} title="Test">
        <div>Content</div>
      </Dialog>
    )

    const backdrop = screen.getByTestId('dialog-backdrop')
    fireEvent.click(backdrop)

    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it('should call onOpenChange with false when Escape key pressed', () => {
    const handleChange = vi.fn()

    render(
      <Dialog open={true} onOpenChange={handleChange} title="Test">
        <div>Content</div>
      </Dialog>
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(handleChange).toHaveBeenCalledWith(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/components/ui/dialog.test.tsx`
Expected: FAIL with "Cannot find module '@/components/ui/dialog'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/components/ui/dialog.tsx
'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer
}: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <div
      data-testid="dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          {description && (
            <p className="text-white/70 mb-4">{description}</p>
          )}
          <div className="text-white">
            {children}
          </div>
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/components/ui/dialog.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/dialog.tsx src/test/components/ui/dialog.test.tsx
git commit -m "feat: add Dialog component"
```

---

### Task 8: Create ClientSearchBar Component

**Files:**
- Create: `src/components/clients/client-search-bar.tsx`
- Test: `src/test/components/clients/client-search-bar.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/components/clients/client-search-bar.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ClientSearchBar } from '@/components/clients/client-search-bar'

describe('ClientSearchBar', () => {
  it('should render search input', () => {
    render(<ClientSearchBar value="" onChange={vi.fn()} />)

    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
  })

  it('should call onChange when input changes', () => {
    const handleChange = vi.fn()

    render(<ClientSearchBar value="" onChange={handleChange} />)

    const input = screen.getByPlaceholderText(/buscar/i)
    fireEvent.change(input, { target: { value: 'João' } })

    expect(handleChange).toHaveBeenCalledWith('João')
  })

  it('should display current value', () => {
    render(<ClientSearchBar value="Test Search" onChange={vi.fn()} />)

    const input = screen.getByPlaceholderText(/buscar/i) as HTMLInputElement
    expect(input.value).toBe('Test Search')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/components/clients/client-search-bar.test.tsx`
Expected: FAIL with "Cannot find module '@/components/clients/client-search-bar'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/components/clients/client-search-bar.tsx
'use client'

import { Input } from '@/components/ui/input'

export interface ClientSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function ClientSearchBar({ value, onChange }: ClientSearchBarProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Buscar cliente..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          aria-label="Limpar busca"
        >
          ✕
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/components/clients/client-search-bar.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/clients/client-search-bar.tsx src/test/components/clients/client-search-bar.test.tsx
git commit -m "feat: add ClientSearchBar component"
```

---

### Task 9: Create ClientSkeleton Component

**Files:**
- Create: `src/components/clients/client-list-skeleton.tsx`

- [ ] **Step 1: Create the skeleton component**

```typescript
// src/components/clients/client-list-skeleton.tsx
import { GlassCard } from '@/components/ui/glass-card'

export function ClientListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <GlassCard key={i} variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-white/10 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
              <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/clients/client-list-skeleton.tsx
git commit -m "feat: add ClientListSkeleton component"
```

---

### Task 10: Create ClientCard Component

**Files:**
- Create: `src/components/clients/client-card.tsx`
- Test: `src/test/components/clients/client-card.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/components/clients/client-card.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ClientCard } from '@/components/clients/client-card'
import type { Client } from '@/lib/types/clients'

describe('ClientCard', () => {
  const mockClient: Client = {
    id: 'client-1',
    company_id: 'company-1',
    name: 'João Silva',
    phone: '11987654321',
    email: 'joao@email.com',
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }

  it('should render client name', () => {
    render(<ClientCard client={mockClient} onDelete={vi.fn()} />)

    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('should format phone number', () => {
    render(<ClientCard client={mockClient} onDelete={vi.fn()} />)

    expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument()
  })

  it('should render email when provided', () => {
    render(<ClientCard client={mockClient} onDelete={vi.fn()} />)

    expect(screen.getByText('joao@email.com')).toBeInTheDocument()
  })

  it('should not render email when null', () => {
    const clientWithoutEmail = { ...mockClient, email: null }

    render(<ClientCard client={clientWithoutEmail} onDelete={vi.fn()} />)

    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
  })

  it('should navigate to details page on card click', () => {
    render(<ClientCard client={mockClient} onDelete={vi.fn()} />, {
      wrapper: ({ children }) => (
        <div>{children}</div>
      )
    })

    const card = screen.getByText('João Silva').closest('div')
    expect(card).toHaveAttribute('href', '/app/clientes/client-1')
  })

  it('should call onDelete when delete button clicked', () => {
    const handleDelete = vi.fn()

    render(<ClientCard client={mockClient} onDelete={handleDelete} />)

    const deleteButton = screen.getByLabelText(/excluir/i)
    fireEvent.click(deleteButton)

    expect(handleDelete).toHaveBeenCalledWith('client-1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/components/clients/client-card.test.tsx`
Expected: FAIL with "Cannot find module '@/components/clients/client-card'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/components/clients/client-card.tsx
'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { formatPhone } from '@/lib/utils/phone'
import type { Client } from '@/lib/types/clients'

export interface ClientCardProps {
  client: Client
  onDelete: (id: string) => void
}

export function ClientCard({ client, onDelete }: ClientCardProps) {
  return (
    <Link href={`/app/clientes/${client.id}`}>
      <GlassCard variant="default" className="p-4 hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-semibold">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{client.name}</h3>
                <p className="text-white/60 text-sm">{formatPhone(client.phone)}</p>
                {client.email && (
                  <p className="text-white/40 text-sm truncate">{client.email}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Link
              href={`/app/clientes/${client.id}/editar`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
              aria-label={`Editar ${client.name}`}
            >
              ✏️
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(client.id)
              }}
              className="p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
              aria-label={`Excluir ${client.name}`}
            >
              🗑️
            </button>
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/components/clients/client-card.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/clients/client-card.tsx src/test/components/clients/client-card.test.tsx
git commit -m "feat: add ClientCard component"
```

---

### Task 11: Create ClientDeleteDialog Component

**Files:**
- Create: `src/components/clients/client-delete-dialog.tsx`
- Test: `src/test/components/clients/client-delete-dialog.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/components/clients/client-delete-dialog.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClientDeleteDialog } from '@/components/clients/client-delete-dialog'
import { checkClientAppointments, deleteClient } from '@/lib/actions/clients'

vi.mock('@/lib/actions/clients')

describe('ClientDeleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open', () => {
    render(
      <ClientDeleteDialog
        open={true}
        onOpenChange={vi.fn()}
        clientId="client-1"
        clientName="João Silva"
      />
    )

    expect(screen.getByText(/João Silva/)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <ClientDeleteDialog
        open={false}
        onOpenChange={vi.fn()}
        clientId="client-1"
        clientName="João Silva"
      />
    )

    expect(screen.queryByText(/João Silva/)).not.toBeInTheDocument()
  })

  it('should check appointments on mount and show confirm if none', async () => {
    vi.mocked(checkClientAppointments).mockResolvedValue(0)

    render(
      <ClientDeleteDialog
        open={true}
        onOpenChange={vi.fn()}
        clientId="client-1"
        clientName="João Silva"
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Excluir/)).toBeInTheDocument()
    })
  })

  it('should show error message if client has appointments', async () => {
    vi.mocked(checkClientAppointments).mockResolvedValue(3)

    render(
      <ClientDeleteDialog
        open={true}
        onOpenChange={vi.fn()}
        clientId="client-1"
        clientName="João Silva"
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/3 agendamento/)).toBeInTheDocument()
    })

    expect(screen.queryByText('Excluir')).not.toBeInTheDocument()
  })

  it('should call deleteClient and close on confirm', async () => {
    vi.mocked(checkClientAppointments).mockResolvedValue(0)
    vi.mocked(deleteClient).mockResolvedValue({ data: undefined })
    const handleClose = vi.fn()

    render(
      <ClientDeleteDialog
        open={true}
        onOpenChange={handleClose}
        clientId="client-1"
        clientName="João Silva"
      />
    )

    await waitFor(() => {
      const confirmButton = screen.getByText('Excluir')
      fireEvent.click(confirmButton)
    })

    expect(deleteClient).toHaveBeenCalledWith('client-1')
    expect(handleClose).toHaveBeenCalledWith(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/components/clients/client-delete-dialog.test.tsx`
Expected: FAIL with "Cannot find module '@/components/clients/client-delete-dialog'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/components/clients/client-delete-dialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { checkClientAppointments, deleteClient } from '@/lib/actions/clients'
import { ClientListSkeleton } from './client-list-skeleton'

export interface ClientDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
}

export function ClientDeleteDialog({
  open,
  onOpenChange,
  clientId,
  clientName
}: ClientDeleteDialogProps) {
  const [appointmentCount, setAppointmentCount] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (open) {
      setAppointmentCount(null)
      checkClientAppointments(clientId).then(setAppointmentCount)
    }
  }, [open, clientId])

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteClient(clientId)

    if (result.error) {
      alert(result.error) // TODO: Use toast
    } else {
      onOpenChange(false)
      // Refresh the page to show updated list
      window.location.reload()
    }

    setIsDeleting(false)
  }

  const hasAppointments = appointmentCount !== null && appointmentCount > 0

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={hasAppointments ? 'Não é possível excluir' : 'Excluir cliente?'}
      description={hasAppointments
        ? `Este cliente possui ${appointmentCount} agendamento(s) futuro(s).`
        : `Tem certeza que deseja excluir ${clientName}?`
      }
      footer={
        appointmentCount === null ? (
          <div className="w-full flex justify-center">
            <ClientListSkeleton />
          </div>
        ) : hasAppointments ? (
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Fechar
          </Button>
        ) : (
          <>
            <Button onClick={() => onOpenChange(false)} variant="secondary">
              Cancelar
            </Button>
            <Button onClick={handleDelete} variant="primary" disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </>
        )
      }
    >
      {appointmentCount === null ? (
        <p className="text-white/60">Verificando agendamentos...</p>
      ) : hasAppointments ? (
        <p className="text-white/60">
          Remova os agendamentos primeiro ou cancele-os.
        </p>
      ) : (
        <p className="text-white/60">
          Esta ação não pode ser desfeita.
        </p>
      )}
    </Dialog>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/components/clients/client-delete-dialog.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/clients/client-delete-dialog.tsx src/test/components/clients/client-delete-dialog.test.tsx
git commit -m "feat: add ClientDeleteDialog component"
```

---

### Task 12: Create ClientForm Component

**Files:**
- Create: `src/components/clients/client-form.tsx`
- Test: `src/test/components/clients/client-form.test.tsx'

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/components/clients/client-form.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientForm } from '@/components/clients/client-form'
import { createClient, updateClient } from '@/lib/actions/clients'
import type { Client } from '@/lib/types/clients'

vi.mock('@/lib/actions/clients')

describe('ClientForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create mode', () => {
    it('should render all fields', () => {
      render(<ClientForm onSuccess={mockOnSuccess} />)

      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notas/i)).toBeInTheDocument()
    })

    it('should show validation errors for invalid input', async () => {
      render(<ClientForm onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/mínimo 3 caracteres/i)).toBeInTheDocument()
      })
    })

    it('should submit with valid data', async () => {
      vi.mocked(createClient).mockResolvedValue({
        data: { id: 'new-id', name: 'Test', phone: '123' } as Client
      })

      render(<ClientForm onSuccess={mockOnSuccess} />)

      await userEvent.type(screen.getByLabelText(/nome/i), 'João Silva')
      await userEvent.type(screen.getByLabelText(/telefone/i), '11987654321')
      await userEvent.type(screen.getByLabelText(/email/i), 'joao@email.com')

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(createClient).toHaveBeenCalled()
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('edit mode', () => {
    const mockClient: Client = {
      id: 'client-1',
      company_id: 'company-1',
      name: 'João Silva',
      phone: '11987654321',
      email: 'joao@email.com',
      notes: 'Test notes',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }

    it('should pre-fill form with client data', () => {
      render(<ClientForm client={mockClient} onSuccess={mockOnSuccess} />)

      expect(screen.getByLabelText(/nome/i)).toHaveValue('João Silva')
      expect(screen.getByLabelText(/telefone/i)).toHaveValue('(11) 98765-4321')
      expect(screen.getByLabelText(/email/i)).toHaveValue('joao@email.com')
      expect(screen.getByLabelText(/notas/i)).toHaveValue('Test notes')
    })

    it('should call updateClient on submit', async () => {
      vi.mocked(updateClient).mockResolvedValue({
        data: mockClient
      })

      render(<ClientForm client={mockClient} onSuccess={mockOnSuccess} />)

      const nameInput = screen.getByLabelText(/nome/i)
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'Updated Name')

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(updateClient).toHaveBeenCalledWith('client-1', expect.any(Object))
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/components/clients/client-form.test.tsx`
Expected: FAIL with "Cannot find module '@/components/clients/client-form'"

- [ ] **Step 3: Write the implementation**

```typescript
// src/components/clients/client-form.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema } from '@/lib/validation/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { createClient, updateClient } from '@/lib/actions/clients'
import { formatPhone, stripPhone } from '@/lib/utils/phone'
import type { Client, ClientInput } from '@/lib/types/clients'

export interface ClientFormProps {
  client?: Client
  onSuccess: () => void
  onCancel?: () => void
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      notes: ''
    }
  })

  // Pre-fill form in edit mode
  useEffect(() => {
    if (client) {
      setValue('name', client.name)
      setValue('phone', formatPhone(client.phone))
      setValue('email', client.email || '')
      setValue('notes', client.notes || '')
    }
  }, [client, setValue])

  // Phone input masking
  const phoneValue = watch('phone')
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = stripPhone(e.target.value)
    let formatted = ''

    if (digits.length > 0) {
      formatted = `(${digits.substring(0, 2)}`
    }
    if (digits.length > 2) {
      formatted += `) ${digits.substring(2, 7)}`
    }
    if (digits.length > 7) {
      formatted += `-${digits.substring(7, 11)}`
    }

    setValue('phone', formatted, { shouldValidate: true })
  }

  const onSubmit = async (data: ClientInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = client
        ? await updateClient(client.id, data)
        : await createClient(data)

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    } catch {
      setError('Algo deu errado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isDirty && onCancel) {
      if (confirm('Descartar alterações?')) {
        onCancel()
      }
    }
  }

  return (
    <GlassCard variant="default" className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-white/80 mb-2">
              Nome *
            </label>
            <Input
              id="name"
              type="text"
              {...register('name')}
              className="w-full"
              autoFocus
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-white/80 mb-2">
              Telefone *
            </label>
            <Input
              id="phone"
              type="tel"
              value={phoneValue}
              onChange={handlePhoneChange}
              placeholder="(11) 98765-4321"
              className="w-full"
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-white/80 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="cliente@email.com"
              className="w-full"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-white/80 mb-2">
              Notas
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={4}
              maxLength={500}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Informações adicionais sobre o cliente..."
            />
            {errors.notes && (
              <p className="text-red-400 text-sm mt-1">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="secondary"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Salvando...' : client ? 'Atualizar' : 'Criar Cliente'}
            </Button>
          </div>
        </div>
      </form>
    </GlassCard>
    )
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/components/clients/client-form.test.tsx`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/clients/client-form.tsx src/test/components/clients/client-form.test.tsx
git commit -m "feat: add ClientForm component"
```

---

## Phase 4: Pages

### Task 13: Create Client List Page

**Files:**
- Modify: `src/app/(app)/app/clientes/page.tsx`

- [ ] **Step 1: Refactor the existing list page**

```typescript
// src/app/(app)/app/clientes/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { getClients } from '@/lib/actions/clients'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { ClientSearchBar } from '@/components/clients/client-search-bar'
import { ClientCard } from '@/components/clients/client-card'
import { ClientListSkeleton } from '@/components/clients/client-list-skeleton'
import { ClientDeleteDialog } from '@/components/clients/client-delete-dialog'
import { useState } from 'react'

async function ClientList({ search }: { search?: string }) {
  const { data: clients } = await getClients(search)

  if (!clients || clients.length === 0) {
    return (
      <GlassCard variant="default" className="p-12 text-center">
        <div className="text-6xl mb-4">
          {search ? '🔍' : '👥'}
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          {search ? 'Nenhum resultado encontrado' : 'Nenhum cliente cadastrado'}
        </h2>
        <p className="text-white/60 mb-6">
          {search
            ? 'Tente buscar por outro termo'
            : 'Comece adicionando seu primeiro cliente'}
        </p>
        {search ? (
          <Link href="/app/clientes">
            <Button variant="secondary">Limpar busca</Button>
          </Link>
        ) : (
          <Link href="/app/clientes/novo">
            <Button variant="primary">+ Adicionar Cliente</Button>
          </Link>
        )}
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onDelete={(id) => setDeleteClient({ id, name: client.name })}
        />
      ))}
    </div>
  )
}

function ClientListContent() {
  const [search, setSearch] = useState('')
  const [deleteClient, setDeleteClient] = useState<{ id: string; name: string } | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-800/20 to-purple-900/20">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/app" className="text-white/60 hover:text-white transition-colors">
            ← Voltar ao Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
            <p className="text-white/70">Gerencie seus clientes</p>
          </div>
          <Link href="/app/clientes/novo">
            <Button variant="primary" size="lg">
              + Novo Cliente
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <ClientSearchBar value={search} onChange={setSearch} />
        </div>

        <Suspense fallback={<ClientListSkeleton />}>
          <ClientList search={search} />
        </Suspense>

        {deleteClient && (
          <ClientDeleteDialog
            open={!!deleteClient}
            onOpenChange={() => setDeleteClient(null)}
            clientId={deleteClient.id}
            clientName={deleteClient.name}
          />
        )}
      </main>
    </div>
  )
}

export default function ClientesPage() {
  return <ClientListContent />
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/app/clientes/page.tsx
git commit -m "feat: implement client list page with search"
```

---

### Task 14: Create New Client Page

**Files:**
- Create: `src/app/(app)/app/clientes/novo/page.tsx`

- [ ] **Step 1: Create the new client page**

```typescript
// src/app/(app)/app/clientes/novo/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClientForm } from '@/components/clients/client-form'

export default function NovoClientePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-800/20 to-purple-900/20">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/app/clientes" className="text-white/60 hover:text-white transition-colors">
            ← Voltar aos Clientes
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Novo Cliente</h1>
          <p className="text-white/70">Cadastre um novo cliente no sistema</p>
        </div>

        <ClientForm onSuccess={() => router.push('/app/clientes')} />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/app/clientes/novo/page.tsx"
git commit -m "feat: add new client page"
```

---

### Task 15: Create Client Details Page

**Files:**
- Create: `src/app/(app)/app/clientes/[id]/page.tsx`

- [ ] **Step 1: Create the client details page**

```typescript
// src/app/(app)/app/clientes/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isValidUUID } from '@/lib/utils/validation'
import { getClientById } from '@/lib/actions/clients'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { formatPhone } from '@/lib/utils/phone'
import { escapeHtml } from '@/lib/utils/security'

export default async function ClienteDetalhesPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Validate UUID format
  if (!isValidUUID(id)) {
    notFound()
  }

  const { data: client } = await getClientById(id)

  if (!client) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-800/20 to-purple-900/20">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/app/clientes" className="text-white/60 hover:text-white transition-colors">
            ← Voltar aos Clientes
          </Link>
          <Link href={`/app/clientes/${id}/editar`}>
            <Button variant="primary" size="md">
              Editar
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{client.name}</h1>
          <p className="text-white/70">Detalhes do cliente</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Info */}
          <GlassCard variant="default" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Informações</h2>

            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm">Telefone</p>
                <p className="text-white text-lg">{formatPhone(client.phone)}</p>
              </div>

              {client.email && (
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <p className="text-white text-lg">{client.email}</p>
                </div>
              )}

              {client.notes && (
                <div>
                  <p className="text-white/60 text-sm">Notas</p>
                  <p
                    className="text-white text-lg whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: escapeHtml(client.notes) }}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-white/10 text-white/40 text-sm">
                <p>Cadastrado em: {new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </GlassCard>

          {/* Related Data (placeholder for future) */}
          <div className="space-y-6">
            <GlassCard variant="default" className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Pets</h2>
              <p className="text-white/60 mb-4">Este cliente ainda não tem pets cadastrados.</p>
              <Button variant="secondary" size="md" disabled>
                + Adicionar Pet
              </Button>
            </GlassCard>

            <GlassCard variant="default" className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Agendamentos</h2>
              <p className="text-white/60 mb-4">Nenhum agendamento encontrado.</p>
              <Link href="/app/agendamentos/novo">
                <Button variant="secondary" size="md">
                  + Novo Agendamento
                </Button>
              </Link>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/app/clientes/[id]/page.tsx"
git commit -m "feat: add client details page"
```

---

### Task 16: Create Client Edit Page

**Files:**
- Create: `src/app/(app)/app/clientes/[id]/editar/page.tsx`

- [ ] **Step 1: Create the edit page**

```typescript
// src/app/(app)/app/clientes/[id]/editar/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { isValidUUID } from '@/lib/utils/validation'
import { getClientById } from '@/lib/actions/clients'
import { ClientForm } from '@/components/clients/client-form'
import { ClientListSkeleton } from '@/components/clients/client-list-skeleton'
import type { Client } from '@/lib/types/clients'

export default function EditarClientePage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const id = params.id as string

  useEffect(() => {
    if (!isValidUUID(id)) {
      setError('Cliente não encontrado')
      setIsLoading(false)
      return
    }

    getClientById(id).then((result) => {
      if (result.error || !result.data) {
        setError(result.error || 'Cliente não encontrado')
      } else {
        setClient(result.data)
      }
      setIsLoading(false)
    })
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-800/20 to-purple-900/20">
        <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/app/clientes" className="text-white/60 hover:text-white transition-colors">
              ← Voltar aos Clientes
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ClientListSkeleton />
        </main>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-800/20 to-purple-900/20">
        <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/app/clientes" className="text-white/60 hover:text-white transition-colors">
              ← Voltar aos Clientes
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-white mb-2">Erro</h1>
            <p className="text-white/60 mb-6">{error || 'Cliente não encontrado'}</p>
            <Link href="/app/clientes">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Voltar à lista
              </button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-800/20 to-purple-900/20">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/app/clientes/${id}`} className="text-white/60 hover:text-white transition-colors">
            ← Voltar ao Cliente
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Editar Cliente</h1>
          <p className="text-white/70">Atualize as informações do cliente</p>
        </div>

        <ClientForm
          client={client}
          onSuccess={() => router.push(`/app/clientes/${id}`)}
          onCancel={() => router.push(`/app/clientes/${id}`)}
        />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/app/clientes/[id]/editar/page.tsx"
git commit -m "feat: add client edit page"
```

---

## Phase 5: Final Verification

### Task 17: Run All Tests and Verify Build

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass (80%+ coverage)

- [ ] **Step 2: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds

- [ ] **Step 4: Manual verification checklist**

1. [ ] Navigate to `/app/clientes` - should show list
2. [ ] Search for client - should filter results
3. [ ] Click "+ Novo Cliente" - should open form
4. [ ] Create client with valid data - should succeed
5. [ ] Try to create with invalid data - should show errors
6. [ ] Click client card - should open details
7. [ ] Click "Editar" - should open edit form
8. [ ] Update client - should persist changes
9. [ ] Try to delete client with no appointments - should succeed
10. [ ] Verify phone formatting in display

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete clients CRUD implementation

- All CRUD operations working
- Search and filtering functional
- Multi-tenant isolation via company_id
- XSS prevention on notes field
- Phone formatting (store digits, display masked)
- UUID validation on dynamic routes
- Delete protection for clients with appointments
- 80%+ test coverage achieved

Success criteria met:
✅ Create, read, update, delete clients
✅ Search by name/phone/email
✅ Details page with client info
✅ Empty states for no clients and no search results
✅ All actions scoped to user's company
✅ Phone number formatted correctly
✅ Validation on all inputs

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Summary

**Total Tasks:** 17
**Total Files Created:** ~25
**Total Files Modified:** 1
**Estimated Lines of Code:** ~1,500

**Order of Implementation:**
1. Foundation (Types & Utilities) - 5 tasks
2. Server Actions - 1 task
3. UI Components - 6 tasks
4. Pages - 4 tasks
5. Verification - 1 task

**Key Patterns Used:**
- TDD: Write test first, then implementation
- Small commits: Each task ends with a commit
- Utilities before features: phone, validation, security
- Server Actions before UI: data layer first
- Components before pages: reusable building blocks
