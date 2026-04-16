import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const rawKey = process.env.GEMINI_SV_KEY;

    if (!rawKey) {
      throw new Error("GEMINI_SV_KEY is not configured on the server.");
    }

    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");
    genAI = new GoogleGenAI({ apiKey });
  }

  return genAI;
}

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, contents, model: requestedModel, systemInstruction, config } = req.body;

    if (!prompt && !contents) {
      return res.status(400).json({
        success: false,
        error: { message: "Prompt or contents are required." },
      });
    }

    const ai = getGenAI();
    // Sadece senin izin verdiğin ucuz/hızlı modeller çalıştırılabilir.
    // Dışarıdan pahalı model talep edilirse reddedilir.
    const allowedModels = [
      "gemini-1.5-flash-8b", 
      "gemini-1.5-flash", 
      "gemini-3-flash-preview"
    ];
    
    // Sunucudaki .env dosyasından varsayılan modeli al, yoksa flash-8b (en ucuzu) kullan
    const defaultModel = process.env.GEMINI_MODEL || "gemini-1.5-flash-8b";
    
    // Frontend'den gelen model bizim beyaz listemizde yoksa varsayılanı kullan
    const modelName = allowedModels.includes(requestedModel) 
      ? requestedModel 
      : defaultModel;

      
    let finalContents = contents;
    if (!finalContents && prompt) {
      finalContents = [{ role: "user", parts: [{ text: prompt }] }];
    }

    // Eski hatalı olabilecek blok yerine bunu yapıştır:
    const model = ai.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemInstruction || config?.systemInstruction 
    });

    const response = await model.generateContent({
      contents: finalContents,
      generationConfig: config // config objesini buraya paslıyoruz
    });

    // Yanıtı alma kısmını da kütüphaneye uygun güncelleyelim:
    const result = await response.response;
    const text = result.text();

    return res.json({
      success: true,
      data: {
        text: text,
        groundingMetadata: result.candidates?.[0]?.groundingMetadata,
      },
    });
  } catch (error: any) {
    console.error("[AI Route Error]", error?.message || error);

    return res.status(500).json({
      success: false,
      error: {
        message: error?.message || "Failed to generate AI content.",
      },
    });
  }
});

export default router;