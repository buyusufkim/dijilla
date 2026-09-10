import { useEffect, useState } from 'react';
import { authenticatedApi } from '@/lib/request-api';
import { dateStatus, MAX_DOCUMENT_BYTES } from '@/domain/documents';

type Document = { id:string; title:string; type:string; expiry_date:string|null; file_path:string|null };
const labels: Record<string,string> = {license:'Ehliyet',insurance:'Sigorta / Kasko',registration:'Ruhsat',other:'Diğer'};
const statuses = {unknown:'Tarih belirtilmedi',valid:'Kayıtlı tarih ileri bir tarihte',warning:'Son 30 gün',expired:'Kayıtlı tarih geçti'};
const inputClass = 'w-full rounded-xl border border-white/15 bg-[#0A1128] p-3';
const api = (path='', options:RequestInit={}) => authenticatedApi(`/api/documents${path}`,options);

export default function Glovebox() {
  const [documents,setDocuments] = useState<Document[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState(false);
  const [title,setTitle] = useState('');
  const [type,setType] = useState('other');
  const [expiry,setExpiry] = useState('');
  const [file,setFile] = useState<File|null>(null);
  const [requestId,setRequestId] = useState(()=>crypto.randomUUID());
  const [formVersion,setFormVersion] = useState(0);
  const [reload,setReload] = useState(0);
  const [selected,setSelected] = useState<Document|null>(null);
  const [download,setDownload] = useState('');
  const [deleteId,setDeleteId] = useState<string|null>(null);
  useEffect(()=>{
    let current=true; setLoading(true);
    api().then(result=>{if(current)setDocuments(result.documents);}).catch(()=>{if(current)setError('Belgeler yüklenemedi. Yeniden deneyin.');}).finally(()=>{if(current)setLoading(false);});
    return()=>{current=false;};
  },[reload]);
  useEffect(()=>{setDownload('');},[selected]);
  useEffect(()=>{if(!download)return; const timer=setTimeout(()=>setDownload(''),55000); return()=>clearTimeout(timer);},[download]);
  function validateFile(value:File) {
    if (!['application/pdf','image/jpeg','image/png'].includes(value.type) || !value.size || value.size>MAX_DOCUMENT_BYTES) throw new Error('En fazla 4 MB PDF, JPEG veya PNG dosyası seçin.');
  }
  async function upload(id:string,value:File) {
    validateFile(value);
    return api(`/${id}/file`,{method:'PUT',headers:{'Content-Type':value.type},body:value});
  }
  async function save(event:React.FormEvent) {
    event.preventDefault();if(busy)return;setBusy(true);setError('');setNotice('');
    let saved:Document|null=null;
    try {
      if(file)validateFile(file);
      saved=(await api('',{method:'POST',body:JSON.stringify({id:requestId,title,type,expiry_date:expiry||null})})).document;
      if(file&&!saved!.file_path) await upload(saved!.id,file);
      setNotice(file?'Belge ve dosyası kaydedildi.':'Belge bilgileri kaydedildi.');
    } catch(e:any) {
      setError(saved?`Belge bilgileri kaydedildi; dosya yüklenemedi. Listedeki Dosya ekle alanından tekrar deneyin. ${e.message}`:e.message);
    } finally {
      if(saved){setTitle('');setType('other');setExpiry('');setFile(null);setRequestId(crypto.randomUUID());setFormVersion(v=>v+1);setReload(v=>v+1);}
      setBusy(false);
    }
  }
  async function attach(doc:Document,value:File) {
    setBusy(true);setError('');setNotice('');
    try {await upload(doc.id,value);setNotice('Dosya kaydedildi.');setReload(v=>v+1);} catch(e:any){setError(e.message);} finally{setBusy(false);}
  }
  async function prepareDownload(doc:Document) {
    setBusy(true);setError('');setDownload('');
    try{const result=await api(`/${doc.id}/file`);setDownload(result.url);}catch(e:any){setError(e.message);}finally{setBusy(false);}
  }
  async function remove(id:string) {
    setBusy(true);setError('');setNotice('');
    try{await api(`/${id}`,{method:'DELETE'});setDocuments(rows=>rows.filter(row=>row.id!==id));setDeleteId(null);setSelected(null);setNotice('Belge silindi.');}catch(e:any){setError(e.message);}finally{setBusy(false);}
  }
  return <div className="space-y-6 pb-12">
    <header><h1 className="text-2xl font-bold">Dijital Torpido</h1><p className="mt-2 text-white/60">Ruhsat, poliçe ve diğer belgelerinizi özel dosya alanınızda saklayın. Tarihler sizin kaydınıza dayanır.</p></header>
    {error&&<div role="alert" className="rounded-xl border border-red-400/40 p-4 text-red-300">{error} <button className="underline" onClick={()=>{setError('');setReload(v=>v+1);}}>Listeyi yenile</button></div>}
    {notice&&<p role="status" className="text-emerald-300">{notice}</p>}
    <form key={formVersion} onSubmit={save} className="rounded-2xl border border-white/10 bg-[#1A233A] p-5 space-y-4">
      <h2 className="text-lg font-semibold">Belge ekle</h2>
      <fieldset disabled={busy} className="grid gap-4 md:grid-cols-2 disabled:opacity-60">
        <label>Belge adı<input required maxLength={160} className={inputClass} value={title} onChange={e=>setTitle(e.target.value)}/></label>
        <label>Belge türü<select className={inputClass} value={type} onChange={e=>setType(e.target.value)}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label>Son geçerlilik tarihi (isteğe bağlı)<input type="date" className={inputClass} value={expiry} onChange={e=>setExpiry(e.target.value)}/></label>
        <label>Dosya (isteğe bağlı, en fazla 4 MB)<input type="file" accept="application/pdf,image/jpeg,image/png" className={inputClass} onChange={e=>setFile(e.target.files?.[0]??null)}/></label>
      </fieldset>
      <button disabled={busy} className="rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#0A1128] disabled:opacity-40">{busy?'İşleniyor…':'Kaydet'}</button>
    </form>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Belgelerim</h2>
      {loading&&<p role="status">Yükleniyor…</p>}
      {!loading&&!documents.length&&!error&&<p className="text-white/60">Henüz belge eklenmemiş.</p>}
      {documents.map(doc=><article key={doc.id} className="rounded-2xl border border-white/10 p-5 space-y-3">
        <h3 className="font-semibold">{doc.title}</h3><p className="text-sm text-white/60">{labels[doc.type]} · {doc.expiry_date??'Tarih belirtilmedi'} · {statuses[dateStatus(doc.expiry_date)]}</p>
        <div className="flex flex-wrap gap-5">
          {doc.file_path?<button disabled={busy} className="text-cyan-300 underline" onClick={()=>setSelected(doc)}>Dosyayı indir</button>:<label className="text-cyan-300">Dosya ekle<input disabled={busy} className="block max-w-full text-sm" type="file" accept="application/pdf,image/jpeg,image/png" onChange={e=>{const value=e.target.files?.[0];if(value)void attach(doc,value);e.target.value='';}}/></label>}
          <button disabled={busy} className="text-red-300 underline" onClick={()=>setDeleteId(doc.id)}>Sil</button>
        </div>
        {deleteId===doc.id&&<div className="rounded-xl bg-red-400/10 p-3"><p>Belgeyi ve ekli dosyasını silmek istiyor musunuz?</p><button disabled={busy} className="mr-5 underline" onClick={()=>void remove(doc.id)}>Evet, sil</button><button disabled={busy} className="underline" onClick={()=>setDeleteId(null)}>Vazgeç</button></div>}
      </article>)}
    </section>
    {selected&&<section className="rounded-2xl border border-cyan-300/30 p-5 space-y-3" aria-label="Seçili belge"><h2 className="font-semibold">{selected.title}</h2><p className="text-white/60">İndirme bağlantısı kısa süre geçerlidir. Süresi dolarsa yeniden hazırlayın.</p>{download?<a href={download} rel="noreferrer" className="text-cyan-300 underline">Dosyayı indir</a>:<button disabled={busy} className="text-cyan-300 underline" onClick={()=>void prepareDownload(selected)}>İndirme bağlantısını hazırla</button>}<button disabled={busy} className="ml-5 underline" onClick={()=>setSelected(null)}>Kapat</button></section>}
  </div>;
}
