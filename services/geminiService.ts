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
          name: { type: Type.STRING, description: "Ingredient name (e.g., Aged Rum, Lemon Zest, Smoke)" },
          reason: { type: Type.STRING, description: "Why this ingredient fits the user's text (e.g., 'For your lingering regret')" }
        },
        required: ["part", "name", "reason"]
      }
    }
  },
  required: ["name", "description", "baseColor", "secondaryColor", "moodValue", "intensity", "sensation", "ingredients"]
};

const summarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summaryText: { type: Type.STRING, description: "A psychological summary of the user's emotional week/month (approx 50 words)." },
    dominantMood: { type: Type.STRING, description: "The most recurring emotion (e.g., 'Melancholy', 'Manic', 'Peaceful')." },
    suggestedDrinkName: { type: Type.STRING, description: "A name for a drink that summarizes this entire period." },
    suggestedDrinkDescription: { type: Type.STRING, description: "Description of this summary drink." }
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
    You are an expert "Emotional Mixologist" with a background in psychology. 
    Your goal is to analyze the user's input text to create a metaphorical cocktail.

    CRITICAL INSTRUCTION: 
    1. Do not just look at surface keywords. Analyze the SUBTEXT. 
    2. Output text fields (name, description, sensation, ingredient name/reason) STRICTLY in ${language === 'zh' ? 'Simplified Chinese' : 'English'}.
    3. IMPORTANT: The ingredient 'part' field MUST ALWAYS be one of: "Base", "Middle", "Top", "Finish" (Keep in English regardless of output language).

    1. Analyze the sentiment (moodValue) and intensity accurately. 
       - -1.0 is deep despair/rage. 
       - 1.0 is pure ecstasy. 
       - 0 is not just "neutral", it can be "numb" or "balanced".
    2. Choose colors that match the complex emotion.
    3. Create a recipe where every ingredient symbolizes a specific part of their psychological state.
    
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
      ...data
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback
    const fallbackText = language === 'zh' 
      ? { name: "静默杂音", desc: "信号丢失，唯余空杯。", sensation: "空虚", reason: "为了那份沉默" }
      : { name: "Static Noise", desc: "The signal was lost, but the glass remains.", sensation: "Empty", reason: "For the silence" };

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
        { part: "Base", name: "Vodka", reason: fallbackText.reason }
      ],
      createdAt: Date.now()
    };
  }
};

export const translateCocktail = async (cocktail: MoodCocktail, language: Language): Promise<MoodCocktail> => {
  const apiKey = getApiKey();
  if (!apiKey) return cocktail;

  const ai = new GoogleGenAI({ apiKey });
  const targetLangName = language === 'zh' ? 'Simplified Chinese' : 'English';

  const prompt = `
    Translate the text fields of the following cocktail JSON into ${targetLangName}.
    
    Input JSON: ${JSON.stringify(cocktail)}
    
    Requirements:
    1. Translate 'name', 'description', 'sensation'.
    2. For 'ingredients', translate 'name' and 'reason'.
    3. CRITICAL: Keep 'part' values exactly as "Base", "Middle", "Top", "Finish" (Do not translate 'part').
    4. Keep all color codes ('baseColor', 'secondaryColor') and numerical values ('moodValue', 'intensity', 'createdAt', 'id') EXACTLY the same.
    5. Maintain the poetic, abstract tone matching the original meaning.
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
    
    // Ensure ID and CreatedAt are preserved (Gemini response schema might not strictly include them if we reuse cocktailSchema)
    return {
        ...translated,
        id: cocktail.id,
        createdAt: cocktail.createdAt
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

  // Prepare minimal data for context window efficiency
  const historyData = history.map(h => ({
    date: new Date(h.createdAt).toLocaleDateString(),
    mood: h.moodValue,
    sensation: h.sensation,
    name: h.name,
    desc: h.description
  }));

  const prompt = `
    Analyze this user's emotional history of cocktails over the recent period. 
    Identify the trend. Are they getting happier? Spiraling down? oscillating wildly? Stagnating?
    
    Data: ${JSON.stringify(historyData)}
    
    Provide a psychological summary, identify the dominant mood, and suggest one "Ultimate Cocktail" that represents this entire period.
    
    IMPORTANT: Output all text fields STRICTLY in ${language === 'zh' ? 'Simplified Chinese' : 'English'}.
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