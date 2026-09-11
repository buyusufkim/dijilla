export const defaultPreferences = {
  insurance_expiry: true,
  inspection_reminders: true,
  service_alerts: true,
};
export type Preferences = typeof defaultPreferences;
export type PreferenceKey = keyof Preferences;

export function readPreferences(value: unknown): Preferences {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(Object.entries(defaultPreferences).map(([key, fallback]) =>
    [key, typeof input[key] === 'boolean' ? input[key] : fallback],
  )) as Preferences;
}

// Only update the signed-in user's row; RLS remains the authority for ownership.
export async function savePreference(db: any, userId: string, previous: unknown, key: PreferenceKey, value: boolean) {
  const extra = previous && typeof previous === 'object' && !Array.isArray(previous) ? previous : {};
  const next = { ...extra, ...readPreferences(previous), [key]: value };
  let query = db.from('profiles').update({ notification_settings: next }).eq('id', userId);
  query = previous == null ? query.is('notification_settings', null) : query.filter('notification_settings', 'eq', JSON.stringify(previous));
  const { data, error } = await query.select('notification_settings').maybeSingle();
  if (error) throw new Error('Tercihiniz kaydedilemedi. Bağlantınızı kontrol edip yeniden deneyin.');
  if (!data) throw new Error('Tercihler başka bir yerde değişmiş olabilir. Yeniden yükleyip tekrar deneyin.');
  if (data.notification_settings?.[key] !== value) throw new Error('Kaydedilen tercih doğrulanamadı. Yeniden yükleyin.');
  return data.notification_settings;
}
