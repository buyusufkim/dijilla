alter table public.profiles add column if not exists notification_settings jsonb default '{}'::jsonb;
alter table public.profiles add constraint profiles_notification_settings_shape check (
  notification_settings is null or (
    jsonb_typeof(notification_settings) = 'object'
    and (not notification_settings ? 'insurance_expiry' or jsonb_typeof(notification_settings->'insurance_expiry') = 'boolean')
    and (not notification_settings ? 'inspection_reminders' or jsonb_typeof(notification_settings->'inspection_reminders') = 'boolean')
    and (not notification_settings ? 'service_alerts' or jsonb_typeof(notification_settings->'service_alerts') = 'boolean')
  )
);
