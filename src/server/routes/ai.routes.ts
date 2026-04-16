import { Router, Request, Response } from "express";
// DİKKAT: GoogleGenerativeAI sınıfını import ediyoruz, GoogleGenAI değil!
import { GoogleGenerativeAI } from "@google/genai";

const router = Router();

// Singleton yapısı
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const rawKey = process.env.GEMINI_SV_KEY;
    if (!rawKey) {
      throw new Error("GEMINI_SV_KEY sunucuda yapılandırılmamış.");
    }

    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");
    
    // Versiyon 1.x'te constructor doğrudan string alır
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, contents, model: requestedModel, systemInstruction, config } = req.body;

    if (!prompt && !contents) {
      return res.status(400).json({
        success: false,
        error: { message: "Prompt veya içerik gerekli." },
      });
    }

    const ai = getGenAI();
    
    // Model Beyaz Listesi (Bütçeni koruyoruz)
    const allowedModels = [
      "gemini-1.5-flash-8b", 
      "gemini-1.5-flash", 
      "gemini-3-flash-preview"
    ];
    const defaultModel = process.env.GEMINI_MODEL || "gemini-1.5-flash-8b";
    const modelName = allowedModels.includes(requestedModel) ? requestedModel : defaultModel;

    // Doğru metod: getGenerativeModel
    const model = ai.getGenerativeModel({ 
      model: modelName,
      // Sistem talimatını burada veriyoruz
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }], role: "system" } : undefined
    });

    let finalContents = contents;
    if (!finalContents && prompt) {
      finalContents = [{ role: "user", parts: [{ text: prompt }] }];
    }

    // Üretim aşaması
    const result = await model.generateContent({
      contents: finalContents,
      generationConfig: config
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
      error: { message: error?.message || "AI yanıtı oluşturulurken hata oluştu." },
    });
  }
});

export default router;