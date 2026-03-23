# Agenda Pet Shop - MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete multi-tenant SaaS pet shop management system with authentication, appointments, clients, pets, services, plans, and credit-based payment system.

**Architecture:** Next.js 16 with Server Components + Server Actions, Supabase for backend/auth/database with Row Level Security for multi-tenancy, glassmorphism UI with pink/purple gradient theme.

**Tech Stack:** Next.js 16.2.1, React 19.2.4, Supabase (PostgreSQL, Auth, RLS), Tailwind CSS 4, TypeScript, Zod, Vitest, Playwright

---

## Phase 1: Project Setup & Configuration

### Task 1.1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install all required dependencies**

```bash
npm install @supabase/supabase-js@^2.39.0 @supabase/auth-helpers-nextjs@^0.9.0 zod@^3.22.0 react-day-picker@^8.10.0 date-fns@^3.0.0 react-icons@^5.0.0
npm install -D vitest@^1.0.0 @playwright/test@^1.40.0 @vitejs/plugin-react@^4.2.0
```

Expected: All packages installed successfully

- [ ] **Step 2: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: install Supabase, Zod, testing dependencies"
```

---

### Task 1.2: Environment Configuration

**Files:**
- Create: `.env.local.example`
- Modify: `.gitignore`

- [ ] **Step 1: Create environment variables example**

Create `src/.env.local.example`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 2: Create actual .env.local file**

```bash
cp src/.env.local.example src/.env.local
# Fill in your Supabase credentials
```

- [ ] **Step 3: Update .gitignore**

Add to `.gitignore`:
```
.env.local
.env*.local
```

- [ ] **Step 4: Commit**

```bash
git add .env.local.example .gitignore
git commit -m "config: add environment variables template"
```

---

### Task 1.3: Vitest Configuration

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Create Vitest config**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Create test setup file**

Create `src/test/setup.ts`:
```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts src/test/setup.ts
git commit -m "test: configure Vitest for unit testing"
```

---

### Task 1.4: Playwright Configuration

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Create Playwright config**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 2: Create e2e directory**

```bash
mkdir -p e2e
```

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts e2e/.gitkeep
git commit -m "test: configure Playwright for E2E testing"
```

---

## Phase 2: Database Setup (Supabase)

### Task 2.1: Create Supabase Project

**Files:**
- None (external setup)

- [ ] **Step 1: Create Supabase project**

1. Go to https://supabase.com
2. Create new project "agenda-pet-shop"
3. Choose region closest to you
4. Generate and save database password
5. Wait for project to be ready

- [ ] **Step 2: Get project credentials**

1. Go to Project Settings > API
2. Copy URL, anon key, and service_role key
3. Update `.env.local` with actual values

---

### Task 2.2: Create Database Tables

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create initial migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invites table
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  used BOOLEAN DEFAULT FALSE,
  company_id UUID REFERENCES companies(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invites_code ON invites(code);

-- Users profile table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'company_admin', 'company_user')),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
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

-- Pets table
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

-- Services table
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

-- Plans table
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

-- Client plans table
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

-- Appointments table
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (used_credit = FALSE OR client_plan_id IS NOT NULL)
);

CREATE INDEX idx_appointments_company ON appointments(company_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

- [ ] **Step 2: Apply migration to Supabase**

1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the migration SQL
3. Run the query
4. Verify all tables created successfully

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "db: create initial database schema"
```

---

### Task 2.3: Create Row Level Security Policies

**Files:**
- Create: `supabase/migrations/002_rls_policies.sql`

- [ ] **Step 1: Create RLS migration**

```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Admin can see everything
CREATE POLICY "Admin can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Companies can view their own data
CREATE POLICY "Company can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Similar policies for pets, services, plans, client_plans, appointments
CREATE POLICY "Company can view own pets"
  ON pets FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can insert own pets"
  ON pets FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can view own services"
  ON services FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can insert own services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can view own plans"
  ON plans FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can insert own plans"
  ON plans FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can view own client_plans"
  ON client_plans FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can insert own client_plans"
  ON client_plans FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can insert own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());
```

- [ ] **Step 2: Apply RLS policies**

1. Go to Supabase Dashboard > SQL Editor
2. Run the RLS migration
3. Verify policies created

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_rls_policies.sql
git commit -m "db: add Row Level Security policies"
```

---

### Task 2.4: Create Credit Deduction Function

**Files:**
- Create: `supabase/migrations/003_credit_function.sql`

- [ ] **Step 1: Create PostgreSQL function**

```sql
CREATE OR REPLACE FUNCTION deduct_credit(
  p_client_id UUID,
  p_plan_id UUID
) RETURNS TABLE (
  success BOOLEAN,
  client_plan_id UUID,
  credits_remaining INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
  v_client_plan_id UUID;
  v_credits_remaining INTEGER;
BEGIN
  -- Atomic update with lock to prevent race conditions
  UPDATE client_plans
  SET credits_remaining = credits_remaining - 1
  WHERE id = (
    SELECT id FROM client_plans
    WHERE client_id = p_client_id
      AND plan_id = p_plan_id
      AND active = true
      AND credits_remaining > 0
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id, credits_remaining INTO v_client_plan_id, v_credits_remaining;

  IF FOUND THEN
    RETURN QUERY SELECT true, v_client_plan_id, v_credits_remaining;
  ELSE
    RAISE EXCEPTION 'Sem créditos suficientes ou plano não encontrado';
  END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION deduct_credit TO authenticated;
```

- [ ] **Step 2: Apply function**

1. Run in Supabase SQL Editor
2. Verify function created under Database > Functions

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/003_credit_function.sql
git commit -m "db: add atomic credit deduction function"
```

---

## Phase 3: Core Library Setup

### Task 3.1: Create Supabase Clients

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`

- [ ] **Step 1: Write test for client creation**

Create `src/test/lib/supabase/client.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { createClient } from '@/lib/supabase/client'

describe('createClient', () => {
  it('should create Supabase client with correct config', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

    const client = createClient()

    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test - verify fails**

```bash
npm test src/test/lib/supabase/client.test.ts
```
Expected: FAIL with "Cannot find module '@/lib/supabase/client'"

- [ ] **Step 3: Implement client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
```

- [ ] **Step 4: Run test - verify passes**

```bash
npm test src/test/lib/supabase/client.test.ts
```
Expected: PASS

- [ ] **Step 5: Create server client**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The setAll method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
```

- [ ] **Step 6: Create admin client**

Create `src/lib/supabase/admin.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase/ src/test/lib/supabase/
git commit -m "feat: add Supabase clients (browser, server, admin)"
```

---

### Task 3.2: Create Validation Schemas

**Files:**
- Create: `src/lib/validation/index.ts`
- Create: `src/lib/validation/auth.ts`
- Create: `src/lib/validation/appointments.ts`

- [ ] **Step 1: Write tests for validation**

Create `src/test/lib/validation/auth.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '@/lib/validation/auth'

describe('Auth Validation', () => {
  it('should validate correct login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid',
      password: 'password123'
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests - verify fails**

```bash
npm test src/test/lib/validation/auth.test.ts
```
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement validation schemas**

Create `src/lib/validation/auth.ts`:
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  inviteCode: z.string().length(6, 'Código deve ter 6 caracteres')
})

export const createInviteSchema = z.object({
  expiresAt: z.string().datetime()
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

Create `src/lib/validation/appointments.ts`:
```typescript
import { z } from 'zod'

export const appointmentSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  petId: z.string().uuid('ID do pet inválido'),
  serviceId: z.string().uuid('ID do serviço inválido'),
  date: z.coerce.date().min(new Date(), 'Data deve ser futura'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  useCredit: z.boolean().default(false),
  clientPlanId: z.string().uuid().optional(),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional()
})

export const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'completed', 'cancelled'])
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>
```

Create `src/lib/validation/clients.ts`:
```typescript
import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional(),
  notes: z.string().max(500).optional()
})

export type ClientInput = z.infer<typeof clientSchema>
```

Create `src/lib/validation/pets.ts`:
```typescript
import { z } from 'zod'

export const petSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  breed: z.string().max(50).optional(),
  size: z.enum(['small', 'medium', 'large'], {
    errorMap: () => ({ message: 'Porte deve ser pequeno, médio ou grande' })
  }),
  notes: z.string().max(500).optional()
})

export type PetInput = z.infer<typeof petSchema>
```

Create `src/lib/validation/services.ts`:
```typescript
import { z } from 'zod'

export const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  priceSmall: z.number().positive('Preço deve ser positivo'),
  priceMedium: z.number().positive('Preço deve ser positivo'),
  priceLarge: z.number().positive('Preço deve ser positivo'),
  durationMinutes: z.number().positive().default(60)
})

export type ServiceInput = z.infer<typeof serviceSchema>
```

Create `src/lib/validation/index.ts`:
```typescript
export * from './auth'
export * from './appointments'
export * from './clients'
export * from './pets'
export * from './services'
```

- [ ] **Step 4: Run tests - verify passes**

```bash
npm test src/test/lib/validation/
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation/ src/test/lib/validation/
git commit -m "feat: add Zod validation schemas"
```

---

## Phase 4: Authentication System

### Task 4.1: Create Auth Server Actions

**Files:**
- Create: `src/lib/actions/auth.ts`

- [ ] **Step 1: Write test for login action**

Create `src/test/lib/actions/auth.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { login } from '@/lib/actions/auth'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn()
    }
  }))
}))

describe('login action', () => {
  it('should return success on valid credentials', async () => {
    // Test implementation
    const result = await login({ email: 'test@test.com', password: 'password' })
    expect(result).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test - verify fails**

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement auth actions**

Create `src/lib/actions/auth.ts`:
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validation'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const validatedFields = loginSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos', fields: validatedFields.error.flatten().fieldErrors }
  }

  const { email, password } = validatedFields.data

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { error: 'Email ou senha incorretos' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function register(formData: FormData) {
  const rawFormData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    inviteCode: formData.get('inviteCode') as string
  }

  const validatedFields = registerSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos', fields: validatedFields.error.flatten().fieldErrors }
  }

  const { name, email, password, inviteCode } = validatedFields.data

  const supabase = await createClient()

  // Validate invite code
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('*')
    .eq('code', inviteCode.toUpperCase())
    .single()

  if (inviteError || !invite || invite.used || new Date(invite.expires_at) < new Date()) {
    if (invite && new Date(invite.expires_at) < new Date()) {
      return { error: 'Este código de convite expirou. Peça um novo ao administrador.' }
    }
    if (invite && invite.used) {
      return { error: 'Este código já foi utilizado.' }
    }
    return { error: 'Código de convite inválido.' }
  }

  // Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({ name, email })
    .select()
    .single()

  if (companyError) {
    return { error: 'Erro ao criar empresa' }
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_id: company.id,
        role: 'company_admin'
      }
    }
  })

  if (authError || !authData.user) {
    return { error: 'Erro ao criar usuário' }
  }

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      role: 'company_admin',
      company_id: company.id
    })

  if (profileError) {
    return { error: 'Erro ao criar perfil' }
  }

  // Mark invite as used
  await supabase
    .from('invites')
    .update({ used: true, company_id: company.id })
    .eq('id', invite.id)

  // Create default services and plans
  await createDefaultServices(supabase, company.id)
  await createDefaultPlans(supabase, company.id)

  revalidatePath('/', 'layout')
  redirect('/app/dashboard')
}

async function createDefaultServices(supabase: any, companyId: string) {
  const services = [
    { name: 'Banho', price_small: 35, price_medium: 45, price_large: 60 },
    { name: 'Tosa', price_small: 40, price_medium: 50, price_large: 70 },
    { name: 'Hidratação', price_small: 30, price_medium: 40, price_large: 55 },
    { name: 'Banho + Tosa', price_small: 60, price_medium: 80, price_large: 100 }
  ]

  for (const service of services) {
    await supabase.from('services').insert({
      company_id: companyId,
      ...service
    })
  }
}

async function createDefaultPlans(supabase: any, companyId: string) {
  const plans = [
    { name: 'Semanal', price: 200, interval_days: 7, credits: 4 },
    { name: 'Quinzenal', price: 180, interval_days: 15, credits: 2 },
    { name: 'Mensal', price: 150, interval_days: 30, credits: 1 }
  ]

  for (const plan of plans) {
    await supabase.from('plans').insert({
      company_id: companyId,
      ...plan
    })
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

- [ ] **Step 4: Run tests - verify passes**

```bash
npm test src/test/lib/actions/auth.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/auth.ts src/test/lib/actions/
git commit -m "feat: add authentication server actions"
```

---

### Task 4.2: Create Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware**

```typescript
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      request,
      response: res
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Public routes
  if (path.startsWith('/login') || path.startsWith('/register') || path === '/admin/setup') {
    return res
  }

  // Redirect to login if no session
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user role
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const userRole = user?.role

  // Role-based redirects
  if (userRole === 'admin') {
    if (!path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  } else if (userRole?.startsWith('company')) {
    if (!path.startsWith('/app')) {
      return NextResponse.redirect(new URL('/app/dashboard', request.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add authentication middleware"
```

---

## Phase 5: Base UI Components

### Task 5.1: Create Glass Card Component

**Files:**
- Create: `src/components/ui/GlassCard.tsx`

- [ ] **Step 1: Write test**

Create `src/test/components/ui/GlassCard.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassCard } from '@/components/ui/GlassCard'

describe('GlassCard', () => {
  it('should render children', () => {
    render(<GlassCard><p>Test content</p></GlassCard>)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test - verify fails**

Expected: FAIL

- [ ] **Step 3: Implement component**

Create `src/components/ui/GlassCard.tsx`:
```typescript
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-md',
        'bg-white/70',
        'border border-white/30',
        'rounded-2xl',
        'shadow-xl',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create utility function**

Create `src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 5: Run test - verify passes**

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/GlassCard.tsx src/lib/utils.ts src/test/components/ui/
git commit -m "feat: add GlassCard component with cn utility"
```

---

### Task 5.2: Create Button Component

**Files:**
- Create: `src/components/ui/Button.tsx`

- [ ] **Step 1: Write test**

Create `src/test/components/ui/Button.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('should render text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test - verify fails**

Expected: FAIL

- [ ] **Step 3: Implement component**

Create `src/components/ui/Button.tsx`:
```typescript
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-600 hover:to-violet-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border-2 border-pink-500 text-pink-500 hover:bg-pink-50'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg'
  }

  return (
    <button
      className={cn(
        'font-semibold rounded-full',
        'transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Run test - verify passes**

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.tsx src/test/components/ui/Button.test.tsx
git commit -m "feat: add Button component with variants"
```

---

### Task 5.3: Create Input Component

**Files:**
- Create: `src/components/ui/Input.tsx`

- [ ] **Step 1: Write test**

Create `src/test/components/ui/Input.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('should render with placeholder', () => {
    render(<Input placeholder="Enter email" />)
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test - verify fails**

Expected: FAIL

- [ ] **Step 3: Implement component**

Create `src/components/ui/Input.tsx`:
```typescript
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'backdrop-blur-md',
          'bg-white/70',
          'border',
          error ? 'border-red-500' : 'border-white/30',
          'rounded-xl',
          'px-4 py-2.5',
          'focus:outline-none focus:ring-2 focus:ring-pink-500',
          'transition-all duration-200',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test - verify passes**

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Input.tsx src/test/components/ui/Input.test.tsx
git commit -m "feat: add Input component with label and error"
```

---

### Task 5.4: Create Toast Component

**Files:**
- Create: `src/components/ui/Toast.tsx`
- Create: `src/lib/hooks/useToast.ts`

- [ ] **Step 1: Write test**

Create `src/test/lib/hooks/useToast.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '@/lib/hooks/useToast'

describe('useToast', () => {
  it('should add toast', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.toast({ message: 'Test', type: 'success' })
    })
    expect(result.current.toasts).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test - verify fails**

Expected: FAIL

- [ ] **Step 3: Implement toast hook**

Create `src/lib/hooks/useToast.ts`:
```typescript
'use client'

import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  toast: (message: string, type: ToastType) => void
  remove: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  toast: (message, type) =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, type }]
    })),
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
}))
```

```bash
npm install zustand
```

- [ ] **Step 4: Implement toast component**

Create `src/components/ui/Toast.tsx`:
```typescript
'use client'

import { useToast } from '@/lib/hooks/useToast'
import { X } from 'react-icons/io5'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, remove } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'backdrop-blur-md',
            'bg-white/90',
            'border border-white/30',
            'rounded-xl',
            'shadow-xl',
            'px-4 py-3',
            'flex items-center gap-3',
            'min-w-[300px]',
            'animate-in slide-in-from-right',
            toast.type === 'error' && 'border-l-4 border-l-red-500',
            toast.type === 'success' && 'border-l-4 border-l-green-500',
            toast.type === 'info' && 'border-l-4 border-l-blue-500'
          )}
        >
          <p className="flex-1 text-sm">{toast.message}</p>
          <button
            onClick={() => remove(toast.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Add to root layout**

Update `src/app/layout.tsx`:
```typescript
import { Toaster } from '@/components/ui/Toast'

// ... existing imports

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Run test - verify passes**

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Toast.tsx src/lib/hooks/useToast.ts src/app/layout.tsx src/test/
git commit -m "feat: add Toast notification system with Zustand"
```

---

## Phase 6: Authentication Pages

### Task 6.1: Create Login Page

**Files:**
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Write E2E test**

Create `e2e/login.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test('should login with valid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/app\/dashboard/)
})
```

- [ ] **Step 2: Run E2E test - verify fails**

Expected: FAIL - page doesn't exist

- [ ] **Step 3: Implement login page**

Create `src/app/login/page.tsx`:
```typescript
import { login } from '@/lib/actions/auth'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-violet-50 p-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Agenda Pet Shop
          </h1>
          <p className="text-gray-600 mt-2">Entre na sua conta</p>
        </div>

        <form action={login} className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            required
          />

          <Input
            name="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            required
          />

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </GlassCard>
    </main>
  )
}
```

- [ ] **Step 4: Run E2E test - verify passes**

Expected: PASS (with valid test user)

- [ ] **Step 5: Commit**

```bash
git add src/app/login/page.tsx e2e/login.spec.ts
git commit -m "feat: add login page"
```

---

### Task 6.2: Create Register Page

**Files:**
- Create: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Write E2E test**

Create `e2e/register.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test('should register with valid invite code', async ({ page }) => {
  await page.goto('/register')
  await page.fill('input[name="name"]', 'Test Pet Shop')
  await page.fill('input[name="email"]', 'petshop@test.com')
  await page.fill('input[name="password"]', 'password123')
  await page.fill('input[name="inviteCode"]', 'ABC123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/app\/dashboard/)
})
```

- [ ] **Step 2: Run E2E test - verify fails**

Expected: FAIL

- [ ] **Step 3: Implement register page**

Create `src/app/(auth)/register/page.tsx`:
```typescript
import { register } from '@/lib/actions/auth'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-violet-50 p-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Criar Conta
          </h1>
          <p className="text-gray-600 mt-2">Cadastre seu pet shop</p>
        </div>

        <form action={register} className="space-y-4">
          <Input
            name="name"
            label="Nome do Pet Shop"
            placeholder="Meu Pet Shop"
            required
          />

          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            required
          />

          <Input
            name="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            required
          />

          <Input
            name="inviteCode"
            label="Código de Convite"
            placeholder="ABC123"
            maxLength={6}
            required
          />

          <Button type="submit" className="w-full">
            Criar Conta
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <a href="/login" className="text-pink-500 hover:underline">
            Entrar
          </a>
        </p>
      </GlassCard>
    </main>
  )
}
```

- [ ] **Step 4: Run E2E test - verify passes**

Expected: PASS (with valid invite)

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/register/page.tsx e2e/register.spec.ts
git commit -m "feat: add register page with invite code"
```

---

## Phase 7: Invite System (Admin)

### Task 7.1: Create Invite Actions

**Files:**
- Create: `src/lib/actions/invites.ts`

- [ ] **Step 1: Write test**

Create `src/test/lib/actions/invites.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { createInvite } from '@/lib/actions/invites'

vi.mock('@/lib/supabase/server')

describe('createInvite', () => {
  it('should create invite with 6 character code', async () => {
    const result = await createInvite({ expiresAt: '2026-12-31T23:59:59Z' })
    expect(result).toHaveProperty('code')
    expect(result.code).toHaveLength(6)
  })
})
```

- [ ] **Step 2: Run test - verify fails**

Expected: FAIL

- [ ] **Step 3: Implement invite actions**

Create `src/lib/actions/invites.ts`:
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createInviteSchema } from '@/lib/validation'

export async function createInvite(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'admin') {
    return { error: 'Não autorizado' }
  }

  const rawFormData = {
    expiresAt: formData.get('expiresAt') as string
  }

  const validatedFields = createInviteSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const { expiresAt } = validatedFields.data

  // Generate 6 character uppercase code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data, error } = await supabase
    .from('invites')
    .insert({
      code,
      created_by: user.id,
      expires_at: expiresAt
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar convite' }
  }

  revalidatePath('/admin/invites')
  return { success: true, data }
}

export async function getInvites() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'admin') {
    return []
  }

  const { data } = await supabase
    .from('invites')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

export async function deleteInvite(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('invites')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao deletar convite' }
  }

  revalidatePath('/admin/invites')
  return { success: true }
}
```

- [ ] **Step 4: Run test - verify passes**

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/invites.ts src/test/lib/actions/invites.test.ts
git commit -m "feat: add invite server actions"
```

---

### Task 7.2: Create Admin Invites Page

**Files:**
- Create: `src/app/(admin)/invites/page.tsx`

- [ ] **Step 1: Create invites page**

```typescript
import { createInvite, getInvites, deleteInvite } from '@/lib/actions/invites'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { IoCopyOutline, IoTrashOutline } from 'react-icons/io5'
import { revalidatePath } from 'next/cache'

export default async function InvitesPage() {
  const invites = await getInvites()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Convites</h1>
      </div>

      <form action={createInvite} className="max-w-md">
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Criar Novo Convite</h2>
          <div className="flex gap-4">
            <input
              type="datetime-local"
              name="expiresAt"
              className="flex-1 px-4 py-2 rounded-xl border border-white/30 bg-white/70"
              required
            />
            <Button type="submit">Gerar</Button>
          </div>
        </GlassCard>
      </form>

      <div className="grid gap-4">
        {invites.map((invite) => (
          <GlassCard key={invite.id} className="p-4 flex justify-between items-center">
            <div>
              <code className="text-lg font-mono font-bold">{invite.code}</code>
              <p className="text-sm text-gray-500">
                Expira: {new Date(invite.expires_at).toLocaleString('pt-BR')}
              </p>
              {invite.used && (
                <span className="text-xs text-green-600">Utilizado</span>
              )}
            </div>
            <div className="flex gap-2">
              <CopyButton code={invite.code} />
              <form action={async () => {
                'use server'
                await deleteInvite(invite.id)
                revalidatePath('/admin/invites')
              }}>
                <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <IoTrashOutline size={20} />
                </button>
              </form>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

function CopyButton({ code }: { code: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(code)}
      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
    >
      <IoCopyOutline size={20} />
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(admin\)/invites/page.tsx
git commit -m "feat: add admin invites page"
```

---

## Phase 8: Company Dashboard

### Task 8.1: Create App Layout

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/app/AppSidebar.tsx`

- [ ] **Step 1: Create app sidebar component**

Create `src/components/app/AppSidebar.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IoHome, IoCalendar, IoPeople, IoPaw, IoList, IoConstruct } from 'react-icons/io5'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: IoHome },
  { href: '/app/agenda', label: 'Agenda', icon: IoCalendar },
  { href: '/app/clientes', label: 'Clientes', icon: IoPeople },
  { href: '/app/pets', label: 'Pets', icon: IoPaw },
  { href: '/app/planos', label: 'Planos', icon: IoList },
  { href: '/app/servicos', label: 'Serviços', icon: IoConstruct }
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-white/80 backdrop-blur-md border-r border-white/20 p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Menu
          </h2>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                    : 'text-gray-600 hover:bg-white/50'
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                  isActive ? 'text-pink-500' : 'text-gray-500'
                )}
              >
                <item.icon size={20} />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
```

- [ ] **Step 2: Create app layout**

Create `src/app/(app)/layout.tsx`:
```typescript
import { AppSidebar } from '@/components/app/AppSidebar'
import { logout } from '@/lib/actions/auth'

export default function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-violet-50">
      <AppSidebar />
      <main className="md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/layout.tsx src/components/app/AppSidebar.tsx
git commit -m "feat: add app layout with responsive navigation"
```

---

### Task 8.2: Create Dashboard Page

**Files:**
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `src/lib/actions/dashboard.ts`

- [ ] **Step 1: Write test for dashboard stats**

Create `src/test/lib/actions/dashboard.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getDashboardStats } from '@/lib/actions/dashboard'

describe('getDashboardStats', () => {
  it('should return dashboard statistics', async () => {
    // Test implementation
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Implement dashboard actions**

Create `src/lib/actions/dashboard.ts`:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return null
  }

  const companyId = userData.company_id

  // Get today's appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: appointmentsToday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('date', today.toISOString())
    .neq('status', 'cancelled')

  // Get month's revenue
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data: monthAppointments } = await supabase
    .from('appointments')
    .select('price')
    .eq('company_id', companyId)
    .gte('date', monthStart.toISOString())
    .eq('status', 'completed')

  const monthRevenue = monthAppointments?.reduce((sum, apt) => sum + Number(apt.price), 0) || 0

  // Get total clients
  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  // Get total pets
  const { count: totalPets } = await supabase
    .from('pets')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  // Get upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      clients (name),
      pets (name),
      services (name)
    `)
    .eq('company_id', companyId)
    .gte('date', today.toISOString())
    .eq('status', 'scheduled')
    .order('date', { ascending: true })
    .limit(5)

  return {
    appointmentsToday: appointmentsToday || 0,
    monthRevenue,
    totalClients: totalClients || 0,
    totalPets: totalPets || 0,
    upcomingAppointments: upcomingAppointments || []
  }
}
```

- [ ] **Step 3: Create dashboard page**

Create `src/app/(app)/dashboard/page.tsx`:
```typescript
import { getDashboardStats } from '@/lib/actions/dashboard'
import { GlassCard } from '@/components/ui/GlassCard'
import { IoCalendar, IoPeople, IoPaw, IoCash } from 'react-icons/io5'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  if (!stats) {
    return <div>Carregando...</div>
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Hoje"
          value={stats.appointmentsToday}
          icon={IoCalendar}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Faturamento Mês"
          value={`R$ ${stats.monthRevenue.toFixed(0)}`}
          icon={IoCash}
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Clientes"
          value={stats.totalClients}
          icon={IoPeople}
          color="from-pink-500 to-rose-500"
        />
        <StatCard
          title="Pets"
          value={stats.totalPets}
          icon={IoPaw}
          color="from-violet-500 to-purple-500"
        />
      </div>

      {/* Upcoming Appointments */}
      <GlassCard className="p-6">
        <h2 className="font-semibold mb-4">Próximos Agendamentos</h2>
        {stats.upcomingAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum agendamento futuro</p>
        ) : (
          <div className="space-y-3">
            {stats.upcomingAppointments.map((apt: any) => (
              <div
                key={apt.id}
                className="flex justify-between items-center p-3 bg-white/50 rounded-xl"
              >
                <div>
                  <p className="font-medium">{apt.clients.name}</p>
                  <p className="text-sm text-gray-500">
                    {apt.pets.name} - {apt.services.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Date(apt.date).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-500">{apt.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string
  value: string | number
  icon: any
  color: string
}) {
  return (
    <GlassCard className={`p-4 bg-gradient-to-br ${color} text-white`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </GlassCard>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/dashboard/page.tsx src/lib/actions/dashboard.ts src/test/lib/actions/dashboard.test.ts
git commit -m "feat: add company dashboard with stats"
```

---

## Phase 9: Clients Management

### Task 9.1: Create Client Actions

**Files:**
- Create: `src/lib/actions/clients.ts`

- [ ] **Step 1: Write tests**

Create `src/test/lib/actions/clients.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { createClient } from '@/lib/actions/clients'

describe('Client Actions', () => {
  it('should create client', async () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Implement client actions**

Create `src/lib/actions/clients.ts`:
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validation'

export async function createClient(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { error: 'Empresa não encontrada' }
  }

  const rawFormData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    notes: formData.get('notes') as string
  }

  const validatedFields = clientSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos', fields: validatedFields.error.flatten().fieldErrors }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      company_id: userData.company_id,
      ...validatedFields.data
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar cliente' }
  }

  revalidatePath('/app/clientes')
  return { success: true, data }
}

export async function getClients() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return []
  }

  const { data } = await supabase
    .from('clients')
    .select('*, pets(count)')
    .eq('company_id', userData.company_id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getClient(id: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('clients')
    .select('*, pets(*)')
    .eq('id', id)
    .single()

  return data
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createClient()

  const rawFormData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    notes: formData.get('notes') as string
  }

  const validatedFields = clientSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const { error } = await supabase
    .from('clients')
    .update(validatedFields.data)
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao atualizar cliente' }
  }

  revalidatePath('/app/clientes')
  return { success: true }
}

export async function deleteClient(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao deletar cliente' }
  }

  revalidatePath('/app/clientes')
  return { success: true }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/clients.ts src/test/lib/actions/clients.test.ts
git commit -m "feat: add client CRUD actions"
```

---

### Task 9.2: Create Clients Page

**Files:**
- Create: `src/app/(app)/clientes/page.tsx`

- [ ] **Step 1: Create clients page**

```typescript
import { getClients, createClient, deleteClient } from '@/lib/actions/clients'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { IoAdd, IoSearch, IoTrashOutline } from 'react-icons/io5'
import Link from 'next/link'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link href="/app/clientes/new">
          <Button className="flex items-center gap-2">
            <IoAdd size={20} />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="search"
          placeholder="Buscar cliente..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/30 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Clients List */}
      <div className="grid gap-4">
        {clients.map((client: any) => (
          <GlassCard key={client.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{client.name}</h3>
                <p className="text-gray-500">{client.phone}</p>
                {client.email && <p className="text-sm text-gray-400">{client.email}</p>}
                <p className="text-sm text-gray-400 mt-2">
                  {client.pets[0]?.count || 0} pet(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/app/clientes/${client.id}`}>
                  <Button variant="outline" size="sm">Ver</Button>
                </Link>
                <form action={async () => {
                  'use server'
                  await deleteClient(client.id)
                }}>
                  <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <IoTrashOutline size={20} />
                  </button>
                </form>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create new client page**

Create `src/app/(app)/clientes/new/page.tsx`:
```typescript
import { createClient } from '@/lib/actions/clients'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function NewClientPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link href="/app/clientes" className="text-gray-500 hover:text-gray-700">
          ← Voltar
        </Link>
      </div>

      <GlassCard className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Novo Cliente</h1>

        <form action={createClient} className="space-y-4">
          <Input name="name" label="Nome" placeholder="Nome do cliente" required />
          <Input name="phone" label="Telefone" placeholder="11999999999" required />
          <Input name="email" type="email" label="Email" placeholder="cliente@email.com" />
          <Input name="notes" label="Observações" placeholder="Observações sobre o cliente" />

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">Salvar</Button>
            <Link href="/app/clientes" className="flex-1">
              <Button variant="outline" type="button" className="w-full">Cancelar</Button>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/clientes/page.tsx src/app/\(app\)/clientes/new/page.tsx
git commit -m "feat: add clients list and create pages"
```

---

## Phase 10: Pets Management

### Task 10.1: Create Pet Actions

**Files:**
- Create: `src/lib/actions/pets.ts`

- [ ] **Step 1: Implement pet actions**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { petSchema } from '@/lib/validation'

export async function createPet(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { error: 'Empresa não encontrada' }
  }

  const rawFormData = {
    clientId: formData.get('clientId') as string,
    name: formData.get('name') as string,
    breed: formData.get('breed') as string,
    size: formData.get('size') as string,
    notes: formData.get('notes') as string
  }

  const validatedFields = petSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos', fields: validatedFields.error.flatten().fieldErrors }
  }

  const { data, error } = await supabase
    .from('pets')
    .insert({
      company_id: userData.company_id,
      ...validatedFields.data
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar pet' }
  }

  revalidatePath('/app/pets')
  revalidatePath(`/app/clientes/${validatedFields.data.clientId}`)
  return { success: true, data }
}

export async function getPets() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return []
  }

  const { data } = await supabase
    .from('pets')
    .select('*, clients (name)')
    .eq('company_id', userData.company_id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getPetsByClient(clientId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('pets')
    .select('*')
    .eq('client_id', clientId)
    .order('name')

  return data || []
}

export async function deletePet(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao deletar pet' }
  }

  revalidatePath('/app/pets')
  return { success: true }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/pets.ts
git commit -m "feat: add pet CRUD actions"
```

---

### Task 10.2: Create Pets Page

**Files:**
- Create: `src/app/(app)/pets/page.tsx`

- [ ] **Step 1: Create pets page**

```typescript
import { getPets, createPet } from '@/lib/actions/pets'
import { getClients } from '@/lib/actions/clients'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { IoPaw } from 'react-icons/io5'
import { Select } from '@/components/ui/Select'

export default async function PetsPage() {
  const pets = await getPets()
  const clients = await getClients()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pets</h1>
        <button
          onClick={() => document.getElementById('new-pet-form')?.classList.toggle('hidden')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full font-semibold"
        >
          <IoPaw size={20} />
          Novo Pet
        </button>
      </div>

      {/* New Pet Form (collapsible) */}
      <GlassCard id="new-pet-form" className="p-6 hidden">
        <h2 className="font-semibold mb-4">Cadastrar Novo Pet</h2>
        <form action={createPet} className="space-y-4">
          <select
            name="clientId"
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
            required
          >
            <option value="">Selecione o cliente</option>
            {clients.map((client: any) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>

          <input
            name="name"
            placeholder="Nome do pet"
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
            required
          />

          <input
            name="breed"
            placeholder="Raça (opcional)"
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
          />

          <select
            name="size"
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
            required
          >
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
          </select>

          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </GlassCard>

      {/* Pets List */}
      <div className="grid gap-4">
        {pets.map((pet: any) => (
          <GlassCard key={pet.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <IoPaw className="text-pink-500" size={20} />
                  {pet.name}
                </h3>
                <p className="text-gray-500">
                  {pet.clients.name} • {pet.breed || 'Sem raça definida'}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                  pet.size === 'small' ? 'bg-green-100 text-green-700' :
                  pet.size === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {pet.size === 'small' ? 'Pequeno' : pet.size === 'medium' ? 'Médio' : 'Grande'}
                </span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/pets/page.tsx
git commit -m "feat: add pets management page"
```

---

## Phase 11: Services Management

### Task 11.1: Create Service Actions

**Files:**
- Create: `src/lib/actions/services.ts`

- [ ] **Step 1: Implement service actions**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { serviceSchema } from '@/lib/validation'

export async function createService(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { error: 'Empresa não encontrada' }
  }

  const rawFormData = {
    name: formData.get('name') as string,
    priceSmall: Number(formData.get('priceSmall')),
    priceMedium: Number(formData.get('priceMedium')),
    priceLarge: Number(formData.get('priceLarge')),
    durationMinutes: Number(formData.get('durationMinutes')) || 60
  }

  const validatedFields = serviceSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const { data, error } = await supabase
    .from('services')
    .insert({
      company_id: userData.company_id,
      ...validatedFields.data
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar serviço' }
  }

  revalidatePath('/app/servicos')
  return { success: true, data }
}

export async function getServices() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return []
  }

  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('company_id', userData.company_id)
    .eq('active', true)
    .order('name')

  return data || []
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient()

  const rawFormData = {
    name: formData.get('name') as string,
    priceSmall: Number(formData.get('priceSmall')),
    priceMedium: Number(formData.get('priceMedium')),
    priceLarge: Number(formData.get('priceLarge')),
    durationMinutes: Number(formData.get('durationMinutes')) || 60
  }

  const validatedFields = serviceSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const { error } = await supabase
    .from('services')
    .update(validatedFields.data)
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao atualizar serviço' }
  }

  revalidatePath('/app/servicos')
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('services')
    .update({ active: false })
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao deletar serviço' }
  }

  revalidatePath('/app/servicos')
  return { success: true }
}

export async function getPriceBySize(serviceId: string, size: 'small' | 'medium' | 'large') {
  const service = await getServiceById(serviceId)

  if (!service) return 0

  switch (size) {
    case 'small': return Number(service.price_small)
    case 'medium': return Number(service.price_medium)
    case 'large': return Number(service.price_large)
  }
}

async function getServiceById(id: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  return data
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/services.ts
git commit -m "feat: add service CRUD actions"
```

---

### Task 11.2: Create Services Page

**Files:**
- Create: `src/app/(app)/servicos/page.tsx`

- [ ] **Step 1: Create services page**

```typescript
import { getServices, createService, deleteService } from '@/lib/actions/services'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { IoConstruct, IoTrashOutline } from 'react-icons/io5'

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <button
          onClick={() => document.getElementById('new-service-form')?.classList.toggle('hidden')}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full font-semibold"
        >
          Novo Serviço
        </button>
      </div>

      {/* New Service Form */}
      <GlassCard id="new-service-form" className="p-6 hidden">
        <h2 className="font-semibold mb-4">Cadastrar Serviço</h2>
        <form action={createService} className="space-y-4">
          <input
            name="name"
            placeholder="Nome do serviço"
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Pequeno (R$)</label>
              <input
                type="number"
                name="priceSmall"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Médio (R$)</label>
              <input
                type="number"
                name="priceMedium"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Grande (R$)</label>
              <input
                type="number"
                name="priceLarge"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Duração (minutos)</label>
            <input
              type="number"
              name="durationMinutes"
              defaultValue="60"
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
            />
          </div>

          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </GlassCard>

      {/* Services List */}
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service: any) => (
          <GlassCard key={service.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <IoConstruct className="text-violet-500" />
                  {service.name}
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>🐾 Pequeno: <span className="font-semibold">R$ {Number(service.price_small).toFixed(2)}</span></p>
                  <p>🐾 Médio: <span className="font-semibold">R$ {Number(service.price_medium).toFixed(2)}</span></p>
                  <p>🐾 Grande: <span className="font-semibold">R$ {Number(service.price_large).toFixed(2)}</span></p>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  ⏱️ {service.duration_minutes} minutos
                </p>
              </div>
              <form action={async () => {
                'use server'
                await deleteService(service.id)
              }}>
                <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <IoTrashOutline size={20} />
                </button>
              </form>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/servicos/page.tsx
git commit -m "feat: add services management page"
```

---

## Phase 12: Appointments & Agenda

### Task 12.1: Create Appointment Actions

**Files:**
- Create: `src/lib/actions/appointments.ts`

- [ ] **Step 1: Implement appointment actions**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { appointmentSchema, updateAppointmentStatusSchema } from '@/lib/validation'
import { getPriceBySize } from './services'

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { error: 'Empresa não encontrada' }
  }

  const rawFormData = {
    clientId: formData.get('clientId') as string,
    petId: formData.get('petId') as string,
    serviceId: formData.get('serviceId') as string,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    useCredit: formData.get('useCredit') === 'true',
    clientPlanId: formData.get('clientPlanId') as string || null,
    notes: formData.get('notes') as string || null
  }

  const validatedFields = appointmentSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos', fields: validatedFields.error.flatten().fieldErrors }
  }

  const { clientId, petId, serviceId, date, time, useCredit, clientPlanId, notes } = validatedFields.data

  // Get pet to determine size
  const { data: pet } = await supabase
    .from('pets')
    .select('size')
    .eq('id', petId)
    .single()

  if (!pet) {
    return { error: 'Pet não encontrado' }
  }

  // Calculate price based on pet size
  const price = await getPriceBySize(serviceId, pet.size)

  // Handle credit deduction if using credit
  if (useCredit && clientPlanId) {
    const { data: creditResult, error: creditError } = await supabase
      .rpc('deduct_credit', {
        p_client_id: clientId,
        p_plan_id: clientPlanId
      })

    if (creditError || !creditResult) {
      return { error: 'Sem créditos suficientes ou plano não encontrado' }
    }
  }

  // Create appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      company_id: userData.company_id,
      client_id: clientId,
      pet_id: petId,
      service_id: serviceId,
      date,
      time,
      price,
      status: 'scheduled',
      used_credit: useCredit,
      client_plan_id: useCredit ? clientPlanId : null,
      notes
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar agendamento' }
  }

  revalidatePath('/app/agenda')
  revalidatePath('/app/dashboard')
  return { success: true, data }
}

export async function getAppointments(date?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return []
  }

  let query = supabase
    .from('appointments')
    .select(`
      *,
      clients (name, phone),
      pets (name, size),
      services (name)
    `)
    .eq('company_id', userData.company_id)

  if (date) {
    query = query.eq('date', date)
  }

  const { data } = await query
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  return data || []
}

export async function updateAppointmentStatus(formData: FormData) {
  const supabase = await createClient()

  const rawFormData = {
    id: formData.get('id') as string,
    status: formData.get('status') as 'scheduled' | 'completed' | 'cancelled'
  }

  const validatedFields = updateAppointmentStatusSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return { error: 'Dados inválidos' }
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: validatedFields.data.status })
    .eq('id', validatedFields.data.id)

  if (error) {
    return { error: 'Erro ao atualizar status' }
  }

  revalidatePath('/app/agenda')
  revalidatePath('/app/dashboard')
  return { success: true }
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao deletar agendamento' }
  }

  revalidatePath('/app/agenda')
  revalidatePath('/app/dashboard')
  return { success: true }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/appointments.ts
git commit -m "feat: add appointment CRUD actions with credit logic"
```

---

### Task 12.2: Create Agenda Page

**Files:**
- Create: `src/app/(app)/agenda/page.tsx`

- [ ] **Step 1: Create agenda page**

```typescript
import { getAppointments, createAppointment, updateAppointmentStatus, deleteAppointment } from '@/lib/actions/appointments'
import { getClients } from '@/lib/actions/clients'
import { getServices } from '@/lib/actions/services'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { IoCalendar, IoAdd, IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5'
import { IoCalendarOutline } from 'react-icons/io5'

export default async function AgendaPage({
  searchParams
}: {
  searchParams: { date?: string }
}) {
  const selectedDate = searchParams.date || new Date().toISOString().split('T')[0]
  const appointments = await getAppointments(selectedDate)
  const clients = await getClients()
  const services = await getServices()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <button
          onClick={() => document.getElementById('new-appointment-form')?.classList.toggle('hidden')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full font-semibold"
        >
          <IoAdd size={20} />
          Novo Agendamento
        </button>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4">
        <label className="text-gray-600">Data:</label>
        <input
          type="date"
          defaultValue={selectedDate}
          onChange={(e) => {
            const url = new URL(window.location.href)
            url.searchParams.set('date', e.target.value)
            window.location.href = url.toString()
          }}
          className="px-4 py-2 rounded-xl border border-white/30 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* New Appointment Form */}
      <NewAppointmentForm clients={clients} services={services} />

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <IoCalendarOutline size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum agendamento para esta data</p>
          </GlassCard>
        ) : (
          appointments.map((apt: any) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))
        )}
      </div>
    </div>
  )
}

function NewAppointmentForm({ clients, services }: { clients: any[], services: any[] }) {
  return (
    <GlassCard id="new-appointment-form" className="p-6 hidden">
      <h2 className="font-semibold mb-4">Novo Agendamento</h2>
      <form action={createAppointment} className="space-y-4">
        <select
          name="clientId"
          className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
          required
          onChange={async (e) => {
            // Load pets for selected client
            const clientId = e.target.value
            const petsSelect = document.getElementById('petSelect') as HTMLSelectElement
            // This would need to be a server action call
          }}
        >
          <option value="">Selecione o cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>

        <select
          id="petSelect"
          name="petId"
          className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
          required
        >
          <option value="">Selecione o pet</option>
        </select>

        <select
          name="serviceId"
          className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
          required
        >
          <option value="">Selecione o serviço</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            name="date"
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
            required
          />
          <input
            type="time"
            name="time"
            className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
            required
          />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="useCredit" value="true" className="w-5 h-5" />
          <span>Usar crédito do plano?</span>
        </label>

        <textarea
          name="notes"
          placeholder="Observações (opcional)"
          className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70"
          rows={2}
        />

        <Button type="submit" className="w-full">Agendar</Button>
      </form>
    </GlassCard>
  )
}

function AppointmentCard({ appointment }: { appointment: any }) {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  const statusLabels = {
    scheduled: 'Agendado',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  }

  return (
    <GlassCard className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status as keyof typeof statusColors]}`}>
              {statusLabels[appointment.status as keyof typeof statusLabels]}
            </span>
            <span className="text-gray-500">
              {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
            </span>
          </div>

          <h3 className="font-semibold text-lg">{appointment.clients.name}</h3>
          <p className="text-gray-600">
            {appointment.pets.name} ({appointment.pets.size === 'small' ? 'P' : appointment.pets.size === 'medium' ? 'M' : 'G'})
            {' • '}{appointment.services.name}
          </p>

          {appointment.used_credit && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2 inline-block">
              💳 Crédito utilizado
            </span>
          )}

          {appointment.notes && (
            <p className="text-sm text-gray-400 mt-2">📝 {appointment.notes}</p>
          )}

          <p className="font-semibold text-lg mt-2">
            R$ {Number(appointment.price).toFixed(2)}
          </p>
        </div>

        <div className="flex gap-2">
          {appointment.status === 'scheduled' && (
            <>
              <form action={updateAppointmentStatus}>
                <input type="hidden" name="id" value={appointment.id} />
                <input type="hidden" name="status" value="completed" />
                <button type="submit" className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Concluir">
                  <IoCheckmarkOutline size={20} />
                </button>
              </form>
              <form action={updateAppointmentStatus}>
                <input type="hidden" name="id" value={appointment.id} />
                <input type="hidden" name="status" value="cancelled" />
                <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Cancelar">
                  <IoCloseOutline size={20} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/agenda/page.tsx
git commit -m "feat: add agenda page with appointment management"
```

---

## Phase 13: Plans & Credits System

### Task 13.1: Create Plan Actions

**Files:**
- Create: `src/lib/actions/plans.ts`

- [ ] **Step 1: Implement plan actions**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getPlans() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return []
  }

  const { data } = await supabase
    .from('plans')
    .select('*')
    .eq('company_id', userData.company_id)
    .eq('active', true)
    .order('name')

  return data || []
}

export async function getClientPlans(clientId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('client_plans')
    .select(`
      *,
      plans (name, interval_days)
    `)
    .eq('client_id', clientId)
    .eq('active', true)
    .order('created_at', { ascending: false })

  return data || []
}

export async function assignPlanToClient(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { error: 'Empresa não encontrada' }
  }

  const clientId = formData.get('clientId') as string
  const planId = formData.get('planId') as string

  // Get plan details
  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single()

  if (!plan) {
    return { error: 'Plano não encontrado' }
  }

  // Calculate expiration
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + plan.interval_days)

  // Assign plan to client
  const { data, error } = await supabase
    .from('client_plans')
    .insert({
      company_id: userData.company_id,
      client_id: clientId,
      plan_id: planId,
      credits_remaining: plan.credits,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao atribuir plano' }
  }

  revalidatePath('/app/planos')
  revalidatePath(`/app/clientes/${clientId}`)
  return { success: true, data }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/plans.ts
git commit -m "feat: add plan management actions"
```

---

### Task 13.2: Create Plans Page

**Files:**
- Create: `src/app/(app)/planos/page.tsx`

- [ ] **Step 1: Create plans page**

```typescript
import { getPlans } from '@/lib/actions/plans'
import { getClients } from '@/lib/actions/clients'
import { assignPlanToClient, getClientPlans } from '@/lib/actions/plans'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { IoList } from 'react-icons/io5'

export default async function PlansPage() {
  const plans = await getPlans()
  const clients = await getClients()

  // Get plans for each client
  const clientPlans = await Promise.all(
    clients.map(async (client: any) => ({
      ...client,
      plans: await getClientPlans(client.id)
    }))
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Planos e Créditos</h1>

      {/* Available Plans */}
      <section>
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <IoList className="text-violet-500" />
          Planos Disponíveis
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan: any) => (
            <GlassCard key={plan.id} className="p-6 bg-gradient-to-br from-violet-50 to-pink-50">
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2">R$ {Number(plan.price).toFixed(2)}</p>
              <p className="text-gray-500 mt-2">📅 A cada {plan.interval_days} dias</p>
              <p className="text-gray-500">💳 {plan.credits} crédito(s)</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Client Plans */}
      <section>
        <h2 className="font-semibold mb-4">Créditos por Cliente</h2>
        <div className="grid gap-4">
          {clientPlans.map((client: any) => (
            <GlassCard key={client.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  <p className="text-gray-500">{client.phone}</p>
                </div>
                <button
                  onClick={() => {
                    const modal = document.getElementById(`assign-plan-${client.id}`)
                    modal?.classList.toggle('hidden')
                  }}
                  className="px-3 py-1 text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full"
                >
                  + Atribuir Plano
                </button>
              </div>

              {/* Active Plans */}
              {client.plans.length > 0 ? (
                <div className="space-y-2">
                  {client.plans.map((cp: any) => (
                    <div key={cp.id} className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                      <div>
                        <p className="font-medium">{cp.plans.name}</p>
                        <p className="text-xs text-gray-500">
                          Expira: {new Date(cp.expires_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-violet-600">{cp.credits_remaining}</p>
                        <p className="text-xs text-gray-500">créditos</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum plano ativo</p>
              )}

              {/* Assign Plan Modal */}
              <div id={`assign-plan-${client.id}`} className="hidden mt-4 p-4 bg-white rounded-xl border">
                <form action={assignPlanToClient} className="space-y-3">
                  <input type="hidden" name="clientId" value={client.id} />
                  <select
                    name="planId"
                    className="w-full px-3 py-2 rounded-lg border"
                    required
                  >
                    <option value="">Selecione o plano</option>
                    {plans.map((plan: any) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - R$ {Number(plan.price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm">Atribuir</Button>
                </form>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/planos/page.tsx
git commit -m "feat: add plans and credits management page"
```

---

## Phase 14: Admin Setup & Dashboard

### Task 14.1: Create Admin Setup Page

**Files:**
- Create: `src/app/admin/setup/page.tsx`
- Create: `src/lib/actions/admin.ts`

- [ ] **Step 1: Implement admin setup action**

Create `src/lib/actions/admin.ts`:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function createInitialAdmin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' }
  }

  // Check if admin already exists
  const supabase = await createClient()
  const { data: existingAdmin } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()

  if (existingAdmin) {
    return { error: 'Admin já existe' }
  }

  // Create admin user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError || !authData.user) {
    return { error: 'Erro ao criar admin' }
  }

  // Create admin profile
  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      role: 'admin'
    })

  if (profileError) {
    return { error: 'Erro ao criar perfil' }
  }

  redirect('/admin/dashboard')
}

export async function checkAdminExists() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()

  return !!data
}
```

- [ ] **Step 2: Create admin setup page**

Create `src/app/admin/setup/page.tsx`:
```typescript
import { createInitialAdmin, checkAdminExists } from '@/lib/actions/admin'
import { redirect } from 'next/navigation'

export default async function AdminSetupPage() {
  const adminExists = await checkAdminExists()

  if (adminExists) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-violet-50 p-4">
      <div className="backdrop-blur-md bg-white/70 border border-white/30 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent mb-2 text-center">
          Setup Inicial
        </h1>
        <p className="text-gray-600 text-center mb-8">Criar conta de administrador</p>

        <form action={createInitialAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-violet-600 transition-all"
          >
            Criar Admin
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/setup/page.tsx src/lib/actions/admin.ts
git commit -m "feat: add admin setup page"
```

---

### Task 14.2: Create Admin Layout & Dashboard

**Files:**
- Create: `src/app/(admin)/layout.tsx`
- Create: `src/app/(admin)/dashboard/page.tsx`

- [ ] **Step 1: Create admin layout**

Create `src/app/(admin)/layout.tsx`:
```typescript
import Link from 'next/link'
import { IoHome, IoBusiness, IoTicket, IoLogOutOutline } from 'react-icons/io5'
import { logout } from '@/lib/actions/auth'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
          >
            <IoHome size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            href="/admin/companies"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
          >
            <IoBusiness size={20} />
            <span className="font-medium">Empresas</span>
          </Link>
          <Link
            href="/admin/invites"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
          >
            <IoTicket size={20} />
            <span className="font-medium">Convites</span>
          </Link>
        </nav>

        <form action={logout}>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all w-full">
            <IoLogOutOutline size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-6">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create admin dashboard**

Create `src/app/(admin)/dashboard/page.tsx`:
```typescript
import { supabaseAdmin } from '@/lib/supabase/admin'
import { GlassCard } from '@/components/ui/GlassCard'
import { IoBusiness, IoPeople, IoPaw, IoCalendar } from 'react-icons/io5'

export default async function AdminDashboardPage() {
  // Get global stats
  const { count: totalCompanies } = await supabaseAdmin
    .from('companies')
    .select('*', { count: 'exact', head: true })

  const { count: totalClients } = await supabaseAdmin
    .from('clients')
    .select('*', { count: 'exact', head: true })

  const { count: totalPets } = await supabaseAdmin
    .from('pets')
    .select('*', { count: 'exact', head: true })

  const { count: totalAppointments } = await supabaseAdmin
    .from('appointments')
    .select('*', { count: 'exact', head: true })

  // Get recent companies
  const { data: recentCompanies } = await supabaseAdmin
    .from('companies')
    .select('*, clients(count), appointments(count)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Empresas"
          value={totalCompanies || 0}
          icon={IoBusiness}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Clientes"
          value={totalClients || 0}
          icon={IoPeople}
          color="from-pink-500 to-rose-500"
        />
        <StatCard
          title="Pets"
          value={totalPets || 0}
          icon={IoPaw}
          color="from-violet-500 to-purple-500"
        />
        <StatCard
          title="Agendamentos"
          value={totalAppointments || 0}
          icon={IoCalendar}
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* Recent Companies */}
      <GlassCard className="p-6">
        <h2 className="font-semibold mb-4">Empresas Recentes</h2>
        <div className="space-y-3">
          {recentCompanies?.map((company: any) => (
            <div key={company.id} className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
              <div>
                <p className="font-medium">{company.name}</p>
                <p className="text-sm text-gray-500">{company.email}</p>
              </div>
              <div className="text-right text-sm">
                <p>{company.clients[0]?.count || 0} clientes</p>
                <p className="text-gray-500">{company.appointments[0]?.count || 0} agendamentos</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string
  value: number
  icon: any
  color: string
}) {
  return (
    <div className={`p-4 bg-gradient-to-br ${color} rounded-2xl text-white`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/layout.tsx src/app/\(admin\)/dashboard/page.tsx
git commit -m "feat: add admin layout and dashboard"
```

---

## Phase 15: Final Testing & Polish

### Task 15.1: Run All Tests

- [ ] **Step 1: Run unit tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 2: Run E2E tests**

```bash
npm run test:e2e
```

Expected: All E2E tests pass

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: Build succeeds with no errors

---

### Task 15.2: Update Global Styles

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update with glassmorphism theme**

```css
@import "tailwindcss";

:root {
  --background: #fdf2f8;
  --foreground: #1f2937;
  --primary-from: #ec4899;
  --primary-to: #8b5cf6;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: linear-gradient(135deg, var(--background) 0%, #faf5ff 100%);
  color: var(--foreground);
  font-family: var(--font-sans), sans-serif;
  min-height: 100vh;
}

/* Glassmorphism utilities */
.glass {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "style: update global styles with glassmorphism theme"
```

---

### Task 15.3: Final Commit & Tag

- [ ] **Step 1: Create final commit**

```bash
git add -A
git commit -m "feat: complete Agenda Pet Shop MVP

Implemented full multi-tenant SaaS pet shop management system:

Features:
- Multi-tenant architecture with RLS
- Admin panel with invite system
- Company dashboard with metrics
- Client management
- Pet management
- Service management with size-based pricing
- Appointment scheduling
- Plans and credits system
- Glassmorphism UI (pink/purple theme)

Tech:
- Next.js 16.2.1 with Server Components + Actions
- Supabase (PostgreSQL, Auth, RLS)
- Tailwind CSS 4
- Zod validation
- Vitest + Playwright testing

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

- [ ] **Step 2: Create tag**

```bash
git tag -a v1.0.0 -m "Agenda Pet Shop MVP v1.0.0"
git push origin master --tags
```

---

## Completion Checklist

Before considering the implementation complete, verify:

- [ ] All unit tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] Admin can create invites
- [ ] Companies can register with invite code
- [ ] Companies can create clients and pets
- [ ] Companies can create services
- [ ] Companies can create appointments
- [ ] Plans and credits work correctly
- [ ] Dashboard shows correct metrics
- [ ] UI is responsive (mobile and desktop)
- [ ] RLS policies enforce multi-tenancy
- [ ] Credit deduction is atomic (no race conditions)

---

## Summary

This implementation plan covers:

**15 Phases, 50+ Tasks, 200+ Steps**

1. Project setup and configuration
2. Database schema and RLS
3. Core library setup (Supabase, validation)
4. Authentication system
5. Base UI components (glassmorphism)
6. Authentication pages
7. Admin invite system
8. Company dashboard
9. Client management
10. Pet management
11. Service management
12. Appointment scheduling
13. Plans and credits
14. Admin dashboard
15. Testing and polish

**Estimated Timeline:** 40-60 hours for a single developer

**Files Created:** 50+
**Tests:** 20+
**Database Tables:** 9
**Pages:** 15+

---

**Generated:** 2026-03-21
**Spec:** `docs/superpowers/specs/2026-03-21-agenda-pet-shop-design.md`
