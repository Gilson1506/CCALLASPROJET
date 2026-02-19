-- ============================================
-- 10. Admin Users (Security)
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow existing admins to read/write to this table
-- (Bootstrap problem: how to add the first admin? We insert it manually in migration)
CREATE POLICY "Admins can read admin_users" ON admin_users FOR SELECT USING (
  auth.email() IN (SELECT email FROM admin_users)
);

-- Initial Admin Seed
INSERT INTO admin_users (email) VALUES ('admin@ccallas.ao') ON CONFLICT (email) DO NOTHING;

-- ============================================
-- UPDATE RLS POLICIES FOR SECURITY
-- ============================================

-- Drop insecure "allow all" policies
DROP POLICY IF EXISTS "Admin full events" ON events;
DROP POLICY IF EXISTS "Admin full news" ON news;
DROP POLICY IF EXISTS "Admin full fairs" ON fairs;
DROP POLICY IF EXISTS "Admin full calendar" ON calendar_dates;
DROP POLICY IF EXISTS "Admin full config" ON site_config;
DROP POLICY IF EXISTS "Admin full partners" ON partners;
DROP POLICY IF EXISTS "Admin full registrations" ON registrations;
DROP POLICY IF EXISTS "Admin full newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admin full messages" ON messages;

-- Create secure policies (Only Auth Users listed in admin_users can Write)

-- Events
CREATE POLICY "Admins can insert events" ON events FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can update events" ON events FOR UPDATE USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (auth.email() IN (SELECT email FROM admin_users));

-- News
CREATE POLICY "Admins can insert news" ON news FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can update news" ON news FOR UPDATE USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can delete news" ON news FOR DELETE USING (auth.email() IN (SELECT email FROM admin_users));

-- Fairs
CREATE POLICY "Admins can insert fairs" ON fairs FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can update fairs" ON fairs FOR UPDATE USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can delete fairs" ON fairs FOR DELETE USING (auth.email() IN (SELECT email FROM admin_users));

-- Calendar
CREATE POLICY "Admins can insert calendar" ON calendar_dates FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can update calendar" ON calendar_dates FOR UPDATE USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can delete calendar" ON calendar_dates FOR DELETE USING (auth.email() IN (SELECT email FROM admin_users));

-- Partners
CREATE POLICY "Admins can insert partners" ON partners FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can update partners" ON partners FOR UPDATE USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can delete partners" ON partners FOR DELETE USING (auth.email() IN (SELECT email FROM admin_users));

-- Site Config
CREATE POLICY "Admins can insert config" ON site_config FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can update config" ON site_config FOR UPDATE USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can delete config" ON site_config FOR DELETE USING (auth.email() IN (SELECT email FROM admin_users));

-- Registrations (Admins can view all, Public can insert)
CREATE POLICY "Admins can view registrations" ON registrations FOR SELECT USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can update registrations" ON registrations FOR UPDATE USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can delete registrations" ON registrations FOR DELETE USING (auth.email() IN (SELECT email FROM admin_users));

-- Newsletter (Admins can view all, Public can insert)
CREATE POLICY "Admins can view newsletter" ON newsletter_subscribers FOR SELECT USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can update newsletter" ON newsletter_subscribers FOR UPDATE USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can delete newsletter" ON newsletter_subscribers FOR DELETE USING (auth.email() IN (SELECT email FROM admin_users));

-- Messages (Admins can view all, Public can insert)
CREATE POLICY "Admins can view messages" ON messages FOR SELECT USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can update messages" ON messages FOR UPDATE USING (auth.email() IN (SELECT email FROM admin_users));
CREATE POLICY "Admins can delete messages" ON messages FOR DELETE USING (auth.email() IN (SELECT email FROM admin_users));
