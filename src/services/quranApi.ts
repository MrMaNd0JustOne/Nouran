import { Ayah, AyahTafsir, JuzData, PageData, Reciter, SearchMatchAyah, SurahDetail, SurahMeta, TafsirSource } from '../types/quran';

const BASE_URL = 'https://api.alquran.cloud/v1';

// In-memory cache
const memoryCache = new Map<string, any>();

// LocalStorage cache helper with safety
function getFromCache<T>(key: string): T | null {
  try {
    if (memoryCache.has(key)) {
      return memoryCache.get(key) as T;
    }
    const item = localStorage.getItem(`nouran_cache_${key}`);
    if (item) {
      const parsed = JSON.parse(item);
      memoryCache.set(key, parsed);
      return parsed as T;
    }
  } catch (err) {
    console.warn('Cache read error:', err);
  }
  return null;
}

function saveToCache<T>(key: string, data: T): void {
  try {
    memoryCache.set(key, data);
    localStorage.setItem(`nouran_cache_${key}`, JSON.stringify(data));
  } catch (err) {
    // If quota exceeded or error, just keep in memoryCache
    memoryCache.set(key, data);
  }
}

export function clearAppCache(): void {
  memoryCache.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nouran_cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.error('Failed to clear cache', e);
  }
}

export const AVAILABLE_RECITERS: Reciter[] = [
  {
    id: 'ar.alafasy',
    name: 'مشاري بن راشد العفاسي',
    subtext: 'تلاوة حفص عن عاصم - مرتل',
    identifier: 'ar.alafasy',
  },
  {
    id: 'ar.abdulbasitmurattal',
    name: 'عبد الباسط عبد الصمد',
    subtext: 'المصحف المرتل',
    identifier: 'ar.abdulbasitmurattal',
  },
  {
    id: 'ar.minshawi',
    name: 'محمد صديق المنشاوي',
    subtext: 'المصحف المرتل',
    identifier: 'ar.minshawi',
  },
  {
    id: 'ar.hudhaify',
    name: 'علي بن عبد الرحمن الحذيفي',
    subtext: 'تلاوة متقنة هادئة',
    identifier: 'ar.hudhaify',
  },
  {
    id: 'ar.mahermuaiqly',
    name: 'ماهر المعيقلي',
    subtext: 'إمام المسجد الحرام',
    identifier: 'ar.mahermuaiqly',
  },
  {
    id: 'ar.shaatree',
    name: 'أبو بكر الشاطري',
    subtext: 'تلاوة حجازية عذبة',
    identifier: 'ar.shaatree',
  },
];

export const AVAILABLE_TAFSIRS: TafsirSource[] = [
  {
    id: 'ar.muyassar',
    name: 'التفسير الميسر',
    author: 'مجمع الملك فهد لطباعة المصحف الشريف',
    identifier: 'ar.muyassar',
  },
  {
    id: 'ar.jalalayn',
    name: 'تفسير الجلالين',
    author: 'جلال الدين المحلي وجلال الدين السيوطي',
    identifier: 'ar.jalalayn',
  },
  {
    id: 'ar.qurtubi',
    name: 'الجامع لأحكام القرآن',
    author: 'الإمام القرطبي',
    identifier: 'ar.qurtubi',
  },
  {
    id: 'ar.miqbas',
    name: 'تنوير المقباس',
    author: 'منسوب لابن عباس رضي الله عنهما',
    identifier: 'ar.miqbas',
  },
  {
    id: 'ar.waseet',
    name: 'التفسير الوسيط',
    author: 'د. محمد سيد طنطاوي',
    identifier: 'ar.waseet',
  },
  {
    id: 'ar.baghawi',
    name: 'معالم التنزيل',
    author: 'الإمام البغوي',
    identifier: 'ar.baghawi',
  },
];

/**
 * Fetch all 114 Surahs metadata
 */
export async function getSurahs(): Promise<SurahMeta[]> {
  const cacheKey = 'all_surahs';
  const cached = getFromCache<SurahMeta[]>(cacheKey);
  if (cached && cached.length === 114) {
    return cached;
  }

  const res = await fetch(`${BASE_URL}/surah`);
  if (!res.ok) {
    throw new Error('تعذر تحميل فهرس السور، يرجى التحقق من الاتصال بالإنترنت.');
  }

  const json = await res.json();
  if (json.code === 200 && Array.isArray(json.data)) {
    saveToCache(cacheKey, json.data);
    return json.data;
  }

  throw new Error('بيانات السور غير صالحة');
}

/**
 * Fetch full Surah text (Uthmani edition)
 */
export async function getSurah(surahNumber: number, edition = 'quran-uthmani'): Promise<SurahDetail> {
  const cacheKey = `surah_${surahNumber}_${edition}`;
  const cached = getFromCache<SurahDetail>(cacheKey);
  if (cached) {
    return cached;
  }

  const res = await fetch(`${BASE_URL}/surah/${surahNumber}/${edition}`);
  if (!res.ok) {
    throw new Error(`تعذر تحميل سورة رقم ${surahNumber}`);
  }

  const json = await res.json();
  if (json.code === 200 && json.data) {
    saveToCache(cacheKey, json.data);
    return json.data;
  }

  throw new Error('استجابة غير صالحة للسورة');
}

/**
 * Fetch single Ayah with both Uthmani and Tafsir editions
 */
export async function getAyahWithTafsir(
  surahNumber: number,
  ayahNumberInSurah: number,
  tafsirEdition = 'ar.muyassar'
): Promise<{ uthmani: Ayah; tafsirText: string; tafsirName: string }> {
  const cacheKey = `ayah_${surahNumber}_${ayahNumberInSurah}_${tafsirEdition}`;
  const cached = getFromCache<{ uthmani: Ayah; tafsirText: string; tafsirName: string }>(cacheKey);
  if (cached) {
    return cached;
  }

  const editions = `quran-uthmani,${tafsirEdition}`;
  const res = await fetch(`${BASE_URL}/ayah/${surahNumber}:${ayahNumberInSurah}/editions/${editions}`);
  if (!res.ok) {
    throw new Error(`تعذر تحميل الآية ${ayahNumberInSurah} من سورة رقم ${surahNumber}`);
  }

  const json = await res.json();
  if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
    const uthmani = json.data[0];
    const tafsir = json.data[1];
    const result = {
      uthmani,
      tafsirText: tafsir.text,
      tafsirName: tafsir.edition?.name || 'التفسير',
    };
    saveToCache(cacheKey, result);
    return result;
  }

  throw new Error('تعذر قراءة بيانات الآية والتفسير');
}

/**
 * Search Ayahs using quran-simple edition
 */
export async function searchQuranSimple(query: string): Promise<SearchMatchAyah[]> {
  const clean = query.trim();
  if (!clean) return [];

  const res = await fetch(`${BASE_URL}/search/${encodeURIComponent(clean)}/all/quran-simple`);
  if (!res.ok) {
    // 404 or empty search may return 404 status from AlQuran Cloud
    return [];
  }

  const json = await res.json();
  if (json.code === 200 && json.data?.matches) {
    return json.data.matches as SearchMatchAyah[];
  }

  return [];
}

/**
 * Fetch Page from Mushaf (1 to 604)
 */
export async function getPage(pageNumber: number, edition = 'quran-uthmani'): Promise<PageData> {
  if (pageNumber < 1 || pageNumber > 604) {
    throw new Error('رقم الصفحة يجب أن يكون بين 1 و 604');
  }

  const cacheKey = `page_${pageNumber}_${edition}`;
  const cached = getFromCache<PageData>(cacheKey);
  if (cached) {
    return cached;
  }

  const res = await fetch(`${BASE_URL}/page/${pageNumber}/${edition}`);
  if (!res.ok) {
    throw new Error(`تعذر تحميل صفحة ${pageNumber} من المصحف`);
  }

  const json = await res.json();
  if (json.code === 200 && json.data) {
    const ayahs: Ayah[] = json.data.ayahs || [];
    const surahs: Record<number, SurahMeta> = json.data.surahs || {};
    const result: PageData = {
      pageNumber,
      ayahs,
      surahs,
    };
    saveToCache(cacheKey, result);
    return result;
  }

  throw new Error('بيانات الصفحة غير صالحة');
}

/**
 * Fetch Juz from Quran (1 to 30)
 */
export async function getJuz(juzNumber: number, edition = 'quran-uthmani'): Promise<JuzData> {
  if (juzNumber < 1 || juzNumber > 30) {
    throw new Error('رقم الجزء يجب أن يكون بين 1 و 30');
  }

  const cacheKey = `juz_${juzNumber}_${edition}`;
  const cached = getFromCache<JuzData>(cacheKey);
  if (cached) {
    return cached;
  }

  const res = await fetch(`${BASE_URL}/juz/${juzNumber}/${edition}`);
  if (!res.ok) {
    throw new Error(`تعذر تحميل الجزء ${juzNumber}`);
  }

  const json = await res.json();
  if (json.code === 200 && json.data) {
    const result: JuzData = {
      juzNumber,
      ayahs: json.data.ayahs || [],
    };
    saveToCache(cacheKey, result);
    return result;
  }

  throw new Error('بيانات الجزء غير صالحة');
}

/**
 * Builds audio URL for an ayah given global ayah number or reciter
 */
export function getAyahAudioUrl(globalAyahNumber: number, reciterId = 'ar.alafasy'): string {
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${globalAyahNumber}.mp3`;
}
