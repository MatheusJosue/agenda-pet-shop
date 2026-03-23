-- Seed First Admin
-- This migration creates the first admin user and company
-- Run this manually in Supabase SQL Editor after setting up the database

-- Create first company
INSERT INTO companies (id, name, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin Company',
  'admin@system.local'
)
ON CONFLICT (id) DO NOTHING;

-- Create admin auth user (you'll need to create this via Supabase Auth first)
-- Step 1: Go to Supabase Dashboard > Authentication > Users
-- Step 2: Create a new user with your email and password
-- Step 3: Copy the user ID and replace 'YOUR_AUTH_USER_ID' below

-- After creating the auth user, uncomment and run this with the actual user ID:
/*
INSERT INTO users (id, email, role, company_id)
VALUES (
  'YOUR_AUTH_USER_ID',  -- Replace with actual auth user ID from Supabase
  'your-email@example.com',
  'admin',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;
*/

-- Alternative: Create an admin invite code
-- You can use this code to register as admin via the register page
INSERT INTO invites (code, created_by, company_id, role, expires_at)
VALUES (
  'ADMIN-SEED-2024',  -- Use this code in register form
  null,  -- Created by system
  '00000000-0000-0000-0000-000000000001',
  'admin',
  NOW() + INTERVAL '365 days'  -- Valid for 1 year
)
ON CONFLICT (code) DO NOTHING;

-- Verification query (run to verify)
SELECT 'Companies:' as info, id::text, name, email FROM companies
UNION ALL
SELECT 'Invites:', code, company_id::text, role FROM invites WHERE code = 'ADMIN-SEED-2024';
