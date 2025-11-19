import React from 'react';
import type { Tab, Theme } from '../types';
import { BellIcon } from './icons/BellIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { BookIcon } from './icons/BookIcon';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  theme: Theme;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  theme: Theme;
}> = ({ label, icon, isActive, onClick, theme }) => {
  const activeClasses = theme.primaryText;
  const inactiveClasses = `text-slate-400 hover:${theme.primaryText.replace('text-slate-400', '')}`; // A bit of a hack to create hover color

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, theme }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-800/80 backdrop-blur-lg border-t border-slate-700 shadow-t-lg z-20">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <NavButton
          label="التذكيرات"
          icon={<BellIcon />}
          isActive={activeTab === 'reminders'}
          onClick={() => setActiveTab('reminders')}
          theme={theme}
        />
        <NavButton
          label="الجدول الدراسي"
          icon={<BookIcon />}
          isActive={activeTab === 'schoolSchedule'}
          onClick={() => setActiveTab('schoolSchedule')}
          theme={theme}
        />
        <NavButton
          label="التقويم والمحول"
          icon={<CalendarIcon />}
          isActive={activeTab === 'calendar'}
          onClick={() => setActiveTab('calendar')}
          theme={theme}
        />
      </div>
    </nav>
  );
};

export default BottomNav;