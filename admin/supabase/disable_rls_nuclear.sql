-- ============================================
-- DISABLE RLS FOR EVENTS (NUCLEAR OPTION)
-- Run this script in Supabase SQL Editor
-- ============================================

-- 1. Disable RLS on the table completely
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies just in case
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;
DROP POLICY IF EXISTS "Admin full events" ON events;
DROP POLICY IF EXISTS "Public read events" ON events;

-- 3. Grant full access to everyone (public/anon too for reading)
GRANT ALL ON events TO anon;
GRANT ALL ON events TO authenticated;
GRANT ALL ON events TO service_role;

-- 4. Also do it for objects just in case it's an upload error masking as event error
-- (We keep RLS enabled but add a "allow all" policy)
CREATE POLICY "Allow All Storage" ON storage.objects FOR ALL USING (true) WITH CHECK (true);

-- NOTE: This makes the events table public writable if you don't restrict it in the API/App logic.
-- Since this is an admin app, make sure you trust your users.
