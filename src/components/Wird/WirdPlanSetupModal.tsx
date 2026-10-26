import React, { useState } from 'react';
import { WirdPlanConfig, WirdPlanType } from '../../types/wird';
import { Calendar, BookOpen, Clock, Sparkles, X, Check } from 'lucide-react';
import { toArabicDigits } from '../../utils/arabicUtils';

interface WirdPlanSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlan: (config: Partial<WirdPlanConfig>) => void;
  currentPlan: WirdPlanConfig;
}

export const WirdPlanSetupModal: React.FC<WirdPlanSetupModalProps> = ({
  isOpen,
  onClose,
  onSavePlan,
  currentPlan,
}) => {
  const [planType, setPlanType] = useState<WirdPlanType>(currentPlan.planType || 'days');
  const [targetDays, setTargetDays] = useState<number>(currentPlan.targetDays || 30);
  const [pagesPerDay, setPagesPerDay] = useState<number>(currentPlan.pagesPerDay || 20);
  const [startDate, setStartDate] = useState<string>(currentPlan.startDate || new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleDaysPreset = (days: number) => {
    setPlanType('days');
    setTargetDays(days);
    setPagesPerDay(Math.ceil(604 / days));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePlan({
      planType,
      targetDays,
      pagesPerDay,
      startDate,
      isConfigured: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className="w-full max-w-lg bg-white dark:bg-[#101b16] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-emerald-900/10 dark:border-emerald-500/20 max-h-[90vh] flex flex-col overflow-hidden animate-slide-up"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans">
                إعداد خطة الورد والختمة
              </h3>
              <p className="text-[11px] text-slate-400">
                حدد هدفك لختم القرآن الكريم بسهولة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Preset Khatmah Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>خيارات الختمة الشائعة:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { days: 30, label: 'ختمة في شهر', sub: '~٢٠ صفحة / يوم' },
                { days: 60, label: 'ختمة في شهرين', sub: '~١٠ صفحات / يوم' },
                { days: 90, label: 'ختمة في ٣ أشهر', sub: '~٧ صفحات / يوم' },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => handleDaysPreset(opt.days)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    targetDays === opt.days && planType === 'days'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days Input */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              أو حدد عدد الأيام المخصص للختمة:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={365}
                value={targetDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 30;
                  setTargetDays(val);
                  setPagesPerDay(Math.ceil(604 / val));
                }}
                className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl py-2 px-3 text-center text-sm font-bold font-sans"
              />
              <span className="text-xs text-slate-500 font-sans">
                يوماً (يعادل تقريباً {toArabicDigits(Math.ceil(604 / targetDays))} صفحة يومياً)
              </span>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>تاريخ بدء الختمة:</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Action Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتفعيل خطة الورد</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
