import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MoodCocktail } from "../types";

// Helper to get API key
const getApiKey = () => process.env.API_KEY || '';

// Response schema for the cocktail generation
const cocktailSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Creative, poetic name of the cocktail (e.g., Midnight Cacao Mild)" },
    description: { type: Type.STRING, description: "A short, evocative description of the drink's vibe." },
    baseColor: { type: Type.STRING, description: "Main hex color representing the mood (e.g., #4B0082)" },
    secondaryColor: { type: Type.STRING, description: "Secondary hex color for gradients (e.g., #FF6347)" },
    moodValue: { type: Type.NUMBER, description: "Estimated sentiment from -1.0 (very negative) to 1.0 (very positive)" },
    intensity: { type: Type.NUMBER, description: "Emotional intensity from 0.0 (calm) to 1.0 (explosive)" },
    sensation: { type: Type.STRING, description: "One word physical sensation (e.g., Tight, Floating, Heavy, Warm)" },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          part: { type: Type.STRING, enum: ["Base", "Top", "Middle", "Finish"] },
          name: { type: Type.STRING, description: "Ingredient name (e.g., Aged Rum, Lemon Zest, Smoke)" },
          reason: { type: Type.STRING, description: "Why this ingredient fits the user's text (e.g., 'For your lingering regret')" }
        },
        required: ["part", "name", "reason"]
      }
    }
  },
  required: ["name", "description", "baseColor", "secondaryColor", "moodValue", "intensity", "sensation", "ingredients"]
};

export const generateCocktail = async (inputText: string): Promise<MoodCocktail> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert "Emotional Mixologist". Your goal is to analyze the user's input text (which describes their day, feelings, or rant) and create a metaphorical cocktail recipe that embodies their current emotional state.
    
    1. Analyze the sentiment (moodValue) and intensity.
    2. Choose colors that match the emotion (Blue/Purple/Grey for sad/deep, Red/Orange for angry/intense, Yellow/Green for happy/calm).
    3. Create a recipe where every ingredient symbolizes a part of their story.
    
    User Input: "${inputText}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cocktailSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);

    return {
      id: Date.now().toString(),
      createdAt: Date.now(),
      ...data
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback mock data in case of failure to prevent app crash during demo
    return {
      id: Date.now().toString(),
      name: "Silent Fallback",
      description: "A quiet mix for when the connection fades.",
      baseColor: "#334155",
      secondaryColor: "#94a3b8",
      moodValue: 0,
      intensity: 0.1,
      sensation: "Static",
      ingredients: [
        { part: "Base", name: "Neutral Spirit", reason: "Connection lost" }
      ],
      createdAt: Date.now()
    };
  }
};