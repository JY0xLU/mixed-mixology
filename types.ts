export enum AppState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY'
}

export type Language = 'en' | 'zh';

export interface Ingredient {
  name: string;
  reason: string; // "From your anxiety"
  part: 'Base' | 'Top' | 'Middle' | 'Finish';
}

export interface RealRecipe {
  drinkName: string;
  type: 'Cocktail' | 'Mocktail' | 'Tea' | 'Coffee';
  ingredients: string[];
  steps: string[];
}

export interface SonicVibe {
  description: string; // "Lo-fi beats with rain"
  genre: string;
  baseFrequency: number; // Hz, for Web Audio API synthesis
}

export interface MoodCocktail {
  id: string;
  language?: Language; // Track the language of this specific data
  name: string;
  description: string;
  baseColor: string; // Hex
  secondaryColor: string; // Hex
  moodValue: number; // -1 to 1
  intensity: number; // 0 to 1
  sensation: string; // "Tight", "Flowing", "Heavy"
  ingredients: Ingredient[];
  realRecipe?: RealRecipe; // New: O2O feature
  sonicVibe?: SonicVibe;   // New: Sonic Seasoning
  copingTip?: string;      // New: Emergency support (e.g. "4-7-8 Breathing")
  createdAt: number;
}

export interface PeriodSummary {
  summaryText: string;
  dominantMood: string;
  suggestedDrinkName: string;
  suggestedDrinkDescription: string;
}

export interface AnalysisState {
  currentMood: number; // -1 (Negative) to 1 (Positive)
  intensity: number; // 0 to 1
  isStable: boolean;
}