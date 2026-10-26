export type WirdPlanType = 'days' | 'pages' | 'juz';

export interface WirdPlanConfig {
  planType: WirdPlanType;
  targetDays: number; // e.g. 30, 60, 90
  pagesPerDay: number; // e.g. 20 (approx 1 juz per day for 30 days)
  startDate: string; // YYYY-MM-DD
  startPage: number; // typically 1
  isConfigured: boolean;
  reminderEnabled: boolean;
  reminderTime: string; // 'HH:MM' (24-hour)
}

export interface DayWirdRecord {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1, 2, 3...
  startPage: number;
  endPage: number;
  isCompleted: boolean;
  completedAt?: number;
}

export interface DailyChecklistState {
  date: string;
  quranWird: boolean;
  morningAthkar: boolean;
  eveningAthkar: boolean;
  sleepAthkar: boolean;
}

export interface WirdProgressState {
  completedPagesCount: number;
  currentPage: number;
  history: Record<string, DayWirdRecord>; // date -> record
  streak: number;
  longestStreak: number;
  completedKhatmahs: number;
  lastCompletedDate?: string;
}

export interface TodayWirdCalculation {
  dayNumber: number;
  startPage: number;
  endPage: number;
  totalPagesToday: number;
  isCompletedToday: boolean;
  delayedPages: number; // overdue pages from missed days
  isKhatmahCompleted: boolean;
  progressPercentage: number;
  daysRemaining: number;
}
