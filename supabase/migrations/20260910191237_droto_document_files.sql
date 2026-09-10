-- Existing document metadata is preserved; new file writes use the verified API.
alter table public.documents add column if not exists file_path text;
revoke insert, update, delete on public.documents from anon, authenticated;
grant select on public.documents to authenticated;
grant select, insert, update, delete on public.documents to service_role;
alter table public.documents enable row level security;
create index if not exists droto_documents_user_id_idx on public.documents(user_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('droto-documents','droto-documents',false,4194304,array['application/pdf','image/jpeg','image/png'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- Serialize each account's inserts so concurrent uploads cannot bypass its cap.
create function public.droto_document_limit() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text,42));
  if (select count(*) from public.documents where user_id=new.user_id) >= 100 then
    raise exception 'DOCUMENT_LIMIT';
  end if;
  return new;
end $$;
revoke all on function public.droto_document_limit() from public,anon,authenticated;
grant execute on function public.droto_document_limit() to service_role;
create trigger droto_document_limit before insert on public.documents for each row execute function public.droto_document_limit();

-- Existing permissive policies only checked the child row's user_id.
-- A restrictive policy also requires ownership of its referenced vehicle.
do $$ declare target text; begin
  foreach target in array array['expenses','maintenance_records','appointments'] loop
    execute format('create policy droto_vehicle_insert on public.%I as restrictive for insert to authenticated with check ((select auth.uid())=user_id and (vehicle_id is null or exists(select 1 from public.vehicles v where v.id=vehicle_id and v.user_id=(select auth.uid()))))',target);
    execute format('create policy droto_vehicle_update on public.%I as restrictive for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id and (vehicle_id is null or exists(select 1 from public.vehicles v where v.id=vehicle_id and v.user_id=(select auth.uid()))))',target);
  end loop;
end $$;
