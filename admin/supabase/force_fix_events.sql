-- ============================================
-- FORCE FIX EVENT RLS
-- Run this script in Supabase SQL Editor
-- ============================================

-- 1. Verify Admin User (Just to be sure)
-- This won't fail if they exist, but will insert if missing.
INSERT INTO admin_users (email) VALUES ('admin@ccallas.ao') ON CONFLICT (email) DO NOTHING;
INSERT INTO admin_users (email) VALUES ('admin@arena.ao') ON CONFLICT (email) DO NOTHING;

-- 2. DROP conflicting text policies if any
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;

-- 3. Create SIMPLE policies for now
-- We will use a direct check. If this works, the issue was the subquery or recursion.

CREATE POLICY "Admins can insert events" ON events FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    auth.email() IN (SELECT email FROM admin_users)
  )
);

CREATE POLICY "Admins can update events" ON events FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    auth.email() IN (SELECT email FROM admin_users)
  )
);

CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (
  auth.role() = 'authenticated' AND (
    auth.email() IN (SELECT email FROM admin_users)
  )
);

-- 4. Enable RLS (just in case it was disabled or weird state)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL ON events TO authenticated;
GRANT ALL ON events TO service_role;
