import React, { useState } from 'react';
import { MapPin, Navigation, Search, Check, X, Compass, Globe } from 'lucide-react';
import { CityOption } from '../../types/prayer';
import { MAJOR_CITIES } from '../../services/prayerApi';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: CityOption) => void;
  onRequestGeolocation: () => Promise<boolean>;
  isLocating: boolean;
  currentCityName: string;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  onRequestGeolocation,
  isLocating,
  currentCityName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCities = MAJOR_CITIES.filter(
    (c) =>
      c.cityName.includes(searchQuery) ||
      c.countryName.includes(searchQuery)
  );

  const handleUseGps = async () => {
    const success = await onRequestGeolocation();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className="w-full max-w-lg bg-white dark:bg-[#101b16] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-emerald-900/10 dark:border-emerald-500/20 max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans">
                اختيار المدينة وتحديد الموقع
              </h3>
              <p className="text-[11px] text-slate-400">
                الموقع الحالي: {currentCityName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40">
          <button
            onClick={handleUseGps}
            disabled={isLocating}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isLocating ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>{isLocating ? 'جاري تحديد موقعك الجغرافي...' : 'استخدام موقعي الجغرافي الحالي (GPS)'}</span>
          </button>
          <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 text-center mt-2 leading-relaxed">
            لحساب مواقيت دقيقة بناءً على إحداثيات خطوط الطول والعرض لمدينتك.
          </p>
        </div>

        {/* Search Input for Cities */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مدينة أو دولة... (مثال: مكة، القاهرة، الرياض)"
              className="w-full bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-xs rounded-xl py-2.5 pr-9 pl-3 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Cities List */}
        <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
          {filteredCities.map((city, idx) => {
            const isSelected = city.cityName === currentCityName;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl text-right transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-600/60 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold block">{city.cityName}</span>
                    <span className="text-[10px] text-slate-400">{city.countryName}</span>
                  </div>
                </div>

                {isSelected ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors">
                    اختيار
                  </span>
                )}
              </button>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              لم يتم العثور على نتائج لـ "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
