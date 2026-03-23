-- Debug queries - Run these to verify the state

-- 1. Check if auth user exists
SELECT 'Auth User:' as info, id, email, created_at
FROM auth.users
WHERE email = 'admin@petshop.com';

-- 2. Check if user record exists in users table
SELECT 'User Record:' as info, u.id, u.email, u.role, u.company_id
FROM users u
WHERE u.email = 'admin@petshop.com';

-- 3. Check if company exists
SELECT 'Company:' as info, id, name, email
FROM companies
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 4. Full join check
SELECT 'Full Join:' as info, u.id, u.email, u.role, c.name as company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.email = 'admin@petshop.com';
