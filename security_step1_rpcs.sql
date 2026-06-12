-- ════════════════════════════════════════════════════════════════
-- PASO 1 — Funciones seguras (NO rompe nada; ejecutar PRIMERO)
-- ⚠️ ANTES DE EJECUTAR: cambia 'CAMBIA_ESTA_CLAVE' por tu nueva
--    contraseña de admin. NO uses mundial2026admin (quedó pública
--    en el código fuente del repositorio).
-- ════════════════════════════════════════════════════════════════

-- Contraseña de admin guardada en el servidor (nadie puede leerla)
create table if not exists admin_config(
  id int primary key default 1,
  password text not null
);
insert into admin_config(id,password) values(1,'CAMBIA_ESTA_CLAVE')
  on conflict (id) do update set password=excluded.password;
alter table admin_config enable row level security;  -- sin políticas → ilegible
revoke all on admin_config from anon, authenticated;

-- ── Login de participante: valida nombre+PIN en el servidor ──────
create or replace function verify_login(p_name text, p_pin text)
returns setof participants language sql security definer set search_path=public as $$
  select * from participants where lower(name)=lower(trim(p_name)) and pin=p_pin;
$$;

-- ── Guardar predicciones: exige el PIN del dueño ─────────────────
create or replace function save_predictions(p_pid uuid, p_pin text, p_rows jsonb)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from participants where id=p_pid and pin=p_pin) then
    raise exception 'PIN inválido';
  end if;
  insert into predictions(participant_id, match_id, home_score, away_score, phase)
  select p_pid,(r->>'match_id')::int,(r->>'home_score')::int,(r->>'away_score')::int,(r->>'phase')::int
  from jsonb_array_elements(p_rows) r
  on conflict (participant_id, match_id, phase) do update
    set home_score=excluded.home_score, away_score=excluded.away_score;
end $$;

-- ── Borrar bracket propio (botón de arrepentimiento) ─────────────
create or replace function delete_bracket(p_pid uuid, p_pin text, p_phase int)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from participants where id=p_pid and pin=p_pin) then
    raise exception 'PIN inválido';
  end if;
  delete from predictions where participant_id=p_pid and phase=p_phase and match_id>=101;
end $$;

-- ── Funciones de ADMIN (validan contraseña en el servidor) ───────
create or replace function admin_ok(p_pass text)
returns boolean language sql security definer set search_path=public as $$
  select exists(select 1 from admin_config where id=1 and password=p_pass);
$$;

create or replace function admin_check(p_pass text)
returns boolean language sql security definer set search_path=public as $$
  select admin_ok(p_pass);
$$;

create or replace function admin_list_participants(p_pass text)
returns setof participants language plpgsql security definer set search_path=public as $$
begin
  if not admin_ok(p_pass) then raise exception 'No autorizado'; end if;
  return query select * from participants order by total_points desc, name;
end $$;

create or replace function admin_create_participant(p_pass text, p_name text, p_pin text)
returns setof participants language plpgsql security definer set search_path=public as $$
begin
  if not admin_ok(p_pass) then raise exception 'No autorizado'; end if;
  return query insert into participants(name,pin,total_points,paid)
    values(p_name,p_pin,0,false) returning *;
end $$;

create or replace function admin_delete_participant(p_pass text, p_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not admin_ok(p_pass) then raise exception 'No autorizado'; end if;
  delete from participants where id=p_id;
end $$;

create or replace function admin_toggle_paid(p_pass text, p_id uuid, p_paid boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not admin_ok(p_pass) then raise exception 'No autorizado'; end if;
  update participants set paid=p_paid where id=p_id;
end $$;

create or replace function admin_update_points(p_pass text, p_id uuid, p_points int, p_breakdown text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not admin_ok(p_pass) then raise exception 'No autorizado'; end if;
  update participants set total_points=p_points, breakdown=p_breakdown where id=p_id;
end $$;

create or replace function admin_save_result(p_pass text, p_mid int, p_h int, p_a int)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not admin_ok(p_pass) then raise exception 'No autorizado'; end if;
  insert into results(match_id,home_score,away_score) values(p_mid,p_h,p_a)
  on conflict (match_id) do update set home_score=excluded.home_score, away_score=excluded.away_score;
end $$;

create or replace function admin_delete_result(p_pass text, p_mid int)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not admin_ok(p_pass) then raise exception 'No autorizado'; end if;
  delete from results where match_id=p_mid;
end $$;

create or replace function admin_save_settings(p_pass text, p_phase int, p_l1 boolean, p_l2 boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not admin_ok(p_pass) then raise exception 'No autorizado'; end if;
  update settings set phase=p_phase, phase1_locked=p_l1, phase2_locked=p_l2 where id=1;
end $$;
