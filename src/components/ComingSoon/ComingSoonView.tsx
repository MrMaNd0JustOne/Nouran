import React from 'react';
import { Heart, Calendar, Clock, Sparkles, Bell, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { ActiveTab } from '../../types/quran';

interface ComingSoonViewProps {
  tab: ActiveTab;
  onGoToHome: () => void;
  onGoToMushaf: () => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  tab,
  onGoToHome,
  onGoToMushaf,
}) => {
  const getSectionDetails = () => {
    switch (tab) {
      case 'athkar':
        return {
          title: 'الأذكـار وحصـن المسـلم',
          icon: Heart,
          phase: 'المرحلة الثانية',
          description:
            'موسوعة شاملة من الأذكار النبوية الشريفة مع سبحة إلكترونية ذكية وتنبيهات أذكار الصباح والمساء.',
          features: [
            'أذكار الصباح والمساء بأسانيدها الصحيحة مع التكرار',
            'سبحة إلكترونية تفاعلية مع حفظ عدد التسبيحات',
            'أذكار الصلاة والنوم والاستيقاظ والمناسبات',
            'تنبيهات يومية ذكية للأذكار في مواعيدها',
          ],
        };
      case 'wird':
        return {
          title: 'الـورد اليومـي والختمـات',
          icon: Calendar,
          phase: 'المرحلة الثالثة',
          description:
            'نظام متقدم لتنظيم القراءة اليومية ومتابعة خطط ختم القرآن الكريم بسهولة ويسر.',
          features: [
            'خطط ختمات مرنة (ختمة في شهر، شهرين، أو حسب رغبتك)',
            'تحديد كمية الورد اليومي (صفحات أو أجزاء) مع تنبيه الورد',
            'سجل الإنجاز والنسبة المئوية لتقدمك في الختمة',
            'حفظ صفحات القراءة ومزامنتها تلقائياً مع المصحف',
          ],
        };
      case 'prayer_times':
      default:
        return {
          title: 'مواقيـت الصـلاة والقبلـة',
          icon: Clock,
          phase: 'المرحلة الثانية',
          description:
            'أوقات الصلاة الدقيقة حسب موقعك الجغرافي وبوصلة القبلة الدقيقة وإشعارات الأذان.',
          features: [
            'مواقيت الصلوات الخمس مع وقت الشروق والثلث الأخير',
            'العد التنازلي للصلاة القادمة',
            'بوصلة اتجاه القبلة الذكية بدقة عالية',
            'أصوات أذان متنوعة لكبار المؤذنين بالحرمين ومصر',
          ],
        };
    }
  };

  const details = getSectionDetails();
  const Icon = details.icon;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-28 text-center space-y-6 animate-fade-in">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800/60 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
        <span>قريباً في {details.phase}</span>
      </div>

      {/* Main Feature Card */}
      <div className="bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 dark:from-[#111e18] dark:via-[#0e1713] dark:to-[#171b12] rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-500/20 shadow-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/20 ring-4 ring-emerald-500/20 mb-4">
          <Icon className="w-8 h-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-100 font-sans">
          {details.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed mt-2">
          {details.description}
        </p>

        {/* Feature Highlights List */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-right space-y-2.5 max-w-md mx-auto">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            أبرز مزايا هذا القسم القادم:
          </p>
          {details.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="leading-normal">{feat}</span>
            </div>
          ))}
        </div>

        {/* Fast Action Buttons */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={onGoToHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>البحث الذكي عن الآيات (الرئيسية)</span>
          </button>

          <button
            onClick={onGoToMushaf}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <span>تصفح المصحف الشريف</span>
          </button>
        </div>
      </div>
    </div>
  );
};
