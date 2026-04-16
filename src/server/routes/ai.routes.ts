import { Router, Request, Response } from "express";
import { GoogleGenAI, GenerationConfig } from "@google/genai";

const router = Router();

let genAI: any = null; // Tip uyuşmazlığını aşmak için geçici olarak any kullanıyoruz

function getGenAI() {
  if (!genAI) {
    const rawKey = process.env.GEMINI_SV_KEY;
    if (!rawKey) {
      throw new Error("GEMINI_SV_KEY sunucuda bulunamadı.");
    }
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");
    // SDK başlatma
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
}

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, contents, model: requestedModel, systemInstruction, config } = req.body;

    const ai = getGenAI();
    
    // Model Kontrolü (Whitelist)
    const allowedModels = [
      "gemini-1.5-flash-8b", 
      "gemini-1.5-flash", 
      "gemini-3-flash-preview"
    ];
    const defaultModel = process.env.GEMINI_MODEL || "gemini-1.5-flash-8b";
    const modelName = allowedModels.includes(requestedModel) ? requestedModel : defaultModel;

    // İçerik Yapılandırması
    let finalContents = contents;
    if (!finalContents && prompt) {
      finalContents = [{ role: "user", parts: [{ text: prompt }] }];
    }

    // Model nesnesini oluşturma
    const model = ai.getGenerativeModel({ 
      model: modelName 
    });

    // Sistem talimatı varsa ekle
    if (systemInstruction) {
      model.systemInstruction = {
        parts: [{ text: systemInstruction }],
        role: "system"
      };
    }

    // Üretim başlatma
    const result = await model.generateContent({
      contents: finalContents,
      generationConfig: config as GenerationConfig
    });

    const response = await result.response;
    const text = response.text();

    return res.json({
      success: true,
      data: {
        text: text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
      },
    });
  } catch (error: any) {
    console.error("[AI Rota Hatası]", error?.message || error);
    return res.status(500).json({
      success: false,
      error: { message: error?.message || "İçerik üretilirken bir hata oluştu." },
    });
  }
});

export default router;