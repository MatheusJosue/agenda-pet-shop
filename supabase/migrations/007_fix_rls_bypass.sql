-- Solução definitiva para o RLS
-- As funções SECURITY DEFINER precisam de um tratamento especial

-- Step 1: Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop e recriar as funções com auth.uid() inline (evita RLS)
CREATE OR REPLACE FUNCTION get_current_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
PARALLEL SAFE
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT u.company_id INTO v_company_id
  FROM users u
  WHERE u.id = auth.uid()
  LIMIT 1;

  RETURN v_company_id;
END;
$$;

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
PARALLEL SAFE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
    LIMIT 1
  );
END;
$$;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION get_current_user_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;

-- Step 4: Drop all policies on users and recreate simples
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Company admins can view company users" ON users;

-- Criar política simples que permite o usuário ver seu próprio registro
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Política para admins verem todos (usando função)
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());
