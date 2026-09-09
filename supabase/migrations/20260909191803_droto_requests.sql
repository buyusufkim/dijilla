-- Service writes go through the authenticated application server. Never use profiles.role.
create table public.droto_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.droto_settings (
  id boolean primary key default true check (id),
  version integer not null default 1 check (version > 0),
  phone text not null default '', whatsapp text not null default '',
  privacy_text text not null default '',
  requests_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.droto_settings(id) values(true);
create table public.droto_catalog (
  id text primary key check(id in ('eco','standard','pro')),
  name text not null, price_minor integer not null check(price_minor > 0),
  description text not null default '', active boolean not null default true,
  version integer not null default 1 check(version > 0)
);
insert into public.droto_catalog(id,name,price_minor) values
('eco','Eco Paket',75000),('standard','Standart Paket',90000),('pro','PRO Paket',150000);
create table public.droto_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  kind text not null check(kind in ('roadside','insurance','assistance','service','premium')),
  idempotency_key uuid not null,
  payload jsonb not null check(jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 15000),
  snapshot jsonb not null check(jsonb_typeof(snapshot) = 'object'),
  state jsonb not null default '{"stage":"new"}' check(jsonb_typeof(state) = 'object' and state->>'stage' in ('new','contacted','paid','issued','closed','rejected')),
  version integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id,idempotency_key)
);
create index droto_requests_owner_date on public.droto_requests(user_id,created_at desc);
create index droto_requests_date on public.droto_requests(created_at desc);
create table public.droto_request_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.droto_requests(id),
  actor_id uuid not null references auth.users(id),
  action text not null, version integer not null, created_at timestamptz not null default now(),
  unique(request_id,version)
);
create table public.droto_outbox (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.droto_requests(id),
  event text not null default 'new_request',
  status text not null default 'pending' check(status in ('pending','sent')),
  created_at timestamptz not null default now(),
  unique(request_id,event)
);
alter table public.droto_admins enable row level security;
alter table public.droto_settings enable row level security;
alter table public.droto_catalog enable row level security;
alter table public.droto_requests enable row level security;
alter table public.droto_request_events enable row level security;
alter table public.droto_outbox enable row level security;
revoke all on public.droto_admins, public.droto_settings, public.droto_catalog, public.droto_requests, public.droto_request_events, public.droto_outbox from anon, authenticated;
grant select on public.droto_requests to authenticated;
create policy droto_owner_read on public.droto_requests for select to authenticated using ((select auth.uid()) = user_id);
grant all on public.droto_admins, public.droto_settings, public.droto_catalog, public.droto_requests, public.droto_request_events, public.droto_outbox to service_role;
grant usage,select on sequence public.droto_request_events_id_seq to service_role;

create function public.droto_create_request(p_user uuid,p_kind text,p_payload jsonb,p_package text,p_catalog_version integer,p_settings_version integer,p_key uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.droto_requests; s public.droto_settings; c public.droto_catalog; snap jsonb;
begin
  -- Serializes per-user creation to make both deduplication and daily cap atomic.
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  select * into r from public.droto_requests where user_id=p_user and idempotency_key=p_key;
  if found then
    if r.kind<>p_kind or r.payload<>p_payload or coalesce(r.snapshot->>'packageId','')<>coalesce(p_package,'') then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
    return to_jsonb(r);
  end if;
  select * into s from public.droto_settings where id=true for share;
  if not s.requests_enabled or length(trim(s.privacy_text))<20 then raise exception 'NOT_CONFIGURED'; end if;
  if s.version<>p_settings_version then raise exception 'VERSION_CONFLICT'; end if;
  if (select count(*) from public.droto_requests where user_id=p_user and created_at >= now()-interval '24 hours') >= 20 then raise exception 'RATE_LIMIT'; end if;
  snap := jsonb_build_object('settingsVersion',s.version,'privacyText',s.privacy_text,'acknowledgedAt',now());
  if p_kind='roadside' then
    select * into c from public.droto_catalog where id=p_package and active for share;
    if not found then raise exception 'PACKAGE_UNAVAILABLE'; end if;
    if c.version<>p_catalog_version then raise exception 'VERSION_CONFLICT'; end if;
    snap := snap || jsonb_build_object('packageId',c.id,'name',c.name,'priceMinor',c.price_minor,'currency','TRY','catalogVersion',c.version,'description',c.description,'waitingHours',24,'termYears',1,'cancellationDays',15);
  elsif p_kind='premium' then
    if p_payload->>'cycle' not in ('monthly','yearly') then raise exception 'INVALID_CYCLE'; end if;
    snap := snap || jsonb_build_object('priceMinor',case when p_payload->>'cycle'='yearly' then 199000 else 19900 end,'currency','TRY','cycle',p_payload->>'cycle');
  end if;
  insert into public.droto_requests(user_id,kind,idempotency_key,payload,snapshot) values(p_user,p_kind,p_key,p_payload,snap) returning * into r;
  insert into public.droto_request_events(request_id,actor_id,action,version) values(r.id,p_user,'created',1);
  insert into public.droto_outbox(request_id) values(r.id);
  return to_jsonb(r);
end $$;

create function public.droto_update_request(p_id uuid,p_actor uuid,p_version integer,p_action text,p_state jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.droto_requests; is_admin boolean;
begin
  select exists(select 1 from public.droto_admins where user_id=p_actor) into is_admin;
  select * into r from public.droto_requests where id=p_id for update;
  if not found or (not is_admin and r.user_id<>p_actor) then raise exception 'NOT_FOUND'; end if;
  if r.version<>p_version then raise exception 'VERSION_CONFLICT'; end if;
  if not is_admin and (p_action<>'cancel_request' or p_state-'cancellation'<>r.state-'cancellation' or p_state->'cancellation'->>'decision'<>'pending') then raise exception 'FORBIDDEN'; end if;
  update public.droto_requests set state=p_state,version=version+1,updated_at=now() where id=p_id returning * into r;
  insert into public.droto_request_events(request_id,actor_id,action,version) values(p_id,p_actor,p_action,r.version);
  return to_jsonb(r);
end $$;
revoke all on function public.droto_create_request(uuid,text,jsonb,text,integer,integer,uuid) from public,anon,authenticated;
revoke all on function public.droto_update_request(uuid,uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.droto_create_request(uuid,text,jsonb,text,integer,integer,uuid) to service_role;
grant execute on function public.droto_update_request(uuid,uuid,integer,text,jsonb) to service_role;

-- No browser storage policies: PDFs are uploaded and signed only by the authorized API.
-- Preserve historical rows, but retire direct writes to simulated checkout tables.
do $$
declare table_name text;
begin
  foreach table_name in array array['quote_requests','normalized_offers','checkouts','policies'] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('revoke insert, update, delete on table public.%I from anon, authenticated', table_name);
    end if;
  end loop;
end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('droto-contracts','droto-contracts',false,5242880,array['application/pdf'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['application/pdf'];
