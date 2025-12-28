import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGrowthAdvice = async (petType: string, age: string, question: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure the environment variable.";
  }

  try {
    const prompt = `
      You are an expert pet care consultant for the "Island Life" community app.
      
      User's Pet: ${petType}
      Age: ${age}
      User Question: ${question}
      
      Please provide a short, friendly, and helpful tip (max 100 words) regarding the growth or care of this pet.
      Focus on health, happiness, and community values.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Sorry, I couldn't generate advice at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to the Island Advisor network. Please try again later.";
  }
};
