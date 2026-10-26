export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface AlAdhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset?: string;
  Maghrib: string;
  Isha: string;
  Imsak?: string;
  Midnight?: string;
  Firstthird?: string;
  Lastthird?: string;
}

export interface AlAdhanDate {
  readable: string;
  timestamp: string;
  gregorian: {
    date: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
  };
  hijri: {
    date: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
    designation: { abbreviated: string; expanded: string };
    holidays: string[];
  };
}

export interface AlAdhanMeta {
  latitude: number;
  longitude: number;
  timezone: string;
  method: {
    id: number;
    name: string;
  };
  school: string | { id: number; name: string };
}

export interface AlAdhanResponse {
  code: number;
  status: string;
  data: {
    timings: AlAdhanTimings;
    date: AlAdhanDate;
    meta: AlAdhanMeta;
  };
}

export interface NominatimResponse {
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
    suburb?: string;
    county?: string;
  };
}

export interface PrayerItem {
  id: PrayerName;
  arabicName: string;
  time24: string;
  time12: string;
  period: 'ص' | 'م';
  formattedTime: string;
  isPassed: boolean;
  isCurrent: boolean;
  isNext: boolean;
  timeDate: Date;
}

export interface LocationState {
  latitude: number;
  longitude: number;
  cityName: string;
  countryName: string;
  isManual: boolean;
}

export interface CalculationMethod {
  id: number;
  name: string;
  description: string;
}

export interface CityOption {
  cityName: string;
  countryName: string;
  latitude: number;
  longitude: number;
  defaultMethodId: number;
}

export interface NotificationOffsetOption {
  minutes: number;
  label: string;
}
