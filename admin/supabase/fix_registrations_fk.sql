-- Make event_id nullable to allow registrations for calendar events (which don't exist in the events table)
ALTER TABLE registrations ALTER COLUMN event_id DROP NOT NULL;

-- Optionally, drop the foreign key constraint entirely if it's too restrictive
-- ALTER TABLE registrations DROP CONSTRAINT registrations_event_id_fkey;
