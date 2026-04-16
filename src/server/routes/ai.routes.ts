import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai"; // ✅ v1.x SDK: GoogleGenAI, lowercase 'genai'

const router = Router();
let genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const rawKey = process.env.GEMINI_SV_KEY;
    if (!rawKey) {
      throw new Error("GEMINI_SV_KEY sunucuda eksik! .env dosyanı kontrol et.");
    }
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      contents,
      model: requestedModel,
      systemInstruction,
      config,
    } = req.body;

    const ai = getGenAI();

    // Bütçeni korumak için izin verilen modeller (Whitelist)
    const allowedModels = [
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash",
      "gemini-2.0-flash",
    ];
    const defaultModel = process.env.GEMINI_MODEL || "gemini-1.5-flash-8b";
    const modelName = allowedModels.includes(requestedModel)
      ? requestedModel
      : defaultModel;

    // v1.x SDK: ai.models.generateContent({ model, contents, config })
    // systemInstruction config içine giriyor
    let finalContents = contents;
    if (!finalContents && prompt) {
      finalContents = [{ role: "user", parts: [{ text: prompt }] }];
    }

    const result = await ai.models.generateContent({
      model: modelName,
      contents: finalContents,
      config: {
        ...config,
        ...(systemInstruction
          ? { systemInstruction: systemInstruction }
          : {}),
      },
    });

    const text = result.text ?? "";

    return res.json({
      success: true,
      data: { text },
    });
  } catch (error: any) {
    console.error("[AI Rota Hatası]", error?.message || error);
    return res.status(500).json({
      success: false,
      error: { message: "Yapay zeka motoru çalıştırılamadı." },
    });
  }
});

export default router;
