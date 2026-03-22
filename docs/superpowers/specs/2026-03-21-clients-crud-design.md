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
├── app/(app)/app/clientes/
│   ├── page.tsx                      # Client list (refactor existing)
│   └── novo/
│       └── page.tsx                  # Create new client
├── components/clients/
│   ├── client-card.tsx               # Single client card component
│   ├── client-form.tsx               # Reusable form component
│   ├── client-search-bar.tsx         # Search with real-time filtering
│   └── client-list-skeleton.tsx      # Loading state
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

## Components

### 1. Server Actions (`lib/actions/clients.ts`)

```typescript
export interface ClientResponse {
  data?: Client
  error?: string
}

export interface ClientsListResponse {
  data?: Client[]
  error?: string
}

// Core operations
export async function getClients(search?: string): ClientsListResponse
export async function getClientById(id: string): ClientResponse
export async function createClient(input: ClientInput): ClientResponse
export async function updateClient(id: string, input: ClientInput): ClientResponse
export async function deleteClient(id: string): ClientResponse
```

**Validation:** Uses existing `clientSchema` from `@/lib/validation/clients`

**Security:**
- Validates `company_id` from session before all operations
- Returns 404 if client doesn't belong to user's company
- Checks for future appointments before deletion

### 2. Client List Page (`app/(app)/app/clientes/page.tsx`)

**Features:**
- Real-time search (debounce 300ms)
- GlassCard-based client list
- Empty state with call-to-action
- Skeleton loading

**Search Scope:** Name, phone, email

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Back    Clientes      [+ Novo]   │
├─────────────────────────────────────┤
│  🔍 [Buscar cliente...]            │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  👤 João Silva      ✏️ 🗑️    │  │
│  │  📱 (11) 98765-4321           │  │
│  │  ✉️ joao@email.com            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 3. Client Card Component (`components/clients/client-card.tsx`)

**Props:**
```typescript
interface ClientCardProps {
  client: Client
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}
```

**Behavior:**
- Click card body → navigate to details
- Click edit button → navigate to edit
- Click delete → confirm modal → delete

### 4. Client Form (`components/clients/client-form.tsx`)

**Fields:**
| Field    | Type      | Required | Validation                     |
|----------|-----------|----------|--------------------------------|
| name     | text      | Yes      | min 3 characters               |
| phone    | tel       | Yes      | 10-11 digits                   |
| email    | email     | No       | Valid email format if provided |
| notes    | textarea  | No       | max 500 characters             |

**Features:**
- Auto-mask phone: `(XX) XXXXX-XXXX`
- Auto-focus first field
- Enter advances to next field
- Ctrl+Enter submits
- Esc cancels (with confirmation if dirty)
- Real-time validation with Zod

### 5. Create Page (`app/(app)/app/clientes/novo/page.tsx`)

**Route:** `/app/clientes/novo`

**Features:**
- Uses `client-form.tsx`
- On success: redirect to list with success toast
- On error: show inline error messages

### 6. Delete Confirmation

**Protection:**
- Check for future appointments before allowing delete
- Show modal: "Delete {name}?" with cancel/confirm
- If appointments exist: "Client has X upcoming appointments. Cannot delete."

## Error Handling

### Server Action Errors

| Error Type                     | User Message                          |
|--------------------------------|---------------------------------------|
| Validation failed              | "Please check the form for errors"    |
| Client not found               | "Client not found"                    |
| Unauthorized (wrong company)   | "You don't have permission"           |
| Has future appointments        | "Cannot delete client with appointments" |
| Database error                 | "Something went wrong. Try again."    |

### Form Validation

Real-time validation with Zod schema:
- Show error below each field
- Disable submit button until valid
- Show success message on submit

## Testing

### Unit Tests

**Server Actions (`lib/actions/clients.test.ts`):**
- `getClients` returns company-scoped clients
- `getClientById` returns only client from same company
- `createClient` creates with correct company_id
- `updateClient` updates only own company's client
- `deleteClient` prevents deletion with appointments

**Components:**
- `client-form`: validates inputs, submits on valid, shows errors
- `client-card`: renders correctly, handles actions
- `client-search-bar`: filters correctly, debounces input

### Integration Tests

- Create client → appears in list
- Search finds created client
- Edit client → changes persist
- Delete client → removed from list

**Target Coverage:** 80%+

## Success Criteria

1. [ ] User can create a client with valid data
2. [ ] User can view all company clients in list
3. [ ] User can search clients by name/phone/email
4. [ ] User can edit existing client
5. [ ] User can delete client (protected if appointments exist)
6. [ ] All actions scoped to user's company (RLS)
7. [ ] 80%+ test coverage
8. [ ] No TypeScript errors
9. [ ] All tests pass

## Dependencies

**Existing:**
- `@supabase/ssr` - Database client
- `zod` - Validation
- `next/navigation` - Routing
- `@/components/ui/*` - GlassCard, Button, Input, Toast
- `@/lib/validation/clients` - Client schema

**New:**
- None (uses existing dependencies)

## Future Enhancements

Out of scope for this implementation:

1. **Client Pets Tab** - Show pets belonging to client
2. **Appointment History** - Show client's past/future appointments
3. **Client Merge** - Merge duplicate clients
4. **Bulk Import** - Import clients from CSV
5. **Client Tags** - Categorize clients (VIP, new, etc.)
6. **Client Notes Timeline** - Multiple notes with timestamps

## Implementation Notes

1. **Multi-tenancy:** All queries MUST filter by `company_id` from user session
2. **Phone formatting:** Store as digits only, format for display
3. **Email optional:** Don't show email field in card if not provided
4. **Soft delete consideration:** Currently using hard delete; may need soft delete for audit trail
5. **Pagination:** Add after 100+ clients (use cursor-based)
