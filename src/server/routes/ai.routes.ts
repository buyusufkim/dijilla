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
    // DÜZELTME: Nesne değil, doğrudan string gönderiyoruz
    genAI = new GoogleGenAI(apiKey);
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
    
    const allowedModels = [
      "gemini-1.5-flash-8b", 
      "gemini-1.5-flash", 
      "gemini-3-flash-preview"
    ];
    
    const defaultModel = process.env.GEMINI_MODEL || "gemini-1.5-flash-8b";
    const modelName = allowedModels.includes(requestedModel) ? requestedModel : defaultModel;

    let finalContents = contents;
    if (!finalContents && prompt) {
      finalContents = [{ role: "user", parts: [{ text: prompt }] }];
    }

    // Modeli alıyoruz
    const model = ai.getGenerativeModel({ 
      model: modelName 
    });

    // Sistem talimatı varsa ekliyoruz
    if (systemInstruction) {
      model.systemInstruction = { parts: [{ text: systemInstruction }], role: "system" };
    }

    // SIRALAMA DÜZELTİLDİ: Önce üretiyoruz, sonra cevabı alıyoruz
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
    console.error("[AI Route Error]", error?.message || error);

    return res.status(500).json({
      success: false,
      error: {
        message: error?.message || "AI içeriği oluşturulamadı.",
      },
    });
  }
});

export default router;