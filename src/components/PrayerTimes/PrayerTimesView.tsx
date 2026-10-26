import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  Bell,
  BellOff,
  Navigation,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { CityOption, LocationState, PrayerItem, CalculationMethod } from '../../types/prayer';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { LocationModal } from './LocationModal';
import { LocationPermissionBanner } from './LocationPermissionBanner';
import { toArabicDigits } from '../../utils/arabicUtils';
import { CALCULATION_METHODS, getNotificationOffsetDescription } from '../../services/prayerApi';

interface PrayerTimesViewProps {
  location: LocationState;
  onSetLocation: (city: CityOption) => void;
  onRequestGeolocation: () => Promise<boolean>;
  isLocating: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  methodId: number;
  school: number;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onOpenSettings: () => void;
  reminderOffsetMinutes?: number;
  onSelectReminderOffset?: (minutes: number) => void;
}

export const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({
  location,
  onSetLocation,
  onRequestGeolocation,
  isLocating,
  permissionStatus,
  methodId,
  school,
  notificationsEnabled,
  onToggleNotifications,
  onOpenSettings,
  reminderOffsetMinutes = 0,
  onSelectReminderOffset,
}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const {
    prayers,
    currentPrayer,
    nextPrayer,
    countdownFormatted,
    nextAlertPrayer,
    nextAlertTime,
    countdownToAlertFormatted,
    hijriDate,
    gregorianDate,
    isLoading,
    error,
    refresh,
  } = usePrayerTimes({
    location,
    methodId,
    school,
    notificationsEnabled,
    reminderOffsetMinutes,
  });

  const activeMethod = CALCULATION_METHODS.find((m) => m.id === methodId) || CALCULATION_METHODS[0];

  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      alert('متصفحك لا يدعم الإشعارات');
      return;
    }
    if (Notification.permission !== 'granted') {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        if (!notificationsEnabled) onToggleNotifications();
      }
    } else {
      onToggleNotifications();
    }
  };

  // Should we show the gentle location banner? (Only if location is still manual default and prompt hasn't been dismissed)
  const showPermissionBanner = location.isManual && permissionStatus === 'prompt' && !isBannerDismissed;

  return (
    <div className="space-y-5 pb-28 max-w-2xl mx-auto px-4 pt-2">
      {/* Top Location & Settings Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121c17] p-3 sm:p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-2.5 text-right group focus:outline-none"
          title="تغيير المدينة أو تحديد الموقع"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {location.cityName}
              </h2>
              {location.countryName && (
                <span className="text-[11px] text-slate-400">({location.countryName})</span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              انقر لتغيير المدينة أو استخدام GPS
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Adhan Notification Toggle */}
          <button
            onClick={handleRequestNotifications}
            className={`p-2.5 rounded-2xl transition-all focus:outline-none ${
              notificationsEnabled
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/40'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={notificationsEnabled ? 'تنبيهات الأذان مفعلة' : 'تفعيل تنبيهات الأذان'}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4 animate-bounce" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Refresh Times */}
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 transition-colors"
            title="تحديث المواقيت"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Gentle in-app location permission banner */}
      {showPermissionBanner && (
        <LocationPermissionBanner
          onAllow={async () => {
            await onRequestGeolocation();
          }}
          onChooseManually={() => setIsLocationModalOpen(true)}
          onDismiss={() => setIsBannerDismissed(true)}
          isLocating={isLocating}
        />
      )}

      {/* Hijri & Gregorian Dates Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-[#073628] text-white rounded-3xl p-4 sm:p-5 shadow-lg shadow-emerald-950/20 border border-emerald-600/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-amber-300 font-sans">
              {hijriDate ? hijriDate.formatted : 'التاريخ الهجري'}
            </h3>
            <p className="text-xs text-emerald-200/90 font-sans mt-0.5">
              {gregorianDate ? gregorianDate.formatted : 'التاريخ الميلادي'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-200 hover:text-white border border-emerald-700/60 text-[11px] font-sans transition-colors"
          title="تغيير طريقة الحساب"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate max-w-[150px]">{activeMethod.name}</span>
        </button>
      </div>

      {/* Hero Next Prayer & Live Countdown Card */}
      {nextPrayer && (
        <div className="relative rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-5 sm:p-6 shadow-xl shadow-amber-950/20 overflow-hidden text-center">
          {/* Subtle Islamic circular background ornaments */}
          <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full border border-white/15 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full border border-white/10 pointer-events-none" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الصلاة القادمة</span>
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold font-sans tracking-wide">
              صلاة {nextPrayer.arabicName}
            </h3>

            {/* Time of next prayer */}
            <p className="text-sm text-amber-100 font-sans mt-1">
              موعد الأذان: {toArabicDigits(nextPrayer.time12)} {nextPrayer.period}
            </p>

            {/* Live Countdown Clock */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <span className="text-[11px] text-amber-100 font-medium block mb-1">
                الوقت المتبقي حتى دخول الوقت:
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-wider drop-shadow-md text-white select-none">
                {countdownFormatted}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Reminder Alert Settings Pill / Banner */}
      <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
        notificationsEnabled
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/50'
          : 'bg-white dark:bg-[#121c17] border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            notificationsEnabled
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
          }`}>
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {notificationsEnabled
                  ? `تنبيه الصلاة: ${getNotificationOffsetDescription(reminderOffsetMinutes)}`
                  : 'تنبيهات الصلاة متوقفة'}
              </span>
              {notificationsEnabled && (
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                  مفعّل
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {notificationsEnabled
                ? nextAlertPrayer && reminderOffsetMinutes !== 0
                  ? `التنبيه القادم: صلاة ${nextAlertPrayer.arabicName} (متبقي ${countdownToAlertFormatted})`
                  : 'سيصلك إشعار فوري وصوت الأذان عند حلول الموعد المحدد'
                : 'اضغط لتفعيل التنبيه وتحديد وقته قبل أو بعد الصلاة'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-200 hover:text-emerald-800 text-xs font-bold transition-all shrink-0"
        >
          {notificationsEnabled ? 'تعديل الوقت' : 'تفعيل'}
        </button>
      </div>

      {/* Error / Offline alert */}
      {error && (
        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => refresh()}
            className="px-3 py-1 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Prayers Grid (6 times: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1 flex items-center justify-between">
          <span>مواقيت اليوم:</span>
          {school === 1 ? (
            <span className="text-[10px] text-slate-400 font-normal">مذهب العصر: حنفي</span>
          ) : (
            <span className="text-[10px] text-slate-400 font-normal">مذهب العصر: شافعي / جمهور</span>
          )}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {prayers.map((p) => {
            const isCurrent = p.isCurrent;
            const isNext = p.isNext;

            return (
              <div
                key={p.id}
                className={`p-3.5 sm:p-4 rounded-3xl transition-all duration-300 flex flex-col justify-between border relative overflow-hidden ${
                  isNext
                    ? 'bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/50 dark:to-[#221c12] border-2 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                    : isCurrent
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-[#0f241a] border-2 border-emerald-600 shadow-md'
                    : 'bg-white dark:bg-[#121c17] border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Badge for Current or Next */}
                {isNext && (
                  <span className="absolute top-2.5 left-2.5 text-[9px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                    القادمة
                  </span>
                )}
                {isCurrent && !isNext && (
                  <span className="absolute top-2.5 left-2.5 text-[9px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                    الحالية
                  </span>
                )}

                <div>
                  <span
                    className={`text-xs font-bold block mb-1 font-sans ${
                      isNext
                        ? 'text-amber-900 dark:text-amber-300'
                        : isCurrent
                        ? 'text-emerald-900 dark:text-emerald-300'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {p.arabicName}
                  </span>

                  <div className="flex items-baseline gap-1 mt-2">
                    <span
                      className={`text-xl sm:text-2xl font-extrabold font-sans tracking-tight ${
                        isNext
                          ? 'text-amber-950 dark:text-amber-100'
                          : isCurrent
                          ? 'text-emerald-950 dark:text-emerald-100'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {toArabicDigits(p.time12)}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isNext
                          ? 'text-amber-700 dark:text-amber-300'
                          : isCurrent
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {p.period}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{p.isPassed ? 'مضت' : 'لم تحن بعد'}</span>
                  {p.isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual City Selection Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectCity={onSetLocation}
        onRequestGeolocation={onRequestGeolocation}
        isLocating={isLocating}
        currentCityName={location.cityName}
      />
    </div>
  );
};
