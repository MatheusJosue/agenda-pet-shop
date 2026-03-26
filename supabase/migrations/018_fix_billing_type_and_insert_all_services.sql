-- Fix billing_type and remove frequency column
-- billing_type: 'avulso', 'pacote'
-- Quinzenal services are named "Quinzenal Subpelo", "Quinzenal Golden" with billing_type='pacote'

-- Drop frequency constraint (no longer needed)
ALTER TABLE service_prices DROP CONSTRAINT IF EXISTS service_prices_frequency_check;

-- Update billing_type CHECK constraint (only avulso and pacote)
ALTER TABLE service_prices DROP CONSTRAINT IF EXISTS service_prices_billing_type_check;
ALTER TABLE service_prices ADD CONSTRAINT service_prices_billing_type_check
CHECK (billing_type IN ('avulso', 'pacote'));

-- Remove frequency column (no longer needed)
ALTER TABLE service_prices DROP COLUMN IF EXISTS frequency;

-- Remove credits column for now (can be added later with proper package tracking)
ALTER TABLE service_prices DROP COLUMN IF EXISTS credits;

-- Delete existing data to insert correct services
DELETE FROM service_prices;

-- =============================================
-- BANHO - PELO CURTO (PC)
-- =============================================
-- Avulso
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Banho', 'avulso', 'PC', size_category, price, true
FROM companies,
  (VALUES ('tiny', 55.00), ('small', 65.00), ('medium', 90.00), ('large', 120.00), ('giant', 160.00))
  AS v(size_category, price);

-- Pacote
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Banho', 'pacote', 'PC', size_category, price, true
FROM companies,
  (VALUES ('tiny', 180.00), ('small', 220.00), ('medium', 300.00), ('large', 380.00), ('giant', 480.00))
  AS v(size_category, price);

-- =============================================
-- BANHO - PELO LONGO (PL)
-- =============================================
-- Avulso
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Banho', 'avulso', 'PL', size_category, price, true
FROM companies,
  (VALUES ('tiny', 60.00), ('small', 78.00), ('medium', 120.00), ('large', 150.00), ('giant', 240.00))
  AS v(size_category, price);

-- Pacote
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Banho', 'pacote', 'PL', size_category, price, true
FROM companies,
  (VALUES ('tiny', 200.00), ('small', 240.00), ('medium', 320.00), ('large', 390.00), ('giant', 768.00))
  AS v(size_category, price);

-- =============================================
-- SUBPELO (sem distinção de pelo)
-- =============================================
-- Avulso
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Subpelo', 'avulso', NULL, size_category, price, true
FROM companies,
  (VALUES ('tiny', 65.00), ('small', 90.00), ('medium', 160.00), ('large', 240.00), ('giant', 320.00))
  AS v(size_category, price);

-- Pacote
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Subpelo', 'pacote', NULL, size_category, price, true
FROM companies,
  (VALUES ('tiny', 210.00), ('small', 290.00), ('medium', 510.00), ('large', 770.00), ('giant', 1000.00))
  AS v(size_category, price);

-- =============================================
-- TESOURA (sem distinção de pelo)
-- =============================================
-- Avulso
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tesoura', 'avulso', NULL, size_category, price, true
FROM companies,
  (VALUES ('tiny', 120.00), ('small', 145.00), ('medium', 180.00), ('large', 230.00), ('giant', 320.00))
  AS v(size_category, price);

-- Pacote
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Tesoura', 'pacote', NULL, size_category, price, true
FROM companies,
  (VALUES ('tiny', 70.00), ('small', 85.00), ('medium', 100.00), ('large', 132.50), ('giant', 200.00))
  AS v(size_category, price);

-- =============================================
-- MÁQUINA - PELO CURTO (PC)
-- =============================================
-- Avulso
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Máquina', 'avulso', 'PC', size_category, price, true
FROM companies,
  (VALUES ('tiny', 93.00), ('small', 115.00), ('medium', 175.00), ('large', 230.00), ('giant', 275.00))
  AS v(size_category, price);

-- Pacote
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Máquina', 'pacote', 'PC', size_category, price, true
FROM companies,
  (VALUES ('tiny', 40.00), ('small', 50.00), ('medium', 100.00), ('large', 132.50), ('giant', 155.00))
  AS v(size_category, price);

-- =============================================
-- MÁQUINA - PELO LONGO (PL)
-- =============================================
-- Avulso
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Máquina', 'avulso', 'PL', size_category, price, true
FROM companies,
  (VALUES ('tiny', 98.00), ('small', 120.00), ('medium', 185.00), ('large', 240.00), ('giant', 290.00))
  AS v(size_category, price);

-- Pacote
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Máquina', 'pacote', 'PL', size_category, price, true
FROM companies,
  (VALUES ('tiny', 48.00), ('small', 60.00), ('medium', 105.00), ('large', 145.00), ('giant', 195.00))
  AS v(size_category, price);

-- =============================================
-- QUINZENAL SUBPELO (pacote, sem distinção de pelo)
-- =============================================
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Quinzenal Subpelo', 'pacote', NULL, size_category, price, true
FROM companies,
  (VALUES ('tiny', 117.00), ('small', 162.00), ('medium', 288.00), ('large', 432.00), ('giant', 576.00))
  AS v(size_category, price);

-- =============================================
-- QUINZENAL GOLDEN (pacote, sem distinção de pelo)
-- =============================================
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT id, 'Quinzenal Golden', 'pacote', NULL, size_category, price, true
FROM companies,
  (VALUES ('tiny', 108.00), ('small', 140.40), ('medium', 240.00), ('large', 270.00), ('giant', 432.00))
  AS v(size_category, price);
