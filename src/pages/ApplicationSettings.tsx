import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Settings2, Layers3, Inbox, ShieldCheck, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { requestApi } from '@/lib/request-api';
import { useAuth } from '@/context/AuthContext';
import { AdminSettings } from '@/components/requests/AdminSettings';
import RequestCenter from './RequestCenter';

const sections=[{id:'general',label:'Genel ayarlar',note:'İşletme ve hizmetler',icon:Settings2},{id:'packages',label:'Yol yardım paketleri',note:'Fiyat ve kapsam',icon:Layers3},{id:'requests',label:'Talepler',note:'Başvuru ve işlemler',icon:Inbox},{id:'rules',label:'Çalışma kuralları',note:'Süreler ve sınırlar',icon:ShieldCheck}];
export default function ApplicationSettings() {
  const {user}=useAuth();const [params,setParams]=useSearchParams();
  const section=sections.some(s=>s.id===params.get('tab'))?params.get('tab')!:'general';
  const [bootstrap,setBootstrap]=useState<any>(null);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [loading,setLoading]=useState(true);const [reload,setReload]=useState(0);
  const noticeBox=useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(notice)noticeBox.current?.scrollIntoView({block:'center',behavior:'smooth'});},[notice]);
  useEffect(()=>{let current=true;setLoading(true);requestApi('/bootstrap').then(value=>{if(current){setBootstrap(value);setError('');}}).catch(e=>{if(current)setError(e.message);}).finally(()=>{if(current)setLoading(false);});return()=>{current=false;};},[reload]);
  async function saved(message:string,verify?:(fresh:any)=>boolean) {
    const fresh=await requestApi('/bootstrap');
    if(verify&&!verify(fresh))throw new Error('Sunucudaki ayar sürümü beklenen kayıtla eşleşmedi. Sayfayı yenileyip durumu kontrol edin.');
    setBootstrap(fresh);setNotice(message);setError('');
    window.localStorage.setItem('droto-settings-updated',String(Date.now()));
    window.dispatchEvent(new Event('droto-settings-updated'));
  }
  return <div className="mx-auto max-w-[1440px] space-y-7 pb-12">
    <header><div className="mb-4 flex items-center gap-2 text-xs text-slate-500"><Link to="/profile" className="hover:text-cyan-300">Hesap</Link><ChevronRight size={13}/><span>Uygulama ayarları</span></div><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Uygulama Ayarları</h1><p className="mt-2 text-sm text-slate-400">{bootstrap?.admin?'Droto işletmenizin kontrol merkezi.':'Hesabınız ve uygulama bilgileri.'}</p></div>{bootstrap?.admin&&<span className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-medium text-cyan-300"><ShieldCheck size={14}/>Yönetici</span>}</div></header>
    {notice&&<p ref={noticeBox} role="status" className="flex items-center gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-sm text-emerald-200"><CheckCircle2 size={18}/>{notice}</p>}
    {error&&<div role="alert" className="rounded-xl border border-red-300/20 p-4 text-red-200">{error}<button onClick={()=>setReload(v=>v+1)} className="ml-4 underline">Yeniden dene</button></div>}
    {loading&&!bootstrap&&<p role="status" className="flex items-center gap-3 text-slate-400"><RefreshCw size={16} className="animate-spin"/>Ayarlar yükleniyor…</p>}
    {bootstrap?.admin&&<div className="grid items-start gap-7 lg:grid-cols-[210px_minmax(0,1fr)]">
      <nav aria-label="Yönetim bölümleri" className="grid grid-cols-2 gap-2 lg:sticky lg:top-6 lg:grid-cols-1">{sections.map(({id,label,note,icon:Icon})=><button key={id} onClick={()=>{setParams({tab:id});setNotice('');}} aria-current={section===id?'page':undefined} className={`flex items-start gap-3 rounded-xl p-4 text-left transition-colors ${section===id?'bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/15':'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={18} className="mt-0.5 shrink-0"/><span><span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-[11px] opacity-60">{note}</span></span></button>)}</nav>
      <main className="min-w-0">
        <div hidden={section!=='general'&&section!=='packages'}><AdminSettings key={bootstrap.settings.version} bootstrap={bootstrap} onSaved={saved} section={section==='packages'?'packages':'general'}/></div>
        {section==='requests'&&<RequestCenter adminView embedded/>}
        {section==='rules'&&<div className="space-y-5"><div><h2 className="text-xl font-semibold">Çalışma kuralları</h2><p className="mt-2 text-sm text-slate-400">Uygulamada uygulanan mevcut iş kuralları ve kullanılabilir işlevler.</p></div><div className="grid gap-4 sm:grid-cols-2">{[['Paket süresi','Ödeme teyidinden itibaren 1 yıl'],['Bekleme süresi','Ödeme teyidinden itibaren 24 saat'],['İptal ve iade','İlk 15 gün, hizmet kullanılmadıysa tam iade'],['Tahsilat','Telefon / WhatsApp görüşmesi sonrası manuel teyit'],['Paket düzenleme','Dijilla bayi paneli ve PDF yüklemesi'],['Belge alanı','Hesap başına 100 belge · dosya başına 4 MB']].map(([label,value])=><section key={label} className="rounded-2xl border border-white/[0.08] bg-[#152136] p-5"><h3 className="text-xs uppercase tracking-wider text-slate-500">{label}</h3><p className="mt-3 text-sm leading-relaxed">{value}</p></section>)}</div><section className="rounded-2xl border border-white/10 p-5 text-sm text-slate-400"><h3 className="mb-3 font-medium text-white">Yönetim erişimi</h3><p className="break-all">{user?.email}</p><p className="mt-2">Yönetici yetkisi sunucuda kontrol edilir. Profil bilgilerinin değiştirilmesi yönetici yetkisi vermez.</p></section><section className="rounded-2xl border border-amber-300/15 p-5 text-sm text-slate-400"><h3 className="mb-2 font-medium text-amber-200">Henüz devrede olmayan hizmetler</h3><p>Otomatik e-posta gönderimi, AI kullanım kotaları ve aile paylaşım yetkileri hazırlık aşamasındadır. Bu bölümlerde aktif bir otomasyon gösterilmez.</p></section></div>}
      </main>
    </div>}
    {bootstrap&&!bootstrap.admin&&<section className="rounded-2xl border border-white/10 bg-[#152136] p-6"><h2 className="font-semibold">Hesabınız</h2><p className="mt-3 text-slate-400">{user?.email}</p><p className="mt-3 text-sm text-slate-400">İşletme ve paket ayarları yalnız yöneticilere açıktır.</p><Link to="/profile" className="mt-5 inline-block text-cyan-300">Profil ve bildirim tercihlerine dön</Link></section>}
  </div>;
}
