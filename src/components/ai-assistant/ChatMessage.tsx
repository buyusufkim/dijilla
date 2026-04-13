import React from "react";
import { motion } from "motion/react";
import { Bot, User } from "lucide-react";
import { Message } from "./types";

interface ChatMessageProps {
  msg: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ msg }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        msg.role === 'user' 
          ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
          : 'bg-[#00E5FF]/20 border border-[#00E5FF]/30'
      }`}>
        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#00E5FF]" />}
      </div>
      
      <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div className={`p-4 rounded-2xl ${
          msg.role === 'user'
            ? 'bg-[#00E5FF] text-[#0A1128] rounded-tr-sm'
            : 'bg-[#0A1128] border border-white/10 text-white/90 rounded-tl-sm'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
        <span className="text-[10px] text-white/40 mt-1 px-1">{msg.time}</span>
      </div>
    </motion.div>
  );
};
