import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MoodCocktail, PeriodSummary, Language } from "../types";

// Helper to get API key
const getApiKey = () => process.env.API_KEY || '';

// --- Schemas ---

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
          name: { type: Type.STRING, description: "ABSTRACT METAPHORICAL ingredient name (e.g., 'Liquid Courage'). DO NOT use real food/alcohol names." },
          reason: { type: Type.STRING, description: "Why this abstract concept fits the user's emotion." }
        },
        required: ["part", "name", "reason"]
      }
    },
    realRecipe: {
      type: Type.OBJECT,
      properties: {
        drinkName: { type: Type.STRING, description: "A real-world drink name (Cocktail/Mocktail) that matches the mood." },
        type: { type: Type.STRING, enum: ["Cocktail", "Mocktail", "Tea", "Coffee"] },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of real ingredients with measurements." },
        steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Short preparation steps." }
      },
      required: ["drinkName", "type", "ingredients", "steps"]
    },
    sonicVibe: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: "Description of the ambient soundscape (e.g., 'Rain on a tin roof with cello')." },
        genre: { type: Type.STRING, description: "Music genre (e.g., Lo-fi, Jazz, Ambient, Drone)." },
        baseFrequency: { type: Type.NUMBER, description: "Base frequency in Hz for a synth drone (e.g., 60 for deep/sad, 440 for neutral, 800 for anxious/bright)." }
      },
      required: ["description", "genre", "baseFrequency"]
    },
    // New Feature: Crisis/Distress Support
    copingTip: {
      type: Type.STRING,
      description: "If the input indicates high anxiety, panic, or hopelessness, provide a title of a coping technique (e.g. 'Box Breathing', 'Grounding'). If mood is normal, leave empty."
    }
  },
  required: ["name", "description", "baseColor", "secondaryColor", "moodValue", "intensity", "sensation", "ingredients", "realRecipe", "sonicVibe"]
};

const summarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summaryText: { type: Type.STRING, description: "A warm, empathetic psychological summary of the user's emotional week (approx 50 words). Focus on richness of experience, not clinical diagnosis." },
    dominantMood: { type: Type.STRING, description: "The poetic theme of the week (e.g., 'Introspective Blue', 'Radiant Gold'). Avoid clinical terms." },
    suggestedDrinkName: { type: Type.STRING, description: "A name for a 'healing' or 'balancing' drink for this period." },
    suggestedDrinkDescription: { type: Type.STRING, description: "Describe the drink AND explicitly explain WHY it helps balance the user's specific recent emotions (Functional Healing)." }
  },
  required: ["summaryText", "dominantMood", "suggestedDrinkName", "suggestedDrinkDescription"]
};

// --- Generators ---

export const generateCocktail = async (inputText: string, language: Language): Promise<MoodCocktail> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  // Improved prompt for deeper analysis with Language instruction
  const prompt = `
    You are an expert "Emotional Mixologist". Analyze the SUBTEXT of the input.
    
    Instruction:
    1. Output text fields STRICTLY in ${language === 'zh' ? 'Simplified Chinese' : 'English'}.
    2. 'part' field MUST be: "Base", "Middle", "Top", "Finish".
    3. COLORS: Choose specific Hex Codes that perfectly match the emotion.
    4. ABSTRACT INGREDIENTS: Use METAPHORS (e.g., "Distilled Regret").
    5. REAL RECIPE: Provide a SAFE, ACTUAL drinkable recipe (Cocktail or Mocktail) that physically embodies the mood (e.g., Spicy for anger, Warm tea for sadness).
    6. SONIC VIBE: Suggest a soundscape. Frequency: Low (50-150Hz) for heavy moods, Mid (200-500Hz) for calm, High (600-1000Hz) for anxiety/excitement.
    7. RISK CHECK: If the user expresses hopelessness, panic, or severe distress, populate 'copingTip' with a suitable technique name (e.g. "4-7-8 Breathing").
    
    User Input: "${inputText}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cocktailSchema,
        temperature: 0.8, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);

    return {
      id: Date.now().toString(),
      createdAt: Date.now(),
      language: language,
      ...data
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback
    const fallbackText = language === 'zh' 
      ? { name: "静默杂音", desc: "信号丢失，唯余空杯。", sensation: "空虚", ingredient: "凝结的沉默", reason: "为了那份沉默" }
      : { name: "Static Noise", desc: "The signal was lost, but the glass remains.", sensation: "Empty", ingredient: "Condensed Silence", reason: "For the silence" };

    return {
      id: Date.now().toString(),
      name: fallbackText.name,
      description: fallbackText.desc,
      baseColor: "#334155",
      secondaryColor: "#94a3b8",
      moodValue: 0,
      intensity: 0.1,
      sensation: fallbackText.sensation,
      ingredients: [
        { part: "Base", name: fallbackText.ingredient, reason: fallbackText.reason }
      ],
      createdAt: Date.now(),
      language: language
    };
  }
};

export const translateCocktail = async (cocktail: MoodCocktail, language: Language): Promise<MoodCocktail> => {
  const apiKey = getApiKey();
  if (!apiKey) return cocktail;

  const ai = new GoogleGenAI({ apiKey });
  const targetLangName = language === 'zh' ? 'Simplified Chinese' : 'English';

  const prompt = `
    Translate this cocktail JSON into ${targetLangName}.
    
    Input: ${JSON.stringify(cocktail)}
    
    Rules:
    1. Translate 'name', 'description', 'sensation'.
    2. Translate 'ingredients' names/reasons.
    3. Translate 'realRecipe' fields (drinkName, ingredients, steps).
    4. Translate 'sonicVibe' description/genre.
    5. Translate 'copingTip' if present.
    6. KEEP keys and strict enum values (e.g. 'Cocktail', 'Base').
    7. PRESERVE all IDs, colors, and numbers.
  `;

  try {
     const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cocktailSchema,
      }
    });

    const text = response.text;
    if (!text) return cocktail;
    const translated = JSON.parse(text);
    
    return {
        ...translated,
        id: cocktail.id,
        createdAt: cocktail.createdAt,
        language: language
    };
  } catch (error) {
    console.error("Translation failed", error);
    return cocktail;
  }
};

export const generateHistorySummary = async (history: MoodCocktail[], language: Language): Promise<PeriodSummary> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key not found");
  
  if (history.length === 0) {
    return {
      summaryText: language === 'zh' ? "未找到记录。" : "No records found.",
      dominantMood: language === 'zh' ? "未知" : "Unknown",
      suggestedDrinkName: language === 'zh' ? "空白画布" : "Blank Canvas",
      suggestedDrinkDescription: language === 'zh' ? "开始调配以描绘你的图景。" : "Start mixing to paint your picture."
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const historyData = history.map(h => ({
    date: new Date(h.createdAt).toLocaleDateString(),
    mood: h.moodValue,
    sensation: h.sensation,
    name: h.name,
    desc: h.description
  }));

  const prompt = `
    You are an empathetic therapist and poet analyzing the user's emotional journey.
    Data: ${JSON.stringify(historyData)}
    
    Reframing Rules:
    1. NEVER use judgmental words like "volatile", "unstable", "moody", or "bad".
    2. Reframe fluctuations as "richness", "dynamic spectrum", or "passionate".
    3. Reframe sadness/negativity as "depth", "introspection", or "processing".
    4. The Suggested Drink must be FUNCTIONAL: Explain WHY it heals or balances their specific week (e.g., "To ground your high energy...", "To warm your introspection...").

    Output strictly in ${language === 'zh' ? 'Simplified Chinese' : 'English'}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: summarySchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);

  } catch (error) {
    console.error("Summary Error", error);
    return {
        summaryText: language === 'zh' ? "此时无法分析趋势。" : "Could not analyze trends at this time.",
        dominantMood: "N/A",
        suggestedDrinkName: language === 'zh' ? "神秘特调" : "Mystery Mix",
        suggestedDrinkDescription: language === 'zh' ? "请稍后再试。" : "Try again later."
    }
  }
};