import { ReactNode } from "react";

export type Tab = 'reminders' | 'schoolSchedule' | 'calendar';

export interface Reminder {
  id: number;
  text: string;
  dateTime: string;
  sound: string;
  vibration: string;
  completed: boolean;
}

export interface ConvertedDate {
  year: number;
  month: number;
  day: number;
  monthName?: string;
  weekdayName?: string;
}

// Represents a single child's weekly schedule
export interface ChildSchedule {
  name: string;
  schedule: {
    'الأحد': string[];
    'الاثنين': string[];
    'الثلاثاء': string[];
    'الأربعاء': string[];
    'الخميس': string[];
  };
}

// Represents the entire collection of schedules for all children
export type AllSchedules = ChildSchedule[];


export interface User {
    username: string;
}

export type ThemeName = 'sky' | 'emerald' | 'rose';

export interface Theme {
    name: ThemeName;
    primaryText: string;
    buttonBg: string;
    buttonHoverBg: string;
    ring: string;
    border: string;
}