-- ============================================================
-- OdontoLink -- flujo de aprobacion manual de clinicas nuevas.
-- Las clinicas existentes (sembradas manualmente) quedan aprobadas de una
-- vez; las que se registren de aqui en adelante nacen "pendiente" y no
-- aparecen en el directorio ni pueden recibir citas hasta que un admin
-- las apruebe desde /admin.
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

alter table public.clinicas
  add column if not exists estado_aprobacion text not null default 'aprobada'
    check (estado_aprobacion in ('pendiente', 'aprobada', 'rechazada'));

alter table public.clinicas
  alter column estado_aprobacion set default 'pendiente';

notify pgrst, 'reload schema';
