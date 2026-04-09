import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wrench,
  Calendar,
  History,
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Info,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
} from "@/firebase";
import { GoogleGenAI } from "@google/genai";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Maintenance() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);

  // Form states
  const [recordForm, setRecordForm] = useState({
    service_type: "",
    mileage: "",
    date: format(new Date(), "yyyy-MM-dd"),
    cost: "",
    notes: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    service_type: "",
    appointment_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: "",
  });

  useEffect(() => {
    if (!user) return;

    // Fetch vehicles
    const vQuery = query(collection(db, "vehicles"), where("user_id", "==", user.uid));
    const unsubscribeVehicles = onSnapshot(vQuery, (snapshot) => {
      const vList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVehicles(vList);
      if (vList.length > 0 && !selectedVehicle) {
        setSelectedVehicle(vList[0]);
      }
    });

    return () => unsubscribeVehicles();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedVehicle) return;

    // Fetch records
    const rQuery = query(
      collection(db, "maintenance_records"),
      where("vehicle_id", "==", selectedVehicle.id),
      orderBy("date", "desc")
    );
    const unsubscribeRecords = onSnapshot(rQuery, (snapshot) => {
      setRecords(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch appointments
    const aQuery = query(
      collection(db, "maintenance_appointments"),
      where("vehicle_id", "==", selectedVehicle.id),
      where("status", "==", "scheduled"),
      orderBy("appointment_date", "asc")
    );
    const unsubscribeAppointments = onSnapshot(aQuery, (snapshot) => {
      setAppointments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Get AI Recommendations
    fetchRecommendations(selectedVehicle);

    return () => {
      unsubscribeRecords();
      unsubscribeAppointments();
    };
  }, [user, selectedVehicle]);

  const fetchRecommendations = async (vehicle: any) => {
    setIsLoadingRecs(true);
    try {
      const prompt = `Provide a standard maintenance schedule for a ${vehicle.year} ${vehicle.brand_model}. 
      List the top 4 most important maintenance items (e.g., Oil Change, Brake Inspection, Timing Belt, etc.) 
      with their recommended intervals in kilometers and months. 
      Return the result as a JSON array of objects with keys: "service", "interval_km", "interval_months", "description".
      Language: Turkish.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const data = JSON.parse(response.text);
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // Fallback
      setRecommendations([
        { service: "Yağ Değişimi", interval_km: 10000, interval_months: 12, description: "Motor ömrü için kritik." },
        { service: "Fren Kontrolü", interval_km: 20000, interval_months: 24, description: "Güvenli sürüş için." },
      ]);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleAddRecord = async () => {
    if (!user || !selectedVehicle) return;
    try {
      await addDoc(collection(db, "maintenance_records"), {
        ...recordForm,
        user_id: user.uid,
        vehicle_id: selectedVehicle.id,
        mileage: Number(recordForm.mileage),
        cost: Number(recordForm.cost),
        created_at: serverTimestamp(),
      });
      setIsAddingRecord(false);
      setRecordForm({
        service_type: "",
        mileage: "",
        date: format(new Date(), "yyyy-MM-dd"),
        cost: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  const handleAddAppointment = async () => {
    if (!user || !selectedVehicle) return;
    try {
      await addDoc(collection(db, "maintenance_appointments"), {
        ...appointmentForm,
        user_id: user.uid,
        vehicle_id: selectedVehicle.id,
        status: "scheduled",
        created_at: serverTimestamp(),
      });
      setIsAddingAppointment(false);
      setAppointmentForm({
        service_type: "",
        appointment_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        location: "",
      });
    } catch (error) {
      console.error("Error adding appointment:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold tracking-tight mb-2">Bakım Planlama</h1>
          <p className="text-white/60 text-xs sm:text-sm sm:text-base">Aracınızın sağlığını koruyun ve ömrünü uzatın.</p>
        </div>
        
        {vehicles.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 bg-[#1A233A] p-2 rounded-2xl border border-white/10 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full sm:max-w-xs md:max-w-md">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
                  selectedVehicle?.id === v.id
                    ? "bg-[#00E5FF] text-[#0A1128] shadow-lg shadow-[#00E5FF]/20"
                    : "text-white/60 hover:bg-white/5"
                }`}
              >
                {v.plate}
              </button>
            ))}
          </div>
        )}
      </header>

      {!selectedVehicle ? (
        <Card className="bg-[#1A233A] border-white/10 p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-bold mb-2">Henüz Araç Yok</h3>
          <p className="text-white/50 mb-6">Bakım planlamak için önce garajınıza bir araç ekleyin.</p>
          <Button onClick={() => window.location.href = "/garage"} className="bg-[#00E5FF] text-[#0A1128]">
            Garaja Git
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recommendations & Appointments */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Recommendations */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#00E5FF]" />
                  Önerilen Bakım Planı
                </h2>
                {isLoadingRecs && <Clock className="w-4 h-4 text-[#00E5FF] animate-spin" />}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, idx) => (
                  <Card key={idx} className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-[#00E5FF]" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Aralık</p>
                          <p className="text-[#00E5FF] font-bold">{rec.interval_km.toLocaleString()} KM</p>
                        </div>
                      </div>
                      <h4 className="font-bold text-lg mb-1">{rec.service}</h4>
                      <p className="text-sm text-white/50">{rec.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Upcoming Appointments */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00E676]" />
                  Yaklaşan Randevular
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-[#00E676]/30 text-[#00E676] hover:bg-[#00E676]/10"
                  onClick={() => setIsAddingAppointment(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Randevu Al
                </Button>
              </div>
              {appointments.length === 0 ? (
                <div className="p-8 bg-[#1A233A] rounded-2xl border border-dashed border-white/10 text-center">
                  <p className="text-white/40">Planlanmış randevu bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-5 bg-[#1A233A] rounded-2xl border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-[#00E676]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{app.service_type}</h4>
                          <div className="flex items-center gap-3 text-sm text-white/50">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(app.appointment_date), "d MMMM yyyy, HH:mm", { locale: tr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {app.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-bold uppercase tracking-wider">
                        Onaylandı
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Records */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Bakım Geçmişi
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                  onClick={() => setIsAddingRecord(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Kayıt Ekle
                </Button>
              </div>
              {records.length === 0 ? (
                <div className="p-8 bg-[#1A233A] rounded-2xl border border-dashed border-white/10 text-center">
                  <p className="text-white/40">Henüz bakım kaydı girilmemiş.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="p-5 bg-[#1A233A] rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-400/10 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{record.service_type}</h4>
                            <p className="text-sm text-white/50">
                              {format(new Date(record.date), "d MMMM yyyy", { locale: tr })} • {record.mileage.toLocaleString()} KM
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">₺{record.cost.toLocaleString()}</p>
                          <p className="text-xs text-white/30">Maliyet</p>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-4 p-3 bg-[#0A1128] rounded-xl text-sm text-white/60 italic">
                          "{record.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Quick Stats & Tips */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-[#00E5FF]/10 to-transparent border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Durum Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#0A1128] rounded-xl">
                  <span className="text-sm text-white/60">Toplam Bakım</span>
                  <span className="font-bold">{records.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0A1128] rounded-xl">
                  <span className="text-sm text-white/60">Toplam Harcama</span>
                  <span className="font-bold text-[#00E676]">₺{records.reduce((acc, r) => acc + r.cost, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0A1128] rounded-xl border border-[#FF3D00]/20">
                  <span className="text-sm text-white/60">Sıradaki Randevu</span>
                  <span className="font-bold text-[#FF3D00]">
                    {appointments.length > 0 
                      ? format(new Date(appointments[0].appointment_date), "d MMM", { locale: tr })
                      : "Yok"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A233A] border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Bakım İpuçları
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/60 space-y-3">
                <p>• Lastik basınçlarını her ay kontrol edin.</p>
                <p>• Motor yağını her 10.000 km'de bir değiştirin.</p>
                <p>• Fren balatalarını her 20.000 km'de bir kontrol ettirin.</p>
                <p>• Silecek sularını kış gelmeden antifrizli olanla değiştirin.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      <AnimatePresence>
        {isAddingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <Card className="bg-[#1A233A] border-white/10 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                  <CardTitle>Bakım Kaydı Ekle</CardTitle>
                  <button onClick={() => setIsAddingRecord(false)} className="p-1 text-white/50 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="service_type" className="text-sm font-medium text-white/80">Hizmet Tipi</label>
                    <input id="service_type" type="text" value={recordForm.service_type} onChange={(e) => setRecordForm({...recordForm, service_type: e.target.value})} placeholder="Örn: Periyodik Bakım" className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[#00E5FF]/50 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="mileage" className="text-sm font-medium text-white/80">Kilometre</label>
                      <input id="mileage" type="number" value={recordForm.mileage} onChange={(e) => setRecordForm({...recordForm, mileage: e.target.value})} placeholder="75000" className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[#00E5FF]/50 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="cost" className="text-sm font-medium text-white/80">Maliyet (₺)</label>
                      <input id="cost" type="number" value={recordForm.cost} onChange={(e) => setRecordForm({...recordForm, cost: e.target.value})} placeholder="2500" className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[#00E5FF]/50 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-white/80">Tarih</label>
                    <input id="date" type="date" value={recordForm.date} onChange={(e) => setRecordForm({...recordForm, date: e.target.value})} className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[#00E5FF]/50 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium text-white/80">Notlar</label>
                    <textarea id="notes" value={recordForm.notes} onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})} placeholder="Yapılan işlemler hakkında detay..." className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[#00E5FF]/50 outline-none h-24 resize-none" />
                  </div>
                  <Button onClick={handleAddRecord} className="w-full bg-[#00E5FF] text-[#0A1128] font-bold">Kaydet</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Appointment Modal */}
      <AnimatePresence>
        {isAddingAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <Card className="bg-[#1A233A] border-white/10 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                  <CardTitle>Bakım Randevusu Al</CardTitle>
                  <button onClick={() => setIsAddingAppointment(false)} className="p-1 text-white/50 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="app_service_type" className="text-sm font-medium text-white/80">Bakım Türü</label>
                    <input id="app_service_type" type="text" value={appointmentForm.service_type} onChange={(e) => setAppointmentForm({...appointmentForm, service_type: e.target.value})} placeholder="Örn: Yağ Değişimi" className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[#00E5FF]/50 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="appointment_date" className="text-sm font-medium text-white/80">Randevu Tarihi & Saati</label>
                    <input id="appointment_date" type="datetime-local" value={appointmentForm.appointment_date} onChange={(e) => setAppointmentForm({...appointmentForm, appointment_date: e.target.value})} className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[#00E5FF]/50 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium text-white/80">Servis Noktası / Konum</label>
                    <input id="location" type="text" value={appointmentForm.location} onChange={(e) => setAppointmentForm({...appointmentForm, location: e.target.value})} placeholder="Örn: Yetkili Servis - Maslak" className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-[#00E5FF]/50 outline-none" />
                  </div>
                  <Button onClick={handleAddAppointment} className="w-full bg-[#00E676] text-[#0A1128] font-bold">Randevu Oluştur</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}

function Car({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
  );
}
