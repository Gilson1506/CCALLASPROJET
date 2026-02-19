-- ============================================
-- Live Chat System Schema
-- ============================================

-- 1. Chat Sessions (Conversations)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT DEFAULT 'Visitante',
  user_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies

-- Public (Visitors) can create sessions
CREATE POLICY "Public insert sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
-- Public can read their own sessions (conceptually difficult without auth, but for now we allow public read to simulate the widget seeing its state, or we rely on the widget keeping the ID)
-- For MVP, we'll allow Public Select/Insert/Update specific to ID if possible, or just True for now to make it work without complex Auth. 
-- Ideally: "Public read session if ID matches" (but user is anon).
-- Let's enable Public ALL for now to prevent "Forbidden" errors during demo, assuming Admin protects the URL.
-- REAL PRODUCTION: Use `anon` key limit or matching cookie ID.
CREATE POLICY "Public all sessions" ON chat_sessions FOR ALL USING (true) WITH CHECK (true);

-- Messages policies
CREATE POLICY "Public all messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

-- Admin policies (redundant if public is open, but good for clarity)
-- (Already covered by public all, but distinct in real app)

-- 5. Realtime
-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
