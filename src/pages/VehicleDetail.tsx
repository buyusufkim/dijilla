import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Wrench, 
  Plus, 
  Bell,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Clock,
  Trash2,
  ShieldAlert,
  Zap,
  Tag,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, addDoc, deleteDoc } from "@/firebase";
import { calculateRisk, RiskAnalysis, ProductOffer } from "@/lib/risk-engine";

type Vehicle = {
  id: string;
  plate: string;
  brand_model: string;
  brand?: string;
  model?: string;
  year: number;
  mileage?: number;
  fuel_type?: string;
  insurance_expiry: string;
  inspection_expiry: string;
  tax_status: string;
};

type MaintenanceRecord = {
  id: string;
  service_type: string;
  mileage: number;
  date: string;
  cost: number;
  notes: string;
  is_appointment?: boolean;
};

type Appointment = {
  id: string;
  service_type: string;
  appointment_date: string;
  location: string;
  status: string;
  cost?: number;
  notes?: string;
};

type Reminder = {
  id: string;
  title: string;
  date: string;
  vehicle_id: string;
  user_id: string;
  completed: boolean;
};

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");

  useEffect(() => {
    if (!user || !id) return;

    // Fetch vehicle details
    const fetchVehicle = async () => {
      try {
        const docRef = doc(db, "vehicles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
        } else {
          // Fallback to query if getDoc fails in adapter
          const q = query(collection(db, "vehicles"), where("id", "==", id));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              setVehicle({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Vehicle);
            }
          });
          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Araç bilgileri alınırken hata:", error);
      }
    };

    fetchVehicle();

    // Fetch maintenance records
    const qMaintenance = query(
      collection(db, "maintenance_records"),
      where("vehicle_id", "==", id),
      orderBy("date", "asc")
    );

    const unsubscribeMaintenance = onSnapshot(qMaintenance, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceRecord[];
      setMaintenanceRecords(records);
      setLoading(false);
    }, (error) => {
      console.error("Bakım kayıtları alınırken hata:", error);
      setLoading(false);
    });

    // Fetch appointments
    const qAppointments = query(
      collection(db, "maintenance_appointments"),
      where("vehicle_id", "==", id),
      where("status", "==", "scheduled"),
      orderBy("appointment_date", "asc")
    );

    const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
      const appointmentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentData);
    });

    // Fetch reminders
    const qReminders = query(
      collection(db, "reminders"),
      where("vehicle_id", "==", id),
      orderBy("date", "asc")
    );

    const unsubscribeReminders = onSnapshot(qReminders, (snapshot) => {
      const reminderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[];
      setReminders(reminderData);
    });

    return () => {
      unsubscribeMaintenance();
      unsubscribeAppointments();
      unsubscribeReminders();
    };
  }, [user, id]);

  const handleAddCustomReminder = async () => {
    if (!user || !id || !newReminderTitle || !newReminderDate) return;

    try {
      await addDoc(collection(db, "reminders"), {
        title: newReminderTitle,
        date: newReminderDate,
        vehicle_id: id,
        user_id: user.uid,
        completed: false,
        created_at: new Date().toISOString()
      });

      addNotification({
        title: "Hatırlatıcı Eklendi",
        message: `${newReminderTitle} için hatırlatıcı oluşturuldu.`,
        type: "success"
      });

      setNewReminderTitle("");
      setNewReminderDate("");
      setIsAddingReminder(false);
    } catch (error) {
      console.error("Hatırlatıcı eklenirken hata:", error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await deleteDoc(doc(db, "reminders", reminderId));
      addNotification({
        title: "Hatırlatıcı Silindi",
        message: "Hatırlatıcı başarıyla kaldırıldı.",
        type: "info"
      });
    } catch (error) {
      console.error("Hatırlatıcı silinirken hata:", error);
    }
  };

  const calculateDaysLeft = (dateString: string) => {
    if (!dateString) return 0;
    const expiry = new Date(dateString);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSetReminder = () => {
    if (!vehicle) return;
    
    addNotification({
      title: "Muayene Hatırlatıcısı Kuruldu",
      message: `${vehicle.plate} plakalı aracınızın muayenesi için hatırlatıcı ayarlandı.`,
      type: "info"
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Araç bulunamadı.</p>
        <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">Geri Dön</Button>
      </div>
    );
  }

  const daysToInsurance = calculateDaysLeft(vehicle.insurance_expiry);
  const daysToInspection = calculateDaysLeft(vehicle.inspection_expiry);

  const pastMaintenances = maintenanceRecords
    .filter(r => {
      const recordDate = new Date(r.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return recordDate < today;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const riskAnalysis = calculateRisk({
    ...vehicle,
    last_maintenance_date: pastMaintenances[0]?.date
  });

  const chartData = maintenanceRecords
    .filter(r => !r.is_appointment)
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
      cost: record.cost,
      fullDate: new Date(record.date).toLocaleDateString('tr-TR')
    }));

  const upcomingAppointments = appointments.filter(r => {
    const recordDate = new Date(r.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return recordDate >= today;
  });

  return (
    <div className="space-y-6 pb-24 w-full overflow-x-hidden">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Araç Detayı</h1>
        </div>
        <Button 
          onClick={() => navigate(`/protection/${id}`)}
          className="w-full sm:w-auto bg-gradient-to-r from-[#FF3D00] to-[#FF6D00] text-white font-bold gap-2 shadow-lg shadow-[#FF3D00]/20"
        >
          <ShieldCheck className="w-4 h-4" />
          Koruma Paneli
        </Button>
      </header>

      {/* Vehicle Info Card */}
      <Card className="bg-gradient-to-br from-[#1A233A] to-[#0A1128] border-[#00E5FF]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{vehicle.plate}</h2>
              <p className="text-white/60 text-lg mt-1">{vehicle.brand_model}</p>
            </div>
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <Car className="w-8 h-8 text-[#00E5FF]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center sm:items-start">
              <p className="text-xs text-white/40 mb-1">Yıl</p>
              <p className="font-semibold">{vehicle.year}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center sm:items-start">
              <p className="text-xs text-white/40 mb-1">Kilometre</p>
              <p className="font-semibold">{vehicle.mileage?.toLocaleString() || "0"} km</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center sm:items-start">
              <p className="text-xs text-white/40 mb-1">Yakıt Türü</p>
              <p className="font-semibold">{vehicle.fuel_type || "Belirtilmemiş"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Engine Analysis - Sales Oriented Report */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#FF3D00]" />
          Dijilla Risk Raporu
        </h3>
        
        <Card className="bg-[#1A233A] border-[#FF3D00]/20 overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF3D00]/20 to-transparent p-4 border-b border-white/5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Araç Sağlık Skoru</p>
                <p className="text-3xl font-bold text-white">{riskAnalysis.healthScore}<span className="text-lg text-white/40">/100</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Risk Seviyesi</p>
                <p className={`text-xl font-bold ${
                  riskAnalysis.riskLevel === 'High' ? 'text-red-500' : 
                  riskAnalysis.riskLevel === 'Medium' ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>{riskAnalysis.riskLevel === 'High' ? 'Yüksek' : riskAnalysis.riskLevel === 'Medium' ? 'Orta' : 'Düşük'}</p>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {/* Predicted Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-bold text-white/60 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Öngörülen Olası Sorunlar
                </p>
                <ul className="space-y-2">
                  {riskAnalysis.predictedIssues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-white/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-bold text-white/60 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
                  Finansal Maruziyet (Tahmini)
                </p>
                <p className="text-2xl font-bold text-[#00E5FF]">
                  ₺{riskAnalysis.predictedMaintenanceCost.toLocaleString('tr-TR')}
                </p>
                <p className="text-xs text-white/40">
                  Önümüzdeki 3 ay içinde beklenen minimum teknik maliyet yükü.
                </p>
              </div>
            </div>

            {/* 🔥 SALES BLOCK */}
            <div className="bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FF3D00] flex items-center justify-center shrink-0 shadow-lg shadow-[#FF3D00]/40">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-lg leading-tight">
                    {riskAnalysis.salesBlock.urgentMessage}
                  </h4>
                  <div className="space-y-2 mt-3">
                    {riskAnalysis.salesBlock.persuasivePoints.map((point, idx) => (
                      <p key={idx} className="text-sm text-white/70 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                        {point}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button className="flex-1 bg-[#FF3D00] hover:bg-[#D53300] text-white font-bold h-12 text-base shadow-lg shadow-[#FF3D00]/20">
                  Şimdi Korunmaya Başla
                </Button>
                <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/5 h-12 text-base">
                  Teklifleri İncele
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Recommendations - Expert Mechanic + Financial Advisor */}
      {riskAnalysis.maintenanceRecommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#00E676]" />
            Kişiselleştirilmiş Bakım Önerileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskAnalysis.maintenanceRecommendations.map((rec, idx) => (
              <Card key={idx} className="bg-[#0A0A0A] border-white/5 p-6 rounded-3xl space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">{rec.title}</h4>
                    <p className="text-xs text-white/40">{rec.importance}</p>
                  </div>
                  <div className="bg-[#FF3D00]/10 p-2 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-[#FF3D00]" />
                  </div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Risk Analizi</p>
                  <p className="text-xs text-red-400 font-medium">{rec.riskIfIgnored}</p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FFD600]" />
                    <p className="text-xs font-bold text-[#FFD600] uppercase tracking-wider">Dijilla Çözümü</p>
                  </div>
                  <p className="text-sm text-white/70">{rec.monetization.suggestion}</p>
                  <Button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl text-xs">
                    {rec.monetization.cta}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Product Matching Engine - Offers */}
      {riskAnalysis.recommendedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#FFD600]" />
            Önerilen Koruma Paketleri
          </h3>
          <div className="space-y-3">
            {riskAnalysis.recommendedProducts.map(offer => (
              <Card key={offer.id} className="bg-gradient-to-r from-[#1A233A] to-[#0A1128] border-[#FFD600]/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2">
                  <span className="bg-[#FFD600] text-[#0A1128] text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {offer.urgency}
                  </span>
                </div>
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFD600]/10 flex items-center justify-center">
                      {offer.type === 'insurance' ? <ShieldCheck className="w-6 h-6 text-[#FFD600]" /> : 
                       offer.type === 'assistance' ? <Wrench className="w-6 h-6 text-[#FFD600]" /> : 
                       <Tag className="w-6 h-6 text-[#FFD600]" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{offer.title}</h4>
                      <p className="text-sm text-white/60">{offer.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                    <div className="text-right">
                      <p className="text-xs text-white/40 line-through">₺{(offer.price * 1.2).toLocaleString('tr-TR')}</p>
                      <p className="text-xl font-bold text-[#00E676]">₺{offer.price.toLocaleString('tr-TR')}</p>
                    </div>
                    <Button className="bg-[#FFD600] text-[#0A1128] hover:bg-[#FFC400] font-bold gap-2">
                      {offer.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Maliyet Analizi Chart */}
      {chartData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00E676]" />
            Bakım Maliyet Analizi
          </h3>
          <Card className="bg-[#1A233A] border-white/10 p-4">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff40" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} TL`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A233A', border: '1px solid #ffffff20', borderRadius: '8px' }}
                    itemStyle={{ color: '#00E5FF' }}
                    labelStyle={{ color: '#ffffff60' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#00E5FF" 
                    fillOpacity={1} 
                    fill="url(#colorCost)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Status & Reminders */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Durum & Hatırlatıcılar</h3>
        
        {/* Insurance Status */}
        <Card className={`border ${daysToInsurance <= 30 ? 'bg-[#FFD600]/10 border-[#FFD600]/30' : 'bg-[#1A233A] border-white/10'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${daysToInsurance <= 30 ? 'bg-[#FFD600]/20 text-[#FFD600]' : 'bg-[#00E676]/20 text-[#00E676]'}`}>
                {daysToInsurance <= 30 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold">Kasko & Sigorta</p>
                <p className="text-sm text-white/60">
                  {daysToInsurance <= 30 
                    ? `${daysToInsurance} gün kaldı (${new Date(vehicle.insurance_expiry).toLocaleDateString('tr-TR')})`
                    : `Geçerlilik: ${new Date(vehicle.insurance_expiry).toLocaleDateString('tr-TR')}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Status */}
        <Card className={`border ${daysToInspection <= 30 ? 'bg-[#FFD600]/10 border-[#FFD600]/30' : 'bg-[#1A233A] border-white/10'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${daysToInspection <= 30 ? 'bg-[#FFD600]/20 text-[#FFD600]' : 'bg-white/5 text-white/60'}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Araç Muayenesi</p>
                <p className="text-sm text-white/60">
                  {daysToInspection <= 30 
                    ? `${daysToInspection} gün kaldı (${new Date(vehicle.inspection_expiry).toLocaleDateString('tr-TR')})`
                    : `Geçerlilik: ${new Date(vehicle.inspection_expiry).toLocaleDateString('tr-TR')}`}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSetReminder}
              className="border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 gap-2"
            >
              <Bell className="w-4 h-4" />
              Hatırlat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Custom Reminders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FFD600]" />
            Özel Hatırlatıcılar
          </h3>
          <Button 
            onClick={() => setIsAddingReminder(true)}
            variant="ghost" 
            size="sm" 
            className="text-[#00E5FF] hover:bg-[#00E5FF]/10 gap-1"
          >
            <Plus className="w-4 h-4" />
            Ekle
          </Button>
        </div>

        {isAddingReminder && (
          <Card className="bg-[#1A233A] border-[#00E5FF]/30 p-4 space-y-3">
            <div className="space-y-2">
              <label className="text-xs text-white/40">Hatırlatıcı Başlığı</label>
              <input 
                type="text" 
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
                placeholder="Örn: Yağ değişimi kontrolü"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-[#00E5FF]/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">Tarih</label>
              <input 
                type="date" 
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-[#00E5FF]/50"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleAddCustomReminder}
                className="flex-1 bg-[#00E5FF] text-[#0A1128] hover:bg-[#00B8D4]"
                size="sm"
              >
                Kaydet
              </Button>
              <Button 
                onClick={() => setIsAddingReminder(false)}
                variant="outline"
                className="flex-1 border-white/10"
                size="sm"
              >
                İptal
              </Button>
            </div>
          </Card>
        )}

        {reminders.length === 0 && !isAddingReminder ? (
          <p className="text-sm text-white/40 italic">Özel hatırlatıcı bulunmuyor.</p>
        ) : (
          <div className="space-y-2">
            {reminders.map(reminder => (
              <Card key={reminder.id} className="bg-[#1A233A] border-white/5">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFD600]/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[#FFD600]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{reminder.title}</p>
                      <p className="text-xs text-white/40">{new Date(reminder.date).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#00E5FF]" />
          Gelecek Bakımlar & Randevular
        </h3>
        
        {upcomingAppointments.length === 0 ? (
          <Card className="bg-[#1A233A] border-white/10">
            <CardContent className="p-6 text-center">
              <p className="text-white/40 text-sm">Yakın zamanda planlanmış randevu bulunmuyor.</p>
              <Button 
                onClick={() => navigate('/maintenance')}
                variant="link" 
                className="text-[#00E5FF] mt-2"
              >
                Randevu Oluştur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="bg-[#1A233A] border-[#00E5FF]/20 border-l-4 border-l-[#00E5FF]">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-[#00E5FF]" />
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.service_type}</p>
                        <p className="text-sm text-[#00E5FF]">{new Date(appointment.appointment_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">Konum</p>
                      <p className="text-sm font-medium">{appointment.location}</p>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-xs text-white/40 mt-3 p-2 bg-white/5 rounded-lg italic">
                      "{appointment.notes}"
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Geçmiş Bakımlar</h3>
          <Button 
            onClick={() => navigate('/maintenance')}
            variant="ghost" 
            size="sm" 
            className="text-[#00E5FF] hover:bg-[#00E5FF]/10 gap-1"
          >
            <Plus className="w-4 h-4" />
            Bakım Ekle
          </Button>
        </div>

        {pastMaintenances.length === 0 ? (
          <Card className="bg-[#1A233A] border-white/10">
            <CardContent className="p-8 text-center">
              <Wrench className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">Henüz bakım kaydı bulunmuyor.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastMaintenances.map((record) => (
              <Card key={record.id} className="bg-[#1A233A] border-white/10">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#FFD600]/10 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-[#FFD600]" />
                      </div>
                      <div>
                        <p className="font-semibold">{record.service_type}</p>
                        <p className="text-xs text-white/40">{new Date(record.date).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    <p className="font-bold text-[#00E676]">{record.cost.toLocaleString('tr-TR')} TL</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60 mt-3 pt-3 border-t border-white/5">
                    <span>{record.mileage.toLocaleString('tr-TR')} km</span>
                    <span className="text-white/20">•</span>
                    <span className="truncate">{record.notes || "Not eklenmemiş"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
