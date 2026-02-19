-- ============================================
-- RPC Functions for Dynamic Search & Data
-- ============================================

-- Function to search content across Events and News
CREATE OR REPLACE FUNCTION search_site_content(query_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (ensure admin creates this)
AS $$
DECLARE
  events_results jsonb;
  news_results jsonb;
BEGIN
  -- Search Events
  SELECT jsonb_agg(t) INTO events_results FROM (
    SELECT id, title, description, 'evento' as type, date, cover_image as image, location
    FROM events
    WHERE status = 'published' 
    AND (title ILIKE '%' || query_text || '%' OR description ILIKE '%' || query_text || '%' OR location ILIKE '%' || query_text || '%')
    ORDER BY date DESC
    LIMIT 10
  ) t;

  -- Search News
  SELECT jsonb_agg(t) INTO news_results FROM (
    SELECT id, title, summary as description, 'noticia' as type, created_at as date, image
    FROM news
    WHERE status = 'published' 
    AND (title ILIKE '%' || query_text || '%' OR summary ILIKE '%' || query_text || '%')
    ORDER BY created_at DESC
    LIMIT 10
  ) t;

  RETURN jsonb_build_object(
    'events', COALESCE(events_results, '[]'::jsonb), 
    'news', COALESCE(news_results, '[]'::jsonb)
  );
END;
$$;

-- Function to get featured hero items (Events + Fairs combined)
CREATE OR REPLACE FUNCTION get_hero_content()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  hero_fairs jsonb;
  hero_events jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO hero_fairs FROM (
    SELECT id, name as title, full_name as subtitle, image, 'fair' as type, created_at
    FROM fairs
    -- Assuming we have is_hero_featured (if not, run add_hero_feature.sql first)
    WHERE sort_order < 10 -- simplistic fallback or add WHERE is_hero_featured = true if column exists
    ORDER BY sort_order ASC
  ) t;

  -- Just an example if we wanted events too
  -- SELECT ... INTO hero_events ...

  RETURN COALESCE(hero_fairs, '[]'::jsonb);
END;
$$;
