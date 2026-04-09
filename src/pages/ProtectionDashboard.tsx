import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Wrench, 
  Calendar, 
  ArrowRight,
  Shield,
  CreditCard,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from "@/firebase";
import { calculateRisk, RiskAnalysis } from "@/lib/risk-engine";

type Vehicle = {
  id: string;
  plate: string;
  brand_model: string;
  year: number;
  mileage?: number;
  insurance_expiry: string;
  inspection_expiry: string;
};

type Expense = {
  amount: number;
  expense_date: string;
};

export default function ProtectionDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const fetchVehicle = async () => {
      const docRef = doc(db, "vehicles", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
      }
    };

    fetchVehicle();

    const qExpenses = query(
      collection(db, "expenses"),
      where("vehicle_id", "==", id),
      orderBy("expense_date", "desc")
    );

    const unsubscribe = onSnapshot(qExpenses, (snapshot) => {
      const expenseData = snapshot.docs.map(doc => doc.data() as Expense);
      setExpenses(expenseData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, id]);

  if (loading || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const risk = calculateRisk(vehicle);
  
  const last3MonthsExpenses = expenses
    .filter(e => {
      const date = new Date(e.expense_date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return date >= threeMonthsAgo;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans">
      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-sm sm:text-base sm:text-lg font-bold tracking-tight">Droto Protection</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="px-6 space-y-8 max-w-2xl mx-auto">
        
        {/* 1. TOP CARD - Health Score */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/10 to-transparent rounded-[2.5rem] blur-3xl opacity-50" />
          <Card className="bg-[#0A0A0A] border-white/5 rounded-[2.5rem] overflow-hidden relative">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-white/40 text-sm font-bold uppercase tracking-[0.2em]">Vehicle Health Score</p>
              <div className="relative inline-block">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={553}
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * risk.healthScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={
                      risk.healthScore > 70 ? "text-[#00E676]" : 
                      risk.healthScore > 40 ? "text-[#FFD600]" : 
                      "text-[#FF3D00]"
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black tracking-tighter">{risk.healthScore}</span>
                  <span className="text-white/40 text-sm font-bold">/ 100</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  risk.riskLevel === 'High' ? 'bg-red-500' : 
                  risk.riskLevel === 'Medium' ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`} />
                <span className={`text-sm font-bold uppercase tracking-widest ${
                  risk.riskLevel === 'High' ? 'text-red-500' : 
                  risk.riskLevel === 'Medium' ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {risk.riskLevel} Risk Level
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. ACTIVE RISKS */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] px-2">Active Risks</h3>
          <div className="space-y-3">
            {risk.predictedIssues.map((issue, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#0A0A0A] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-red-500">
                    {issue.includes('Sigorta') || issue.includes('Güvence') ? <ShieldAlert className="w-6 h-6" /> : 
                     issue.includes('Bakım') ? <Wrench className="w-6 h-6" /> : 
                     <Calendar className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{issue}</p>
                    <p className="text-xs text-white/40">Immediate action required</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-0.5 rounded">Urgent</span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. FINANCIAL SUMMARY */}
        <section className="grid grid-cols-2 gap-4">
          <Card className="bg-[#0A0A0A] border-white/5 p-5 rounded-3xl">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Spent (3M)</p>
            <p className="text-xl font-bold">₺{last3MonthsExpenses.toLocaleString('tr-TR')}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-[#00E676]">
              <TrendingUp className="w-3 h-3" />
              <span>Normal range</span>
            </div>
          </Card>
          <Card className="bg-[#0A0A0A] border-white/5 p-5 rounded-3xl">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Predicted (3M)</p>
            <p className="text-xl font-bold text-[#00E5FF]">₺{risk.predictedMaintenanceCost.toLocaleString('tr-TR')}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-white/20">
              <Info className="w-3 h-3" />
              <span>Based on AI analysis</span>
            </div>
          </Card>
        </section>

        {/* 4. ACTION SECTION - Price Bundle */}
        <section className="relative pt-4">
          <div className="absolute inset-0 bg-[#FF3D00]/20 blur-[100px] -z-10" />
          <Card className="bg-white text-black rounded-[2.5rem] p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter">Fix All Risks</h2>
                <p className="text-black/60 text-sm font-medium">Complete protection bundle for {vehicle.plate}</p>
              </div>
              <div className="bg-black/5 p-3 rounded-2xl">
                <Zap className="w-6 h-6 text-[#FF3D00]" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tighter">₺1.850</span>
              <span className="text-black/40 font-bold">/ year</span>
            </div>

            <Button className="w-full h-16 bg-black text-white hover:bg-black/90 rounded-2xl text-lg font-bold shadow-2xl shadow-black/20 group">
              Get Protected Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-center text-[10px] font-bold text-black/40 uppercase tracking-widest">
              Includes Gold Assistance + Premium Care
            </p>
          </Card>
        </section>

        {/* 5. OFFERS */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] px-2">Tailored Offers</h3>
          <div className="space-y-4">
            {risk.recommendedProducts.map((offer, idx) => (
              <div 
                key={offer.id}
                className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 space-y-4 hover:border-white/20 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      {offer.type === 'insurance' ? <Shield className="w-5 h-5 text-[#00E5FF]" /> : <Wrench className="w-5 h-5 text-[#FFD600]" />}
                    </div>
                    <div>
                      <p className="font-bold">{offer.title}</p>
                      <p className="text-xs text-white/40">{offer.urgency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₺{offer.price}</p>
                    <p className="text-[10px] text-white/20 font-bold uppercase">Monthly</p>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{offer.description}</p>
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 rounded-xl font-bold">
                  View Offer
                </Button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
