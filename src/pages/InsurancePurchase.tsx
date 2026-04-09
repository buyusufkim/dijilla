import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  Star,
  Zap,
  Shield,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc } from "@/firebase";

type Step = 'OFFER' | 'COMPARISON' | 'QUICK_BUY' | 'CONFIRMATION';

const OFFERS = [
  {
    id: 'basic',
    name: 'Ekonomik Koruma',
    price: 3850,
    highlight: false,
    coverage: 'Temel Trafik + Yol Yardım',
    trust: 'En Uygun Fiyat'
  },
  {
    id: 'standard',
    name: 'Droto Güvence',
    price: 5200,
    highlight: true,
    coverage: 'Genişletilmiş Kasko + 7/24 Destek',
    trust: 'En Çok Tercih Edilen'
  },
  {
    id: 'premium',
    name: 'Tam Koruma Plus',
    price: 7450,
    highlight: false,
    coverage: 'Full Kasko + İkame Araç + Mini Onarım',
    trust: 'Eksiksiz Güvenlik'
  }
];

export default function InsurancePurchase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('OFFER');
  const [selectedOffer, setSelectedOffer] = useState(OFFERS[1]);
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchVehicle = async () => {
      const docSnap = await getDoc(doc(db, "vehicles", id));
      if (docSnap.exists()) setVehicle(docSnap.data());
    };
    fetchVehicle();
  }, [id]);

  const nextStep = () => {
    if (step === 'OFFER') setStep('COMPARISON');
    else if (step === 'COMPARISON') setStep('QUICK_BUY');
    else if (step === 'QUICK_BUY') setStep('CONFIRMATION');
  };

  const renderStep = () => {
    switch (step) {
      case 'OFFER':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#FF3D00]/10 border border-[#FF3D00]/30 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF3D00] flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Sigortanız 14 gün içinde bitiyor</h2>
                <p className="text-sm text-white/60">Hemen yenileyin, %18 indirim kazanın.</p>
              </div>
            </div>

            <div className="space-y-4">
              {OFFERS.map((offer) => (
                <Card 
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className={`cursor-pointer transition-all border-2 rounded-3xl overflow-hidden ${
                    selectedOffer.id === offer.id ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-white/5 bg-[#0A0A0A]'
                  }`}
                >
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{offer.name}</p>
                        {offer.highlight && (
                          <span className="bg-[#00E5FF] text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            Önerilen
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40">{offer.coverage}</p>
                      <div className="flex items-center gap-1 text-[10px] text-[#00E676] font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {offer.trust}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black">₺{offer.price.toLocaleString('tr-TR')}</p>
                      <p className="text-[10px] text-white/20 font-bold uppercase">Yıllık</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={nextStep} className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-2xl text-lg font-bold group">
              Devam Et
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        );

      case 'COMPARISON':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black tracking-tighter">Kapsam Karşılaştırması</h2>
            <Card className="bg-[#0A0A0A] border-white/5 rounded-3xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 text-left text-white/40 font-bold uppercase text-[10px]">Özellik</th>
                    <th className="p-4 text-right text-white/40 font-bold uppercase text-[10px]">{selectedOffer.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { label: 'Trafik Sigortası', value: true },
                    { label: 'Kasko Güvencesi', value: selectedOffer.id !== 'basic' },
                    { label: '7/24 Yol Yardım', value: true },
                    { label: 'İkame Araç', value: selectedOffer.id === 'premium' },
                    { label: 'Mini Onarım', value: selectedOffer.id !== 'basic' },
                    { label: 'Hukuksal Koruma', value: true },
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-4 text-white/60">{row.label}</td>
                      <td className="p-4 text-right">
                        {row.value ? <CheckCircle2 className="w-5 h-5 text-[#00E676] ml-auto" /> : <div className="w-5 h-5 border border-white/10 rounded-full ml-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('OFFER')} className="flex-1 h-14 border-white/10 rounded-2xl font-bold">
                Geri
              </Button>
              <Button onClick={nextStep} className="flex-[2] h-14 bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 rounded-2xl font-bold">
                Satın Almaya Geç
              </Button>
            </div>
          </motion.div>
        );

      case 'QUICK_BUY':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tighter">Hızlı Ödeme</h2>
              <p className="text-white/40">Tek tıkla poliçenizi aktif edin.</p>
            </div>

            <Card className="bg-[#0A0A0A] border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold">Seçilen Paket</p>
                  <p className="font-bold">{selectedOffer.name}</p>
                </div>
                <p className="text-xl font-black">₺{selectedOffer.price.toLocaleString('tr-TR')}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kart Bilgileri</label>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-white/40" />
                    <span className="text-sm font-mono">**** **** **** 4242</span>
                    <span className="ml-auto text-[10px] font-bold text-white/20">VARSAYILAN</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <Lock className="w-3 h-3" />
                  <span>256-bit SSL ile güvenli ödeme</span>
                </div>
              </div>
            </Card>

            <Button onClick={nextStep} className="w-full h-16 bg-[#00E676] text-black hover:bg-[#00E676]/90 rounded-2xl text-lg font-bold shadow-2xl shadow-[#00E676]/20">
              Şimdi Öde ve Koru
            </Button>
          </motion.div>
        );

      case 'CONFIRMATION':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-12"
          >
            <div className="w-24 h-24 bg-[#00E676] rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-[#00E676]/40">
              <Check className="w-12 h-12 text-black stroke-[3px]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter">Tebrikler!</h2>
              <p className="text-white/60">Aracınız artık Droto güvencesi altında.</p>
            </div>
            
            <Card className="bg-[#0A0A0A] border-white/5 p-6 rounded-3xl text-left space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#FFD600]" />
                <p className="font-bold text-sm">Sıradaki Öneri</p>
              </div>
              <p className="text-sm text-white/60">Bakım zamanınız yaklaşıyor. Gold Yol Yardım paketi ile çekici maliyetlerini sıfırlayın.</p>
              <Button variant="outline" className="w-full border-white/10 rounded-xl font-bold">
                Öneriyi İncele
              </Button>
            </Card>

            <Button onClick={() => navigate('/garage')} className="w-full h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-bold">
              Garaja Dön
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans">
      <header className="p-4 sm:p-6 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-sm sm:text-base sm:text-lg font-bold tracking-tight">Sigorta Yenileme</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}
