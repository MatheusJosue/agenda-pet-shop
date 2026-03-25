-- migration: 011_service_pricing_system.sql

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Create service_prices table
-- ============================================
CREATE TABLE service_prices (
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

-- Create indexes
CREATE INDEX idx_service_prices_company ON service_prices(company_id);
CREATE INDEX idx_service_prices_active ON service_prices(active);
CREATE INDEX idx_service_prices_service_name ON service_prices(service_name);

-- Add comment
COMMENT ON TABLE service_prices IS 'Preços de serviços por múltiplas dimensões: tipo de cobrança, tipo de pelo e porte';
COMMENT ON COLUMN service_prices.billing_type IS 'avulso = pagamento único, pacote = usa créditos';
COMMENT ON COLUMN service_prices.hair_type IS 'PC = Pelo Curto, PL = Pelo Longo, NULL = sem distinção';
COMMENT ON COLUMN service_prices.size_category IS 'tiny=0-10kg, small=10-20kg, medium=20-30kg, large=30-50kg, giant=50-70kg';

-- ============================================
-- 2. Expand pets table to support 5 size categories
-- ============================================
-- Drop existing constraint
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_size_check;

-- Update existing pets to map to new size categories
-- Old small (which meant general small) -> tiny
-- Old medium -> small
UPDATE pets SET size = 'tiny' WHERE size = 'small';
UPDATE pets SET size = 'small' WHERE size = 'medium';

-- Add the new constraint
ALTER TABLE pets ADD CONSTRAINT pets_size_check
  CHECK (size IN ('tiny', 'small', 'medium', 'large', 'giant'));

-- Add comment
COMMENT ON COLUMN pets.size IS 'tiny=0-10kg, small=10-20kg, medium=20-30kg, large=30-50kg, giant=50-70kg';

-- ============================================
-- 3. Update appointments table for service_price_id
-- ============================================
-- Add new column to appointments for referencing service_prices
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_price_id UUID REFERENCES service_prices(id);

-- Add backup columns for data migration safety
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_name_backup TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS billing_type_backup TEXT;

-- Backup service information from existing appointments
UPDATE appointments a
SET
  service_name_backup = s.name,
  billing_type_backup = 'avulso'
FROM services s
WHERE a.service_id IS NOT NULL AND a.service_id = s.id;

-- Add comment
COMMENT ON COLUMN appointments.service_price_id IS 'References service_prices instead of services (service_id is deprecated)';
