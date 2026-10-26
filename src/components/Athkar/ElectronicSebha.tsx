import React, { useState, useEffect } from 'react';
import { TASBEEH_PRESETS } from '../../data/adhkar';
import { TasbeehPreset } from '../../types/adhkar';
import { toArabicDigits } from '../../utils/arabicUtils';
import { RotateCcw, Sparkles, Volume2, CheckCircle2, Sliders } from 'lucide-react';

const SEBHA_STORAGE_KEY = 'nouran_electronic_sebha_v1';

export const ElectronicSebha: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<TasbeehPreset>(TASBEEH_PRESETS[0]);
  const [customText, setCustomText] = useState('');
  const [target, setTarget] = useState<number>(33);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SEBHA_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [isCompletedRound, setIsCompletedRound] = useState(false);

  // Save total count to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SEBHA_STORAGE_KEY, totalCount.toString());
    } catch {
      // ignore
    }
  }, [totalCount]);

  const handleSelectPreset = (preset: TasbeehPreset) => {
    setSelectedPreset(preset);
    setTarget(preset.target);
    setCurrentCount(0);
    setIsCompletedRound(false);
  };

  const handleCount = () => {
    // Gentle vibration on tap
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        // ignore
      }
    }

    const nextCount = currentCount + 1;
    setCurrentCount(nextCount);
    setTotalCount(prev => prev + 1);

    // If reached target
    if (target > 0 && nextCount === target) {
      setIsCompletedRound(true);
      // Double vibration celebration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([80, 60, 120]);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleResetCurrent = () => {
    setCurrentCount(0);
    setIsCompletedRound(false);
  };

  const handleResetTotal = () => {
    if (window.confirm('هل تريد تصفير إجمالي التسبيحات المحفوظة؟')) {
      setTotalCount(0);
      setCurrentCount(0);
      setIsCompletedRound(false);
    }
  };

  const displayText = selectedPreset.id === 'custom' && customText.trim()
    ? customText
    : selectedPreset.text;

  const percentage = target > 0 ? Math.min(100, Math.round((currentCount / target) * 100)) : 100;

  return (
    <div className="space-y-6 max-w-lg mx-auto text-center pb-6">
      {/* Preset Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block text-right">
          اختر صيغة الذكر:
        </label>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {TASBEEH_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPreset.id === preset.id
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                  : 'bg-white dark:bg-[#121c17] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Target Selector */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121c17] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs text-xs font-medium">
        <span className="text-slate-600 dark:text-slate-400 font-bold">الهدف:</span>
        <div className="flex gap-1.5">
          {[33, 100, 0].map((tVal) => (
            <button
              key={tVal}
              onClick={() => {
                setTarget(tVal);
                setCurrentCount(0);
                setIsCompletedRound(false);
              }}
              className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                target === tVal
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tVal === 0 ? 'مفتوح' : toArabicDigits(tVal)}
            </button>
          ))}
        </div>
      </div>

      {/* Dhikr Phrase Display Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 via-amber-50/50 to-emerald-50 dark:from-emerald-950/40 dark:via-[#162019] dark:to-emerald-950/40 border border-emerald-600/20 text-center shadow-xs">
        <p className="font-quran text-2xl sm:text-3xl text-emerald-950 dark:text-emerald-100 leading-relaxed">
          {displayText}
        </p>
      </div>

      {/* Main Giant Circular Click Counter Button */}
      <div className="py-2 flex flex-col items-center justify-center">
        <div className="relative">
          {/* Subtle outer pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 animate-ping pointer-events-none" />

          {/* Progress stroke ring around the button */}
          <svg className="w-64 h-64 -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
            />
            {target > 0 && (
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-emerald-600 transition-all duration-300"
                strokeWidth="5"
                strokeDasharray={283}
                strokeDashoffset={283 - (283 * percentage) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            )}
          </svg>

          {/* Interactive Button */}
          <button
            onClick={handleCount}
            className="absolute inset-4 rounded-full bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 text-white flex flex-col items-center justify-center shadow-2xl shadow-emerald-950/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 ring-4 ring-emerald-500/30 group focus:outline-none cursor-pointer"
          >
            <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight drop-shadow-md">
              {toArabicDigits(currentCount)}
            </span>
            {target > 0 && (
              <span className="text-xs text-emerald-200/90 font-sans mt-1">
                من أصل {toArabicDigits(target)}
              </span>
            )}
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-2 group-hover:scale-110 transition-transform">
              اضغط للتسبيح
            </span>
          </button>
        </div>

        {isCompletedRound && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-fade-in border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم إكمال الدورة بحمد الله!</span>
          </div>
        )}
      </div>

      {/* Controls & Total Count Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121c17] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-sans">
            إجمالي التسبيحات المحفوظة:
          </span>
          <span className="text-lg font-extrabold font-mono text-emerald-800 dark:text-emerald-300">
            {toArabicDigits(totalCount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCurrent}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
            title="تصفير الدورة الحالية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير الدورة</span>
          </button>

          <button
            onClick={handleResetTotal}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="تصفير الإجمالي"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
