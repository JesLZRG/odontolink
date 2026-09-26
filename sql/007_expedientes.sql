-- ============================================================
-- OdontoLink -- expedientes clinicos por paciente (dentro de una clinica)
-- y su historial de cambios (que doctor lo edito y cuando). No hay tabla
-- propia de "pacientes" todavia (se identifican por email o nombre, igual
-- que en lib/clinicas/pacientes.ts), asi que el expediente se liga a esa
-- misma clave logica.
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

create table if not exists public.expedientes (
  id                   text primary key default gen_random_uuid()::text,
  clinica_id           text not null references public.clinicas (id) on delete cascade,
  paciente_key         text not null,
  notas                text not null default '',
  actualizado_en       timestamptz not null default now(),
  actualizado_por_id   text,
  actualizado_por_nombre text,
  creado_en            timestamptz not null default now(),
  unique (clinica_id, paciente_key)
);

create table if not exists public.expediente_historial (
  id                text primary key default gen_random_uuid()::text,
  expediente_id     text not null references public.expedientes (id) on delete cascade,
  doctor_id         text references public.doctores (id) on delete set null,
  doctor_nombre     text not null,
  notas_anteriores  text not null default '',
  notas_nuevas      text not null default '',
  creado_en         timestamptz not null default now()
);

create index if not exists expediente_historial_expediente_idx on public.expediente_historial (expediente_id, creado_en desc);

alter table public.expedientes enable row level security;
alter table public.expediente_historial enable row level security;

grant usage on schema public to service_role;
grant all on public.expedientes to service_role;
grant all on public.expediente_historial to service_role;

notify pgrst, 'reload schema';
