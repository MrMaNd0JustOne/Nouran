export interface DhikrItem {
  id: string;
  arabicText: string;
  repeatCount: number;
  virtue?: string;
  source: string;
  category: string;
}

export interface DhikrCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  badge?: string;
  items: DhikrItem[];
}

export interface AdhkarProgressState {
  date: string; // YYYY-MM-DD
  itemProgress: Record<string, number>; // dhikrId -> current remaining repetitions
  completedCategories: Record<string, boolean>; // categoryId -> boolean
}

export interface TasbeehPreset {
  id: string;
  name: string;
  text: string;
  target: number; // 33, 100, 0 (unlimited)
}

export interface TasbeehState {
  totalCount: number;
  currentCount: number;
  selectedPresetId: string;
  customText: string;
  target: number;
}
