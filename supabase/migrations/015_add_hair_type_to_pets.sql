-- ============================================================================
-- Add hair_type column to pets table
-- ============================================================================

-- Add hair_type column to pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS hair_type TEXT CHECK (hair_type IN ('PC', 'PL'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pets_hair_type ON pets(hair_type);

-- Set default value for existing pets (PC - Pelo Curto)
UPDATE pets SET hair_type = 'PC' WHERE hair_type IS NULL;

-- Make the column NOT NULL (after setting defaults)
ALTER TABLE pets ALTER COLUMN hair_type SET NOT NULL;

-- Add comment
COMMENT ON COLUMN pets.hair_type IS 'Hair type: PC = Pelo Curto (Short Hair), PL = Pelo Longo (Long Hair)';
