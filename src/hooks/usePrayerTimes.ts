import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlAdhanResponse, CalculationMethod, LocationState, PrayerItem, PrayerName } from '../types/prayer';
import {
  fetchPrayerTimings,
  formatCountdown,
  formatTo12HourArabic,
  getPrayerDateTime,
  triggerPrayerNotification,
} from '../services/prayerApi';
import { toArabicDigits } from '../utils/arabicUtils';

interface UsePrayerTimesOptions {
  location: LocationState;
  methodId?: number;
  school?: number; // 0 = Standard (Shafi'i/Hanbali/Maliki), 1 = Hanafi
  notificationsEnabled?: boolean;
  reminderOffsetMinutes?: number;
}

export function usePrayerTimes({
  location,
  methodId = 5,
  school = 0,
  notificationsEnabled = false,
  reminderOffsetMinutes = 0,
}: UsePrayerTimesOptions) {
  const [data, setData] = useState<AlAdhanResponse['data'] | null>(() => {
    try {
      const saved = localStorage.getItem('nouran_latest_prayer_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [lastNotifiedKey, setLastNotifiedKey] = useState<string | null>(null);

  // Update clock every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch prayer timings whenever location, method, or school changes
  const loadTimings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const timingsData = await fetchPrayerTimings(
        location.latitude,
        location.longitude,
        methodId,
        school,
        new Date()
      );
      setData(timingsData);
    } catch (err: any) {
      console.warn('Failed to load prayer timings:', err);
      // If we already have cached data in state, keep showing it with an offline note
      if (!data) {
        setError('تعذر تحميل مواقيت الصلاة، يرجى التحقق من اتصال الإنترنت.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [location.latitude, location.longitude, methodId, school]);

  useEffect(() => {
    loadTimings();
  }, [loadTimings]);

  // Build prayers array with status and timings
  const { prayers, currentPrayer, nextPrayer, nextPrayerTimeObj } = useMemo(() => {
    if (!data?.timings) {
      return {
        prayers: [] as PrayerItem[],
        currentPrayer: null as PrayerItem | null,
        nextPrayer: null as PrayerItem | null,
        nextPrayerTimeObj: null as Date | null,
      };
    }

    const t = data.timings;
    const baseNames: Array<{ id: PrayerName; arabicName: string; time24: string }> = [
      { id: 'Fajr', arabicName: 'الفجر', time24: t.Fajr },
      { id: 'Sunrise', arabicName: 'الشروق', time24: t.Sunrise },
      { id: 'Dhuhr', arabicName: 'الظهر', time24: t.Dhuhr },
      { id: 'Asr', arabicName: 'العصر', time24: t.Asr },
      { id: 'Maghrib', arabicName: 'المغرب', time24: t.Maghrib },
      { id: 'Isha', arabicName: 'العشاء', time24: t.Isha },
    ];

    const prayerObjs = baseNames.map((p) => {
      const { time12, period, formatted } = formatTo12HourArabic(p.time24);
      const timeDate = getPrayerDateTime(p.time24, now);
      return {
        id: p.id,
        arabicName: p.arabicName,
        time24: p.time24,
        time12,
        period,
        formattedTime: formatted,
        timeDate,
        isPassed: now >= timeDate,
        isCurrent: false,
        isNext: false,
      };
    });

    let current: PrayerItem | null = null;
    let next: PrayerItem | null = null;
    let nextDate: Date | null = null;

    if (now < prayerObjs[0].timeDate) {
      // Before Fajr today: Current is Isha (yesterday), Next is Fajr
      current = prayerObjs[5]; // Isha
      next = prayerObjs[0]; // Fajr
      nextDate = prayerObjs[0].timeDate;
    } else if (now >= prayerObjs[5].timeDate) {
      // After Isha today: Current is Isha, Next is Fajr tomorrow
      current = prayerObjs[5];
      next = prayerObjs[0];
      const tomorrowFajr = new Date(prayerObjs[0].timeDate);
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
      nextDate = tomorrowFajr;
    } else {
      for (let i = 0; i < prayerObjs.length - 1; i++) {
        if (now >= prayerObjs[i].timeDate && now < prayerObjs[i + 1].timeDate) {
          current = prayerObjs[i];
          next = prayerObjs[i + 1];
          nextDate = prayerObjs[i + 1].timeDate;
          break;
        }
      }
    }

    const finalPrayers: PrayerItem[] = prayerObjs.map((p) => ({
      ...p,
      isCurrent: current?.id === p.id,
      isNext: next?.id === p.id,
    }));

    return {
      prayers: finalPrayers,
      currentPrayer: current,
      nextPrayer: next,
      nextPrayerTimeObj: nextDate,
    };
  }, [data, now]);

  // Real-time Countdown calculation for the next prayer Adhan
  const countdownSeconds = useMemo(() => {
    if (!nextPrayerTimeObj) return 0;
    const diff = Math.floor((nextPrayerTimeObj.getTime() - now.getTime()) / 1000);
    return Math.max(0, diff);
  }, [nextPrayerTimeObj, now]);

  const countdownFormatted = useMemo(() => {
    return formatCountdown(countdownSeconds);
  }, [countdownSeconds]);

  // Calculate next reminder alert target based on reminderOffsetMinutes
  const { nextAlertPrayer, nextAlertTime, countdownToAlertSeconds, countdownToAlertFormatted } = useMemo(() => {
    if (!prayers || prayers.length === 0) {
      return {
        nextAlertPrayer: null,
        nextAlertTime: null,
        countdownToAlertSeconds: 0,
        countdownToAlertFormatted: '00:00:00',
      };
    }

    const offsetMs = reminderOffsetMinutes * 60 * 1000;

    let candidatePrayer: PrayerItem | null = null;
    let candidateAlertTime: Date | null = null;

    // Check all prayer alerts today (excluding Sunrise since it has no prayer Adhan)
    const alertEligible = prayers.filter((p) => p.id !== 'Sunrise');

    for (const p of alertEligible) {
      const alertTime = new Date(p.timeDate.getTime() + offsetMs);
      if (alertTime > now) {
        candidatePrayer = p;
        candidateAlertTime = alertTime;
        break;
      }
    }

    // If all today's alerts have passed, alert for tomorrow's Fajr
    if (!candidatePrayer && alertEligible[0]) {
      candidatePrayer = alertEligible[0];
      const tomorrowFajr = new Date(alertEligible[0].timeDate);
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
      candidateAlertTime = new Date(tomorrowFajr.getTime() + offsetMs);
    }

    const diffSec = candidateAlertTime
      ? Math.max(0, Math.floor((candidateAlertTime.getTime() - now.getTime()) / 1000))
      : 0;

    return {
      nextAlertPrayer: candidatePrayer,
      nextAlertTime: candidateAlertTime,
      countdownToAlertSeconds: diffSec,
      countdownToAlertFormatted: formatCountdown(diffSec),
    };
  }, [prayers, reminderOffsetMinutes, now]);

  // Notifications API handler with custom offset
  useEffect(() => {
    if (!notificationsEnabled || !nextAlertPrayer || !nextAlertTime) return;

    const alertKey = `${nextAlertPrayer.id}_${nextAlertTime.toDateString()}_${reminderOffsetMinutes}`;
    // If within 2 seconds of alert time and not yet notified
    if (countdownToAlertSeconds <= 2 && lastNotifiedKey !== alertKey) {
      triggerPrayerNotification(nextAlertPrayer.arabicName, location.cityName, reminderOffsetMinutes);
      setLastNotifiedKey(alertKey);
    }
  }, [
    countdownToAlertSeconds,
    notificationsEnabled,
    nextAlertPrayer,
    nextAlertTime,
    location.cityName,
    lastNotifiedKey,
    reminderOffsetMinutes,
  ]);

  // Test Notification helper that can be called from Settings or UI
  const triggerTestNotification = useCallback(
    async (prayerName: string = nextPrayer?.arabicName || 'الظهر') => {
      if ('Notification' in window && Notification.permission !== 'granted') {
        try {
          const res = await Notification.requestPermission();
          if (res !== 'granted') {
            return false;
          }
        } catch (e) {
          console.warn('Notification permission request error', e);
        }
      }
      return triggerPrayerNotification(prayerName, location.cityName, reminderOffsetMinutes);
    },
    [location.cityName, reminderOffsetMinutes, nextPrayer]
  );

  // Extracted dates for clean presentation
  const hijriDate = useMemo(() => {
    if (!data?.date?.hijri) return null;
    const h = data.date.hijri;
    const weekday = h.weekday?.ar || '';
    const day = toArabicDigits(h.day);
    const month = h.month?.ar || '';
    const year = toArabicDigits(h.year);
    return {
      day: h.day,
      monthName: month,
      year: h.year,
      weekday,
      formatted: `${weekday} ${day} ${month} ${year} هـ`,
    };
  }, [data]);

  const gregorianDate = useMemo(() => {
    if (!data?.date?.gregorian) return null;
    const g = data.date.gregorian;
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthName = arabicMonths[g.month.number - 1] || g.month.en;
    const day = toArabicDigits(g.day);
    const year = toArabicDigits(g.year);
    return {
      day: g.day,
      monthName,
      year: g.year,
      formatted: `${day} ${monthName} ${year} م`,
    };
  }, [data]);

  // Specific prayer times convenience getters (for future Athkar section integration)
  const fajrTime = data?.timings?.Fajr || null;
  const sunriseTime = data?.timings?.Sunrise || null;
  const dhuhrTime = data?.timings?.Dhuhr || null;
  const asrTime = data?.timings?.Asr || null;
  const maghribTime = data?.timings?.Maghrib || null;
  const ishaTime = data?.timings?.Isha || null;

  return {
    prayers,
    currentPrayer,
    nextPrayer,
    countdownSeconds,
    countdownFormatted,
    reminderOffsetMinutes,
    nextAlertPrayer,
    nextAlertTime,
    countdownToAlertSeconds,
    countdownToAlertFormatted,
    triggerTestNotification,
    hijriDate,
    gregorianDate,
    isLoading,
    error,
    refresh: loadTimings,
    fajrTime,
    sunriseTime,
    dhuhrTime,
    asrTime,
    maghribTime,
    ishaTime,
  };
}

