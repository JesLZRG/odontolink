-- ============================================================
-- OdontoLink -- un doctor puede tener varias especialidades (igual que una
-- clinica), restringidas a las mismas claves que usa el directorio como
-- filtro, para que busquedas/filtros nunca se rompan por texto libre.
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

alter table public.doctores
  add column if not exists especialidades text[] not null default '{}';

update public.doctores
  set especialidades = array[especialidad]
  where especialidad is not null and especialidades = '{}';

alter table public.doctores
  drop column if exists especialidad;

notify pgrst, 'reload schema';
