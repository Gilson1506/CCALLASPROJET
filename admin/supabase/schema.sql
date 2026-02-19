-- ============================================
-- Arena Eventos Pro - Database Schema
-- ============================================

-- 1. Events
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Feira',
  description TEXT,
  cover_image TEXT,
  video_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. News
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image TEXT,
  author TEXT DEFAULT 'Admin',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Fairs (Networking e Negócios)
CREATE TABLE IF NOT EXISTS fairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  hover_image TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Calendar Dates
CREATE TABLE IF NOT EXISTS calendar_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  days TEXT NOT NULL,
  month TEXT NOT NULL,
  year TEXT NOT NULL DEFAULT '2026',
  image TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Calendar File (for download)
CREATE TABLE IF NOT EXISTS site_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Patrocinador',
  website TEXT,
  phone TEXT,
  description TEXT,
  logo TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Registrations
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source TEXT DEFAULT 'site' CHECK (source IN ('site', 'evento', 'manual')),
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Messages (Site/SMS/Chat inbox)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'site' CHECK (source IN ('site', 'sms', 'chat')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row-Level Security (RLS)
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE fairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public read for published content (website)
CREATE POLICY "Public read events" ON events FOR SELECT USING (status = 'published');
CREATE POLICY "Public read news" ON news FOR SELECT USING (status = 'published');
CREATE POLICY "Public read fairs" ON fairs FOR SELECT USING (true);
CREATE POLICY "Public read calendar_dates" ON calendar_dates FOR SELECT USING (true);
CREATE POLICY "Public read site_config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Public read partners" ON partners FOR SELECT USING (is_active = true);

-- Public insert for registrations, newsletter, messages (from website)
CREATE POLICY "Public insert registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Admin full access (using anon key for now, will add auth later)
CREATE POLICY "Admin full events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full news" ON news FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full fairs" ON fairs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full calendar" ON calendar_dates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full config" ON site_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full partners" ON partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full registrations" ON registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full newsletter" ON newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full messages" ON messages FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Seed initial data
-- ============================================

-- Calendar dates
INSERT INTO calendar_dates (event_name, days, month, year, sort_order) VALUES
  ('FMCA', '20 A 24', 'MAIO', '2026', 1),
  ('EXPOAZUL', '28 A 29', 'MAIO', '2026', 2),
  ('PROJEKTA', '11 A 13', 'JUNHO', '2026', 3),
  ('FIB', '21 A 26', 'JULHO', '2026', 4),
  ('EFA', '24 A 27', 'SETEMBRO', '2026', 5);

-- Fairs
INSERT INTO fairs (name, full_name, description, image, hover_image, sort_order) VALUES
  ('FMCA', 'Feira de Moda, Cabeleireiro e Estética', 'O maior evento de moda e beleza de Angola, reunindo os principais profissionais e marcas do sector.', '/event1.jpg', '/event1-hover.jpg', 1),
  ('EXPOAZUL', 'Feira do Mar e Economia Azul', 'Promovendo o desenvolvimento sustentável dos recursos marinhos e costeiros de Angola.', '/event2.jpg', '/event2-hover.jpg', 2),
  ('PROJEKTA', 'Feira de Arquitetura, Design e Decoração', 'O ponto de encontro dos profissionais de arquitetura, design de interiores e decoração.', '/event3.jpg', '/event3-hover.jpg', 3),
  ('FIB', 'Feira Internacional de Benguela', 'A principal feira multisectorial da região centro-sul de Angola.', '/event4.jpg', '/event4-hover.jpg', 4),
  ('EFA', 'Eventos Arena', 'Eventos corporativos personalizados para empresas que buscam excelência.', '/event5.jpg', '/event5-hover.jpg', 5),
  ('Filda', 'Feira Internacional de Luanda', 'A maior feira de negócios de Angola, conectando empresas de todo o mundo.', '/event6.jpg', '/event6-hover.jpg', 6);

-- Site config defaults
INSERT INTO site_config (key, value) VALUES
  ('contact', '{"phone": "", "email": "", "address": "", "website": "", "facebook": "", "instagram": "", "twitter": "", "youtube": ""}'),
  ('about', '{"title": "Arena Eventos", "subtitle": "", "description": "", "mission": "", "vision": "", "founded_year": "", "team_size": ""}'),
  ('calendar_file', '{"url": "", "file_name": ""}');

-- Partners
INSERT INTO partners (name, category, logo, is_active, sort_order) VALUES
  ('Total', 'Patrocinador', '/partner-total.png', true, 1),
  ('Unitel', 'Patrocinador', '/partner-unitel.png', true, 2),
  ('BAI', 'Patrocinador', '/partner-bai.png', true, 3),
  ('TAAG', 'Patrocinador', '/partner-taag.png', true, 4),
  ('Sonangol', 'Patrocinador', '/partner-sonangol.png', true, 5),
  ('BFA', 'Patrocinador', '/partner-bfa.png', true, 6);
