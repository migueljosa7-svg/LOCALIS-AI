-- ════════════════════════════════════════════════════════════════
--  LOCALIS AI · Esquema de base de datos (Supabase / PostgreSQL)
--  Ejecutar UNA vez en: Supabase → SQL Editor → New query → Run.
--
--  Seguridad: RLS activado y SIN políticas → nadie puede leer ni escribir
--  con la clave pública (anon). Solo el servidor de la web, con la clave
--  service_role guardada en Vercel, accede a los datos.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Leads: solicitudes que llegan desde los formularios de la web ──
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  business_name   text not null check (char_length(business_name) between 2 and 120),
  contact_name    text not null check (char_length(contact_name) between 2 and 120),
  email           text not null check (char_length(email) <= 160),
  phone           text not null check (char_length(phone) <= 40),
  service         text not null check (char_length(service) <= 120),  -- servicio / sector solicitado
  source          text check (char_length(source) <= 120),            -- formulario de origen
  details         text check (char_length(details) <= 1200),          -- configuración del estudio
  prompt          text check (char_length(prompt) <= 8000),           -- prompt técnico generado
  status          text not null default 'nuevo'
                  check (status in ('nuevo', 'contactado', 'propuesta', 'ganado', 'perdido')),
  notes           text check (char_length(notes) <= 4000),
  email_notified  boolean not null default false
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
alter table public.leads enable row level security;

-- ── Oportunidades: empresas investigadas por el Lead Engine ──
-- Regla: solo empresas reales con fuente pública. Cada problema indica si es
-- un HECHO comprobado o una HIPÓTESIS, con su evidencia.
create table if not exists public.opportunities (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  researched_at       date not null default current_date,
  company             text not null check (char_length(company) between 2 and 160),
  locality            text not null check (char_length(locality) <= 80),
  sector              text not null check (char_length(sector) <= 80),
  website             text check (char_length(website) <= 300),         -- null = no tiene web
  source_url          text not null check (char_length(source_url) <= 500),
  problem             text not null check (char_length(problem) <= 500),
  evidence            text not null check (char_length(evidence) <= 1000),
  evidence_type       text not null check (evidence_type in ('hecho', 'hipotesis')),
  recommended_service text not null check (char_length(recommended_service) <= 120),
  score               smallint not null default 0 check (score between 0 and 100),
  priority            text not null default 'media' check (priority in ('alta', 'media', 'baja')),
  status              text not null default 'investigada'
                      check (status in ('investigada', 'auditoria_lista', 'propuesta_lista', 'contactada', 'descartada', 'cliente')),
  next_step           text check (char_length(next_step) <= 300),
  notes               text check (char_length(notes) <= 4000),
  unique (company, locality)
);

create index if not exists opportunities_score_idx on public.opportunities (score desc);
alter table public.opportunities enable row level security;
