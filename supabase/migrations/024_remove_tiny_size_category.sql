-- Remove the legacy "tiny" size category.
-- Current sizes are: small=P (0-10kg), medium=M (10-20kg), large=G (20-30kg), giant=GG (30-60kg).

UPDATE pets
SET size = 'small'
WHERE size = 'tiny';

WITH replacements AS (
  SELECT
    tiny.id AS tiny_id,
    small.id AS small_id
  FROM service_prices tiny
  JOIN service_prices small
    ON small.company_id = tiny.company_id
   AND small.service_name = tiny.service_name
   AND small.billing_type = tiny.billing_type
   AND small.hair_type IS NOT DISTINCT FROM tiny.hair_type
   AND small.size_category = 'small'
  WHERE tiny.size_category = 'tiny'
)
UPDATE appointments
SET service_price_id = replacements.small_id
FROM replacements
WHERE appointments.service_price_id = replacements.tiny_id;

WITH replacements AS (
  SELECT
    tiny.id AS tiny_id,
    small.id AS small_id
  FROM service_prices tiny
  JOIN service_prices small
    ON small.company_id = tiny.company_id
   AND small.service_name = tiny.service_name
   AND small.billing_type = tiny.billing_type
   AND small.hair_type IS NOT DISTINCT FROM tiny.hair_type
   AND small.size_category = 'small'
  WHERE tiny.size_category = 'tiny'
)
DELETE FROM appointment_services aps
USING replacements
WHERE aps.service_price_id = replacements.tiny_id
  AND EXISTS (
    SELECT 1
    FROM appointment_services existing
    WHERE existing.appointment_id = aps.appointment_id
      AND existing.service_price_id = replacements.small_id
  );

WITH replacements AS (
  SELECT
    tiny.id AS tiny_id,
    small.id AS small_id
  FROM service_prices tiny
  JOIN service_prices small
    ON small.company_id = tiny.company_id
   AND small.service_name = tiny.service_name
   AND small.billing_type = tiny.billing_type
   AND small.hair_type IS NOT DISTINCT FROM tiny.hair_type
   AND small.size_category = 'small'
  WHERE tiny.size_category = 'tiny'
)
UPDATE appointment_services
SET service_price_id = replacements.small_id
FROM replacements
WHERE appointment_services.service_price_id = replacements.tiny_id;

DELETE FROM service_prices tiny
WHERE tiny.size_category = 'tiny'
  AND EXISTS (
    SELECT 1
    FROM service_prices small
    WHERE small.company_id = tiny.company_id
      AND small.service_name = tiny.service_name
      AND small.billing_type = tiny.billing_type
      AND small.hair_type IS NOT DISTINCT FROM tiny.hair_type
      AND small.size_category = 'small'
  );

UPDATE service_prices
SET size_category = 'small'
WHERE size_category = 'tiny';

ALTER TABLE service_prices DROP CONSTRAINT IF EXISTS service_prices_size_category_check;
ALTER TABLE service_prices
  ADD CONSTRAINT service_prices_size_category_check
  CHECK (size_category IN ('small', 'medium', 'large', 'giant'));

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_size_check;
ALTER TABLE pets
  ADD CONSTRAINT pets_size_check
  CHECK (size IN ('small', 'medium', 'large', 'giant'));

UPDATE package_types
SET active = false
WHERE name IN (
  'Pacote Semanal',
  'Pacote Quinzenal',
  'Pacote Mensal'
);

INSERT INTO package_types (company_id, name, interval_days, credits, price, active)
SELECT c.id, v.name, v.interval_days, v.credits, v.price, true
FROM companies c
CROSS JOIN (
  VALUES
    ('Gigante - Semanal', 7, 4, 320.00),
    ('Gigante - Quinzenal', 15, 2, 210.00),
    ('Gigante - Mensal', 30, 1, 110.00)
) AS v(name, interval_days, credits, price)
WHERE NOT EXISTS (
  SELECT 1
  FROM package_types pt
  WHERE pt.company_id = c.id
    AND pt.name = v.name
    AND pt.active = true
);

COMMENT ON COLUMN service_prices.size_category IS 'small=P/0-10kg, medium=M/10-20kg, large=G/20-30kg, giant=GG/30-60kg';
COMMENT ON COLUMN pets.size IS 'small=P/0-10kg, medium=M/10-20kg, large=G/20-30kg, giant=GG/30-60kg';
