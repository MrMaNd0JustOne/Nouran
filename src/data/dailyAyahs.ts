export interface DailyAyahInfo {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  theme: string;
}

export const CURATED_DAILY_AYAHS: DailyAyahInfo[] = [
  { surahNumber: 2, ayahNumber: 255, surahName: 'البقرة', theme: 'آية الكرسي - أعظم آية في كتاب الله' },
  { surahNumber: 2, ayahNumber: 286, surahName: 'البقرة', theme: 'خواتيم سورة البقرة - الدعاء والرحمة' },
  { surahNumber: 3, ayahNumber: 134, surahName: 'آل عمران', theme: 'صفات المتقين وكظم الغيظ' },
  { surahNumber: 13, ayahNumber: 28, surahName: 'الرعد', theme: 'ألا بذكر الله تطمئن القلوب' },
  { surahNumber: 14, ayahNumber: 7, surahName: 'إبراهيم', theme: 'لئن شكرتم لأزيدنكم' },
  { surahNumber: 24, ayahNumber: 35, surahName: 'النور', theme: 'الله نور السماوات والأرض' },
  { surahNumber: 39, ayahNumber: 53, surahName: 'الزمر', theme: 'قل يا عبادي الذين أسرفوا على أنفسهم' },
  { surahNumber: 94, ayahNumber: 5, surahName: 'الشرح', theme: 'فإن مع العسر يسرا' },
  { surahNumber: 55, ayahNumber: 60, surahName: 'الرحمن', theme: 'هل جزاء الإحسان إلا الإحسان' },
  { surahNumber: 65, ayahNumber: 3, surahName: 'الطلاق', theme: 'ومن يتوكل على الله فهو حسبه' },
  { surahNumber: 59, ayahNumber: 22, surahName: 'الحشر', theme: 'هو الله الذي لا إله إلا هو عالم الغيب والشهادة' },
  { surahNumber: 49, ayahNumber: 13, surahName: 'الحجرات', theme: 'يا أيها الناس إنا خلقناكم من ذكر وأنثى' },
  { surahNumber: 1, ayahNumber: 5, surahName: 'الفاتحة', theme: 'إياك نعبد وإياك نستعين' },
  { surahNumber: 2, ayahNumber: 186, surahName: 'البقرة', theme: 'وإذا سألك عبادي عني فإني قريب' },
  { surahNumber: 20, ayahNumber: 114, surahName: 'طه', theme: 'وقل رب زدني علما' },
  { surahNumber: 21, ayahNumber: 87, surahName: 'الأنبياء', theme: 'دعاء ذي النون في الظلمات' },
  { surahNumber: 25, ayahNumber: 74, surahName: 'الفرقان', theme: 'ربنا هب لنا من أزواجنا وذرياتنا قرة أعين' },
  { surahNumber: 28, ayahNumber: 24, surahName: 'القصص', theme: 'رب إني لما أنزلت إلي من خير فقير' },
  { surahNumber: 50, ayahNumber: 16, surahName: 'ق', theme: 'ونحن أقرب إليه من حبل الوريد' },
  { surahNumber: 93, ayahNumber: 3, surahName: 'الضحى', theme: 'ما ودعك ربك وما قلى' },
];

export function getTodayAyahInfo(): DailyAyahInfo {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = Math.abs(dayOfYear) % CURATED_DAILY_AYAHS.length;
  return CURATED_DAILY_AYAHS[index];
}
