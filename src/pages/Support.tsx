import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MessageCircle, FileText, LifeBuoy, ChevronDown } from 'lucide-react';
import { requestApi } from '@/lib/request-api';

const questions = [
  ['Talebimi nasıl takip ederim?', 'Taleplerim ekranından başvurunuzu ve durumunu açabilirsiniz. Talep oluşturmak ödeme, paket düzenlenmesi veya servis onayı anlamına gelmez.'],
  ['Ödemeyi nasıl yaparım?', 'Ekibimiz telefon veya WhatsApp üzerinden görüşerek havale/EFT ya da ödeme bağlantısı bilgilerini paylaşır. Uygulama içinde kart bilgisi kaydedilmez.'],
  ['Yol yardım paketim ne zaman kullanılabilir?', 'Paket süresi ödeme teyidinden itibaren bir yıldır; 24 saat bekleme süresi uygulanır. Hizmetten yararlanmak için bayi kaydının da tamamlanmış olması gerekir. Paket belgesi talebinizin detayına eklenir.'],
  ['Yol yardım paketimi nasıl iptal ederim?', 'Ödeme tarihinden itibaren ilk 15 gün içinde, hizmet kullanılmamışsa talep detayından iptal isteyebilirsiniz. Kullanım kontrolünden sonra uygun taleplere tam iade uygulanır. İptal onayı ve iadenin tamamlanması ayrı ayrı takip edilir.'],
  ['Yolda kaldım, ne yapmalıyım?', 'Yardım bildirimi oluşturabilir ve çağrı merkezini arayabilirsiniz. Uygulamada bildirim oluşturmak otomatik ekip sevki başlatmaz. Aktif paketi olmayan kullanıcılar da ücretli yardım isteyebilir.'],
  ['Kendi poliçe ve belgelerimi ekleyebilir miyim?', 'Evet. Torpido bölümüne başka firmalardan aldığınız belgeleri de ekleyebilirsiniz. PDF, JPEG ve PNG dosyaları desteklenir; dosya başına sınır 4 MB, hesap başına sınır 100 belgedir.'],
  ['Hatırlatmalar ve aile paylaşımı çalışıyor mu?', 'Bildirim tercihlerinizi kaydedebilirsiniz; otomatik hatırlatma gönderimi henüz devrede değildir. Aile listesi şu anda bu tarayıcıda tutulur. Aile üyesi eklemek davet göndermez veya araç ve belgelere erişim vermez.'],
];

type ContactSettings = { business_name?: string; phone?: string; whatsapp?: string; support_email?: string; support_hours?: string };
export default function Support() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let current = true;
    setError(''); setSettings(null);
    requestApi('/bootstrap').then(result => { if (current) setSettings(result.settings); }).catch(() => { if (current) setError('İletişim bilgileri yüklenemedi.'); });
    return () => { current = false; };
  }, [reload]);
  const phone = /^90[1-9]\d{9}$/.test(settings?.phone ?? '') ? settings!.phone : '';
  const whatsapp = /^90[1-9]\d{9}$/.test(settings?.whatsapp ?? '') ? settings!.whatsapp : '';
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings?.support_email ?? '') ? settings!.support_email : '';
  return <div className="mx-auto max-w-5xl space-y-8 pb-12">
    <header><Link to="/profile" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300"><ArrowLeft size={16}/>Hesabıma dön</Link><h1 className="mt-5 text-3xl font-semibold tracking-tight">Destek & SSS</h1><p className="mt-3 text-sm leading-relaxed text-slate-400">Talebinizi takip edin, ekibimize ulaşın veya sık sorulan sorulara göz atın.</p></header>
    <div className="grid gap-4 sm:grid-cols-2">{[{ to:'/requests', title:'Taleplerim', text:'Başvuru, ödeme ve paket durumları', Icon:FileText },{ to:'/tow-truck', title:'Yol yardım bildirimi', text:'Konumunuzu ve yardım ihtiyacınızı iletin', Icon:LifeBuoy }].map(({to,title,text,Icon}) => <Link key={to} to={to} className="group rounded-2xl border border-white/10 bg-[#152136] p-6 transition-colors hover:border-cyan-300/40"><Icon className="mb-4 text-cyan-300" size={24}/><h2 className="font-semibold group-hover:text-cyan-200">{title}</h2><p className="mt-2 text-sm text-slate-400">{text}</p></Link>)}</div>
    <section className="rounded-2xl border border-white/10 p-6"><h2 className="text-lg font-semibold">{settings?.business_name || 'İletişim'}</h2>{settings?.support_hours && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">{settings.support_hours}</p>}
      {error ? <p role="alert" className="mt-4 text-sm text-red-200">{error}<button onClick={() => setReload(n=>n+1)} className="ml-3 underline">Yeniden dene</button></p> : !settings ? <p role="status" className="mt-4 text-sm text-slate-400">İletişim bilgileri yükleniyor…</p> : <div className="mt-5 flex flex-wrap gap-3">
        {phone && <a href={`tel:+${phone}`} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950"><Phone size={17}/>Çağrı merkezini ara</a>}
        {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm"><MessageCircle size={17}/>WhatsApp</a>}
        {email && <a href={`mailto:${email}`} className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm"><Mail size={17} className="shrink-0"/><span className="break-all">{email}</span></a>}
        {!phone && !whatsapp && !email && <p className="text-sm text-slate-400">Destek iletişim bilgileri henüz eklenmedi. Mevcut başvurularınızı Taleplerim ekranından takip edebilirsiniz.</p>}
      </div>}
    </section>
    <section><h2 className="mb-5 text-xl font-semibold">Sık sorulan sorular</h2><div className="divide-y divide-white/10 rounded-2xl border border-white/10">{questions.map(([question,answer]) => <details key={question} className="group px-5 py-1 sm:px-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-medium focus-visible:outline-cyan-300">{question}<ChevronDown size={18} className="shrink-0 text-slate-500 transition-transform group-open:rotate-180"/></summary><p className="pb-5 text-sm leading-7 text-slate-400">{answer}</p></details>)}</div></section>
  </div>;
}
