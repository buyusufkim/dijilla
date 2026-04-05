import React, { useState } from "react";
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
  Loader2
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      navigate("/home");
    }
  };

  const handleStart = () => {
    if (user) {
      navigate("/home");
    } else {
      setShowAuth(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#FF3D00]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-center mb-6">
            <Logo textClassName="text-4xl" iconSize="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Akıllı Araç ve Sürücü <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00E676]">
              Ekosistemine Hoş Geldiniz
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Sadece bir yol yardım uygulaması değil. Sizin ve ailenizin tüm
            sigorta, araç, konut ve sağlık ihtiyaçlarını tek bir merkezden
            yönetin.
          </p>
        </motion.div>

        {!showAuth ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
              <FeatureCard
                icon={Car}
                title="Araç & Kasko"
                desc="Kasko teklifleri alın, MTV ödeyin, yol yardımı çağırın."
                delay={0.2}
              />
              <FeatureCard
                icon={Home}
                title="Konut & DASK"
                desc="Evinizi güvence altına alın, poliçelerinizi takip edin."
                delay={0.3}
              />
              <FeatureCard
                icon={HeartPulse}
                title="Sağlık & Aile"
                desc="TSS teklifleri alın, aile üyelerinizin işlemlerini yönetin."
                delay={0.4}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button
                size="lg"
                className="bg-[#00E5FF] hover:bg-[#00B8D4] text-[#050B14] font-bold px-8 py-6 text-lg rounded-xl shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_50px_rgba(0,229,255,0.5)] transition-all"
                onClick={handleStart}
              >
                {user ? "Ana Sayfaya Git" : "Hemen Başla"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="bg-[#1A233A]/80 border-white/10 backdrop-blur-md">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>
                
                {error && (
                  <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        placeholder="Ad Soyad"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00E5FF]/50"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      placeholder="E-posta"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="password"
                      placeholder="Şifre"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold py-6 rounded-xl mt-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
                  </Button>
                  
                  {isLogin && (
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
                      className="w-full border-white/10 text-white hover:bg-white/5 py-6 rounded-xl mt-2"
                    >
                      Demo Hesabı ile Giriş Yap
                    </Button>
                  )}
                </form>

                <div className="mt-6 text-sm text-white/60">
                  {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[#00E5FF] hover:underline font-medium"
                  >
                    {isLogin ? "Kayıt Ol" : "Giriş Yap"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-[#1A233A]/50 border-white/10 backdrop-blur-sm hover:bg-[#1A233A] transition-colors h-full">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
            <Icon className="w-7 h-7 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-white/60 text-sm">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
