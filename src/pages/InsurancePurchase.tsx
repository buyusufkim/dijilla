import React, { useState, useEffect, useCallback } from "react";
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
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc } from "@/firebase";

type Step = 'FORM' | 'OFFER' | 'COMPARISON' | 'QUICK_BUY' | 'CONFIRMATION';

interface Offer {
  id: string;
  provider_name: string;
  package_name: string;
  price: number;
  coverage_details: any;
  highlight?: boolean;
  trust?: string;
  isDemo?: boolean;
}

export default function InsurancePurchase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState<Step>('FORM');
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [requestId, setRequestId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchVehicle = async () => {
      const docSnap = await getDoc(doc(db, "vehicles", id));
      if (docSnap.exists()) setVehicle(docSnap.data());
    };
    fetchVehicle();
  }, [id]);

  const getAuthHeaders = useCallback(async () => {
    const token = await user?.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, [user]);

  const requestQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/quotes/request', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          vehicleId: id,
          insuranceType: 'kasko'
        })
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Teklif isteği başarısız oldu.');
      
      setRequestId(result.data.requestId);
      setStep('OFFER');
      startPolling(result.data.requestId);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const startPolling = async (reqId: string) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const poll = async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`/api/quotes/${reqId}/offers`, { headers });
        const result = await response.json();
        
        if (result.success && result.data.offers.length > 0) {
          setOffers(result.data.offers);
          setLoading(false);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setError("Teklifler alınamadı. Lütfen tekrar deneyin.");
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    poll();
  };

  const createCheckout = async () => {
    if (!selectedOffer) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/checkouts/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          offerId: selectedOffer.id,
          vehicleId: id
        })
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Ödeme başlatılamadı.');
      
      setCheckoutId(result.data.checkoutId);
      setStep('QUICK_BUY');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!checkoutId) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/checkouts/${checkoutId}/pay`, {
        method: 'POST',
        headers
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Ödeme işlemi başarısız.');
      
      setStep('CONFIRMATION');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (loading && step === 'OFFER' && offers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" />
            <Shield className="w-8 h-8 text-[#00E5FF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">Teklifler Hazırlanıyor</h3>
            <p className="text-white/40 text-sm">Size en uygun sigorta seçeneklerini tarıyoruz...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold">Bir Hata Oluştu</h3>
            <p className="text-white/40 text-sm max-w-xs mx-auto">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} className="bg-white text-black font-bold px-8">
            Tekrar Dene
          </Button>
        </div>
      );
    }

    switch (step) {
      case 'FORM':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/20 p-8 rounded-[40px] text-center space-y-4">
              <div className="w-20 h-20 bg-[#00E5FF] rounded-3xl flex items-center justify-center mx-auto rotate-3 shadow-2xl shadow-[#00E5FF]/20">
                <ShieldCheck className="w-10 h-10 text-black" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tighter">Sigorta Teklifi Al</h2>
                <p className="text-white/60 text-sm">Aracınızın bilgilerini kullanarak en iyi teklifleri saniyeler içinde getirelim.</p>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="bg-[#0A0A0A] border-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white/40" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Araç Bilgisi</p>
                    <p className="font-bold">{vehicle?.brand} {vehicle?.model} ({vehicle?.plate})</p>
                  </div>
                </div>
              </Card>
            </div>

            <Button 
              onClick={requestQuotes} 
              disabled={loading}
              className="w-full h-20 bg-white text-black hover:bg-white/90 rounded-[30px] text-xl font-black group"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  Teklifleri Gör
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </Button>
          </motion.div>
        );

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
                <h2 className="font-bold text-lg">Özel İndirim Tanımlandı</h2>
                <p className="text-sm text-white/60">Droto kullanıcılarına özel %15'e varan indirimler.</p>
              </div>
            </div>

            <div className="space-y-4">
              {offers.map((offer) => (
                <Card 
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className={`cursor-pointer transition-all border-2 rounded-3xl overflow-hidden ${
                    selectedOffer?.id === offer.id ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-white/5 bg-[#0A0A0A]'
                  }`}
                >
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{offer.provider_name}</p>
                        {offer.highlight && (
                          <span className="bg-[#00E5FF] text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            Önerilen
                          </span>
                        )}
                        {offer.isDemo && (
                          <span className="bg-white/10 text-white/60 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                            DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40">{offer.package_name}</p>
                      <div className="flex items-center gap-1 text-[10px] text-[#00E676] font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {offer.trust || 'Güvenilir Sağlayıcı'}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black">₺{offer.price.toLocaleString('tr-TR')}</p>
                      <p className="text-[10px] text-white/20 font-bold uppercase">Yıllık</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {offers.length === 0 && !loading && (
                <div className="text-center py-12 text-white/40">
                  Şu an için uygun teklif bulunamadı.
                </div>
              )}
              
              {offers.some(o => o.isDemo) && (
                <p className="text-[10px] text-white/20 text-center italic">
                  * Bazı teklifler demo amaçlı simüle edilmiştir.
                </p>
              )}
            </div>

            <Button 
              onClick={() => setStep('COMPARISON')} 
              disabled={!selectedOffer}
              className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-2xl text-lg font-bold group disabled:opacity-50"
            >
              İncele ve Devam Et
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
            <h2 className="text-2xl font-black tracking-tighter">Kapsam Detayları</h2>
            <Card className="bg-[#0A0A0A] border-white/5 rounded-3xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 text-left text-white/40 font-bold uppercase text-[10px]">Özellik</th>
                    <th className="p-4 text-right text-white/40 font-bold uppercase text-[10px]">{selectedOffer?.provider_name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selectedOffer && Object.entries(selectedOffer.coverage_details).map(([key, value]: [string, any], idx) => (
                    <tr key={idx}>
                      <td className="p-4 text-white/60 capitalize">{key.replace(/_/g, ' ')}</td>
                      <td className="p-4 text-right">
                        {typeof value === 'boolean' ? (
                          value ? <CheckCircle2 className="w-5 h-5 text-[#00E676] ml-auto" /> : <div className="w-5 h-5 border border-white/10 rounded-full ml-auto" />
                        ) : (
                          <span className="font-bold text-[#00E5FF]">{value}</span>
                        )}
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
              <Button onClick={createCheckout} disabled={loading} className="flex-[2] h-14 bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 rounded-2xl font-bold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Satın Almaya Geç'}
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
              <h2 className="text-3xl font-black tracking-tighter">Güvenli Ödeme</h2>
              <p className="text-white/40">Poliçenizi anında aktif edin.</p>
            </div>

            <Card className="bg-[#0A0A0A] border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold">Seçilen Paket</p>
                  <p className="font-bold">{selectedOffer?.provider_name} - {selectedOffer?.package_name}</p>
                </div>
                <p className="text-xl font-black">₺{selectedOffer?.price.toLocaleString('tr-TR')}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kart Bilgileri</label>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-white/40" />
                    <span className="text-sm font-mono">**** **** **** 4242</span>
                    <span className="ml-auto text-[10px] font-bold text-[#00E676]">AKTİF</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <Lock className="w-3 h-3" />
                  <span>İyzico altyapısı ile 256-bit SSL korumalı ödeme</span>
                </div>
              </div>
            </Card>

            <Button onClick={processPayment} disabled={loading} className="w-full h-16 bg-[#00E676] text-black hover:bg-[#00E676]/90 rounded-2xl text-lg font-bold shadow-2xl shadow-[#00E676]/20">
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Şimdi Öde ve Koru'}
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
              <h2 className="text-4xl font-black tracking-tighter">İşlem Başarılı!</h2>
              <p className="text-white/60">Aracınız artık Droto güvencesi altında.</p>
            </div>
            
            <Card className="bg-[#0A0A0A] border-white/5 p-6 rounded-3xl text-left space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#FFD600]" />
                <p className="font-bold text-sm">Sıradaki Öneri</p>
              </div>
              <p className="text-sm text-white/60">Poliçeniz oluşturuldu. Dijital Torpido üzerinden belgenize dilediğiniz zaman ulaşabilirsiniz.</p>
              <Button onClick={() => navigate('/glovebox')} variant="outline" className="w-full border-white/10 rounded-xl font-bold">
                Belgeyi Görüntüle
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
        <h1 className="text-sm sm:text-base sm:text-lg font-bold tracking-tight">Sigorta Satın Al</h1>
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
