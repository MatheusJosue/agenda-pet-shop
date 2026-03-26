-- Add frequency and credits fields to service_prices for package management
-- frequency: 'semanal' (4 credits), 'quinzenal' (2 credits), 'mensal' (1 credit), 'avulso' (single service)
-- credits: number of service credits in the package

-- Add frequency column
ALTER TABLE service_prices
ADD COLUMN IF NOT EXISTS frequency TEXT
CHECK (frequency IN ('semanal', 'quinzenal', 'mensal', 'avulso'));

-- Add credits column
ALTER TABLE service_prices
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 1 CHECK (credits > 0);

-- Add index for faster queries by frequency
CREATE INDEX IF NOT EXISTS idx_service_prices_frequency ON service_prices(frequency);

-- Update existing records: billing_type 'avulso' should have frequency 'avulso' and 1 credit
UPDATE service_prices
SET frequency = 'avulso', credits = 1
WHERE billing_type = 'avulso'
  AND (frequency IS NULL OR frequency = '');

-- Update existing package records to have 'semanal' frequency (default, 4 credits)
UPDATE service_prices
SET frequency = 'semanal', credits = 4
WHERE billing_type = 'pacote'
  AND (frequency IS NULL OR frequency = '');

-- Make columns NOT NULL after setting defaults
ALTER TABLE service_prices
ALTER COLUMN frequency SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN service_prices.frequency IS 'Frequency of service: semanal (weekly/4 credits), quinzenal (biweekly/2 credits), mensal (monthly/1 credit), avulso (individual/1 credit)';
COMMENT ON COLUMN service_prices.credits IS 'Number of service credits included in this package price';
