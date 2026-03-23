-- Create package_types table
CREATE TABLE IF NOT EXISTS package_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  interval_days INTEGER NOT NULL CHECK (interval_days IN (7, 15, 30)),
  credits INTEGER NOT NULL CHECK (credits > 0),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_package_types_company_id ON package_types(company_id);
CREATE INDEX IF NOT EXISTS idx_package_types_active ON package_types(active) WHERE active = true;

-- Enable RLS
ALTER TABLE package_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view package types from their company"
  ON package_types FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert package types for their company"
  ON package_types FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update package types in their company"
  ON package_types FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete package types in their company"
  ON package_types FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_package_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER package_types_updated_at
  BEFORE UPDATE ON package_types
  FOR EACH ROW
  EXECUTE FUNCTION update_package_types_updated_at();

-- Seed default package types for existing companies
INSERT INTO package_types (company_id, name, interval_days, credits, price)
SELECT
  id,
  'Pacote Semanal',
  7,
  4,
  120.00
FROM companies
ON CONFLICT DO NOTHING;

INSERT INTO package_types (company_id, name, interval_days, credits, price)
SELECT
  id,
  'Pacote Quinzenal',
  15,
  2,
  200.00
FROM companies
ON CONFLICT DO NOTHING;

INSERT INTO package_types (company_id, name, interval_days, credits, price)
SELECT
  id,
  'Pacote Mensal',
  30,
  1,
  350.00
FROM companies
ON CONFLICT DO NOTHING;
