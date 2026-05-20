-- ══════════════════════════════════════════════════
-- POLLA MUNDIAL 2026 - Setup de base de datos
-- Copia y pega esto en Supabase > SQL Editor > New Query
-- ══════════════════════════════════════════════════

-- 1. Participantes
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  total_points integer default 0,
  paid boolean default false,
  created_at timestamptz default now()
);

-- 2. Predicciones de partidos
create table if not exists match_predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  match_id integer not null,
  home_score integer,
  away_score integer,
  created_at timestamptz default now(),
  unique(participant_id, match_id)
);

-- 3. Predicciones de clasificados por grupo
create table if not exists group_predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  group_key text not null,
  first_place text,
  second_place text,
  created_at timestamptz default now(),
  unique(participant_id, group_key)
);

-- 4. Predicción de campeón y subcampeón
create table if not exists champion_predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  champion text,
  runner_up text,
  created_at timestamptz default now(),
  unique(participant_id)
);

-- 5. Resultados reales (los ingresa el admin)
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  match_id integer not null unique,
  home_score integer not null,
  away_score integer not null,
  created_at timestamptz default now()
);

-- 6. Función que recalcula los puntos de todos los participantes
create or replace function recalculate_points()
returns void language plpgsql as $$
declare
  p record;
  pts integer;
  mp record;
  r record;
  gp record;
  cp record;
  pred_winner integer;
  real_winner integer;
  -- group results (first/second place per group)
  real_first text;
  real_second text;
begin
  for p in select id from participants loop
    pts := 0;

    -- ── Puntos por partidos ──────────────────────────
    for mp in
      select mp.match_id, mp.home_score as ph, mp.away_score as pa,
             r.home_score as rh, r.away_score as ra
      from match_predictions mp
      join results r on r.match_id = mp.match_id
      where mp.participant_id = p.id
    loop
      if mp.ph = mp.rh and mp.pa = mp.ra then
        pts := pts + 3; -- resultado exacto
      else
        pred_winner := sign(mp.ph - mp.pa);
        real_winner := sign(mp.rh - mp.ra);
        if pred_winner = real_winner then
          pts := pts + 1; -- solo ganador/empate
        end if;
      end if;
    end loop;

    -- ── Puntos por clasificados de grupo ────────────
    -- Para cada grupo con todos sus partidos jugados,
    -- determinamos quién quedó 1° y 2° por puntos
    -- (simplificado: comparamos con lo predicho)
    for gp in
      select * from group_predictions where participant_id = p.id
    loop
      -- Calculamos el 1° y 2° real del grupo usando results + match data
      -- Usamos una subconsulta simplificada basada en puntos acumulados
      -- (La lógica completa de desempate queda para una v2)
      -- Por ahora comparamos directo con los equipos que el admin declare
      -- via la tabla group_results si existe, o skip
      null; -- placeholder: se implementa con group_results table v2
    end loop;

    -- ── Puntos por campeón/subcampeón ────────────────
    -- Estos se evalúan cuando el admin marque el partido final
    -- como resultado en la tabla results (match_id = 104 = final)

    -- Update participant total
    update participants set total_points = pts where id = p.id;
  end loop;
end;
$$;

-- 7. Habilitar acceso público (RLS policies)
alter table participants enable row level security;
alter table match_predictions enable row level security;
alter table group_predictions enable row level security;
alter table champion_predictions enable row level security;
alter table results enable row level security;

-- Permitir lectura pública de participantes (para el leaderboard)
create policy "Participantes públicos" on participants for select using (true);
create policy "Insertar participante" on participants for insert with check (true);
create policy "Actualizar participante" on participants for update using (true);

-- Predicciones: cualquiera puede insertar/leer
create policy "Leer predicciones" on match_predictions for select using (true);
create policy "Insertar predicciones" on match_predictions for insert with check (true);
create policy "Actualizar predicciones" on match_predictions for update using (true);

create policy "Leer pred grupos" on group_predictions for select using (true);
create policy "Insertar pred grupos" on group_predictions for insert with check (true);
create policy "Actualizar pred grupos" on group_predictions for update using (true);

create policy "Leer pred campeon" on champion_predictions for select using (true);
create policy "Insertar pred campeon" on champion_predictions for insert with check (true);
create policy "Actualizar pred campeon" on champion_predictions for update using (true);

-- Resultados: lectura pública
create policy "Leer resultados" on results for select using (true);
create policy "Insertar resultados" on results for insert with check (true);
create policy "Actualizar resultados" on results for update using (true);

