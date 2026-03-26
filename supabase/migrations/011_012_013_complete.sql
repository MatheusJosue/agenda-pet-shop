-- ============================================================================
-- SQL COMPLETO: Criar tabela, popular dados e adicionar RLS policies
-- Execute tudo de uma vez no SQL Editor do Supabase
-- ============================================================================

-- ============================================================================
-- PARTE 1: Criar tabela service_prices (Migration 011)
-- ============================================================================

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

-- Expand pets table for 5 size categories
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_size_check;
UPDATE pets SET size = 'tiny' WHERE size = 'small';
UPDATE pets SET size = 'small' WHERE size = 'medium';
ALTER TABLE pets ADD CONSTRAINT pets_size_check
  CHECK (size IN ('tiny', 'small', 'medium', 'large', 'giant'));

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_price_id UUID REFERENCES service_prices(id);

-- ============================================================================
-- PARTE 2: Popular dados (Migration 012) - TODOS OS SERVIÇOS
-- ============================================================================

-- Tabela (Banho + Tosa) - Avulso PC
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

-- ============================================================================
-- PARTE 3: RLS Policies (Migration 013)
-- ============================================================================

ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all service_prices" ON service_prices FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert service_prices" ON service_prices FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update service_prices" ON service_prices FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete service_prices" ON service_prices FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Company can SELECT own service_prices" ON service_prices FOR SELECT TO authenticated USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Company can INSERT own service_prices" ON service_prices FOR INSERT TO authenticated WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Company can UPDATE own service_prices" ON service_prices FOR UPDATE TO authenticated USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid())) WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Company can DELETE own service_prices" ON service_prices FOR DELETE TO authenticated USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
