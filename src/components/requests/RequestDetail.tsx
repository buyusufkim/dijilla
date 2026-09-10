import { useState, type FormEvent } from 'react';
import { endOfTerm, premiumEnd, kindLabels, statusLabels, type RequestRecord } from '@/domain/requests';
import { requestApi, money } from '@/lib/request-api';
import { Field, fieldClass } from './RequestForm';

const labels: Record<string,string> = { type: 'Müşteri türü', firstName: 'Ad', lastName: 'Soyad', companyName: 'Firma unvanı', identityNumber: 'TC kimlik numarası', taxNumber: 'Vergi numarası', taxOffice: 'Vergi dairesi', phone: 'Telefon', email: 'E-posta', city: 'İl', district: 'İlçe', plate: 'Plaka', usage: 'Kullanım türü', modelYear: 'Model yılı', brand: 'Marka', model: 'Model', name: 'Ad / unvan', product: 'Sigorta ürünü', note: 'Açıklama', address: 'Adres', latitude: 'Enlem', longitude: 'Boylam', paidHelpAccepted: 'Ücretli teklif isteği', serviceName: 'Servis / hizmet', preferredDate: 'Tercih edilen tarih', cycle: 'Üyelik dönemi' };
const date = (value: string) => new Date(value).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

export function RequestDetail({ record, admin, settings, onChanged }: { record: RequestRecord & {status:string}; admin: boolean; settings: any; onChanged: (id:string)=>void }) {
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [showIdentity,setShowIdentity]=useState(false);
  const state=record.state;
  const details = Object.entries(record.payload).flatMap(([key,value]) => value && typeof value==='object' ? Object.entries(value) : [[key,value]]);
  async function run(work:()=>Promise<unknown>) { setBusy(true);setError('');try { await work();onChanged(record.id); } catch(e:any){setError(e.message || 'İşlem tamamlanamadı.');}finally{setBusy(false);} }
  const action=(action:Record<string,unknown>)=>run(()=>requestApi(`/${record.id}/actions`,{method:'POST',body:JSON.stringify({version:record.version,action})}));
  async function payment(event:FormEvent<HTMLFormElement>) { event.preventDefault();const form=new FormData(event.currentTarget);const local=String(form.get('paidAt'));await action({type:'pay',paidAt:new Date(`${local}:00+03:00`).toISOString(),amountMinor:record.snapshot.priceMinor}); }
  return <section className="space-y-5 rounded-2xl border border-cyan-400/30 bg-[#1A233A] p-5">
    <header><h2 className="text-xl font-semibold">{kindLabels[record.kind]}</h2><p className="break-all text-xs text-white/60">Talep no: {record.id}</p><p className="mt-2 text-cyan-300">{statusLabels[record.status] ?? record.status}</p></header>
    <p>Talep tarihi: {date(record.created_at)}</p>
    {record.snapshot.name && <p>Paket: {record.snapshot.name}</p>}
    {record.snapshot.priceMinor && <p>Kayıtlı tutar: <strong>{money(record.snapshot.priceMinor)}</strong></p>}
    <dl className="grid sm:grid-cols-2 gap-3">{details.filter(([,value])=>value!==null && value!=='').map(([key,value])=><div key={key}><dt className="text-sm text-white/60">{labels[key]??key}</dt><dd className="break-words whitespace-pre-wrap">{['identityNumber','taxNumber'].includes(key) && !showIdentity ? '••••••'+String(value).slice(-4) : typeof value==='boolean' ? value?'Evet':'Hayır' : ({individual:'Bireysel',corporate:'Kurumsal',monthly:'Aylık',yearly:'Yıllık'} as Record<string,string>)[String(value)] ?? String(value)}</dd></div>)}</dl>
    {record.kind==='roadside' && <button className="text-sm underline" onClick={()=>setShowIdentity(!showIdentity)}>{showIdentity?'Kimlik numarasını gizle':'Kimlik numarasını göster'}</button>}
    {state.paidAt && <div className="space-y-1"><p>Ödeme zamanı: {date(state.paidAt)}</p>{record.kind==='roadside' && <><p>Kullanımın başlayabileceği zaman: {date(new Date(Date.parse(state.paidAt)+86400000).toISOString())}</p><p>Bitiş: {date(endOfTerm(state.paidAt))}</p></>}{record.kind==='premium' && <p>Üyelik bitişi: {date(premiumEnd(state.paidAt,record.snapshot.cycle))}</p>}</div>}
    {state.packageNumber && <p>Paket numarası: {state.packageNumber}</p>}
    {state.cancellation && <p>İptal talebi: {date(state.cancellation.requestedAt)}{state.cancellation.decision==='rejected'?' — İptal onaylanmadı.':''}{state.cancellation.refundedAt?` — Tam iade: ${date(state.cancellation.refundedAt)}`:''}</p>}
    <div className="flex flex-wrap gap-4">
      {settings.phone && <a className="text-cyan-300 underline" href={`tel:${settings.phone}`}>Çağrı merkezini ara</a>}
      {settings.whatsapp && <a className="text-cyan-300 underline" href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Droto talebim hakkında görüşmek istiyorum. Talep no: ${record.id}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp ile görüş</a>}
      {state.documentPath && <button className="underline" disabled={busy} onClick={()=>{void run(async()=>{const result=await requestApi(`/${record.id}/document`);window.location.assign(result.url);});}}>Paket PDF'sini indir</button>}
      {record.kind==='roadside' && !['cancel_review','refund_pending','cancelled'].includes(record.status) && <button className="underline" disabled={busy} onClick={()=>{void action({type:'cancel_request'});}}>İptal talep et</button>}
    </div>
    {record.kind==='assistance' && <p className="text-amber-200">Bu kayıt ekip sevki başlatmaz. Çağrı merkezini arayın.</p>}
    {admin && <fieldset disabled={busy} className="space-y-4 border-t border-white/10 pt-4 disabled:opacity-50"><legend className="font-semibold">Yönetici işlemleri</legend>
      {state.stage==='new' && !state.cancellation && <button className="underline" onClick={()=>{void action({type:'contact'});}}>Görüşmeye al</button>}
      {['roadside','premium'].includes(record.kind) && ['new','contacted'].includes(state.stage) && !['pending','approved'].includes(state.cancellation?.decision??'') && <form onSubmit={payment} className="space-y-3"><Field name="paidAt" label="Gerçek ödeme zamanı (Türkiye saati)" type="datetime-local" /><p>{money(record.snapshot.priceMinor)} tutarın tamamının tahsil edildiğini doğrulayın.</p><button className="rounded-lg bg-cyan-400 p-3 text-slate-950">Ödemeyi teyit et</button></form>}
      {state.stage==='paid' && record.kind==='roadside' && !['pending','approved'].includes(state.cancellation?.decision??'') && <>
        <label className="block">Bayi paket PDF'si (en fazla 4 MB)<input className={fieldClass} type="file" accept="application/pdf" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file){void run(()=>requestApi(`/${record.id}/document`,{method:'POST',headers:{'Content-Type':'application/pdf','X-Record-Version':String(record.version)},body:file}));}}} /></label>
        {state.documentPath && <form className="space-y-3" onSubmit={e=>{e.preventDefault();void action({type:'issue',packageNumber:String(new FormData(e.currentTarget).get('packageNumber'))});}}><Field name="packageNumber" label="Bayi paket numarası" maxLength={100}/><button className="rounded-lg bg-cyan-400 p-3 text-slate-950">Bayi düzenlemesini tamamla</button></form>}
      </>}
      {record.kind==='premium' && state.stage==='paid' && <button className="underline" onClick={()=>{void action({type:'activate_premium'});}}>Premium üyeliğini etkinleştir</button>}
      {record.kind==='roadside' && state.stage==='issued' && !state.usedAt && state.cancellation?.decision!=='approved' && <form className="space-y-3" onSubmit={e=>{e.preventDefault();const value=String(new FormData(e.currentTarget).get('usedAt'));void action({type:'use',usedAt:new Date(`${value}:00+03:00`).toISOString()});}}><Field name="usedAt" label="Gerçek ilk hizmet kullanımı (Türkiye saati)" type="datetime-local"/><button className="underline">Hizmet kullanıldı olarak kaydet</button></form>}
      {state.cancellation?.decision==='pending' && <form className="space-y-3" onSubmit={e=>{e.preventDefault();void action({type:'cancel_approve',unusedConfirmed:true});}}><label className="block"><input type="checkbox" required/> Bayi/operasyon kaydından hizmetin kullanılmadığını ve iptalin yapılabildiğini doğruladım.</label><button className="underline mr-4">İptali onayla</button><button className="underline" type="button" onClick={()=>{void action({type:'cancel_reject'});}}>İptali reddet</button></form>}
      {record.status==='refund_pending' && <form onSubmit={e=>{e.preventDefault();void action({type:'refund'});}}><label className="block mb-3"><input type="checkbox" required/> {money(record.snapshot.priceMinor)} tutarın tamamı müşteriye iade edildi.</label><button className="underline">Tam iadeyi kaydet</button></form>}
      {['insurance','assistance','service'].includes(record.kind) && ['new','contacted'].includes(state.stage) && <button className="underline" onClick={()=>{void action({type:'close'});}}>Görüşme / işlem tamamlandı</button>}
    </fieldset>}
    {error && <p role="alert" className="text-red-300">{error}</p>}
  </section>;
}
