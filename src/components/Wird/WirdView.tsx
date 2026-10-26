import React, { useState } from 'react';
import { DailyChecklistState, TodayWirdCalculation, WirdPlanConfig, WirdProgressState } from '../../types/wird';
import { WirdPlanSetupModal } from './WirdPlanSetupModal';
import { WirdCalendar } from './WirdCalendar';
import { toArabicDigits } from '../../utils/arabicUtils';
import {
  BookOpen,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Sliders,
  Download,
  Upload,
  Layers,
  AlertTriangle,
  Award,
} from 'lucide-react';

interface WirdViewProps {
  plan: WirdPlanConfig;
  progress: WirdProgressState;
  checklist: DailyChecklistState;
  todayWirdCalc: TodayWirdCalculation;
  onConfigurePlan: (cfg: Partial<WirdPlanConfig>) => void;
  onMarkCompleted: () => void;
  onRedistribute: () => void;
  onStartNewKhatmah: () => void;
  onToggleChecklist: (key: keyof Omit<DailyChecklistState, 'date'>) => void;
  onStartReading: (pageNumber: number) => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const WirdView: React.FC<WirdViewProps> = ({
  plan,
  progress,
  checklist,
  todayWirdCalc,
  onConfigurePlan,
  onMarkCompleted,
  onRedistribute,
  onStartNewKhatmah,
  onToggleChecklist,
  onStartReading,
  onExportBackup,
  onImportBackup,
}) => {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  return (
    <div className="space-y-5 pb-28 max-w-2xl mx-auto px-4 pt-2">
      {/* Top Header Card */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121c17] p-3 sm:p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
              خطة الورد والختمة
            </h2>
            <p className="text-[11px] text-slate-400">
              {plan.isConfigured
                ? `ختمة خلال ${toArabicDigits(plan.targetDays)} يوماً (${toArabicDigits(plan.pagesPerDay)} ص/يوم)`
                : 'اضغط لضبط خطة الختمة اليومية'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>تعديل الخطة</span>
        </button>
      </div>

      {/* Main Today's Wird Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-[#062c21] text-white p-5 sm:p-6 shadow-xl shadow-emerald-950/20 border border-emerald-600/30 overflow-hidden text-center">
        {/* Decorative Background Rings */}
        <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full border border-emerald-500/10 pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full border border-amber-500/10 pointer-events-none" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              اليوم {toArabicDigits(todayWirdCalc.dayNumber)} من {toArabicDigits(plan.targetDays)}
            </span>
          </span>

          <h3 className="text-xl sm:text-2xl font-extrabold font-sans tracking-wide">
            ورد اليوم: من صفحة {toArabicDigits(todayWirdCalc.startPage)} إلى {toArabicDigits(todayWirdCalc.endPage)}
          </h3>

          <p className="text-xs text-emerald-200 font-sans mt-1">
            مقدار الورد: {toArabicDigits(todayWirdCalc.totalPagesToday)} صفحة من كتاب الله
          </p>

          {/* Action Buttons */}
          <div className="mt-5 pt-4 border-t border-emerald-800/80 flex items-center justify-center gap-2.5 flex-wrap">
            <button
              onClick={() => onStartReading(todayWirdCalc.startPage)}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>ابدأ القراءة في المصحف</span>
            </button>

            <button
              onClick={onMarkCompleted}
              disabled={todayWirdCalc.isCompletedToday}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                todayWirdCalc.isCompletedToday
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 cursor-default'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/40 shadow-sm active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{todayWirdCalc.isCompletedToday ? 'أتممت ورد اليوم ✓' : 'تعليم كمكتمل'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delayed pages warning if any */}
      {todayWirdCalc.delayedPages > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold block">
                لديك {toArabicDigits(todayWirdCalc.delayedPages)} صفحة متأخرة عن جدول الختمة
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300">
                يمكنك قراءتها أو إعادة توزيعها بالتساوي على الأيام الباقية
              </span>
            </div>
          </div>

          <button
            onClick={onRedistribute}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors whitespace-nowrap text-[11px]"
          >
            إعادة التوزيع
          </button>
        </div>
      )}

      {/* Khatmah Progress Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Progress */}
        <div className="bg-white dark:bg-[#121c17] p-3.5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-[11px] text-slate-400 block font-sans">إنجاز الختمة</span>
          <span className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 block mt-1">
            {toArabicDigits(todayWirdCalc.progressPercentage)}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">
            {toArabicDigits(progress.completedPagesCount)} / 604 ص
          </span>
        </div>

        {/* Remaining Days */}
        <div className="bg-white dark:bg-[#121c17] p-3.5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-[11px] text-slate-400 block font-sans">الأيام المتبقية</span>
          <span className="text-xl font-extrabold font-mono text-slate-800 dark:text-slate-100 block mt-1">
            {toArabicDigits(todayWirdCalc.daysRemaining)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">
            يوماً لإتمام الختمة
          </span>
        </div>

        {/* Streak */}
        <div className="bg-white dark:bg-[#121c17] p-3.5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-[11px] text-slate-400 block font-sans flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>السلسلة</span>
          </span>
          <span className="text-xl font-extrabold font-mono text-amber-600 block mt-1">
            {toArabicDigits(progress.streak)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">
            أيام متواصلة
          </span>
        </div>

        {/* Completed Khatmahs */}
        <div className="bg-white dark:bg-[#121c17] p-3.5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-[11px] text-slate-400 block font-sans flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>الختمات</span>
          </span>
          <span className="text-xl font-extrabold font-mono text-emerald-800 dark:text-emerald-300 block mt-1">
            {toArabicDigits(progress.completedKhatmahs)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">
            ختمات مكتملة
          </span>
        </div>
      </div>

      {/* Full Khatmah Progress Bar */}
      <div className="bg-white dark:bg-[#121c17] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>تقدم المصحف الشريف بالصفحات:</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-mono">
            {toArabicDigits(progress.completedPagesCount)} من ٦٠٤ صفحة
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 transition-all duration-500 rounded-full"
            style={{ width: `${todayWirdCalc.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Daily Worship Checklist (عبادات اليوم) */}
      <div className="bg-white dark:bg-[#121c17] rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans">
              عبادات اليوم (قائمة المتابعة)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            تتزامن تلقائياً مع إنجازك
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { key: 'quranWird' as const, label: 'ورد القرآن الكريم اليومي' },
            { key: 'morningAthkar' as const, label: 'أذكار الصباح وحصن المسلم' },
            { key: 'eveningAthkar' as const, label: 'أذكار المساء' },
            { key: 'sleepAthkar' as const, label: 'أذكار النوم وسنن الفراش' },
          ].map((item) => {
            const isChecked = checklist[item.key];
            return (
              <button
                key={item.key}
                onClick={() => onToggleChecklist(item.key)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between group ${
                  isChecked
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xs">{item.label}</span>
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-500'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Progress Calendar */}
      <WirdCalendar history={progress.history} />

      {/* Backup & Khatmah Reset Controls */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {/* Export JSON */}
          <button
            onClick={onExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title="تصدير نسخة احتياطية من جميع بياناتك"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>تصدير نسخة (JSON)</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>استيراد نسخة</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {todayWirdCalc.isKhatmahCompleted && (
          <button
            onClick={onStartNewKhatmah}
            className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors"
          >
            بدء ختمة جديدة مباركة
          </button>
        )}
      </div>

      {/* Setup Modal */}
      <WirdPlanSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSavePlan={onConfigurePlan}
        currentPlan={plan}
      />
    </div>
  );
};
