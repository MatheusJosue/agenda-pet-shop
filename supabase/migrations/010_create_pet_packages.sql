-- Create pet_packages table
CREATE TABLE IF NOT EXISTS pet_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  package_type_id UUID NOT NULL REFERENCES package_types(id) ON DELETE RESTRICT,
  credits_remaining INTEGER NOT NULL CHECK (credits_remaining >= 0),
  starts_at DATE NOT NULL,
  expires_at DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_pet_packages_pet_id ON pet_packages(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_packages_company_id ON pet_packages(company_id);
CREATE INDEX IF NOT EXISTS idx_pet_packages_active ON pet_packages(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_pet_packages_expires_at ON pet_packages(expires_at);

-- Enable RLS
ALTER TABLE pet_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view pet packages from their company"
  ON pet_packages FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert pet packages for their company"
  ON pet_packages FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update pet packages in their company"
  ON pet_packages FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete pet packages in their company"
  ON pet_packages FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Function to safely decrement package credits
CREATE OR REPLACE FUNCTION decrement_package_credits(p_package_id UUID)
RETURNS VOID AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Get current credits with lock
  SELECT credits_remaining INTO v_current_credits
  FROM pet_packages
  WHERE id = p_package_id AND active = true
  FOR UPDATE;

  -- Check if package exists and has credits
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pacote não encontrado';
  END IF;

  IF v_current_credits < 1 THEN
    RAISE EXCEPTION 'Créditos insuficientes';
  END IF;

  -- Decrement credits
  UPDATE pet_packages
  SET credits_remaining = credits_remaining - 1,
      updated_at = NOW()
  WHERE id = p_package_id;

  -- Deactivate if no credits left
  UPDATE pet_packages
  SET active = false,
      updated_at = NOW()
  WHERE id = p_package_id AND credits_remaining = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_pet_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pet_packages_updated_at
  BEFORE UPDATE ON pet_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_packages_updated_at();

-- Grant execute on decrement function to authenticated users
GRANT EXECUTE ON FUNCTION decrement_package_credits(UUID) TO authenticated;
