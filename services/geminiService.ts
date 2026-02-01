
import { GoogleGenAI, Type } from "@google/genai";
import { UserConfig, AISpecs } from "../types";

export const getCarSpecs = async (config: UserConfig): Promise<AISpecs> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Generate highly detailed, professional automotive specifications for a ${config.color} ${config.car.brand} ${config.car.name} with a ${config.performanceTier} performance package. 
  Include technical details about the engine (or motors), drivetrain, weight reduction, and aerodynamics. 
  Provide a professional marketing description and one interesting historical or technical fun fact about this specific model.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            technicalDetails: {
              type: Type.OBJECT,
              properties: {
                engine: { type: Type.STRING },
                drivetrain: { type: Type.STRING },
                weight: { type: Type.STRING },
                aerodynamics: { type: Type.STRING },
              },
              required: ["engine", "drivetrain", "weight", "aerodynamics"]
            },
            funFact: { type: Type.STRING },
          },
          required: ["description", "technicalDetails", "funFact"]
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    return data as AISpecs;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      description: `The ${config.car.brand} ${config.car.name} is a pinnacle of automotive engineering, finished in stunning ${config.color}.`,
      technicalDetails: {
        engine: "High-performance power unit optimized for peak delivery.",
        drivetrain: "Advanced all-wheel drive system.",
        weight: "Lightweight composite construction.",
        aerodynamics: "Active aero components for maximum downforce."
      },
      funFact: "This model series has a long heritage of track dominance."
    };
  }
};
