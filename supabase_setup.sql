-- ═══════════════════════════════════════════════════════════════
-- SUPABASE SETUP — POLLA MUNDIAL FIFA
-- Ejecutar TODO este archivo en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════

-- TABLA: participants
CREATE TABLE IF NOT EXISTS participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  pin text DEFAULT '0000',
  total_points integer DEFAULT 0,
  paid boolean DEFAULT false,
  breakdown text,
  created_at timestamptz DEFAULT now()
);

-- TABLA: predictions
CREATE TABLE IF NOT EXISTS predictions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  match_id integer NOT NULL,
  home_score integer,
  away_score integer,
  phase integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_id, match_id)
);

-- TABLA: results
CREATE TABLE IF NOT EXISTS results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id integer UNIQUE NOT NULL,
  home_score integer,
  away_score integer,
  created_at timestamptz DEFAULT now()
);

-- TABLA: settings
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1,
  phase integer DEFAULT 1,
  phase1_locked boolean DEFAULT false,
  phase2_locked boolean DEFAULT false,
  real_classified text DEFAULT null
);

-- Insertar configuración inicial
INSERT INTO settings (id, phase, phase1_locked, phase2_locked)
VALUES (1, 1, false, false)
ON CONFLICT (id) DO NOTHING;

-- POLÍTICAS RLS (Row Level Security)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Políticas para participants
CREATE POLICY "read_participants" ON participants FOR SELECT USING (true);
CREATE POLICY "insert_participant" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "update_participant" ON participants FOR UPDATE USING (true);
CREATE POLICY "delete_participant" ON participants FOR DELETE USING (true);

-- Políticas para predictions
CREATE POLICY "read_predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "insert_predictions" ON predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "update_predictions" ON predictions FOR UPDATE USING (true);
CREATE POLICY "delete_predictions" ON predictions FOR DELETE USING (true);

-- Políticas para results
CREATE POLICY "read_results" ON results FOR SELECT USING (true);
CREATE POLICY "insert_results" ON results FOR INSERT WITH CHECK (true);
CREATE POLICY "update_results" ON results FOR UPDATE USING (true);
CREATE POLICY "delete_results" ON results FOR DELETE USING (true);

-- Políticas para settings
CREATE POLICY "read_settings" ON settings FOR SELECT USING (true);
CREATE POLICY "insert_settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "update_settings" ON settings FOR UPDATE USING (true);

-- ═══════════════════════════════════════════════════════════════
-- PARA RESETEAR DATOS ENTRE TORNEOS (ejecutar cuando quieras)
-- ═══════════════════════════════════════════════════════════════
-- DELETE FROM results;
-- DELETE FROM predictions;
-- DELETE FROM participants;
-- UPDATE settings SET
--   phase = 1,
--   phase1_locked = false,
--   phase2_locked = false,
--   real_classified = null
-- WHERE id = 1;
