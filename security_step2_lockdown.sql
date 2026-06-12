-- ════════════════════════════════════════════════════════════════
-- PASO 2 — Cierre de permisos (ejecutar SOLO cuando Claude confirme
-- que el código nuevo está desplegado y probado).
-- Después de esto, la clave anónima ya NO puede escribir nada ni
-- leer los PINs: todo pasa por las funciones del Paso 1.
-- ════════════════════════════════════════════════════════════════

-- La clave pública ya no puede escribir en ninguna tabla
revoke insert, update, delete on participants, predictions, results, settings
  from anon, authenticated;

-- Ni leer los PINs (solo columnas seguras de participants)
revoke select on participants from anon, authenticated;
grant select (id, name, total_points, paid, breakdown, created_at)
  on participants to anon, authenticated;

-- Lectura de predictions, results y settings se mantiene (la app la necesita)
