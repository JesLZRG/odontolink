-- ============================================================
-- OdontoLink -- agrega el rol "admin" a la tabla usuarios ya existente
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New query
-- (si tu proyecto es nuevo y aun no corriste sql/schema.sql, ignora este
-- archivo: ya incluye 'admin' desde el principio)
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
    add constraint usuarios_rol_check check (rol in ('paciente', 'clinica', 'admin'));
end $$;

-- ------------------------------------------------------------
-- Crea tu cuenta de administrador.
-- Contrasena: TLZHyrule86
-- El hash de abajo ya corresponde a esa contrasena (algoritmo scrypt, igual que usa la app).
-- ------------------------------------------------------------

insert into public.usuarios (email, nombre, rol, email_verificado, password_hash, session_version)
values (
  'odontolink86@gmail.com',
  'Administrador',
  'admin',
  true,
  'scrypt$ed64beb619fec7d394207129388063d2$00bf96efcd62e664132627828f90e53aa419e0c6442d592633cd2dc135064f33c0b39c19c95fc482fd99c0d7c8c63c60e524870d3608e5ab1377bc0f7a5b26f1',
  0
)
on conflict (email) do nothing;
