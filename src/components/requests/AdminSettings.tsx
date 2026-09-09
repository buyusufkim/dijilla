import { useState, type FormEvent } from 'react';
import { requestApi } from '@/lib/request-api';
import { Field,fieldClass } from './RequestForm';

export function AdminSettings({ bootstrap,onSaved }: {bootstrap:any;onSaved:()=>void}) {
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  async function save(event:FormEvent<HTMLFormElement>,path:string,version:number) {
    event.preventDefault();const f=new FormData(event.currentTarget);const value=(key:string)=>String(f.get(key)??'');
    const body=path==='/settings'?{version,phone:value('phone'),whatsapp:value('whatsapp'),privacy_text:value('privacy_text'),requests_enabled:f.get('requests_enabled')==='on'}:{version,name:value('name'),price_minor:Math.round(Number(value('price'))*100),description:value('description'),active:f.get('active')==='on'};
    setBusy(true);setMessage('');try{await requestApi(path,{method:'PUT',body:JSON.stringify(body)});setMessage('Kaydedildi.');onSaved();}catch(e:any){setMessage(e.message);}finally{setBusy(false);}
  }
  const settings=bootstrap.settings;
  return <details className="rounded-2xl border border-white/20 p-5"><summary className="cursor-pointer font-semibold">İletişim, bilgilendirme ve paket ayarları</summary><fieldset disabled={busy} className="mt-5 space-y-6">
    <form key={settings.version} onSubmit={e=>{void save(e,'/settings',settings.version);}} className="space-y-3"><Field name="phone" label="Çağrı merkezi telefonu (90 ile başlayan 12 hane)" defaultValue={settings.phone} required={false}/><Field name="whatsapp" label="WhatsApp (90 ile başlayan 12 hane)" defaultValue={settings.whatsapp} required={false}/><label className="block">İşletmeye ait bilgilendirme metni<textarea name="privacy_text" rows={8} maxLength={20000} className={fieldClass} defaultValue={settings.privacy_text}/></label><label className="block"><input type="checkbox" name="requests_enabled" defaultChecked={settings.requests_enabled}/> Talep alımını aç</label><button className="rounded-lg bg-cyan-400 p-3 text-slate-950">Ayarları kaydet</button></form>
    {bootstrap.catalog.map((p:any)=><form key={`${p.id}-${p.version}`} onSubmit={e=>{void save(e,`/catalog/${p.id}`,p.version);}} className="space-y-3 border-t border-white/10 pt-5"><Field name="name" label="Paket adı" defaultValue={p.name}/><Field name="price" label="Satış fiyatı (TL)" type="number" step="0.01" min="0.01" defaultValue={p.price_minor/100}/><label className="block">Paket açıklaması / doğrulanmış kapsam<textarea name="description" className={fieldClass} rows={4} defaultValue={p.description} maxLength={5000}/></label><label className="block"><input type="checkbox" name="active" defaultChecked={p.active}/> Paketi talep formunda göster</label><button className="underline">Paketi kaydet</button></form>)}
    </fieldset>{message&&<p role="status" className="mt-4">{message}</p>}</details>;
}
