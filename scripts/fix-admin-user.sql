-- Fix Admin User in users table
-- Run this in Supabase SQL Editor in the order shown below

-- Step 1: Find your auth user ID (run this first)
SELECT id, email FROM auth.users WHERE email = 'admin@petshop.com';

-- Step 2: Create the company first (if it doesn't exist)
INSERT INTO companies (id, name, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin Company',
  'admin@system.local'
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert the user record
-- Replace 'YOUR_AUTH_USER_ID' with the ID from Step 1 (should be: 0881b85d-11fd-4325-b1ba-27615d65e4d3)
INSERT INTO users (id, email, role, company_id)
VALUES (
  '0881b85d-11fd-4325-b1ba-27615d65e4d3',
  'admin@petshop.com',
  'admin',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id;

-- Step 4: Verify the fix
SELECT u.id, u.email, u.role, u.company_id, c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.email = 'admin@petshop.com';
