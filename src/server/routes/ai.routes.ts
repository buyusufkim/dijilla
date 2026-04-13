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
    const modelName = requestedModel || "gemini-3-flash-preview";

    let finalContents = contents;
    if (!finalContents && prompt) {
      finalContents = [{ role: "user", parts: [{ text: prompt }] }];
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: finalContents,
      config: {
        ...config,
        systemInstruction: systemInstruction || config?.systemInstruction,
      },
    });

    return res.json({
      success: true,
      data: {
        text: response.text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
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