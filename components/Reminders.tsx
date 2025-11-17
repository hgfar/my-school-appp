import React, { useState, useEffect } from 'react';
import { Reminder, Theme } from '../types';
import { notificationOptions } from '../assets/notificationOptions';

interface RemindersProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  onToggleReminder: (id: number) => void;
  onDeleteReminder: (id: number) => void;
  theme: Theme;
}

const Reminders: React.FC<RemindersProps> = ({ reminders, onAddReminder, onToggleReminder, onDeleteReminder, theme }) => {
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDateTime, setNewReminderDateTime] = useState('');
  const [newReminderSound, setNewReminderSound] = useState(Object.keys(notificationOptions.sounds)[0]);
  const [newReminderVibration, setNewReminderVibration] = useState(Object.keys(notificationOptions.vibrationPatterns)[0]);
  const [showForm, setShowForm] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, []);

  const handleAddReminder = () => {
    if (newReminderText.trim() === '' || newReminderDateTime.trim() === '') return;

    onAddReminder({
      text: newReminderText,
      dateTime: newReminderDateTime,
      sound: newReminderSound,
      vibration: newReminderVibration,
    });
    
    setNewReminderText('');
    setNewReminderDateTime('');
    setShowForm(false);
  };
  
  const formatDate = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  const focusClasses = `focus:ring-2 ${theme.ring} focus:outline-none`;

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
          <input
            type="text"
            value={newReminderText}
            onChange={(e) => setNewReminderText(e.target.value)}
            placeholder="اكتب نص التذكير..."
            className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
          />
          <input
            type="datetime-local"
            value={newReminderDateTime}
            onChange={(e) => setNewReminderDateTime(e.target.value)}
            className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
                value={newReminderSound}
                onChange={(e) => setNewReminderSound(e.target.value)}
                className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
            >
                {Object.keys(notificationOptions.sounds).map(sound => <option key={sound} value={sound}>{sound}</option>)}
            </select>
            <select
                value={newReminderVibration}
                onChange={(e) => setNewReminderVibration(e.target.value)}
                className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
            >
                {Object.keys(notificationOptions.vibrationPatterns).map(pattern => <option key={pattern} value={pattern}>{pattern}</option>)}
            </select>
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
                <p className="font-semibold text-lg">{reminder.text}</p>
                <p className={`text-sm ${theme.primaryText}`}>{formatDate(reminder.dateTime)}</p>
              </div>
              <button
                onClick={() => onDeleteReminder(reminder.id)}
                className="text-red-500 hover:text-red-400 ml-4 p-2 rounded-full transition-colors"
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