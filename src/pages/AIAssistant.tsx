import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { aiService } from "@/services/aiService";

import { Message } from "@/components/ai-assistant/types";
import { AIAssistantHeader } from "@/components/ai-assistant/AIAssistantHeader";
import { ChatMessage } from "@/components/ai-assistant/ChatMessage";
import { ChatLoading } from "@/components/ai-assistant/ChatLoading";
import { ChatInput } from "@/components/ai-assistant/ChatInput";

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Merhaba! Ben Droto Yapay Zeka. Aracınızla ilgili bir arızayı teşhis edebilir, sigorta poliçeleriniz hakkında bilgi verebilir veya acil durumlarda sizi yönlendirebilirim. Size nasıl yardımcı olabilirim?",
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
      let responseText;
      if (currentImage) {
        const base64Data = currentImage.split(',')[1];
        responseText = await aiService.generateAssistantImageResponse(userText, base64Data);
      } else {
        const history = messages.map(m => `${m.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${m.content}`).join('\n');
        const prompt = `Sen Droto adlı akıllı araç ekosisteminin yapay zeka asistanısın. Kullanıcılara araç arızaları, sigorta poliçeleri ve acil durumlar konusunda yardımcı oluyorsun. 
        
        Geçmiş konuşma:
        ${history}
        
        Kullanıcı: ${userText}`;

        responseText = await aiService.generateAssistantResponse(prompt);
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText || "Üzgünüm, şu anda yanıt veremiyorum.",
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
      <AIAssistantHeader />

      <Card className="flex-1 bg-[#1A233A] border-white/10 overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}
          {isLoading && <ChatLoading />}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput 
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          fileInputRef={fileInputRef}
          handleImageSelect={handleImageSelect}
          handleSend={handleSend}
        />
      </Card>
    </div>
  );
}
