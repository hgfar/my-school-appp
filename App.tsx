import React, { useState, useEffect, useRef } from 'react';
import BottomNav from './components/BottomNav';
import Reminders from './components/Reminders';
import CalendarConverter from './components/CalendarConverter';
import SchoolSchedule from './components/SchoolSchedule';
import Auth from './components/Auth';
import ThemeSwitcher from './components/ThemeSwitcher';
import type { Tab, Reminder, User, AllSchedules, ThemeName, Theme } from './types';
import { notificationOptions } from './assets/notificationOptions';

const themes: Record<ThemeName, Theme> = {
    sky: {
        name: 'sky',
        primaryText: 'text-sky-400',
        buttonBg: 'bg-sky-600',
        buttonHoverBg: 'hover:bg-sky-700',
        ring: 'focus:ring-sky-500',
        border: 'focus:border-sky-500',
    },
    emerald: {
        name: 'emerald',
        primaryText: 'text-emerald-400',
        buttonBg: 'bg-emerald-600',
        buttonHoverBg: 'hover:bg-emerald-700',
        ring: 'focus:ring-emerald-500',
        border: 'focus:border-emerald-500',
    },
    rose: {
        name: 'rose',
        primaryText: 'text-rose-400',
        buttonBg: 'bg-rose-600',
        buttonHoverBg: 'hover:bg-rose-700',
        ring: 'focus:ring-rose-500',
        border: 'focus:border-rose-500',
    }
};


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [activeTab, setActiveTab] = useState<Tab>('reminders');
    
    // User-specific data states
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [schedules, setSchedules] = useState<AllSchedules>([]);
    const [theme, setTheme] = useState<ThemeName>('sky');

    const timeoutIds = useRef<Map<number, number>>(new Map());

    // Register Service Worker for PWA
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            });
        }
    }, []);

    // Load and save data based on the current user
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            const userData = localStorage.getItem(`data_${currentUser.username}`);
            if (userData) {
                const parsedData = JSON.parse(userData);
                setReminders(parsedData.reminders || []);
                setSchedules(parsedData.schedules || []);
                setTheme(parsedData.theme || 'sky');
            } else {
                setReminders([]);
                setSchedules([]);
                setTheme('sky');
            }
        } else {
            localStorage.removeItem('currentUser');
            setReminders([]);
            setSchedules([]);
        }
    }, [currentUser]);

    // Effect to save data to localStorage when it changes
    useEffect(() => {
        if (currentUser) {
            const dataToStore = { reminders, schedules, theme };
            localStorage.setItem(`data_${currentUser.username}`, JSON.stringify(dataToStore));
        }
    }, [reminders, schedules, theme, currentUser]);

    // Notification scheduling effect
    useEffect(() => {
        timeoutIds.current.forEach(timeoutId => window.clearTimeout(timeoutId));
        timeoutIds.current.clear();

        reminders.forEach(reminder => {
            if (!reminder.completed) {
                const delay = new Date(reminder.dateTime).getTime() - Date.now();
                if (delay > 0) {
                    const timeoutId = window.setTimeout(() => {
                        if (Notification.permission === 'granted') {
                            const soundSrc = notificationOptions.sounds[reminder.sound as keyof typeof notificationOptions.sounds];
                            if (soundSrc) {
                                new Audio(soundSrc).play().catch(e => console.error("Error playing sound:", e));
                            }
                            new Notification('تذكير!', {
                                body: reminder.text,
                                vibrate: notificationOptions.vibrationPatterns[reminder.vibration as keyof typeof notificationOptions.vibrationPatterns],
                            } as any);
                        }
                    }, delay);
                    timeoutIds.current.set(reminder.id, timeoutId);
                }
            }
        });

        return () => {
            timeoutIds.current.forEach(timeoutId => window.clearTimeout(timeoutId));
        };
    }, [reminders]);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleAddReminder = (reminder: Omit<Reminder, 'id' | 'completed'>) => {
        const newReminder = { ...reminder, id: Date.now(), completed: false };
        setReminders(prev => [...prev, newReminder].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
    };

    const handleToggleReminder = (id: number) => {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    };

    const handleDeleteReminder = (id: number) => {
        setReminders(prev => prev.filter(r => r.id !== id));
    };

    if (!currentUser) {
        return <Auth onLoginSuccess={handleLoginSuccess} />;
    }
    
    const currentTheme = themes[theme];

    const renderContent = () => {
        switch (activeTab) {
            case 'reminders':
                return <Reminders 
                            theme={currentTheme}
                            reminders={reminders}
                            onAddReminder={handleAddReminder}
                            onToggleReminder={handleToggleReminder}
                            onDeleteReminder={handleDeleteReminder}
                        />;
            case 'schoolSchedule':
                return <SchoolSchedule 
                            theme={currentTheme}
                            schedules={schedules}
                            setSchedules={setSchedules}
                            onAddReminder={handleAddReminder}
                        />;
            case 'calendar':
                return <CalendarConverter theme={currentTheme} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-900 text-slate-100 min-h-screen font-sans">
            <main className="container mx-auto px-4 pt-6 pb-24">
                <header className="flex justify-between items-center text-center mb-8">
                    <div className="w-24 flex justify-start">
                         <ThemeSwitcher currentTheme={theme} setTheme={setTheme} themes={themes} />
                    </div>
                     <div>
                        <h1 className={`text-3xl font-bold ${currentTheme.primaryText}`}>الجدول المدرسي و التنبيهات اليومية</h1>
                        <p className="text-slate-400">مرحباً, {currentUser.username}</p>
                    </div>
                    <div className="w-24 flex justify-end">
                        <button onClick={handleLogout} className={`text-slate-400 hover:${currentTheme.primaryText} transition-colors`} title="تسجيل الخروج">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </header>
                {renderContent()}
            </main>
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={currentTheme} />
        </div>
    );
};

export default App;