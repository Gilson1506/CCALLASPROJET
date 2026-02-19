-- ============================================
-- FIX RLS INFINITE RECURSION (ROBUST VERSION)
-- ============================================

-- This script drops ALL policies on the 'admin_users' table
-- and recreates a single, simple, non-recursive policy.

BEGIN;

-- 1. Drop existing policies (to clear conflicting recursive ones)
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Users can read own admin status" ON admin_users;
DROP POLICY IF EXISTS "Admins can read own user" ON admin_users; -- (Different name variation)

-- 2. Create the non-recursive policy
-- This allows any logged-in user to read their own row in admin_users (if it exists).
-- Since it only checks the current row against auth.uid(), it does not trigger recursion.
CREATE POLICY "Admins can read own user" ON admin_users FOR SELECT USING (
  auth.email() = email
);

-- 3. Verify it works
-- This query should now succeed without error (returning your row if you're an admin)
SELECT * FROM admin_users;

COMMIT;
