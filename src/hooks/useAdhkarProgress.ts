import { useState, useEffect, useCallback } from 'react';
import { DhikrItem } from '../types/adhkar';

const ADHKAR_STORAGE_KEY = 'nouran_adhkar_progress_v1';

function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface StoredProgress {
  date: string;
  itemRemaining: Record<string, number>; // dhikrId -> remaining count
  completedDhikrs: Record<string, boolean>; // dhikrId -> is completed
  completedCategories: Record<string, boolean>;
}

export function useAdhkarProgress() {
  const todayStr = getTodayDateString();

  const [progress, setProgress] = useState<StoredProgress>(() => {
    try {
      const stored = localStorage.getItem(ADHKAR_STORAGE_KEY);
      if (stored) {
        const parsed: StoredProgress = JSON.parse(stored);
        // Automatic midnight reset if saved date is not today
        if (parsed.date === todayStr) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      date: todayStr,
      itemRemaining: {},
      completedDhikrs: {},
      completedCategories: {},
    };
  });

  // Check midnight reset periodically (e.g. every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToday = getTodayDateString();
      if (progress.date !== currentToday) {
        const fresh: StoredProgress = {
          date: currentToday,
          itemRemaining: {},
          completedDhikrs: {},
          completedCategories: {},
        };
        setProgress(fresh);
        try {
          localStorage.setItem(ADHKAR_STORAGE_KEY, JSON.stringify(fresh));
        } catch {
          // ignore
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [progress.date]);

  // Persist helper
  const saveProgress = (newProg: StoredProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(ADHKAR_STORAGE_KEY, JSON.stringify(newProg));
    } catch {
      // ignore
    }
  };

  // Get remaining count for a specific dhikr
  const getRemaining = useCallback((dhikr: DhikrItem): number => {
    if (progress.itemRemaining[dhikr.id] !== undefined) {
      return progress.itemRemaining[dhikr.id];
    }
    return dhikr.repeatCount;
  }, [progress.itemRemaining]);

  const isDhikrCompleted = useCallback((dhikrId: string): boolean => {
    return Boolean(progress.completedDhikrs[dhikrId]);
  }, [progress.completedDhikrs]);

  // Decrement counter on tap
  const decrementCount = useCallback((dhikr: DhikrItem, categoryItems?: DhikrItem[]) => {
    const current = getRemaining(dhikr);
    if (current <= 0) return;

    // Gentle haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch {
        // ignore
      }
    }

    const nextCount = current - 1;
    const isNowDone = nextCount === 0;

    const newItemRemaining = { ...progress.itemRemaining, [dhikr.id]: nextCount };
    const newCompletedDhikrs = {
      ...progress.completedDhikrs,
      [dhikr.id]: isNowDone,
    };

    // Check if whole category completed
    const newCompletedCategories = { ...progress.completedCategories };
    if (categoryItems && isNowDone) {
      const allDone = categoryItems.every(item =>
        item.id === dhikr.id ? true : Boolean(newCompletedDhikrs[item.id])
      );
      if (allDone) {
        newCompletedCategories[dhikr.category] = true;
        // Stronger vibration on category finish
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([60, 50, 100]);
          } catch {
            // ignore
          }
        }
      }
    }

    saveProgress({
      ...progress,
      itemRemaining: newItemRemaining,
      completedDhikrs: newCompletedDhikrs,
      completedCategories: newCompletedCategories,
    });
  }, [getRemaining, progress]);

  // Reset a category
  const resetCategory = useCallback((categoryId: string, items: DhikrItem[]) => {
    const newItemRemaining = { ...progress.itemRemaining };
    const newCompletedDhikrs = { ...progress.completedDhikrs };
    items.forEach(item => {
      delete newItemRemaining[item.id];
      delete newCompletedDhikrs[item.id];
    });

    const newCompletedCategories = { ...progress.completedCategories };
    delete newCompletedCategories[categoryId];

    saveProgress({
      ...progress,
      itemRemaining: newItemRemaining,
      completedDhikrs: newCompletedDhikrs,
      completedCategories: newCompletedCategories,
    });
  }, [progress]);

  // Reset all
  const resetAll = useCallback(() => {
    const fresh: StoredProgress = {
      date: getTodayDateString(),
      itemRemaining: {},
      completedDhikrs: {},
      completedCategories: {},
    };
    saveProgress(fresh);
  }, []);

  // Category stats calculation
  const getCategoryStats = useCallback((categoryId: string, items: DhikrItem[]) => {
    if (!items || items.length === 0) return { completed: 0, total: 0, percentage: 0, isDone: false };
    const completed = items.filter(i => progress.completedDhikrs[i.id]).length;
    const total = items.length;
    const percentage = Math.round((completed / total) * 100);
    const isDone = completed === total;
    return { completed, total, percentage, isDone };
  }, [progress.completedDhikrs]);

  return {
    progress,
    getRemaining,
    isDhikrCompleted,
    decrementCount,
    resetCategory,
    resetAll,
    getCategoryStats,
    isMorningDone: Boolean(progress.completedCategories['morning']),
    isEveningDone: Boolean(progress.completedCategories['evening']),
    isSleepDone: Boolean(progress.completedCategories['sleep']),
  };
}
