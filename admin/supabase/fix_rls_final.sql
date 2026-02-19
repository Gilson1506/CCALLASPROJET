-- ============================================
-- FIX RLS & STORAGE POLICIES
-- Run this script in Supabase SQL Editor
-- ============================================

-- 1. Ensure Admin User Exists
-- Replace 'admin@ccallas.ao' with your ACTUAL email if different
INSERT INTO admin_users (email) VALUES ('admin@ccallas.ao') ON CONFLICT (email) DO NOTHING;
-- Also add 'admin@arena.ao' just in case
INSERT INTO admin_users (email) VALUES ('admin@arena.ao') ON CONFLICT (email) DO NOTHING;

-- 2. Fix admin_users RLS (Prevent infinite recursion)
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;
CREATE POLICY "Admins can read admin_users" ON admin_users FOR SELECT USING (
  email = auth.email()
);

-- 3. Storage Policies (Images & Files)
-- Allow Public Read for images and files
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING ( bucket_id IN ('images', 'files') );

-- Allow Authenticated Users (Admins) to Upload/Update/Delete
-- We rely on the fact that only Admins can log in (public signup disabled)
DROP POLICY IF EXISTS "Admin Storage Insert" ON storage.objects;
CREATE POLICY "Admin Storage Insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('images', 'files') AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Storage Update" ON storage.objects;
CREATE POLICY "Admin Storage Update" ON storage.objects FOR UPDATE USING (
  bucket_id IN ('images', 'files') AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Storage Delete" ON storage.objects;
CREATE POLICY "Admin Storage Delete" ON storage.objects FOR DELETE USING (
  bucket_id IN ('images', 'files') AND auth.role() = 'authenticated'
);

-- 4. Verify Buckets (Optional - just ensuring policies apply)
-- Ensure 'images' and 'files' buckets exist in the Storage dashboard.
