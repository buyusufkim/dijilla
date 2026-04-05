import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Shield, 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  ChevronRight,
  Upload,
  Trash2,
  Eye,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy } from "@/firebase";

type Document = {
  id: string;
  type: "license" | "insurance" | "registration" | "other";
  title: string;
  expiry_date: string;
  status: "valid" | "warning" | "expired";
  file_url?: string;
};

export default function Glovebox() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "documents"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      setDocuments(docData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching documents:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "valid": return "text-[#00E676] bg-[#00E676]/10";
      case "warning": return "text-[#FFD600] bg-[#FFD600]/10";
      case "expired": return "text-[#FF5252] bg-[#FF5252]/10";
      default: return "text-white/60 bg-white/10";
    }
  };

  const getTypeIcon = (type: Document["type"]) => {
    switch (type) {
      case "license": return <CreditCard className="w-5 h-5" />;
      case "insurance": return <Shield className="w-5 h-5" />;
      case "registration": return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const warningCount = documents.filter(d => d.status === 'warning' || d.status === 'expired').length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Dijital Torpido</h1>
        </div>
        <Button className="bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Ekle
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#1A233A] border-white/10">
          <CardContent className="p-4">
            <p className="text-white/40 text-xs mb-1">Toplam Belge</p>
            <p className="text-2xl font-bold">{documents.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A233A] border-white/10">
          <CardContent className="p-4">
            <p className="text-white/40 text-xs mb-1">Yaklaşan Vade</p>
            <p className={`text-2xl font-bold ${warningCount > 0 ? 'text-[#FFD600]' : 'text-white'}`}>
              {warningCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-white/60 px-1 uppercase tracking-wider">Belgelerim</h2>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center p-8 text-white/40">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Henüz belge eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all group overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(doc.status)}`}>
                        {getTypeIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{doc.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-white/40" />
                          <span className="text-xs text-white/40">Son Tarih: {doc.expiry_date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-white/40 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-white/40 hover:text-[#FF5252] transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Section */}
      <Card className="bg-[#00E5FF]/5 border-dashed border-2 border-[#00E5FF]/20">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#00E5FF]/10 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h3 className="font-semibold mb-1">Yeni Belge Tara</h3>
          <p className="text-sm text-white/40 mb-4">Belgenizin fotoğrafını çekin, Dijilla otomatik olarak bilgileri okusun.</p>
          <Button variant="outline" className="border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 rounded-xl">
            Kamerayı Aç
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
