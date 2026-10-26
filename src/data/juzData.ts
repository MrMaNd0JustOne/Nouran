export interface JuzInfo {
  number: number;
  name: string;
  startSurahName: string;
  startSurahNumber: number;
  startAyahNumber: number;
  startPage: number;
}

export const JUZ_LIST: JuzInfo[] = [
  { number: 1, name: 'الجزء الأول', startSurahName: 'الفاتحة', startSurahNumber: 1, startAyahNumber: 1, startPage: 1 },
  { number: 2, name: 'الجزء الثاني (سيقول)', startSurahName: 'البقرة', startSurahNumber: 2, startAyahNumber: 142, startPage: 22 },
  { number: 3, name: 'الجزء الثالث (تلك الرسل)', startSurahName: 'البقرة', startSurahNumber: 2, startAyahNumber: 253, startPage: 42 },
  { number: 4, name: 'الجزء الرابع (لن تنالوا)', startSurahName: 'آل عمران', startSurahNumber: 3, startAyahNumber: 93, startPage: 62 },
  { number: 5, name: 'الجزء الخامس (والمحصنات)', startSurahName: 'النساء', startSurahNumber: 4, startAyahNumber: 24, startPage: 82 },
  { number: 6, name: 'الجزء السادس (لا يحب الله)', startSurahName: 'النساء', startSurahNumber: 4, startAyahNumber: 148, startPage: 102 },
  { number: 7, name: 'الجزء السابع (وإذا سمعوا)', startSurahName: 'المائدة', startSurahNumber: 5, startAyahNumber: 82, startPage: 121 },
  { number: 8, name: 'الجزء الثامن (ولو أننا)', startSurahName: 'الأنعام', startSurahNumber: 6, startAyahNumber: 111, startPage: 142 },
  { number: 9, name: 'الجزء التاسع (قال الملأ)', startSurahName: 'الأعراف', startSurahNumber: 7, startAyahNumber: 88, startPage: 162 },
  { number: 10, name: 'الجزء العاشر (واعلموا)', startSurahName: 'الأنفال', startSurahNumber: 8, startAyahNumber: 41, startPage: 182 },
  { number: 11, name: 'الجزء الحادي عشر (يعتذرون)', startSurahName: 'التوبة', startSurahNumber: 9, startAyahNumber: 93, startPage: 201 },
  { number: 12, name: 'الجزء الثاني عشر (وما من دابة)', startSurahName: 'هود', startSurahNumber: 11, startAyahNumber: 6, startPage: 222 },
  { number: 13, name: 'الجزء الثالث عشر (وما أبرئ)', startSurahName: 'يوسف', startSurahNumber: 12, startAyahNumber: 53, startPage: 242 },
  { number: 14, name: 'الجزء الرابع عشر (ربما)', startSurahName: 'الحجر', startSurahNumber: 15, startAyahNumber: 1, startPage: 262 },
  { number: 15, name: 'الجزء الخامس عشر (سبحان)', startSurahName: 'الإسراء', startSurahNumber: 17, startAyahNumber: 1, startPage: 282 },
  { number: 16, name: 'الجزء السادس عشر (قال ألم)', startSurahName: 'الكهف', startSurahNumber: 18, startAyahNumber: 75, startPage: 302 },
  { number: 17, name: 'الجزء السابع عشر (اقترب)', startSurahName: 'الأنبياء', startSurahNumber: 21, startAyahNumber: 1, startPage: 322 },
  { number: 18, name: 'الجزء الثامن عشر (قد أفلح)', startSurahName: 'المؤمنون', startSurahNumber: 23, startAyahNumber: 1, startPage: 342 },
  { number: 19, name: 'الجزء التاسع عشر (وقال الذين)', startSurahName: 'الفرقان', startSurahNumber: 25, startAyahNumber: 21, startPage: 362 },
  { number: 20, name: 'الجزء العشرون (أمن خلق)', startSurahName: 'النمل', startSurahNumber: 27, startAyahNumber: 56, startPage: 382 },
  { number: 21, name: 'الجزء الحادي والعشرون (اتل ما أوحي)', startSurahName: 'العنكبوت', startSurahNumber: 29, startAyahNumber: 46, startPage: 402 },
  { number: 22, name: 'الجزء الثاني والعشرون (ومن يقنت)', startSurahName: 'الأحزاب', startSurahNumber: 33, startAyahNumber: 31, startPage: 422 },
  { number: 23, name: 'الجزء الثالث والعشرون (وما أنزلنا)', startSurahName: 'يس', startSurahNumber: 36, startAyahNumber: 28, startPage: 442 },
  { number: 24, name: 'الجزء الرابع والعشرون (فمن أظلم)', startSurahName: 'الزمر', startSurahNumber: 39, startAyahNumber: 32, startPage: 462 },
  { number: 25, name: 'الجزء الخامس والعشرون (إليه يرد)', startSurahName: 'فصلت', startSurahNumber: 41, startAyahNumber: 47, startPage: 482 },
  { number: 26, name: 'الجزء السادس والعشرون (حم)', startSurahName: 'الأحقاف', startSurahNumber: 46, startAyahNumber: 1, startPage: 502 },
  { number: 27, name: 'الجزء السابع والعشرون (قال فما خطبكم)', startSurahName: 'الذاريات', startSurahNumber: 51, startAyahNumber: 31, startPage: 522 },
  { number: 28, name: 'الجزء الثامن والعشرون (قد سمع)', startSurahName: 'المجادلة', startSurahNumber: 58, startAyahNumber: 1, startPage: 542 },
  { number: 29, name: 'الجزء التاسع والعشرون (تبارك)', startSurahName: 'الملك', startSurahNumber: 67, startAyahNumber: 1, startPage: 562 },
  { number: 30, name: 'الجزء الثلاثون (عمّ)', startSurahName: 'النبأ', startSurahNumber: 78, startAyahNumber: 1, startPage: 582 },
];
