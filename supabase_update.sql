-- Actualización de tabla settings para soportar bloqueo de fases
ALTER TABLE settings ADD COLUMN IF NOT EXISTS phase1_locked boolean default false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS phase2_locked boolean default false;

-- Actualizar el registro existente
UPDATE settings SET phase1_locked = false, phase2_locked = false WHERE id = 1;
