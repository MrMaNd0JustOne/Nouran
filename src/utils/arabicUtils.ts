/**
 * Utility functions for Arabic text normalization, Quranic numerals,
 * similarity ranking and search matching.
 */

// Arabic Diacritics Regex (Tashkeel, Tanween, Shaddah, Sukun, Quranic marks)
const ARABIC_DIACRITICS_REGEX = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;

// Arabic Tatweel (Kashida)
const TATWEEL_REGEX = /\u0640/g;

/**
 * Normalizes Arabic text for flexible search and comparison:
 * - Removes tashkeel (diacritics) and Quranic stop marks
 * - Removes tatweel (kashida)
 * - Normalizes Alef variations (أ, إ, آ, ٱ -> ا)
 * - Normalizes Yaa & Alef Maqsura (ى -> ي)
 * - Normalizes Taa Marbuta (ة -> ه)
 * - Normalizes Hamzas (ؤ -> و, ئ -> ي)
 * - Removes non-Arabic punctuation and trims spaces
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';

  return text
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(TATWEEL_REGEX, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0621-\u064A\s]/g, ' ') // keep Arabic letters and spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts English numerals to Arabic-Indic digits (e.g. 12 -> ١٢)
 */
export function toArabicDigits(num: number | string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => digits[parseInt(d, 10)]);
}

/**
 * Returns formatted Quranic Ayah number with traditional bracket decoration
 */
export function formatAyahSymbol(num: number): string {
  return `﴿${toArabicDigits(num)}﴾`;
}

/**
 * Calculates similarity score (0.0 to 1.0) between query and target verse
 */
export function calculateSimilarity(query: string, target: string): number {
  const normQuery = normalizeArabic(query);
  const normTarget = normalizeArabic(target);

  if (!normQuery || !normTarget) return 0;
  if (normTarget === normQuery) return 1.0;

  // Direct substring check
  if (normTarget.includes(normQuery)) {
    // If the whole query is an exact phrase within the target, high score
    const ratio = normQuery.length / normTarget.length;
    return Math.min(1.0, 0.75 + ratio * 0.25);
  }

  // Token-based matching
  const queryWords = normQuery.split(' ').filter(Boolean);
  const targetWords = normTarget.split(' ').filter(Boolean);

  if (queryWords.length === 0 || targetWords.length === 0) return 0;

  let matchedWordsCount = 0;
  for (const qWord of queryWords) {
    if (targetWords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord))) {
      matchedWordsCount++;
    }
  }

  const wordOverlapRatio = matchedWordsCount / queryWords.length;

  // Character bigram similarity (Dice coefficient)
  const bigramScore = diceCoefficient(normQuery, normTarget);

  return Number((wordOverlapRatio * 0.7 + bigramScore * 0.3).toFixed(3));
}

function diceCoefficient(str1: string, str2: string): number {
  if (str1.length < 2 || str2.length < 2) {
    return str1 === str2 ? 1.0 : 0;
  }

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const bigrams1 = getBigrams(str1);
  const bigrams2 = getBigrams(str2);

  let intersection = 0;
  bigrams1.forEach((count1, bigram) => {
    const count2 = bigrams2.get(bigram) || 0;
    intersection += Math.min(count1, count2);
  });

  const total = (str1.length - 1) + (str2.length - 1);
  return (2.0 * intersection) / total;
}

/**
 * Splits text into segments for highlighting matching words.
 */
export function getHighlightedSegments(
  text: string,
  query: string
): Array<{ text: string; isMatch: boolean }> {
  if (!query || !text) return [{ text, isMatch: false }];

  const normQuery = normalizeArabic(query);
  const queryWords = normQuery.split(' ').filter(w => w.length > 1);

  if (queryWords.length === 0) return [{ text, isMatch: false }];

  // Split by whitespace while preserving punctuation
  const words = text.split(/(\s+)/);

  return words.map(word => {
    const normWord = normalizeArabic(word);
    const isMatch = queryWords.some(qw => normWord.includes(qw) || (qw.length > 3 && normWord.length > 3 && qw.slice(0, 3) === normWord.slice(0, 3)));
    return { text: word, isMatch };
  });
}

/**
 * Standard Basmalah text in Uthmani
 */
export const BISMILLAH_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

/**
 * Removes prefixed Basmalah from verse 1 of surahs other than Al-Fatiha (surah 1)
 * because Al-Fatiha ayah 1 IS the Basmalah, whereas in other surahs it's often
 * prepended in the API response data.
 */
export function stripPrefixBasmalah(text: string, surahNumber: number, ayahNumber: number): string {
  if (surahNumber === 1 || surahNumber === 9 || ayahNumber !== 1) {
    return text;
  }

  // The Basmalah string in quran-uthmani
  const bismillahVariation = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
  if (text.startsWith(bismillahVariation)) {
    return text.substring(bismillahVariation.length).trim();
  }

  // If normalized check matches
  const normText = normalizeArabic(text);
  const normBismillah = normalizeArabic(bismillahVariation);
  if (normText.startsWith(normBismillah)) {
    // Cut roughly first 39-45 characters up to the first word boundary
    const words = text.split(' ');
    if (words.length >= 4) {
      return words.slice(4).join(' ').trim();
    }
  }

  return text;
}
