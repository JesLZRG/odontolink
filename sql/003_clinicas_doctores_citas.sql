-- ============================================================
-- OdontoLink -- clinicas, doctores y citas (reemplaza los mocks en memoria)
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

create table if not exists public.clinicas (
  id                text primary key,
  nombre            text not null,
  slug              text not null unique,
  descripcion       text not null,
  direccion         text not null,
  ciudad            text not null,
  telefono          text not null,
  email             text not null,
  sitio_web         text,
  imagen            text not null,
  rating            numeric(2,1) not null default 0,
  total_resenas     integer not null default 0,
  idiomas           text[] not null default '{}',
  especialidades    text[] not null default '{}',
  aseguradoras      text[] not null default '{}',
  verificada        boolean not null default false,
  plan_suscripcion  text not null default 'basico' check (plan_suscripcion in ('basico', 'profesional', 'premium')),
  horario           jsonb not null default '{}'::jsonb,
  lat               double precision,
  lng               double precision,
  creado_en         timestamptz not null default now()
);

create table if not exists public.doctores (
  id            text primary key,
  clinica_id    text not null references public.clinicas (id) on delete cascade,
  nombre        text not null,
  especialidad  text not null,
  avatar        text,
  idiomas       text[] not null default '{}',
  cedula        text
);

create table if not exists public.citas (
  id                text primary key default gen_random_uuid()::text,
  clinica_id        text not null references public.clinicas (id) on delete cascade,
  doctor_id         text references public.doctores (id) on delete set null,
  doctor_nombre     text not null,
  paciente_id       uuid references public.usuarios (id) on delete set null,
  paciente_nombre   text not null,
  paciente_email    text,
  paciente_avatar   text,
  fecha             timestamptz not null,
  duracion_minutos  integer not null default 60,
  tratamiento       text not null,
  estado            text not null default 'programada' check (estado in ('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio')),
  notas             text,
  es_turismo        boolean not null default false,
  creado_en         timestamptz not null default now()
);

create index if not exists doctores_clinica_idx on public.doctores (clinica_id);
create index if not exists citas_clinica_fecha_idx on public.citas (clinica_id, fecha);
create index if not exists citas_doctor_idx on public.citas (doctor_id);

-- RLS activado sin policies: bloquea el acceso con la clave publica (anon).
-- La app solo usa la service role key desde el servidor, que ignora RLS.
alter table public.clinicas enable row level security;
alter table public.doctores enable row level security;
alter table public.citas enable row level security;

grant usage on schema public to service_role;
grant all on public.clinicas to service_role;
grant all on public.doctores to service_role;
grant all on public.citas to service_role;

-- ------------------------------------------------------------
-- Semilla: mismos datos que estaban hardcodeados en lib/mock-data.ts,
-- para que el directorio y la agenda se vean igual tras la migracion.
-- Ver commit/migracion "crear_clinicas_doctores_citas" en Supabase para
-- el detalle completo de los inserts.
-- ------------------------------------------------------------

notify pgrst, 'reload schema';
