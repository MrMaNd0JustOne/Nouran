import { AlAdhanResponse, CalculationMethod, CityOption, NominatimResponse } from '../types/prayer';
import { toArabicDigits } from '../utils/arabicUtils';

export const DEFAULT_LOCATION: CityOption = {
  cityName: 'القاهرة',
  countryName: 'مصر',
  latitude: 30.0444,
  longitude: 31.2357,
  defaultMethodId: 5,
};

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 5, name: 'الهيئة المصرية العامة للمساحة', description: 'مصر، السودان، الشام، وأجزاء من إفريقيا' },
  { id: 4, name: 'جامعة أم القرى بمكة المكرمة', description: 'المملكة العربية السعودية والخليج' },
  { id: 3, name: 'رابطة العالم الإسلامي', description: 'أوروبا، الشرق الأقصى، وأجزاء من العالم العربي' },
  { id: 8, name: 'منطقة الخليج العربي', description: 'الإمارات، قطر، الكويت، البحرين، عمان' },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', description: 'الولايات المتحدة وكندا' },
  { id: 1, name: 'جامعة العلوم الإسلامية بكراتشي', description: 'باكستان، الهند، بنغلاديش' },
  { id: 12, name: 'اتحاد المنظمات الإسلامية في فرنسا (UOIF)', description: 'فرنسا ومعظم دول أوروبا الغربية' },
  { id: 13, name: 'رئاسة الشؤون الدينية التركية (Diyanet)', description: 'تركيا ومسلمو شرق أوروبا' },
];

export const MAJOR_CITIES: CityOption[] = [
  { cityName: 'القاهرة', countryName: 'مصر', latitude: 30.0444, longitude: 31.2357, defaultMethodId: 5 },
  { cityName: 'الإسكندرية', countryName: 'مصر', latitude: 31.2001, longitude: 29.9187, defaultMethodId: 5 },
  { cityName: 'مكة المكرمة', countryName: 'السعودية', latitude: 21.4225, longitude: 39.8262, defaultMethodId: 4 },
  { cityName: 'المدينة المنورة', countryName: 'السعودية', latitude: 24.4686, longitude: 39.6142, defaultMethodId: 4 },
  { cityName: 'الرياض', countryName: 'السعودية', latitude: 24.7136, longitude: 46.6753, defaultMethodId: 4 },
  { cityName: 'جدة', countryName: 'السعودية', latitude: 21.4858, longitude: 39.1925, defaultMethodId: 4 },
  { cityName: 'القدس الشريف', countryName: 'فلسطين', latitude: 31.7683, longitude: 35.2137, defaultMethodId: 5 },
  { cityName: 'غزة', countryName: 'فلسطين', latitude: 31.5017, longitude: 34.4668, defaultMethodId: 5 },
  { cityName: 'دبي', countryName: 'الإمارات', latitude: 25.2048, longitude: 55.2708, defaultMethodId: 8 },
  { cityName: 'أبوظبي', countryName: 'الإمارات', latitude: 24.4539, longitude: 54.3773, defaultMethodId: 8 },
  { cityName: 'الدوحة', countryName: 'قطر', latitude: 25.2854, longitude: 51.5310, defaultMethodId: 8 },
  { cityName: 'الكويت', countryName: 'الكويت', latitude: 29.3759, longitude: 47.9774, defaultMethodId: 8 },
  { cityName: 'المنامة', countryName: 'البحرين', latitude: 26.2285, longitude: 50.5860, defaultMethodId: 8 },
  { cityName: 'مسقط', countryName: 'عمان', latitude: 23.5880, longitude: 58.3829, defaultMethodId: 8 },
  { cityName: 'عمّان', countryName: 'الأردن', latitude: 31.9454, longitude: 35.9284, defaultMethodId: 5 },
  { cityName: 'بيروت', countryName: 'لبنان', latitude: 33.8938, longitude: 35.5018, defaultMethodId: 5 },
  { cityName: 'دمشق', countryName: 'سوريا', latitude: 33.5138, longitude: 36.2765, defaultMethodId: 5 },
  { cityName: 'بغداد', countryName: 'العراق', latitude: 33.3152, longitude: 44.3661, defaultMethodId: 5 },
  { cityName: 'صنعاء', countryName: 'اليمن', latitude: 15.3694, longitude: 44.1910, defaultMethodId: 4 },
  { cityName: 'طرابلس', countryName: 'ليبيا', latitude: 32.8872, longitude: 13.1913, defaultMethodId: 5 },
  { cityName: 'تونس', countryName: 'تونس', latitude: 36.8065, longitude: 10.1815, defaultMethodId: 5 },
  { cityName: 'الجزائر', countryName: 'الجزائر', latitude: 36.7538, longitude: 3.0588, defaultMethodId: 5 },
  { cityName: 'الرباط', countryName: 'المغرب', latitude: 34.0209, longitude: -6.8416, defaultMethodId: 3 },
  { cityName: 'الدار البيضاء', countryName: 'المغرب', latitude: 33.5731, longitude: -7.5898, defaultMethodId: 3 },
  { cityName: 'الخرطوم', countryName: 'السودان', latitude: 15.5007, longitude: 32.5599, defaultMethodId: 5 },
  { cityName: 'إسطنبول', countryName: 'تركيا', latitude: 41.0082, longitude: 28.9784, defaultMethodId: 13 },
  { cityName: 'لندن', countryName: 'بريطانيا', latitude: 51.5074, longitude: -0.1278, defaultMethodId: 3 },
  { cityName: 'باريس', countryName: 'فرنسا', latitude: 48.8566, longitude: 2.3522, defaultMethodId: 12 },
];

/**
 * Format date as DD-MM-YYYY required by AlAdhan API
 */
export function getFormattedDateForAlAdhan(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Fetch prayer timings from AlAdhan API with localStorage caching
 */
export async function fetchPrayerTimings(
  latitude: number,
  longitude: number,
  method = 5,
  school = 0,
  date: Date = new Date()
): Promise<AlAdhanResponse['data']> {
  const dateStr = getFormattedDateForAlAdhan(date);
  const cacheKey = `nouran_prayers_${latitude.toFixed(3)}_${longitude.toFixed(3)}_${dateStr}_${method}_${school}`;

  // Try cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Prayer cache read failed', e);
  }

  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('تعذر جلب مواقيت الصلاة من الخادم، يرجى التحقق من الاتصال بالإنترنت.');
  }

  const json: AlAdhanResponse = await res.json();
  if (json.code === 200 && json.data) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(json.data));
      // Save as latest successful fallback
      localStorage.setItem('nouran_latest_prayer_data', JSON.stringify(json.data));
    } catch (e) {
      // ignore
    }
    return json.data;
  }

  throw new Error('بيانات المواقيت غير صالحة');
}

/**
 * Fetch Arabic city and country name using OpenStreetMap Nominatim reverse geocoding
 */
export async function fetchCityCountryName(latitude: number, longitude: number): Promise<{ cityName: string; countryName: string }> {
  const cacheKey = `nouran_nominatim_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // ignore
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'ar',
      },
    });

    if (res.ok) {
      const json: NominatimResponse = await res.json();
      const addr = json.address || {};

      const cityName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.state ||
        addr.county ||
        addr.suburb ||
        'موقعي الحالي';

      const countryName = addr.country || '';

      const result = { cityName, countryName };
      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch {
        // ignore
      }
      return result;
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode error:', e);
  }

  return { cityName: 'الموقع الحالي', countryName: '' };
}

/**
 * Converts 24-hour time "14:35" to 12-hour Arabic formatted time "02:35 م"
 */
export function formatTo12HourArabic(time24: string): { time12: string; period: 'ص' | 'م'; formatted: string } {
  if (!time24) return { time12: '--:--', period: 'ص', formatted: '--:--' };

  // Remove potential timezone offsets like (EEST)
  const cleanTime = time24.split(' ')[0];
  const [hStr, mStr] = cleanTime.split(':');
  let hour = parseInt(hStr, 10);
  const minutes = mStr || '00';

  if (isNaN(hour)) {
    return { time12: time24, period: 'ص', formatted: time24 };
  }

  const period: 'ص' | 'م' = hour >= 12 ? 'م' : 'ص';
  hour = hour % 12;
  if (hour === 0) hour = 12;

  const hourStr = String(hour).padStart(2, '0');
  const time12 = `${hourStr}:${minutes}`;
  const formatted = `${time12} ${period}`;

  return { time12, period, formatted };
}

/**
 * Builds Date object for a given prayer time today
 */
export function getPrayerDateTime(time24: string, baseDate = new Date()): Date {
  const cleanTime = time24.split(' ')[0];
  const [h, m] = cleanTime.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Formats countdown seconds to HH:MM:SS or MM:SS
 */
export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');

  return `${toArabicDigits(hStr)}:${toArabicDigits(mStr)}:${toArabicDigits(sStr)}`;
}

export const NOTIFICATION_OFFSET_OPTIONS = [
  { minutes: -30, label: 'قبل الأذان بـ ٣٠ دقيقة' },
  { minutes: -20, label: 'قبل الأذان بـ ٢٠ دقيقة' },
  { minutes: -15, label: 'قبل الأذان بـ ١٥ دقيقة (الموصى به للاستعداد)' },
  { minutes: -10, label: 'قبل الأذان بـ ١٠ دقائق' },
  { minutes: -5, label: 'قبل الأذان بـ ٥ دقائق' },
  { minutes: 0, label: 'عند موعد الأذان تماماً' },
  { minutes: 5, label: 'بعد الأذان بـ ٥ دقائق' },
  { minutes: 10, label: 'بعد الأذان بـ ١٠ دقائق (موعد الإقامة)' },
  { minutes: 15, label: 'بعد الأذان بـ ١٥ دقيقة' },
  { minutes: 20, label: 'بعد الأذان بـ ٢٠ دقيقة' },
];

export function getNotificationOffsetDescription(minutes: number): string {
  if (minutes === 0) return 'عند موعد الأذان تماماً';
  if (minutes < 0) return `قبل الأذان بـ ${toArabicDigits(Math.abs(minutes))} دقيقة`;
  return `بعد الأذان بـ ${toArabicDigits(minutes)} دقيقة`;
}

/**
 * Returns customized title and body based on the offset (before, at, or after Adhan)
 */
export function getPrayerAlertContent(
  arabicName: string,
  cityName: string,
  offsetMinutes: number
): { title: string; body: string } {
  if (offsetMinutes < 0) {
    const absMins = Math.abs(offsetMinutes);
    return {
      title: `اقتراب صلاة ${arabicName} (باقٍ ${toArabicDigits(absMins)} دقيقة)`,
      body: `تذكير: باقٍ ${toArabicDigits(absMins)} دقيقة على موعد أذان ${arabicName} في ${cityName}. استعد للوضوء والصلاة.`,
    };
  } else if (offsetMinutes > 0) {
    return {
      title: `تذكير بصلاة ${arabicName} (مضت ${toArabicDigits(offsetMinutes)} دقيقة على الأذان)`,
      body: `حان الآن موعد إقامة صلاة ${arabicName} أو أداؤها في ${cityName}. تقبل الله طاعتكم.`,
    };
  } else {
    return {
      title: `حان الآن وقت صلاة ${arabicName}`,
      body: `الله أكبر، حان الآن موعد أذان ${arabicName} في ${cityName}. حي على الصلاة، حي على الفلاح.`,
    };
  }
}

/**
 * Plays a gentle, pleasant notification sound chime using Web Audio API
 */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.25); // E5
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, now + 0.2); // G5
    gain2.gain.setValueAtTime(0.12, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 1.4);
  } catch (e) {
    console.warn('Audio chime unavailable', e);
  }
}

/**
 * Triggers a browser notification and audio chime
 */
export function triggerPrayerNotification(
  arabicName: string,
  cityName: string,
  offsetMinutes: number
): boolean {
  playNotificationChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const { title, body } = getPrayerAlertContent(arabicName, cityName, offsetMinutes);
      new Notification(title, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🕌</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🕌</text></svg>',
      });
      return true;
    } catch (e) {
      console.warn('Browser notification trigger failed', e);
    }
  }
  return false;
}


