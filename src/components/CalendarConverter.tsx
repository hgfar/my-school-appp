
import React, { useState, useEffect } from 'react';
import { getTodaysHijriDate, convertGregorianToHijri, convertHijriToGregorian } from '../services/geminiService';
import type { ConvertedDate, Theme } from '../types';

interface CalendarConverterProps {
    theme: Theme;
}

const ResultDisplay: React.FC<{ date: ConvertedDate | null; loading: boolean; error: string | null; theme: Theme }> = ({ date, loading, error, theme }) => {
    const [copied, setCopied] = useState(false);

    if (loading) return <div className="mt-4 text-center p-3 bg-slate-700/30 rounded-lg animate-pulse text-yellow-400 text-sm">جاري التحميل...</div>;
    
    if (error) return <div className="mt-4 text-center p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-400 text-sm">{error}</div>;
    
    if (!date || !date.monthName) return null;

    const formattedDate = `${date.weekdayName ? date.weekdayName + ' ' : ''}${date.day} ${date.monthName} ${date.year}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(formattedDate);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-4 p-4 rounded-lg border border-slate-600 bg-slate-700/50 flex flex-col items-center gap-2 animate-fade-in transition-all">
             <span className="text-slate-400 text-xs font-medium">التاريخ المحول</span>
             <div className="flex items-center justify-center gap-3 w-full bg-slate-800/50 p-3 rounded-md border border-slate-600/30 relative group">
                <p className={`font-bold text-lg ${theme.primaryText} select-all`}>{formattedDate}</p>
                <button 
                    onClick={handleCopy} 
                    className={`p-2 rounded-full hover:bg-slate-600 transition-colors ${copied ? 'text-green-400' : 'text-slate-400 hover:text-white'}`}
                    title="نسخ التاريخ"
                >
                    {copied ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
                {copied && <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded shadow-lg animate-fade-in">تم النسخ!</span>}
             </div>
        </div>
    );
};

const CalendarConverter: React.FC<CalendarConverterProps> = ({ theme }) => {
    const [todaysGregorian, setTodaysGregorian] = useState('');
    const [todaysHijri, setTodaysHijri] = useState<ConvertedDate | null>(null);
    const [hijriLoading, setHijriLoading] = useState(true);

    // Inputs
    const [gregorianInput, setGregorianInput] = useState({ year: '', month: '', day: '' });
    const [hijriInput, setHijriInput] = useState({ year: '', month: '', day: '' });

    // Visual Calendar State
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [displayDate, setDisplayDate] = useState(new Date()); // For navigation
    
    // Results
    const [g2hResult, setG2hResult] = useState<ConvertedDate | null>(null);
    const [h2gResult, setH2gResult] = useState<ConvertedDate | null>(null);
    const [g2hLoading, setG2hLoading] = useState(false);
    const [h2gLoading, setH2gLoading] = useState(false);
    const [g2hError, setG2hError] = useState<string | null>(null);
    const [h2gError, setH2gError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHijriDate = async () => {
            try {
                const hijriDate = await getTodaysHijriDate();
                setTodaysHijri(hijriDate);
            } catch (error) {
                console.error("Failed to fetch today's Hijri date", error);
            } finally {
                setHijriLoading(false);
            }
        };
        
        const today = new Date();
        
        // Initial Gregorian Input population
        setGregorianInput({
            year: today.getFullYear().toString(),
            month: (today.getMonth() + 1).toString(),
            day: today.getDate().toString()
        });

        const gregorianFormatted = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(today);
        setTodaysGregorian(gregorianFormatted);
        
        fetchHijriDate();
    }, []);

    const handleG2HConvert = async () => {
        const { year, month, day } = gregorianInput;
        if (!year || !month || !day) return;
        setG2hLoading(true);
        setG2hError(null);
        setG2hResult(null);
        try {
            const result = await convertGregorianToHijri(parseInt(year), parseInt(month), parseInt(day));
            setG2hResult(result);
        } catch (error) {
            setG2hError('فشل التحويل. يرجى التحقق من المدخلات.');
        } finally {
            setG2hLoading(false);
        }
    };

    const handleH2GConvert = async () => {
        const { year, month, day } = hijriInput;
        if (!year || !month || !day) return;
        setH2gLoading(true);
        setH2gError(null);
        setH2gResult(null);
        try {
            const result = await convertHijriToGregorian(parseInt(year), parseInt(month), parseInt(day));
            setH2gResult(result);
        } catch (error) {
            setH2gError('فشل التحويل. يرجى التحقق من المدخلات.');
        } finally {
            setH2gLoading(false);
        }
    };

    // --- Visual Calendar Logic ---

    const handleDateSelect = (date: Date) => {
        const y = date.getFullYear().toString();
        const m = (date.getMonth() + 1).toString();
        const d = date.getDate().toString();
        
        setGregorianInput({ year: y, month: m, day: d });
        setDisplayDate(date); // Sync view
    };

    const changeDisplayMonth = (offset: number) => {
        const newDate = new Date(displayDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setDisplayDate(newDate);
    };

    const changeDisplayWeek = (offset: number) => {
        const newDate = new Date(displayDate);
        newDate.setDate(newDate.getDate() + (offset * 7));
        setDisplayDate(newDate);
    };

    const renderCalendarHeader = () => {
        const monthName = new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(displayDate);
        return (
            <div className="flex justify-between items-center mb-4 px-2">
                <button onClick={() => viewMode === 'month' ? changeDisplayMonth(-1) : changeDisplayWeek(-1)} className="p-1 hover:bg-slate-700 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <h3 className={`text-lg font-bold ${theme.primaryText}`}>
                    {monthName} {displayDate.getFullYear()}
                </h3>
                <button onClick={() => viewMode === 'month' ? changeDisplayMonth(1) : changeDisplayWeek(1)} className="p-1 hover:bg-slate-700 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        );
    };

    const renderMonthView = () => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Adjust for Sunday start (0)
        const startingSlot = firstDayOfMonth; 
        
        const days = [];
        for (let i = 0; i < startingSlot; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>);
        }
        
        for (let d = 1; d <= daysInMonth; d++) {
            const isSelected = 
                gregorianInput.year === year.toString() && 
                gregorianInput.month === (month + 1).toString() && 
                gregorianInput.day === d.toString();
            
            const isToday = 
                new Date().getDate() === d && 
                new Date().getMonth() === month && 
                new Date().getFullYear() === year;

            days.push(
                <button 
                    key={d} 
                    onClick={() => handleDateSelect(new Date(year, month, d))}
                    className={`h-10 w-10 mx-auto flex items-center justify-center rounded-full transition-all text-sm
                        ${isSelected ? `${theme.buttonBg} text-white font-bold shadow-md scale-110` : 'hover:bg-slate-700 text-slate-300'}
                        ${isToday && !isSelected ? 'border border-slate-500' : ''}
                    `}
                >
                    {d}
                </button>
            );
        }

        return (
            <div className="grid grid-cols-7 gap-1 mb-2 animate-fade-in">
                {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
                    <div key={day} className="text-center text-xs text-slate-500 font-medium py-2">{day}</div>
                ))}
                {days}
            </div>
        );
    };

    const renderWeekView = () => {
        // Logic to show the week containing the displayDate
        const startOfWeek = new Date(displayDate);
        const day = startOfWeek.getDay(); // 0 (Sun)
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff); // Set to Sunday of this week

        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const current = new Date(startOfWeek);
            current.setDate(startOfWeek.getDate() + i);
            
            const d = current.getDate();
            const m = current.getMonth();
            const y = current.getFullYear();

            const isSelected = 
                gregorianInput.year === y.toString() && 
                gregorianInput.month === (m + 1).toString() && 
                gregorianInput.day === d.toString();

            const dayName = new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(current);

            weekDays.push(
                <button 
                    key={i}
                    onClick={() => handleDateSelect(new Date(y, m, d))}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg flex-1 transition-all
                         ${isSelected ? `${theme.buttonBg} text-white shadow-md` : 'bg-slate-700/50 hover:bg-slate-700'}
                    `}
                >
                    <span className={`text-xs mb-1 ${isSelected ? 'text-white' : 'text-slate-400'}`}>{dayName}</span>
                    <span className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-200'}`}>{d}</span>
                </button>
            );
        }
        return (
            <div className="flex gap-2 justify-between mb-2 animate-fade-in">
                {weekDays}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg text-center">
                <h2 className={`text-lg font-semibold mb-2 ${theme.primaryText}`}>تاريخ اليوم</h2>
                <p className="text-slate-200 text-md">{todaysGregorian}</p>
                <p className="text-slate-300 text-md">
                    {hijriLoading ? 'جاري تحميل التاريخ الهجري...' : (todaysHijri && todaysHijri.weekdayName && todaysHijri.monthName) ? 
                    `${todaysHijri.weekdayName}, ${todaysHijri.day} ${todaysHijri.monthName} ${todaysHijri.year} هـ` 
                    : 'فشل تحميل التاريخ الهجري'}
                </p>
            </div>

            {/* Gregorian to Hijri */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
                <h3 className={`text-md font-semibold mb-3 text-center ${theme.primaryText}`}>التحويل من ميلادي إلى هجري</h3>
                
                {/* View Toggle */}
                <div className="flex justify-center bg-slate-900/50 p-1 rounded-lg mb-4 w-max mx-auto">
                    <button 
                        onClick={() => setViewMode('month')}
                        className={`px-4 py-1 rounded-md text-sm transition-colors ${viewMode === 'month' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        شهري
                    </button>
                    <button 
                        onClick={() => setViewMode('week')}
                        className={`px-4 py-1 rounded-md text-sm transition-colors ${viewMode === 'week' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        أسبوعي
                    </button>
                </div>

                {renderCalendarHeader()}
                
                <div className="bg-slate-900/30 rounded-lg p-2 mb-4">
                    {viewMode === 'month' ? renderMonthView() : renderWeekView()}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 opacity-70 hover:opacity-100 transition-opacity">
                    <div className="relative">
                        <label className="absolute -top-2 right-2 bg-slate-800 px-1 text-[10px] text-slate-400">يوم</label>
                        <input type="number" value={gregorianInput.day} onChange={e => setGregorianInput({...gregorianInput, day: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 text-center focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2 right-2 bg-slate-800 px-1 text-[10px] text-slate-400">شهر</label>
                        <input type="number" value={gregorianInput.month} onChange={e => setGregorianInput({...gregorianInput, month: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 text-center focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                    <div className="relative">
                        <label className="absolute -top-2 right-2 bg-slate-800 px-1 text-[10px] text-slate-400">سنة</label>
                        <input type="number" value={gregorianInput.year} onChange={e => setGregorianInput({...gregorianInput, year: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 text-center focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    </div>
                </div>

                <button onClick={handleG2HConvert} disabled={g2hLoading} className={`w-full mt-3 ${theme.buttonBg} ${theme.buttonHoverBg} text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600`}>تحويل</button>
                <ResultDisplay date={g2hResult} loading={g2hLoading} error={g2hError} theme={theme} />
            </div>

            {/* Hijri to Gregorian */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
                <h3 className={`text-md font-semibold mb-3 text-center ${theme.primaryText}`}>التحويل من هجري إلى ميلادي</h3>
                <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="يوم" value={hijriInput.day} onChange={e => setHijriInput({...hijriInput, day: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 text-center focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    <input type="number" placeholder="شهر" value={hijriInput.month} onChange={e => setHijriInput({...hijriInput, month: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 text-center focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                    <input type="number" placeholder="سنة" value={hijriInput.year} onChange={e => setHijriInput({...hijriInput, year: e.target.value})} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 text-center focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                </div>
                <button onClick={handleH2GConvert} disabled={h2gLoading} className={`w-full mt-3 ${theme.buttonBg} ${theme.buttonHoverBg} text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600`}>تحويل</button>
                 <ResultDisplay date={h2gResult} loading={h2gLoading} error={h2gError} theme={theme} />
            </div>
        </div>
    );
};

export default CalendarConverter;
