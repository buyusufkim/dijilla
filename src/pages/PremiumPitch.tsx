import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Headphones, 
  Check, 
  ArrowRight,
  Star,
  Crown,
  Bell,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PremiumPitch() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6 text-[#00E5FF]" />,
      title: "Otomatik Takip",
      description: "Tüm poliçe ve muayene tarihleriniz Droto tarafından otomatik izlenir."
    },
    {
      icon: <Bell className="w-6 h-6 text-[#FFD600]" />,
      title: "Öngörülü Uyarılar",
      description: "Yapay zeka, olası arızaları gerçekleşmeden önce size bildirir."
    },
    {
      icon: <Headphones className="w-6 h-6 text-[#00E676]" />,
      title: "Öncelikli Destek",
      description: "7/24 özel asistan hattı ile tüm sorularınıza anında yanıt."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#FF3D00]" />,
      title: "Maliyet Optimizasyonu",
      description: "Bakım ve sigorta harcamalarınızda yıllık ortalama ₺4.500 tasarruf."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#00E5FF]/10 blur-[120px] -z-10" />

      <header className="p-4 sm:p-6 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-sm sm:text-base sm:text-lg font-bold tracking-tight">Droto Premium</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 space-y-12 max-w-2xl mx-auto">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-[#FFD600] to-[#FFA000] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#FFD600]/20"
          >
            <Crown className="w-10 h-10 text-black" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter leading-none">
              Aracınız İçin <br />
              <span className="text-[#FFD600]">Asla Endişelenmeyin</span>
            </h2>
            <p className="text-white/40 font-medium">Droto ile kontrol sende.</p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-[#0A0A0A] border-white/5 h-full rounded-3xl p-6 space-y-4 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  {feature.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Pricing Section */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#0A0A0A] border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="space-y-4 relative z-10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Aylık Plan</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">₺199</span>
                  <span className="text-white/40 font-bold">/ ay</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-white/60">
                    <Check className="w-4 h-4 text-[#00E676]" />
                    Tüm temel özellikler
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/60">
                    <Check className="w-4 h-4 text-[#00E676]" />
                    7/24 Destek
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 rounded-2xl font-bold h-12">
                  Seç
                </Button>
              </div>
            </Card>

            <Card className="bg-white text-black p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-[#FFD600]/20">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-[#FFD600] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">En Avantajlı</span>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Yıllık Plan</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">₺1.990</span>
                  <span className="text-black/40 font-bold">/ yıl</span>
                </div>
                <p className="text-xs font-bold text-[#FF3D00]">2 AY HEDİYE!</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-black/60 font-medium">
                    <Check className="w-4 h-4 text-[#00E676]" />
                    Tüm Premium özellikler
                  </li>
                  <li className="flex items-center gap-2 text-sm text-black/60 font-medium">
                    <Check className="w-4 h-4 text-[#00E676]" />
                    Öncelikli Servis Randevusu
                  </li>
                </ul>
                <Button className="w-full bg-black text-white hover:bg-black/90 rounded-2xl font-bold h-12 group">
                  Premium'a Geç
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer Note */}
        <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] pb-12">
          Lüks deneyim ve tam huzur için Droto Premium.
        </p>

      </div>
    </div>
  );
}
