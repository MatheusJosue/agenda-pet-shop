-- Carol Pet House catalog based on the public price flyer.
-- Keeps the existing schema and normalizes service names used by scheduling.

UPDATE service_prices
SET active = false,
    updated_at = NOW()
WHERE service_name IN (
  'Banho',
  'Tosa Higiênica',
  'Tosa Higienica',
  'Tosa',
  'Banho + Tosa na Máquina',
  'Banho + Tosa na Maquina',
  'Banho + Tosa na Tesoura',
  'Máquina',
  'Maquina',
  'Tesoura',
  'Corte de unhas',
  'Corte de Unhas',
  'Hidratação',
  'Hidratacao',
  'Hidroterapia',
  'Desembolo de nós',
  'Desembolo de nos',
  'Desembolo'
);

UPDATE service_prices
SET active = false,
    updated_at = NOW()
WHERE billing_type = 'pacote'
  AND service_name IN (
    'Pacote Semanal',
    'Pacote Quinzenal',
    'Pacote Mensal'
  );

-- Main services.
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active, updated_at)
SELECT c.id, v.service_name, 'avulso', v.hair_type, v.size_category, v.price, true, NOW()
FROM companies c
CROSS JOIN (
  VALUES
    ('Banho', NULL, 'tiny', 60.00),
    ('Banho', NULL, 'small', 60.00),
    ('Banho', NULL, 'medium', 80.00),
    ('Banho', NULL, 'large', 100.00),
    ('Banho', NULL, 'giant', 100.00),

    ('Tosa Higiênica', NULL, 'tiny', 10.00),
    ('Tosa Higiênica', NULL, 'small', 10.00),
    ('Tosa Higiênica', NULL, 'medium', 20.00),
    ('Tosa Higiênica', NULL, 'large', 30.00),
    ('Tosa Higiênica', NULL, 'giant', 30.00),

    ('Banho + Tosa na Máquina', 'PC', 'tiny', 90.00),
    ('Banho + Tosa na Máquina', 'PC', 'small', 90.00),
    ('Banho + Tosa na Máquina', 'PC', 'medium', 105.00),
    ('Banho + Tosa na Máquina', 'PC', 'large', 120.00),
    ('Banho + Tosa na Máquina', 'PC', 'giant', 120.00),
    ('Banho + Tosa na Máquina', 'PL', 'tiny', 90.00),
    ('Banho + Tosa na Máquina', 'PL', 'small', 90.00),
    ('Banho + Tosa na Máquina', 'PL', 'medium', 105.00),
    ('Banho + Tosa na Máquina', 'PL', 'large', 120.00),
    ('Banho + Tosa na Máquina', 'PL', 'giant', 120.00),

    ('Banho + Tosa na Tesoura', 'PC', 'tiny', 120.00),
    ('Banho + Tosa na Tesoura', 'PC', 'small', 120.00),
    ('Banho + Tosa na Tesoura', 'PC', 'medium', 135.00),
    ('Banho + Tosa na Tesoura', 'PC', 'large', 150.00),
    ('Banho + Tosa na Tesoura', 'PC', 'giant', 150.00),
    ('Banho + Tosa na Tesoura', 'PL', 'tiny', 120.00),
    ('Banho + Tosa na Tesoura', 'PL', 'small', 120.00),
    ('Banho + Tosa na Tesoura', 'PL', 'medium', 135.00),
    ('Banho + Tosa na Tesoura', 'PL', 'large', 150.00),
    ('Banho + Tosa na Tesoura', 'PL', 'giant', 150.00),

    ('Corte de unhas', NULL, 'tiny', 15.00),
    ('Corte de unhas', NULL, 'small', 15.00),
    ('Corte de unhas', NULL, 'medium', 15.00),
    ('Corte de unhas', NULL, 'large', 15.00),
    ('Corte de unhas', NULL, 'giant', 15.00),

    ('Hidratação', NULL, 'tiny', 20.00),
    ('Hidratação', NULL, 'small', 20.00),
    ('Hidratação', NULL, 'medium', 20.00),
    ('Hidratação', NULL, 'large', 20.00),
    ('Hidratação', NULL, 'giant', 20.00),

    ('Desembolo de nós', NULL, 'tiny', 20.00),
    ('Desembolo de nós', NULL, 'small', 20.00),
    ('Desembolo de nós', NULL, 'medium', 20.00),
    ('Desembolo de nós', NULL, 'large', 20.00),
    ('Desembolo de nós', NULL, 'giant', 20.00)
) AS v(service_name, hair_type, size_category, price)
WHERE NOT EXISTS (
  SELECT 1
  FROM service_prices sp
  WHERE sp.company_id = c.id
    AND sp.service_name = v.service_name
    AND sp.billing_type = 'avulso'
    AND COALESCE(sp.hair_type, '') = COALESCE(v.hair_type, '')
    AND sp.size_category = v.size_category
    AND sp.active = true
);

-- The same services are selectable inside an active package. The package
-- purchase carries the monetary value; package appointments consume 1 credit.
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active, updated_at)
SELECT source.company_id, source.service_name, 'pacote', source.hair_type, source.size_category, 0.00, true, NOW()
FROM service_prices source
WHERE source.billing_type = 'avulso'
  AND source.active = true
  AND source.service_name IN (
    'Banho',
    'Tosa Higiênica',
    'Banho + Tosa na Máquina',
    'Banho + Tosa na Tesoura',
    'Corte de unhas',
    'Hidratação',
    'Desembolo de nós'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM service_prices existing
    WHERE existing.company_id = source.company_id
      AND existing.service_name = source.service_name
      AND existing.billing_type = 'pacote'
      AND COALESCE(existing.hair_type, '') = COALESCE(source.hair_type, '')
      AND existing.size_category = source.size_category
      AND existing.active = true
  );

-- Package service prices. A package appointment consumes package credit,
-- but the price table still shows the package value for reference.
INSERT INTO service_prices (company_id, service_name, billing_type, hair_type, size_category, price, active, updated_at)
SELECT c.id, v.service_name, 'pacote', NULL, v.size_category, v.price, true, NOW()
FROM companies c
CROSS JOIN (
  VALUES
    ('Pacote Semanal', 'tiny', 200.00),
    ('Pacote Semanal', 'small', 200.00),
    ('Pacote Semanal', 'medium', 260.00),
    ('Pacote Semanal', 'large', 320.00),
    ('Pacote Semanal', 'giant', 320.00),
    ('Pacote Quinzenal', 'tiny', 130.00),
    ('Pacote Quinzenal', 'small', 130.00),
    ('Pacote Quinzenal', 'medium', 170.00),
    ('Pacote Quinzenal', 'large', 210.00),
    ('Pacote Quinzenal', 'giant', 210.00),
    ('Pacote Mensal', 'tiny', 70.00),
    ('Pacote Mensal', 'small', 70.00),
    ('Pacote Mensal', 'medium', 90.00),
    ('Pacote Mensal', 'large', 110.00),
    ('Pacote Mensal', 'giant', 110.00)
) AS v(service_name, size_category, price)
WHERE NOT EXISTS (
  SELECT 1
  FROM service_prices sp
  WHERE sp.company_id = c.id
    AND sp.service_name = v.service_name
    AND sp.billing_type = 'pacote'
    AND sp.hair_type IS NULL
    AND sp.size_category = v.size_category
    AND sp.active = true
);

UPDATE package_types
SET active = false
WHERE name IN (
  'Pequeno - Semanal',
  'Pequeno - Quinzenal',
  'Pequeno - Mensal',
  'Médio - Semanal',
  'Médio - Quinzenal',
  'Médio - Mensal',
  'Grande - Semanal',
  'Grande - Quinzenal',
  'Grande - Mensal',
  'Pacote Semanal',
  'Pacote Quinzenal',
  'Pacote Mensal'
);

INSERT INTO package_types (company_id, name, interval_days, credits, price, active)
SELECT c.id, v.name, v.interval_days, v.credits, v.price, true
FROM companies c
CROSS JOIN (
  VALUES
    ('Pequeno - Semanal', 7, 4, 200.00),
    ('Pequeno - Quinzenal', 15, 2, 130.00),
    ('Pequeno - Mensal', 30, 1, 70.00),
    ('Médio - Semanal', 7, 4, 260.00),
    ('Médio - Quinzenal', 15, 2, 170.00),
    ('Médio - Mensal', 30, 1, 90.00),
    ('Grande - Semanal', 7, 4, 320.00),
    ('Grande - Quinzenal', 15, 2, 210.00),
    ('Grande - Mensal', 30, 1, 110.00)
) AS v(name, interval_days, credits, price)
WHERE NOT EXISTS (
  SELECT 1
  FROM package_types pt
  WHERE pt.company_id = c.id
    AND pt.name = v.name
    AND pt.active = true
);
