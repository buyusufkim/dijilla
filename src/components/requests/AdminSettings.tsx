import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Save, Phone, Building2, FileText, Check, ArrowUpRight } from 'lucide-react';
import { requestApi, money } from '@/lib/request-api';
import { applicationSettingsSchema, type ApplicationSettings } from '@/domain/settings';
import { requestKinds, kindLabels } from '@/domain/requests';

const input = 'mt-2 w-full rounded-xl border border-white/10 bg-[#0c1629] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10';
const card = 'rounded-2xl border border-white/[0.08] bg-[#152136] p-5 sm:p-6';
export type SavedHandler = (message:string,verify?:(fresh:any)=>boolean)=>Promise<void>;
function draftFrom(s:any): ApplicationSettings {
  return {version:s.version,phone:s.phone,whatsapp:s.whatsapp,privacy_text:s.privacy_text,requests_enabled:s.requests_enabled,business_name:s.business_name??'',support_email:s.support_email??'',support_hours:s.support_hours??'',enabled_kinds:s.enabled_kinds??[...requestKinds]};
}
function TextField({label,hint,...props}:React.InputHTMLAttributes<HTMLInputElement>&{label:string;hint?:string}) {
  return <label className="block text-sm font-medium text-slate-200">{label}<input {...props} className={input}/>{hint&&<span className="mt-2 block text-xs font-normal text-slate-400">{hint}</span>}</label>;
}
export function AdminSettings({bootstrap,onSaved,section='general'}:{bootstrap:any;onSaved:SavedHandler;section?:'general'|'packages'}) {
  const [draft,setDraft]=useState(()=>draftFrom(bootstrap.settings));
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const errorBox=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(error)errorBox.current?.scrollIntoView({block:'center',behavior:'smooth'});},[error]);
  const set=(key:keyof ApplicationSettings,value:unknown)=>setDraft(current=>({...current,[key]:value}));
  const dirty=JSON.stringify(draft)!==JSON.stringify(draftFrom(bootstrap.settings));
  async function save(event:FormEvent) {
    event.preventDefault();setError('');
    const result=applicationSettingsSchema.safeParse(draft);
    if(!result.success){setError(result.error.issues.map(issue=>issue.message).join(' '));return;}
    setBusy(true);
    try {
      const saved=await requestApi('/settings',{method:'PUT',body:JSON.stringify(result.data)});
      if(saved.settings.version!==draft.version+1)throw new Error('Kaydetme sonucu doğrulanamadı. Sayfayı yenileyin.');
      await onSaved(saved.settings.requests_enabled?'Ayarlar kaydedildi. Talep alımı açık.':'Ayarlar kaydedildi. Talep alımı kapalı.',fresh=>fresh.settings.version===saved.settings.version&&fresh.settings.requests_enabled===saved.settings.requests_enabled);
    } catch(e:any){setError(e.message);}finally{setBusy(false);}
  }
  if(section==='packages')return <div className="space-y-5"><div><h2 className="text-xl font-semibold">Yol yardım paketleri</h2><p className="mt-2 text-sm text-slate-400">Fiyat ve kapsam değişiklikleri yeni taleplere uygulanır. Kayıtlı taleplerin satış bilgileri korunur.</p></div><div className="grid gap-5 xl:grid-cols-3">{bootstrap.catalog.map((p:any)=><PackageEditor key={`${p.id}-${p.version}`} item={p} onSaved={onSaved}/>)}</div></div>;
  return <form onSubmit={save} className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Genel ayarlar</h2><p className="mt-1 text-sm text-slate-400">İşletme bilgilerini ve başvuru kanallarını yönetin.</p></div><button disabled={busy||!dirty} className="flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#081323] disabled:opacity-40"><Save size={17}/>{busy?'Kaydediliyor…':'Değişiklikleri kaydet'}</button></div>
    {error&&<div ref={errorBox} role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"><strong>Kaydedilemedi.</strong> {error}</div>}
    <fieldset disabled={busy} className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px] disabled:opacity-60">
      <div className="space-y-5">
        <section className={card}><div className="mb-5 flex items-center gap-3"><Building2 size={19} className="text-cyan-300"/><h3 className="font-semibold">İşletme ve iletişim</h3></div><div className="grid gap-5 sm:grid-cols-2">
          <TextField label="İşletme adı" value={draft.business_name} maxLength={160} placeholder="Müşterinin göreceği işletme adı" onChange={e=>set('business_name',e.target.value)}/>
          <TextField label="Destek e-postası" type="email" value={draft.support_email} placeholder="destek@firmaniz.com" onChange={e=>set('support_email',e.target.value)}/>
          <TextField label="Çağrı merkezi telefonu" type="tel" value={draft.phone} placeholder="0850 000 00 00" hint="Boşluklu, 0 veya +90 ile başlayan numara girebilirsiniz." onChange={e=>set('phone',e.target.value)}/>
          <TextField label="WhatsApp numarası" type="tel" value={draft.whatsapp} placeholder="05xx xxx xx xx" hint="İsteğe bağlı. Yalnız bu numarada WhatsApp hizmeti veriyorsanız doldurun." onChange={e=>set('whatsapp',e.target.value)}/>
          <div className="sm:col-span-2"><TextField label="Destek saatleri" value={draft.support_hours} maxLength={160} placeholder="Örn. Hafta içi 09.00–18.00" onChange={e=>set('support_hours',e.target.value)}/></div>
        </div></section>
        <section className={card}><div className="mb-2 flex items-center gap-3"><Phone size={19} className="text-cyan-300"/><h3 className="font-semibold">Talep alımı</h3></div><p className="mb-5 text-sm text-slate-400">Ana anahtar tüm yeni başvuruları kontrol eder. Mevcut taleplerinize erişim devam eder.</p>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0c1629] p-4"><span><span className="block font-medium">Yeni talepleri kabul et</span><span className="mt-1 block text-xs text-slate-400">Değişiklik, kaydettikten sonra geçerli olur.</span></span><input type="checkbox" className="h-6 w-6 shrink-0 accent-cyan-300" checked={draft.requests_enabled} onChange={e=>set('requests_enabled',e.target.checked)}/></label>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{requestKinds.map(kind=><label key={kind} className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-cyan-300" checked={draft.enabled_kinds.includes(kind)} onChange={e=>set('enabled_kinds',e.target.checked?[...draft.enabled_kinds,kind]:draft.enabled_kinds.filter(value=>value!==kind))}/>{kindLabels[kind]}</label>)}</div>
        </section>
        <section className={card}><div className="mb-2 flex items-center gap-3"><FileText size={19} className="text-cyan-300"/><h3 className="font-semibold">Müşteri bilgilendirmesi</h3></div><p className="text-sm text-slate-400">Talep formunda gösterilir ve başvuru anındaki sürümü kayıtta korunur.</p><label className="mt-5 block text-sm">İşletmeye ait bilgilendirme metni<textarea rows={7} className={input} maxLength={20000} value={draft.privacy_text} onChange={e=>set('privacy_text',e.target.value)} placeholder="İşletmenize ve sunduğunuz hizmetlere ait bilgilendirme metnini ekleyin."/></label><p className="mt-2 text-xs text-slate-500">{draft.privacy_text.length.toLocaleString('tr-TR')} / 20.000 karakter</p></section>
      </div>
      <aside className="space-y-5 xl:sticky xl:top-6"><section className={card}><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Şu anki yayın durumu</p><p className={`mt-3 text-lg font-semibold ${bootstrap.settings.requests_enabled?'text-emerald-300':'text-amber-300'}`}>{bootstrap.settings.requests_enabled?'Talep alımı açık':'Talep alımı kapalı'}</p><p className="mt-3 text-sm text-slate-400">{dirty?'Kaydedilmemiş değişiklikleriniz var.':'Görüntülenen ayarlar sunucudaki kayıtla aynı.'}</p><div className="mt-5 space-y-3 text-xs">{[{label:'Telefon girildi',ok:!!draft.phone.trim()},{label:'Bilgilendirme metni hazır',ok:draft.privacy_text.trim().length>=20},{label:'Hizmet türü seçildi',ok:!!draft.enabled_kinds.length}].map(item=><p key={item.label} className={`flex items-center gap-2 ${item.ok?'text-emerald-300':'text-slate-500'}`}><Check size={14}/>{item.label}</p>)}</div></section><section className={card}><p className="text-xs uppercase tracking-widest text-slate-400">Müşteri görünümü</p><p className="mt-4 font-semibold">{draft.business_name||'İşletme adı'}</p><p className="mt-2 break-all text-sm text-slate-400">{draft.phone||'Telefon eklenmedi'}</p><p className="mt-2 break-all text-sm text-slate-400">{draft.support_email}</p><p className="mt-2 text-xs text-slate-500">{draft.support_hours}</p><a href="/requests" className="mt-5 flex items-center gap-2 text-sm text-cyan-300">Talep ekranını aç <ArrowUpRight size={15}/></a></section></aside>
    </fieldset>
    <div className="flex justify-end"><button disabled={busy||!dirty} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#081323] disabled:opacity-40">{busy?'Kaydediliyor…':'Değişiklikleri kaydet'}</button></div>
  </form>;
}

function PackageEditor({item,onSaved}:{item:any;onSaved:SavedHandler}) {
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();const form=new FormData(event.currentTarget);setBusy(true);setError('');
    try{const saved=await requestApi(`/catalog/${item.id}`,{method:'PUT',body:JSON.stringify({version:item.version,name:String(form.get('name')).trim(),price_minor:Math.round(Number(form.get('price'))*100),description:String(form.get('description')).trim(),active:form.get('active')==='on'})});await onSaved('Paket bilgileri kaydedildi.',fresh=>fresh.catalog.some((p:any)=>p.id===item.id&&p.version===saved.package.version));}catch(e:any){setError(e.message);}finally{setBusy(false);}
  }
  return <form onSubmit={save} className={card}><div className="mb-6 flex items-center justify-between gap-2"><span className="text-xs uppercase tracking-widest text-slate-400">{item.id}</span><span className={`rounded-full px-3 py-1 text-xs ${item.active?'bg-emerald-300/10 text-emerald-300':'bg-white/5 text-slate-400'}`}>{item.active?'Görünür':'Gizli'}</span></div><p className="mb-6 text-3xl font-semibold tracking-tight">{money(item.price_minor)}</p>{error&&<p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}<fieldset disabled={busy} className="space-y-4"><TextField name="name" label="Paket adı" required defaultValue={item.name}/><TextField name="price" label="Satış fiyatı (TL)" type="number" min="0.01" step="0.01" required defaultValue={item.price_minor/100}/><label className="block text-sm">Kapsam ve açıklama<textarea name="description" rows={6} maxLength={5000} defaultValue={item.description} className={input}/></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked={item.active} className="h-4 w-4 accent-cyan-300"/>Talep formunda göster</label><button className="w-full rounded-xl border border-cyan-300/30 py-3 text-sm font-semibold text-cyan-300">{busy?'Kaydediliyor…':'Paketi kaydet'}</button></fieldset></form>;
}
