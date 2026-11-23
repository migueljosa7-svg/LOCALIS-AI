-- ════════════════════════════════════════════════════════════════
--  LOCALIS AI · Reparación de permisos (ejecutar UNA vez si ya creaste las tablas)
--  Supabase → SQL Editor → New query → pega esto → Run.
--
--  Qué hace: da a la clave secreta del servidor (rol service_role) permiso para
--  leer y escribir leads y oportunidades, y quita cualquier acceso público.
--  NO crea, borra ni modifica filas. Se puede ejecutar varias veces sin problema.
-- ════════════════════════════════════════════════════════════════

grant usage on schema public to service_role;
grant select, insert, update, delete on public.leads, public.opportunities to service_role;
revoke all on public.leads, public.opportunities from anon, authenticated;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
notify pgrst, 'reload schema';

-- Comprobación: debe mostrar 8 filas (4 permisos x 2 tablas), todas de service_role.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('leads', 'opportunities')
  and grantee in ('service_role', 'anon', 'authenticated')
order by table_name, grantee, privilege_type;
