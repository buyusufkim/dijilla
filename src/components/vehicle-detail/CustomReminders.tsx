import React from "react";
import { Bell, Plus, Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reminder } from "./types";

interface CustomRemindersProps {
  reminders: Reminder[];
  isAddingReminder: boolean;
  setIsAddingReminder: (val: boolean) => void;
  newReminderTitle: string;
  setNewReminderTitle: (val: string) => void;
  newReminderDate: string;
  setNewReminderDate: (val: string) => void;
  onAddReminder: () => void;
  onDeleteReminder: (id: string) => void;
}

export const CustomReminders: React.FC<CustomRemindersProps> = ({
  reminders,
  isAddingReminder,
  setIsAddingReminder,
  newReminderTitle,
  setNewReminderTitle,
  newReminderDate,
  setNewReminderDate,
  onAddReminder,
  onDeleteReminder
}) => {
  return (
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
              onClick={onAddReminder}
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
                  onClick={() => onDeleteReminder(reminder.id)}
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
  );
};
