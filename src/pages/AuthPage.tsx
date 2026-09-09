import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/supabase';
import { isVerifiedUser, safeReturnPath } from '@/lib/auth-policy';

const inputClass = 'w-full rounded-xl border border-white/20 bg-[#0A1128] p-3 text-white';
export default function AuthPage({ reset = false }: { reset?: boolean }) {
  const { user, loading, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);
  const canReset = reset && isVerifiedUser(user);

  if (loading && !busy) return <p role="status" className="p-8 text-center">Oturum kontrol ediliyor…</p>;
  if (!reset && isVerifiedUser(user)) return <Navigate to={safeReturnPath(location.state?.from)} replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(''); setMessage('');
    if (canReset && password !== confirm) { setError('Şifreler eşleşmiyor.'); return; }
    setBusy(true);
    try {
      if (canReset) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error('Şifre güncellenemedi. Yeni bir bağlantı isteyip tekrar deneyin.');
        setPassword(''); setConfirm(''); setCompleted(true); setMessage('Şifreniz güncellendi.');
      } else if (mode === 'forgot' || reset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw new Error('Bağlantı gönderilemedi. Bir süre sonra tekrar deneyin.');
        setMessage('Bu adrese bağlı bir hesap varsa şifre yenileme bağlantısı gönderilecektir.');
      } else if (mode === 'register') {
        const result = await signUpWithEmail(email.trim(), password, name.trim());
        if (result.error) throw new Error('Kayıt tamamlanamadı. Bilgilerinizi kontrol edip tekrar deneyin.');
        setPassword(''); setMessage('Devam etmek için e-postanıza gelen doğrulama bağlantısını açın. Mevcut hesabınız varsa giriş yapabilirsiniz.');
      } else {
        const result = await signInWithEmail(email.trim(), password);
        if (result.error) throw new Error('Giriş yapılamadı. Bilgilerinizi ve e-posta doğrulamanızı kontrol edin.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'İşlem tamamlanamadı. Tekrar deneyin.');
    } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-[#0A1128] text-white flex items-center justify-center p-5">
    <section className="w-full max-w-md rounded-2xl bg-[#1A233A] p-6 sm:p-8 space-y-5">
      <p className="font-bold text-2xl text-[#00E5FF]">Droto</p>
      <h1 className="text-xl font-semibold">{reset || mode === 'forgot' ? 'Şifrenizi yenileyin' : mode === 'register' ? 'Hesap oluşturun' : 'Giriş yapın'}</h1>
      <p className="text-white/70 text-sm">Araçlarınızı, belgelerinizi ve hizmet taleplerinizi hesabınızdan yönetin.</p>
      {user && !isVerifiedUser(user) && <p role="status">Devam etmek için e-posta adresinizi doğrulayın.</p>}
      {error && <p role="alert" className="text-red-300">{error}</p>}
      {message && <p role="status" className="text-emerald-300">{message}</p>}
      {reset && !user && !completed && <p className="text-sm text-white/70">Geçerli bir yenileme oturumu bulunamadı. E-postanızla yeni bağlantı isteyin.</p>}
      {completed ? <a href="/home" className="block text-[#00E5FF]">Uygulamaya devam et</a> : <form onSubmit={submit} className="space-y-4">
        {!reset && mode === 'register' && <label className="block">Ad soyad<input className={inputClass} value={name} onChange={e => setName(e.target.value)} required maxLength={120} autoComplete="name" /></label>}
        {!canReset && <label className="block">E-posta<input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} autoComplete="email" /></label>}
        {(canReset || (!reset && mode !== 'forgot')) && <label className="block">Şifre<input className={inputClass} type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={mode === 'register' || canReset ? 12 : undefined} maxLength={128} autoComplete={canReset || mode === 'register' ? 'new-password' : 'current-password'} />{(canReset || mode === 'register') && <span className="text-sm text-white/60">En az 12 karakter.</span>}</label>}
        {canReset && <label className="block">Şifreyi tekrar girin<input className={inputClass} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" /></label>}
        <button disabled={busy} className="w-full rounded-xl bg-[#00E5FF] p-3 text-[#0A1128] font-semibold disabled:opacity-50">{busy ? 'İşleniyor…' : canReset ? 'Şifreyi güncelle' : reset || mode === 'forgot' ? 'Yenileme bağlantısı gönder' : mode === 'register' ? 'Hesap oluştur' : 'Giriş yap'}</button>
      </form>}
      {!reset && <div className="flex flex-wrap gap-4 text-sm text-[#00E5FF]">{(['login', 'register', 'forgot'] as const).filter(item => item !== mode).map(item => <button key={item} disabled={busy} onClick={() => { setMode(item); setPassword(''); setError(''); setMessage(''); }}>{item === 'login' ? 'Giriş yap' : item === 'register' ? 'Hesap oluştur' : 'Şifremi unuttum'}</button>)}</div>}
      {reset && !completed && <a href="/login" className="block text-sm text-[#00E5FF]">Giriş ekranına dön</a>}
      {user && !isVerifiedUser(user) && <button onClick={() => { void signOut().catch(() => setError('Çıkış yapılamadı.')); }} className="text-sm underline">Başka hesapla giriş yap</button>}
    </section>
  </main>;
}
