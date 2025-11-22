
import React, { useState, useEffect } from 'react';
import type { Reminder, Theme } from '../types';
import { notificationOptions } from '../assets/notificationOptions';

interface RemindersProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'completed'> | Omit<Reminder, 'id' | 'completed'>[]) => void;
  onToggleReminder: (id: number) => void;
  onDeleteReminder: (id: number) => void;
  theme: Theme;
}

const Reminders: React.FC<RemindersProps> = ({ reminders, onAddReminder, onToggleReminder, onDeleteReminder, theme }) => {
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDateTime, setNewReminderDateTime] = useState('');
  const [newReminderSound, setNewReminderSound] = useState(Object.keys(notificationOptions.sounds)[0]);
  const [newReminderVibration, setNewReminderVibration] = useState(Object.keys(notificationOptions.vibrationPatterns)[0]);
  
  // Advanced Options State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  // Monthly Specific Options
  const [monthlyOption, setMonthlyOption] = useState<'specific_date' | 'relative'>('specific_date');
  const [monthDay, setMonthDay] = useState(1); // 1 - 31
  const [weekRank, setWeekRank] = useState(1); // 1 (First), 2 (Second), 3 (Third), 4 (Fourth), 5 (Last)
  const [weekDay, setWeekDay] = useState(0); // 0 (Sunday) - 6 (Saturday)

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, []);

  const handleAddReminder = () => {
    setFormError(null);
    if (newReminderText.trim() === '' || newReminderDateTime.trim() === '') {
        setFormError('الرجاء إدخال نص التذكير والوقت.');
        return;
    }

    const startDate = new Date(newReminderDateTime);

    if (isRecurring) {
        if (!recurrenceEndDate) {
            setFormError('الرجاء تحديد تاريخ انتهاء التكرار.');
            return;
        }

        const endDate = new Date(recurrenceEndDate);
        endDate.setHours(23, 59, 59, 999);

        if (endDate < startDate) {
            setFormError('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.');
            return;
        }

        const remindersToAdd: Omit<Reminder, 'id' | 'completed'>[] = [];
        let currentDate = new Date(startDate);
        const groupId = Date.now();

        let safetyCounter = 0;

        if (recurrenceType === 'monthly') {
            // Monthly Logic
            // Start iteration from the month of the start date
            let iteratorDate = new Date(startDate);
            
            // Reset to first of month to ease calculations, preserving time from input
            iteratorDate.setDate(1); 
            
            while (iteratorDate <= endDate && safetyCounter < 60) { // Limit to 5 years (60 months) for safety
                let targetDate = new Date(iteratorDate);
                const year = targetDate.getFullYear();
                const month = targetDate.getMonth();

                if (monthlyOption === 'specific_date') {
                    // e.g., The 15th of every month
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    // Clamp date (e.g. if 31st selected, Feb becomes 28th/29th)
                    const actualDay = Math.min(monthDay, daysInMonth);
                    targetDate.setDate(actualDay);
                } else {
                    // e.g., The 2nd Tuesday
                    // Find the first occurrence of the weekday in this month
                    let firstDayOfMonth = new Date(year, month, 1);
                    let dayOfWeek = firstDayOfMonth.getDay(); // 0-6
                    
                    // Calculate offset to get to the first target weekday
                    let diff = weekDay - dayOfWeek;
                    if (diff < 0) diff += 7;
                    
                    let firstOccurrence = 1 + diff;
                    
                    if (weekRank === 5) {
                        // "Last" occurrence logic
                        // Find dates: firstOccurrence, +7, +7, +7... until next month
                        let tempDay = firstOccurrence;
                        let lastValidDay = tempDay;
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        
                        while(tempDay + 7 <= daysInMonth) {
                            tempDay += 7;
                            lastValidDay = tempDay;
                        }
                        targetDate.setDate(lastValidDay);
                    } else {
                        // 1st, 2nd, 3rd, 4th
                        let targetDay = firstOccurrence + (weekRank - 1) * 7;
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        
                        // If the computed date (e.g. 5th Friday) is outside the month, skip this month
                        if (targetDay > daysInMonth) {
                            targetDate = new Date(0); // Invalid date to filter out later
                        } else {
                            targetDate.setDate(targetDay);
                        }
                    }
                }

                // Restore original time
                targetDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);

                // Only add if it's within the requested range (Start/End)
                // Note: startDate comparison ensures we don't add a "past" recurrence if the calculated date in the start month is earlier than the start time
                if (targetDate.getTime() > 0 && targetDate >= startDate && targetDate <= endDate) {
                    const y = targetDate.getFullYear();
                    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
                    const d = String(targetDate.getDate()).padStart(2, '0');
                    const h = String(targetDate.getHours()).padStart(2, '0');
                    const min = String(targetDate.getMinutes()).padStart(2, '0');
                    
                    remindersToAdd.push({
                        text: newReminderText,
                        dateTime: `${y}-${m}-${d}T${h}:${min}`,
                        sound: newReminderSound,
                        vibration: newReminderVibration,
                        groupId: groupId
                    });
                }

                // Move to next month
                iteratorDate.setMonth(iteratorDate.getMonth() + 1);
                safetyCounter++;
            }

        } else {
            // Daily / Weekly Logic
            while (currentDate <= endDate && safetyCounter < 365) {
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const hours = String(currentDate.getHours()).padStart(2, '0');
                const minutes = String(currentDate.getMinutes()).padStart(2, '0');
                const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
                remindersToAdd.push({
                    text: newReminderText,
                    dateTime: formattedDateTime,
                    sound: newReminderSound,
                    vibration: newReminderVibration,
                    groupId: groupId
                });
    
                if (recurrenceType === 'daily') {
                    currentDate.setDate(currentDate.getDate() + 1);
                } else if (recurrenceType === 'weekly') {
                    currentDate.setDate(currentDate.getDate() + 7);
                }
                safetyCounter++;
            }
        }

        onAddReminder(remindersToAdd);

    } else {
        // Single Reminder
        onAddReminder({
            text: newReminderText,
            dateTime: newReminderDateTime,
            sound: newReminderSound,
            vibration: newReminderVibration,
        });
    }
    
    // Reset form
    setNewReminderText('');
    setNewReminderDateTime('');
    setRecurrenceEndDate('');
    setIsRecurring(false);
    setShowForm(false);
    setFormError(null);
  };
  
  const formatDate = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  const focusClasses = `focus:ring-2 ${theme.ring} focus:outline-none`;

  const weekDays = [
      { val: 0, label: 'الأحد' }, { val: 1, label: 'الاثنين' }, { val: 2, label: 'الثلاثاء' },
      { val: 3, label: 'الأربعاء' }, { val: 4, label: 'الخميس' }, { val: 5, label: 'الجمعة' }, { val: 6, label: 'السبت' }
  ];

  const weekRanks = [
      { val: 1, label: 'الأول' }, { val: 2, label: 'الثاني' }, { val: 3, label: 'الثالث' }, { val: 4, label: 'الرابع' }, { val: 5, label: 'الأخير' }
  ];

  return (
    <div className="space-y-6">
       {permission === 'default' && (
         <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-3 rounded-lg text-center">
          <p>يرجى السماح بالإشعارات لتلقي التنبيهات.</p>
          <button onClick={() => Notification.requestPermission().then(setPermission)} className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded">
            السماح بالإشعارات
          </button>
        </div>
      )}
      {permission === 'denied' && (
         <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-center">
          <p>تم رفض إذن الإشعارات. لن تتمكن من تلقي التنبيهات. يرجى تمكينها من إعدادات المتصفح.</p>
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className={`w-full ${theme.buttonBg} ${theme.buttonHoverBg} text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg`}
      >
        {showForm ? 'إلغاء' : 'إضافة تذكير جديد'}
      </button>

      {showForm && (
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-4 animate-fade-in">
          {formError && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded text-sm">
                  {formError}
              </div>
          )}
          
          <input
            type="text"
            value={newReminderText}
            onChange={(e) => setNewReminderText(e.target.value)}
            placeholder="اكتب نص التذكير..."
            className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
          />
          
          <div className="space-y-2">
            <label className="text-slate-300 text-sm">وقت التذكير (أو بداية التكرار)</label>
            <input
                type="datetime-local"
                value={newReminderDateTime}
                onChange={(e) => setNewReminderDateTime(e.target.value)}
                className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs text-slate-400">نغمة التنبيه</label>
                <select
                    value={newReminderSound}
                    onChange={(e) => setNewReminderSound(e.target.value)}
                    className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
                >
                    {Object.keys(notificationOptions.sounds).map(sound => <option key={sound} value={sound}>{sound}</option>)}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs text-slate-400">الاهتزاز</label>
                <select
                    value={newReminderVibration}
                    onChange={(e) => setNewReminderVibration(e.target.value)}
                    className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
                >
                    {Object.keys(notificationOptions.vibrationPatterns).map(pattern => <option key={pattern} value={pattern}>{pattern}</option>)}
                </select>
            </div>
          </div>

          {/* Advanced Options / Recurrence */}
          <div className="border-t border-slate-700 pt-4 mt-2">
            <div className="flex items-center mb-3">
                <input 
                    type="checkbox" 
                    id="recurrenceToggle"
                    checked={isRecurring} 
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className={`w-5 h-5 rounded ${focusClasses} text-sky-600 bg-slate-700 border-slate-600 focus:ring-offset-slate-800`}
                />
                <label htmlFor="recurrenceToggle" className="mr-2 text-slate-300 select-none cursor-pointer">
                    خيارات متقدمة / تكرار
                </label>
            </div>

            {isRecurring && (
                <div className="bg-slate-700/50 p-3 rounded-md space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">تكرار كل</label>
                            <select
                                value={recurrenceType}
                                onChange={(e) => setRecurrenceType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                                className={`w-full bg-slate-700 p-2 rounded-md border border-slate-600 text-sm ${focusClasses}`}
                            >
                                <option value="daily">يومياً</option>
                                <option value="weekly">أسبوعياً</option>
                                <option value="monthly">شهرياً</option>
                            </select>
                        </div>

                        {/* Monthly Sub-options */}
                        {recurrenceType === 'monthly' && (
                            <div className="bg-slate-800/50 p-2 rounded border border-slate-600/50 space-y-2">
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="monthlyOption" 
                                            value="specific_date"
                                            checked={monthlyOption === 'specific_date'}
                                            onChange={() => setMonthlyOption('specific_date')}
                                            className="ml-2"
                                        />
                                        <span className="text-xs">تاريخ محدد</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="monthlyOption" 
                                            value="relative"
                                            checked={monthlyOption === 'relative'}
                                            onChange={() => setMonthlyOption('relative')}
                                            className="ml-2"
                                        />
                                        <span className="text-xs">يوم محدد (مثلاً: ثاني جمعة)</span>
                                    </label>
                                </div>

                                {monthlyOption === 'specific_date' ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">يوم</span>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="31"
                                            value={monthDay}
                                            onChange={(e) => setMonthDay(parseInt(e.target.value))}
                                            className="w-20 bg-slate-700 p-1 text-center rounded border border-slate-600 text-sm"
                                        />
                                        <span className="text-xs text-slate-400">من كل شهر</span>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <select 
                                            value={weekRank}
                                            onChange={(e) => setWeekRank(parseInt(e.target.value))}
                                            className="bg-slate-700 p-1 rounded border border-slate-600 text-sm flex-1"
                                        >
                                            {weekRanks.map(wr => <option key={wr.val} value={wr.val}>{wr.label}</option>)}
                                        </select>
                                        <select 
                                            value={weekDay}
                                            onChange={(e) => setWeekDay(parseInt(e.target.value))}
                                            className="bg-slate-700 p-1 rounded border border-slate-600 text-sm flex-1"
                                        >
                                            {weekDays.map(wd => <option key={wd.val} value={wd.val}>{wd.label}</option>)}
                                        </select>
                                        <span className="text-xs text-slate-400 flex items-center">من كل شهر</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-slate-400 mb-1">حتى تاريخ</label>
                            <input
                                type="date"
                                value={recurrenceEndDate}
                                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                className={`w-full bg-slate-700 p-2 rounded-md border border-slate-600 text-sm ${focusClasses}`}
                            />
                        </div>
                    </div>
                </div>
            )}
          </div>

          <button
            onClick={handleAddReminder}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
          >
            حفظ التذكير
          </button>
        </div>
      )}

      <div className="space-y-4">
        {reminders.length === 0 && !showForm && (
            <p className="text-center text-slate-400 mt-8">لا يوجد تذكيرات حالياً.</p>
        )}
        {reminders.map(reminder => (
          <div
            key={reminder.id}
            className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
              reminder.completed ? 'bg-slate-700/50 text-slate-500 line-through' : 'bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div onClick={() => onToggleReminder(reminder.id)} className="cursor-pointer flex-grow">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{reminder.text}</p>
                    {reminder.groupId && <span className="text-[10px] bg-slate-600 px-1.5 py-0.5 rounded text-slate-300">تكرار</span>}
                </div>
                <p className={`text-sm ${theme.primaryText}`}>{formatDate(reminder.dateTime)}</p>
              </div>
              <button
                onClick={() => onDeleteReminder(reminder.id)}
                className="text-red-500 hover:text-red-400 ml-4 p-2 rounded-full transition-colors"
                title="حذف"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reminders;
