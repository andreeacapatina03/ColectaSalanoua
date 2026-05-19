-- ============================================
-- SETUP SUPABASE - Colectă Fest Sala Nouă
-- Rulează acest SQL în Supabase SQL Editor
-- ============================================

-- 1. Creează tabela
CREATE TABLE IF NOT EXISTS colecta (
  id SERIAL PRIMARY KEY,
  suma NUMERIC(12, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- 2. Inserează rândul inițial (suma = 0)
INSERT INTO colecta (suma, updated_at)
VALUES (0, NOW())
ON CONFLICT DO NOTHING;

-- 3. Activează Realtime pentru tabelă
ALTER TABLE colecta REPLICA IDENTITY FULL;

-- 4. Politici RLS (Row Level Security)
ALTER TABLE colecta ENABLE ROW LEVEL SECURITY;

-- Permite oricui să citească
CREATE POLICY "Allow public read" ON colecta
  FOR SELECT USING (true);

-- Permite update (verificarea parolei se face în API)
CREATE POLICY "Allow update" ON colecta
  FOR UPDATE USING (true);

-- ============================================
-- IMPORTANT: Activează Realtime în dashboard
-- Table Editor → colecta → Enable Realtime
-- SAU: Database → Replication → colecta → toggle ON
-- ============================================
