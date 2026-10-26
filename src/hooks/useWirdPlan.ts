import { useState, useEffect, useCallback, useMemo } from 'react';
import { DailyChecklistState, DayWirdRecord, TodayWirdCalculation, WirdPlanConfig, WirdProgressState } from '../types/wird';

const WIRD_PLAN_KEY = 'nouran_wird_plan_v1';
const WIRD_PROGRESS_KEY = 'nouran_wird_progress_v1';
const CHECKLIST_KEY = 'nouran_daily_checklist_v1';

const TOTAL_QURAN_PAGES = 604;

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_PLAN: WirdPlanConfig = {
  planType: 'days',
  targetDays: 30,
  pagesPerDay: 20, // 604 / 30 ~ 20.1
  startDate: getTodayString(),
  startPage: 1,
  isConfigured: false,
  reminderEnabled: false,
  reminderTime: '07:00',
};

const DEFAULT_PROGRESS: WirdProgressState = {
  completedPagesCount: 0,
  currentPage: 1,
  history: {},
  streak: 0,
  longestStreak: 0,
  completedKhatmahs: 0,
};

export function useWirdPlan(externalAthkarStatus?: { isMorningDone: boolean; isEveningDone: boolean; isSleepDone: boolean }) {
  const todayStr = getTodayString();

  // 1. Plan Config
  const [plan, setPlan] = useState<WirdPlanConfig>(() => {
    try {
      const saved = localStorage.getItem(WIRD_PLAN_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PLAN;
  });

  // 2. Wird Progress
  const [progress, setProgress] = useState<WirdProgressState>(() => {
    try {
      const saved = localStorage.getItem(WIRD_PROGRESS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PROGRESS;
  });

  // 3. Daily Checklist
  const [checklist, setChecklist] = useState<DailyChecklistState>(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_KEY);
      if (saved) {
        const parsed: DailyChecklistState = JSON.parse(saved);
        if (parsed.date === todayStr) return parsed;
      }
    } catch {
      // ignore
    }
    return {
      date: todayStr,
      quranWird: false,
      morningAthkar: false,
      eveningAthkar: false,
      sleepAthkar: false,
    };
  });

  // Save helpers
  const savePlan = (newPlan: WirdPlanConfig) => {
    setPlan(newPlan);
    try {
      localStorage.setItem(WIRD_PLAN_KEY, JSON.stringify(newPlan));
    } catch {
      // ignore
    }
  };

  const saveProgress = (newProg: WirdProgressState) => {
    setProgress(newProg);
    try {
      localStorage.setItem(WIRD_PROGRESS_KEY, JSON.stringify(newProg));
    } catch {
      // ignore
    }
  };

  const saveChecklist = (newCheck: DailyChecklistState) => {
    setChecklist(newCheck);
    try {
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(newCheck));
    } catch {
      // ignore
    }
  };

  // Sync checklist with external athkar status if provided
  useEffect(() => {
    if (!externalAthkarStatus) return;
    setChecklist(prev => {
      let changed = false;
      const updated = { ...prev };
      if (externalAthkarStatus.isMorningDone && !updated.morningAthkar) {
        updated.morningAthkar = true;
        changed = true;
      }
      if (externalAthkarStatus.isEveningDone && !updated.eveningAthkar) {
        updated.eveningAthkar = true;
        changed = true;
      }
      if (externalAthkarStatus.isSleepDone && !updated.sleepAthkar) {
        updated.sleepAthkar = true;
        changed = true;
      }
      if (changed) {
        try {
          localStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
      return prev;
    });
  }, [externalAthkarStatus]);

  // Setup Plan
  const configurePlan = useCallback((config: Partial<WirdPlanConfig>) => {
    let pagesPerDay = config.pagesPerDay || 20;
    let targetDays = config.targetDays || 30;

    if (config.planType === 'days' && config.targetDays) {
      pagesPerDay = Math.ceil(TOTAL_QURAN_PAGES / config.targetDays);
      targetDays = config.targetDays;
    } else if (config.planType === 'pages' && config.pagesPerDay) {
      targetDays = Math.ceil(TOTAL_QURAN_PAGES / config.pagesPerDay);
      pagesPerDay = config.pagesPerDay;
    } else if (config.planType === 'juz') {
      // 1 juz approx 20 pages (30 days), 2 juz = 40 pages (15 days)
      pagesPerDay = 20;
      targetDays = 30;
    }

    const newPlan: WirdPlanConfig = {
      ...plan,
      ...config,
      targetDays,
      pagesPerDay,
      startDate: config.startDate || getTodayString(),
      isConfigured: true,
    };

    savePlan(newPlan);
  }, [plan]);

  // Calculate day number since plan start
  const dayNumber = useMemo(() => {
    if (!plan.isConfigured || !plan.startDate) return 1;
    const start = new Date(plan.startDate).getTime();
    const now = new Date(todayStr).getTime();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  }, [plan, todayStr]);

  // Calculate Today's Wird
  const todayWirdCalc: TodayWirdCalculation = useMemo(() => {
    const isCompletedToday = Boolean(progress.history[todayStr]?.isCompleted);
    const pagesPerDay = Math.max(1, plan.pagesPerDay);

    // Theoretical expected end page for today based on day number
    const expectedEndPage = Math.min(TOTAL_QURAN_PAGES, dayNumber * pagesPerDay);

    // Current start page is last completed page + 1
    const startPage = Math.min(TOTAL_QURAN_PAGES, progress.completedPagesCount + 1);
    const endPage = Math.min(TOTAL_QURAN_PAGES, startPage + pagesPerDay - 1);
    const totalPagesToday = Math.max(0, endPage - startPage + 1);

    // Delayed pages if progress is behind schedule
    const delayedPages = Math.max(0, expectedEndPage - progress.completedPagesCount - (isCompletedToday ? 0 : totalPagesToday));

    const progressPercentage = Math.min(100, Math.round((progress.completedPagesCount / TOTAL_QURAN_PAGES) * 100));
    const isKhatmahCompleted = progress.completedPagesCount >= TOTAL_QURAN_PAGES;

    const remainingPages = TOTAL_QURAN_PAGES - progress.completedPagesCount;
    const daysRemaining = Math.max(0, Math.ceil(remainingPages / pagesPerDay));

    return {
      dayNumber,
      startPage,
      endPage,
      totalPagesToday,
      isCompletedToday,
      delayedPages,
      isKhatmahCompleted,
      progressPercentage,
      daysRemaining,
    };
  }, [plan, progress, dayNumber, todayStr]);

  // Mark today's wird as completed
  const markTodayAsCompleted = useCallback(() => {
    const endPage = todayWirdCalc.endPage;
    const newlyCompletedPages = Math.min(TOTAL_QURAN_PAGES, endPage);

    const isKhatmahNowFinished = newlyCompletedPages >= TOTAL_QURAN_PAGES;

    // Calculate streak
    let newStreak = progress.streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (progress.lastCompletedDate === yStr) {
      newStreak += 1;
    } else if (progress.lastCompletedDate !== todayStr) {
      newStreak = 1;
    }

    const newLongestStreak = Math.max(newStreak, progress.longestStreak);

    const updatedHistory: Record<string, DayWirdRecord> = {
      ...progress.history,
      [todayStr]: {
        date: todayStr,
        dayNumber,
        startPage: todayWirdCalc.startPage,
        endPage: todayWirdCalc.endPage,
        isCompleted: true,
        completedAt: Date.now(),
      },
    };

    saveProgress({
      ...progress,
      completedPagesCount: newlyCompletedPages,
      currentPage: Math.min(TOTAL_QURAN_PAGES, newlyCompletedPages + 1),
      history: updatedHistory,
      streak: newStreak,
      longestStreak: newLongestStreak,
      completedKhatmahs: isKhatmahNowFinished ? progress.completedKhatmahs + 1 : progress.completedKhatmahs,
      lastCompletedDate: todayStr,
    });

    // Update checklist
    saveChecklist({
      ...checklist,
      quranWird: true,
    });
  }, [dayNumber, progress, todayStr, todayWirdCalc, checklist]);

  // Handle page read event in Mushaf to auto-complete wird
  const recordPageRead = useCallback((pageNumber: number) => {
    if (!plan.isConfigured) return;
    if (pageNumber >= todayWirdCalc.endPage && !todayWirdCalc.isCompletedToday) {
      markTodayAsCompleted();
    }
  }, [plan.isConfigured, todayWirdCalc, markTodayAsCompleted]);

  // Redistribute remaining pages across remaining days
  const redistributeRemaining = useCallback(() => {
    const remainingPages = TOTAL_QURAN_PAGES - progress.completedPagesCount;
    if (remainingPages <= 0) return;

    // Remaining days in the planned period
    const remainingDays = Math.max(1, plan.targetDays - dayNumber + 1);
    const newPagesPerDay = Math.ceil(remainingPages / remainingDays);

    configurePlan({
      ...plan,
      pagesPerDay: newPagesPerDay,
    });
  }, [plan, progress.completedPagesCount, dayNumber, configurePlan]);

  // Start new Khatmah
  const startNewKhatmah = useCallback(() => {
    saveProgress({
      ...progress,
      completedPagesCount: 0,
      currentPage: 1,
      lastCompletedDate: undefined,
    });
    configurePlan({
      startDate: getTodayString(),
    });
  }, [progress, configurePlan]);

  // Checklist toggle
  const toggleChecklistItem = useCallback((itemKey: keyof Omit<DailyChecklistState, 'date'>) => {
    const updated = {
      ...checklist,
      [itemKey]: !checklist[itemKey],
    };
    saveChecklist(updated);
  }, [checklist]);

  // Reset Wird and Checklist data
  const resetWirdData = useCallback(() => {
    setPlan(DEFAULT_PLAN);
    setProgress(DEFAULT_PROGRESS);
    setChecklist({
      date: todayStr,
      quranWird: false,
      morningAthkar: false,
      eveningAthkar: false,
      sleepAthkar: false,
    });
    localStorage.removeItem(WIRD_PLAN_KEY);
    localStorage.removeItem(WIRD_PROGRESS_KEY);
    localStorage.removeItem(CHECKLIST_KEY);
  }, [todayStr]);

  return {
    plan,
    progress,
    checklist,
    todayWirdCalc,
    configurePlan,
    markTodayAsCompleted,
    recordPageRead,
    redistributeRemaining,
    startNewKhatmah,
    toggleChecklistItem,
    resetWirdData,
  };
}
