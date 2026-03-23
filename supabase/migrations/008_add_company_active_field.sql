-- Add active field to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Add index for active companies queries
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(active);

-- Update existing companies to be active
UPDATE companies SET active = true WHERE active IS NULL;
