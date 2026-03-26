-- Convert appointments from service_id to service_price_id

-- Step 1: Drop old check constraint that references service_id
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_used_credit_check;

-- Step 2: Drop old service_id foreign key constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;

-- Step 3: Drop old service_id column (this will also drop the data)
ALTER TABLE appointments DROP COLUMN IF EXISTS service_id;

-- Step 4: Add new service_price_id column (nullable initially)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_price_id UUID REFERENCES service_prices(id);

-- Add pet_package_id column for package tracking
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pet_package_id UUID REFERENCES pet_packages(id);

-- Step 5: Add new check constraint
ALTER TABLE appointments ADD CONSTRAINT appointments_used_credit_check_new
CHECK (used_credit = FALSE OR client_plan_id IS NOT NULL);

-- Step 6: Make service_price_id NOT NULL (will fail if there are existing records)
-- First, delete any existing appointments that don't have service_price_id
DELETE FROM appointments WHERE service_price_id IS NULL;

-- Now make it NOT NULL
ALTER TABLE appointments ALTER COLUMN service_price_id SET NOT NULL;

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_service_price ON appointments(service_price_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_package ON appointments(pet_package_id);

-- Step 8: Update RLS policies
DROP POLICY IF EXISTS "Users can view appointments" ON appointments;
CREATE POLICY "Users can view appointments"
ON appointments FOR SELECT
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert appointments" ON appointments;
CREATE POLICY "Users can insert appointments"
ON appointments FOR INSERT
WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update appointments" ON appointments;
CREATE POLICY "Users can update appointments"
ON appointments FOR UPDATE
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete appointments" ON appointments;
CREATE POLICY "Users can delete appointments"
ON appointments FOR DELETE
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);
