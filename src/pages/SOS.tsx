import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  ShieldAlert,
  Ambulance,
  Wrench,
  AlertTriangle,
  MapPin,
  PhoneCall,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SOS() {
  const [isCalling, setIsCalling] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 pb-12 relative">
      <header className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-[#FF3D00]">
          Acil Durum Merkezi
        </h1>
        <p className="text-white/60 text-xs sm:text-sm sm:text-base">
          Lütfen ihtiyacınız olan acil durumu seçin. Size en hızlı şekilde
          yardımcı olacağız.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main SOS Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center justify-center p-12 bg-gradient-to-b from-[#1A233A] to-[#0A1128] rounded-3xl border border-[#FF3D00]/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#FF3D00]/5 animate-pulse"></div>

          <button 
            onClick={() => setIsCalling(true)}
            className="relative w-48 h-48 rounded-full bg-gradient-to-br from-[#FF3D00] to-[#D50000] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,61,0,0.4)] hover:shadow-[0_0_80px_rgba(255,61,0,0.6)] hover:scale-105 transition-all active:scale-95 z-10"
          >
            <ShieldAlert className="w-20 h-20 text-white mb-2" />
            <span className="text-white font-bold text-xl tracking-wider">
              SOS
            </span>
          </button>

          <p className="mt-8 text-center text-white/80 font-medium z-10">
            Acil durum butonuna basarak
            <br />
            anında yardım çağırın.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm text-white/50 z-10 bg-black/20 px-4 py-2 rounded-full border border-white/5">
            <MapPin className="w-4 h-4 text-[#00E5FF]" />
            Konumunuz otomatik paylaşılacaktır
          </div>
        </motion.div>

        {/* Quick Contacts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Hızlı İletişim</h2>

          <SOSContactCard
            icon={Ambulance}
            title="Ambulans"
            number="112"
            color="text-[#FF3D00]"
            bg="bg-[#FF3D00]/10"
            border="border-[#FF3D00]/30"
          />
          <SOSContactCard
            icon={ShieldAlert}
            title="Polis İmdat"
            number="155"
            color="text-blue-400"
            bg="bg-blue-400/10"
            border="border-blue-400/30"
          />
          <SOSContactCard
            icon={AlertTriangle}
            title="İtfaiye"
            number="110"
            color="text-orange-400"
            bg="bg-orange-400/10"
            border="border-orange-400/30"
          />
          <div onClick={() => navigate("/tow-truck")} className="cursor-pointer">
            <SOSContactCard
              icon={Wrench}
              title="Yol Yardım"
              number="Çekici Çağır"
              color="text-[#00E5FF]"
              bg="bg-[#00E5FF]/10"
              border="border-[#00E5FF]/30"
              isLink={false}
            />
          </div>
        </div>
      </div>

      {/* Calling Modal */}
      <AnimatePresence>
        {isCalling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm"
            >
              <Card className="bg-[#1A233A] border-red-500/30 shadow-[0_0_50px_rgba(255,61,0,0.2)]">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Acil Durum Çağrısı
                  </CardTitle>
                  <button 
                    onClick={() => setIsCalling(false)}
                    className="p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 animate-pulse">
                    <Phone className="w-10 h-10 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">112 Acil Servis</h3>
                    <p className="text-white/60 text-sm">
                      Konum bilgileriniz otomatik olarak yetkililere iletilecektir. Lütfen sakin olun ve hattan ayrılmayın.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <a href="tel:112" className="w-full">
                      <Button className="w-full py-6 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-red-500/20">
                        Hemen Ara: 112
                      </Button>
                    </a>
                    <Button 
                      variant="ghost" 
                      className="w-full py-4 text-white/40 hover:text-white hover:bg-white/5"
                      onClick={() => setIsCalling(false)}
                    >
                      Yanlışlıkla Bastım, İptal Et
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SOSContactCard({ icon: Icon, title, number, color, bg, border, isLink = true }: any) {
  const content = (
    <CardContent className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-6 h-6 ${color}`} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-white/60 font-mono text-lg tracking-wider">
            {number}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-white/5 hover:bg-white/10 text-white"
      >
        <PhoneCall className="w-5 h-5" />
      </Button>
    </CardContent>
  );

  if (!isLink) {
    return (
      <div className={`block bg-[#1A233A] border ${border} hover:bg-white/5 transition-colors cursor-pointer group rounded-xl`}>
        {content}
      </div>
    );
  }

  return (
    <a
      href={`tel:${number}`}
      className={`block bg-[#1A233A] border ${border} hover:bg-white/5 transition-colors cursor-pointer group rounded-xl`}
    >
      {content}
    </a>
  );
}
