import React, { useState } from 'react';
import { ADHKAR_CATEGORIES } from '../../data/adhkar';
import { DhikrCategory } from '../../types/adhkar';
import { CategoryDetailView } from './CategoryDetailView';
import { ElectronicSebha } from './ElectronicSebha';
import { toArabicDigits } from '../../utils/arabicUtils';
import {
  Sun,
  Moon,
  Sparkles,
  Bed,
  Sunrise,
  Home,
  Landmark,
  Utensils,
  Plane,
  BookMarked,
  Heart,
  CheckCircle2,
  ChevronLeft,
  CircleDot,
} from 'lucide-react';

interface AthkarViewProps {
  getRemaining: (item: any) => number;
  isDhikrCompleted: (id: string) => boolean;
  onTapDhikr: (item: any, items: any[]) => void;
  onResetCategory: (categoryId: string, items: any[]) => void;
  initialCategoryId?: string | null;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Moon,
  Sparkles,
  Bed,
  Sunrise,
  Home,
  Landmark,
  Utensils,
  Plane,
  BookMarked,
  Heart,
};

export const AthkarView: React.FC<AthkarViewProps> = ({
  getRemaining,
  isDhikrCompleted,
  onTapDhikr,
  onResetCategory,
  initialCategoryId,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'sebha'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<DhikrCategory | null>(() => {
    if (initialCategoryId) {
      return ADHKAR_CATEGORIES.find((c) => c.id === initialCategoryId) || null;
    }
    return null;
  });

  // Calculate overall completed dhikrs
  let totalDhikrsCount = 0;
  let totalCompletedCount = 0;
  ADHKAR_CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => {
      totalDhikrsCount++;
      if (isDhikrCompleted(item.id)) {
        totalCompletedCount++;
      }
    });
  });

  const overallPercentage = totalDhikrsCount > 0
    ? Math.round((totalCompletedCount / totalDhikrsCount) * 100)
    : 0;

  if (selectedCategory && activeTab === 'categories') {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-28">
        <CategoryDetailView
          category={selectedCategory}
          onBack={() => setSelectedCategory(null)}
          getRemaining={getRemaining}
          isDhikrCompleted={isDhikrCompleted}
          onTapDhikr={onTapDhikr}
          onResetCategory={onResetCategory}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-28 max-w-2xl mx-auto px-4 pt-2">
      {/* Top Switcher: الأذكار vs السبحة */}
      <div className="flex items-center bg-slate-100 dark:bg-[#121c17] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 shadow-xs'
              : 'hover:text-emerald-700'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>الأذكار والأدعية</span>
        </button>

        <button
          onClick={() => setActiveTab('sebha')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'sebha'
              ? 'bg-white dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 shadow-xs'
              : 'hover:text-emerald-700'
          }`}
        >
          <CircleDot className="w-4 h-4" />
          <span>السبحة الإلكترونية</span>
        </button>
      </div>

      {activeTab === 'sebha' ? (
        <ElectronicSebha />
      ) : (
        <>
          {/* Daily Athkar Overall Progress Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-[#073628] text-white rounded-3xl p-4 sm:p-5 shadow-lg shadow-emerald-950/20 border border-emerald-600/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm font-sans text-amber-300">
                  حصاد الأذكار لليوم
                </h3>
              </div>
              <span className="text-xs font-bold font-sans">
                {toArabicDigits(totalCompletedCount)} من {toArabicDigits(totalDhikrsCount)} ذكراً
              </span>
            </div>

            <div className="w-full h-2 bg-emerald-950/80 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ADHKAR_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.iconName] || BookMarked;
              const catCompleted = cat.items.filter((i) => isDhikrCompleted(i.id)).length;
              const catTotal = cat.items.length;
              const isDone = catCompleted === catTotal;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-between p-4 rounded-3xl text-right transition-all group focus:outline-none border ${
                    isDone
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/50 shadow-xs'
                      : 'bg-white dark:bg-[#121c17] border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 group-hover:bg-emerald-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {cat.name}
                        </h4>
                        {cat.badge && (
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {toArabicDigits(cat.items.length)} أذكار • {cat.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مكتمل</span>
                      </span>
                    ) : catCompleted > 0 ? (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                        {toArabicDigits(catCompleted)}/{toArabicDigits(catTotal)}
                      </span>
                    ) : null}

                    <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
