# Clients CRUD - Design Specification

**Date:** 2026-03-21
**Author:** Claude via Happy
**Status:** Draft

## Overview

Complete CRUD (Create, Read, Update, Delete) functionality for Clients in the Agenda Pet Shop system. This module enables pet shop companies to manage their customer base with a modern, glassmorphism UI.

## Goals

1. Enable companies to manage their clients (name, phone, email, notes)
2. Provide real-time search and filtering
3. Maintain multi-tenant isolation (company-scoped data)
4. Prepare for future features (pets per client, appointment history)
5. Achieve 80%+ test coverage

## Non-Goals

- Client analytics/reporting (future feature)
- Client import/export (future feature)
- Client notifications/communications (future feature)

## Architecture

### File Structure

```
src/
├── lib/actions/
│   └── clients.ts                    # Server actions for CRUD
├── lib/types/
│   └── clients.ts                    # Client type definitions
├── app/(app)/app/clientes/
│   ├── page.tsx                      # Client list (refactor existing)
│   ├── novo/
│   │   └── page.tsx                  # Create new client
│   └── [id]/
│       ├── page.tsx                  # Client details view
│       └── editar/
│           └── page.tsx              # Edit client
├── components/
│   ├── ui/
│   │   └── dialog.tsx                # Modal/Dialog component (NEW)
│   └── clients/
│       ├── client-card.tsx           # Single client card component
│       ├── client-form.tsx           # Reusable form component
│       ├── client-search-bar.tsx     # Search with real-time filtering
│       ├── client-list-skeleton.tsx  # Loading state
│       └── client-delete-dialog.tsx  # Delete confirmation modal
└── test/
    ├── lib/actions/clients.test.ts   # Server actions tests
    └── components/clients/           # Component tests
```

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│ Server Action│────▶│  Supabase   │
│ (Component) │◀────│   (clients)  │◀────│   (RLS)     │
└─────────────┘     └──────────────┘     └─────────────┘
```

**Security:** All database operations use Row Level Security (RLS) with `company_id` to ensure multi-tenant isolation.

## Type Definitions

```typescript
// lib/types/clients.ts
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

## Components

### 0. Dialog Component (`components/ui/dialog.tsx`) - NEW

**Purpose:** Reusable modal/dialog for confirmations and forms

**API:**
```typescript
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}
```

### 1. Server Actions (`lib/actions/clients.ts`)

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validation/clients'
import { escapeHtml } from '@/lib/utils/security'

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

// Core operations
export async function getClients(search?: string): ClientsListResponse
export async function getClientById(id: string): ClientResponse
export async function createClient(input: ClientInput): ClientResponse
export async function updateClient(id: string, input: ClientInput): ClientResponse
export async function checkClientAppointments(id: string): Promise<number>
export async function deleteClient(id: string): ClientResponse
```

**Session Validation Pattern (used in all actions):**
```typescript
const companyId = await getCurrentCompanyId()
if (!companyId) {
  return { error: 'Não autenticado' }
}
// Use companyId in all queries
```

**XSS Prevention for Notes Field:**
- Store raw notes in database (escaped at display time)
- Use `escapeHtml()` when rendering notes in UI
- Validate max length (500 chars) via Zod schema

**Validation:** Uses existing `clientSchema` from `@/lib/validation/clients`

**Phone handling:**
- Input: User enters formatted `(11) 98765-4321`
- Strip: Remove non-digits before storing: `11987654321`
- Display: Format back to `(XX) XXXXX-XXXX` in UI

**Security:**
- All queries filter by `company_id` from user session (via `getCurrentCompanyId()`)
- RLS policies enforce company-scoped access at database level
- Returns error if client doesn't belong to user's company
- `checkClientAppointments` queries future appointments before allowing delete
- Notes field sanitized at display time to prevent XSS
- No duplicate validation enforced (allow same phone/email for different clients)

### 2. Client List Page (`app/(app)/app/clientes/page.tsx`)

**Features:**
- Real-time search (debounce 300ms via custom hook `useDebounce`)
- GlassCard-based client list
- Empty state with call-to-action (different for "no clients" vs "no search results")
- Skeleton loading while fetching

**Search Scope:** Name, phone, email (ILIKE query)

**Empty States:**

| Scenario                | Icon | Message                     | Action         |
|-------------------------|------|-----------------------------|----------------|
| No clients exist        | 👥   | "Nenhum cliente cadastrado" | "Adicionar"    |
| Search has no results   | 🔍   | "Nenhum resultado encontrado" | "Limpar busca" |

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Back    Clientes      [+ Novo]   │
├─────────────────────────────────────┤
│  🔍 [Buscar cliente...]            │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  👤 João Silva      ✏️  🗑️  │  │
│  │  📱 (11) 98765-4321           │  │
│  │  ✉️ joao@email.com            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Pagination:** None for MVP (assume <100 clients). Add cursor-based pagination in future enhancement.

### 3. Client Card Component (`components/clients/client-card.tsx`)

**Props:**
```typescript
interface ClientCardProps {
  client: Client
  onDelete: (id: string) => void  // opens delete dialog
}
```

**Behavior:**
- Click card body → navigate to `/app/clientes/[id]` (details page)
- Click edit button → navigate to `/app/clientes/[id]/editar` (edit page)
- Click delete button → trigger `onDelete` callback

**Display formatting:**
- Phone: Format from digits to `(XX) XXXXX-XXXX` via `formatPhone()` utility
- Email: Hide line if not provided

### 4. Client Form (`components/clients/client-form.tsx`)

**Props:**
```typescript
interface ClientFormProps {
  client?: Client  // if provided, form is in edit mode
  onSuccess: () => void  // callback after successful submit
  onCancel?: () => void  // optional cancel action
}
```

**Fields:**
| Field    | Type      | Required | Validation                     |
|----------|-----------|----------|--------------------------------|
| name     | text      | Yes      | min 3 characters               |
| phone    | tel       | Yes      | 10-11 digits (stripped)        |
| email    | email     | No       | Valid email format if provided |
| notes    | textarea  | No       | max 500 characters             |

**Features:**
- Phone input: Auto-mask as `(XX) XXXXX-XXXX` while typing, strip to digits on submit
- Auto-focus first field on mount
- Enter key advances to next field
- Ctrl+Enter submits form
- Esc key cancels (with confirmation if form has changes)
- Real-time validation with Zod
- Loading state on submit button
- Show error toast on failure, success toast on success

### 5. Create Page (`app/(app)/app/clientes/novo/page.tsx`)

**Route:** `/app/clientes/novo`

**Features:**
- Uses `client-form.tsx` (no client prop = create mode)
- On success: redirect to `/app/clientes` with success toast
- On error: stay on page, show inline errors

### 6. Client Details Page (`app/(app)/app/clientes/[id]/page.tsx`) - NEW

**Route:** `/app/clientes/[id]`

**Layout:**
```
┌─────────────────────────────────────┐
│ ← Voltar    João Silva    [Editar]  │
├─────────────────────────────────────┤
│ 📱 (11) 98765-4321                  │
│ ✉️ joao@email.com                   │
│                                     │
│ 📝 Notas:                           │
│ Cliente desde 2024. Prefere banho... │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ 🐕 Pets (2)              Ver →│  │
│ │ 📅 Agendamentos (3)      Ver →│  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Features:**
- Display client information
- "Editar" button → navigates to `/app/clientes/[id]/editar`
- Pets card → navigates to pets filtered by this client (future feature)
- Appointments card → navigates to appointments filtered by this client (future feature)
- Show loading skeleton while fetching client
- Show error state if client not found or unauthorized

### 7. Edit Page (`app/(app)/app/clientes/[id]/editar/page.tsx`) - NEW

**Route:** `/app/clientes/[id]/editar`

**Features:**
- Fetch client by id on mount
- Uses `client-form.tsx` with client prop = edit mode
- Pre-fills form with existing data
- Phone: format from digits to mask on load
- On success: redirect to `/app/clientes/[id]` (details page)
- On error: stay on page, show inline errors
- Show loading skeleton while fetching

### 8. Delete Confirmation (`components/clients/client-delete-dialog.tsx`)

**Flow:**
1. User clicks delete button on card
2. Opens `Dialog` with client name
3. Before showing confirm button, calls `checkClientAppointments(id)`
4. If appointments > 0:
   - Hide confirm button
   - Show: "Este cliente possui {count} agendamentos futuros. Não é possível excluir."
5. If appointments = 0:
   - Show "Excluir {name}?" message
   - Show "Cancelar" and "Excluir" buttons
6. On confirm: call `deleteClient(id)`, close dialog, refresh list

**Loading states:**
- Skeleton in dialog while checking appointments
- Loading state on delete button while deleting

## Error Handling

### Server Action Errors

| Error Type                     | User Message                          |
|--------------------------------|---------------------------------------|
| Validation failed              | "Por favor, verifique os campos"      |
| Client not found               | "Cliente não encontrado"              |
| Unauthorized (wrong company)   | "Você não tem permissão para acessar" |
| Has future appointments        | "Não é possível excluir cliente com agendamentos futuros" |
| Database error                 | "Algo deu errado. Tente novamente."   |

**Note:** Server Actions return `{ error?: string }`, not HTTP status codes. The UI converts errors to toast messages.

### Form Validation

Real-time validation with Zod schema:
- Show error below each field as user types
- Disable submit button until form is valid
- Show success toast on submit
- Show error toast on server error
- Field-level errors display inline

### Network Error Handling

- On timeout: Show "Tempo limite excedido. Tente novamente."
- On network error: Show "Erro de conexão. Verifique sua internet."
- Retry mechanism: User can retry by clicking submit again

### UUID Validation for Dynamic Routes

For routes `[id]` and `[id]/editar`, validate the ID parameter:

```typescript
// lib/utils/validation.ts
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}
```

**Usage in pages:**
- If invalid UUID: Show 404 page (use `notFound()` from Next.js)
- Catch this before making database queries

## Security Implementation

### XSS Prevention

**Utility Function (`lib/utils/security.ts`):**
```typescript
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

**Usage:**
```typescript
// When displaying notes in UI
<div>{escapeHtml(client.notes || '')}</div>
```

**Why escape at display time:**
- Preserves original data in database
- Allows different escape strategies if needed (e.g., Markdown rendering in future)
- Defense in depth: even if database is compromised, XSS is prevented

## Utilities

### useDebounce Hook (`lib/hooks/use-debounce.ts`)

```typescript
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

**Usage in search:**
```typescript
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 300)

useEffect(() => {
  // Only query when debounced value changes
  queryClients(debouncedSearch)
}, [debouncedSearch])
```

### Phone Formatting Utilities (`lib/utils/phone.ts`)

```typescript
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

## Testing

### Unit Tests

**Server Actions (`lib/actions/clients.test.ts`):**
- `getClients` returns company-scoped clients
- `getClients` filters by search term
- `getClientById` returns only client from same company
- `getClientById` returns error for wrong company
- `createClient` creates with correct company_id
- `createClient` strips phone to digits
- `updateClient` updates only own company's client
- `checkClientAppointments` returns correct count
- `deleteClient` prevents deletion with appointments
- `deleteClient` deletes when no appointments

**Components:**
- `client-form`: validates inputs, strips phone, submits on valid, shows errors
- `client-card`: formats phone correctly, hides email if null, handles actions
- `client-search-bar`: filters correctly, debounces input
- `client-delete-dialog`: shows appointments count, prevents delete when needed
- `dialog`: opens/closes, renders children, handles footer

**Utilities:**
- `formatPhone()`: converts digits to masked format
- `stripPhone()`: converts masked format to digits
- `isValidPhone()`: validates 10-11 digit phone
- `useDebounce()`: delays value updates
- `isValidUUID()`: validates UUID format
- `escapeHtml()`: prevents XSS attacks

### Integration Tests

- Create client → appears in list → can search for it
- Edit client → changes persist in details page
- Delete client → removed from list
- Cannot delete client with appointments
- Cannot access other company's clients

**Target Coverage:** 80%+

## Success Criteria

1. [ ] User can create a client with valid data
2. [ ] User can view all company clients in list
3. [ ] User can search clients by name/phone/email
4. [ ] User can view client details page
5. [ ] User can edit existing client
6. [ ] User can delete client (protected if appointments exist)
7. [ ] All actions scoped to user's company (RLS)
8. [ ] Phone number formatted correctly in UI
9. [ ] Empty states show correct message
10. [ ] 80%+ test coverage
11. [ ] No TypeScript errors
12. [ ] All tests pass

## Dependencies

**Existing:**
- `@supabase/ssr` - Database client
- `zod` - Validation
- `next/navigation` - Routing
- `@/components/ui/*` - GlassCard, Button, Input, Toast
- `@/lib/validation/clients` - Client schema

**New:**
- `components/ui/dialog.tsx` - Modal/Dialog component
- `components/clients/*` - Client-specific components
- `lib/types/clients.ts` - Type definitions
- `lib/utils/phone.ts` - Phone formatting utilities
- `lib/utils/security.ts` - XSS prevention utilities
- `lib/utils/validation.ts` - UUID validation
- `lib/hooks/use-debounce.ts` - Debounce hook
- `lib/actions/clients.ts` - Server actions for CRUD

## Future Enhancements

Out of scope for this implementation:

1. **Client Pets Tab** - Show pets belonging to client
2. **Appointment History** - Show client's past/future appointments
3. **Client Merge** - Merge duplicate clients
4. **Bulk Import** - Import clients from CSV
5. **Client Tags** - Categorize clients (VIP, new, etc.)
6. **Client Notes Timeline** - Multiple notes with timestamps
7. **Duplicate Validation** - Warn on duplicate phone/email
8. **Pagination** - Cursor-based for 100+ clients
9. **Soft Delete** - Archive instead of hard delete for audit trail

## Implementation Notes

1. **Multi-tenancy:** All queries MUST filter by `company_id` from user session
   - Use `getCurrentCompanyId()` helper in all server actions
   - RLS policies provide defense-in-depth at database level

2. **Phone formatting:**
   - Store: 10-11 digits only (e.g., "11987654321")
   - Display: `(XX) XXXXX-XXXX` (e.g., "(11) 98765-4321")
   - Input: Auto-mask while typing, strip before submit

3. **Email optional:** Don't show email line in card if null

4. **XSS Prevention:**
   - Use `escapeHtml()` when rendering notes field
   - Never render user input without escaping

5. **UUID Validation:**
   - Validate `[id]` parameter format before database queries
   - Return 404 for invalid UUIDs using `notFound()`

6. **Concurrency:** Last write wins for edits (consider optimistic locking in future)

7. **Pagination:** Add after 100+ clients (use cursor-based)

8. **Dialog reuse:** Create dialog.tsx to be reusable for other features

9. **Session validation:** Server Actions must check authentication on every request
   - `getCurrentCompanyId()` returns null if not authenticated
   - Return appropriate error message to UI
