import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/genAI"; // Doğru kütüphane bu!

const router = Router();
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const rawKey = process.env.GEMINI_SV_KEY;
    if (!rawKey) {
      throw new Error("GEMINI_SV_KEY sunucuda eksik! .env dosyanı kontrol et.");
    }
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, contents, model: requestedModel, systemInstruction, config } = req.body;

    const ai = getGenAI();
    
    // Bütçeni korumak için izin verilen modeller (Whitelist)
    const allowedModels = ["gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-3-flash-preview"];
    const defaultModel = process.env.GEMINI_MODEL || "gemini-1.5-flash-8b";
    const modelName = allowedModels.includes(requestedModel) ? requestedModel : defaultModel;

    // Modeli başlatma
    const model = ai.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }], role: "system" } : undefined
    });

    let finalContents = contents;
    if (!finalContents && prompt) {
      finalContents = [{ role: "user", parts: [{ text: prompt }] }];
    }

    const result = await model.generateContent({
      contents: finalContents,
      generationConfig: config
    });

    const response = await result.response;
    const text = response.text();

    return res.json({
      success: true,
      data: { text: text }
    });
  } catch (error: any) {
    console.error("[AI Rota Hatası]", error?.message || error);
    return res.status(500).json({
      success: false,
      error: { message: "Yapay zeka motoru çalıştırılamadı." }
    });
  }
});

export default router;