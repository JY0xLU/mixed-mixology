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

export interface MoodCocktail {
  id: string;
  name: string;
  description: string;
  baseColor: string; // Hex
  secondaryColor: string; // Hex
  moodValue: number; // -1 to 1
  intensity: number; // 0 to 1
  sensation: string; // "Tight", "Flowing", "Heavy"
  ingredients: Ingredient[];
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