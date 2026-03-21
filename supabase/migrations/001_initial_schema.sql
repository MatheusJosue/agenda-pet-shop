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
