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
import { db } from "@/lib/supabase-service";

type Step = 'FORM' | 'OFFER' | 'COMPARISON' | 'QUICK_BUY' | 'CONFIRMATION';

interface Offer {
  id: string;
  providerName: string;
  premium: number;
  currency: string;
  coverageDetails: Record<string, any>;
  score: number;
  badges: string[];
  isDemo: boolean;
  packageName: string;
}

const mapOfferFromApi = (raw: any): Offer => ({
  id: raw.id || '',
  providerName: raw.providerName || raw.provider_name || 'Bilinmeyen Sağlayıcı',
  premium: Number(raw.premium || raw.price || 0),
  currency: raw.currency || 'TRY',
  coverageDetails: raw.coverageDetails || raw.coverage_details || {},
  score: Number(raw.score || raw.trust || 0),
  badges: Array.isArray(raw.badges) ? raw.badges : (raw.highlight === 'recommended' ? ['recommended'] : []),
  isDemo: !!raw.isDemo,
  packageName: raw.packageName || raw.package_name || 'Kapsamlı Kasko Paketi'
});

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
  const [status, setStatus] = useState<string>('pending');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchVehicle = async () => {
      const { data } = await db.from("vehicles").select("*");
      const v = data?.find((v: any) => v.id === id);
      if (v) setVehicle(v);
    };
    fetchVehicle();
  }, [id]);

  const getAuthHeaders = useCallback(async () => {
    // For Supabase, we might not need to manually get a token for internal API routes if they are handled differently,
    // but for now let's keep it consistent with how the app was structured.
    // In a real Supabase app, we'd use supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.id || user?.uid}`
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
          type: 'casco'
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
    const maxAttempts = 15; // Increased attempts for better coverage
    
    const poll = async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`/api/quotes/${reqId}/offers`, { headers });
        const result = await response.json();
        
        if (!result.success) throw new Error(result.error?.message || 'Teklifler alınırken hata oluştu.');

        const { status: apiStatus, offers: apiOffers } = result.data;
        const normalizedOffers = apiOffers.map(mapOfferFromApi);
        
        setStatus(apiStatus);

        // Update offers if we have any
        if (normalizedOffers.length > 0) {
          setOffers(normalizedOffers);
        }

        // Check if we should stop polling
        const isFinalStatus = ['completed', 'partial', 'failed'].includes(apiStatus);
        
        if (isFinalStatus) {
          if (normalizedOffers.length === 0 && apiStatus === 'failed') {
            setError("Maalesef şu an uygun teklif bulunamadı.");
          }
          setLoading(false);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          // Timeout reached, but we might have partial results
          if (normalizedOffers.length === 0) {
            setError("Teklif alma işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.");
          }
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
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/checkouts/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          offerId: selectedOffer.id
        })
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Ödeme başlatılamadı.');
      
      setCheckoutId(result.data.id);
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
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/checkouts/${checkoutId}/pay`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cardNumber: "4242424242424242",
          expiryMonth: "12",
          expiryYear: "26",
          cvv: "123",
          holderName: user?.displayName || "Test User"
        })
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

            {status === 'partial' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0" />
                <p className="text-xs text-yellow-200/70">
                  Bazı sigorta sağlayıcılarından yanıt alınamadı. Mevcut en iyi teklifleri aşağıda görebilirsiniz.
                </p>
              </div>
            )}

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
                        <p className="font-bold text-lg">{offer.providerName || 'Bilinmeyen Sağlayıcı'}</p>
                        {offer.badges.includes('recommended') && (
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
                      <p className="text-xs text-white/40">{offer.packageName}</p>
                      <div className="flex items-center gap-1 text-[10px] text-[#00E676] font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {offer.score > 0 ? `${offer.score}/100 Güven Puanı` : 'Güvenilir Sağlayıcı'}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black">
                        {offer.premium > 0 ? `₺${offer.premium.toLocaleString('tr-TR')}` : '---'}
                      </p>
                      <p className="text-[10px] text-white/20 font-bold uppercase">{offer.currency || 'TRY'} / Yıllık</p>
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
                    <th className="p-4 text-right text-white/40 font-bold uppercase text-[10px]">{selectedOffer?.providerName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selectedOffer && Object.entries(selectedOffer.coverageDetails).map(([key, value]: [string, any], idx) => (
                    <tr key={idx}>
                      <td className="p-4 text-white/60 capitalize">{key.replace(/_/g, ' ')}</td>
                      <td className="p-4 text-right">
                        {typeof value === 'boolean' ? (
                          value ? <CheckCircle2 className="w-5 h-5 text-[#00E676] ml-auto" /> : <div className="w-5 h-5 border border-white/10 rounded-full ml-auto" />
                        ) : (
                          <span className="font-bold text-[#00E5FF]">{value || '---'}</span>
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
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full mb-2">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Demo Ödeme Modu</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter">Güvenli Ödeme</h2>
              <p className="text-white/40 text-sm">Bu bir simülasyondur, gerçek tahsilat yapılmaz.</p>
            </div>

            <Card className="bg-[#0A0A0A] border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold">Seçilen Paket</p>
                  <p className="font-bold">{selectedOffer?.providerName} - {selectedOffer?.packageName}</p>
                </div>
                <p className="text-xl font-black">
                  {selectedOffer && selectedOffer.premium > 0 ? `₺${selectedOffer.premium.toLocaleString('tr-TR')}` : '---'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kart Sahibi</label>
                    <input 
                      type="text" 
                      placeholder="Ad Soyad"
                      defaultValue={user?.displayName || ""}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#00E5FF] outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Kart Numarası</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        defaultValue="4242 4242 4242 4242"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#00E5FF] outline-none transition-colors font-mono"
                      />
                      <CreditCard className="w-5 h-5 text-white/20 absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SKT</label>
                      <input 
                        type="text" 
                        placeholder="AA/YY"
                        defaultValue="12/26"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#00E5FF] outline-none transition-colors font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CVV</label>
                      <input 
                        type="text" 
                        placeholder="000"
                        defaultValue="123"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#00E5FF] outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-white/40 bg-white/5 p-3 rounded-xl border border-white/5">
                  <Lock className="w-3 h-3" />
                  <span>Test ortamındasınız. Herhangi bir kart bilgisi ile ilerleyebilirsiniz.</span>
                </div>
              </div>
            </Card>

            <Button onClick={processPayment} disabled={loading} className="w-full h-16 bg-[#00E676] text-black hover:bg-[#00E676]/90 rounded-2xl text-lg font-bold shadow-2xl shadow-[#00E676]/20">
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Demo Ödemeyi Tamamla'}
            </Button>
            <p className="text-[10px] text-white/20 text-center">
              * "Demo Ödemeyi Tamamla" butonuna basarak ödeme simülasyonunu onaylamış olursunuz.
            </p>
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
              <h2 className="text-4xl font-black tracking-tighter">Demo İşlem Başarılı!</h2>
              <p className="text-white/60">Ödeme simülasyonu tamamlandı.</p>
            </div>
            
            <Card className="bg-[#0A0A0A] border-white/5 p-6 rounded-3xl text-left space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <p className="font-bold text-sm">Önemli Bilgilendirme</p>
              </div>
              <p className="text-sm text-white/60">
                Bu bir demo uygulamadır. Gerçek bir poliçe oluşturulmamış ve herhangi bir ödeme alınmamıştır. 
                Sistem akışını test etmek için simülasyon başarıyla sonuçlanmıştır.
              </p>
              <Button onClick={() => navigate('/glovebox')} variant="outline" className="w-full border-white/10 rounded-xl font-bold">
                Dijital Torpido'ya Git
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
