-- Create a clean admin user from scratch
-- Run this in Supabase SQL Editor

-- Step 1: Create the company
INSERT INTO companies (id, name, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin PetShop',
  'admin@petshop.com'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- Step 2: Get YOUR auth user ID
-- Run this and COPY the id:
SELECT id, email, created_at
FROM auth.users
WHERE email = 'admin@petshop.com';

-- Step 3: Insert/Update the user record
-- REPLACE 'YOUR_AUTH_USER_ID_FROM_STEP_2' with the actual id from Step 2
INSERT INTO users (id, email, role, company_id, name)
VALUES (
  'YOUR_AUTH_USER_ID_FROM_STEP_2',  -- <-- PASTE THE ID FROM STEP 2 HERE
  'admin@petshop.com',
  'admin',
  '00000000-0000-0000-0000-000000000001',
  'Admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  name = EXCLUDED.name;

-- Step 4: Verify everything is connected
SELECT
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  u.company_id,
  c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.email = 'admin@petshop.com';
