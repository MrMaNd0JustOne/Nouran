import React from 'react';
import { DhikrCategory } from '../../types/adhkar';
import { DhikrCard } from './DhikrCard';
import { ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { toArabicDigits } from '../../utils/arabicUtils';

interface CategoryDetailViewProps {
  category: DhikrCategory;
  onBack: () => void;
  getRemaining: (item: any) => number;
  isDhikrCompleted: (id: string) => boolean;
  onTapDhikr: (item: any, items: any[]) => void;
  onResetCategory: (categoryId: string, items: any[]) => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  onBack,
  getRemaining,
  isDhikrCompleted,
  onTapDhikr,
  onResetCategory,
}) => {
  const completedCount = category.items.filter((i) => isDhikrCompleted(i.id)).length;
  const totalCount = category.items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const isAllDone = completedCount === totalCount;

  return (
    <div className="space-y-4">
      {/* Top Header & Progress */}
      <div className="bg-white dark:bg-[#121c17] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>كافة الأذكار</span>
          </button>

          <button
            onClick={() => onResetCategory(category.id, category.items)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="إعادة تعيين عدادات هذا القسم"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
              {category.name}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{category.description}</p>
          </div>

          <div className="text-left font-sans">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {toArabicDigits(completedCount)} / {toArabicDigits(totalCount)}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              ({toArabicDigits(percentage)}%)
            </span>
          </div>
        </div>

        {/* Category Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {isAllDone && (
          <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 animate-fade-in border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>أحسنت! أتممت جميع أذكار هذا القسم لليوم</span>
          </div>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-3.5">
        {category.items.map((item) => {
          const remaining = getRemaining(item);
          const isDone = isDhikrCompleted(item.id);

          return (
            <DhikrCard
              key={item.id}
              item={item}
              remainingCount={remaining}
              isCompleted={isDone}
              onTap={() => onTapDhikr(item, category.items)}
            />
          );
        })}
      </div>
    </div>
  );
};
