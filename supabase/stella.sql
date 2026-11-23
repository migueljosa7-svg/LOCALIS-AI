-- ════════════════════════════════════════════════════════════════
--  LOCALIS AI · Stella para clientes (Supabase / PostgreSQL)
--
--  Ejecutar UNA vez en: Supabase → SQL Editor → New query → Run.
--  Es SEGURO volver a ejecutarlo: todo usa "if not exists" / "or replace".
--  NO borra ni modifica ninguna fila existente (leads, oportunidades…).
--
--  Qué crea:
--    stella_businesses  fichas de los negocios que contratan Stella
--    stella_usage       consumo diario por negocio (mensajes, tokens, coste)
--    stella_rate        contadores persistentes de límites de uso (anti-abuso)
--    stella_gate()      comprueba límites + presupuestos en una sola llamada
--    stella_usage_add() suma el consumo de cada respuesta
--
--  Seguridad: RLS activado y SIN políticas → la clave pública (anon) no puede
--  leer ni escribir nada. Solo el servidor de la web (service_role) accede.
-- ════════════════════════════════════════════════════════════════

-- ── Negocios ──────────────────────────────────────────────────────
create table if not exists public.stella_businesses (
  id                 text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  name               text not null check (char_length(name) between 2 and 120),
  sector             text not null default '' check (char_length(sector) <= 120),
  area               text not null default '' check (char_length(area) <= 120),
  about              text not null default '' check (char_length(about) <= 1200),
  services           jsonb not null default '[]'::jsonb,   -- [{name, price?, detail?}]
  faqs               jsonb not null default '[]'::jsonb,   -- [{q, a}]
  hours              text check (char_length(hours) <= 300),
  whatsapp           text not null default '' check (whatsapp ~ '^[0-9]{0,15}$'),
  phone              text check (char_length(phone) <= 40),
  notify_email       text check (char_length(notify_email) <= 160),
  greeting           text not null default '' check (char_length(greeting) <= 400),
  not_available      text[] not null default '{}',
  privacy_url        text not null default '' check (char_length(privacy_url) <= 300),
  domains            text[] not null default '{}',          -- hosts autorizados: ejemplo.com
  active             boolean not null default false,        -- apagado por defecto
  daily_budget_usd   numeric(8,2) not null default 1 check (daily_budget_usd >= 0),
  monthly_budget_usd numeric(8,2) not null default 5 check (monthly_budget_usd >= 0),
  notes              text check (char_length(notes) <= 4000),  -- notas internas (no las ve Stella)
  source_lead_id     uuid                                    -- solicitud de la que viene (opcional)
);
alter table public.stella_businesses enable row level security;

-- ── Consumo diario por negocio ────────────────────────────────────
create table if not exists public.stella_usage (
  business_id   text not null,
  day           date not null default current_date,
  messages      integer not null default 0,
  input_tokens  bigint not null default 0,
  output_tokens bigint not null default 0,
  cost_micro    bigint not null default 0,   -- micro-dólares (1.000.000 = 1 USD)
  errors        integer not null default 0,
  contacts      integer not null default 0,
  primary key (business_id, day)
);
alter table public.stella_usage enable row level security;

-- ── Contadores de límites (ventanas fijas) ────────────────────────
create table if not exists public.stella_rate (
  key      text not null,
  bucket   bigint not null,
  count    integer not null default 0,
  expires  bigint not null,                  -- segundos epoch; se purga solo
  primary key (key, bucket)
);
alter table public.stella_rate enable row level security;

-- ── stella_gate: presupuestos + límites en UNA llamada atómica ────
--  p_rates: [{"name":"ip","key":"ip:abc:chat","window":600,"limit":30}, …]
--  Devuelve 'ok' o el motivo: 'budget:business-day', 'budget:business-month',
--  'budget:global-day', 'budget:global-month', 'rate:<name>'.
--  Un límite a null/0 se ignora (p. ej. los contactos no consumen presupuesto).
create or replace function public.stella_gate(
  p_business         text,
  p_rates            jsonb,
  p_biz_day_micro    bigint,
  p_biz_month_micro  bigint,
  p_global_day_micro bigint,
  p_global_month_micro bigint
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  r        jsonb;
  v_now    bigint := extract(epoch from now())::bigint;
  v_win    bigint;
  v_bucket bigint;
  v_count  integer;
  v_month  date := date_trunc('month', current_date)::date;
  v_spent  bigint;
begin
  -- Presupuestos (no consumen cuota si se rechazan).
  if coalesce(p_biz_day_micro, 0) > 0 then
    select coalesce(sum(cost_micro), 0) into v_spent from stella_usage where business_id = p_business and day = current_date;
    if v_spent >= p_biz_day_micro then return 'budget:business-day'; end if;
  end if;
  if coalesce(p_biz_month_micro, 0) > 0 then
    select coalesce(sum(cost_micro), 0) into v_spent from stella_usage where business_id = p_business and day >= v_month;
    if v_spent >= p_biz_month_micro then return 'budget:business-month'; end if;
  end if;
  if coalesce(p_global_day_micro, 0) > 0 then
    select coalesce(sum(cost_micro), 0) into v_spent from stella_usage where day = current_date;
    if v_spent >= p_global_day_micro then return 'budget:global-day'; end if;
  end if;
  if coalesce(p_global_month_micro, 0) > 0 then
    select coalesce(sum(cost_micro), 0) into v_spent from stella_usage where day >= v_month;
    if v_spent >= p_global_month_micro then return 'budget:global-month'; end if;
  end if;

  -- Límites de uso por ventana fija.
  for r in select * from jsonb_array_elements(coalesce(p_rates, '[]'::jsonb)) loop
    v_win := greatest((r->>'window')::bigint, 1);
    v_bucket := v_now / v_win;
    insert into stella_rate as t (key, bucket, count, expires)
    values (r->>'key', v_bucket, 1, (v_bucket + 1) * v_win + 60)
    on conflict (key, bucket) do update set count = t.count + 1
    returning t.count into v_count;
    if v_count > (r->>'limit')::integer then
      return 'rate:' || coalesce(r->>'name', 'general');
    end if;
  end loop;

  -- Limpieza ocasional de contadores caducados.
  if random() < 0.02 then
    delete from stella_rate where expires < v_now;
  end if;
  return 'ok';
end;
$$;

-- ── stella_usage_add: suma el consumo de una respuesta ────────────
create or replace function public.stella_usage_add(
  p_business text,
  p_messages integer,
  p_in       bigint,
  p_out      bigint,
  p_cost     bigint,
  p_errors   integer,
  p_contacts integer
) returns void
language sql
security definer
set search_path = public
as $$
  insert into stella_usage as u (business_id, day, messages, input_tokens, output_tokens, cost_micro, errors, contacts)
  values (p_business, current_date, p_messages, p_in, p_out, p_cost, p_errors, p_contacts)
  on conflict (business_id, day) do update set
    messages      = u.messages + excluded.messages,
    input_tokens  = u.input_tokens + excluded.input_tokens,
    output_tokens = u.output_tokens + excluded.output_tokens,
    cost_micro    = u.cost_micro + excluded.cost_micro,
    errors        = u.errors + excluded.errors,
    contacts      = u.contacts + excluded.contacts;
$$;

-- ── Permisos (obligatorios desde oct-2026) ────────────────────────
grant select, insert, update, delete on public.stella_businesses, public.stella_usage, public.stella_rate to service_role;
revoke all on public.stella_businesses, public.stella_usage, public.stella_rate from anon, authenticated;

revoke all on function public.stella_gate(text, jsonb, bigint, bigint, bigint, bigint) from public, anon, authenticated;
revoke all on function public.stella_usage_add(text, integer, bigint, bigint, bigint, integer, integer) from public, anon, authenticated;
grant execute on function public.stella_gate(text, jsonb, bigint, bigint, bigint, bigint) to service_role;
grant execute on function public.stella_usage_add(text, integer, bigint, bigint, bigint, integer, integer) to service_role;

notify pgrst, 'reload schema';
