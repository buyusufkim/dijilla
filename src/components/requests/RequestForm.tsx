import { useState, type FormEvent } from 'react';
import { requestKinds, kindLabels, usageTypes, parseRequest } from '@/domain/requests';
import { requestApi, money } from '@/lib/request-api';

export const fieldClass = 'mt-1 w-full rounded-lg border border-white/20 bg-[#0A1128] p-3 text-white';
export function Field({ name, label, type = 'text', required = true, ...props }: { name: string; label: string; type?: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-sm">{label}<input {...props} name={name} type={type} required={required} className={fieldClass} /></label>;
}
export function RequestForm({ bootstrap, initialKind = 'roadside', onCreated }: { bootstrap: any; initialKind?: typeof requestKinds[number]; onCreated: (id: string) => void }) {
  const [kind, setKind] = useState(initialKind);
  const [customerType, setCustomerType] = useState('individual');
  const [packageId, setPackageId] = useState('eco');
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const settings = bootstrap.settings;
  const packages = bootstrap.catalog.filter((p: any) => p.active);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = event.currentTarget; const values = new FormData(form); const get = (name: string) => String(values.get(name) ?? '').trim();
    let payload: Record<string, unknown>;
    if (kind === 'roadside') {
      const contact = { phone: get('phone'), city: get('city'), district: get('district'), email: get('email') };
      const customer = customerType === 'individual' ? { type: customerType, firstName: get('firstName'), lastName: get('lastName'), identityNumber: get('identityNumber'), ...contact } : { type: customerType, taxNumber: get('taxNumber'), taxOffice: get('taxOffice'), companyName: get('companyName'), ...contact };
      payload = { customer, vehicle: { plate: get('plate'), usage: get('usage'), modelYear: Number(get('modelYear')), brand: get('brand'), model: get('model') } };
    } else {
      payload = { name: get('name'), phone: get('phone') };
      if (kind === 'insurance') Object.assign(payload, { product: get('product'), note: get('note') });
      if (kind === 'service') Object.assign(payload, { plate: get('plate'), serviceName: get('serviceName'), preferredDate: get('preferredDate'), note: get('note') });
      if (kind === 'assistance') Object.assign(payload, { plate: get('plate'), address: get('address'), note: get('note'), latitude: location?.latitude ?? null, longitude: location?.longitude ?? null, paidHelpAccepted: values.get('paidHelpAccepted') === 'on' });
      if (kind === 'premium') Object.assign(payload, { cycle: get('cycle') });
    }
    const selected = packages.find((p: any) => p.id === packageId);
    const input = { kind, payload, settingsVersion: settings.version, idempotencyKey: key, acknowledged: values.get('acknowledged') === 'on', ...(kind === 'roadside' ? { packageId, catalogVersion: selected?.version } : {}) };
    setError(''); setBusy(true);
    try {
      parseRequest(input);
      const result = await requestApi('', { method: 'POST', body: JSON.stringify(input) });
      form.reset(); setKey(crypto.randomUUID()); onCreated(result.request.id);
    } catch (e: any) {
      setError(e.issues ? e.issues.map((i: any) => i.message).join(' ') : e.message || 'Talep kaydedilemedi.');
    } finally { setBusy(false); }
  }
  const locate = () => {
    if (!navigator.geolocation) { setError('Konum kullanılamıyor. Adresinizi yazabilirsiniz.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(p => { setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }); setLocating(false); }, () => { setError('Konum alınamadı. Adresinizi yazabilirsiniz.'); setLocating(false); }, { timeout: 10000 });
  };
  return <section className="space-y-4 rounded-2xl border border-white/10 bg-[#1A233A] p-5">
    <h2 className="text-xl font-semibold">Yeni talep</h2>
    <label className="block">Talep türü<select className={fieldClass} value={kind} disabled={busy} onChange={e => { setKind(e.target.value as typeof kind); setError(''); setKey(crypto.randomUUID()); setLocation(null); }}>{requestKinds.map(k => <option key={k} value={k}>{kindLabels[k]}</option>)}</select></label>
    {!settings.requests_enabled ? <p role="status">Talep alımı henüz açılmadı. İletişim ve bilgilendirme ayarları tamamlandığında bu form kullanılabilecek.</p> : <form onSubmit={submit} key={kind} className="space-y-5">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
      {kind === 'roadside' && <>
        <div className="grid gap-3 sm:grid-cols-3">{packages.map((p: any) => <label key={p.id} className={`rounded-xl border p-4 cursor-pointer ${packageId === p.id ? 'border-cyan-400' : 'border-white/20'}`}><input type="radio" name="package" value={p.id} checked={packageId === p.id} onChange={() => setPackageId(p.id)} /> <strong>{p.name}</strong><p>{money(p.price_minor)}</p><p className="mt-2 text-sm whitespace-pre-wrap text-white/70">{p.description}</p></label>)}</div>
        <p className="text-sm text-white/70">Talebin ardından ödeme için iletişime geçilecektir. Paket süresi ödeme anından itibaren bir yıldır; kullanım 24 saat sonra ve bayi düzenlemesi tamamlanınca başlar. İlk 15 gün içinde hizmet kullanılmamışsa iptal ve tam iade talep edebilirsiniz.</p>
        <label className="block">Müşteri türü<select className={fieldClass} value={customerType} onChange={e => setCustomerType(e.target.value)}><option value="individual">Bireysel</option><option value="corporate">Kurumsal</option></select></label>
        <div className="grid gap-4 sm:grid-cols-2">{customerType === 'individual' ? <><Field name="firstName" label="Ad" maxLength={80} /><Field name="lastName" label="Soyad" maxLength={80} /><Field name="identityNumber" label="TC kimlik numarası" inputMode="numeric" pattern="[1-9][0-9]{10}" maxLength={11} autoComplete="off" /></> : <><Field name="companyName" label="Firma unvanı" maxLength={160} /><Field name="taxNumber" label="Vergi kimlik numarası" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} autoComplete="off" /><Field name="taxOffice" label="Vergi dairesi" maxLength={100} /></>}
          <Field name="phone" label="Telefon" type="tel" /><Field name="city" label="İl" maxLength={80} /><Field name="district" label="İlçe (isteğe bağlı)" required={false} maxLength={80} /><Field name="email" label="E-posta (isteğe bağlı)" type="email" required={false} />
          <Field name="plate" label="Türkiye plakası" maxLength={12} /><label>Kullanım türü<select name="usage" className={fieldClass}>{usageTypes.map(u => <option key={u}>{u}</option>)}</select></label><Field name="modelYear" label="Model yılı" type="number" min={1900} max={new Date().getFullYear() + 1} /><Field name="brand" label="Marka" maxLength={80} /><Field name="model" label="Araç tipi / model" maxLength={100} />
        </div>
      </>}
      {kind !== 'roadside' && <div className="grid sm:grid-cols-2 gap-4"><Field name="name" label="Ad soyad / firma unvanı" maxLength={160} /><Field name="phone" label="Telefon" type="tel" /></div>}
      {kind === 'insurance' && <label className="block">Ürün<select name="product" className={fieldClass}>{['Trafik','Kasko','Konut','DASK','Tamamlayıcı Sağlık'].map(p => <option key={p}>{p}</option>)}</select></label>}
      {(kind === 'assistance' || kind === 'service') && <Field name="plate" label="Plaka" maxLength={12} />}
      {kind === 'service' && <><Field name="serviceName" label="İstenen servis / hizmet" maxLength={160} /><Field name="preferredDate" label="Tercih edilen tarih" type="date" min={new Date().toLocaleDateString('en-CA')} /><p className="text-sm text-white/70">Bu bir rezervasyon talebidir. Randevu, servisle görüşülüp onaylandıktan sonra kesinleşir.</p></>}
      {kind === 'assistance' && <><Field name="address" label="Bulunduğunuz adres" maxLength={500} /><button type="button" onClick={locate} disabled={locating} className="text-cyan-300 underline">{locating ? 'Konum alınıyor…' : location ? 'Konum eklendi; yeniden al' : 'Konumumu ekle'}</button><p className="text-amber-200 text-sm">Bildirim ekip sevkini başlatmaz. Yardım için çağrı merkezini de arayın. Paketiniz yoksa veya kapsam dışındaysanız ücretli hizmet koşulları görüşmede belirlenir.</p><label className="block"><input type="checkbox" name="paidHelpAccepted" /> Ücretli yardım teklifi de almak istiyorum.</label></>}
      {kind === 'premium' && <><label className="block">Üyelik dönemi<select name="cycle" className={fieldClass}><option value="monthly">Aylık — 199 TL</option><option value="yearly">Yıllık — 1.990 TL</option></select></label><p className="text-sm text-white/70">Bu form üyelik talebidir. Tahsilat görüşme sonrasında yapılır; otomatik kart çekimi veya otomatik ücretli yenileme yapılmaz.</p></>}
      {['insurance','assistance','service'].includes(kind) && <label className="block">Açıklama{kind === 'insurance' ? ' (isteğe bağlı)' : ''}<textarea name="note" className={fieldClass} required={kind !== 'insurance'} maxLength={1000} /><span className="text-sm text-white/60">Bu alana kimlik numarası veya kart bilgisi yazmayın.</span></label>}
      <details className="rounded-lg border border-white/20 p-3"><summary>Bilgilendirme metni</summary><p className="mt-3 whitespace-pre-wrap text-sm">{settings.privacy_text}</p></details>
      <label className="flex gap-2 items-start"><input type="checkbox" name="acknowledged" required className="mt-1" /><span>Bilgilendirme metnini okudum. Bu işlemin bir talep oluşturduğunu, ödeme veya hizmet onayı olmadığını anladım.</span></label>
      <button disabled={busy || (kind === 'roadside' && !packages.some((p: any) => p.id === packageId))} className="rounded-xl bg-cyan-400 text-slate-950 px-5 py-3 font-semibold disabled:opacity-50">{busy ? 'Kaydediliyor…' : 'Talep oluştur'}</button>
      </fieldset>
      {error && <p role="alert" className="text-red-300">{error}</p>}
    </form>}
  </section>;
}
