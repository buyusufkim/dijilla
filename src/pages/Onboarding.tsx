import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Car,
  Home,
  HeartPulse,
  ArrowRight,
  Mail,
  Lock,
  User,
  Loader2,
  Sparkles,
  Navigation,
  Wrench,
  FileText,
  AlertTriangle,
  Wallet,
  ShieldCheck,
  ChevronRight,
  Star
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, signInWithEmail, signUpWithEmail, demoLogin } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && !showAuth) {
      navigate("/home");
    }
  }, [user, navigate, showAuth]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    let result;
    if (isLogin) {
      result = await signInWithEmail(email, password);
    } else {
      result = await signUpWithEmail(email, password, fullName);
    }

    setLoading(false);
    if (result.error) {
      let errorMessage = result.error.message;
      if (result.error.code === 'auth/operation-not-allowed') {
        errorMessage = "E-posta/Şifre girişi Firebase Console'da etkinleştirilmemiş. Lütfen Firebase Console -> Authentication -> Sign-in method bölümünden Email/Password seçeneğini etkinleştirin.";
      } else if (result.error.code === 'auth/invalid-credential' || result.error.code === 'auth/wrong-password' || result.error.code === 'auth/user-not-found') {
        errorMessage = "E-posta adresi veya şifre hatalı.";
      } else if (result.error.code === 'auth/email-already-in-use') {
        errorMessage = "Bu e-posta adresi zaten kullanımda.";
      } else if (result.error.code === 'auth/weak-password') {
        errorMessage = "Şifre çok zayıf. Lütfen daha güçlü bir şifre belirleyin.";
      }
      setError(errorMessage);
    } else {
      if (result.requiresEmailVerification) {
        setSuccessMessage("Kayıt oluşturuldu. Giriş yapmadan önce e-posta adresini doğrula.");
        setIsLogin(true);
      } else {
        navigate("/home");
      }
    }
  };

  const handleStart = () => {
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-white selection:bg-[#00E5FF]/30 selection:text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#00E5FF]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#FF3D00]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-[#00E676]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <Logo textClassName="text-2xl" iconSize="w-10 h-10" />
        <div className="flex items-center gap-4">
          {!showAuth && (
            <Button 
              variant="ghost" 
              className="text-white/60 hover:text-white hover:bg-white/5 hidden sm:flex"
              onClick={() => {
                setIsLogin(true);
                setShowAuth(true);
              }}
            >
              Giriş Yap
            </Button>
          )}
          <Button 
            className="bg-[#00E5FF] hover:bg-[#00B8D4] text-[#050B14] font-bold rounded-xl px-6"
            onClick={handleStart}
          >
            {showAuth ? "Özellikleri Gör" : "Hemen Başla"}
          </Button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        <AnimatePresence mode="wait">
          {!showAuth ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              {/* Hero Section */}
              <div className="text-center mb-20 max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#00E5FF] text-sm font-medium mb-8"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Yapay Zeka Destekli Yeni Nesil Araç Deneyimi</span>
                </motion.div>
                
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                  Aracınız İçin <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00E676] to-[#00E5FF] bg-[length:200%_auto] animate-gradient">
                    Akıllı Bir Ekosistem
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                  Droto, sadece bir uygulama değil; yolculuğunuzun her anında yanınızda olan akıllı bir asistandır. 
                  Rotalarınızı planlayın, belgelerinizi saklayın ve aracınızın sağlığını yapay zeka ile takip edin.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-[#00E5FF] hover:bg-[#00B8D4] text-[#050B14] font-bold px-10 py-7 text-xl rounded-2xl shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_50px_rgba(0,229,255,0.5)] transition-all w-full sm:w-auto"
                    onClick={handleStart}
                  >
                    Ücretsiz Deneyin <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 text-white px-10 py-7 text-xl rounded-2xl w-full sm:w-auto"
                    onClick={async () => {
                      setLoading(true);
                      await demoLogin();
                      setLoading(false);
                      navigate("/home");
                    }}
                  >
                    Demo Turu <Sparkles className="ml-2 w-5 h-5 text-[#FFD600]" />
                  </Button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                <FeatureCard
                  icon={Navigation}
                  title="Akıllı Rota Planlayıcı"
                  desc="Trafik, yakıt maliyeti ve durak önerileriyle en verimli rotayı yapay zeka ile oluşturun."
                  color="text-[#00E5FF]"
                  bgColor="bg-[#00E5FF]/10"
                  delay={0.1}
                />
                <FeatureCard
                  icon={Car}
                  title="Dijital Garaj"
                  desc="Tüm araçlarınızı, servis geçmişlerini ve teknik detaylarını tek bir merkezden yönetin."
                  color="text-[#FFD600]"
                  bgColor="bg-[#FFD600]/10"
                  delay={0.2}
                />
                <FeatureCard
                  icon={Wrench}
                  title="Yapay Zeka Bakım"
                  desc="Aracınızın modeline ve kullanımına özel bakım önerileri alın, hiçbir detayı atlamayın."
                  color="text-[#00E676]"
                  bgColor="bg-[#00E676]/10"
                  delay={0.3}
                />
                <FeatureCard
                  icon={FileText}
                  title="Dijital Torpido"
                  desc="Ruhsat, kasko ve poliçe gibi kritik belgelerinizi güvenle saklayın ve her an erişin."
                  color="text-purple-400"
                  bgColor="bg-purple-500/10"
                  delay={0.4}
                />
                <FeatureCard
                  icon={Wallet}
                  title="Masraf Takibi"
                  desc="Yakıt, bakım ve diğer tüm araç giderlerinizi kategorize edin, bütçenizi kontrol edin."
                  color="text-orange-400"
                  bgColor="bg-orange-500/10"
                  delay={0.5}
                />
                <FeatureCard
                  icon={ShieldCheck}
                  title="Sigorta & Koruma"
                  desc="En uygun teklifleri karşılaştırın, poliçelerinizi yenileyin ve ailenizi güvenceye alın."
                  color="text-blue-400"
                  bgColor="bg-blue-500/10"
                  delay={0.6}
                />
              </div>

              {/* Social Proof / Stats */}
              <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-white/5 pt-16">
                <StatCard label="Aktif Kullanıcı" value="50K+" />
                <StatCard label="Planlanan Rota" value="1M+" />
                <StatCard label="Kayıtlı Araç" value="120K+" />
                <StatCard label="Müşteri Puanı" value="4.9/5" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md mx-auto"
            >
              <Card className="bg-[#1A233A]/80 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#00E5FF] to-[#00E676]"></div>
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold">{isLogin ? "Hoş Geldiniz" : "Hesap Oluştur"}</h2>
                    <button 
                      onClick={() => setShowAuth(false)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <ArrowRight className="w-6 h-6 rotate-180" />
                    </button>
                  </div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3"
                    >
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 mb-6 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-start gap-3"
                    >
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      {successMessage}
                    </motion.div>
                  )}

                  <form onSubmit={handleAuth} className="space-y-5">
                    {!isLogin && (
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium text-white/60 ml-1">Ad Soyad</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-white/60 ml-1">E-posta</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          id="email"
                          type="email"
                          placeholder="ornek@eposta.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label htmlFor="password" className="text-sm font-medium text-white/60">Şifre</label>
                        {isLogin && (
                          <button type="button" className="text-xs text-[#00E5FF] hover:underline">Şifremi Unuttum</button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all"
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold py-7 rounded-xl mt-4 text-lg shadow-lg shadow-[#00E5FF]/20"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
                    </Button>
                    
                    {isLogin && (
                      <>
                        <div className="relative my-8">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#1A233A] px-4 text-white/40 tracking-widest">VEYA</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          disabled={loading}
                          onClick={async () => {
                            setLoading(true);
                            await demoLogin();
                            setLoading(false);
                            navigate("/home");
                          }}
                          className="w-full border-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/10 py-7 rounded-xl transition-all group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/5 to-[#00E5FF]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Hızlı Keşfet: Demo Hesabı
                        </Button>
                      </>
                    )}
                  </form>

                  <div className="mt-8 text-center text-sm text-white/60">
                    {isLogin ? "Henüz bir hesabınız yok mu? " : "Zaten bir hesabınız var mı? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-[#00E5FF] hover:underline font-bold"
                    >
                      {isLogin ? "Hemen Kayıt Ol" : "Giriş Yap"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo textClassName="text-xl" iconSize="w-8 h-8" />
          <div className="flex gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Kullanım Koşulları</a>
            <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-white transition-colors">Destek</a>
          </div>
          <p className="text-sm text-white/20">© 2026 Droto. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color, bgColor, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <Card className="bg-[#1A233A]/40 border-white/10 backdrop-blur-sm hover:bg-[#1A233A]/60 transition-all h-full group">
        <CardContent className="p-8 flex flex-col items-start text-left">
          <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-7 h-7 ${color}`} />
          </div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            {title}
            <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#00E5FF]" />
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-xs md:text-sm text-white/40 uppercase tracking-widest font-medium">{label}</div>
    </div>
  );
}

