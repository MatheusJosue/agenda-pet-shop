-- Fix RLS infinite recursion across all tables
-- The problem: policies that SELECT from users within policies create recursion

-- ============================================================================
-- STEP 1: Create SECURITY DEFINER helper functions that bypass RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN (
    SELECT company_id
    FROM users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_current_user_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;

-- ============================================================================
-- STEP 2: Fix USERS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Company admins can view company users" ON users;

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Company admins can view company users"
  ON users FOR SELECT
  TO authenticated
  USING (
    is_current_user_admin() OR
    company_id = get_current_user_company_id()
  );

-- ============================================================================
-- STEP 3: Fix COMPANIES table policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;
DROP POLICY IF EXISTS "Company members can view own company" ON companies;

CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Company members can view own company"
  ON companies FOR SELECT
  TO authenticated
  USING (id = get_current_user_company_id());

-- ============================================================================
-- STEP 4: Fix INVITES table policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all invites" ON invites;
DROP POLICY IF EXISTS "Admins can insert invites" ON invites;
DROP POLICY IF EXISTS "Admins can update invites" ON invites;
DROP POLICY IF EXISTS "Admins can delete invites" ON invites;
DROP POLICY IF EXISTS "Company admins can view own invites" ON invites;
DROP POLICY IF EXISTS "Company admins can insert own invites" ON invites;
DROP POLICY IF EXISTS "Company admins can update own invites" ON invites;
DROP POLICY IF EXISTS "Company admins can delete own invites" ON invites;

CREATE POLICY "Admins can view all invites"
  ON invites FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert invites"
  ON invites FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update invites"
  ON invites FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete invites"
  ON invites FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Company admins can view own invites"
  ON invites FOR SELECT
  TO authenticated
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Company admins can insert own invites"
  ON invites FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company admins can update own invites"
  ON invites FOR UPDATE
  TO authenticated
  USING (company_id = get_current_user_company_id())
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company admins can delete own invites"
  ON invites FOR DELETE
  TO authenticated
  USING (company_id = get_current_user_company_id());

-- ============================================================================
-- STEP 5: Fix CLIENTS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can insert clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
DROP POLICY IF EXISTS "Company can SELECT own clients" ON clients;
DROP POLICY IF EXISTS "Company can INSERT own clients" ON clients;
DROP POLICY IF EXISTS "Company can UPDATE own clients" ON clients;
DROP POLICY IF EXISTS "Company can DELETE own clients" ON clients;

CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Company can SELECT own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Company can INSERT own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can UPDATE own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (company_id = get_current_user_company_id())
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can DELETE own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (company_id = get_current_user_company_id());

-- ============================================================================
-- STEP 6: Fix PETS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all pets" ON pets;
DROP POLICY IF EXISTS "Admins can insert pets" ON pets;
DROP POLICY IF EXISTS "Admins can update pets" ON pets;
DROP POLICY IF EXISTS "Admins can delete pets" ON pets;
DROP POLICY IF EXISTS "Company can SELECT own pets" ON pets;
DROP POLICY IF EXISTS "Company can INSERT own pets" ON pets;
DROP POLICY IF EXISTS "Company can UPDATE own pets" ON pets;
DROP POLICY IF EXISTS "Company can DELETE own pets" ON pets;

CREATE POLICY "Admins can view all pets"
  ON pets FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert pets"
  ON pets FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update pets"
  ON pets FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete pets"
  ON pets FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Company can SELECT own pets"
  ON pets FOR SELECT
  TO authenticated
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Company can INSERT own pets"
  ON pets FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can UPDATE own pets"
  ON pets FOR UPDATE
  TO authenticated
  USING (company_id = get_current_user_company_id())
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can DELETE own pets"
  ON pets FOR DELETE
  TO authenticated
  USING (company_id = get_current_user_company_id());

-- ============================================================================
-- STEP 7: Fix SERVICES table policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all services" ON services;
DROP POLICY IF EXISTS "Admins can insert services" ON services;
DROP POLICY IF EXISTS "Admins can update services" ON services;
DROP POLICY IF EXISTS "Admins can delete services" ON services;
DROP POLICY IF EXISTS "Company can SELECT own services" ON services;
DROP POLICY IF EXISTS "Company can INSERT own services" ON services;
DROP POLICY IF EXISTS "Company can UPDATE own services" ON services;
DROP POLICY IF EXISTS "Company can DELETE own services" ON services;

CREATE POLICY "Admins can view all services"
  ON services FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Company can SELECT own services"
  ON services FOR SELECT
  TO authenticated
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Company can INSERT own services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can UPDATE own services"
  ON services FOR UPDATE
  TO authenticated
  USING (company_id = get_current_user_company_id())
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can DELETE own services"
  ON services FOR DELETE
  TO authenticated
  USING (company_id = get_current_user_company_id());

-- ============================================================================
-- STEP 8: Fix PLANS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all plans" ON plans;
DROP POLICY IF EXISTS "Admins can insert plans" ON plans;
DROP POLICY IF EXISTS "Admins can update plans" ON plans;
DROP POLICY IF EXISTS "Admins can delete plans" ON plans;
DROP POLICY IF EXISTS "Company can SELECT own plans" ON plans;
DROP POLICY IF EXISTS "Company can INSERT own plans" ON plans;
DROP POLICY IF EXISTS "Company can UPDATE own plans" ON plans;
DROP POLICY IF EXISTS "Company can DELETE own plans" ON plans;

CREATE POLICY "Admins can view all plans"
  ON plans FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert plans"
  ON plans FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update plans"
  ON plans FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete plans"
  ON plans FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Company can SELECT own plans"
  ON plans FOR SELECT
  TO authenticated
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Company can INSERT own plans"
  ON plans FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can UPDATE own plans"
  ON plans FOR UPDATE
  TO authenticated
  USING (company_id = get_current_user_company_id())
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can DELETE own plans"
  ON plans FOR DELETE
  TO authenticated
  USING (company_id = get_current_user_company_id());

-- ============================================================================
-- STEP 9: Fix CLIENT_PLANS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all client_plans" ON client_plans;
DROP POLICY IF EXISTS "Admins can insert client_plans" ON client_plans;
DROP POLICY IF EXISTS "Admins can update client_plans" ON client_plans;
DROP POLICY IF EXISTS "Admins can delete client_plans" ON client_plans;
DROP POLICY IF EXISTS "Company can SELECT own client_plans" ON client_plans;
DROP POLICY IF EXISTS "Company can INSERT own client_plans" ON client_plans;
DROP POLICY IF EXISTS "Company can UPDATE own client_plans" ON client_plans;
DROP POLICY IF EXISTS "Company can DELETE own client_plans" ON client_plans;

CREATE POLICY "Admins can view all client_plans"
  ON client_plans FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert client_plans"
  ON client_plans FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update client_plans"
  ON client_plans FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete client_plans"
  ON client_plans FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Company can SELECT own client_plans"
  ON client_plans FOR SELECT
  TO authenticated
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Company can INSERT own client_plans"
  ON client_plans FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can UPDATE own client_plans"
  ON client_plans FOR UPDATE
  TO authenticated
  USING (company_id = get_current_user_company_id())
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can DELETE own client_plans"
  ON client_plans FOR DELETE
  TO authenticated
  USING (company_id = get_current_user_company_id());

-- ============================================================================
-- STEP 10: Fix APPOINTMENTS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON appointments;
DROP POLICY IF EXISTS "Company can SELECT own appointments" ON appointments;
DROP POLICY IF EXISTS "Company can INSERT own appointments" ON appointments;
DROP POLICY IF EXISTS "Company can UPDATE own appointments" ON appointments;
DROP POLICY IF EXISTS "Company can DELETE own appointments" ON appointments;

CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Company can SELECT own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (company_id = get_current_user_company_id());

CREATE POLICY "Company can INSERT own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can UPDATE own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (company_id = get_current_user_company_id())
  WITH CHECK (company_id = get_current_user_company_id());

CREATE POLICY "Company can DELETE own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (company_id = get_current_user_company_id());
