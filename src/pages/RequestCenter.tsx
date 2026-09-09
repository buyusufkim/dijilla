import { useEffect,useState,useRef } from 'react';
import { kindLabels,statusLabels, type requestKinds } from '@/domain/requests';
import { requestApi,money } from '@/lib/request-api';
import { RequestForm } from '@/components/requests/RequestForm';
import { RequestDetail } from '@/components/requests/RequestDetail';
import { AdminSettings } from '@/components/requests/AdminSettings';

export default function RequestCenter({initialKind='roadside',adminView=false}:{initialKind?:typeof requestKinds[number];adminView?:boolean}) {
  const [bootstrap,setBootstrap]=useState<any>(null);const [rows,setRows]=useState<any[]>([]);const [selected,setSelected]=useState<any>(null);
  const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [reload,setReload]=useState(0);const [offset,setOffset]=useState(0);const [created,setCreated]=useState(false);
  const detailSequence=useRef(0);
  useEffect(()=>()=>{detailSequence.current++;},[]);
  useEffect(()=>{
    let current=true;setLoading(true);setError('');
    Promise.all([requestApi('/bootstrap'),requestApi(`?offset=${offset}${adminView?'&scope=admin':''}`)]).then(([b,list])=>{if(current){setBootstrap(b);setRows(list.requests);}}).catch(e=>{if(current)setError(e.message);}).finally(()=>{if(current)setLoading(false);});
    return()=>{current=false;};
  },[reload,offset,adminView]);
  async function select(id:string){const sequence=++detailSequence.current;setError('');try{const result=await requestApi(`/${id}`);if(sequence!==detailSequence.current)return;setSelected(result.request);setReload(v=>v+1);}catch(e:any){if(sequence===detailSequence.current)setError(e.message);}}
  return <div className="space-y-6 pb-10">
    <header><h1 className="text-2xl font-bold">{adminView?'Talep yönetimi':'Taleplerim'}</h1><p className="mt-2 text-white/60">Başvurularınızı, görüşme durumunu ve düzenlenen paketlerinizi takip edin.</p>{bootstrap?.admin&&!adminView&&<a className="inline-block mt-3 text-cyan-300 underline" href="/admin">Yönetim paneli</a>}</header>
    {error&&<div role="alert" className="rounded-xl border border-red-400/30 p-4 text-red-300"><p>{error}</p><button className="underline" onClick={()=>setReload(v=>v+1)}>Yeniden dene</button></div>}
    {loading&&<p role="status">Yükleniyor…</p>}
    {bootstrap&&<>
      {bootstrap.settings.phone&&<a className="inline-block text-cyan-300 underline" href={`tel:${bootstrap.settings.phone}`}>Çağrı merkezini ara</a>}
      {adminView&&bootstrap.admin&&<AdminSettings bootstrap={bootstrap} onSaved={()=>setReload(v=>v+1)}/>}
      {!adminView&&<RequestForm bootstrap={bootstrap} initialKind={initialKind} onCreated={id=>{setCreated(true);void select(id);}}/>}
      {created&&<p role="status" className="text-emerald-300">Talebiniz kaydedildi. Detay ve iletişim seçenekleri aşağıda.</p>}
      {selected&&<RequestDetail key={selected.id} record={selected} admin={adminView&&bootstrap.admin} settings={bootstrap.settings} onChanged={id=>{void select(id);}}/>}
      <section className="space-y-3"><h2 className="text-xl font-semibold">{adminView?'Başvurular':'Kayıtlı talepler'}</h2>{!loading&&rows.length===0&&<p>Henüz talep yok.</p>}{rows.map(row=><button key={row.id} className="block w-full rounded-xl border border-white/10 bg-[#1A233A] p-4 text-left hover:border-cyan-400/40" onClick={()=>{setCreated(false);void select(row.id);}}><span className="font-semibold">{kindLabels[row.kind as keyof typeof kindLabels]}</span><span className="block mt-1 text-cyan-300">{statusLabels[row.status]??row.status}</span><span className="block mt-1 text-sm text-white/60">{new Date(row.created_at).toLocaleString('tr-TR')}{row.snapshot.priceMinor?` · ${money(row.snapshot.priceMinor)}`:''}</span></button>)}</section>
      <div className="flex gap-5"><button disabled={offset===0||loading} className="disabled:opacity-30 underline" onClick={()=>setOffset(v=>Math.max(0,v-50))}>Önceki</button><button disabled={rows.length<50||loading} className="disabled:opacity-30 underline" onClick={()=>setOffset(v=>v+50)}>Sonraki</button></div>
    </>}
  </div>;
}
