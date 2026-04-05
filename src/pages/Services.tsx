import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Shield,
  FileText,
  Wrench,
  HeartPulse,
  FileSignature,
  Calendar,
  ChevronRight,
  X,
  CheckCircle2,
  Loader2,
  Camera,
  Fuel,
  BarChart3,
  Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "@/firebase";
import { useAuth } from "@/context/AuthContext";

const categories = [
  {
    title: "Acil & Sağlık",
    items: [
      {
        icon: HeartPulse,
        label: "Nöbetçi Eczane",
        color: "text-[#FF3D00]",
        bg: "bg-[#FF3D00]/10",
        desc: "En yakın nöbetçi eczaneyi bulun.",
      },
      {
        icon: Shield,
        label: "Anlaşmalı Hastane",
        color: "text-[#00E5FF]",
        bg: "bg-[#00E5FF]/10",
        desc: "Poliçenize uygun hastaneler.",
      },
    ],
  },
  {
    title: "Resmi İşlemler",
    items: [
      {
        icon: FileSignature,
        label: "Nöbetçi Noter",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        desc: "Hafta sonu açık noterler.",
      },
      {
        icon: FileText,
        label: "MTV Ödeme",
        color: "text-[#00E676]",
        bg: "bg-[#00E676]/10",
        desc: "Tek tıkla vergi ödemesi.",
      },
      {
        icon: FileText,
        label: "Trafik Cezası",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        desc: "Ceza sorgulama ve ödeme.",
      },
      {
        icon: FileText,
        label: "Kaza Tutanağı",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        desc: "Online e-tutanak doldurun.",
      },
    ],
  },
  {
    title: "Araç Bakım",
    items: [
      {
        icon: Wrench,
        label: "Oto Servisler",
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        desc: "Anlaşmalı bakım noktaları.",
      },
      {
        icon: Calendar,
        label: "Muayene Randevusu",
        color: "text-pink-400",
        bg: "bg-pink-400/10",
        desc: "TÜVTÜRK randevusu alın.",
      },
    ],
  },
  {
    title: "Akıllı Yönetim",
    items: [
      {
        icon: FileText,
        label: "Dijital Torpido",
        color: "text-[#00E5FF]",
        bg: "bg-[#00E5FF]/10",
        desc: "Belgelerinizi dijital ortamda saklayın.",
        link: "/glovebox"
      },
      {
        icon: Fuel,
        label: "Yakıt & Şarj",
        color: "text-[#FFD600]",
        bg: "bg-[#FFD600]/10",
        desc: "En uygun istasyonları bulun.",
        link: "/fuel"
      },
      {
        icon: BarChart3,
        label: "Gider Takibi",
        color: "text-[#00E676]",
        bg: "bg-[#00E676]/10",
        desc: "Harcamalarınızı analiz edin.",
        link: "/expenses"
      },
      {
        icon: Bot,
        label: "AI Teşhis",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        desc: "Yapay zeka ile arıza teşhisi.",
        link: "/ai-assistant"
      },
    ],
  },
];

export default function Services() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const handleAction = async () => {
    setIsProcessing(true);
    
    try {
      if (selectedService?.label === "Kaza Tutanağı" && user) {
        await addDoc(collection(db, "service_requests"), {
          user_id: user.uid,
          type: "accident",
          phone: "Kayıtlı Numara",
          status: "pending",
          created_at: serverTimestamp(),
        });
      } else {
        // Simulate API call for other services
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedService(null);
      }, 2000);
    } catch (error) {
      console.error("Error processing service request:", error);
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleServiceClick = (item: any) => {
    if (item.link) {
      navigate(item.link);
    } else {
      setSelectedService(item);
    }
  };

  const renderServiceContent = () => {
    if (showSuccess) {
      return (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 bg-[#00E676]/20 rounded-full flex items-center justify-center mx-auto border border-[#00E676]/30">
            <CheckCircle2 className="w-8 h-8 text-[#00E676]" />
          </div>
          <h3 className="text-xl font-bold">İşlem Başarılı!</h3>
          <p className="text-white/60 text-sm">Talebiniz alınmıştır. Detaylar e-posta ile gönderilecektir.</p>
        </div>
      );
    }

    switch (selectedService?.label) {
      case "Nöbetçi Eczane":
      case "Nöbetçi Noter":
      case "Anlaşmalı Hastane":
      case "Oto Servisler":
        const items = selectedService.label === "Nöbetçi Eczane" ? [
          { name: "Güneş Eczanesi", dist: "0.4 km", addr: "Mecidiyeköy Mah. No:12" },
          { name: "Hayat Eczanesi", dist: "1.2 km", addr: "Fulya Sok. No:45" },
          { name: "Merkez Eczanesi", dist: "2.5 km", addr: "Büyükdere Cad. No:88" },
        ] : selectedService.label === "Anlaşmalı Hastane" ? [
          { name: "Acıbadem Maslak", dist: "3.2 km", addr: "Maslak Mah. No:1" },
          { name: "Florence Nightingale", dist: "1.8 km", addr: "Şişli Merkez" },
        ] : [
          { name: "Örnek Nokta 1", dist: "0.8 km", addr: "Merkez Mah. No:5" },
          { name: "Örnek Nokta 2", dist: "2.1 km", addr: "Sanayi Sit. No:14" },
        ];
        return (
          <div className="space-y-4">
            <p className="text-sm text-white/60 text-left">Size en yakın noktalar listelenmiştir:</p>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="p-4 bg-[#0A1128] rounded-xl border border-white/5 flex items-center justify-between group hover:border-[#00E5FF]/30 transition-all cursor-pointer">
                  <div className="text-left">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-white/40 mt-1">{item.addr}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#00E5FF]">{item.dist}</p>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "MTV Ödeme":
      case "Trafik Cezası":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-[#0A1128] rounded-xl border border-white/5 text-left">
                <p className="text-xs text-white/40 uppercase font-bold tracking-widest mb-2">Araç Plakası</p>
                <p className="text-lg font-bold">34 ABC 123</p>
              </div>
              <div className="p-4 bg-[#0A1128] rounded-xl border border-white/5 text-left flex justify-between items-center">
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold tracking-widest mb-1">Toplam Borç</p>
                  <p className="text-2xl font-bold text-[#00E5FF]">₺1.450,00</p>
                </div>
                <div className="text-xs bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-1 rounded">Vadesi Geçmiş</div>
              </div>
            </div>
            <Button 
              onClick={handleAction}
              disabled={isProcessing}
              className="w-full py-6 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold rounded-xl"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Şimdi Öde"}
            </Button>
          </div>
        );

      case "Muayene Randevusu":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {["12 Nisan", "13 Nisan", "14 Nisan", "15 Nisan"].map(date => (
                <button key={date} className="p-3 bg-[#0A1128] border border-white/10 rounded-xl text-sm hover:border-[#00E5FF] transition-all">
                  {date}
                </button>
              ))}
            </div>
            <Button 
              onClick={handleAction}
              disabled={isProcessing}
              className="w-full py-6 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold rounded-xl"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Randevu Al"}
            </Button>
          </div>
        );

      case "Kaza Tutanağı":
        return (
          <div className="space-y-6">
            <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:border-[#00E5FF]/30 transition-all cursor-pointer">
              <Camera className="w-10 h-10 text-[#00E5FF]" />
              <p className="text-sm font-medium">Kaza Fotoğraflarını Yükle</p>
              <p className="text-xs text-white/40">Veya e-tutanak formunu doldurmaya başla</p>
            </div>
            <Button 
              onClick={handleAction}
              disabled={isProcessing}
              className="w-full py-6 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold rounded-xl"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tutanak Oluştur"}
            </Button>
          </div>
        );

      default:
        return (
          <p className="text-white/70 mb-6">
            Bu hizmet şu anda geliştirme aşamasındadır. Çok yakında kullanıma sunulacaktır.
          </p>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Hizmetler Merkezi
          </h1>
          <p className="text-white/60">
            İhtiyacınız olan tüm hizmetlere hızlıca erişin.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Hizmet veya işlem ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A233A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all"
          />
        </div>
      </header>

      <div className="space-y-10">
        {filteredCategories.map((category, idx) => (
          <motion.section
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h2 className="text-lg font-medium text-white/80 mb-6">
              {category.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.items.map((item) => (
                <Card
                  key={item.label}
                  onClick={() => handleServiceClick(item)}
                  className="bg-[#1A233A] border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.bg} mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon
                        className={`w-7 h-7 ${item.color}`}
                        strokeWidth={2}
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{item.label}</h3>
                    <p className="text-sm text-white/50">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-white/50">
            Aramanıza uygun hizmet bulunamadı.
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <Card className="bg-[#1A233A] border-white/10 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${selectedService.bg} flex items-center justify-center border border-white/5`}>
                      <selectedService.icon className={`w-5 h-5 ${selectedService.color}`} />
                    </div>
                    <CardTitle>{selectedService.label}</CardTitle>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedService(null);
                      setShowSuccess(false);
                    }}
                    className="p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent className="pt-6">
                  {renderServiceContent()}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
