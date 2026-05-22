-- ══════════════════════════════════════════
-- POLLA MUNDIAL 2026 v2 — SQL Setup
-- Copia y pega en Supabase > SQL Editor
-- ══════════════════════════════════════════

-- Borra tablas anteriores si existen
drop table if exists predictions cascade;
drop table if exists results cascade;
drop table if exists participants cascade;
drop table if exists settings cascade;

-- 1. Participantes
create table participants (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  total_points integer default 0,
  paid boolean default false,
  breakdown text default '{}',
  created_at timestamptz default now()
);

-- 2. Predicciones (grupos + eliminatorias en una sola tabla)
create table predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  match_id integer not null,
  home_score integer,
  away_score integer,
  phase integer default 1,
  created_at timestamptz default now(),
  unique(participant_id, match_id)
);

-- 3. Resultados reales (admin)
create table results (
  id uuid primary key default gen_random_uuid(),
  match_id integer not null unique,
  home_score integer not null,
  away_score integer not null,
  created_at timestamptz default now()
);

-- 4. Configuración global (fase actual)
create table settings (
  id integer primary key default 1,
  phase integer default 1,
  updated_at timestamptz default now()
);
insert into settings (id, phase) values (1, 1);

-- 5. RLS policies
alter table participants enable row level security;
alter table predictions enable row level security;
alter table results enable row level security;
alter table settings enable row level security;

create policy "read_participants"  on participants for select using (true);
create policy "insert_participant" on participants for insert with check (true);
create policy "update_participant" on participants for update using (true);

create policy "read_predictions"  on predictions for select using (true);
create policy "insert_prediction" on predictions for insert with check (true);
create policy "update_prediction" on predictions for update using (true);

create policy "read_results"  on results for select using (true);
create policy "insert_result" on results for insert with check (true);
create policy "update_result" on results for update using (true);

create policy "read_settings"  on settings for select using (true);
create policy "update_settings" on settings for update using (true);
create policy "insert_settings" on settings for insert with check (true);
