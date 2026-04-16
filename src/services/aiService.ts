const API_URL = "/api/ai/generate";

async function callAiEndpoint(payload: any) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `AI request failed with status ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || "AI request failed");
  }

  return result.data;
}

export const aiService = {
  async generateTravelRoute(prompt: string) {
    return callAiEndpoint({
      prompt,
      model: "gemini-2.0-flash",  // ✅ DÜZELTİLDİ
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            distance: { type: "STRING" },
            totalKm: { type: "NUMBER" },
            duration: { type: "STRING" },
            trafficStatus: { type: "STRING" },
            trafficDelay: { type: "STRING" },
            fuelStatus: { type: "STRING", enum: ["ok", "critical"] },
            estimatedCost: { type: "STRING" },
            averageFuelConsumption: { type: "STRING" },
            stops: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "NUMBER" },
                  type: { type: "STRING", enum: ["fuel", "rest", "food"] },
                  name: { type: "STRING" },
                  distance: { type: "STRING" },
                  time: { type: "STRING" }
                },
                required: ["id", "type", "name", "distance", "time"]
              }
            }
          },
          required: ["distance", "totalKm", "duration", "trafficStatus", "fuelStatus", "estimatedCost", "averageFuelConsumption", "stops"]
        },
      },
    });
  },

  async generateMaintenanceRecommendations(prompt: string) {
    const data = await callAiEndpoint({
      prompt,
      model: "gemini-2.0-flash",  // ✅ DÜZELTİLDİ
      config: { responseMimeType: "application/json" },
    });
    return data.text;
  },

  async generateAssistantResponse(prompt: string) {
    const data = await callAiEndpoint({
      prompt,
      model: "gemini-2.0-flash",  // ✅ DÜZELTİLDİ
    });
    return data.text;
  },

  async generateAssistantImageResponse(userText: string, base64Data: string) {
    const data = await callAiEndpoint({
      contents: [
        {
          parts: [
            { text: userText || "Bu araçtaki sorunu teşhis edebilir misin? Uyarı lambası veya fiziksel bir hasar varsa belirt." },
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
          ]
        }
      ],
      model: "gemini-2.0-flash",  // ✅ DÜZELTİLDİ
      config: {
        systemInstruction: "Sen Droto'nun uzman araç arıza teşhis asistanısın. Fotoğrafları analiz ederek olası sorunları, ciddiyet seviyesini ve yapılması gerekenleri profesyonelce açıkla."
      }
    });
    return data.text;
  }
};