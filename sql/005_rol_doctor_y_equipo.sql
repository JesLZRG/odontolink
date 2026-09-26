-- ============================================================
-- OdontoLink -- agrega el rol "doctor" y los campos necesarios para
-- cuentas de doctor ligadas a una clinica y a su propio registro en
-- public.doctores.
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

do $$
declare
  nombre_constraint text;
begin
  select conname into nombre_constraint
  from pg_constraint
  where conrelid = 'public.usuarios'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%rol%';

  if nombre_constraint is not null then
    execute format('alter table public.usuarios drop constraint %I', nombre_constraint);
  end if;

  alter table public.usuarios
    add constraint usuarios_rol_check check (rol in ('paciente', 'clinica', 'admin', 'doctor'));
end $$;

alter table public.usuarios
  add column if not exists doctor_id text references public.doctores (id) on delete set null,
  add column if not exists activo boolean not null default true;

alter table public.doctores
  add column if not exists activo boolean not null default true;

create index if not exists usuarios_doctor_idx on public.usuarios (doctor_id);

notify pgrst, 'reload schema';
