import { useEffect,useState,useRef } from 'react';
import { kindLabels,statusLabels, type requestKinds } from '@/domain/requests';
import { requestApi,money } from '@/lib/request-api';
import { RequestForm } from '@/components/requests/RequestForm';
import { RequestDetail } from '@/components/requests/RequestDetail';

export default function RequestCenter({initialKind='roadside',adminView=false,embedded=false}:{initialKind?:typeof requestKinds[number];adminView?:boolean;embedded?:boolean}) {
  const [bootstrap,setBootstrap]=useState<any>(null);const [rows,setRows]=useState<any[]>([]);const [selected,setSelected]=useState<any>(null);
  const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [reload,setReload]=useState(0);const [offset,setOffset]=useState(0);const [created,setCreated]=useState(false);
  const detailSequence=useRef(0);
  const [search,setSearch]=useState('');
  const [kindFilter,setKindFilter]=useState('all');
  const visibleRows=rows.filter(row=>(kindFilter==='all'||row.kind===kindFilter)&&`${row.id} ${kindLabels[row.kind as keyof typeof kindLabels]}`.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')));
  useEffect(()=>{
    if(adminView)return;
    const refresh=()=>setReload(v=>v+1);
    const storage=(event:StorageEvent)=>{if(event.key==='droto-settings-updated')refresh();};
    window.addEventListener('focus',refresh);window.addEventListener('droto-settings-updated',refresh);window.addEventListener('storage',storage);
    return()=>{window.removeEventListener('focus',refresh);window.removeEventListener('droto-settings-updated',refresh);window.removeEventListener('storage',storage);};
  },[adminView]);
  useEffect(()=>()=>{detailSequence.current++;},[]);
  useEffect(()=>{
    let current=true;setLoading(true);setError('');
    Promise.all([requestApi('/bootstrap'),requestApi(`?offset=${offset}${adminView?'&scope=admin':''}`)]).then(([b,list])=>{if(current){setBootstrap(b);setRows(list.requests);}}).catch(e=>{if(current)setError(e.message);}).finally(()=>{if(current)setLoading(false);});
    return()=>{current=false;};
  },[reload,offset,adminView]);
  async function select(id:string){const sequence=++detailSequence.current;setError('');try{const result=await requestApi(`/${id}`);if(sequence!==detailSequence.current)return;setSelected(result.request);setReload(v=>v+1);}catch(e:any){if(sequence===detailSequence.current)setError(e.message);}}
  return <div className="space-y-6 pb-10">
    <header><h1 className={embedded?'text-xl font-semibold':'text-2xl font-bold'}>{adminView?'Talep yönetimi':'Taleplerim'}</h1><p className="mt-2 text-sm text-slate-400">{adminView?'Başvuruları inceleyin; görüşme, ödeme, paket düzenleme ve iade işlemlerini kaydedin.':'Başvurularınızı, görüşme durumunu ve düzenlenen paketlerinizi takip edin.'}</p>{bootstrap?.admin&&!adminView&&<a className="inline-block mt-3 text-sm text-cyan-300" href="/settings?tab=requests">Talep yönetimini aç →</a>}</header>
    {error&&<div role="alert" className="rounded-xl border border-red-400/30 p-4 text-red-300"><p>{error}</p><button className="underline" onClick={()=>setReload(v=>v+1)}>Yeniden dene</button></div>}
    {loading&&<p role="status">Yükleniyor…</p>}
    {bootstrap&&<>
      {bootstrap.settings.phone&&<a className="inline-block text-cyan-300 underline" href={`tel:${bootstrap.settings.phone}`}>Çağrı merkezini ara</a>}
      {!adminView&&<RequestForm bootstrap={bootstrap} initialKind={initialKind} onCreated={id=>{setCreated(true);void select(id);}}/>}
      {created&&<p role="status" className="text-emerald-300">Talebiniz kaydedildi. Detay ve iletişim seçenekleri aşağıda.</p>}
      {selected&&<RequestDetail key={selected.id} record={selected} admin={adminView&&bootstrap.admin} settings={bootstrap.settings} onChanged={id=>{void select(id);}}/>}
      <section className="space-y-3"><h2 className="text-lg font-semibold">{adminView?'Başvurular':'Kayıtlı talepler'}</h2>{adminView&&<div className="grid gap-3 sm:grid-cols-[1fr_200px]"><input aria-label="Bu sayfadaki taleplerde ara" placeholder="Bu sayfada talep no veya tür ara" className="rounded-xl border border-white/10 bg-[#0c1629] p-3 text-sm" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Talep türü filtresi" className="rounded-xl border border-white/10 bg-[#0c1629] p-3 text-sm" value={kindFilter} onChange={e=>setKindFilter(e.target.value)}><option value="all">Tüm türler</option>{Object.entries(kindLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>}{!loading&&visibleRows.length===0&&<div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-slate-400">{rows.length?'Bu sayfada filtreye uygun talep yok.':'Henüz talep yok. Yeni başvurular burada görünecek.'}</div>}{visibleRows.map(row=><button key={row.id} className="grid w-full gap-3 rounded-xl border border-white/10 bg-[#152136] p-5 text-left transition-colors hover:border-cyan-300/40 sm:grid-cols-[1fr_auto]" onClick={()=>{setCreated(false);void select(row.id);}}><span><span className="font-medium">{kindLabels[row.kind as keyof typeof kindLabels]}</span><span className="mt-2 block text-xs text-slate-500">{new Date(row.created_at).toLocaleString('tr-TR')}{row.snapshot.priceMinor?` · ${money(row.snapshot.priceMinor)}`:''}</span></span><span className="self-center rounded-full bg-cyan-300/5 px-3 py-1 text-xs text-cyan-200">{statusLabels[row.status]??row.status}</span></button>)}</section>
      <div className="flex gap-5"><button disabled={offset===0||loading} className="disabled:opacity-30 underline" onClick={()=>setOffset(v=>Math.max(0,v-50))}>Önceki</button><button disabled={rows.length<50||loading} className="disabled:opacity-30 underline" onClick={()=>setOffset(v=>v+50)}>Sonraki</button></div>
    </>}
  </div>;
}
