-- ════════════════════════════════════════════════════════════════
--  LOCALIS AI · «Diseña tu web»: solicitudes de diseño (Supabase / PostgreSQL)
--
--  Ejecutar UNA vez en: Supabase → SQL Editor → New query → Run.
--  Es SEGURO volver a ejecutarlo. NO borra ni modifica ninguna fila existente
--  (leads, oportunidades…): solo crea una tabla nueva y un almacén de imágenes privado.
--
--  Qué crea:
--    design_requests        la configuración completa que elige cada cliente
--    design-uploads (bucket) imágenes que suben los clientes (PRIVADO)
--
--  Seguridad: RLS activado y SIN políticas → la clave pública (anon) no puede leer ni escribir.
--  El bucket es privado y sin políticas: solo el servidor (service_role) accede a las imágenes.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

create table if not exists public.design_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  lead_id     uuid,                                          -- lead asociado (aparece en /admin)
  stage       text not null default 'recibida'
              check (stage in ('recibida', 'en_revision', 'presupuesto_enviado', 'aceptada', 'en_construccion', 'entregada', 'descartada')),
  config      jsonb not null,                                -- toda la configuración elegida
  uploads     jsonb not null default '[]'::jsonb,            -- [{id, name, path, mime, bytes}]
  ip_hash     text check (char_length(ip_hash) <= 64),       -- huella no reversible, para límites de uso
  notes       text check (char_length(notes) <= 4000)        -- notas internas
);

create index if not exists design_requests_created_idx on public.design_requests (created_at desc);
create index if not exists design_requests_ip_idx on public.design_requests (ip_hash, created_at desc);
create index if not exists design_requests_lead_idx on public.design_requests (lead_id);
alter table public.design_requests enable row level security;

grant select, insert, update, delete on public.design_requests to service_role;
revoke all on public.design_requests from anon, authenticated;

-- ── Almacén privado de imágenes de clientes ──
-- Solo JPG/PNG/WebP, máx. 2 MB cada una. Sin políticas de acceso: nadie salvo el servidor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('design-uploads', 'design-uploads', false, 2000000, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
