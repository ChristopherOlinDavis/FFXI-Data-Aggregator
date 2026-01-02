
import { GoogleGenAI, Type } from "@google/genai";
import { WikiSourceData } from "../types";

const API_KEY = process.env.API_KEY || "";

export const reconcileData = async (bg: WikiSourceData, clopedia: WikiSourceData) => {
  if (!API_KEY) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    I have data for the same FFXI item from two different sources. 
    Source 1 (BG-Wiki): ${JSON.stringify(bg)}
    Source 2 (FFXiclopedia): ${JSON.stringify(clopedia)}
    
    Tasks:
    1. Reconcile the stats into one definitive object.
    2. Merge the acquisition lists, removing duplicates.
    3. Provide a concise, professional summary of the item's utility in modern FFXI (retail).
    4. Flag any major contradictions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reconciledStats: { type: Type.OBJECT, properties: {}, description: "Definitive stat block" },
            unifiedDescription: { type: Type.STRING },
            conflicts: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiSummary: { type: Type.STRING },
            status: { type: Type.STRING, description: "reconciled or conflict" }
          },
          required: ["reconciledStats", "unifiedDescription", "aiSummary", "status"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Reconciliation Error:", error);
    throw error;
  }
};
