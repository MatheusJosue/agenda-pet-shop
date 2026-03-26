-- ============================================================================
-- FIX: Create table and insert data (skip policies - they already exist)
-- Run this if you get "policy already exists" error
-- ============================================================================

-- Create table if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS service_prices (
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

CREATE INDEX IF NOT EXISTS idx_service_prices_company ON service_prices(company_id);
CREATE INDEX IF NOT EXISTS idx_service_prices_active ON service_prices(active);
CREATE INDEX IF NOT EXISTS idx_service_prices_service_name ON service_prices(service_name);

-- Expand pets table for 5 size categories (if not already done)
DO $$
BEGIN
  -- Check if the constraint needs updating
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pets_size_check') THEN
    ALTER TABLE pets DROP CONSTRAINT pets_size_check;
  END IF;

  -- Update existing data if needed
  IF EXISTS (SELECT 1 FROM pets WHERE size = 'small' AND NOT EXISTS (SELECT 1 FROM pets WHERE size = 'tiny')) THEN
    UPDATE pets SET size = 'tiny' WHERE size = 'small';
  END IF;
  IF EXISTS (SELECT 1 FROM pets WHERE size = 'medium') THEN
    UPDATE pets SET size = 'small' WHERE size = 'medium';
  END IF;

  ALTER TABLE pets ADD CONSTRAINT pets_size_check
    CHECK (size IN ('tiny', 'small', 'medium', 'large', 'giant'));
END $$;

-- Add column to appointments if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'service_price_id') THEN
    ALTER TABLE appointments ADD COLUMN service_price_id UUID REFERENCES service_prices(id);
  END IF;
END $$;

-- ============================================================================
-- INSERT DATA (with WHERE NOT EXISTS to avoid duplicates)
-- ============================================================================

-- Tabela - Avulso PC
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tabela', 'avulso', 'PC', size_category,
  CASE size_category WHEN 'tiny' THEN 50.00 WHEN 'small' THEN 60.00 WHEN 'medium' THEN 70.00 WHEN 'large' THEN 85.00 WHEN 'giant' THEN 100.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Tabela' AND billing_type = 'avulso' AND hair_type = 'PC' AND service_prices.size_category = sizes.size_category);

-- Tabela - Avulso PL
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tabela', 'avulso', 'PL', size_category,
  CASE size_category WHEN 'tiny' THEN 60.00 WHEN 'small' THEN 75.00 WHEN 'medium' THEN 90.00 WHEN 'large' THEN 110.00 WHEN 'giant' THEN 130.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Tabela' AND billing_type = 'avulso' AND hair_type = 'PL' AND service_prices.size_category = sizes.size_category);

-- Tabela - Pacote PC
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tabela', 'pacote', 'PC', size_category,
  CASE size_category WHEN 'tiny' THEN 45.00 WHEN 'small' THEN 54.00 WHEN 'medium' THEN 63.00 WHEN 'large' THEN 76.50 WHEN 'giant' THEN 90.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Tabela' AND billing_type = 'pacote' AND hair_type = 'PC' AND service_prices.size_category = sizes.size_category);

-- Tabela - Pacote PL
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tabela', 'pacote', 'PL', size_category,
  CASE size_category WHEN 'tiny' THEN 54.00 WHEN 'small' THEN 67.50 WHEN 'medium' THEN 81.00 WHEN 'large' THEN 99.00 WHEN 'giant' THEN 117.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Tabela' AND billing_type = 'pacote' AND hair_type = 'PL' AND service_prices.size_category = sizes.size_category);

-- Banho - Avulso PC
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Banho', 'avulso', 'PC', size_category,
  CASE size_category WHEN 'tiny' THEN 35.00 WHEN 'small' THEN 40.00 WHEN 'medium' THEN 50.00 WHEN 'large' THEN 60.00 WHEN 'giant' THEN 75.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Banho' AND billing_type = 'avulso' AND hair_type = 'PC' AND service_prices.size_category = sizes.size_category);

-- Banho - Avulso PL
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Banho', 'avulso', 'PL', size_category,
  CASE size_category WHEN 'tiny' THEN 45.00 WHEN 'small' THEN 55.00 WHEN 'medium' THEN 65.00 WHEN 'large' THEN 80.00 WHEN 'giant' THEN 95.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Banho' AND billing_type = 'avulso' AND hair_type = 'PL' AND service_prices.size_category = sizes.size_category);

-- Banho - Pacote PC
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Banho', 'pacote', 'PC', size_category,
  CASE size_category WHEN 'tiny' THEN 31.50 WHEN 'small' THEN 36.00 WHEN 'medium' THEN 45.00 WHEN 'large' THEN 54.00 WHEN 'giant' THEN 67.50 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Banho' AND billing_type = 'pacote' AND hair_type = 'PC' AND service_prices.size_category = sizes.size_category);

-- Banho - Pacote PL
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Banho', 'pacote', 'PL', size_category,
  CASE size_category WHEN 'tiny' THEN 40.50 WHEN 'small' THEN 49.50 WHEN 'medium' THEN 58.50 WHEN 'large' THEN 72.00 WHEN 'giant' THEN 85.50 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Banho' AND billing_type = 'pacote' AND hair_type = 'PL' AND service_prices.size_category = sizes.size_category);

-- Tosa - Avulso PC
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tosa', 'avulso', 'PC', size_category,
  CASE size_category WHEN 'tiny' THEN 40.00 WHEN 'small' THEN 50.00 WHEN 'medium' THEN 60.00 WHEN 'large' THEN 75.00 WHEN 'giant' THEN 90.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Tosa' AND billing_type = 'avulso' AND hair_type = 'PC' AND service_prices.size_category = sizes.size_category);

-- Tosa - Avulso PL
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tosa', 'avulso', 'PL', size_category,
  CASE size_category WHEN 'tiny' THEN 50.00 WHEN 'small' THEN 60.00 WHEN 'medium' THEN 75.00 WHEN 'large' THEN 90.00 WHEN 'giant' THEN 110.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Tosa' AND billing_type = 'avulso' AND hair_type = 'PL' AND service_prices.size_category = sizes.size_category);

-- Tosa - Pacote PC
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tosa', 'pacote', 'PC', size_category,
  CASE size_category WHEN 'tiny' THEN 36.00 WHEN 'small' THEN 45.00 WHEN 'medium' THEN 54.00 WHEN 'large' THEN 67.50 WHEN 'giant' THEN 81.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Tosa' AND billing_type = 'pacote' AND hair_type = 'PC' AND service_prices.size_category = sizes.size_category);

-- Tosa - Pacote PL
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tosa', 'pacote', 'PL', size_category,
  CASE size_category WHEN 'tiny' THEN 45.00 WHEN 'small' THEN 54.00 WHEN 'medium' THEN 67.50 WHEN 'large' THEN 81.00 WHEN 'giant' THEN 99.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Tosa' AND billing_type = 'pacote' AND hair_type = 'PL' AND service_prices.size_category = sizes.size_category);

-- Hidroterapia - Avulso (sem tipo de pelo)
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Hidroterapia', 'avulso', NULL, size_category,
  CASE size_category WHEN 'tiny' THEN 40.00 WHEN 'small' THEN 50.00 WHEN 'medium' THEN 60.00 WHEN 'large' THEN 75.00 WHEN 'giant' THEN 90.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Hidroterapia' AND billing_type = 'avulso' AND hair_type IS NULL AND service_prices.size_category = sizes.size_category);

-- Hidroterapia - Pacote
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Hidroterapia', 'pacote', NULL, size_category,
  CASE size_category WHEN 'tiny' THEN 36.00 WHEN 'small' THEN 45.00 WHEN 'medium' THEN 54.00 WHEN 'large' THEN 67.50 WHEN 'giant' THEN 81.00 END, true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (SELECT 1 FROM service_prices WHERE service_prices.company_id = companies.id AND service_name = 'Hidroterapia' AND billing_type = 'pacote' AND hair_type IS NULL AND service_prices.size_category = sizes.size_category);
