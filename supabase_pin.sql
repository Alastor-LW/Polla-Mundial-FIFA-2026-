-- Agregar columna PIN a participantes
ALTER TABLE participants ADD COLUMN IF NOT EXISTS pin text default '0000';
