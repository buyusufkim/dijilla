import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { db } from '@/lib/supabase-service';
import { readPreferences, savePreference, type PreferenceKey } from '@/lib/profile-preferences';

const options: { key: PreferenceKey; label: string; description: string }[] = [
  { key: 'insurance_expiry', label: 'Sigorta vadesi', description: 'Poliçe bitiş tarihleri için hatırlatma tercihi.' },
  { key: 'inspection_reminders', label: 'Araç muayenesi', description: 'Yaklaşan muayene tarihleri için hatırlatma tercihi.' },
  { key: 'service_alerts', label: 'Bakım ve servis', description: 'Bakım ve servis tarihleri için hatırlatma tercihi.' },
];

export default function NotificationPreferences({ userId }: { userId: string }) {
  const [raw, setRaw] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const lock = useRef(false);
  useEffect(() => {
    let current = true;
    setLoading(true); setReady(false); setError(''); setNotice('');
    void (async () => {
      try {
        const result = await db.from('profiles').select('notification_settings').eq('id', userId).maybeSingle();
        if (result.error || !result.data) throw new Error('Bildirim tercihleri yüklenemedi.');
        if (current) { setRaw(result.data.notification_settings); setReady(true); }
      } catch { if (current) setError('Bildirim tercihleri yüklenemedi. Yeniden deneyin.'); }
      finally { if (current) setLoading(false); }
    })();
    return () => { current = false; };
  }, [userId, reload]);
  const preferences = readPreferences(raw);
  async function toggle(key: PreferenceKey) {
    if (!ready || lock.current) return;
    lock.current = true; setSaving(true); setError(''); setNotice('');
    try {
      const saved = await savePreference(db, userId, raw, key, !preferences[key]);
      setRaw(saved); setNotice('Bildirim tercihiniz kaydedildi.');
    } catch (e) { setError((e as Error).message); }
    finally { lock.current = false; setSaving(false); }
  }
  return <section className="rounded-2xl border border-white/10 bg-[#1A233A] p-6">
    <h2 className="flex items-center gap-2 text-xl font-semibold"><Bell size={20} className="text-cyan-300"/>Bildirim tercihleri</h2>
    <p className="mt-3 text-sm leading-relaxed text-slate-400">Tercihleriniz hesabınıza kaydedilir. Otomatik hatırlatma gönderimi henüz devrede değildir; tarihlerinizi Garaj ve Torpido üzerinden takip edebilirsiniz.</p>
    {loading && <p role="status" className="mt-4 text-sm text-slate-400">Tercihler yükleniyor…</p>}
    {error && <div role="alert" className="mt-4 rounded-xl bg-red-300/10 p-4 text-sm text-red-200">{error}<button disabled={saving} onClick={() => setReload(n => n + 1)} className="ml-2 underline disabled:opacity-40">Yeniden yükle</button></div>}
    {notice && <p role="status" className="mt-4 text-sm text-emerald-300">{notice}</p>}
    {ready && <div className="mt-5 divide-y divide-white/10">{options.map(({ key, label, description }) => <div key={key} className="flex items-center justify-between gap-4 py-4">
      <div><h3 id={`pref-${key}`} className="text-sm font-medium">{label}</h3><p className="mt-1 text-xs text-slate-400">{description}</p></div>
      <button type="button" role="switch" aria-checked={preferences[key]} aria-labelledby={`pref-${key}`} disabled={saving} onClick={() => void toggle(key)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:opacity-40 ${preferences[key] ? 'bg-cyan-300' : 'bg-slate-600'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${preferences[key] ? 'left-1 translate-x-5' : 'left-1'}`}/></button>
    </div>)}</div>}
    {saving && <p role="status" className="text-xs text-slate-400">Kaydediliyor…</p>}
  </section>;
}
