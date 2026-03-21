-- Add accepted_at column to invites table for better tracking
ALTER TABLE invites ADD COLUMN accepted_at TIMESTAMPTZ;
ALTER TABLE invites ADD COLUMN accepted_by UUID REFERENCES auth.users(id);

-- Add role column to invites table to specify user role
ALTER TABLE invites ADD COLUMN role TEXT NOT NULL DEFAULT 'company_user' CHECK (role IN ('admin', 'company_admin', 'company_user'));

-- Add indexes for performance
CREATE INDEX idx_invites_accepted ON invites(accepted_at) WHERE accepted_at IS NOT NULL;
CREATE INDEX idx_invites_accepted_by ON invites(accepted_by) WHERE accepted_by IS NOT NULL;

-- Update existing records (if any) to have default role
UPDATE invites SET role = 'company_user' WHERE role IS NULL;
