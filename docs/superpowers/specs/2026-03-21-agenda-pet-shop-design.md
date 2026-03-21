# Agenda Pet Shop - Design Document

**Date:** 2026-03-21
**Status:** Approved
**Author:** AI Design Assistant

---

## 1. Overview

Sistema SaaS multi-tenant para gestão de pet shops com foco em agendamento de banho e tosa. O sistema permite que administradores gerenciem múltiplas empresas através de um código de convite, enquanto cada empresa gerencia seus clientes, pets, serviços, planos e agendamentos de forma independente.

---

## 2. Architecture

### 2.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16.2.1, React 19.2.4 |
| Backend | Next.js Server Actions |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth + Row Level Security |
| UI | Tailwind CSS 4 |
| Icons | React Icons |
| Notifications | React Toastify |
| Testing | Vitest (unit), Playwright (E2E) |
| Validation | Zod |

### 2.2 Architecture Pattern

**Server Components + Server Actions**

- Toda lógica de negócio em Server Actions
- React Server Components renderizam no servidor
- Client Components apenas para interatividade
- Supabase Client direto nas Server Actions
- Route Groups para layouts distintos

### 2.3 Directory Structure

```
agenda-pet-shop/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth routes group
│   │   │   ├── register/        # Register with invite code
│   │   │   └── login/           # Login page
│   │   ├── (admin)/             # Admin dashboard
│   │   │   ├── layout.tsx       # Admin-only layout
│   │   │   ├── dashboard/       # Global metrics
│   │   │   ├── companies/       # Manage companies
│   │   │   └── invites/         # Generate invites
│   │   ├── (app)/               # Company dashboard
│   │   │   ├── layout.tsx       # Company-only layout
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── agenda/          # Appointments
│   │   │   ├── clientes/        # Clients
│   │   │   ├── pets/            # Pets
│   │   │   ├── planos/          # Plans
│   │   │   └── servicos/        # Services
│   │   └── api/                 # Future webhooks
│   ├── components/
│   │   ├── ui/                  # Base components (glassmorphism)
│   │   ├── admin/               # Admin-specific components
│   │   └── app/                 # Company-specific components
│   ├── lib/
│   │   ├── supabase/            # Supabase clients
│   │   ├── actions/             # Server Actions
│   │   ├── hooks/               # Custom hooks
│   │   └── utils/               # Utilities
│   └── types/                   # TypeScript types
└── supabase/
    └── migrations/              # Database migrations
```

---

## 3. Database Schema

### 3.1 Tables

#### **companies**
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **invites**
```sql
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  used BOOLEAN DEFAULT FALSE,
  company_id UUID REFERENCES companies(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for code lookup
CREATE INDEX idx_invites_code ON invites(code);
```

#### **users** (profile table)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'company_admin', 'company_user')),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **clients**
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_company ON clients(company_id);
```

#### **pets**
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  breed TEXT,
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pets_company ON pets(company_id);
CREATE INDEX idx_pets_client ON pets(client_id);
```

#### **services**
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  price_small DECIMAL(10,2) NOT NULL,
  price_medium DECIMAL(10,2) NOT NULL,
  price_large DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_company ON services(company_id);
```

#### **plans**
```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  interval_days INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_company ON plans(company_id);
```

#### **client_plans**
```sql
CREATE TABLE client_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  credits_remaining INTEGER NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_plans_company ON client_plans(company_id);
CREATE INDEX idx_client_plans_client ON client_plans(client_id);
```

#### **appointments**
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  service_id UUID NOT NULL REFERENCES services(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  used_credit BOOLEAN DEFAULT FALSE,
  client_plan_id UUID REFERENCES client_plans(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_company ON appointments(company_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

### 3.2 Row Level Security (RLS)

All tables (except admin-level) enforce multi-tenancy:

```sql
-- Example RLS policy for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company can view own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can insert own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));
```

---

## 4. Authentication & Authorization

### 4.1 User Roles

| Role | Description | Access |
|------|-------------|--------|
| `admin` | System administrator | All companies, impersonation |
| `company_admin` | Company owner | Full company access |
| `company_user` | Company employee | Limited company access (future) |

### 4.2 Registration Flow

#### **Admin Setup (One-time)**
1. Access `/admin/setup` (only if no admin exists)
2. Create first admin account
3. Redirect to `/admin/dashboard`

#### **Company Registration via Invite**
1. Admin generates invite code at `/admin/invites`
2. Admin shares code manually
3. Company accesses `/register`
4. Enters: name, email, password, INVITE CODE
5. System validates code (unused, not expired)
6. Creates: company, user (role=company_admin), marks invite as used
7. Redirects to `/app/dashboard`
8. Auto-setup: creates default services and plans

### 4.3 Default Services & Plans

**Services (auto-created on company registration):**
- Banho (R$ 35 / R$ 45 / R$ 60)
- Tosa (R$ 40 / R$ 50 / R$ 70)
- Hidratação (R$ 30 / R$ 40 / R$ 55)
- Banho + Tosa (R$ 60 / R$ 80 / R$ 100)

**Plans:**
- Semanal (R$ 200/mês, 7 days, 4 credits)
- Quinzenal (R$ 180/mês, 15 days, 2 credits)
- Mensal (R$ 150/mês, 30 days, 1 credit)

### 4.4 Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = getServerToken()
  if (!token) return NextResponse.redirect('/login')

  const userRole = await getUserRole(token)
  const path = request.nextUrl.pathname

  if (userRole === 'admin' && !path.startsWith('/admin'))
    return NextResponse.redirect('/admin/dashboard')

  if (userRole.startsWith('company') && !path.startsWith('/app'))
    return NextResponse.redirect('/app/dashboard')
}
```

---

## 5. Design System

### 5.1 Color Palette

```css
/* Primary - Pink/Purple Gradient */
--primary-from: #ec4899;  /* pink-500 */
--primary-to: #8b5cf6;    /* violet-500 */

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.3);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
--glass-blur: blur(12px);

/* Backgrounds */
--bg-primary: #fdf2f8;   /* pink-50 */
--bg-secondary: #faf5ff; /* violet-50 */

/* Text */
--text-primary: #1f2937;   /* gray-800 */
--text-secondary: #6b7280; /* gray-500 */

/* Status Colors */
--status-scheduled: #3b82f6;   /* blue-500 */
--status-completed: #10b981;   /* green-500 */
--status-cancelled: #ef4444;   /* red-500 */
```

### 5.2 Glass Component Base

```typescript
className={`
  backdrop-blur-md
  bg-white/70
  border border-white/30
  rounded-2xl
  shadow-xl
  transition-all duration-300
`}
```

### 5.3 Layout Patterns

**Admin (Desktop-first):**
- Fixed sidebar (200px)
- Main content area
- Large metric cards

**Company (Mobile-first):**
- Bottom navigation bar (mobile < 768px)
- Sidebar (desktop >= 768px)
- Compact, touch-friendly cards

### 5.4 Typography

- Font: Geist Sans (pre-configured)
- Headers: 24-32px, font-semibold
- Body: 14-16px, font-normal

---

## 6. Server Actions Structure

```
lib/
├── actions/
│   ├── auth.ts              # Login, register, invites
│   ├── companies.ts         # CRUD companies
│   ├── clients.ts           # CRUD clients
│   ├── pets.ts              # CRUD pets
│   ├── services.ts          # CRUD services
│   ├── plans.ts             # CRUD plans + credits
│   ├── appointments.ts      # CRUD appointments
│   └── dashboard.ts         # Dashboard metrics
├── supabase/
│   ├── server.ts            # Server client
│   ├── client.ts            # Client browser
│   └── admin.ts             # Admin client (RLS bypass)
└── utils/
    ├── credits.ts           # Credit logic
    ├── pricing.ts           # Price calculation by size
    └── validation.ts        # Zod schemas
```

### 6.1 Server Action Pattern

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/supabase/server'
import { appointmentSchema } from '@/lib/validation'

export async function createAppointment(data: FormData) {
  // 1. Authentication
  const user = await requireUser()

  // 2. Validation
  const parsed = appointmentSchema.parse(data)

  // 3. Business logic (credits)
  if (parsed.useCredit) {
    await verifyAndDeductCredit(parsed.clientId, parsed.planId)
  }

  // 4. Price calculation
  const price = await calculatePrice(parsed.serviceId, parsed.petSize)

  // 5. Database insert
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      company_id: user.company_id,
      ...parsed,
      price
    })

  // 6. Revalidation
  revalidatePath('/app/agenda')
  revalidatePath('/app/dashboard')

  return { success: true, data }
}
```

### 6.2 Credit Logic

```typescript
export async function verifyAndDeductCredit(
  clientId: string,
  planId: string
) {
  // Get active plan
  const plan = await supabase
    .from('client_plans')
    .select('*')
    .eq('client_id', clientId)
    .eq('plan_id', planId)
    .eq('active', true)
    .single()

  if (plan.credits_remaining <= 0) {
    throw new Error('Sem créditos suficientes')
  }

  // Deduct credit
  await supabase
    .from('client_plans')
    .update({ credits_remaining: plan.credits_remaining - 1 })
    .eq('id', plan.id)
}
```

---

## 7. Pages & Components

### 7.1 Base UI Components

```typescript
// components/ui/
├── GlassCard.tsx           // Glass effect card
├── Button.tsx              // Gradient button
├── Input.tsx               // Glass input
├── Select.tsx              // Custom select
├── Modal.tsx               // Modal with backdrop
├── Toast.tsx               // Toast notifications
├── Badge.tsx               // Status badges
└── DataTable.tsx           // Filterable table
```

### 7.2 Admin Pages

```
/admin/
├── dashboard/page.tsx      // Global metrics
├── companies/
│   ├── page.tsx            // Companies list
│   └── [id]/page.tsx       // Company details
├── invites/page.tsx        // Generate/manage invites
└── layout.tsx              // Admin sidebar
```

### 7.3 Company Pages

```
/app/
├── dashboard/page.tsx      // Metrics: appointments today/month, clients, pets, revenue
├── agenda/
│   ├── page.tsx            // List with date filters
│   └── new/page.tsx        // New appointment
├── clientes/
│   ├── page.tsx            // Clients list
│   └── [id]/page.tsx       // Details + pets
├── pets/page.tsx           // Manage pets
├── planos/page.tsx         // Plans + client credits
├── servicos/page.tsx       // CRUD services
└── layout.tsx              // Sidebar/bottom nav
```

---

## 8. Testing Strategy

### 8.1 Test-Driven Development (TDD)

Following strict TDD workflow:
1. Write failing test
2. Verify it fails correctly
3. Write minimal code to pass
4. Verify it passes
5. Refactor

### 8.2 Validation Schemas (Zod)

```typescript
export const appointmentSchema = z.object({
  clientId: z.string().uuid(),
  petId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.coerce.date().min(new Date()),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  useCredit: z.boolean().default(false),
  notes: z.string().max(500).optional()
})

export const clientSchema = z.object({
  name: z.string().min(3).max(100),
  phone: z.string().regex(/^\d{10,11}$/),
  email: z.string().email().optional()
})

export const petSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(50),
  breed: z.string().max(50).optional(),
  size: z.enum(['small', 'medium', 'large'])
})
```

### 8.3 Test Coverage

| Type | Tool | Target |
|------|------|--------|
| Unit | Vitest | Server Actions, utils, helpers |
| Integration | Vitest | Full flows (register → dashboard) |
| E2E | Playwright | Critical paths |

### 8.4 Critical E2E Flows

1. Registration with valid invite
2. Registration with invalid invite (fails)
3. Login and dashboard access
4. Create appointment with credit
5. Create appointment without credit

---

## 9. Implementation Order

1. **Setup**: Project + Supabase configuration
2. **Auth**: Authentication + Middleware
3. **Invites**: Invite system
4. **CRUD Base**: Services, Clients, Pets
5. **Appointments**: Appointments + price logic
6. **Plans**: Plans + credit system
7. **Dashboards**: Admin and Company dashboards
8. **Testing**: E2E tests
9. **Polish**: Animations, error handling, edge cases

---

## 10. Future Enhancements

- WhatsApp notifications for appointment reminders
- Payment processing
- Reports and analytics
- SaaS subscription management
- Employee management and permissions
- Inventory tracking (products)

---

## 11. Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 12. Deploy Recommendations

- **Hosting**: Vercel (native Next.js integration)
- **Database**: Supabase (free or Pro tier)
- **Monitoring**: Vercel Analytics + Supabase Logs

---

**Document Version:** 1.0
**Last Updated:** 2026-03-21
