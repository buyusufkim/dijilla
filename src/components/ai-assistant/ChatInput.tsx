import React, { RefObject } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Camera, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  selectedImage: string | null;
  setSelectedImage: (val: string | null) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSend: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isLoading,
  selectedImage,
  setSelectedImage,
  fileInputRef,
  handleImageSelect,
  handleSend,
}) => {
  return (
    <div className="p-4 bg-[#0A1128] border-t border-white/10">
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 relative inline-block"
          >
            <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-[#00E5FF]/30" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF3D00] rounded-full flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageSelect} 
          accept="image/*" 
          className="hidden" 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-white/40 hover:text-white transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-white/40 hover:text-[#00E5FF] transition-colors"
        >
          <Camera className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mesajınızı yazın..."
            disabled={isLoading}
            className="w-full bg-[#1A233A] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all disabled:opacity-50"
          />
        </div>
        <Button 
          onClick={handleSend}
          disabled={(!input.trim() && !selectedImage) || isLoading}
          className="bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] rounded-xl px-4 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
