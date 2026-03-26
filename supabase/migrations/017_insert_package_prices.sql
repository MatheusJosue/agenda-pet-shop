-- Insert package prices for all combinations
-- Mapping: 0-10kg→tiny, 10-20kg→small, 20-30kg→medium, 30-50kg→large, 50-70kg→giant
-- Frequencies: semanal (4 credits), quinzenal (2 credits), mensal (1 credit)

-- First, delete existing package prices to avoid duplicates
DELETE FROM service_prices
WHERE billing_type = 'pacote';

-- =============================================
-- PACOTES PELO CURTO (PC)
-- =============================================

-- SEMANAL (4 créditos) - Preços base fornecidos
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, frequency, credits, active)
SELECT
  id,
  'Pacote',
  'pacote',
  'PC',
  size_category,
  price,
  'semanal',
  4,
  true
FROM companies,
  (VALUES
    ('tiny', 180.00),
    ('small', 220.00),
    ('medium', 300.00),
    ('large', 380.00),
    ('giant', 480.00)
  ) AS v(size_category, price);

-- QUINZENAL (2 créditos) - Metade do semanal
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, frequency, credits, active)
SELECT
  id,
  'Pacote',
  'pacote',
  'PC',
  size_category,
  price / 2,
  'quinzenal',
  2,
  true
FROM companies,
  (VALUES
    ('tiny', 180.00),
    ('small', 220.00),
    ('medium', 300.00),
    ('large', 380.00),
    ('giant', 480.00)
  ) AS v(size_category, price);

-- MENSAL (1 crédito) - Metade do quinzenal
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, frequency, credits, active)
SELECT
  id,
  'Pacote',
  'pacote',
  'PC',
  size_category,
  price / 4,
  'mensal',
  1,
  true
FROM companies,
  (VALUES
    ('tiny', 180.00),
    ('small', 220.00),
    ('medium', 300.00),
    ('large', 380.00),
    ('giant', 480.00)
  ) AS v(size_category, price);

-- =============================================
-- PACOTES PELO LONGO (PL)
-- =============================================

-- SEMANAL (4 créditos) - Preços base fornecidos
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, frequency, credits, active)
SELECT
  id,
  'Pacote',
  'pacote',
  'PL',
  size_category,
  price,
  'semanal',
  4,
  true
FROM companies,
  (VALUES
    ('tiny', 200.00),
    ('small', 240.00),
    ('medium', 320.00),
    ('large', 390.00),
    ('giant', 768.00)
  ) AS v(size_category, price);

-- QUINZENAL (2 créditos) - Metade do semanal
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, frequency, credits, active)
SELECT
  id,
  'Pacote',
  'pacote',
  'PL',
  size_category,
  price / 2,
  'quinzenal',
  2,
  true
FROM companies,
  (VALUES
    ('tiny', 200.00),
    ('small', 240.00),
    ('medium', 320.00),
    ('large', 390.00),
    ('giant', 768.00)
  ) AS v(size_category, price);

-- MENSAL (1 crédito) - Metade do quinzenal
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, frequency, credits, active)
SELECT
  id,
  'Pacote',
  'pacote',
  'PL',
  size_category,
  price / 4,
  'mensal',
  1,
  true
FROM companies,
  (VALUES
    ('tiny', 200.00),
    ('small', 240.00),
    ('medium', 320.00),
    ('large', 390.00),
    ('giant', 768.00)
  ) AS v(size_category, price);
