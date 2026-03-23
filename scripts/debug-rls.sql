-- Debug: Verificar se as funções e políticas foram criadas corretamente

-- 1. Verificar se as funções existem
SELECT
  'Functions' as type,
  routine_name as name,
  routine_type as kind
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_current_user_company_id', 'is_current_user_admin');

-- 2. Verificar se as privilégios foram concedidos
SELECT
  'Privileges' as type,
  grantee,
  privilege_type
FROM information_schema.role_routine_grants
WHERE routine_schema = 'public'
  AND routine_name IN ('get_current_user_company_id', 'is_current_user_admin');

-- 3. Verificar políticas da tabela users
SELECT
  'Users Policies' as type,
  policy_name,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- 4. Testar a função diretamente (substitua pelo seu auth.user.id)
-- Primeiro pegue seu auth user id:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Depois teste (substitua <SEU_AUTH_USER_ID> pelo id acima):
-- SELECT get_current_user_company_id() as company_id;
-- SELECT is_current_user_admin() as is_admin;
