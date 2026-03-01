-- Migration: Add Plex server columns to plex_connections table
-- Run this in Supabase SQL Editor

ALTER TABLE public.plex_connections
ADD COLUMN IF NOT EXISTS plex_server_url TEXT,
ADD COLUMN IF NOT EXISTS plex_server_name TEXT,
ADD COLUMN IF NOT EXISTS plex_server_machine_id TEXT;

-- Add comment
COMMENT ON COLUMN public.plex_connections.plex_server_url IS 'User selected Plex server URL (e.g., https://192.168.1.100:32400)';
COMMENT ON COLUMN public.plex_connections.plex_server_name IS 'User selected Plex server name';
COMMENT ON COLUMN public.plex_connections.plex_server_machine_id IS 'Plex server machine identifier';
