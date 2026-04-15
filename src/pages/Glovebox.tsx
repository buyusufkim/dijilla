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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy, addDoc, deleteDoc, doc } from "@/firebase";
import { toast } from "sonner";

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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [newDoc, setNewDoc] = useState({
    title: "",
    type: "other" as Document["type"],
    expiry_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const docData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      setDocuments(docData);
      setLoading(false);
    }, (error: any) => {
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

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Determine status based on expiry date
      const expiry = new Date(newDoc.expiry_date);
      const now = new Date();
      const diffTime = Math.abs(expiry.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status: Document["status"] = "valid";
      if (expiry < now) {
        status = "expired";
      } else if (diffDays <= 30) {
        status = "warning";
      }

      await addDoc(collection(db, "documents"), {
        user_id: user.uid,
        title: newDoc.title,
        type: newDoc.type,
        expiry_date: newDoc.expiry_date,
        status,
        created_at: new Date().toISOString()
      });
      
      setIsAddOpen(false);
      setNewDoc({ title: "", type: "other", expiry_date: "" });
      toast.success("Belge başarıyla eklendi.");
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Belge eklenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "documents", id));
      toast.success("Belge silindi.");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Belge silinirken bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dijital Torpido</h1>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] rounded-xl gap-2 w-full sm:w-auto h-12 sm:h-10" />}>
            <Plus className="w-4 h-4" />
            Ekle
          </DialogTrigger>
          <DialogContent className="bg-[#1A233A] text-white border-white/10 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Belge Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDocument} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Belge Adı</Label>
                <Input 
                  id="title" 
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                  className="bg-white/5 border-white/10 text-white" 
                  placeholder="Örn: Kasko Poliçesi"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Belge Türü</Label>
                <select 
                  id="type"
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({...newDoc, type: e.target.value as Document["type"]})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                  required
                >
                  <option value="license" className="bg-[#1A233A]">Ehliyet</option>
                  <option value="insurance" className="bg-[#1A233A]">Sigorta / Kasko</option>
                  <option value="registration" className="bg-[#1A233A]">Ruhsat</option>
                  <option value="other" className="bg-[#1A233A]">Diğer</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Son Geçerlilik Tarihi</Label>
                <Input 
                  id="expiry" 
                  type="date"
                  value={newDoc.expiry_date}
                  onChange={(e) => setNewDoc({...newDoc, expiry_date: e.target.value})}
                  className="bg-white/5 border-white/10 text-white [color-scheme:dark]" 
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128]"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
                        <button 
                          onClick={() => setViewingDoc(doc)}
                          className="p-2 text-white/40 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="p-2 text-white/40 hover:text-[#FF5252] transition-colors">
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
          <p className="text-sm text-white/40 mb-4">Belgenizin fotoğrafını çekin, Droto otomatik olarak bilgileri okusun.</p>
          <Button 
            onClick={() => toast.info("Demo modunda kamera erişimi kısıtlıdır. Lütfen manuel ekleme yapın.")}
            variant="outline" 
            className="border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 rounded-xl"
          >
            Kamerayı Aç
          </Button>
        </CardContent>
      </Card>

      {/* View Document Modal */}
      <AnimatePresence>
        {viewingDoc && (
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(viewingDoc.status)}`}>
                      {getTypeIcon(viewingDoc.type)}
                    </div>
                    <DialogTitle>{viewingDoc.title}</DialogTitle>
                  </div>
                  <button 
                    onClick={() => setViewingDoc(null)}
                    className="p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="aspect-[4/3] bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-white/20 mx-auto mb-2" />
                      <p className="text-xs text-white/40">Belge Görüntüsü (Demo)</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Tür</p>
                      <p className="text-sm font-medium capitalize">{viewingDoc.type}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Durum</p>
                      <p className={`text-sm font-medium capitalize ${viewingDoc.status === 'valid' ? 'text-[#00E676]' : viewingDoc.status === 'warning' ? 'text-[#FFD600]' : 'text-[#FF5252]'}`}>
                        {viewingDoc.status === 'valid' ? 'Geçerli' : viewingDoc.status === 'warning' ? 'Yaklaşıyor' : 'Süresi Dolmuş'}
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl col-span-2">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Son Geçerlilik Tarihi</p>
                      <p className="text-sm font-medium">{viewingDoc.expiry_date}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setViewingDoc(null)}
                    className="w-full bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold"
                  >
                    Kapat
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
