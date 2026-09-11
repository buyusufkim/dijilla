alter table public.droto_settings
  add column if not exists business_name text not null default '',
  add column if not exists support_email text not null default '',
  add column if not exists support_hours text not null default '',
  add column if not exists enabled_kinds text[] not null default array['roadside','insurance','assistance','service','premium'];
alter table public.droto_settings add constraint droto_enabled_kinds_valid
check(enabled_kinds <@ array['roadside','insurance','assistance','service','premium']::text[]);
