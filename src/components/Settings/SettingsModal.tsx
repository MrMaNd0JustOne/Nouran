import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Type,
  BookOpen,
  Volume2,
  Trash2,
  Info,
  Check,
  ShieldCheck,
  Clock,
  MapPin,
  Bell,
  BellOff,
  Sparkles,
  SlidersHorizontal,
  Calendar,
  Download,
  Upload,
  RotateCcw,
  User,
  Heart,
} from 'lucide-react';
import { AVAILABLE_RECITERS, AVAILABLE_TAFSIRS, clearAppCache } from '../../services/quranApi';
import {
  CALCULATION_METHODS,
  NOTIFICATION_OFFSET_OPTIONS,
  getNotificationOffsetDescription,
  getPrayerAlertContent,
  triggerPrayerNotification,
} from '../../services/prayerApi';
import { toArabicDigits } from '../../utils/arabicUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  onSetTheme?: (mode: 'light' | 'dark') => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  selectedTafsir: string;
  onSelectTafsir: (tafsirId: string) => void;
  selectedReciter: string;
  onSelectReciter: (reciterId: string) => void;
  onClearHistory: () => void;
  onClearBookmarks: () => void;
  // Prayer Times settings
  prayerMethodId: number;
  onSelectPrayerMethod: (methodId: number) => void;
  prayerSchool: number;
  onSelectPrayerSchool: (school: number) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  currentCityName: string;
  onOpenLocationPicker: () => void;
  reminderOffsetMinutes?: number;
  onSelectReminderOffset?: (minutes: number) => void;
  // Wird & Backup settings
  wirdReminderTime?: string;
  onSelectWirdReminderTime?: (time: string) => void;
  wirdReminderEnabled?: boolean;
  onToggleWirdReminder?: () => void;
  onResetAthkar?: () => void;
  onResetWird?: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onToggleTheme,
  onSetTheme,
  fontSize,
  onFontSizeChange,
  selectedTafsir,
  onSelectTafsir,
  selectedReciter,
  onSelectReciter,
  onClearHistory,
  onClearBookmarks,
  prayerMethodId,
  onSelectPrayerMethod,
  prayerSchool,
  onSelectPrayerSchool,
  notificationsEnabled,
  onToggleNotifications,
  currentCityName,
  onOpenLocationPicker,
  reminderOffsetMinutes = 0,
  onSelectReminderOffset,
  wirdReminderTime = '07:00',
  onSelectWirdReminderTime,
  wirdReminderEnabled = false,
  onToggleWirdReminder,
  onResetAthkar,
  onResetWird,
  onExportBackup,
  onImportBackup,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'prayer' | 'wird' | 'about'>('general');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTestNotification = async () => {
    if (!('Notification' in window)) {
      showToast('متصفحك لا يدعم الإشعارات');
      return;
    }
    if (Notification.permission !== 'granted') {
      const res = await Notification.requestPermission();
      if (res !== 'granted') {
        showToast('يرجى منح الإذن للإشعارات في المتصفح');
        return;
      }
    }
    triggerPrayerNotification('الظهر', currentCityName, reminderOffsetMinutes);
    showToast('تم إرسال إشعار تجريبي بصوت الأذان!');
  };

  const handleClearCache = () => {
    clearAppCache();
    showToast('تم مسح ذاكرة التخزين المؤقت بنجاح');
  };

  const handleClearSearchHistory = () => {
    onClearHistory();
    showToast('تم مسح سجل البحث');
  };

  const handleClearBookmarksList = () => {
    onClearBookmarks();
    showToast('تم مسح العلامات المرجعية');
  };

  const handleResetAthkarProgress = () => {
    if (onResetAthkar) {
      onResetAthkar();
      showToast('تم تصفير تقدم الأذكار لليوم');
    }
  };

  const handleResetWirdData = () => {
    if (window.confirm('هل تريد تصفير خطة الورد وجميع سجلات القراءة؟')) {
      if (onResetWird) {
        onResetWird();
        showToast('تم تصفير خطة الورد والختمة');
      }
    }
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
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 font-sans">
              إعدادات تطبيق نوران
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 flex gap-2 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2 px-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'general'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            الإعدادات العامة
          </button>

          <button
            onClick={() => setActiveTab('prayer')}
            className={`pb-2 px-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'prayer'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            مواقيت الصلاة
          </button>

          <button
            onClick={() => setActiveTab('wird')}
            className={`pb-2 px-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'wird'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            الورد والتذكير
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2 px-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'about'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            عن التطبيق والتحقق
          </button>
        </div>

        {/* Toast notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-bold animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === 'general' && (
            <>
              {/* Appearance Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>المظهر (الوضع الفاتح والداكن)</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSetTheme) {
                        onSetTheme('light');
                      } else if (darkMode) {
                        onToggleTheme();
                      }
                      showToast('تم تفعيل الوضع الفاتح');
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      !darkMode
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>الوضع الفاتح</span>
                    </span>
                    {!darkMode && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSetTheme) {
                        onSetTheme('dark');
                      } else if (!darkMode) {
                        onToggleTheme();
                      }
                      showToast('تم تفعيل الوضع الداكن');
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      darkMode
                        ? 'bg-emerald-950 text-emerald-100 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-amber-300" />
                      <span>الوضع الداكن</span>
                    </span>
                    {darkMode && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Font Size with live preview */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-emerald-600" />
                    <span>حجم خط المصحف الشريف</span>
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-sans">
                    {toArabicDigits(fontSize)} نقطة
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">صغير</span>
                  <input
                    type="range"
                    min="18"
                    max="38"
                    step="1"
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">كبير</span>
                </div>

                {/* Font Live Preview */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                  <p
                    className="font-quran leading-loose text-emerald-950 dark:text-emerald-100"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              </div>

              {/* Default Tafsir */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>التفسير الافتراضي</span>
                </label>
                <div className="space-y-1.5">
                  {AVAILABLE_TAFSIRS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onSelectTafsir(t.id)}
                      className={`w-full p-2.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                        selectedTafsir === t.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs">{t.name}</div>
                        <div className="text-[10px] text-slate-400">{t.author}</div>
                      </div>
                      {selectedTafsir === t.id && (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Reciter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>القارئ المفضل للتلاوة</span>
                </label>
                <div className="space-y-1.5">
                  {AVAILABLE_RECITERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onSelectReciter(r.id)}
                      className={`w-full p-2.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                        selectedReciter === r.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs">{r.name}</div>
                        <div className="text-[10px] text-slate-400">{r.subtext}</div>
                      </div>
                      {selectedReciter === r.id && (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Data Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  إدارة البيانات والذاكرة
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleClearSearchHistory}
                    className="p-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <span>مسح سجل البحث (آخر 10 عمليات)</span>
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleClearBookmarksList}
                    className="p-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <span>مسح كل العلامات المرجعية</span>
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleClearCache}
                    className="p-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <span>تفريغ ذاكرة التخزين المؤقت</span>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'prayer' && (
            <div className="space-y-5">
              {/* Current City and Location Switcher */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300 block">
                      المدينة الحالية
                    </span>
                    <strong className="text-xs text-emerald-950 dark:text-emerald-100">
                      {currentCityName}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenLocationPicker();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  تغيير المدينة
                </button>
              </div>

              {/* Adhan Notification Toggle */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${notificationsEnabled ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      تنبيه الأذان والصلوات
                    </span>
                    <span className="text-[10px] text-slate-400">
                      إشعار وتنبيه صوتي بأوقات الصلاة عبر المتصفح
                    </span>
                  </div>
                </div>

                <button
                  onClick={onToggleNotifications}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    notificationsEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                  }`}
                  aria-label="تفعيل أو تعطيل تنبيهات الصلاة"
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Prayer Reminder Offset Setting */}
              <div className={`p-4 rounded-3xl border transition-all space-y-3.5 ${
                notificationsEnabled
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-60'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        وقت التنبيه قبل أو بعد الصلاة
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        اختر موعد إرسال التنبيه بالنسبة للأذان (مثلاً: قبل الأذان بـ 15 دقيقة)
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700/60 shrink-0">
                    {getNotificationOffsetDescription(reminderOffsetMinutes)}
                  </span>
                </div>

                {/* Preset Options Grid */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    خيارات شائعة وسريعة:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {NOTIFICATION_OFFSET_OPTIONS.map((opt) => {
                      const isSelected = reminderOffsetMinutes === opt.minutes;
                      return (
                        <button
                          key={opt.minutes}
                          disabled={!notificationsEnabled}
                          onClick={() => onSelectReminderOffset && onSelectReminderOffset(opt.minutes)}
                          className={`p-2 rounded-xl text-right text-[11px] transition-all border flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 mr-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Slider / Stepper */}
                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      تحديد مخصص بالدقائق:
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {reminderOffsetMinutes === 0
                        ? 'في موعد الأذان تماماً (0 دقيقة)'
                        : reminderOffsetMinutes < 0
                        ? `قبل الأذان بـ ${toArabicDigits(Math.abs(reminderOffsetMinutes))} دقيقة`
                        : `بعد الأذان بـ ${toArabicDigits(reminderOffsetMinutes)} دقيقة`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">قبل ساعة</span>
                    <input
                      type="range"
                      min="-60"
                      max="30"
                      step="5"
                      disabled={!notificationsEnabled}
                      value={reminderOffsetMinutes}
                      onChange={(e) => onSelectReminderOffset && onSelectReminderOffset(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">بعد ٣٠ د</span>
                  </div>

                  {/* Quick Fine-tuning Steppers */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={!notificationsEnabled}
                      onClick={() => onSelectReminderOffset && onSelectReminderOffset(Math.max(-60, reminderOffsetMinutes - 5))}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                    >
                      - ٥ دقائق قبل
                    </button>
                    <button
                      type="button"
                      disabled={!notificationsEnabled}
                      onClick={() => onSelectReminderOffset && onSelectReminderOffset(0)}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold"
                    >
                      ضبط عند الأذان (٠)
                    </button>
                    <button
                      type="button"
                      disabled={!notificationsEnabled}
                      onClick={() => onSelectReminderOffset && onSelectReminderOffset(Math.min(30, reminderOffsetMinutes + 5))}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                    >
                      + ٥ دقائق بعد
                    </button>
                  </div>
                </div>

                {/* Live Preview of Notification Message */}
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900 dark:text-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>معاينة نص الإشعار التلقائي:</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
                    {getPrayerAlertContent('الظهر', currentCityName, reminderOffsetMinutes).title}
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {getPrayerAlertContent('الظهر', currentCityName, reminderOffsetMinutes).body}
                  </p>
                </div>

                {/* Test Notification Button */}
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="w-full py-2.5 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>تجربة إشعار التنبيه والصوت الآن</span>
                </button>
              </div>

              {/* Juristic School for Asr */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>مذهب حساب صلاة العصر</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectPrayerSchool(0)}
                    className={`p-3 rounded-2xl border text-right transition-all ${
                      prayerSchool === 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">جمهور الفقهاء (الشافعي)</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      ظل الشيء مثله (المعتمد بمعظم الدول)
                    </span>
                  </button>

                  <button
                    onClick={() => onSelectPrayerSchool(1)}
                    className={`p-3 rounded-2xl border text-right transition-all ${
                      prayerSchool === 1
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">المذهب الحنفي</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      ظل الشيء مثليه (شبه القارة الهندية)
                    </span>
                  </button>
                </div>
              </div>

              {/* Calculation Method Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span>طريقة حساب مواقيت الصلاة (Method)</span>
                </label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {CALCULATION_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onSelectPrayerMethod(m.id)}
                      className={`w-full p-2.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                        prayerMethodId === m.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.description}</div>
                      </div>
                      {prayerMethodId === m.id && (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wird' && (
            <div className="space-y-5">
              {/* Reminder Settings */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${wirdReminderEnabled ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                      {wirdReminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                        تذكير الورد القرآني اليومي
                      </span>
                      <span className="text-[10px] text-slate-400">
                        تنبيه في وقت محدد للقراءة
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onToggleWirdReminder}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      wirdReminderEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {wirdReminderEnabled && onSelectWirdReminderTime && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">وقت التذكير:</span>
                    <input
                      type="time"
                      value={wirdReminderTime}
                      onChange={(e) => onSelectWirdReminderTime(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-2 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Backup & Restore Data */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                  النسخ الاحتياطي واستعادة البيانات
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  احفظ نسخة من تقدمك في الختمة والعلامات المرجعية وسجل البحث والسبحة لاسترجاعها في أي وقت أو نقلها لجهاز آخر.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {onExportBackup && (
                    <button
                      onClick={onExportBackup}
                      className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تصدير نسخة (JSON)</span>
                    </button>
                  )}

                  {onImportBackup && (
                    <label className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-600 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>استيراد نسخة</span>
                      <input type="file" accept=".json" onChange={onImportBackup} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Reset Athkar and Wird Progress */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  تصفير وإعادة تعيين
                </span>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleResetAthkarProgress}
                    className="p-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <span>تصفير تقدم الأذكار لليوم</span>
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleResetWirdData}
                    className="p-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <span>تصفير خطة الورد وسجل الختمات</span>
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center mx-auto shadow-md mb-2">
                  <span className="font-quran text-2xl font-bold">ن</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                  تطبيق نُوران (Nouran)
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-sans mt-0.5">
                  الإصدار 3.0.0 (التطبيق مكتمل بجميع أقسامه الخمسة)
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>فكرة التطبيق (باحث آيات القرآن الكريم):</span>
                </h5>
                <p className="text-justify text-slate-600 dark:text-slate-300">
                  صُمم تطبيق "نوران" ليكون رفيقك القرآني والإسلامي الأذكى؛ حيث يتيح لك البحث عن أي آية بمجرد تذكر بضع كلمات منها، وتحديد موقعها في المصحف فوراً مع إمكانية قراءة تفسيرها الميسر والاستماع لتلاوتها بصوت كبار القراء، إلى جانب مواقيت الصلاة الدقيقة والتقويم الهجري.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <h5 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>معايير الدقة والأمانة الشرعية:</span>
                </h5>
                <p className="text-emerald-800/90 dark:text-emerald-300/90 text-justify">
                  يحرص تطبيق نوران حرصاً تاماً على عدم التعديل على النص القرآني الشريف أو اختصاره، مع الاعتماد على واجهة AlQuran Cloud البرمجية الموثوقة للمصحف، وواجهة AlAdhan لحساب مواقيت الصلوات الخمس وفقاً لأدق الهيئات الفلكية الإسلامية المعتمدة عالمياً.
                </p>
              </div>

              {/* About App Owner */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50/40 dark:from-emerald-950/40 dark:via-slate-800/60 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                    عن مالك التطبيق :
                  </h5>
                </div>

                <div className="text-slate-700 dark:text-slate-200 text-xs space-y-3 leading-relaxed">
                  <p className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                    تم تصميم هذا التطبيق بواسطة أ. محمد عبد العظيم
                  </p>

                  <p className="text-slate-600 dark:text-slate-300">
                    وهو مصمم تطبيقات معروف و صاحب مشروع 4TeKKa Social ، وهو مطور مواقع إلكترونية سابقة ولديه اكثر من مشروع غير هادف للربح
                  </p>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-medium">
                      نتمنى ان يكون هذا التطبيق حصن لكل مسلم و ان يكتب لنا الله الاجر والثواب و ان يظل هذا التطبيق عملاً صالحاً يرضي الله ورسوله و ان يصبح في ميزان حسناتنا.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
