-- ============================================================================
-- Seed Service Prices
-- ============================================================================
-- This migration seeds the service_prices table with default pricing
-- for all service combinations (service_name × billing_type × hair_type × size_category)
-- ============================================================================

-- Insert prices for all service combinations
-- Tabela/Banho (Bath)
-- Avulso pricing
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Tabela',
  'avulso',
  'PC',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 50.00
    WHEN 'small' THEN 60.00
    WHEN 'medium' THEN 70.00
    WHEN 'large' THEN 85.00
    WHEN 'giant' THEN 100.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Tabela'
    AND billing_type = 'avulso'
    AND hair_type = 'PC'
    AND service_prices.size_category = sizes.size_category
);

INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Tabela',
  'avulso',
  'PL',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 60.00
    WHEN 'small' THEN 75.00
    WHEN 'medium' THEN 90.00
    WHEN 'large' THEN 110.00
    WHEN 'giant' THEN 130.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Tabela'
    AND billing_type = 'avulso'
    AND hair_type = 'PL'
    AND service_prices.size_category = sizes.size_category
);

-- Pacote pricing (10% discount typically)
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Tabela',
  'pacote',
  'PC',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 45.00
    WHEN 'small' THEN 54.00
    WHEN 'medium' THEN 63.00
    WHEN 'large' THEN 76.50
    WHEN 'giant' THEN 90.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Tabela'
    AND billing_type = 'pacote'
    AND hair_type = 'PC'
    AND service_prices.size_category = sizes.size_category
);

INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Tabela',
  'pacote',
  'PL',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 54.00
    WHEN 'small' THEN 67.50
    WHEN 'medium' THEN 81.00
    WHEN 'large' THEN 99.00
    WHEN 'giant' THEN 117.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Tabela'
    AND billing_type = 'pacote'
    AND hair_type = 'PL'
    AND service_prices.size_category = sizes.size_category
);

-- Banho (Bath only)
-- Avulso pricing
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Banho',
  'avulso',
  'PC',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 35.00
    WHEN 'small' THEN 40.00
    WHEN 'medium' THEN 50.00
    WHEN 'large' THEN 60.00
    WHEN 'giant' THEN 75.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Banho'
    AND billing_type = 'avulso'
    AND hair_type = 'PC'
    AND service_prices.size_category = sizes.size_category
);

INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Banho',
  'avulso',
  'PL',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 45.00
    WHEN 'small' THEN 55.00
    WHEN 'medium' THEN 65.00
    WHEN 'large' THEN 80.00
    WHEN 'giant' THEN 95.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Banho'
    AND billing_type = 'avulso'
    AND hair_type = 'PL'
    AND service_prices.size_category = sizes.size_category
);

-- Pacote pricing (10% discount)
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Banho',
  'pacote',
  'PC',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 31.50
    WHEN 'small' THEN 36.00
    WHEN 'medium' THEN 45.00
    WHEN 'large' THEN 54.00
    WHEN 'giant' THEN 67.50
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Banho'
    AND billing_type = 'pacote'
    AND hair_type = 'PC'
    AND service_prices.size_category = sizes.size_category
);

INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Banho',
  'pacote',
  'PL',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 40.50
    WHEN 'small' THEN 49.50
    WHEN 'medium' THEN 58.50
    WHEN 'large' THEN 72.00
    WHEN 'giant' THEN 85.50
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Banho'
    AND billing_type = 'pacote'
    AND hair_type = 'PL'
    AND service_prices.size_category = sizes.size_category
);

-- Tosa (Grooming only)
-- Avulso pricing
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Tosa',
  'avulso',
  'PC',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 40.00
    WHEN 'small' THEN 50.00
    WHEN 'medium' THEN 60.00
    WHEN 'large' THEN 75.00
    WHEN 'giant' THEN 90.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Tosa'
    AND billing_type = 'avulso'
    AND hair_type = 'PC'
    AND service_prices.size_category = sizes.size_category
);

INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Tosa',
  'avulso',
  'PL',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 50.00
    WHEN 'small' THEN 60.00
    WHEN 'medium' THEN 75.00
    WHEN 'large' THEN 90.00
    WHEN 'giant' THEN 110.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Tosa'
    AND billing_type = 'avulso'
    AND hair_type = 'PL'
    AND service_prices.size_category = sizes.size_category
);

-- Pacote pricing (10% discount)
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Tosa',
  'pacote',
  'PC',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 36.00
    WHEN 'small' THEN 45.00
    WHEN 'medium' THEN 54.00
    WHEN 'large' THEN 67.50
    WHEN 'giant' THEN 81.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Tosa'
    AND billing_type = 'pacote'
    AND hair_type = 'PC'
    AND service_prices.size_category = sizes.size_category
);

INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Tosa',
  'pacote',
  'PL',
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 45.00
    WHEN 'small' THEN 54.00
    WHEN 'medium' THEN 67.50
    WHEN 'large' THEN 81.00
    WHEN 'giant' THEN 99.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Tosa'
    AND billing_type = 'pacote'
    AND hair_type = 'PL'
    AND service_prices.size_category = sizes.size_category
);

-- Hydrotherapy (No hair type distinction)
-- Avulso pricing
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Hidroterapia',
  'avulso',
  NULL,
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 40.00
    WHEN 'small' THEN 50.00
    WHEN 'medium' THEN 60.00
    WHEN 'large' THEN 75.00
    WHEN 'giant' THEN 90.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Hidroterapia'
    AND billing_type = 'avulso'
    AND hair_type IS NULL
    AND service_prices.size_category = sizes.size_category
);

-- Pacote pricing (10% discount)
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active)
SELECT
  id,
  'Hidroterapia',
  'pacote',
  NULL,
  size_category,
  CASE size_category
    WHEN 'tiny' THEN 36.00
    WHEN 'small' THEN 45.00
    WHEN 'medium' THEN 54.00
    WHEN 'large' THEN 67.50
    WHEN 'giant' THEN 81.00
  END,
  true
FROM companies, (SELECT unnest(ARRAY['tiny', 'small', 'medium', 'large', 'giant']) AS size_category) sizes
WHERE NOT EXISTS (
  SELECT 1 FROM service_prices
  WHERE service_prices.company_id = companies.id
    AND service_name = 'Hidroterapia'
    AND billing_type = 'pacote'
    AND hair_type IS NULL
    AND service_prices.size_category = sizes.size_category
);
