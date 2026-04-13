import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordForm: any;
  setRecordForm: (form: any) => void;
  onSave: () => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  recordForm,
  setRecordForm,
  onSave,
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
          <Card className="bg-[#1A233A] border-white/10 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
              <CardTitle>Bakım Kaydı Ekle</CardTitle>
              <button onClick={onClose} className="p-1 text-white/50 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
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
              <Button onClick={onSave} className="w-full bg-[#00E5FF] text-[#0A1128] font-bold">Kaydet</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentForm: any;
  setAppointmentForm: (form: any) => void;
  onSave: () => void;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointmentForm,
  setAppointmentForm,
  onSave,
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
          <Card className="bg-[#1A233A] border-white/10 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
              <CardTitle>Bakım Randevusu Al</CardTitle>
              <button onClick={onClose} className="p-1 text-white/50 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
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
              <Button onClick={onSave} className="w-full bg-[#00E676] text-[#0A1128] font-bold">Randevu Oluştur</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
