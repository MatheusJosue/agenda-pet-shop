-- ============================================================================
-- Service Prices Table RLS Policies
-- ============================================================================
-- This migration adds Row Level Security policies for the service_prices table
-- to allow companies to manage their own service pricing
-- ============================================================================

-- Enable Row Level Security on service_prices table
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SERVICE_PRICES TABLE POLICIES
-- Full CRUD by company
-- ============================================================================

-- Admins can view all service prices
CREATE POLICY "Admins can view all service_prices"
  ON service_prices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert service prices
CREATE POLICY "Admins can insert service_prices"
  ON service_prices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update service prices
CREATE POLICY "Admins can update service_prices"
  ON service_prices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete service prices
CREATE POLICY "Admins can delete service_prices"
  ON service_prices FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Company can SELECT own service_prices
CREATE POLICY "Company can SELECT own service_prices"
  ON service_prices FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Company can INSERT own service_prices
CREATE POLICY "Company can INSERT own service_prices"
  ON service_prices FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Company can UPDATE own service_prices
CREATE POLICY "Company can UPDATE own service_prices"
  ON service_prices FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Company can DELETE own service_prices
CREATE POLICY "Company can DELETE own service_prices"
  ON service_prices FOR DELETE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));
