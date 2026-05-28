-- Track revenue that is not represented by an appointment charge.
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  pet_package_id UUID REFERENCES pet_packages(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('package_purchase', 'package_renewal')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_id
  ON financial_transactions(company_id);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_occurred_at
  ON financial_transactions(occurred_at);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_pet_package_id
  ON financial_transactions(pet_package_id);

ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all financial transactions"
  ON financial_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Company can SELECT own financial transactions"
  ON financial_transactions FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Company can INSERT own financial transactions"
  ON financial_transactions FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Backfill package purchases that existed before this ledger was introduced.
INSERT INTO financial_transactions (
  company_id,
  pet_package_id,
  type,
  amount,
  occurred_at,
  created_at
)
SELECT
  pp.company_id,
  pp.id,
  'package_purchase',
  pt.price,
  pp.created_at,
  NOW()
FROM pet_packages pp
JOIN package_types pt ON pt.id = pp.package_type_id
WHERE pt.price > 0
  AND NOT EXISTS (
    SELECT 1
    FROM financial_transactions ft
    WHERE ft.pet_package_id = pp.id
      AND ft.type = 'package_purchase'
  );
