import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Camera, Paperclip, ArrowLeft, Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
};

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Merhaba! Ben Dijilla Yapay Zeka. Aracınızla ilgili bir arızayı teşhis edebilir, sigorta poliçeleriniz hakkında bilgi verebilir veya acil durumlarda sizi yönlendirebilirim. Size nasıl yardımcı olabilirim?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userText = input.trim();
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText || (selectedImage ? "Bir fotoğraf gönderildi." : ""),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let response;
      if (currentImage) {
        const base64Data = currentImage.split(',')[1];
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: userText || "Bu araçtaki sorunu teşhis edebilir misin? Uyarı lambası veya fiziksel bir hasar varsa belirt." },
                { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
              ]
            }
          ],
          config: {
            systemInstruction: "Sen Dijilla'nın uzman araç arıza teşhis asistanısın. Fotoğrafları analiz ederek olası sorunları, ciddiyet seviyesini ve yapılması gerekenleri profesyonelce açıkla."
          }
        });
      } else {
        const history = messages.map(m => `${m.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${m.content}`).join('\n');
        const prompt = `Sen Dijilla adlı akıllı araç ekosisteminin yapay zeka asistanısın. Kullanıcılara araç arızaları, sigorta poliçeleri ve acil durumlar konusunda yardımcı oluyorsun. 
        
        Geçmiş konuşma:
        ${history}
        
        Kullanıcı: ${userText}`;

        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.text || "Üzgünüm, şu anda yanıt veremiyorum.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/20 flex items-center justify-center border border-[#00E5FF]/30">
            <Bot className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Yapay Zeka Asistanı</h1>
            <p className="text-xs text-[#00E676] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
              Çevrimiçi
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <Card className="flex-1 bg-[#1A233A] border-white/10 overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
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
          ))}
          {isLoading && (
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
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
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
      </Card>
    </div>
  );
}
