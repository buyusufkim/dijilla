import React from "react";
import { motion } from "motion/react";
import { Bot, Loader2 } from "lucide-react";

export const ChatLoading: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4"
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#00E5FF]/20 border border-[#00E5FF]/30">
        <Bot className="w-4 h-4 text-[#00E5FF]" />
      </div>
      <div className="flex flex-col items-start max-w-[80%]">
        <div className="p-4 rounded-2xl bg-[#0A1128] border border-white/10 text-white/90 rounded-tl-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
          <span className="text-sm">Düşünüyor...</span>
        </div>
      </div>
    </motion.div>
  );
};
