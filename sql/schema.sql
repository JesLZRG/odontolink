-- ============================================================
-- OdontoLink -- esquema de cuentas para Supabase
-- Ejecuta este script una vez en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

create table if not exists public.usuarios (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  nombre            text not null,
  rol               text not null check (rol in ('paciente', 'clinica', 'admin')),
  telefono          text,
  ciudad            text,
  clinica_id        text,
  email_verificado  boolean not null default false,
  creado_en         timestamptz not null default now(),
  password_hash     text not null,
  session_version   integer not null default 0
);

create table if not exists public.auth_tokens (
  token_hash  text primary key,
  user_id     uuid not null references public.usuarios (id) on delete cascade,
  tipo        text not null check (tipo in ('verificar_email', 'restablecer_password')),
  expira_en   timestamptz not null
);

create index if not exists auth_tokens_user_tipo_idx on public.auth_tokens (user_id, tipo);
create index if not exists auth_tokens_expira_idx on public.auth_tokens (expira_en);

-- RLS activado sin policies: bloquea el acceso con la clave publica (anon).
-- La app solo usa la service role key desde el servidor, que ignora RLS.
alter table public.usuarios enable row level security;
alter table public.auth_tokens enable row level security;

-- Permisos explicitos para el rol de servidor (service_role). Por defecto Supabase
-- ya se los da a las tablas nuevas, pero los dejamos explicitos por si el proyecto
-- tiene una configuracion distinta.
grant usage on schema public to service_role;
grant all on public.usuarios to service_role;
grant all on public.auth_tokens to service_role;

notify pgrst, 'reload schema';
