import React from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BotIcon } from "./Icons";

interface AIAssistantTeaserProps {
  navigate: (path: string) => void;
}

export const AIAssistantTeaser: React.FC<AIAssistantTeaserProps> = ({ navigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-4"
    >
      <Card 
        onClick={() => navigate('/ai-assistant')}
        className="bg-gradient-to-r from-[#1A233A] to-[#2A3B5C] border-white/10 cursor-pointer hover:border-white/20 transition-colors"
      >
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/20 flex items-center justify-center border border-[#00E5FF]/30">
              <BotIcon className="w-8 h-8 text-[#00E5FF]" />
            </div>
            <div>
              <h4 className="text-xl font-semibold">Yapay Zeka Asistanı</h4>
              <p className="text-sm text-white/60 mt-1">
                Arızayı kameradan teşhis et, poliçe detaylarını sor veya
                anında destek al.
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/40" />
        </CardContent>
      </Card>
    </motion.div>
  );
};
