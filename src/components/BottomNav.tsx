import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, BookOpen, Heart, Calendar, Clock } from 'lucide-react';
import { ActiveTab } from '../types/quran';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

interface NavItem {
  id: ActiveTab;
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isComingSoon?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems: NavItem[] = [
    {
      id: 'search',
      path: '/',
      label: 'الرئيسية',
      icon: Search,
    },
    {
      id: 'mushaf',
      path: '/mushaf',
      label: 'المصحف',
      icon: BookOpen,
    },
    {
      id: 'athkar',
      path: '/athkar',
      label: 'الأذكار',
      icon: Heart,
    },
    {
      id: 'wird',
      path: '/wird',
      label: 'الورد اليومي',
      icon: Calendar,
    },
    {
      id: 'prayer_times',
      path: '/prayer-times',
      label: 'المواقيت',
      icon: Clock,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0c1411]/95 backdrop-blur-md border-t border-emerald-900/10 dark:border-emerald-500/10 pb-safe transition-colors shadow-lg shadow-black/10"
      aria-label="شريط التنقل السفلي"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={() => {
                if (activeTab !== item.id) {
                  onTabChange(item.id);
                }
              }}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 group focus:outline-none ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active pill background effect */}
                  {isActive && (
                    <span className="absolute inset-x-3 inset-y-1 bg-emerald-100/80 dark:bg-emerald-950/70 rounded-xl -z-10 transition-all duration-200" />
                  )}

                  {/* Icon Container with subtle badge for coming soon */}
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'scale-110 text-emerald-700 dark:text-emerald-400' : 'group-hover:scale-105'
                      }`}
                    />
                    {item.isComingSoon && (
                      <span className="absolute -top-1 -left-2 text-[8px] bg-amber-500 text-white font-bold px-1 rounded-full leading-tight shadow-sm scale-90">
                        قريباً
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span className="text-[11px] mt-1 tracking-tight select-none truncate">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
