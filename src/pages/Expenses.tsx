import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Fuel, 
  Wrench, 
  Shield, 
  CreditCard, 
  Calendar, 
  ChevronRight,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/supabase-service";
import { useAuth } from "@/context/AuthContext";

type Expense = {
  id: string;
  category: "fuel" | "maintenance" | "insurance" | "other";
  title: string;
  amount: number;
  expense_date: string;
};

export default function Expenses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("fuel");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = db.from("expenses").subscribe((data) => {
      const filtered = data.filter((e: any) => e.user_id === (user.id || user.uid));
      // Sort by expense_date desc
      filtered.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
      setExpenses(filtered as Expense[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !amount) return;

    setIsSubmitting(true);
    try {
      await db.from("expenses").insert({
        user_id: user.id || user.uid,
        title,
        amount: parseFloat(amount),
        category,
        expense_date: new Date().toISOString()
      });

      setShowAddModal(false);
      setTitle("");
      setAmount("");
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'fuel': return <Fuel className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'insurance': return <Shield className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'fuel': return "text-[#00E5FF] bg-[#00E5FF]/10";
      case 'maintenance': return "text-[#FFD600] bg-[#FFD600]/10";
      case 'insurance': return "text-[#00E676] bg-[#00E676]/10";
      default: return "text-purple-400 bg-purple-400/10";
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Gider Takibi</h1>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] rounded-xl gap-2 w-full sm:w-auto h-12 sm:h-10"
        >
          <Plus className="w-4 h-4" />
          Ekle
        </Button>
      </header>

      {/* Monthly Summary */}
      <Card className="bg-gradient-to-br from-[#1A233A] to-[#0A1128] border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none"></div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/40 text-sm font-medium uppercase tracking-wider">Toplam Gider</p>
          </div>
          <p className="text-4xl font-bold mb-6">{totalAmount.toLocaleString('tr-TR')} TL</p>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Son Harcamalar</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center p-8 text-white/40 bg-[#1A233A] rounded-2xl border border-white/10">
            Henüz bir harcama kaydı bulunmuyor.
          </div>
        ) : (
          <div className="grid gap-3">
            {expenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(expense.category)}`}>
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{expense.title}</h3>
                        <p className="text-[10px] text-white/40">
                          {new Date(expense.expense_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{Number(expense.amount).toLocaleString('tr-TR')} TL</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#1A233A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0A1128]/50">
                <h3 className="font-bold text-lg">Yeni Gider Ekle</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-xs font-bold text-white/40 uppercase">Başlık</label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: Shell Yakıt Alımı"
                    className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00E5FF]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-xs font-bold text-white/40 uppercase">Tutar (TL)</label>
                  <input
                    id="amount"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00E5FF]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-xs font-bold text-white/40 uppercase">Kategori</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00E5FF]/50 appearance-none"
                  >
                    <option value="fuel">Yakıt</option>
                    <option value="maintenance">Bakım</option>
                    <option value="insurance">Sigorta</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold py-6 rounded-xl mt-4"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kaydet"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
