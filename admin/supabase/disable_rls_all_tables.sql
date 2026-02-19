-- ============================================
-- DISABLE RLS FOR ALL CONTENT TABLES
-- Run this script in Supabase SQL Editor
-- ============================================

-- Disable RLS on all relevant tables to prevent 403 errors
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE news DISABLE ROW LEVEL SECURITY;
ALTER TABLE fairs DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Ensure public/authenticated/service access
GRANT ALL ON events TO anon, authenticated, service_role;
GRANT ALL ON news TO anon, authenticated, service_role;
GRANT ALL ON fairs TO anon, authenticated, service_role;
GRANT ALL ON calendar_dates TO anon, authenticated, service_role;
GRANT ALL ON site_config TO anon, authenticated, service_role;
GRANT ALL ON partners TO anon, authenticated, service_role;
GRANT ALL ON registrations TO anon, authenticated, service_role;
GRANT ALL ON newsletter_subscribers TO anon, authenticated, service_role;
GRANT ALL ON messages TO anon, authenticated, service_role;

-- Storage Policy Check (Allow All)
DROP POLICY IF EXISTS "Allow All Storage" ON storage.objects;
CREATE POLICY "Allow All Storage" ON storage.objects FOR ALL USING (true) WITH CHECK (true);
